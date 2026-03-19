'use client';

import React from 'react';
import { 
  Users, 
  LayoutDashboard, 
  Settings, 
  BarChart3, 
  UserPlus, 
  LogOut,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  // { icon: Users, label: 'Users', href: '/users' },
  // { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  // { icon: UserPlus, label: 'Add User', href: '/add-user' },
  // { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col bg-white text-zinc-600 border-r border-zinc-200 shadow-[2px_0_8px_rgba(0,0,0,0.02)]">
      <div className="flex h-20 items-center px-6 border-b border-zinc-50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-zinc-900 flex items-center justify-center text-white font-bold shadow-sm">
            IF
          </div>
          <span className="text-lg font-bold text-zinc-900 tracking-tight">InnoFarms CRM</span>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
          <input
            type="text"
            placeholder="Quick search..."
            className="w-full rounded-xl bg-zinc-50 border border-zinc-100 py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-200 focus:bg-white transition-all"
          />
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-zinc-900 text-white shadow-sm" 
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              <item.icon className={cn("h-4.5 w-4.5 transition-transform", isActive ? "scale-110" : "group-hover:scale-110")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-zinc-100 p-4">
        <button className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200">
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
