import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ShieldCheck,
  Info,
  ArrowRight,
  ScanLine,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/dashboard/StatCard';
import TrendChart from '../components/dashboard/TrendChart';
import { useScanHistory } from '../hooks/useScanHistory';
import { riskBandFor } from '../lib/severity';
import type { Severity } from '../lib/reportTypes';

/**
 * Dashboard — aggregate metrics from Scan History.
 *
 * Layout:
 *   - 4 stat cards (total scans, average risk, critical count, medium count)
 *   - Trend sparkline of the last 10 scans
 *   - Severity breakdown table
 *
 * With zero scans we render a friendly empty-state CTA pointing at
 * `/auditor`. Once a scan is persisted, the cards and chart populate
 * automatically (re-renders are memoised off `history`).
 */
function Dashboard(): JSX.Element {
  const { history } = useScanHistory();

  const total = history.length;

  const stats = useMemo(() => {
    if (total === 0) {
      return { avg: 0, critical: 0, medium: 0, low: 0, info: 0 };
    }
    const counts: Record<Severity, number> = { critical: 0, medium: 0, low: 0, info: 0 };
    let sum = 0;
    for (const r of history) {
      sum += r.riskScore;
      for (const v of r.vulnerabilities) counts[v.severity] += 1;
    }
    return {
      avg: Math.round(sum / total),
      critical: counts.critical,
      medium: counts.medium,
      low: counts.low,
      info: counts.info,
    };
  }, [history, total]);

  const lastScanned = history[0];
  const lastScannedLabel = lastScanned
    ? new Date(lastScanned.createdAt).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  if (total === 0) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <PageHeader
          eyebrow="Overview"
          title="Dashboard"
          description="Aggregate metrics from your scan history. The empty state below shows up until you run your first scan."
        />
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Aggregate metrics from your scan history — updated on every completed scan."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          Icon={Activity}
          label="Total scans"
          value={total}
          hint={lastScannedLabel ? `Last: ${lastScannedLabel}` : undefined}
        />
        <StatCard
          Icon={ShieldCheck}
          label="Average risk"
          value={`${stats.avg}/100`}
          hint={riskBandFor(stats.avg).label}
          tone={stats.avg >= 70 ? 'critical' : stats.avg >= 40 ? 'medium' : 'low'}
        />
        <StatCard
          Icon={AlertOctagon}
          label="Critical findings"
          value={stats.critical}
          tone={stats.critical > 0 ? 'critical' : 'default'}
        />
        <StatCard
          Icon={AlertTriangle}
          label="Medium findings"
          value={stats.medium}
          tone={stats.medium > 0 ? 'medium' : 'default'}
        />
      </div>

      <section
        aria-label="Risk score trend"
        className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface-panel p-4 shadow-panel sm:p-5"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-text-muted">
              Trend
            </p>
            <h3 className="text-base font-semibold text-text-primary">
              Risk score · last {Math.min(total, 10)} scans
            </h3>
          </div>
          <Link
            to="/history"
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-muted px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-surface-elevated hover:text-text-primary"
          >
            <span>View history</span>
            <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          </Link>
        </div>
        <TrendChart history={history} maxPoints={10} />
      </section>

      <section
        aria-label="Severity breakdown"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        <StatCard Icon={AlertOctagon} label="Critical" value={stats.critical} tone="critical" />
        <StatCard Icon={AlertTriangle} label="Medium" value={stats.medium} tone="medium" />
        <StatCard Icon={ShieldCheck} label="Low" value={stats.low} tone="low" />
        <StatCard Icon={Info} label="Info" value={stats.info} tone="info" />
      </section>
    </div>
  );
}

function EmptyState(): JSX.Element {
  return (
    <section
      aria-label="No scans yet"
      className="flex flex-col items-center gap-4 rounded-2xl border border-border-subtle bg-surface-panel p-8 text-center shadow-panel sm:p-10"
    >
      <span
        aria-hidden="true"
        className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/30"
      >
        <ScanLine className="h-6 w-6" />
      </span>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-text-muted">
          Empty state
        </p>
        <h3 className="mt-1 text-display-md text-text-primary">Run your first scan</h3>
        <p className="mt-2 max-w-md text-sm text-text-muted">
          The dashboard populates with total scans, average risk, severity counts,
          and a trend sparkline as soon as you complete a scan in the Auditor.
        </p>
      </div>
      <Link
        to="/auditor"
        className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-panel transition hover:bg-brand-600"
      >
        <ScanLine aria-hidden="true" className="h-4 w-4" />
        <span>Open the Auditor</span>
      </Link>
    </section>
  );
}

export default Dashboard;
