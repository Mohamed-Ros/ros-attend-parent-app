import React, { useState } from 'react';
import { KeyRound, Lock, LockKeyhole } from 'lucide-react';
import { AuthService } from '../services/authService';
import { HeroFrame } from '../components/ScreenHero';
import { Button, Card, Field, InlineAlert } from '../components/ui';

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

  const type = show ? 'text' : 'password';

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <HeroFrame watermark={KeyRound} padBottom="pb-14">
        <div className="space-y-1 pt-2">
          <h1 className="text-display">{forced ? 'اختر كلمة سر جديدة' : 'تغيير كلمة السر'}</h1>
          <p className="text-meta text-white/80 max-w-[75%]">
            {forced ? 'هذه أول مرة تدخل فيها. لحماية بيانات ابنك، اختر كلمة سر خاصة بك.' : 'اختر كلمة سر جديدة لحسابك'}
          </p>
        </div>
      </HeroFrame>

      <main className="relative z-10 w-full max-w-md mx-auto px-4 -mt-6 pb-10">
        <Card className="p-5">
          <form onSubmit={submit} className="space-y-4">
            {!(forced && initialPassword) && (
              <Field id="current" icon={Lock} label="كلمة السر الحالية" type={type} autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} ltr />
            )}
            <Field id="next" icon={KeyRound} label="كلمة السر الجديدة" hint="6 أحرف على الأقل" type={type} autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} ltr />
            <Field id="confirm" icon={LockKeyhole} label="تأكيد كلمة السر الجديدة" type={type} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} ltr />

            <label className="flex items-center gap-2 text-meta text-ink-2 cursor-pointer select-none">
              <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="w-4 h-4 accent-brand" />
              إظهار كلمات السر
            </label>

            {error && <InlineAlert>{error}</InlineAlert>}

            <Button type="submit" loading={loading}>
              {loading ? 'جارٍ الحفظ' : forced ? 'حفظ ومتابعة' : 'حفظ'}
            </Button>

            {!forced && onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel}>
                إلغاء
              </Button>
            )}
            {forced && onLogout && (
              <Button type="button" variant="ghost" onClick={onLogout}>
                الرجوع لتسجيل الدخول
              </Button>
            )}
          </form>
        </Card>
      </main>
    </div>
  );
};
