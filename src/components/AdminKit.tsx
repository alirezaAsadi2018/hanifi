import { useMemo, useState, type ReactNode } from "react";
import Icon from "./Icon";
import { Button, formatNumber } from "./ui";

// ─────────────────────────────────────────────
// DataTable: search + filter chips + pagination + row click
// ─────────────────────────────────────────────

export type Column<T> = { key: string; label: string; render: (row: T) => ReactNode; className?: string; hideOnMobile?: boolean };

export function DataTable<T extends { id: number | string }>({ rows, columns, searchText, filters, filterOf, onRow, pageSize = 8, empty = "موردی پیدا نشد", toolbar }: {
  rows: T[];
  columns: Column<T>[];
  searchText: (row: T) => string;
  filters?: string[];
  filterOf?: (row: T) => string;
  onRow?: (row: T) => void;
  pageSize?: number;
  empty?: string;
  toolbar?: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("همه");
  const [page, setPage] = useState(0);
  const filtered = useMemo(
    () => rows.filter((row) => (!query.trim() || searchText(row).includes(query.trim())) && (filter === "همه" || !filterOf || filterOf(row) === filter)),
    [rows, query, filter, searchText, filterOf],
  );
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages - 1);
  const visible = filtered.slice(current * pageSize, current * pageSize + pageSize);

  return (
    <div className="admin-card p-0">
      <div className="flex flex-wrap items-center gap-2 border-b border-line p-3 sm:p-4">
        <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-line bg-canvas px-3 text-sm focus-within:border-brand sm:max-w-xs">
          <Icon name="search" size="sm" />
          <input className="min-w-0 flex-1 bg-transparent outline-none" placeholder="جستجو..." value={query} onChange={(event) => { setQuery(event.target.value); setPage(0); }} />
        </label>
        {filters && (
          <div className="flex gap-1 overflow-x-auto">
            {["همه", ...filters].map((item) => (
              <Button key={item} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold ${filter === item ? "bg-brand text-white" : "bg-canvas text-muted hover:text-ink"}`} onClick={() => { setFilter(item); setPage(0); }}>{item}</Button>
            ))}
          </div>
        )}
        {toolbar && <div className="mr-auto">{toolbar}</div>}
      </div>
      <div className="overflow-x-auto">
        <table className="admin-table">
          <thead><tr>{columns.map((column) => <th key={column.key} className={`${column.hideOnMobile ? "hidden md:table-cell" : ""} ${column.className ?? ""}`}>{column.label}</th>)}</tr></thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id} className={onRow ? "cursor-pointer" : ""} onClick={() => onRow?.(row)}>
                {columns.map((column) => <td key={column.key} className={`${column.hideOnMobile ? "hidden md:table-cell" : ""} ${column.className ?? ""}`}>{column.render(row)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        {!visible.length && <div className="p-10 text-center text-sm text-muted">{empty}</div>}
      </div>
      <div className="flex items-center justify-between border-t border-line p-3 text-xs text-muted">
        <span>{formatNumber(filtered.length)} مورد</span>
        <div className="flex items-center gap-1">
          <Button className="pager" disabled={current === 0} onClick={() => setPage(current - 1)} label="صفحه قبل"><Icon name="back" size="sm" /></Button>
          <span className="px-2 font-bold">{formatNumber(current + 1)} از {formatNumber(pages)}</span>
          <Button className="pager" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} label="صفحه بعد"><Icon name="arrow" size="sm" /></Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Single-series column chart (one hue; hover tooltip; table fallback for screen readers)
// ─────────────────────────────────────────────

export function ColumnChart({ data, unit, height = 200 }: { data: { label: string; value: number }[]; unit: string; height?: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value));
  const step = niceStep(max);
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const peak = data.findIndex((d) => d.value === max);

  return (
    <div>
      <div className="relative flex gap-2" style={{ height }}>
        <div className="relative w-10 shrink-0 text-[10px] text-faint">
          {ticks.map((tick) => <span key={tick} className="absolute left-0 -translate-y-1/2" style={{ bottom: `${(tick / top) * 100}%`, transform: "translateY(50%)" }}>{formatNumber(tick)}</span>)}
        </div>
        <div className="relative flex-1">
          {ticks.map((tick) => <div key={tick} className="absolute inset-x-0 border-t border-line" style={{ bottom: `${(tick / top) * 100}%` }} />)}
          <div className="absolute inset-0 flex items-end justify-around gap-[2px]">
            {data.map((d, i) => (
              <div key={d.label} className="relative flex h-full flex-1 items-end justify-center" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                {i === peak && <span className="absolute text-[10px] font-black text-ink" style={{ bottom: `calc(${(d.value / top) * 100}% + 4px)` }}>{formatNumber(d.value)}</span>}
                <div className={`w-full max-w-6 rounded-t-[4px] transition-colors ${hover === null || hover === i ? "bg-ink" : "bg-ink/30"}`} style={{ height: `${(d.value / top) * 100}%` }} />
                {hover === i && (
                  <div className="chart-tip" style={{ bottom: `calc(${(d.value / top) * 100}% + 22px)` }}>
                    <div className="text-faint">{d.label}</div><div className="font-black">{formatNumber(d.value)} {unit}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mr-12 mt-2 flex justify-around text-[10px] text-muted">{data.map((d) => <span key={d.label} className="flex-1 truncate text-center">{d.label}</span>)}</div>
      <table className="sr-only"><caption>داده نمودار ({unit})</caption><tbody>{data.map((d) => <tr key={d.label}><th>{d.label}</th><td>{d.value}</td></tr>)}</tbody></table>
    </div>
  );
}

function niceStep(max: number) {
  const raw = max / 4;
  const power = 10 ** Math.floor(Math.log10(raw));
  const unit = raw / power;
  return (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10) * power;
}

export function Kpi({ label, value, hint, tone = "brand", icon }: { label: string; value: string; hint?: string; tone?: "brand" | "amber" | "red"; icon: Parameters<typeof Icon>[0]["name"] }) {
  const colors = { brand: "bg-canvas text-ink", amber: "bg-amber-50 text-amber-700", red: "bg-red-50 text-red-600" }[tone];
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between"><span className="text-xs font-bold text-muted">{label}</span><span className={`flex size-9 items-center justify-center rounded-xl ${colors}`}><Icon name={icon} size="sm" /></span></div>
      <div className="mt-3 truncate text-2xl font-black">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </div>
  );
}

export function Pill({ children, tone = "gray" }: { children: ReactNode; tone?: "green" | "amber" | "red" | "gray" | "blue" | "violet" }) {
  const map = { green: "bg-green-50 text-green-700", amber: "bg-amber-50 text-amber-700", red: "bg-red-50 text-red-600", gray: "bg-canvas text-muted", blue: "bg-sky-50 text-sky-700", violet: "bg-violet-50 text-violet-700" };
  return <span className={`status-pill ${map[tone]}`}>{children}</span>;
}

/** Downloads rows as a UTF-8 CSV (with BOM so Excel shows Persian correctly). */
export function downloadCsv(filename: string, header: string[], rows: (string | number)[][]) {
  const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  const csv = "﻿" + [header, ...rows].map((row) => row.map(escape).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
