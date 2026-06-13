import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RotateCcw, Eraser, FileBadge2, X, Sparkles, Gauge as GaugeIcon, ListChecks, Lightbulb, Fuel } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import CodeEditor from '../components/editor/CodeEditor';
import EditorToolbar from '../components/editor/EditorToolbar';
import ScanButton from '../components/audit/ScanButton';
import AgentProgress from '../components/audit/AgentProgress';
import RiskScoreGauge from '../components/audit/RiskScoreGauge';
import VulnerabilityTable from '../components/audit/VulnerabilityTable';
import SuggestionCard from '../components/audit/SuggestionCard';
import GasTipsList from '../components/audit/GasTipsList';
import { useScan } from '../hooks/useScan';
import { useScanHistory } from '../hooks/useScanHistory';
import { useSettings } from '../hooks/useSettings';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { SAMPLE_CONTRACT, SAMPLE_CONTRACT_NAME } from '../data/sampleContract';
import type { Report, Severity, Vulnerability } from '../lib/reportTypes';

/**
 * Auditor page — large Solidity editor + the multi-agent scan
 * pipeline (AC-4 + AC-5) + the polished Audit Report (AC-6).
 *
 * Pipeline state is owned by `useScan`. The report panel is rendered
 * in the same `<div>` as the editor and progress panel so the page
 * reads top-to-bottom: code → scan → result.
 */
function Auditor(): JSX.Element {
  const [code, setCode] = useState<string>(SAMPLE_CONTRACT);
  const { history, add: addToHistory } = useScanHistory();
  const { settings } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();

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
    setScanOptions,
  } = useScan();

  // Keep the engine options in sync with the latest settings so the
  // next scan uses the user's current Solidity version + sensitivity.
  useEffect(() => {
    setScanOptions({
      sensitivity: settings.sensitivity,
      solidityVersion: settings.solidityVersion,
    });
  }, [settings.sensitivity, settings.solidityVersion, setScanOptions]);

  // Persist every completed report into history (Dashboard + History
  // pages consume this). Capped at 100 entries FIFO by useScanHistory.
  useEffect(() => {
    if (isComplete && report) addToHistory(report);
  }, [isComplete, report, addToHistory]);

  // Re-open a historical report when arriving with ?report=<id>.
  // We hold the report in a piece of local state so the param can be
  // cleared without dropping the report from view.
  const reopenId = searchParams.get('report');
  const reopenedReport = useMemo<Report | null>(() => {
    if (!reopenId) return null;
    return history.find((r) => r.id === reopenId) ?? null;
  }, [reopenId, history]);
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  useEffect(() => {
    if (reopenedReport) {
      setActiveReport(reopenedReport);
      // Strip the param so a refresh doesn't re-trigger.
      const next = new URLSearchParams(searchParams);
      next.delete('report');
      setSearchParams(next, { replace: true });
    }
  }, [reopenedReport, searchParams, setSearchParams]);

  // The report we render is whichever was produced first: a fresh
  // scan, then a reopened one.
  const displayedReport: Report | null = report ?? activeReport;
  const showReport = isComplete || activeReport !== null;

  // Shrink the risk-score gauge below the `sm` breakpoint (640 px) so
  // it fits the 360 px responsive pass without horizontal overflow.
  const isSmallScreen = useMediaQuery('(max-width: 639px)');
  const gaugeSize = isSmallScreen ? 180 : 220;

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
    setActiveReport(null);
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
        className="flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface-panel shadow-panel"
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

      {showReport && displayedReport && (
        <AuditReport
          report={displayedReport}
          onRunAnother={handleResetAll}
          gaugeSize={gaugeSize}
        />
      )}
    </div>
  );
}

interface AuditReportProps {
  report: Report;
  onRunAnother: () => void;
  /** Responsive diameter for the RiskScoreGauge (smaller on phones). */
  gaugeSize: number;
}

/**
 * Polished audit report panel. Renders the four required sections:
 *   1. Risk Score gauge (recharts radial bar, colour-coded by band)
 *   2. Vulnerabilities table (grouped by severity, collapsible)
 *   3. Detailed security suggestions (collapsible cards, line range + remediation)
 *   4. Gas-optimization tips (bulleted list with estimated gas savings)
 */
