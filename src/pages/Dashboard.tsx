import React, { useState, useEffect } from 'react';
import { BarChart3, Bell, CalendarCheck, CalendarX2, Check, ChevronLeft, GraduationCap, Megaphone, MessageCircle, UserRound, Wallet } from 'lucide-react';
import { Student } from '../types';
import { NavTab } from '../components/BottomNav';
import { ApiClient } from '../services/apiClient';
import { AccountSheet } from '../components/AccountSheet';
import { centerPhoneOf, teacherTitle } from '../lib/teachers';
import { CapArt } from '../components/CapArt';
import { Card, IconTile, MetricCard, StatusPill } from '../components/ui';

interface DashboardProps {
  student: Student;
  studentsList: Student[];
  hasUnread: boolean;
  onNavigateTab: (tab: NavTab) => void;
  onSwitchStudent: (student: Student) => void;
  onLogout: () => void;
}

const levelOf = (avg: number) => (avg >= 90 ? 'ممتاز' : avg >= 75 ? 'جيد جداً' : avg >= 50 ? 'مقبول' : 'يحتاج دعم');

/** "الصف الأول - السبت والثلاثاء - 06:00 م" -> grade + schedule. */
const splitGroup = (name?: string) => {
  const parts = (name || '').split(' - ').map((p) => p.trim()).filter(Boolean);
  return { grade: parts[0] || 'المجموعة الدراسية', schedule: parts.slice(1).join('  |  ') };
};

