import React from 'react';
import { Student } from '../types';
import { NavTab } from './BottomNav';
import Swal from 'sweetalert2';

interface HeaderProps {
  student?: Student | null;
  studentsList?: Student[];
  activeTab?: NavTab;
  onNavigateTab?: (tab: NavTab) => void;
  onSwitchStudent?: (student: Student) => void;
  onLogout?: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  student,
  studentsList = [],
  activeTab = 'dashboard',
  onNavigateTab,
  onSwitchStudent,
  onLogout,
  unreadCount = 0,
}) => {
  const isHome = activeTab === 'dashboard';
  const firstLetter = student?.name ? student.name.trim()[0] : 'هـ';
  const hasMultipleChildren = studentsList.length > 1;

  const showAccountMenu = () => {
    let childrenOptionsHtml = '';
    if (hasMultipleChildren) {
      childrenOptionsHtml = `
        <div class="space-y-2 text-right pt-2 border-t border-slate-100">
          <p class="font-black text-slate-800 text-xs mb-1 flex items-center gap-1.5">
            <i class="fa-solid fa-users text-emerald-700"></i> تبديل متابعة الأبناء (${studentsList.length}):
          </p>
          ${studentsList
            .map(
              (st) => `
            <button
              id="child-btn-${st.id}"
              class="w-full p-2.5 rounded-xl border text-right transition-all flex items-center justify-between text-xs cursor-pointer ${
                st.id === student?.id
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-black shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-bold'
              }"
            >
              <div class="flex items-center gap-2">
                <span class="w-7 h-7 rounded-full bg-[#065F46] text-white flex items-center justify-center font-black text-xs">
                  ${st.name ? st.name.trim()[0] : 'ط'}
                </span>
                <div>
                  <span class="block font-black">${st.name}</span>
                  <span class="text-[10px] text-slate-500">${st.group?.name || 'المجموعة الدراسية'}</span>
                </div>
              </div>
              ${
                st.id === student?.id
                  ? '<span class="text-emerald-700 font-black text-[10px] bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">محدد حالياً 🟢</span>'
                  : '<span class="text-slate-500 text-[10px] font-bold">عرض البيانات ▶</span>'
              }
            </button>
          `
            )
            .join('')}
        </div>
      `;
    }

    Swal.fire({
      title: student?.name || 'خيارات الحساب',
      html: `
        <div class="text-right space-y-3 font-['Cairo'] text-xs p-1">
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <p class="font-bold text-slate-500 mb-0.5">المجموعة الدراسية:</p>
            <p class="font-black text-slate-900 text-sm">${student?.group?.name || 'المجموعة الدراسية'}</p>
          </div>
          ${childrenOptionsHtml}
        </div>
      `,
      showCancelButton: true,
      cancelButtonText: 'إغلاق',
      showConfirmButton: false,
      showDenyButton: !!onLogout,
      denyButtonText: 'تسجيل الخروج',
      denyButtonColor: '#e11d48',
      didOpen: () => {
        if (hasMultipleChildren && onSwitchStudent) {
          studentsList.forEach((st) => {
            const btn = document.getElementById(`child-btn-${st.id}`);
            if (btn) {
              btn.onclick = () => {
                onSwitchStudent(st);
                Swal.close();
                Swal.fire({
                  toast: true,
                  position: 'top-end',
                  icon: 'success',
                  title: `تم التحويل لمتابعة: ${st.name}`,
                  showConfirmButton: false,
                  timer: 2000,
                });
              };
            }
          });
        }
      },
    }).then((result) => {
      if (result.isConfirmed && onNavigateTab) {
        onNavigateTab('profile');
      } else if (result.isDenied && onLogout) {
        onLogout();
      }
    });
  };

  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 py-3 flex justify-between items-center border-b border-slate-100 shadow-xs max-w-md mx-auto">
      {/* Right Side: Clickable Avatar + Student Name + Live Indicator */}
      <div className="flex items-center gap-3">
        {!isHome && onNavigateTab ? (
          <button
            onClick={() => onNavigateTab('dashboard')}
            className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-all active:scale-95 shadow-xs cursor-pointer"
            title="رجوع للرئيسية"
          >
            <i className="fa-solid fa-arrow-right text-sm" />
          </button>
        ) : (
          <button
            onClick={showAccountMenu}
            className="w-11 h-11 rounded-full overflow-hidden border border-emerald-600/30 shadow-xs shrink-0 cursor-pointer active:scale-95 transition-transform bg-[#065F46] p-0.5 relative"
            title="خيارات الحساب وتبديل الأبناء"
          >
            <img
              src="/icons/student-avatar.svg"
              alt="Student Avatar"
              className="w-full h-full object-cover"
            />
          </button>
        )}

        <div
          onClick={showAccountMenu}
          className="space-y-0.5 text-right cursor-pointer select-none group"
        >
          <div className="flex items-center gap-1.5">
            <h1 className="font-black text-base text-slate-900 tracking-tight leading-none group-hover:text-[#065F46] transition-colors">
              {student?.name || 'هديه اشرف'}
            </h1>

            {hasMultipleChildren && (
              <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[10px] font-black flex items-center gap-1">
                <i className="fa-solid fa-users text-[9px]" />
                أبناء ({studentsList.length})
              </span>
            )}

            <i className="fa-solid fa-chevron-down text-[10px] text-slate-400" />
          </div>

          <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5 leading-none mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            {student?.group?.name || 'المجموعة الدراسية'}
          </p>
        </div>
      </div>

      {/* Left Side: Header Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Notification Bell Button */}
        <button
          onClick={() => onNavigateTab?.('notifications')}
          className="relative w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          title="الإشعارات والتنويهات"
          aria-label={unreadCount > 0 ? `الإشعارات (${unreadCount} جديد)` : 'الإشعارات'}
        >
          <i className="fa-regular fa-bell text-base text-slate-700" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -left-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full ring-2 ring-white flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Account Menu / Options Icon Button */}
        <button
          onClick={showAccountMenu}
          className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          title="قائمة الحساب والأبناء"
        >
          <i className="fa-solid fa-ellipsis-vertical text-base text-slate-700" />
        </button>
      </div>
    </header>
  );
};
