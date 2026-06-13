import { useNavigate } from 'react-router-dom';
import { Trash2, ArrowUpRight, AlertOctagon, AlertTriangle, ShieldCheck, Info, FileCode2 } from 'lucide-react';
import type { Report, Severity } from '../../lib/reportTypes';
import { riskBandFor } from '../../lib/severity';

interface HistoryRowProps {
  report: Report;
  onDelete: (id: string) => void;
}

const SEVERITY_BADGE_TONE: Readonly<Record<Severity, string>> = {
  critical: 'text-risk-critical',
  medium: 'text-risk-medium',
  low: 'text-risk-low',
  info: 'text-risk-info',
};

/**
 * One row in the Scan History list. The whole row is clickable and
 * navigates back to the Auditor with `?report=<id>`, which the
 * Auditor page consumes to re-open the saved report.
 *
 * The delete button is its own stop-propagation click target so the
 * user can trash a row without accidentally opening it.
 */
function HistoryRow({ report, onDelete }: HistoryRowProps): JSX.Element {
  const navigate = useNavigate();
  const counts: Record<Severity, number> = { critical: 0, medium: 0, low: 0, info: 0 };
  for (const v of report.vulnerabilities) counts[v.severity] += 1;

  const band = riskBandFor(report.riskScore);
  const timestamp = new Date(report.createdAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const codePreview = report.code
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .slice(0, 2)
    .join('  ·  ');

  const handleOpen = (): void => {
    navigate(`/auditor?report=${encodeURIComponent(report.id)}`);
  };

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();
    onDelete(report.id);
  };

  return (
    <li className="group">
      <button
        type="button"
        onClick={handleOpen}
        className="focus-ring flex w-full items-stretch gap-3 rounded-xl border border-border-subtle bg-surface-elevated/30 p-3 text-left transition hover:border-border-strong hover:bg-surface-elevated/60"
      >
        <span
          aria-hidden="true"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/30"
        >
          <FileCode2 className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-medium text-text-primary">
              <span className="font-mono text-text-muted">{report.codeHash}</span>
              <span className="ml-2 text-xs text-text-muted">{timestamp}</span>
            </p>
            <div className="flex items-center gap-2">
              <span className={`font-mono text-base font-semibold ${band.textClass}`}>
                {report.riskScore}
              </span>
              <span className="font-mono text-[11px] text-text-muted">/ 100</span>
            </div>
          </div>
          <p className="mt-1 truncate font-mono text-[11px] text-text-muted">
            {codePreview || '— no code —'}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <SeverityBadge Icon={AlertOctagon} value={counts.critical} severity="critical" />
            <SeverityBadge Icon={AlertTriangle} value={counts.medium} severity="medium" />
            <SeverityBadge Icon={ShieldCheck} value={counts.low} severity="low" />
            <SeverityBadge Icon={Info} value={counts.info} severity="info" />
          </div>
        </div>
        <span className="flex shrink-0 flex-col items-end justify-between gap-2">
          <span
            aria-hidden="true"
            className="grid h-7 w-7 place-items-center rounded-md text-text-muted opacity-0 transition group-hover:opacity-100"
          >
            <ArrowUpRight className="h-4 w-4" />
          </span>
          <span
            role="button"
            tabIndex={-1}
            onClick={handleDelete}
            className="focus-ring grid h-7 w-7 place-items-center rounded-md text-text-muted transition hover:bg-risk-critical/10 hover:text-risk-critical"
            aria-label="Delete this scan"
            title="Delete"
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" />
          </span>
        </span>
      </button>
    </li>
  );
}

interface SeverityBadgeProps {
  Icon: typeof AlertOctagon;
  value: number;
  severity: Severity;
}

function SeverityBadge({ Icon, value, severity }: SeverityBadgeProps): JSX.Element {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-surface-muted px-1.5 py-0.5 font-mono text-[11px] text-text-muted ring-1 ring-border-subtle">
        <Icon aria-hidden="true" className="h-3 w-3" />
        <span>0</span>
      </span>
    );
  }
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-md bg-surface-muted px-1.5 py-0.5 font-mono text-[11px] ring-1 ring-border-subtle',
        SEVERITY_BADGE_TONE[severity],
      ].join(' ')}
    >
      <Icon aria-hidden="true" className="h-3 w-3" />
      <span>{value}</span>
    </span>
  );
}

export default HistoryRow;
