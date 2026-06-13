import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

/**
 * Shared page heading used by Dashboard, Auditor, History, Settings.
 *
 *   ┌────────────────────────────────────────────────────────────┐
 *   │  EYEBROW (optional)                                        │
 *   │  Title                                                    [actions]
 *   │  Description …                                             │
 *   └────────────────────────────────────────────────────────────┘
 */
function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps): JSX.Element {
  return (
    <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[11px] font-medium uppercase tracking-widest text-brand-300">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-1 text-display-md text-text-primary">{title}</h2>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-text-muted">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export default PageHeader;
