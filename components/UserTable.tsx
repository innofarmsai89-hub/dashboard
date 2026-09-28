'use client';

import React, { useMemo, useState } from 'react';
import { BadgeCheck, Download, Phone } from 'lucide-react';
import { downloadCsv } from '@/lib/utils';
import LocalDate from '@/components/ui/LocalDate';
import { Avatar, Badge, Card, EmptyState, Pagination, SearchInput, Select } from '@/components/ui/primitives';

export interface UserRow {
  user_account_id: string | number;
  username: string | null;
  email: string | null;
  role: string | null;
  contact_number: string | null;
  is_active: boolean | null;
  verified: boolean | null;
  created_date: string | Date | null;
}

const PAGE_SIZE = 10;

function StatusBadge({ active }: { active: boolean | null }) {
  return active ? (
    <Badge tone="green" dot>Active</Badge>
  ) : (
    <Badge tone="zinc" dot>Inactive</Badge>
  );
}

function VerifiedBadge({ verified }: { verified: boolean | null }) {
  return verified ? (
    <span className="inline-flex items-center gap-1 text-sm text-blue-700">
      <BadgeCheck className="h-4 w-4" /> Verified
    </span>
  ) : (
    <span className="text-sm text-zinc-400">Unverified</span>
  );
}

export default function UserTable({ data }: { data: UserRow[] }) {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const roles = useMemo(
    () => Array.from(new Set(data.map((u) => u.role).filter(Boolean) as string[])).sort(),
    [data]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return data.filter((u) => {
      if (role !== 'all' && u.role !== role) return false;
      if (status === 'active' && !u.is_active) return false;
      if (status === 'inactive' && u.is_active) return false;
      if (status === 'verified' && !u.verified) return false;
      if (status === 'unverified' && u.verified) return false;
      if (!term) return true;
      return [u.username, u.email, u.contact_number, u.role].some((v) => v?.toLowerCase().includes(term));
    });
  }, [data, search, role, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <Card className="mt-6 sm:mt-8">
      <div className="flex flex-col gap-4 border-b border-zinc-200 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Registered users</h2>
            <p className="mt-0.5 text-sm text-zinc-500">
              {filtered.length === data.length
                ? `${data.length.toLocaleString('en-US')} total`
                : `${filtered.length.toLocaleString('en-US')} of ${data.length.toLocaleString('en-US')} shown`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => downloadCsv('users.csv', filtered as unknown as Record<string, unknown>[])}
            disabled={filtered.length === 0}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 xl:hidden"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Search name, email, phone"
            className="col-span-2 sm:w-64"
          />
          <Select value={role} onChange={(v) => { setRole(v); setPage(1); }} label="Filter by role">
            <option value="all">All roles</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
          <Select value={status} onChange={(v) => { setStatus(v); setPage(1); }} label="Filter by status">
            <option value="all">Any status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </Select>
          <button
            type="button"
            onClick={() => downloadCsv('users.csv', filtered as unknown as Record<string, unknown>[])}
            disabled={filtered.length === 0}
            className="hidden h-9 items-center gap-2 rounded-lg bg-brand-700 px-3.5 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-40 xl:inline-flex"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title={data.length === 0 ? 'No users yet' : 'No users match your filters'}
          description={data.length === 0 ? 'New registrations will appear here.' : 'Try a different search or filter.'}
        />
      ) : (
        <>
          {/* Desktop / tablet table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/60 text-xs font-medium text-zinc-500">
                  <th scope="col" className="px-5 py-3 font-medium">User</th>
                  <th scope="col" className="px-4 py-3 font-medium">Role</th>
                  <th scope="col" className="hidden px-4 py-3 font-medium lg:table-cell">Phone</th>
                  <th scope="col" className="px-4 py-3 font-medium">Status</th>
                  <th scope="col" className="px-4 py-3 font-medium">Verification</th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {rows.map((u) => (
                  <tr key={u.user_account_id} className="transition-colors hover:bg-zinc-50/70">
                    <td className="px-5 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar name={u.username || u.email} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-zinc-900">{u.username || '—'}</p>
                          <p className="truncate text-zinc-500">{u.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize text-zinc-700">{u.role || '—'}</span>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 tabular-nums text-zinc-600 lg:table-cell">
                      {u.contact_number || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge active={u.is_active} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <VerifiedBadge verified={u.verified} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-right text-zinc-600">
                      <LocalDate value={u.created_date} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="divide-y divide-zinc-100 md:hidden">
            {rows.map((u) => (
              <li key={u.user_account_id} className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar name={u.username || u.email} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate font-medium text-zinc-900">{u.username || '—'}</p>
                      <StatusBadge active={u.is_active} />
                    </div>
                    <p className="truncate text-sm text-zinc-500">{u.email || '—'}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500">
                      {u.role && <span className="capitalize text-zinc-700">{u.role}</span>}
                      {u.contact_number && (
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <Phone className="h-3.5 w-3.5" />
                          {u.contact_number}
                        </span>
                      )}
                      {u.verified && (
                        <span className="inline-flex items-center gap-1 text-blue-700">
                          <BadgeCheck className="h-3.5 w-3.5" /> Verified
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">
                      Joined <LocalDate value={u.created_date} />
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <Pagination page={current} pageCount={pageCount} total={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </Card>
  );
}
