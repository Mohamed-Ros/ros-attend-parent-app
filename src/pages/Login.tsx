import React, { useState } from 'react';
import { AuthService } from '../services/authService';

interface LoginProps {
  /** Called once the token is stored; App then loads the session (and asks for a new password if required). */
  onLoggedIn: (mustChangePassword: boolean, password: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoggedIn }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setError('يرجى إدخال رقم الهاتف كاملاً');
      return;
    }
    if (!password) {
      setError('يرجى إدخال كلمة السر');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const { mustChangePassword } = await AuthService.login(cleanPhone, password);
      onLoggedIn(mustChangePassword, password);
    } catch (err: any) {
      setError(err?.message || 'تعذر تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between items-center p-6 relative overflow-hidden font-['Cairo']">
      <div className="w-full max-w-sm pt-4 flex flex-col items-center justify-center space-y-3 z-10">
        <div className="w-full h-40 flex items-center justify-center">
          <img src="/Login.png" alt="Ros Attends" className="h-full w-auto object-contain" />
        </div>
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">تسجيل الدخول</h1>
          <p className="text-xs font-semibold text-emerald-600">بوابة متابعة حضور الطلاب - Ros Attends</p>
        </div>
      </div>

      <div className="w-full max-w-sm my-auto z-10 space-y-4">
        <form onSubmit={submit} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-lg shadow-slate-100">
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-xs font-bold text-slate-700 block text-right">
              رقم هاتف ولي الأمر المسجل بالسنتر
            </label>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="username"
              placeholder="01012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-600 transition-all text-right dir-ltr"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-bold text-slate-700 block text-right">
              كلمة السر
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-600 transition-all text-right dir-ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'إخفاء كلمة السر' : 'إظهار كلمة السر'}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 text-slate-400 hover:text-slate-700"
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
              </button>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 text-right leading-relaxed">
              أول مرة؟ كلمة السر هي رقم هاتفك نفسه، وسنطلب منك اختيار كلمة سر جديدة بعد الدخول.
            </p>
          </div>

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
                <i className="fa-solid fa-circle-notch animate-spin text-base" /> جاري الدخول...
              </>
            ) : (
              <>
                <i className="fa-solid fa-arrow-left text-base" /> دخول
              </>
            )}
          </button>

          <p className="text-[11px] font-semibold text-slate-400 text-center">
            نسيت كلمة السر؟ تواصل مع المعلم لإعادة تعيينها.
          </p>
        </form>
      </div>

      <div className="text-center text-[11px] font-semibold text-slate-400 z-10 pb-2 space-y-1">
        <p>Ros Attends Parent Portal © {new Date().getFullYear()} • نظام متابعة الطلاب الذكي</p>
        <a
          href="/privacy.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-700 hover:underline font-bold text-[11px] inline-flex items-center gap-1"
        >
          <i className="fa-solid fa-shield-halved text-[10px]" />
          سياسة الخصوصية
        </a>
      </div>
    </div>
  );
};
