import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Login } from './pages/Login';
import { ChangePassword } from './pages/ChangePassword';
import { Dashboard } from './pages/Dashboard';
import { Attendance } from './pages/Attendance';
import { Billing } from './pages/Billing';
import { Exams } from './pages/Exams';
import { Profile } from './pages/Profile';
import { Notifications } from './pages/Notifications';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { Student } from './types';
import { PushService, PUSH_EVENT } from './services/pushService';
import { ApiClient, ApiError, UNAUTHORIZED_EVENT } from './services/apiClient';
import { AuthService } from './services/authService';
import { NotificationService, ParentNotification } from './services/notificationService';

type Stage = 'loading' | 'login' | 'change-password' | 'app';

const NOTIFICATION_POLL_MS = 90_000;

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
      <div className="min-h-screen flex items-center justify-center bg-white" aria-busy="true">
        <i className="fa-solid fa-circle-notch animate-spin text-2xl text-emerald-700" />
      </div>
    );
  }

  if (stage === 'login') return <Login onLoggedIn={handleLoggedIn} />;

  if (stage === 'change-password') {
    return <ChangePassword forced initialPassword={initialPassword} onDone={handlePasswordChanged} onLogout={handleLogout} />;
  }

  if (!student) return <Login onLoggedIn={handleLoggedIn} />;

  if (voluntaryPasswordChange) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 pt-10">
        <ChangePassword onDone={handlePasswordChanged} onCancel={() => setVoluntaryPasswordChange(false)} />
      </div>
    );
  }

  const unreadCount = NotificationService.unreadCount(notifications);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-['Cairo'] relative selection:bg-emerald-700 selection:text-white antialiased">
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-teal-500/5 rounded-full blur-[140px] pointer-events-none" />

      <Header
        student={student}
        studentsList={studentsList}
        activeTab={activeTab}
        onNavigateTab={setActiveTab}
        onSwitchStudent={handleSwitchStudent}
        onLogout={handleLogout}
        unreadCount={activeTab === 'notifications' ? 0 : unreadCount}
      />

      <main className="p-4 max-w-md mx-auto relative z-10">
        {activeTab === 'dashboard' && <Dashboard student={student} onNavigateTab={setActiveTab} />}
        {activeTab === 'attendance' && <Attendance student={student} onNavigateHome={() => setActiveTab('dashboard')} />}
        {activeTab === 'billing' && <Billing student={student} onNavigateHome={() => setActiveTab('dashboard')} />}
        {activeTab === 'exams' && <Exams student={student} onNavigateHome={() => setActiveTab('dashboard')} />}
        {activeTab === 'notifications' && (
          <Notifications
            students={studentsList}
            notifications={notifications}
            loading={notificationsLoading}
            seenBefore={seenBefore}
            onRefresh={loadNotifications}
            onNavigateHome={() => setActiveTab('dashboard')}
          />
        )}
        {activeTab === 'profile' && (
          <Profile
            student={student}
            onLogout={handleLogout}
            onNavigateHome={() => setActiveTab('dashboard')}
            onChangePassword={() => setVoluntaryPasswordChange(true)}
          />
        )}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
