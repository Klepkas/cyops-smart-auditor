import { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  /** Optional ARIA label for the panel (e.g. "Primary navigation"). */
  ariaLabel: string;
  /** Element rendered inside the drawer — typically the same content as the desktop sidebar. */
  children: React.ReactNode;
  /** Which side the drawer slides in from. Default left. */
  side?: 'left' | 'right';
}

/**
 * Mobile drawer / overlay used to host the sidebar on screens where a
 * persistent rail would steal too much horizontal real estate
 * (< 1024 px). Closes on backdrop click, on the X button, and on
 * Escape. The body scroll is locked while the drawer is open.
 */
function Drawer({
  open,
  onClose,
  ariaLabel,
  children,
  side = 'left',
}: DrawerProps): JSX.Element | null {
  // Lock body scroll while open and close on Escape.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const sideClass = side === 'left' ? 'left-0' : 'right-0';
  const enterClass = side === 'left' ? '-translate-x-full' : 'translate-x-full';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className="fixed inset-0 z-40 flex"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close menu"
        className="flex-1 bg-black/60 backdrop-blur-sm"
      />
      <div
        className={[
          'relative h-full w-72 max-w-[80vw] border-border-subtle bg-surface-panel shadow-panel transition-transform duration-200 ease-out',
          sideClass,
          'border-r',
          // When open we sit at translate-x-0 (override the closed-state class).
          'translate-x-0',
          enterClass === '-translate-x-full' ? 'animate-fade-in' : '',
        ].join(' ')}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="focus-ring absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-md text-text-muted hover:bg-surface-elevated hover:text-text-primary"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

export default Drawer;
