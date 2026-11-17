import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Login } from './pages/Login';
import { ChangePassword } from './pages/ChangePassword';
import { Dashboard } from './pages/Dashboard';
import { Attendance } from './pages/Attendance';
import { Billing } from './pages/Billing';
import { Exams } from './pages/Exams';
import { Profile } from './pages/Profile';
import { Notifications } from './pages/Notifications';
import { ScreenHero } from './components/ScreenHero';
import { Bell, CalendarCheck, GraduationCap, RefreshCw, UserRound, Wallet, LucideIcon } from 'lucide-react';
import { Spinner } from './components/ui';
import { BottomNav, NavTab } from './components/BottomNav';
import { Student } from './types';
import { PushService, PUSH_EVENT } from './services/pushService';
import { ApiClient, ApiError, UNAUTHORIZED_EVENT } from './services/apiClient';
import { AuthService } from './services/authService';
import { NotificationService, ParentNotification } from './services/notificationService';

type Stage = 'loading' | 'login' | 'change-password' | 'app';

const NOTIFICATION_POLL_MS = 90_000;

const META: Record<Exclude<NavTab, 'dashboard'>, { title: string; subtitle: string; icon: LucideIcon }> = {
  attendance: { title: 'سجل الحضور', subtitle: 'مواعيد الحضور وموقف الواجب', icon: CalendarCheck },
  billing: { title: 'المالية', subtitle: 'الاشتراك والإيصالات', icon: Wallet },
  exams: { title: 'الدرجات', subtitle: 'الأداء والمستوى العلمي', icon: GraduationCap },
  profile: { title: 'حسابي', subtitle: 'بيانات الطالب وإعدادات الحساب', icon: UserRound },
  notifications: { title: 'الإشعارات', subtitle: 'آخر التنبيهات والرسائل', icon: Bell },
};

