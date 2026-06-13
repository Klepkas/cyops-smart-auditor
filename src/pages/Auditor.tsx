import { useCallback, useMemo, useState } from 'react';
import { RotateCcw, Eraser, FileBadge2, Sparkles, X } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import CodeEditor from '../components/editor/CodeEditor';
import EditorToolbar from '../components/editor/EditorToolbar';
import ScanButton from '../components/audit/ScanButton';
import AgentProgress from '../components/audit/AgentProgress';
import { useScan } from '../hooks/useScan';
import { SAMPLE_CONTRACT, SAMPLE_CONTRACT_NAME } from '../data/sampleContract';
import type { Report, Severity } from '../lib/reportTypes';

/**
 * Auditor page — large Solidity editor + the multi-agent scan
 * pipeline (AC-4 + AC-5). After a scan completes a slim "Report ready"
 * card previews the risk score; the full Audit Report (gauge,
 * vulnerability table, suggestions, gas tips) lands in AC-6.
 *
 * The pipeline is driven by `useScan`, which owns the
 * `AbortController` and exposes a stable `start` / `cancel` API.
 */
function Auditor(): JSX.Element {
  const [code, setCode] = useState<string>(SAMPLE_CONTRACT);

  const {
    isScanning,
    isCancelled,
    isComplete,
    report,
    error,
    agents,
    elapsedMs,
    overallProgress,
    start,
    cancel,
    reset,
  } = useScan();

  const handleCodeChange = useCallback((next: string) => {
    setCode(next);
  }, []);

  const handleReset = useCallback(() => {
    setCode(SAMPLE_CONTRACT);
  }, []);

  const handleClear = useCallback(() => {
    setCode('');
  }, []);

  const handleScan = useCallback(() => {
    if (isScanning) return;
    start(code);
  }, [code, isScanning, start]);

  const handleResetAll = useCallback(() => {
    cancel();
    reset();
  }, [cancel, reset]);

  const lineCount = useMemo(
    () => (code.length === 0 ? 0 : code.split('\n').length),
    [code],
  );
  const charCount = code.length;
  const editorReadOnly = isScanning;

  const toolbarActions = (
    <>
      <button
        type="button"
        onClick={handleReset}
        disabled={isScanning}
        title="Restore the placeholder VulnerableVault.sol"
        className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-muted px-2.5 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-surface-elevated hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
        <span>Reset</span>
      </button>
      <button
        type="button"
        onClick={handleClear}
        disabled={isScanning}
        title="Clear the editor"
        className="focus-ring inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-muted px-2.5 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-surface-elevated hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Eraser aria-hidden="true" className="h-3.5 w-3.5" />
        <span>Clear</span>
      </button>
    </>
  );

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col gap-4">
      <PageHeader
        eyebrow="Scan"
        title="Auditor"
        description="Paste a Solidity contract, then run a multi-agent vulnerability scan. Four agents run sequentially — cancel any time."
      />

      <section
        aria-label="Code editor"
        className="flex min-h-[480px] flex-1 flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface-panel shadow-panel"
      >
        <EditorToolbar
          filename={SAMPLE_CONTRACT_NAME}
          lineCount={lineCount}
          charCount={charCount}
          actions={toolbarActions}
        />
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <CodeEditor
            value={code}
            onChange={handleCodeChange}
            readOnly={editorReadOnly}
            ariaLabel="Solidity source code editor"
          />
        </div>
      </section>

      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-xs text-text-muted">
          The scan runs locally in your browser. No code is sent to a server.
        </p>
        <ScanButton
          onClick={handleScan}
          isLoading={isScanning}
          disabled={code.trim().length === 0}
        />
      </div>

      {(isScanning || isCancelled) && (
        <AgentProgress
          agents={agents}
          overallProgress={overallProgress}
          elapsedMs={elapsedMs}
          isScanning={isScanning}
          isCancelled={isCancelled}
          onCancel={cancel}
        />
      )}

      {error && !isCancelled && (
        <div
          role="alert"
          className="rounded-2xl border border-risk-critical/30 bg-risk-critical/10 p-4 text-sm text-risk-critical"
        >
          <p className="font-medium">Scan failed</p>
          <p className="mt-1 text-xs text-text-muted">{error.message}</p>
        </div>
      )}

      {isComplete && report && (
        <ReportReadyCard report={report} onRunAnother={handleResetAll} />
      )}
    </div>
  );
}

