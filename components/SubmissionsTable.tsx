'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Building2, ChevronRight, Globe, Mail, MessageSquare, Phone, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import LocalDate from '@/components/ui/LocalDate';
import { Avatar, Badge, Card, EmptyState, Pagination, SearchInput } from '@/components/ui/primitives';

export interface SubmissionItem {
  _id: string;
  type: 'contact' | 'newsletter' | 'other';
  fullName?: string;
  email?: string;
  contactNumber?: string;
  company?: string;
  service?: string;
  source?: string;
  message?: string;
  /** ISO timestamp, or undefined when the document has no date. */
  date?: string;
}

type Tab = 'all' | 'contact' | 'newsletter';
const PAGE_SIZE = 12;

function TypeBadge({ type }: { type: SubmissionItem['type'] }) {
  return type === 'newsletter' ? <Badge tone="green">Newsletter</Badge> : <Badge tone="blue">Contact</Badge>;
}

function summary(item: SubmissionItem) {
  return item.message || (item.type === 'newsletter' ? 'Subscribed to the newsletter' : 'No message provided');
}

export default function SubmissionsTable({ data }: { data: SubmissionItem[] }) {
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<SubmissionItem | null>(null);

  const counts = useMemo(
    () => ({
      all: data.length,
      contact: data.filter((d) => d.type === 'contact').length,
      newsletter: data.filter((d) => d.type === 'newsletter').length,
    }),
    [data]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return data.filter((item) => {
      if (tab !== 'all' && item.type !== tab) return false;
      if (!term) return true;
      return [item.fullName, item.email, item.contactNumber, item.company, item.service, item.source, item.message].some(
        (v) => v?.toLowerCase().includes(term)
      );
    });
  }, [data, tab, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'contact', label: 'Contact' },
    { id: 'newsletter', label: 'Newsletter' },
  ];

  return (
    <Card>
      <div className="flex flex-col gap-3 border-b border-zinc-200 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Submission type" className="inline-flex w-full rounded-lg bg-zinc-100 p-1 sm:w-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              onClick={() => { setTab(t.id); setPage(1); }}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors sm:flex-none',
                tab === t.id ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'
              )}
            >
              {t.label}
              <span className="rounded-full bg-zinc-200/70 px-1.5 text-xs tabular-nums text-zinc-600">{counts[t.id]}</span>
            </button>
          ))}
        </div>
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Search name, email, company, message"
          className="w-full lg:w-80"
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title={data.length === 0 ? 'No submissions yet' : 'No submissions match'}
          description={data.length === 0 ? 'Website form entries will appear here.' : 'Try another tab or search term.'}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full table-fixed text-left text-sm">
              <colgroup>
                <col className="w-[26%]" />
                <col className="w-[11%]" />
                <col className="w-[18%]" />
                <col />
                <col className="w-[15%]" />
                <col className="w-10" />
              </colgroup>
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/60 text-xs text-zinc-500">
                  <th scope="col" className="px-5 py-3 font-medium">Contact</th>
                  <th scope="col" className="px-4 py-3 font-medium">Type</th>
                  <th scope="col" className="px-4 py-3 font-medium">Company / Service</th>
                  <th scope="col" className="px-4 py-3 font-medium">Message</th>
                  <th scope="col" className="px-4 py-3 font-medium">Received</th>
                  <th scope="col" className="py-3 pr-4"><span className="sr-only">Open</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {rows.map((item) => (
                  <tr
                    key={item._id}
                    onClick={() => setSelected(item)}
                    className="group cursor-pointer transition-colors hover:bg-zinc-50/70"
                  >
                    <td className="px-5 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar name={item.fullName || item.email} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-zinc-900">{item.fullName}</p>
                          <p className="truncate text-zinc-500">{item.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><TypeBadge type={item.type} /></td>
                    <td className="px-4 py-3">
                      <p className="truncate text-zinc-900">{item.company || '—'}</p>
                      {item.service && <p className="truncate text-zinc-500">{item.service}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="line-clamp-2 text-zinc-600">{summary(item)}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      <LocalDate value={item.date} withTime />
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected(item);
                        }}
                        aria-label={`View submission from ${item.fullName}`}
                        className="rounded-md p-1 text-zinc-400 group-hover:text-zinc-700"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / tablet list */}
          <ul className="divide-y divide-zinc-100 lg:hidden">
            {rows.map((item) => (
              <li key={item._id}>
                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-zinc-50/70"
                >
                  <Avatar name={item.fullName || item.email} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate font-medium text-zinc-900">{item.fullName}</p>
                      <TypeBadge type={item.type} />
                    </div>
                    <p className="truncate text-sm text-zinc-500">{item.email || '—'}</p>
                    <p className="mt-1.5 line-clamp-2 text-sm text-zinc-600">{summary(item)}</p>
                    <p className="mt-1.5 text-xs text-zinc-400">
                      <LocalDate value={item.date} withTime />
                      {item.company && <> · {item.company}</>}
                    </p>
                  </div>
                  <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-zinc-300" />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <Pagination page={current} pageCount={pageCount} total={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />

      {selected && <SubmissionDetail item={selected} onClose={() => setSelected(null)} />}
    </Card>
  );
}

function DetailRow({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
      <div className="min-w-0 flex-1">
        <dt className="text-xs text-zinc-500">{label}</dt>
        <dd className="mt-0.5 break-words text-sm text-zinc-900">{children}</dd>
      </div>
    </div>
  );
}

function SubmissionDetail({ item, onClose }: { item: SubmissionItem; onClose: () => void }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="submission-title">
      <div className="animate-fade-in absolute inset-0 bg-zinc-950/40" onClick={onClose} />
      {/* Bottom sheet on mobile, right-hand panel on larger screens */}
      <div className="animate-slide-up absolute inset-x-0 bottom-0 flex max-h-[90dvh] flex-col rounded-t-2xl bg-white shadow-xl sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[440px] sm:rounded-none">
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-zinc-200 sm:hidden" aria-hidden />
        <div className="flex items-start justify-between gap-3 border-b border-zinc-200 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={item.fullName || item.email} className="h-10 w-10" />
            <div className="min-w-0">
              <h2 id="submission-title" className="truncate text-base font-semibold text-zinc-900">
                {item.fullName}
              </h2>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
                <TypeBadge type={item.type} />
                <LocalDate value={item.date} withTime />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-2">
          <dl className="divide-y divide-zinc-100">
            <DetailRow icon={Mail} label="Email">
              {item.email ? (
                <a href={`mailto:${item.email}`} className="text-brand-700 hover:underline">{item.email}</a>
              ) : '—'}
            </DetailRow>
            <DetailRow icon={Phone} label="Phone">
              {item.contactNumber ? (
                <a href={`tel:${item.contactNumber}`} className="tabular-nums text-brand-700 hover:underline">
                  {item.contactNumber}
                </a>
              ) : '—'}
            </DetailRow>
            <DetailRow icon={Building2} label="Company">{item.company || '—'}</DetailRow>
            <DetailRow icon={MessageSquare} label="Service / interest">{item.service || 'General inquiry'}</DetailRow>
            <DetailRow icon={Globe} label="Source">{item.source || 'Website'}</DetailRow>
          </dl>

          <div className="mb-4 mt-2">
            <p className="text-xs text-zinc-500">Message</p>
            <p className="mt-1.5 whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm leading-relaxed text-zinc-800">
              {item.message || 'No written message attached.'}
            </p>
          </div>
          <p className="pb-4 font-mono text-[11px] text-zinc-400">ID {item._id}</p>
        </div>

        {item.email && (
          <div className="border-t border-zinc-200 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <a
              href={`mailto:${item.email}`}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand-700 text-sm font-medium text-white hover:bg-brand-800"
            >
              <Mail className="h-4 w-4" />
              Reply by email
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
