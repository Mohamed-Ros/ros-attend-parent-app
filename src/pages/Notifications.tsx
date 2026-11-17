import React, { useEffect, useMemo, useState } from 'react';
import { ParentNotification, NotificationService } from '../services/notificationService';
import { Student } from '../types';

interface NotificationsProps {
  students: Student[];
  notifications: ParentNotification[];
  loading: boolean;
  /** Last-seen id captured when the screen opened, so new items can be highlighted. */
  seenBefore: number;
  onRefresh: () => void;
  onNavigateHome: () => void;
}

const TYPE_STYLE: Record<string, { icon: string; box: string; text: string; label: string }> = {
  attendance: { icon: 'fa-circle-check', box: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', label: 'حضور' },
  daily_report: { icon: 'fa-clipboard-list', box: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', label: 'تقرير يومي' },
  absence: { icon: 'fa-triangle-exclamation', box: 'bg-rose-50 border-rose-200', text: 'text-rose-800', label: 'غياب' },
  exam: { icon: 'fa-graduation-cap', box: 'bg-sky-50 border-sky-200', text: 'text-sky-800', label: 'درجات' },
  sheet: { icon: 'fa-graduation-cap', box: 'bg-sky-50 border-sky-200', text: 'text-sky-800', label: 'شيت' },
  payment: { icon: 'fa-receipt', box: 'bg-teal-50 border-teal-200', text: 'text-teal-800', label: 'دفعة' },
  payment_reminder: { icon: 'fa-wallet', box: 'bg-amber-50 border-amber-200', text: 'text-amber-800', label: 'تذكير دفع' },
  announcement: { icon: 'fa-bullhorn', box: 'bg-violet-50 border-violet-200', text: 'text-violet-800', label: 'رسالة من المعلم' },
  custom: { icon: 'fa-bullhorn', box: 'bg-violet-50 border-violet-200', text: 'text-violet-800', label: 'رسالة من المعلم' },
};
const FALLBACK = { icon: 'fa-bell', box: 'bg-slate-50 border-slate-200', text: 'text-slate-800', label: 'إشعار' };

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

export const Notifications: React.FC<NotificationsProps> = ({ students, notifications, loading, seenBefore, onRefresh, onNavigateHome }) => {
  const [filter, setFilter] = useState<'all' | string>('all');

  // Opening the screen marks everything as read.
  useEffect(() => {
    NotificationService.markAllSeen(notifications);
  }, [notifications]);

  const nameById = useMemo(() => new Map(students.map((s) => [String(s.id), s.name])), [students]);
  const visible = filter === 'all' ? notifications : notifications.filter((n) => String(n.student_id ?? '') === filter || n.student_id == null);

  return (
    <div className="space-y-4 pb-28 font-['Cairo']">
      <div className="flex items-center justify-between">
        <button onClick={onNavigateHome} className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900">
          <i className="fa-solid fa-arrow-right text-[11px]" /> رجوع
        </button>
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <i className="fa-regular fa-bell text-emerald-700" /> الإشعارات
        </h2>
        <button onClick={onRefresh} aria-label="تحديث" className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 active:scale-95">
          <i className={`fa-solid fa-rotate text-xs ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {students.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {[{ id: 'all', name: 'الكل' }, ...students.map((s) => ({ id: String(s.id), name: s.name.split(' ')[0] }))].map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                filter === c.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {loading && notifications.length === 0 ? (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 text-slate-400 space-y-2">
          <i className="fa-regular fa-bell-slash text-4xl" />
          <p className="text-sm font-bold">لا توجد إشعارات حتى الآن</p>
          <p className="text-[11px]">ستظهر هنا تنبيهات الحضور والغياب والدرجات والمدفوعات ورسائل المعلم</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((n) => {
            const style = TYPE_STYLE[n.type] ?? FALLBACK;
            const isNew = n.id > seenBefore;
            const child = n.student_id != null && students.length > 1 ? nameById.get(String(n.student_id)) : null;
            return (
              <li key={n.id} className={`relative p-3.5 rounded-2xl border ${style.box}`}>
                {isNew && <span className="absolute top-3 left-3 w-2 h-2 rounded-full bg-rose-500" aria-label="جديد" />}
                <h5 className={`font-black text-sm mb-1 flex items-center gap-1.5 ${style.text}`}>
                  <i className={`fa-solid ${style.icon} text-xs`} /> {n.title}
                </h5>
                <p className={`text-xs leading-relaxed ${style.text} opacity-90`}>{n.body}</p>
                <div className="flex items-center justify-between mt-2 text-[10px] font-bold text-slate-500">
                  <span>{style.label}{child ? ` • ${child}` : ''}</span>
                  <span>{timeAgo(n.created_at)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
