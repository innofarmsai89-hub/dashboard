'use client';

import React, { useEffect, useRef } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import 'tabulator-tables/dist/css/tabulator_modern.min.css';

import { 
  CheckCircle2, 
  XCircle, 
  Download,
  Calendar,
  Mail,
  User,
  Phone,
  ShieldCheck
} from 'lucide-react';
import { renderToString } from 'react-dom/server';

interface UserTableProps {
  data: any[];
}

// Custom formatters using Lucide icons
const statusFormatter = (cell: any) => {
  const value = cell.getValue();
  const icon = value 
    ? renderToString(<CheckCircle2 className="h-4 w-4 text-emerald-500" />)
    : renderToString(<XCircle className="h-4 w-4 text-zinc-300" />);
  return `<div class="flex items-center justify-center">${icon}</div>`;
};

const verifiedFormatter = (cell: any) => {
  const value = cell.getValue();
  return value 
    ? `<div class="flex items-center justify-center">${renderToString(<ShieldCheck className="h-4 w-4 text-blue-500" />)}</div>`
    : `<div class="flex items-center justify-center">${renderToString(<CheckCircle2 className="h-4 w-4 text-zinc-200" />)}</div>`;
};

const dateFormatter = (cell: any) => {
  const val = cell.getValue();
  if (!val) return '';
  const date = new Date(val);
  return `
    <div class="flex items-center gap-2">
      <span class="text-zinc-900 font-medium">${date.toLocaleDateString()}</span>
    </div>
  `;
};

export default function UserTable({ data }: UserTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const tabulatorRef = useRef<Tabulator | null>(null);

  useEffect(() => {
    if (tableRef.current && data.length > 0) {
      tabulatorRef.current = new Tabulator(tableRef.current, {
        data: data,
        layout: "fitColumns",
        responsiveLayout: "collapse",
        pagination: true,
        paginationMode: "local",
        paginationSize: 10,
        paginationSizeSelector: [10, 25, 50, 100],
        movableColumns: true,
        placeholder: "No Data Available",
        columns: [
          { 
            title: "NAME", 
            field: "username", 
            width: 200, 
            headerFilter: "input",
            formatter: (cell: any) => `<span class="font-semibold text-zinc-900">${cell.getValue()}</span>`
          },
          { 
            title: "EMAIL", 
            field: "email", 
            width: 250, 
            headerFilter: "input",
            formatter: (cell: any) => `<span class="text-zinc-500">${cell.getValue()}</span>`
          },
          { 
            title: "ROLE", 
            field: "role", 
            width: 150, 
            headerFilter: "list", 
            headerFilterParams: { valuesLookup: "active", clearable: true },
            formatter: (cell: any) => `
              <span class="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                ${cell.getValue()}
              </span>
            `
          },
          { title: "PHONE", field: "contact_number", width: 180, formatter: (cell: any) => `<span class="text-zinc-500 tabular-nums">${cell.getValue() || '-'}</span>` },
          { 
            title: "STATUS", 
            field: "is_active", 
            width: 100, 
            formatter: statusFormatter, 
            hozAlign: "center",
            headerFilter: "tickCross",
            headerFilterParams: { tristate: true }
          },
          { 
            title: "VERIFIED", 
            field: "verified", 
            width: 100, 
            formatter: verifiedFormatter, 
            hozAlign: "center" 
          },
          { 
            title: "JOINED", 
            field: "created_date", 
            width: 150, 
            formatter: dateFormatter
          },
        ],
      });
    }

    return () => {
      if (tabulatorRef.current) {
        tabulatorRef.current.destroy();
        tabulatorRef.current = null;
      }
    };
  }, [data]);

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between border-b border-zinc-100 p-6">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Website Users</h2>
          <p className="mt-1 text-sm text-zinc-500 font-medium">Manage and monitor user access levels</p>
        </div>
        <button 
          onClick={() => tabulatorRef.current?.download("csv", "users.csv")}
          className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-zinc-800 transition-all duration-200"
        >
          <Download className="h-4 w-4" />
          Export Dataset
        </button>
      </div>
      <div className="p-4">
        <div ref={tableRef} className="tabulator-custom" />
      </div>
      <style jsx global>{`
        .tabulator {
          border: none !important;
          background-color: transparent !important;
          font-family: inherit !important;
        }
        .tabulator-header {
          background-color: transparent !important;
          border-bottom: 1px solid #f4f4f5 !important;
          color: #a1a1aa !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
          font-size: 0.7rem !important;
        }
        .tabulator-col {
          background-color: transparent !important;
          border: none !important;
        }
        .tabulator-col-content {
          padding: 12px 16px !important;
        }
        .tabulator-header-filter input {
          margin-top: 8px !important;
          padding: 6px 10px !important;
          border-radius: 8px !important;
          border: 1px solid #f4f4f5 !important;
          background: #fafafa !important;
          font-size: 0.75rem !important;
          transition: all 0.2s !important;
        }
        .tabulator-header-filter input:focus {
          border-color: #e4e4e7 !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 2px rgba(0,0,0,0.02) !important;
        }
        .tabulator-row {
          background-color: transparent !important;
          border-bottom: 1px solid #fafafa !important;
          transition: all 0.2s !important;
          min-height: 64px !important;
          display: flex !important;
          align-items: center !important;
        }
        .tabulator-row.tabulator-selectable:hover {
          background-color: #fafafa !important;
        }
        .tabulator-cell {
          padding: 16px !important;
          border: none !important;
          display: flex !important;
          align-items: center !important;
        }
        .tabulator-footer {
          background-color: transparent !important;
          border-top: 1px solid #f4f4f5 !important;
          padding: 12px !important;
          color: #71717a !important;
        }
        .tabulator-footer .tabulator-paginator {
          color: inherit !important;
          font-weight: 600 !important;
        }
        .tabulator-page {
          border: 1px solid #f4f4f5 !important;
          background: #ffffff !important;
          border-radius: 8px !important;
          margin: 0 2px !important;
          padding: 6px 12px !important;
          transition: all 0.2s !important;
        }
        .tabulator-page.active {
          background: #18181b !important;
          color: #ffffff !important;
          border-color: #18181b !important;
        }
        .tabulator-placeholder-contents {
          color: #a1a1aa !important;
          font-weight: 500 !important;
        }
      `}</style>
    </div>
  );
}
