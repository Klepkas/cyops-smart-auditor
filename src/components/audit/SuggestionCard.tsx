import { useState, useMemo } from 'react';
import { ChevronDown, Lightbulb, Wrench } from 'lucide-react';
import type { Severity, Suggestion, Vulnerability } from '../../lib/reportTypes';
import { SEVERITY_META, formatLineRange } from '../../lib/severity';

interface SuggestionCardProps {
  suggestions: readonly Suggestion[];
  /** Vulnerabilities keyed by id, used to colour each card by severity. */
  vulnerabilitiesById: Readonly<Record<string, Vulnerability>>;
}

/**
 * Collapsible security-suggestion cards.
 *
 * One card per suggestion.  The card shows the title + a one-line
 * description + a "L42-L48" location, and reveals the full remediation
 * snippet on click.  The first 3 cards are expanded by default so the
 * report is informative at a glance; the rest are collapsed to keep
 * the page scannable for big reports.
 */
function SuggestionCard({
  suggestions,
  vulnerabilitiesById,
}: SuggestionCardProps): JSX.Element {
  if (suggestions.length === 0) {
    return (
      <p className="rounded-xl border border-border-subtle bg-surface-elevated/40 p-4 text-sm text-text-muted">
        No remediation suggestions — the scan did not surface any findings.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {suggestions.map((suggestion, index) => (
        <SuggestionItem
          key={suggestion.id}
          suggestion={suggestion}
          vulnerability={vulnerabilitiesById[suggestion.vulnerabilityId]}
          defaultOpen={index < 3}
        />
      ))}
    </ul>
  );
}

interface SuggestionItemProps {
  suggestion: Suggestion;
  vulnerability: Vulnerability | undefined;
  defaultOpen: boolean;
}

function SuggestionItem({
  suggestion,
  vulnerability,
  defaultOpen,
}: SuggestionItemProps): JSX.Element {
  const [open, setOpen] = useState<boolean>(defaultOpen);
  const severity: Severity = vulnerability?.severity ?? 'info';
  const meta = SEVERITY_META[severity];

  const panelId = useMemo(
    () => `sugg-panel-${suggestion.id}`,
    [suggestion.id],
  );

  return (
    <li
      className={[
        'overflow-hidden rounded-xl border transition',
        open
          ? 'border-border-strong bg-surface-elevated/60 shadow-panel'
          : 'border-border-subtle bg-surface-elevated/30',
      ].join(' ')}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={panelId}
        className="focus-ring flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden="true"
            className={[
              'mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg ring-1',
              meta.bgClass,
              meta.ringClass,
            ].join(' ')}
          >
            <Lightbulb aria-hidden="true" className={`h-3.5 w-3.5 ${meta.textClass}`} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium text-text-primary">
              {suggestion.title}
            </span>
            <span className="mt-0.5 block font-mono text-[11px] text-text-muted">
              {formatLineRange(suggestion.lineRange.start, suggestion.lineRange.end)}
              {' · '}
              <span className={meta.textClass}>{meta.label}</span>
            </span>
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={[
            'h-4 w-4 shrink-0 text-text-muted transition-transform',
            open ? 'rotate-180' : '',
          ].join(' ')}
        />
      </button>
      {open && (
        <div
          id={panelId}
          className="border-t border-border-subtle px-4 py-3 text-sm text-text-secondary"
        >
          <p>{suggestion.description}</p>
          <div className="mt-3 rounded-lg border border-border-subtle bg-surface-muted/50 p-3">
            <p className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest text-text-muted">
              <Wrench aria-hidden="true" className="h-3 w-3" />
              <span>Suggested fix</span>
            </p>
            <pre className="overflow-x-auto whitespace-pre-wrap break-words font-mono text-[12px] leading-relaxed text-text-primary">
              {suggestion.remediation}
            </pre>
          </div>
        </div>
      )}
    </li>
  );
}

export default SuggestionCard;
