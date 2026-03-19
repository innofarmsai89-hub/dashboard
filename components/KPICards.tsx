'use client';

import React from 'react';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  ShieldCheck 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface KPIProps {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  newUsersToday: number;
}

export default function KPICards({ totalUsers, activeUsers, verifiedUsers, newUsersToday }: KPIProps) {
  const kpis = [
    {
      label: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'text-zinc-900',
      iconColor: 'bg-zinc-900 text-white',
      description: 'System-wide registration'
    },
    {
      label: 'Active Users',
      value: activeUsers,
      icon: UserCheck,
      color: 'text-zinc-600',
      iconColor: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      description: 'Currently operational'
    },
    {
      label: 'Verified Users',
      value: verifiedUsers,
      icon: ShieldCheck,
      color: 'text-zinc-600',
      iconColor: 'bg-blue-50 text-blue-600 border border-blue-100',
      description: 'Trust level verified'
    },
    {
      label: 'New Growth',
      value: newUsersToday,
      icon: UserPlus,
      color: 'text-zinc-600',
      iconColor: 'bg-violet-50 text-violet-600 border border-violet-100',
      description: 'Acquired in last 24h'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-1"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">{kpi.label}</p>
              <h3 className="mt-3 text-3xl font-bold text-zinc-900 tracking-tight">
                {kpi.value.toLocaleString()}
              </h3>
            </div>
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110", kpi.iconColor)}>
              <kpi.icon className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-zinc-300" />
            <p className="text-xs font-medium text-zinc-500">{kpi.description}</p>
          </div>
          
          <div className="absolute bottom-0 left-0 h-1 w-0 bg-zinc-900 transition-all duration-500 group-hover:w-full" />
        </div>
      ))}
    </div>
  );
}
