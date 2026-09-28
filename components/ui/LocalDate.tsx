'use client';

import React from 'react';

interface LocalDateProps {
  value?: string | Date | null;
  withTime?: boolean;
  className?: string;
}

// Formats in the viewer's own locale/timezone. The server render may differ slightly,
// so hydration warnings for the text are suppressed.
export default function LocalDate({ value, withTime, className }: LocalDateProps) {
  if (!value) return <span className={className}>—</span>;
  const d = new Date(value);
  if (isNaN(d.getTime())) return <span className={className}>—</span>;
  return (
    <time dateTime={d.toISOString()} className={className} suppressHydrationWarning>
      {d.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
      })}
    </time>
  );
}
