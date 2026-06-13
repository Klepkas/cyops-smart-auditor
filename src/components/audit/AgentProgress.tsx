import { Check, Loader2, X, Circle, type LucideIcon } from 'lucide-react';
import type { AgentState, AgentStatus } from '../../lib/reportTypes';

/**
 * Per-agent status icon + color mapping. Kept in one place so the
 * progress panel and any future "scan summary" widgets stay aligned.
 */
const STATUS_META: Readonly<
  Record<AgentStatus, { Icon: LucideIcon; toneClass: string; ringClass: string }>
> = {
  pending: {
    Icon: Circle,
    toneClass: 'text-text-muted',
    ringClass: 'bg-surface-elevated text-text-muted ring-border-subtle',
  },
  running: {
    Icon: Loader2,
    toneClass: 'text-brand-300',
    ringClass: 'bg-brand-500/20 text-brand-300 ring-brand-500/40',
  },
  done: {
    Icon: Check,
    toneClass: 'text-risk-low',
    ringClass: 'bg-risk-low/15 text-risk-low ring-risk-low/30',
  },
  cancelled: {
    Icon: X,
    toneClass: 'text-risk-medium',
    ringClass: 'bg-risk-medium/15 text-risk-medium ring-risk-medium/30',
  },
};

interface AgentRowProps {
  agent: AgentState;
  index: number;
}

/** One row in the multi-agent progress list. */
function AgentRow({ agent, index }: AgentRowProps): JSX.Element {
  const meta = STATUS_META[agent.status];
  const Icon = meta.Icon;
  const isRunning = agent.status === 'running';
  return (
    <li
      aria-current={isRunning ? 'step' : undefined}
      className={[
        'flex items-start gap-3 rounded-xl border px-3 py-3 transition',
        isRunning
          ? 'border-brand-500/40 bg-brand-500/5 shadow-panel'
          : 'border-border-subtle bg-surface-elevated/40',
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className={[
          'grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1',
          meta.ringClass,
        ].join(' ')}
      >
        <Icon
          className={[
            'h-4 w-4',
            meta.toneClass,
            isRunning ? 'animate-spin' : '',
          ].join(' ')}
        />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-medium text-text-primary">
            <span className="mr-1 text-text-muted">{index + 1}.</span>
            {agent.name}
          </p>
          <span className="font-mono text-[11px] text-text-muted">
            {agent.progress}%
          </span>
        </div>
        <p
          className={[
            'truncate text-xs',
            agent.status === 'cancelled'
              ? 'text-risk-medium'
              : agent.status === 'done'
                ? 'text-risk-low'
                : 'text-text-muted',
          ].join(' ')}
        >
          {agent.message}
        </p>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={agent.progress}
          aria-label={`${agent.name} progress`}
          className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted"
        >
          <div
            className={[
              'h-full rounded-full transition-[width] duration-200 ease-out',
              agent.status === 'cancelled'
                ? 'bg-risk-medium'
                : agent.status === 'done'
                  ? 'bg-risk-low'
                  : 'bg-brand-400',
            ].join(' ')}
            style={{ width: `${agent.progress}%` }}
          />
        </div>
      </div>
    </li>
  );
}

interface CancelButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

/**
 * Secondary-style "Cancel scan" button. Uses a flat slate surface
 * (not the destructive red) so it doesn't visually compete with the
 * primary Scan button — cancelling is a defensive, reversible action,
 * not a delete.
 */
function CancelButton({ onClick, disabled = false }: CancelButtonProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface-muted px-3.5 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-elevated hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
    >
      <X aria-hidden="true" className="h-4 w-4" />
      <span>Cancel scan</span>
    </button>
  );
}

interface AgentProgressProps {
  agents: readonly AgentState[];
  overallProgress: number;
  elapsedMs: number;
  isScanning: boolean;
  isCancelled: boolean;
  onCancel: () => void;
}

/** Format an elapsed-ms value as `M:SS.s` (e.g. `0:02.4`). */
function formatElapsed(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '0:00.0';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((ms % 1000) / 100);
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${tenths}`;
}

/**
 * Multi-agent progress panel rendered below the editor while a scan
 * is in flight. Renders four rows in execution order, each with its
 * own status icon, status text, and progress bar. The bottom strip
 * surfaces an overall progress bar, a wall-clock counter, and the
 * Cancel button.
 *
 * After cancellation the panel stays mounted (so the user can see
 * which agents completed) and the bottom strip swaps to a friendly
 * "Scan cancelled" notice.
 */
function AgentProgress({
  agents,
  overallProgress,
  elapsedMs,
  isScanning,
  isCancelled,
  onCancel,
}: AgentProgressProps): JSX.Element {
  const headerStatus = isCancelled
    ? 'Scan cancelled'
    : isScanning
      ? 'Scanning in progress'
      : 'Scan complete';
  const headerTone = isCancelled
    ? 'text-risk-medium'
    : isScanning
      ? 'text-brand-300'
      : 'text-risk-low';

  return (
    <section
      role="status"
      aria-live="polite"
      aria-busy={isScanning}
      className="flex flex-col gap-4 rounded-2xl border border-border-subtle bg-surface-panel p-5 shadow-panel sm:p-6"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <p className="text-[11px] font-medium uppercase tracking-widest text-text-muted">
            Pipeline
          </p>
          <h3 className={`text-base font-semibold ${headerTone}`}>
            {headerStatus}
          </h3>
        </div>
        <p className="font-mono text-xs text-text-muted">
          Total: {formatElapsed(elapsedMs)}
        </p>
      </header>

      <ol className="flex flex-col gap-2">
        {agents.map((agent, index) => (
          <AgentRow key={agent.id} agent={agent} index={index} />
        ))}
      </ol>

      <div className="flex flex-col gap-3 border-t border-border-subtle pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <p className="shrink-0 font-mono text-[11px] uppercase tracking-widest text-text-muted">
            Overall
          </p>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={overallProgress}
            aria-label="Overall scan progress"
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted"
          >
            <div
              className={[
                'h-full rounded-full transition-[width] duration-200 ease-out',
                isCancelled ? 'bg-risk-medium' : 'bg-brand-400',
              ].join(' ')}
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <span className="shrink-0 font-mono text-xs text-text-muted">
            {overallProgress}%
          </span>
        </div>

        {isScanning ? (
          <CancelButton onClick={onCancel} />
        ) : isCancelled ? (
          <p className="text-xs text-text-muted">
            Cancelled — the report was not generated.
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default AgentProgress;
