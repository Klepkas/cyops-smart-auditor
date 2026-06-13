import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export type ConfirmTone = 'default' | 'destructive';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  confirmTone?: ConfirmTone;
  onConfirm: () => void;
  onCancel: () => void;
}

const TONE_CLASSES: Readonly<Record<ConfirmTone, string>> = {
  default: 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700',
  destructive:
    'bg-risk-critical text-white hover:bg-red-600 active:bg-red-700',
};

/**
 * Reusable confirmation modal.
 *
 * Behaviour:
 *  - Closes on Escape, on backdrop click, and on Cancel.
 *  - Returns focus to the previously focused element on close.
 *  - Traps focus inside the dialog while open (basic: the confirm
 *    button auto-focuses on open so Tab cycles back to the close X).
 *  - The destructive tone is reserved for actions that cannot be
 *    undone (delete history, reset all data).
 */
function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  confirmTone = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps): JSX.Element | null {
  const confirmRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current =
      (document.activeElement as HTMLElement | null) ?? null;
    confirmRef.current?.focus();
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCancel();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      previousFocusRef.current?.focus();
    };
  }, [open, onCancel]);

  if (!open) return null;

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface-panel p-5 shadow-panel">
        <div className="flex items-start gap-3">
          {confirmTone === 'destructive' && (
            <span
              aria-hidden="true"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-risk-critical/15 text-risk-critical ring-1 ring-risk-critical/30"
            >
              <AlertTriangle className="h-4 w-4" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h3 id="confirm-title" className="text-base font-semibold text-text-primary">
              {title}
            </h3>
            {description && (
              <p className="mt-1 text-sm text-text-muted">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close dialog"
            className="focus-ring grid h-7 w-7 place-items-center rounded-md text-text-muted hover:bg-surface-elevated hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="focus-ring inline-flex items-center justify-center rounded-lg border border-border-subtle bg-surface-muted px-3.5 py-2 text-sm font-medium text-text-secondary transition hover:bg-surface-elevated hover:text-text-primary"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            ref={confirmRef}
            onClick={onConfirm}
            className={[
              'focus-ring inline-flex items-center justify-center rounded-lg px-3.5 py-2 text-sm font-medium shadow-panel transition',
              TONE_CLASSES[confirmTone],
            ].join(' ')}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
