import React, { useState } from 'react';
import { ArrowRight, Bell, LucideIcon } from 'lucide-react';
import { Student } from '../types';
import { AccountSheet } from './AccountSheet';
import { teacherTitle } from '../lib/teachers';

/** Green gradient banner with soft circles and a curved bottom edge. Children sit in the centered content column. */
export const HeroFrame: React.FC<{ children: React.ReactNode; watermark?: LucideIcon; padBottom?: string }> = ({ children, watermark: Mark, padBottom = 'pb-14' }) => (
  <header
    className="relative overflow-hidden text-white"
    style={{ background: 'linear-gradient(165deg,#1E6554 0%,#16423C 55%,#0D2E2A 100%)', paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}
  >
    <div aria-hidden className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-white/[0.06]" />
    <div aria-hidden className="absolute top-10 -left-24 w-72 h-72 rounded-full bg-white/[0.05]" />
    {Mark && <Mark aria-hidden strokeWidth={1} className="absolute left-3 bottom-6 w-32 h-32 md:w-40 md:h-40 text-white/10" />}
    <div className={`relative max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-4 pt-3 ${padBottom}`}>{children}</div>
    <svg viewBox="0 0 400 40" preserveAspectRatio="none" className="absolute bottom-0 inset-x-0 w-full h-8 text-canvas" aria-hidden>
      <path d="M0 22 C70 0 140 6 210 22 S340 40 400 14 V40 H0 Z" fill="currentColor" />
    </svg>
  </header>
);

interface ScreenHeroProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  student: Student;
  studentsList: Student[];
  onSwitchStudent: (s: Student) => void;
  onLogout: () => void;
  /** Pushed screens show a back button instead of the account avatar. */
  onBack?: () => void;
  onOpenNotifications?: () => void;
  hasUnread?: boolean;
  /** Replaces the bell (e.g. a refresh button). */
  action?: React.ReactNode;
}

/** Hero for inner screens: who we follow, notifications, then the page title. */
export const ScreenHero: React.FC<ScreenHeroProps> = ({
  title,
  subtitle,
  icon,
  student,
  studentsList,
  onSwitchStudent,
  onLogout,
  onBack,
  onOpenNotifications,
  hasUnread,
  action,
}) => {
  const [account, setAccount] = useState(false);
  return (
    <>
      <HeroFrame watermark={icon}>
        <div className="flex items-center gap-3">
          {onBack ? (
            <button type="button" onClick={onBack} aria-label="رجوع" className="w-11 h-11 shrink-0 rounded-2xl bg-white/15 grid place-items-center">
              <ArrowRight size={20} aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setAccount(true)}
              aria-label="الحساب وتبديل الأبناء"
              className="w-11 h-11 shrink-0 rounded-full border-2 border-white/80 grid place-items-center text-body font-bold bg-white/10"
            >
              {(student.name?.trim()[0] || 'ط').toUpperCase()}
            </button>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-meta font-semibold truncate">{student.name}</p>
            <p className="text-caption text-white/75 truncate">{[teacherTitle(student), student.group?.name || 'المجموعة الدراسية'].filter(Boolean).join(' · ')}</p>
          </div>
          {action ??
            (onOpenNotifications && (
              <button
                type="button"
                onClick={onOpenNotifications}
                aria-label={hasUnread ? 'الإشعارات (يوجد جديد)' : 'الإشعارات'}
                className="relative w-11 h-11 shrink-0 rounded-2xl bg-white/15 grid place-items-center"
              >
                <Bell size={20} aria-hidden />
                {hasUnread && <span className="absolute top-2.5 left-3 w-2.5 h-2.5 rounded-full bg-danger ring-2 ring-brand" />}
              </button>
            ))}
        </div>
        <div className="mt-5 space-y-1">
          <h1 className="text-display">{title}</h1>
          {subtitle && <p className="text-meta text-white/80">{subtitle}</p>}
        </div>
      </HeroFrame>
      <AccountSheet open={account} onClose={() => setAccount(false)} student={student} studentsList={studentsList} onSwitchStudent={onSwitchStudent} onLogout={onLogout} />
    </>
  );
};