export const App: React.FC = () => {
  const [stage, setStage] = useState<Stage>(ApiClient.getToken() ? 'loading' : 'login');
  const [student, setStudent] = useState<Student | null>(null);
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [initialPassword, setInitialPassword] = useState('');
  const [voluntaryPasswordChange, setVoluntaryPasswordChange] = useState(false);

  const [notifications, setNotifications] = useState<ParentNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [seenBefore, setSeenBefore] = useState(0);
  const studentsRef = useRef<Student[]>([]);
  studentsRef.current = studentsList;

  const clearSession = useCallback(() => {
    ApiClient.setToken(null);
    ['parent_student_code', 'parent_student_data', 'parent_students_list'].forEach((k) => localStorage.removeItem(k));
    setStudent(null);
    setStudentsList([]);
    setNotifications([]);
    setInitialPassword('');
    setVoluntaryPasswordChange(false);
    setActiveTab('dashboard');
    setStage('login');
  }, []);

  const applySession = useCallback((primary: Student, children: Student[], preferredId?: Student['id']) => {
    const current = children.find((s) => s.id === preferredId) || primary;
    setStudent(current);
    setStudentsList(children);
    localStorage.setItem('parent_student_data', JSON.stringify(current));
    localStorage.setItem('parent_students_list', JSON.stringify(children));
    setStage('app');
    PushService.init();
  }, []);

  const loadNotifications = useCallback(async () => {
    const children = studentsRef.current;
    if (children.length === 0) return;
    setNotificationsLoading(true);
    try {
      setNotifications(await NotificationService.fetchAll(children));
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  /** Loads who this token belongs to, and routes to the forced password change when needed. */
  const loadSession = useCallback(
    async (preferredId?: Student['id']) => {
      const session = await AuthService.fetchSession();
      if (session.mustChangePassword) {
        setStage('change-password');
        return;
      }
      if (!session.student) {
        // A valid account whose students were all removed.
        clearSession();
        return;
      }
      applySession(session.student, session.students, preferredId);
    },
    [applySession, clearSession],
  );

  // Boot: the 180-day token survives app restarts, so a parent normally lands straight on the dashboard.
  useEffect(() => {
    const onUnauthorized = () => clearSession();
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);

    if (!ApiClient.getToken()) {
      clearSession();
      return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    }

    // Show the cached session at once, then refresh it from the server.
    let cachedId: Student['id'] | undefined;
    try {
      const savedData = localStorage.getItem('parent_student_data');
      const savedList = localStorage.getItem('parent_students_list');
      if (savedData && savedList) {
        const parsed: Student = JSON.parse(savedData);
        cachedId = parsed.id;
        setStudent(parsed);
        setStudentsList(JSON.parse(savedList));
        setStage('app');
      }
    } catch {}

    loadSession(cachedId).catch((err) => {
      // Offline / server hiccup: keep the cached view. A 401 already logs out through UNAUTHORIZED_EVENT.
      console.warn('[App] Failed to refresh session:', err);
      if (!(err instanceof ApiError) || err.status !== 401) {
        setStage((s) => (s === 'loading' ? 'login' : s));
      }
    });

    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [loadSession, clearSession]);

  // Inbox: load once the children are known, then keep it fresh (push, coming back to the app, slow poll).
  useEffect(() => {
    if (stage !== 'app') return;
    loadNotifications();

    const onPush = (e: Event) => {
      loadNotifications();
      if ((e as CustomEvent)?.detail?.opened) setActiveTab('notifications');
    };
    const onVisible = () => document.visibilityState === 'visible' && loadNotifications();
    const timer = window.setInterval(() => document.visibilityState === 'visible' && loadNotifications(), NOTIFICATION_POLL_MS);

    window.addEventListener(PUSH_EVENT, onPush);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener(PUSH_EVENT, onPush);
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(timer);
    };
  }, [stage, studentsList, loadNotifications]);

  // Remember what was unread when the inbox was opened, so those rows stay highlighted.
  useEffect(() => {
    if (activeTab === 'notifications') setSeenBefore(NotificationService.getLastSeenId());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const handleLogout = () => {
    AuthService.logout(PushService.getDeviceToken());
    clearSession();
  };

  const handleSwitchStudent = (next: Student) => {
    setStudent(next);
    localStorage.setItem('parent_student_data', JSON.stringify(next));
  };

  const handleLoggedIn = (mustChange: boolean, password: string) => {
    setInitialPassword(mustChange ? password : '');
    if (mustChange) {
      setStage('change-password');
    } else {
      setStage('loading');
      loadSession().catch(() => clearSession());
    }
  };

  const handlePasswordChanged = () => {
    setInitialPassword('');
    if (voluntaryPasswordChange) {
      setVoluntaryPasswordChange(false);
      setActiveTab('profile');
      return;
    }
    setStage('loading');
    loadSession().catch(() => clearSession());
  };

  if (stage === 'loading') {
    return (
      <div className="min-h-screen grid place-items-center bg-canvas" aria-busy="true">
        <Spinner />
      </div>
    );
  }

  if (stage === 'login') return <Login onLoggedIn={handleLoggedIn} />;

  if (stage === 'change-password') {
    return <ChangePassword forced initialPassword={initialPassword} onDone={handlePasswordChanged} onLogout={handleLogout} />;
  }

  if (!student) return <Login onLoggedIn={handleLoggedIn} />;

  if (voluntaryPasswordChange) {
    return <ChangePassword onDone={handlePasswordChanged} onCancel={() => setVoluntaryPasswordChange(false)} />;
  }

  const unreadCount = NotificationService.unreadCount(notifications);

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      {activeTab === 'dashboard' && (
        <Dashboard
          key={student.id}
          student={student}
          studentsList={studentsList}
          hasUnread={unreadCount > 0}
          onNavigateTab={setActiveTab}
          onSwitchStudent={handleSwitchStudent}
          onLogout={handleLogout}
        />
      )}

      {activeTab !== 'dashboard' && (
        <ScreenHero
          title={META[activeTab].title}
          subtitle={META[activeTab].subtitle}
          icon={META[activeTab].icon}
          student={student}
          studentsList={studentsList}
          onSwitchStudent={handleSwitchStudent}
          onLogout={handleLogout}
          {...(activeTab === 'notifications'
            ? {
                onBack: () => setActiveTab('dashboard'),
                action: (
                  <button
                    type="button"
                    onClick={loadNotifications}
                    aria-label="تحديث"
                    className="w-11 h-11 shrink-0 rounded-2xl bg-white/15 grid place-items-center"
                  >
                    <RefreshCw size={20} className={notificationsLoading ? 'animate-spin' : ''} aria-hidden />
                  </button>
                ),
              }
            : { onOpenNotifications: () => setActiveTab('notifications'), hasUnread: unreadCount > 0 })}
        />
      )}

      {activeTab !== 'dashboard' && (
        <main className="relative z-10 px-4 -mt-3 pb-32 max-w-md md:max-w-3xl lg:max-w-5xl mx-auto">
          {activeTab === 'attendance' && <Attendance key={student.id} student={student} />}
          {activeTab === 'billing' && <Billing key={student.id} student={student} />}
          {activeTab === 'exams' && <Exams key={student.id} student={student} />}
          {activeTab === 'notifications' && (
            <Notifications students={studentsList} notifications={notifications} loading={notificationsLoading} seenBefore={seenBefore} />
          )}
          {activeTab === 'profile' && (
            <Profile student={student} onLogout={handleLogout} onChangePassword={() => setVoluntaryPasswordChange(true)} />
          )}
        </main>
      )}

      <BottomNav activeTab={activeTab === 'notifications' ? 'dashboard' : activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
