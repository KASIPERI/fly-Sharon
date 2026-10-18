import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  subtext?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant: 'emerald' | 'amber' | 'rose' | 'slate';
  };
  highlight?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subtext,
  icon: Icon,
  badge,
  highlight = false,
}) => {
  const badgeClasses = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    amber: 'bg-status-amber/10 text-status-amber border-status-amber/25',
    rose: 'bg-status-rose/10 text-status-rose border-status-rose/25',
    slate: 'bg-surface-subtleDark text-content-secondaryDark border-subdued-borderDark',
  };

  return (
    <div
      className={`relative p-4 rounded-xl border transition-all duration-200 overflow-hidden ${
        highlight
          ? 'bg-surface-dark border-emerald-500/40 shadow-emerald-glow'
          : 'bg-surface-dark border-subdued-borderDark hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-content-secondaryDark tracking-wide uppercase">
          {label}
        </span>
        <div
          className={`p-2 rounded-lg ${
            highlight
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-canvas-dark text-content-secondaryDark border border-subdued-borderDark'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline space-x-1.5">
        <span className="text-2xl font-extrabold tracking-tight font-mono text-content-primaryDark">
          {value}
        </span>
        {unit && <span className="text-xs font-mono font-medium text-content-secondaryDark">{unit}</span>}
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        {subtext && <span className="text-content-secondaryDark truncate">{subtext}</span>}
        {badge && (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
              badgeClasses[badge.variant]
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>
    </div>
  );
};
