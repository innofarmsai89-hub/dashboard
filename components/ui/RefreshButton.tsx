'use client';

import React, { useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

// With intervalMs set, the page re-fetches its server data on that interval while the tab is visible,
// and immediately when the tab becomes visible again.
export default function RefreshButton({ intervalMs }: { intervalMs?: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!intervalMs) return;
    const refresh = () => {
      if (document.visibilityState === 'visible') startTransition(() => router.refresh());
    };
    const id = window.setInterval(refresh, intervalMs);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [intervalMs, router]);

  return (
    <div className="flex items-center gap-3">
      {intervalMs && (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-700" title={`Auto-updates every ${intervalMs / 1000}s`}>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" />
          </span>
          Live
        </span>
      )}
      <button
        type="button"
        onClick={() => startTransition(() => router.refresh())}
        disabled={pending}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 text-sm font-medium text-zinc-700 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors hover:bg-zinc-50 disabled:opacity-60"
      >
        <RefreshCw className={cn('h-4 w-4', pending && 'animate-spin')} />
        {pending ? 'Refreshing…' : 'Refresh'}
      </button>
    </div>
  );
}
