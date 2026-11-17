import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { StatCard } from '../components/StatCard';
import { NavTab } from '../components/BottomNav';
import { ApiClient } from '../services/apiClient';

interface DashboardProps {
  student: Student;
  onNavigateTab: (tab: NavTab) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ student: initialStudent, onNavigateTab }) => {
  const [student, setStudent] = useState<Student>(initialStudent);
  const [notice, setNotice] = useState<{ title: string; body: string; created_at?: string } | null>(null);

  useEffect(() => {
    setStudent(initialStudent);
    if (initialStudent?.id) {
      ApiClient.get<any>(`/parent/student/${initialStudent.id}/dashboard`)
        .then((res) => {
          if (res?.student) {
            setStudent(res.student);
          }
          if (res?.notice) {
            setNotice(res.notice);
          }
        })
        .catch((err) => {
          console.warn('[Dashboard] Failed to fetch live dashboard:', err);
        });
    }
  }, [initialStudent]);

  const group = student.group;
  const sessionsCount = student.attended_count ?? 0;
  const sessionsPerCycle = group?.sessions_per_cycle || 8;

  const openWhatsappContact = () => {
    const centerPhone = student.center_phone || student.group?.center_phone || '01000000000';
    const normalized = centerPhone.replace(/[^0-9]/g, '');
    const formatted = normalized.startsWith('0') ? `20${normalized.slice(1)}` : normalized;
    window.open(`https://wa.me/${formatted}`, '_blank');
  };

  return (
    <div className="space-y-4 pb-28 font-['Cairo'] selection:bg-emerald-700 selection:text-white">
      {/* ── Student Main Banner Card (Enterprise Educational Brand Card) ── */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#065F46] via-[#033B2B] to-[#012017] p-6 text-white shadow-2xl shadow-emerald-950/30 border border-emerald-500/30">
        {/* Metallic Shimmer & Ambient Radial Glows */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Row of Hero Card */}
        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-2 max-w-[65%] text-right pt-1">
            <h2 className="text-3xl font-black tracking-tight text-white leading-tight drop-shadow-md">
              {student.name}
            </h2>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-200 text-xs font-black backdrop-blur-md shadow-xs">
              <i className="fa-solid fa-graduation-cap text-emerald-400 text-xs" />
              <span>{group?.name || 'المجموعة الدراسية'}</span>
            </div>
          </div>

          {/* Graduation Cap Vector SVG Icon on Top Left */}
          <div className="w-32 h-32 absolute -top-4 left-0 pointer-events-none drop-shadow-[0_15px_15px_rgba(0,0,0,0.4)] flex items-center justify-center">
            <img
              src="/icons/graduation-cap.svg"
              alt="Graduation Cap & Books"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Enterprise 8-Session Progress Segmented Meter */}
        <div className="mt-5 bg-[#002720]/90 backdrop-blur-xl rounded-2xl p-4 border border-[#09735d]/60 space-y-3 relative z-10 shadow-inner">
          <div className="flex justify-between items-center text-xs">
            <span className="font-black text-white text-xs flex items-center gap-2">
              <i className="fa-solid fa-square-poll-vertical text-emerald-400 text-sm" />
              تقدم متابعة الشهر الحالي
            </span>
            <span className="font-black text-emerald-300 bg-[#059669]/30 border border-emerald-400/30 px-3 py-0.5 rounded-lg text-xs dir-ltr">
              {sessionsCount} / {sessionsPerCycle} حصص
            </span>
          </div>

          {/* Segmented 8-Pill Meter Track */}
          <div className="grid grid-cols-8 gap-1.5 pt-1">
            {Array.from({ length: sessionsPerCycle }).map((_, index) => {
              const isCompleted = index < sessionsCount;
              return (
                <div
                  key={index}
                  className={`h-3 rounded-md transition-all duration-300 border ${
                    isCompleted
                      ? 'bg-gradient-to-t from-emerald-500 to-teal-300 border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                      : 'bg-[#001713] border-emerald-900/60'
                  }`}
                  title={`الحصة ${index + 1}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Center Announcement Banner ── */}
      {notice && (
        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
          {/* Megaphone Vector SVG Icon on Left */}
          <div className="w-12 h-12 shrink-0 flex items-center justify-center relative">
            <img
              src="/icons/megaphone.svg"
              alt="Megaphone Notice"
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </div>

          {/* Notice Content */}
          <div className="flex-1 space-y-0.5 text-right">
            <h4 className="text-xs font-black text-slate-900 flex items-center justify-start gap-1">
              <i className="fa-solid fa-star text-amber-500 text-[10px]" />
              {notice.title}
            </h4>
            <p className="text-[11px] font-bold text-slate-600 leading-snug">
              {notice.body}
            </p>
          </div>

          {/* Megaphone Amber Icon Badge */}
          <div className="w-10 h-10 rounded-2xl bg-amber-100/90 border border-amber-200/80 text-amber-700 flex items-center justify-center text-base shrink-0 shadow-xs">
            <i className="fa-solid fa-bullhorn" />
          </div>
        </div>
      )}

      {/* ── Quick Stats Grid (2x2) ── */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="الحصص الحاضرة"
          value={`${student.attended_count ?? 0} حصص`}
          subtitle={`نسبة الحضور ${student.attendance_rate ?? 0}%`}
          icon="fa-check"
          color="emerald"
          onClick={() => onNavigateTab('attendance')}
        />
        <StatCard
          title="الحصص الغائبة"
          value={`${student.absent_count ?? 0} حصة`}
          subtitle="سجل متابعة الحضور"
          icon="fa-xmark"
          color="rose"
          onClick={() => onNavigateTab('attendance')}
        />
        <StatCard
          title="حالة الاشتراك"
          value={student.subscription_type === 'monthly' ? 'اشتراك شهري' : 'اشتراك بالحصة'}
          subtitle={student.remaining_amount ? `متبقي: ${student.remaining_amount} ج.م` : 'الحساب خالص'}
          icon="fa-wallet"
          color="amber"
          onClick={() => onNavigateTab('billing')}
        />
        <StatCard
          title="متوسط الاختبارات"
          value={`${student.exam_average ?? 0}%`}
          subtitle="مستوى التقييم"
          icon="fa-star"
          color="blue"
          onClick={() => onNavigateTab('exams')}
        />
      </div>

      {/* ── Quick Portal Shortcuts Card ── */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4 shadow-xs">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <i className="fa-solid fa-bolt text-[#059669]" />
          اختصارات البوابة السريعة
        </h3>

        {/* Horizontal Row of 3 Action Buttons */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => onNavigateTab('attendance')}
            className="p-3 rounded-2xl bg-white border border-slate-100 text-center hover:bg-slate-50 transition-all flex flex-col items-center justify-center space-y-2 active:scale-95 shadow-xs cursor-pointer"
          >
            <i className="fa-regular fa-calendar-days text-[#059669] text-2xl" />
            <span className="text-xs font-black text-slate-800">الحضور</span>
          </button>

          <button
            onClick={() => onNavigateTab('billing')}
            className="p-3 rounded-2xl bg-white border border-slate-100 text-center hover:bg-slate-50 transition-all flex flex-col items-center justify-center space-y-2 active:scale-95 shadow-xs cursor-pointer"
          >
            <i className="fa-solid fa-receipt text-[#d97706] text-2xl" />
            <span className="text-xs font-black text-slate-800">المالية</span>
          </button>

          <button
            onClick={() => onNavigateTab('exams')}
            className="p-3 rounded-2xl bg-white border border-slate-100 text-center hover:bg-slate-50 transition-all flex flex-col items-center justify-center space-y-2 active:scale-95 shadow-xs cursor-pointer"
          >
            <i className="fa-solid fa-graduation-cap text-[#4f46e5] text-2xl" />
            <span className="text-xs font-black text-slate-800">الدرجات</span>
          </button>
        </div>

        {/* WhatsApp Direct Contact Button */}
        <button
          onClick={openWhatsappContact}
          className="w-full p-3.5 rounded-2xl bg-[#e8f6f0] border border-[#b2e2d0] text-[#065A4B] font-black flex items-center justify-between hover:bg-[#dff0e8] transition-all shadow-xs active:scale-98 cursor-pointer mt-3"
        >
          <div className="flex flex-col items-start text-right space-y-0.5">
            <span className="text-xs font-black text-[#065A4B]">
              تواصل مباشرة مع إدارة السنتر عبر واتساب
            </span>
            <span className="text-[11px] font-bold text-[#0a6c57]">
              نحن هنا لخدمتكم دائماً
            </span>
          </div>

          <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center text-xl shrink-0 shadow-sm">
            <i className="fa-brands fa-whatsapp" />
          </div>
        </button>
      </div>
    </div>
  );
};
