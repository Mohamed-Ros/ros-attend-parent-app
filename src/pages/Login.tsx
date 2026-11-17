import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Lock, ShieldCheck, Smartphone } from 'lucide-react';
import { AuthService } from '../services/authService';
import { CapArt } from '../components/CapArt';
import { HeroFrame } from '../components/ScreenHero';
import { Button, Card, Field, InlineAlert } from '../components/ui';

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
    if (cleanPhone.length < 10) return setError('يرجى إدخال رقم الهاتف كاملاً');
    if (!password) return setError('يرجى إدخال كلمة السر');

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
    <div className="min-h-screen bg-canvas text-ink font-sans flex flex-col">
      <HeroFrame padBottom="pb-20">
        <div className="relative min-h-[130px] flex flex-col justify-center space-y-1">
          <p className="text-caption font-semibold tracking-wide text-white/70">ROSS ATTENDS</p>
          <h1 className="text-display">بوابة ولي الأمر</h1>
          <p className="text-meta text-white/80 max-w-[52%]">تابع حضور ابنك ودرجاته ومدفوعاته في مكان واحد</p>
          <CapArt palette="green" className="absolute left-0 top-1/2 -translate-y-1/2 w-36 md:w-48 h-auto drop-shadow-lg" />
        </div>
      </HeroFrame>

      <main className="relative z-10 flex-1 w-full max-w-md mx-auto px-4 -mt-9 pb-6 flex flex-col">
        <Card className="p-5 md:p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="text-display">تسجيل الدخول</h2>
            <p className="text-meta text-ink-2">أدخل بياناتك للمتابعة</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Field
              id="phone"
              icon={Smartphone}
              label="رقم هاتف ولي الأمر"
              type="tel"
              inputMode="numeric"
              autoComplete="username"
              placeholder="01012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              ltr
            />
            <Field
              id="password"
              icon={Lock}
              label="كلمة السر"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              ltr
              hint="أول مرة؟ كلمة السر هي رقم هاتفك، وسنطلب منك اختيار كلمة جديدة بعد الدخول."
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'إخفاء كلمة السر' : 'إظهار كلمة السر'}
                  className="w-10 h-10 grid place-items-center text-ink-3"
                >
                  {showPassword ? <EyeOff size={20} strokeWidth={1.75} /> : <Eye size={20} strokeWidth={1.75} />}
                </button>
              }
            />

            {error && <InlineAlert>{error}</InlineAlert>}

            <Button type="submit" loading={loading} icon={ArrowLeft} className="h-[52px]">
              {loading ? 'جارٍ الدخول' : 'دخول'}
            </Button>
          </form>

          <p className="pt-4 border-t border-line text-caption text-ink-2 text-center">نسيت كلمة السر؟ تواصل مع المعلم لإعادة تعيينها.</p>
        </Card>

        <footer className="mt-auto pt-8 text-center text-caption text-ink-3 space-y-1">
          <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-ink-2">
            <ShieldCheck size={12} aria-hidden /> سياسة الخصوصية
          </a>
          <p>Ross Attends © {new Date().getFullYear()}</p>
        </footer>
      </main>
    </div>
  );
};
