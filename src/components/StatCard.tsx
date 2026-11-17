import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color?: 'emerald' | 'amber' | 'blue' | 'rose';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'emerald',
  onClick,
}) => {
  const colorStyles = {
    emerald: {
      bg: 'bg-[#e8f6f0]',
      border: 'border-[#b2e2d0]',
      iconBg: 'bg-[#059669] text-white',
      underline: 'border-b-2 border-b-[#059669]/40',
    },
    rose: {
      bg: 'bg-[#fde8e8]',
      border: 'border-[#f8b4b4]',
      iconBg: 'bg-[#e11d48] text-white',
      underline: 'border-b-2 border-b-[#e11d48]/40',
    },
    amber: {
      bg: 'bg-[#fef3c7]',
      border: 'border-[#fde68a]',
      iconBg: 'bg-[#d97706] text-white',
      underline: 'border-b-2 border-b-[#d97706]/40',
    },
    blue: {
      bg: 'bg-[#e0e7ff]',
      border: 'border-[#c7d2fe]',
      iconBg: 'bg-[#4f46e5] text-white',
      underline: 'border-b-2 border-b-[#4f46e5]/40',
    },
  };

  const style = colorStyles[color];

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-100 ${style.underline} rounded-3xl p-4 flex items-center justify-between shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-200 hover:shadow-md active:scale-98' : ''
      }`}
    >
      <div className="space-y-1 text-right">
        <p className="text-xs font-extrabold text-slate-500">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
        {subtitle && <p className="text-[11px] text-slate-500 font-bold">{subtitle}</p>}
      </div>

      <div
        className={`w-12 h-12 rounded-2xl ${style.bg} border ${style.border} flex items-center justify-center shrink-0 shadow-xs`}
      >
        <div className={`w-7 h-7 rounded-full ${style.iconBg} flex items-center justify-center text-xs font-black`}>
          <i className={`fa-solid ${icon}`} />
        </div>
      </div>
    </div>
  );
};
