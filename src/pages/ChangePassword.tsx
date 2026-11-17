import React, { useState } from 'react';
import { AuthService } from '../services/authService';

interface ChangePasswordProps {
  /** First login: the parent cannot skip this screen. */
  forced?: boolean;
  /** Needed when forced: the phone number is the initial password the parent just logged in with. */
  initialPassword?: string;
  onDone: () => void;
  onCancel?: () => void;
  onLogout?: () => void;
}

export const ChangePassword: React.FC<ChangePasswordProps> = ({ forced = false, initialPassword = '', onDone, onCancel, onLogout }) => {
  const [current, setCurrent] = useState(initialPassword);
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return setError('أدخل كلمة السر الحالية');
    if (next.length < 6) return setError('كلمة السر الجديدة يجب ألا تقل عن 6 أحرف');
    if (next !== confirm) return setError('تأكيد كلمة السر غير مطابق');
    if (next === current) return setError('كلمة السر الجديدة يجب أن تختلف عن الحالية');

    setError('');
    setLoading(true);
    try {
      await AuthService.changePassword(current, next);
      onDone();
    } catch (err: any) {
      setError(err?.message || 'تعذر تغيير كلمة السر');
    } finally {
      setLoading(false);
    }
  };

  const field = (id: string, label: string, value: string, set: (v: string) => void, autoComplete: string) => (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-bold text-slate-700 block text-right">
        {label}
      </label>
      <input
        id={id}
        type={show ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => set(e.target.value)}
        className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-emerald-600 transition-all text-right dir-ltr"
      />
    </div>
  );

  return (
    <div className={`${forced ? 'min-h-screen bg-white p-6 flex items-center justify-center' : ''} font-['Cairo']`}>
      <form onSubmit={submit} className="w-full max-w-sm mx-auto bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-lg shadow-slate-100">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <i className="fa-solid fa-key text-lg" />
          </div>
          <h2 className="text-lg font-black text-slate-900">{forced ? 'اختر كلمة سر جديدة' : 'تغيير كلمة السر'}</h2>
          {forced && (
            <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
              هذه أول مرة تدخل فيها. لحماية بيانات ابنك، اختر كلمة سر خاصة بك لن يعرفها غيرك.
            </p>
          )}
        </div>

        {!(forced && initialPassword) && field('current', 'كلمة السر الحالية', current, setCurrent, 'current-password')}
        {field('next', 'كلمة السر الجديدة (6 أحرف على الأقل)', next, setNext, 'new-password')}
        {field('confirm', 'تأكيد كلمة السر الجديدة', confirm, setConfirm, 'new-password')}

        <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer select-none">
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="w-4 h-4 accent-emerald-700" />
          إظهار كلمات السر
        </label>

        {error && (
          <div role="alert" className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl px-3 py-2.5 text-right">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-[#16423C] text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-[#123631] active:scale-95 transition-all shadow-md disabled:opacity-50"
        >
          {loading ? (
            <>
              <i className="fa-solid fa-circle-notch animate-spin" /> جاري الحفظ...
            </>
          ) : (
            'حفظ وتسجيل الدخول'
          )}
        </button>

        {!forced && onCancel && (
          <button type="button" onClick={onCancel} className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800">
            إلغاء
          </button>
        )}
        {forced && onLogout && (
          <button type="button" onClick={onLogout} className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-slate-700">
            الرجوع لتسجيل الدخول
          </button>
        )}
      </form>
    </div>
  );
};