export const Dashboard: React.FC<DashboardProps> = ({ student: initialStudent, studentsList, hasUnread, onNavigateTab, onSwitchStudent, onLogout }) => {
  const [student, setStudent] = useState<Student>(initialStudent);
  const [notice, setNotice] = useState<{ title: string; body: string; created_at?: string } | null>(null);
  const [account, setAccount] = useState(false);

  useEffect(() => {
    setStudent(initialStudent);
    if (initialStudent?.id) {
      ApiClient.get<any>(`/parent/student/${initialStudent.id}/dashboard`)
        .then((res) => {
          if (res?.student) setStudent(res.student);
          if (res?.notice) setNotice(res.notice);
        })
        .catch((err) => console.warn('[Dashboard] Failed to fetch live dashboard:', err));
    }
  }, [initialStudent]);

  const attended = student.attended_count ?? 0;
  const absent = student.absent_count ?? 0;
  const perCycle = student.group?.sessions_per_cycle || 8;
  const rate = student.attendance_rate ?? 0;
  const remaining = student.remaining_amount ?? 0;
  const average = student.exam_average ?? 0;
  const monthly = student.subscription_type === 'monthly';
  const { grade, schedule } = splitGroup(student.group?.name);

  const whatsapp = centerPhoneOf(student);
  const teacher = teacherTitle(student);
  const openWhatsappContact = () => whatsapp && window.open(`https://wa.me/${whatsapp}`, '_blank');

  return (
    <div>
      {/* ── Hero ── */}
      <header
        className="relative overflow-hidden text-white"
        style={{ background: 'linear-gradient(165deg,#1E6554 0%,#16423C 55%,#0D2E2A 100%)', paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}
      >
        <div aria-hidden className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-white/[0.06]" />
        <div aria-hidden className="absolute top-10 -left-24 w-72 h-72 rounded-full bg-white/[0.05]" />

        <div className="relative max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-4 pt-3 pb-16">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAccount(true)}
              aria-label="الحساب وتبديل الأبناء"
              className="w-14 h-14 shrink-0 rounded-full border-2 border-white/80 grid place-items-center text-title text-white bg-white/10"
            >
              {(student.name?.trim()[0] || 'ط').toUpperCase()}
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-meta text-white/80">مرحباً بك 👋</p>
              <h1 className="text-display truncate">{student.name}</h1>
              <p className="text-meta text-white/80 truncate">{grade}</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('notifications')}
              aria-label={hasUnread ? 'الإشعارات (يوجد جديد)' : 'الإشعارات'}
              className="relative w-12 h-12 shrink-0 rounded-2xl bg-white/15 grid place-items-center"
            >
              <Bell size={22} aria-hidden />
              {hasUnread && <span className="absolute top-2.5 left-3 w-2.5 h-2.5 rounded-full bg-danger ring-2 ring-brand" />}
            </button>
          </div>

          <div className="mt-5 flex flex-col items-start gap-2 max-w-[68%]">
            {teacher && (
              <span className="inline-flex items-center gap-2 h-9 px-3 rounded-2xl bg-white/12 border border-white/15 text-meta font-semibold max-w-full">
                <UserRound size={16} className="shrink-0" aria-hidden />
                <span className="truncate">
                  {teacher}
                  {student.teacher_subject ? ` · ${student.teacher_subject}` : ''}
                </span>
              </span>
            )}
            {schedule && (
              <span className="inline-flex items-center gap-2 h-9 px-3 rounded-2xl bg-white/12 border border-white/15 text-meta font-semibold max-w-full">
                <CalendarCheck size={16} className="shrink-0" aria-hidden />
                <span className="truncate">{schedule}</span>
              </span>
            )}
          </div>

          <CapArt palette="green" className="absolute left-2 bottom-8 w-40 md:w-52 h-auto pointer-events-none drop-shadow-lg" />
        </div>

        <svg viewBox="0 0 400 40" preserveAspectRatio="none" className="absolute bottom-0 inset-x-0 w-full h-8 text-canvas" aria-hidden>
          <path d="M0 22 C70 0 140 6 210 22 S340 40 400 14 V40 H0 Z" fill="currentColor" />
        </svg>
      </header>

      <AccountSheet open={account} onClose={() => setAccount(false)} student={student} studentsList={studentsList} onSwitchStudent={onSwitchStudent} onLogout={onLogout} />

      {/* ── Cards ── */}
      <div className="relative z-10 max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-4 -mt-3 pb-32 space-y-3 md:space-y-4">
        {notice && (
          <Card className="p-4 flex gap-3 bg-gold-soft border-transparent">
            <IconTile icon={Megaphone} tone="warning" />
            <div className="space-y-1 min-w-0">
              <h3 className="text-body font-semibold">{notice.title}</h3>
              <p className="text-meta text-ink-2">{notice.body}</p>
            </div>
          </Card>
        )}

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4" aria-label="مؤشرات الطالب">
          <MetricCard
            className="md:col-span-2"
            icon={CalendarCheck}
            label="الحضور"
            tone="brand"
            value={attended}
            unit={`من ${perCycle}`}
            meter={
              <span
                className="grid gap-1.5"
                style={{ gridTemplateColumns: `repeat(${perCycle}, minmax(0, 1fr))` }}
                role="img"
                aria-label={`حضر ${attended} من ${perCycle} حصص`}
              >
                {Array.from({ length: perCycle }).map((_, i) => (
                  <span key={i} className={`h-1.5 rounded-full ${i < attended ? 'bg-success' : 'bg-success/15'}`} />
                ))}
              </span>
            }
            pill={
              <StatusPill tone={rate >= 75 ? 'success' : rate >= 50 ? 'warning' : 'danger'} icon={Check}>
                نسبة الحضور <span dir="ltr">{rate}%</span>
              </StatusPill>
            }
            onClick={() => onNavigateTab('attendance')}
          />
          <MetricCard
            className="md:col-span-2"
            icon={CalendarX2}
            label="الغياب"
            tone="danger"
            value={absent}
            unit={absent === 1 ? 'حصة' : 'حصص'}
            pill={
              absent > 0 ? (
                <StatusPill tone="danger" icon={ChevronLeft}>
                  عرض التفاصيل
                </StatusPill>
              ) : (
                <StatusPill tone="success" icon={Check}>
                  لا يوجد غياب
                </StatusPill>
              )
            }
            onClick={() => onNavigateTab('attendance')}
          />
          <MetricCard
            className="col-span-2"
            icon={Wallet}
            label="المتبقي للدفع"
            tone="warning"
            value={remaining > 0 ? remaining : 0}
            unit="ج.م"
            pill={
              remaining > 0 ? (
                <StatusPill tone="warning" icon={ChevronLeft}>
                  {monthly ? 'اشتراك شهري' : 'اشتراك بالحصة'} · عرض الإيصالات
                </StatusPill>
              ) : (
                <StatusPill tone="success" icon={Check}>
                  الحساب مسدد
                </StatusPill>
              )
            }
            onClick={() => onNavigateTab('billing')}
          />
          <MetricCard
            className="col-span-2"
            icon={GraduationCap}
            label="متوسط الدرجات"
            tone="info"
            value={average}
            unit="%"
            art={<CapArt palette="blue" className="w-full h-auto drop-shadow-md" />}
            pill={
              <StatusPill tone={average >= 75 ? 'success' : average >= 50 ? 'info' : 'warning'} icon={BarChart3}>
                {levelOf(average)}
              </StatusPill>
            }
            onClick={() => onNavigateTab('exams')}
          />
        </section>

        {whatsapp && (
        <button
          type="button"
          onClick={openWhatsappContact}
          className="w-full flex items-center gap-4 p-4 rounded-card bg-gradient-to-br from-white to-success-soft border border-white/80 shadow-card text-right active:scale-[0.99] transition-transform"
        >
          <span className="w-14 h-14 shrink-0 grid place-items-center rounded-full bg-[#25D366] text-white">
            <MessageCircle size={28} strokeWidth={1.75} aria-hidden />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-title">{teacher ? `تواصل مع ${teacher}` : 'تواصل مع إدارة السنتر'}</span>
            <span className="block text-meta text-ink-2">عبر واتساب مباشرة</span>
          </span>
          <ChevronLeft size={20} className="text-ink-3" aria-hidden />
        </button>
        )}
      </div>
    </div>
  );
};
