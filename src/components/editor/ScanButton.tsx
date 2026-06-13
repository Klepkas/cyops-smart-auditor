import { ShieldCheck, Loader2 } from 'lucide-react';

interface ScanButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

/**
 * Primary "Scan for Vulnerabilities" button.
 *
 * The label and icon swap while a scan is running so the user gets
 * immediate feedback when the click registers. The button is also
 * disabled while a scan is in flight to prevent double-submission; the
 * actual cancellation lives on the progress UI in AC-5, not here.
 */
function ScanButton({
  onClick,
  isLoading = false,
  disabled = false,
}: ScanButtonProps): JSX.Element {
  const isDisabled = disabled || isLoading;
  const label = isLoading ? 'Scanning…' : 'Scan for Vulnerabilities';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={isLoading}
      className={[
        'focus-ring inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold shadow-panel transition',
        isDisabled
          ? 'cursor-not-allowed bg-brand-700/60 text-white/80'
          : 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700',
      ].join(' ')}
    >
      {isLoading ? (
        <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
      ) : (
        <ShieldCheck aria-hidden="true" className="h-4 w-4" />
      )}
      <span>{label}</span>
    </button>
  );
}

export default ScanButton;
