"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Crown,
  Search,
  ShieldOff,
} from "lucide-react";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchDkp,
  type ApiDkpRow,
  type DkpColumn,
  type DkpListResponse,
  type DkpQuery,
} from "@/lib/api";
import { cn } from "@/lib/utils";

/* ── value formatting ─────────────────────────────────────────────── */

/**
 * Display a number in the smallest faithful form:
 *   2 200 000 000  → "2.2B"             (clean → abbreviate)
 *   2 215 184 198  → "2 215 184 198"    (no clean abbrev → show full)
 *
 * Tries 0, 1, then 2 decimals at the largest applicable unit and only
 * accepts the abbreviation when it round-trips to the original integer.
 * Otherwise falls back to digit-grouped display so no precision is lost.
 */
const formatBigNum = (raw: string | number | null | undefined) => {
  if (raw == null || raw === "") return "—";
  const n = Number(raw);
  if (!Number.isFinite(n)) return String(raw);
  if (n === 0) return "0";

  const abs = Math.abs(n);
  const units: Array<readonly [string, number]> = [
    ["T", 1e12],
    ["B", 1e9],
    ["M", 1e6],
    ["K", 1e3],
  ];
  for (const [letter, unit] of units) {
    if (abs < unit) continue;
    for (const decimals of [0, 1, 2]) {
      const factor = 10 ** decimals;
      const rounded = Math.round((n / unit) * factor) / factor;
      if (Math.abs(rounded * unit - n) < 0.5) {
        const str =
          decimals === 0
            ? String(rounded)
            : rounded.toFixed(decimals).replace(/\.?0+$/, "");
        return `${str}${letter}`;
      }
    }
    break;
  }
  const sign = n < 0 ? "-" : "";
  const grouped = Math.round(Math.abs(n))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return sign + grouped;
};

const formatCellValue = (
  value: string | number | null | undefined,
  type: DkpColumn["type"],
): string => {
  if (value == null || value === "") return "—";
  switch (type) {
    case "number":
      return formatBigNum(value);
    case "percent": {
      const n = Number(value);
      return Number.isFinite(n) ? `${n}%` : String(value);
    }
    default:
      return String(value);
  }
};

/* ── component ────────────────────────────────────────────────────── */

