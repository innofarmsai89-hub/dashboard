import React from 'react';
import Sidebar from '@/components/Sidebar';
import KPICards from '@/components/KPICards';
import UserTable from '@/components/UserTable';
import { query } from '@/lib/db';

async function getDashboardData() {
  try {
    // Fetch users
    const usersResult = await query(`
      SELECT 
        user_account_id, 
        username, 
        email, 
        role, 
        contact_number, 
        is_active, 
        verified, 
        created_date 
      FROM user_accounts 
      ORDER BY created_date DESC
    `);
    
    // Fetch KPIs
    const totalUsersResult = await query('SELECT COUNT(*) FROM user_accounts');
    const activeUsersResult = await query('SELECT COUNT(*) FROM user_accounts WHERE is_active = true');
    const verifiedUsersResult = await query('SELECT COUNT(*) FROM user_accounts WHERE verified = true');
    const newUsersTodayResult = await query("SELECT COUNT(*) FROM user_accounts WHERE created_date >= NOW() - INTERVAL '24 hours'");

    return {
      users: usersResult.rows,
      stats: {
        totalUsers: parseInt(totalUsersResult.rows[0].count),
        activeUsers: parseInt(activeUsersResult.rows[0].count),
        verifiedUsers: parseInt(verifiedUsersResult.rows[0].count),
        newUsersToday: parseInt(newUsersTodayResult.rows[0].count),
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      users: [],
      stats: {
        totalUsers: 0,
        activeUsers: 0,
        verifiedUsers: 0,
        newUsersToday: 0,
      }
    };
  }
}

export default async function DashboardPage() {
  const { users, stats } = await getDashboardData();

  return (
    <div className="flex h-screen bg-[#fafafa]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 border-l-4 border-zinc-900 pl-4">
                Analytics
                <span className="text-zinc-400 font-medium ml-2">Overview</span>
              </h1>
              <p className="mt-3 text-sm text-zinc-500 font-medium ml-5">
                Monitor and manage your InnoFarms website metrics in real-time.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-xl bg-zinc-900/5 px-3 py-1.5 border border-zinc-900/10">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                  Live Engine
                </span>
              </div>
              <button className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-zinc-900 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] border border-zinc-200 hover:bg-zinc-50 transition-all duration-200 active:scale-95">
                Sync Data
              </button>
            </div>
          </div>

          <KPICards 
            totalUsers={stats.totalUsers}
            activeUsers={stats.activeUsers}
            verifiedUsers={stats.verifiedUsers}
            newUsersToday={stats.newUsersToday}
          />

          <UserTable data={users} />
        </div>
      </main>
    </div>
  );
}
