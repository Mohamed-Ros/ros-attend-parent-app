import React from 'react';
import { CalendarCheck, GraduationCap, Home, LucideIcon, UserRound, Wallet } from 'lucide-react';

export type NavTab = 'dashboard' | 'attendance' | 'billing' | 'exams' | 'profile' | 'notifications';

interface BottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

const TABS: { id: NavTab; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'الرئيسية', icon: Home },
  { id: 'attendance', label: 'الحضور', icon: CalendarCheck },
  { id: 'billing', label: 'المالية', icon: Wallet },
  { id: 'exams', label: 'الدرجات', icon: GraduationCap },
  { id: 'profile', label: 'حسابي', icon: UserRound },
];

/** Floating tab bar. The active tab becomes a filled green tile. */
export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => (
  <nav
    className="fixed inset-x-3 z-50 max-w-md mx-auto bg-surface rounded-[26px] shadow-nav border border-line/70 p-1.5"
    style={{ bottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    aria-label="التنقل الرئيسي"
  >
    <ul className="grid grid-cols-5 gap-1">
      {TABS.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id;
        return (
          <li key={id}>
            <button
              type="button"
              onClick={() => setActiveTab(id)}
              aria-current={active ? 'page' : undefined}
              className={`w-full flex flex-col items-center justify-center gap-0.5 py-2 rounded-[20px] transition-colors ${
                active ? 'bg-brand text-white shadow-card' : 'text-ink-2'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2 : 1.75} aria-hidden />
              <span className={`text-caption ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  </nav>
);