function AuditReport({ report, onRunAnother, gaugeSize }: AuditReportProps): JSX.Element {
  const vulnerabilitiesById = useMemo<Record<string, Vulnerability>>(() => {
    const map: Record<string, Vulnerability> = {};
    for (const v of report.vulnerabilities) map[v.id] = v;
    return map;
  }, [report.vulnerabilities]);

  return (
    <section
      aria-label="Audit report"
      className="flex flex-col gap-5 rounded-2xl border border-border-subtle bg-surface-panel p-5 shadow-panel sm:p-6"
    >
      <ReportHeader report={report} onRunAnother={onRunAnother} />

      <ReportSummary report={report} />

      <Section
        Icon={GaugeIcon}
        title="Risk score"
        subtitle="Weighted sum of all findings, clamped to 0-100 and colour-coded by band."
      >
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-around">
          <RiskScoreGauge score={report.riskScore} size={gaugeSize} />
          <SeverityBreakdown vulnerabilities={report.vulnerabilities} />
        </div>
      </Section>

      <Section
        Icon={ListChecks}
        title="Vulnerabilities"
        subtitle="Grouped by severity. Click a severity band to collapse it."
      >
        <VulnerabilityTable vulnerabilities={report.vulnerabilities} />
      </Section>

      <Section
        Icon={Lightbulb}
        title="Security suggestions"
        subtitle="One remediation card per finding. Click to expand the suggested fix."
      >
        <SuggestionCard
          suggestions={report.suggestions}
          vulnerabilitiesById={vulnerabilitiesById}
        />
      </Section>

      <Section
        Icon={Fuel}
        title="Gas optimization tips"
        subtitle="Per-call savings, with optional code snippets illustrating the change."
      >
        <GasTipsList tips={report.gasTips} />
      </Section>
    </section>
  );
}

interface ReportHeaderProps {
  report: Report;
  onRunAnother: () => void;
}

function ReportHeader({ report, onRunAnother }: ReportHeaderProps): JSX.Element {
  return (
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
            Audit report
          </p>
          <h3 className="text-base font-semibold text-text-primary">Scan complete</h3>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-text-muted">
          {(report.totalDurationMs / 1000).toFixed(1)}s · {report.codeHash}
        </span>
        <button
          type="button"
          onClick={onRunAnother}
          className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-muted px-3.5 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-elevated hover:text-text-primary"
        >
          <X aria-hidden="true" className="h-4 w-4" />
          <span>Run another scan</span>
        </button>
      </div>
    </header>
  );
}

function ReportSummary({ report }: { report: Report }): JSX.Element {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-elevated/40 p-4">
      <p className="flex items-baseline gap-2 text-[11px] font-medium uppercase tracking-widest text-text-muted">
        <Sparkles aria-hidden="true" className="h-3 w-3" />
        <span>AI summary</span>
      </p>
      <p className="mt-2 text-sm text-text-secondary">{report.summary}</p>
    </div>
  );
}

interface SectionProps {
  Icon: typeof GaugeIcon;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

function Section({ Icon, title, subtitle, children }: SectionProps): JSX.Element {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-300" />
        <h4 className="text-sm font-semibold text-text-primary">{title}</h4>
        <p className="text-xs text-text-muted">— {subtitle}</p>
      </div>
      {children}
    </section>
  );
}

interface SeverityBreakdownProps {
  vulnerabilities: readonly Vulnerability[];
}

function SeverityBreakdown({ vulnerabilities }: SeverityBreakdownProps): JSX.Element {
  const counts = useMemo<Record<Severity, number>>(() => {
    const acc: Record<Severity, number> = { critical: 0, medium: 0, low: 0, info: 0 };
    for (const v of vulnerabilities) acc[v.severity] += 1;
    return acc;
  }, [vulnerabilities]);

  const total = vulnerabilities.length;
  const labels: ReadonlyArray<{ severity: Severity; label: string }> = [
    { severity: 'critical', label: 'Critical' },
    { severity: 'medium', label: 'Medium' },
    { severity: 'low', label: 'Low' },
    { severity: 'info', label: 'Info' },
  ];

  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:max-w-xs">
      {labels.map(({ severity, label }) => {
        const value = counts[severity];
        const tone =
          severity === 'critical'
            ? 'text-risk-critical'
            : severity === 'medium'
              ? 'text-risk-medium'
              : severity === 'low'
                ? 'text-risk-low'
                : 'text-risk-info';
        return (
          <div
            key={severity}
            className="rounded-xl border border-border-subtle bg-surface-elevated/50 p-3 text-center"
          >
            <p className="text-[11px] font-medium uppercase tracking-widest text-text-muted">
              {label}
            </p>
            <p className={`mt-1 font-mono text-xl font-semibold ${tone}`}>{value}</p>
          </div>
        );
      })}
      <p className="col-span-2 text-center font-mono text-[11px] text-text-muted">
        {total} {total === 1 ? 'finding' : 'findings'} total
      </p>
    </div>
  );
}

export default Auditor;
