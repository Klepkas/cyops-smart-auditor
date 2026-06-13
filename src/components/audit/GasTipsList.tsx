import { Fuel } from 'lucide-react';
import type { GasTip } from '../../lib/reportTypes';
import { formatGasSavings, formatLineRange } from '../../lib/severity';

interface GasTipsListProps {
  tips: readonly GasTip[];
}

/**
 * Bulleted list of gas-optimization tips with per-tip estimated gas
 * savings and an optional snippet.  When the source code has no
 * obvious optimization handles the list is replaced with a friendly
 * "no tips" message — keeps the report honest without inventing
 * findings.
 */
function GasTipsList({ tips }: GasTipsListProps): JSX.Element {
  if (tips.length === 0) {
    return (
      <p className="rounded-xl border border-border-subtle bg-surface-elevated/40 p-4 text-sm text-text-muted">
        No gas-optimization tips — the code already follows the usual
        low-cost patterns.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {tips.map((tip) => (
        <li
          key={tip.id}
          className="flex items-start gap-3 rounded-xl border border-border-subtle bg-surface-elevated/30 p-3"
        >
          <span
            aria-hidden="true"
            className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-risk-low/15 text-risk-low ring-1 ring-risk-low/30"
          >
            <Fuel aria-hidden="true" className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-text-primary">{tip.title}</p>
              <span className="font-mono text-[11px] text-risk-low">
                {formatGasSavings(tip.estimatedGasSavings)}
              </span>
            </div>
            {tip.lineRange && (
              <p className="mt-0.5 font-mono text-[11px] text-text-muted">
                {formatLineRange(tip.lineRange.start, tip.lineRange.end)}
              </p>
            )}
            <p className="mt-1 text-sm text-text-secondary">{tip.description}</p>
            {tip.snippet && (
              <pre className="mt-2 overflow-x-auto rounded-md border border-border-subtle bg-surface-muted/50 p-2 font-mono text-[11px] leading-relaxed text-text-primary">
                {tip.snippet}
              </pre>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default GasTipsList;
