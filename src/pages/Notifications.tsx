import React, { useEffect, useMemo, useState } from 'react';
import { Bell, BellOff, ClipboardList, GraduationCap, Megaphone, Receipt, Wallet, CheckCircle2, AlertTriangle, LucideIcon } from 'lucide-react';
import { ParentNotification, NotificationService } from '../services/notificationService';
import { Student } from '../types';
import { countTeachers, teacherTitle } from '../lib/teachers';
import { Chip, ChipRow, EmptyState, IconTile, Tone } from '../components/ui';

interface NotificationsProps {
  students: Student[];
  notifications: ParentNotification[];
  loading: boolean;
  /** Last-seen id captured when the screen opened, so new items can be highlighted. */
  seenBefore: number;
}

const TYPE_STYLE: Record<string, { icon: LucideIcon; tone: Tone; label: string }> = {
  attendance: { icon: CheckCircle2, tone: 'success', label: 'حضور' },
  daily_report: { icon: ClipboardList, tone: 'success', label: 'تقرير يومي' },
  absence: { icon: AlertTriangle, tone: 'danger', label: 'غياب' },
  exam: { icon: GraduationCap, tone: 'info', label: 'درجات' },
  sheet: { icon: GraduationCap, tone: 'info', label: 'شيت' },
  payment: { icon: Receipt, tone: 'success', label: 'دفعة' },
  payment_reminder: { icon: Wallet, tone: 'warning', label: 'تذكير دفع' },
  announcement: { icon: Megaphone, tone: 'neutral', label: 'رسالة من المعلم' },
  custom: { icon: Megaphone, tone: 'neutral', label: 'رسالة من المعلم' },
};
const FALLBACK = { icon: Bell, tone: 'neutral' as Tone, label: 'إشعار' };

const timeAgo = (iso: string): string => {
  const then = new Date(iso.includes('T') ? iso : iso.replace(' ', 'T') + 'Z').getTime();
  if (Number.isNaN(then)) return '';
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (mins < 1) return 'الآن';
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.round(hours / 24);
  if (days < 30) return `منذ ${days} يوم`;
  return new Date(then).toLocaleDateString('ar-EG');
};

export const Notifications: React.FC<NotificationsProps> = ({ students, notifications, loading, seenBefore }) => {
  const [filter, setFilter] = useState<'all' | string>('all');

  // Opening the screen marks everything as read.
  useEffect(() => {
    NotificationService.markAllSeen(notifications);
  }, [notifications]);

  // Chip text: first name; full name if two children share a first name; add the teacher if they even share the full name
  // (the same child enrolled with two teachers shows up as two records).
  const chipLabel = useMemo(() => {
    const count = (pick: (s: Student) => string, v: string) => students.filter((s) => pick(s) === v).length;
    return (s: Student) => {
      const first = s.name.split(' ')[0];
      if (count((x) => x.name.split(' ')[0], first) <= 1) return first;
      if (count((x) => x.name, s.name) <= 1) return s.name;
      return [s.name, teacherTitle(s)].filter(Boolean).join(' · ');
    };
  }, [students]);

  const nameById = useMemo(() => new Map(students.map((s) => [String(s.id), s.name])), [students]);
  const teacherByTenant = useMemo(
    () => new Map(students.filter((s) => s.tenant_id != null).map((s) => [String(s.tenant_id), teacherTitle(s)])),
    [students],
  );
  const multiTeacher = countTeachers(students) > 1;

  // A broadcast (no student_id) belongs to the teacher who sent it, so it only shows under that teacher's children.
  const visible =
    filter === 'all'
      ? notifications
      : (() => {
          const tenant = students.find((s) => String(s.id) === filter)?.tenant_id;
          return notifications.filter(
            (n) =>
              String(n.student_id ?? '') === filter ||
              (n.student_id == null && (n.tenant_id == null || tenant == null || String(n.tenant_id) === String(tenant))),
          );
        })();

  return (
    <div className="space-y-5">
      {students.length > 1 && (
        <ChipRow>
          {[{ id: 'all', name: 'الكل' }, ...students.map((s) => ({ id: String(s.id), name: chipLabel(s) }))].map((c) => (
            <Chip key={c.id} selected={filter === c.id} onClick={() => setFilter(c.id)}>
              {c.name}
            </Chip>
          ))}
        </ChipRow>
      )}

      {loading && notifications.length === 0 ? (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 rounded-card bg-sunken animate-pulse" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState icon={BellOff} title="لا توجد إشعارات حتى الآن" hint="ستظهر هنا تنبيهات الحضور والغياب والدرجات والمدفوعات ورسائل المعلم" />
      ) : (
        <ul className="space-y-3">
          {visible.map((n) => {
            const style = TYPE_STYLE[n.type] ?? FALLBACK;
            const isNew = n.id > seenBefore;
            const child = n.student_id != null && students.length > 1 ? nameById.get(String(n.student_id)) : null;
            const teacher = multiTeacher && n.tenant_id != null ? teacherByTenant.get(String(n.tenant_id)) : null;
            return (
              <li key={n.id} className="relative flex gap-3 p-4 bg-surface border border-line/70 rounded-card shadow-card">
                <IconTile icon={style.icon} tone={style.tone} />
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="text-body font-semibold">{n.title}</h3>
                  <p className="text-meta text-ink-2">{n.body}</p>
                  <p className="text-caption text-ink-3">
                    {[style.label, teacher, child, timeAgo(n.created_at)].filter(Boolean).join(' · ')}
                  </p>
                </div>
                {isNew && <span className="absolute top-4 left-4 w-2.5 h-2.5 rounded-full bg-danger" aria-label="جديد" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
