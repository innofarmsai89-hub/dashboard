import React from 'react';
import { ShieldCheck, UserCheck, UserPlus, Users } from 'lucide-react';
import AppShell from '@/components/AppShell';
import UserTable, { type UserRow } from '@/components/UserTable';
import PageHeader from '@/components/ui/PageHeader';
import RefreshButton from '@/components/ui/RefreshButton';
import StatCard from '@/components/ui/StatCard';
import { query } from '@/lib/db';
import { percent } from '@/lib/utils';

// Render on every request so newly registered users show up without a rebuild.
// The pg queries aren't fetch() calls, so Next would otherwise prerender this page at build time.
export const dynamic = 'force-dynamic';

async function getDashboardData() {
  try {
    const [usersResult, statsResult] = await Promise.all([
      query(`
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
      `),
      query(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE is_active = true) AS active,
          COUNT(*) FILTER (WHERE verified = true) AS verified,
          COUNT(*) FILTER (WHERE created_date >= NOW() - INTERVAL '24 hours') AS new_today
        FROM user_accounts
      `),
    ]);

    const s = statsResult.rows[0];
    return {
      users: usersResult.rows as UserRow[],
      stats: {
        totalUsers: parseInt(s.total),
        activeUsers: parseInt(s.active),
        verifiedUsers: parseInt(s.verified),
        newUsersToday: parseInt(s.new_today),
      },
      error: null as string | null,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      users: [] as UserRow[],
      stats: { totalUsers: 0, activeUsers: 0, verifiedUsers: 0, newUsersToday: 0 },
      error: 'Could not load user data from the database.',
    };
  }
}

export default async function DashboardPage() {
  const { users, stats, error } = await getDashboardData();

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description="Registered users and account health across InnoFarms."
        actions={<RefreshButton />}
      />

      {error && (
        <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Total users" value={stats.totalUsers} icon={Users} tone="zinc" hint="All registered accounts" />
        <StatCard
          label="Active"
          value={stats.activeUsers}
          icon={UserCheck}
          tone="brand"
          progress={percent(stats.activeUsers, stats.totalUsers)}
          hint={`${percent(stats.activeUsers, stats.totalUsers)}% of all users`}
        />
        <StatCard
          label="Verified"
          value={stats.verifiedUsers}
          icon={ShieldCheck}
          tone="blue"
          progress={percent(stats.verifiedUsers, stats.totalUsers)}
          hint={`${percent(stats.verifiedUsers, stats.totalUsers)}% of all users`}
        />
        <StatCard label="New (24h)" value={stats.newUsersToday} icon={UserPlus} tone="amber" hint="Registered in the last day" />
      </div>

      <UserTable data={users} />
    </AppShell>
  );
}
