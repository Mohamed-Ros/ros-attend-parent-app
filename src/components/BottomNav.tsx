import React from 'react';

export type NavTab = 'dashboard' | 'attendance' | 'billing' | 'exams' | 'profile' | 'notifications';

interface BottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: NavTab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'الرئيسية', icon: 'fa-house' },
    { id: 'attendance', label: 'الحضور', icon: 'fa-calendar-check' },
    { id: 'billing', label: 'المالية', icon: 'fa-wallet' },
    { id: 'exams', label: 'الدرجات', icon: 'fa-graduation-cap' },
  ];

  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50">
      <nav className="bg-slate-950/95 backdrop-blur-xl border border-slate-800/80 rounded-full p-1.5 shadow-2xl shadow-slate-950/40 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 py-2 px-3 rounded-full transition-all duration-300 ease-out select-none ${
                isActive
                  ? 'bg-slate-800/90 text-white shadow-md border border-slate-700/60 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200 font-medium hover:bg-slate-900/50'
              }`}
            >
              <i className={`fa-solid ${tab.icon} ${isActive ? 'text-white text-sm' : 'text-base'}`} />

              {isActive && (
                <span className="text-xs font-black tracking-tight whitespace-nowrap animate-in fade-in duration-200">
                  {tab.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
