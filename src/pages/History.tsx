import { useCallback, useMemo, useState } from 'react';
import { History as HistoryIcon, Search, X, ArrowDownAZ, Calendar, AlertOctagon } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import HistoryRow from '../components/history/HistoryRow';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useScanHistory } from '../hooks/useScanHistory';
import type { Report } from '../lib/reportTypes';

type SortKey = 'date' | 'risk';

function sortReports(reports: readonly Report[], key: SortKey): readonly Report[] {
  const copy = reports.slice();
  if (key === 'date') {
    copy.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } else {
    copy.sort((a, b) => b.riskScore - a.riskScore);
  }
  return copy;
}

function filterReports(
  reports: readonly Report[],
  query: string,
): readonly Report[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return reports;
  return reports.filter((r) => r.code.toLowerCase().includes(q));
}

/**
 * Scan History page — searchable, sortable list of past reports.
 *
 * - `?q=`: substring match against the original source (case-insensitive).
 * - Sort by date (newest first, the default) or by risk score (desc).
 * - Row click → /auditor?report=<id> (the Auditor re-opens the report).
 * - Per-row delete button stops propagation so it doesn't also trigger open.
 * - "Clear all" is gated by a confirmation modal.
 */
function HistoryPage(): JSX.Element {
  const { history, remove, clear } = useScanHistory();
  const [query, setQuery] = useState<string>('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  const visible = useMemo<readonly Report[]>(
    () => sortReports(filterReports(history, query), sortKey),
    [history, query, sortKey],
  );

  const handleClearAll = useCallback((): void => {
    clear();
    setShowClearConfirm(false);
  }, [clear]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Library"
        title="Scan History"
        description="Search by source code, sort by date or risk, reopen any report in the Auditor, or delete a single row."
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface-panel p-3 shadow-panel sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by code substring…"
            aria-label="Search scan history by code"
            className="focus-ring w-full rounded-lg border border-border-subtle bg-surface-muted py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="focus-ring absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-text-muted hover:bg-surface-elevated hover:text-text-primary"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-border-subtle bg-surface-muted p-0.5">
            <SortButton
              Icon={Calendar}
              label="Date"
              active={sortKey === 'date'}
              onClick={() => setSortKey('date')}
            />
            <SortButton
              Icon={AlertOctagon}
              label="Risk"
              active={sortKey === 'risk'}
              onClick={() => setSortKey('risk')}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            disabled={history.length === 0}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-muted px-3 py-1.5 text-sm font-medium text-text-secondary transition hover:bg-risk-critical/10 hover:text-risk-critical disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X aria-hidden="true" className="h-4 w-4" />
            <span>Clear all</span>
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState query={query} hasHistory={history.length > 0} />
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((report) => (
            <HistoryRow key={report.id} report={report} onDelete={remove} />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={showClearConfirm}
        title="Clear all scan history?"
        description={`This will permanently delete ${history.length} scan${
          history.length === 1 ? '' : 's'
        } from this device. This action cannot be undone.`}
        confirmLabel="Clear all"
        confirmTone="destructive"
        onConfirm={handleClearAll}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}

interface SortButtonProps {
  Icon: typeof ArrowDownAZ;
  label: string;
  active: boolean;
  onClick: () => void;
}

function SortButton({ Icon, label, active, onClick }: SortButtonProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'focus-ring inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition',
        active
          ? 'bg-brand-500/20 text-brand-200'
          : 'text-text-muted hover:bg-surface-elevated hover:text-text-primary',
      ].join(' ')}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      <span>{label}</span>
    </button>
  );
}

function EmptyState({
  query,
  hasHistory,
}: {
  query: string;
  hasHistory: boolean;
}): JSX.Element {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border-subtle bg-surface-panel p-8 text-center shadow-panel">
      <span
        aria-hidden="true"
        className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/30"
      >
        <HistoryIcon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-text-muted">
          {query ? 'No matches' : 'No scans yet'}
        </p>
        <h3 className="mt-1 text-base font-semibold text-text-primary">
          {query
            ? `No scans match "${query}"`
            : 'Run a scan in the Auditor to populate history'}
        </h3>
        <p className="mt-1 text-xs text-text-muted">
          {hasHistory
            ? 'Try a different search term or clear the filter.'
            : 'History is stored locally (localStorage) and capped at 100 entries.'}
        </p>
      </div>
    </div>
  );
}

export default HistoryPage;
