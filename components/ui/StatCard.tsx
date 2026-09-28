import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  hint?: string;
  /** 0–100; renders a thin progress bar under the value. */
  progress?: number;
  tone?: 'brand' | 'blue' | 'amber' | 'zinc';
}

const tones = {
  brand: { icon: 'bg-brand-50 text-brand-600', bar: 'bg-brand-500' },
  blue: { icon: 'bg-blue-50 text-blue-600', bar: 'bg-blue-500' },
  amber: { icon: 'bg-amber-50 text-amber-600', bar: 'bg-amber-500' },
  zinc: { icon: 'bg-zinc-100 text-zinc-700', bar: 'bg-zinc-700' },
};

export default function StatCard({ label, value, icon: Icon, hint, progress, tone = 'zinc' }: StatCardProps) {
  const t = tones[tone];
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-sm font-medium text-zinc-500">{label}</p>
        <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', t.icon)}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-zinc-900 sm:text-3xl">
        {value.toLocaleString('en-US')}
      </p>
      {progress !== undefined && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100" aria-hidden>
          <div className={cn('h-full rounded-full', t.bar)} style={{ width: `${Math.min(100, progress)}%` }} />
        </div>
      )}
      {hint && <p className="mt-2 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}
