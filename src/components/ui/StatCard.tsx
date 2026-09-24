'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  color?: 'blue' | 'indigo' | 'emerald' | 'amber' | 'purple';
}

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  color = 'blue',
}: StatCardProps) {
  const colorStyles = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  }[color];

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
            {value}
          </h3>
          {subtext && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtext}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl border ${colorStyles}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
              trend.positive
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}
          >
            {trend.value}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">vs last milestone</span>
        </div>
      )}
    </div>
  );
}
