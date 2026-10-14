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

// One row per person, merged from user_accounts and users on normalized email.
// Email is the identity key because secondary accounts reuse their owner's original_user_id.
// Duplicate emails within either table collapse to the most recent row.
// origin only exists on users; accounts without a users row inherit their owner's origin.
const MERGED_USERS_SQL = `
  WITH accounts AS (
    SELECT DISTINCT ON (LOWER(TRIM(email))) LOWER(TRIM(email)) AS email_key, *
    FROM public.user_accounts
    WHERE email IS NOT NULL
    ORDER BY LOWER(TRIM(email)), created_date DESC, user_account_id DESC
  ),
  legacy AS (
    SELECT DISTINCT ON (LOWER(TRIM(email))) LOWER(TRIM(email)) AS email_key, *
    FROM public.users
    WHERE email IS NOT NULL
    ORDER BY LOWER(TRIM(email)), created_date DESC
  )
  SELECT
    COALESCE(a.email_key, l.email_key) AS id,
    COALESCE(NULLIF(TRIM(a.username), ''), NULLIF(TRIM(l.username), '')) AS username,
    COALESCE(a.email, l.email) AS email,
    COALESCE(a.role, l.role) AS role,
    COALESCE(
      NULLIF(TRIM(a.contact_number), ''),
      NULLIF(TRIM(CONCAT_WS(' ', l.phone_code, l.phone_number)), '')
    ) AS contact_number,
    COALESCE(l.origin, owner.origin) AS origin,
    COALESCE(a.is_active, l.active) AS is_active,
    COALESCE(a.verified, l.verified) AS verified,
    LEAST(a.created_date, l.created_date) AS created_date
  FROM accounts a
  FULL OUTER JOIN legacy l ON l.email_key = a.email_key
  LEFT JOIN public.users owner ON owner.user_id = a.original_user_id
  ORDER BY created_date DESC NULLS LAST
`;

async function getDashboardData() {
  try {
    const { rows } = await query(MERGED_USERS_SQL);
    const users = rows as UserRow[];
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;

    return {
      users,
      stats: {
        totalUsers: users.length,
        activeUsers: users.filter((u) => u.is_active).length,
        verifiedUsers: users.filter((u) => u.verified).length,
        newUsersToday: users.filter((u) => u.created_date && new Date(u.created_date).getTime() >= dayAgo).length,
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
        actions={<RefreshButton intervalMs={10_000} />}
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