export function DkpStandings() {
  const [query, setQuery] = React.useState<DkpQuery>({
    sortBy: "rank",
    sortOrder: "asc",
    page: 1,
    pageSize: 10,
  });
  const [searchInput, setSearchInput] = React.useState("");
  const [data, setData] = React.useState<DkpListResponse | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setQuery((q) => ({ ...q, search: searchInput || undefined, page: 1 }));
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchDkp(query)
      .then((r) => {
        if (!cancelled) setData(r);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const columns = data?.columns ?? [];
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const page = data?.page ?? 1;

  // Empty state — nothing has been uploaded yet (no scan / no columns)
  const noScan = !loading && (!data?.scan || columns.length === 0);
  if (noScan && !query.search && !query.alliance) {
    return <DkpEmptyState />;
  }

  const toggleSort = (key: string) => {
    setQuery((q) => ({
      ...q,
      sortBy: key,
      sortOrder:
        q.sortBy === key
          ? q.sortOrder === "asc"
            ? "desc"
            : "asc"
          : "asc",
      page: 1,
    }));
  };

  return (
    <AnimatedSection className="relative pt-10 pb-20 md:pt-12 md:pb-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {total > 0 && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="font-display tracking-[0.3em] uppercase text-xs text-muted whitespace-nowrap">
              {total} governors tracked
            </div>
            {data?.scan && (
              <div className="text-[11px] tracking-[0.2em] uppercase text-muted/70">
                Last scan ·{" "}
                {new Date(data.scan.uploadedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by nickname or governor ID…"
              className="h-11 pl-10 pr-3 w-full bg-background-deep/80 border border-border-bronze focus:outline-none focus:border-accent text-foreground placeholder:text-muted/60 text-sm font-display tracking-[0.05em]"
            />
          </div>
          <select
            value={query.alliance ?? ""}
            onChange={(e) =>
              setQuery((q) => ({
                ...q,
                alliance: e.target.value || undefined,
                page: 1,
              }))
            }
            className="h-11 px-3 bg-background-deep/80 border border-border-bronze focus:outline-none focus:border-accent text-foreground text-sm font-display tracking-[0.1em] uppercase md:w-44"
          >
            <option value="">All alliances</option>
            {data?.filters.alliances.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <select
            value={String(query.pageSize ?? 10)}
            onChange={(e) =>
              setQuery((q) => ({
                ...q,
                pageSize: Number(e.target.value),
                page: 1,
              }))
            }
            className="h-11 px-3 bg-background-deep/80 border border-border-bronze focus:outline-none focus:border-accent text-foreground text-sm font-display tracking-[0.1em] uppercase md:w-36"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        </div>

        {/* Mobile: card layout. Sort pills on top, cards below. Cards
            iterate over columns dynamically, so any new xlsx column shape
            renders without code changes. */}
        <div className="md:hidden">
          {columns.length > 0 && (
            <MobileSortPills
              columns={columns}
              sortBy={query.sortBy ?? "rank"}
              sortOrder={query.sortOrder ?? "asc"}
              onToggle={toggleSort}
            />
          )}
          <div className="mt-3 space-y-3">
            {loading && items.length === 0 && (
              <div className="text-center text-muted py-12 border border-border-bronze/60 bg-card/40">
                Loading…
              </div>
            )}
            {!loading && items.length === 0 && (
              <div className="text-center text-muted py-12 border border-border-bronze/60 bg-card/40">
                No governors match the current filters.
              </div>
            )}
            {items.map((row) => (
              <DkpCard key={row.id} row={row} columns={columns} />
            ))}
          </div>
        </div>

        <Card className="hidden md:block hover:border-accent/40 transition-colors">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => {
                  const active = query.sortBy === c.key;
                  const Icon = !active
                    ? ArrowUpDown
                    : query.sortOrder === "asc"
                      ? ArrowUp
                      : ArrowDown;
                  const align: "right" | "left" =
                    c.type === "number" || c.type === "percent"
                      ? "right"
                      : "left";
                  return (
                    <TableHead
                      key={c.key}
                      className={cn(
                        "whitespace-nowrap select-none",
                        align === "right" && "text-right",
                        c.sortable
                          ? "cursor-pointer hover:text-accent-bright"
                          : "cursor-default",
                      )}
                      onClick={() => c.sortable && toggleSort(c.key)}
                    >
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5",
                          align === "right" && "flex-row-reverse",
                        )}
                      >
                        {c.label}
                        {c.sortable && (
                          <Icon
                            className={cn(
                              "h-3 w-3",
                              active ? "text-accent" : "text-muted/50",
                            )}
                          />
                        )}
                      </span>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={Math.max(1, columns.length)}
                    className="text-center text-muted py-12"
                  >
                    Loading…
                  </TableCell>
                </TableRow>
              )}
              {!loading && items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={Math.max(1, columns.length)}
                    className="text-center text-muted py-12"
                  >
                    No governors match the current filters.
                  </TableCell>
                </TableRow>
              )}
              {items.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((c) => (
                    <DkpCell key={c.key} column={c} row={row} />
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-xs uppercase tracking-[0.3em] text-muted font-display">
              Page {page} / {totalPages} · {total} rows
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <PageButton
                disabled={page <= 1}
                onClick={() => setQuery((q) => ({ ...q, page: page - 1 }))}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </PageButton>
              {buildPageWindow(page, totalPages).map((entry, i) =>
                entry === "ellipsis" ? (
                  <span
                    key={`e-${i}`}
                    aria-hidden
                    className="inline-flex h-9 min-w-9 items-center justify-center text-muted/60 font-display text-sm select-none"
                  >
                    …
                  </span>
                ) : (
                  <PageButton
                    key={entry}
                    active={entry === page}
                    onClick={() => setQuery((q) => ({ ...q, page: entry }))}
                    aria-current={entry === page ? "page" : undefined}
                    aria-label={`Page ${entry}`}
                  >
                    {entry}
                  </PageButton>
                ),
              )}
              <PageButton
                disabled={page >= totalPages}
                onClick={() => setQuery((q) => ({ ...q, page: page + 1 }))}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </PageButton>
            </div>
          </div>
        )}
      </div>
    </AnimatedSection>
  );
}

/* ── cell rendering ───────────────────────────────────────────────── */

function DkpCell({ column, row }: { column: DkpColumn; row: ApiDkpRow }) {
  // Native cells get bespoke rendering (rank badge, governor block, alliance chip).
  if (column.key === "rank") {
    return (
      <TableCell className="whitespace-nowrap">
        <RankBadge rank={row.rank} />
      </TableCell>
    );
  }
  if (column.key === "nickname") {
    return (
      <TableCell className="whitespace-nowrap">
        <div className="font-display text-base tracking-[0.1em] uppercase text-foreground">
          {row.nickname}
        </div>
        <div className="text-[11px] text-muted mt-0.5 tracking-[0.15em] uppercase">
          ID {row.governorId}
        </div>
      </TableCell>
    );
  }
  if (column.key === "alliance") {
    return (
      <TableCell className="whitespace-nowrap">
        <span className="inline-flex items-center px-2 h-6 border border-accent/40 text-accent text-xs font-display tracking-[0.15em] uppercase">
          {row.alliance || "—"}
        </span>
      </TableCell>
    );
  }

  // Generic cell — formatter chosen by column.type
  const value = row[column.key];
  const isNumeric = column.type === "number" || column.type === "percent";
  const isDkp = /^dkp(\s*score)?$/i.test(column.label);
  return (
    <TableCell
      className={cn(
        "whitespace-nowrap tracking-[0.05em]",
        isNumeric ? "text-right" : "text-left",
        isDkp
          ? "font-display text-lg text-accent-bright"
          : isNumeric
            ? "font-display text-foreground"
            : "text-foreground",
      )}
    >
      {formatCellValue(value, column.type)}
    </TableCell>
  );
}

/* ── pagination window helper ─────────────────────────────────────── */

function buildPageWindow(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const out: (number | "ellipsis")[] = [1];
  if (current <= 4) {
    out.push(2, 3, 4, 5, "ellipsis", total);
  } else if (current >= total - 3) {
    out.push(
      "ellipsis",
      total - 4,
      total - 3,
      total - 2,
      total - 1,
      total,
    );
  } else {
    out.push("ellipsis", current - 1, current, current + 1, "ellipsis", total);
  }
  return out;
}

function PageButton({
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-9 min-w-9 px-3 items-center justify-center font-display text-sm tracking-[0.1em] uppercase transition-colors border",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40 disabled:cursor-not-allowed",
        active
          ? "bg-gradient-to-b from-accent-bright to-accent text-background-deep border-accent shadow-[inset_0_1px_0_rgba(255,200,150,0.4)]"
          : "border-border-bronze/70 text-muted hover:text-accent hover:border-accent/60",
        className,
      )}
      {...props}
    />
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex h-9 w-9 items-center justify-center bg-gradient-to-b from-accent-bright to-accent text-background-deep shadow-[inset_0_1px_0_rgba(255,200,150,0.4)]">
        <Crown className="h-4 w-4" />
      </span>
    );
  }
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center border border-accent/50 text-accent font-display text-sm tracking-[0.05em]">
      {rank}
    </span>
  );
}

/* ── mobile card layout ──────────────────────────────────────────── */

const NATIVE_KEYS = new Set(["rank", "nickname", "governorId", "alliance"]);
const DKP_LABEL_RE = /\bdkp(\s*score)?\b/i;

/**
 * Curated whitelist for the mobile sort pills. The DKP table itself is
 * fully dynamic (any xlsx column type renders), but exposing every column
 * as a sort pill produces noise — long-tail metrics like Trade Ratio /
 * Honor Points aren't stable across scans and overload the filter row.
 *
 * Each regex matches the column label case-insensitively. Order = display
 * order. A pill only appears if a current-scan column matches.
 */
const PRIORITY_PILL_LABEL_RES: RegExp[] = [
  /\bdkp(\s*score)?\b/i, //   DKP / DKP Score
  /\bacclaim\b/i, //          Acclaim
  /\bt4\s*kill/i, //          T4 Kills
  /\bt5\s*kill/i, //          T5 Kills
  /\bt4\s*\+\s*t5/i, //       T4+T5 KP
  /\b(?:all\s*)?dead/i, //    All Deads
];

function isPriorityPill(col: DkpColumn): boolean {
  return PRIORITY_PILL_LABEL_RES.some((re) => re.test(col.label));
}

function DkpCard({
  row,
  columns,
}: {
  row: ApiDkpRow;
  columns: DkpColumn[];
}) {
  // Strip the four "native" identity columns — they're rendered in the
  // header. Everything else is generic: label + formatted value.
  const dataCols = columns.filter((c) => !NATIVE_KEYS.has(c.key));
  // Find a "DKP" column to highlight — fuzzy label match so it works for
  // "DKP", "DKP Score", "Dkp" etc. without code changes per scan.
  const dkpCol = dataCols.find((c) => DKP_LABEL_RE.test(c.label));
  const restCols = dataCols.filter((c) => c !== dkpCol);

  return (
    <div className="relative border border-border-bronze/60 bg-card/70 backdrop-blur-sm p-4">
      <div
        className="absolute inset-0 bg-grid opacity-[0.12] pointer-events-none"
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <RankBadge rank={row.rank} />
          <div className="min-w-0">
            <div className="font-display text-base tracking-[0.08em] uppercase text-foreground truncate">
              {row.nickname}
            </div>
            <div className="text-[10px] text-muted mt-0.5 tracking-[0.15em] uppercase">
              ID {row.governorId}
            </div>
          </div>
        </div>
        {row.alliance && (
          <span className="shrink-0 inline-flex items-center px-2 h-6 border border-accent/40 text-accent text-[11px] font-display tracking-[0.12em] uppercase">
            {row.alliance}
          </span>
        )}
      </div>

      {dkpCol && (
        <div className="relative mt-4 flex items-baseline justify-between gap-3 border-t border-border-bronze/40 pt-3">
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted">
            {dkpCol.label}
          </span>
          <span className="font-display text-2xl text-accent-bright tracking-[0.04em]">
            {formatCellValue(row[dkpCol.key], dkpCol.type)}
          </span>
        </div>
      )}

      {restCols.length > 0 && (
        <dl className="relative mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          {restCols.map((c) => (
            <div
              key={c.key}
              className="flex items-baseline justify-between gap-2 min-w-0"
            >
              <dt className="text-[10px] uppercase tracking-[0.15em] text-muted truncate">
                {c.label}
              </dt>
              <dd className="font-display tracking-[0.04em] text-foreground shrink-0">
                {formatCellValue(row[c.key], c.type)}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function MobileSortPills(props: {
  columns: DkpColumn[];
  sortBy: string;
  sortOrder: "asc" | "desc";
  onToggle: (key: string) => void;
}) {
  // Stable curated subset — see PRIORITY_PILL_LABEL_RES rationale above.
  // Sorted by the priority array order so DKP Score is always first.
  const priority = props.columns.filter(
    (c) => c.sortable && isPriorityPill(c),
  );
  priority.sort((a, b) => {
    const ai = PRIORITY_PILL_LABEL_RES.findIndex((re) => re.test(a.label));
    const bi = PRIORITY_PILL_LABEL_RES.findIndex((re) => re.test(b.label));
    return ai - bi;
  });
  const sortable = priority;
  if (sortable.length === 0) return null;
  return (
    <div className="-mx-6 px-6 flex items-center gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <span className="shrink-0 text-[10px] uppercase tracking-[0.18em] text-muted/70 font-display">
        Sort
      </span>
      {sortable.map((c) => {
        const active = props.sortBy === c.key;
        return (
          <button
            key={c.key}
            type="button"
            onClick={() => props.onToggle(c.key)}
            className={cn(
              "shrink-0 inline-flex items-center gap-1 h-8 px-3 border text-[11px] uppercase tracking-[0.12em] font-display whitespace-nowrap transition-colors",
              active
                ? "border-accent bg-accent/10 text-accent"
                : "border-border-bronze/60 text-muted hover:text-foreground hover:border-border-bronze",
            )}
          >
            {c.label}
            {active &&
              (props.sortOrder === "asc" ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              ))}
          </button>
        );
      })}
    </div>
  );
}

function DkpEmptyState() {
  return (
    <AnimatedSection className="relative py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="relative bg-card/80 backdrop-blur-sm border border-border-bronze/70 px-8 py-14 md:py-20 text-center overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-[0.18]" aria-hidden />
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,123,61,0.10),_transparent_70%)]"
            aria-hidden
          />
          <div className="relative">
            <span className="inline-flex h-16 w-16 items-center justify-center border border-accent/40 bg-accent/10 text-accent mb-6">
              <ShieldOff className="h-7 w-7" />
            </span>
            <h3 className="font-display text-2xl md:text-3xl uppercase tracking-[0.06em] engraved mb-3">
              DKP scan not yet available
            </h3>
            <p className="text-muted text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              The first scan of the season hasn&apos;t landed yet. Standings
              will appear here as soon as governor data is collected — typically
              after the opening KvK pass.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <span className="h-px w-10 bg-accent/50" />
              <span className="font-display text-xs tracking-[0.4em] uppercase text-accent">
                Awaiting Intel
              </span>
              <span className="h-px w-10 bg-accent/50" />
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
