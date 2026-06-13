import type { LucideIcon } from 'lucide-react';
import { Sparkles } from 'lucide-react';

interface StubPanelProps {
  Icon?: LucideIcon;
  title: string;
  description: string;
  bullets?: readonly string[];
  /** Small label that pins the stub to a specific AC. */
  ac?: string;
}

/**
 * Placeholder body used by pages that have a real implementation
 * landing in a future round (Dashboard, Auditor, History, Settings).
 * Keeps the layout consistent so reviewers can confirm the sidebar
 * + topbar + content shell are correct without needing the full
 * feature for AC-3.
 */
function StubPanel({
  Icon = Sparkles,
  title,
  description,
  bullets,
  ac,
}: StubPanelProps): JSX.Element {
  return (
    <section
      aria-label={title}
      className="rounded-2xl border border-border-subtle bg-surface-panel p-6 shadow-panel sm:p-8"
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/30"
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-2">
            <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
            {ac && (
              <span className="rounded-md bg-surface-muted px-1.5 py-0.5 font-mono text-[11px] text-text-muted ring-1 ring-border-subtle">
                {ac}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-text-muted">{description}</p>
        </div>
      </div>

      {bullets && bullets.length > 0 && (
        <ul className="mt-6 grid grid-cols-1 gap-2 text-sm text-text-secondary sm:grid-cols-2">
          {bullets.map((bullet) => (
            <li
              key={bullet}
              className="flex items-start gap-2 rounded-lg border border-border-subtle bg-surface-elevated/60 p-3"
            >
              <span
                aria-hidden="true"
                className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400"
              />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default StubPanel;
