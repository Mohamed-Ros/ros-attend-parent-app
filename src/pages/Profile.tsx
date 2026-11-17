import React, { useState } from 'react';
import { Student } from '../types';
import Swal from 'sweetalert2';

interface ProfileProps {
  student: Student;
  onLogout: () => void;
  onNavigateHome: () => void;
  onChangePassword: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ student, onLogout, onNavigateHome, onChangePassword }) => {
  const [showQrModal, setShowQrModal] = useState(false);

  const group = student.group;
  const studentCode = student.qr_code || student.phone || 'STU-' + student.id;

  const handleConfirmLogout = () => {
    Swal.fire({
      title: 'تسجيل الخروج',
      text: 'هل أنت تأكد من رغبتك في تسجيل الخروج؟',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'نعم، خروج',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#16423C',
      cancelButtonColor: '#94A3B8',
    }).then((result) => {
      if (result.isConfirmed) {
        onLogout();
      }
    });
  };

  return (
    <div className="space-y-5 pb-28 font-['Cairo']">
      {/* ── Standalone Top Back Button Bar ── */}
      <div className="flex items-center justify-start">
        <button
          onClick={onNavigateHome}
          className="px-3.5 py-1.5 rounded-2xl bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-100 flex items-center gap-2 text-xs font-black transition-all shadow-xs active:scale-95 cursor-pointer"
          title="رجوع للرئيسية"
        >
          <i className="fa-solid fa-arrow-right text-xs text-emerald-700" />
          <span>رجوع</span>
        </button>
      </div>

      {/* ── Page Top Header Banner ── */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs relative overflow-hidden">
        <div className="text-right space-y-0.5">
          <h2 className="text-xl font-black text-slate-900">الملف الشخصي والحساب</h2>
          <p className="text-xs font-semibold text-slate-500">بيانات الطالب وإعدادات المتابعة</p>
        </div>

        {/* Emerald Underline Accent Divider */}
        <div className="w-full h-1 bg-gradient-to-r from-emerald-500/80 via-emerald-300/40 to-transparent mt-4 rounded-full" />
      </div>

      {/* ── Profile Summary Card ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm shadow-slate-200/60 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-[#16423C] text-white flex items-center justify-center text-2xl font-black shadow-md shadow-emerald-950/20 shrink-0">
            {student.name?.[0] || 'ط'}
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900">{student.name}</h3>
            <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
              <i className="fa-solid fa-graduation-cap text-xs" />
              {group?.name || 'المجموعة الدراسية'}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              كود الطالب: <span className="font-bold text-slate-800">{studentCode}</span>
            </p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl space-y-0.5 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 block">رقم هاتف الطالب</span>
            <span className="font-extrabold text-slate-800 dir-ltr block text-right">{student.phone || '—'}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl space-y-0.5 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 block">هاتف ولي الأمر</span>
            <span className="font-extrabold text-slate-800 dir-ltr block text-right">{student.parent_phone || student.phone || '—'}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl space-y-0.5 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 block">نوع الاشتراك</span>
            <span className="font-extrabold text-slate-800 block">
              {student.subscription_type === 'monthly' ? 'اشتراك شهري (8 حصص)' : 'سداد بالحصة'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl space-y-0.5 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 block">رقم الميدالية</span>
            <span className="font-extrabold text-amber-700 block">
              {student.medallion_number ? `#${student.medallion_number}` : 'غير محدد'}
            </span>
          </div>
        </div>
      </div>



      {/* ── Settings & Notification Controls ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
        <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <i className="fa-solid fa-sliders text-emerald-700" />
          إعدادات الحساب
        </h4>

        <div className="space-y-3 divide-y divide-slate-100">
          <button
            type="button"
            onClick={onChangePassword}
            className="w-full flex items-center justify-between pt-1 text-right active:opacity-70"
          >
            <div>
              <p className="text-xs font-bold text-slate-800">تغيير كلمة السر</p>
              <p className="text-[10px] text-slate-500">اختر كلمة سر جديدة لحسابك</p>
            </div>
            <i className="fa-solid fa-chevron-left text-xs text-slate-400" />
          </button>

          <div className="flex items-center justify-between pt-3">
            <div>
              <p className="text-xs font-bold text-slate-800">مظهر التطبيق</p>
              <p className="text-[10px] text-slate-500">مفعل على الهوية الفاتحة الراقية (White Theme)</p>
            </div>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200">
              أبيض أصلّي ☀️
            </span>
          </div>
        </div>
      </div>

      {/* ── Logout Button ── */}
      <button
        onClick={handleConfirmLogout}
        className="w-full py-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 active:scale-98 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
      >
        <i className="fa-solid fa-arrow-right-from-bracket" />
        تسجيل الخروج من البوابة
      </button>


    </div>
  );
};
