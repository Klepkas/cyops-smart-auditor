import type { ReactNode } from 'react';

interface EditorToolbarProps {
  filename: string;
  lineCount: number;
  charCount: number;
  /** Right-aligned actions (e.g., reset / paste buttons). */
  actions?: ReactNode;
}

/**
 * Compact toolbar that sits above the code editor. Renders the contract
 * filename, a live line + character counter, and any right-aligned
 * actions passed in. The toolbar is part of the editor surface (shares
 * the panel border) so it does not have its own outer ring.
 */
function EditorToolbar({
  filename,
  lineCount,
  charCount,
  actions,
}: EditorToolbarProps): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border-subtle bg-surface-elevated/60 px-4 py-2">
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-brand-500/20 text-brand-300 ring-1 ring-brand-500/30"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
            <path d="M14 3v5h5" />
            <path d="M9 13h6M9 17h4" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-text-primary">
            {filename}
          </p>
          <p className="font-mono text-[11px] text-text-muted">
            {lineCount} {lineCount === 1 ? 'line' : 'lines'} ·{' '}
            {charCount.toLocaleString()} chars
          </p>
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export default EditorToolbar;