interface ReportReadyCardProps {
  report: Report;
  onRunAnother: () => void;
}

/**
 * Slim card shown after a scan completes. For AC-5 it surfaces just
 * the headline numbers (risk score + finding counts + summary) and
 * stubs out the full Audit Report — that lands in AC-6. The
 * "View full report" button is intentionally a no-op for now and
 * will be wired to the report pane in the next round.
 */
function ReportReadyCard({
  report,
  onRunAnother,
}: ReportReadyCardProps): JSX.Element {
  const counts = useMemo(() => {
    const acc: Record<Severity, number> = {
      critical: 0,
      medium: 0,
      low: 0,
      info: 0,
    };
    for (const v of report.vulnerabilities) acc[v.severity] += 1;
    return acc;
  }, [report.vulnerabilities]);

  const score = report.riskScore;
  const scoreTone =
    score >= 70
      ? 'text-risk-critical'
      : score >= 40
        ? 'text-risk-medium'
        : 'text-risk-low';

  return (
    <section
      aria-label="Report ready"
      className="flex flex-col gap-4 rounded-2xl border border-border-subtle bg-surface-panel p-5 shadow-panel sm:p-6"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="grid h-9 w-9 place-items-center rounded-lg bg-risk-low/15 text-risk-low ring-1 ring-risk-low/30"
          >
            <FileBadge2 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-text-muted">
              Pipeline
            </p>
            <h3 className="text-base font-semibold text-text-primary">
              Report ready
            </h3>
          </div>
        </div>
        <span className="font-mono text-xs text-text-muted">
          {(report.totalDurationMs / 1000).toFixed(1)}s · {report.codeHash}
        </span>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="flex flex-col items-center justify-center rounded-xl border border-border-subtle bg-surface-elevated/50 px-6 py-4">
          <p className="text-[11px] font-medium uppercase tracking-widest text-text-muted">
            Risk score
          </p>
          <p className={`mt-1 font-mono text-3xl font-semibold ${scoreTone}`}>
            {score}
          </p>
          <p className="font-mono text-[11px] text-text-muted">/ 100</p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <SeverityTile label="Critical" value={counts.critical} tone="critical" />
          <SeverityTile label="Medium" value={counts.medium} tone="medium" />
          <SeverityTile label="Low" value={counts.low} tone="low" />
          <SeverityTile label="Info" value={counts.info} tone="info" />
        </div>
      </div>

      <p className="rounded-xl border border-border-subtle bg-surface-elevated/40 p-3 text-sm text-text-secondary">
        {report.summary}
      </p>

      <div className="flex flex-col gap-2 border-t border-border-subtle pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-text-muted">
          Full audit report (gauge, vulnerability table, suggestions, gas
          tips) lands in <span className="font-mono">AC-6</span>.
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRunAnother}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-muted px-3.5 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-elevated hover:text-text-primary"
          >
            <X aria-hidden="true" className="h-4 w-4" />
            <span>Run another scan</span>
          </button>
          <button
            type="button"
            disabled
            title="Full report lands in AC-6"
            className="focus-ring inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg bg-brand-700/60 px-3.5 py-2 text-sm font-medium text-white/80"
          >
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            <span>View full report</span>
          </button>
        </div>
      </div>
    </section>
  );
}

interface SeverityTileProps {
  label: string;
  value: number;
  tone: Severity;
}

const SEVERITY_TILE_TONE: Readonly<Record<Severity, string>> = {
  critical: 'text-risk-critical',
  medium: 'text-risk-medium',
  low: 'text-risk-low',
  info: 'text-risk-info',
};

function SeverityTile({ label, value, tone }: SeverityTileProps): JSX.Element {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-elevated/50 p-3 text-center">
      <p className="text-[11px] font-medium uppercase tracking-widest text-text-muted">
        {label}
      </p>
      <p className={`mt-1 font-mono text-xl font-semibold ${SEVERITY_TILE_TONE[tone]}`}>
        {value}
      </p>
    </div>
  );
}

export default Auditor;
