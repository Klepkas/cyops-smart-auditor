import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  Icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'default' | 'critical' | 'medium' | 'low' | 'info';
}

const TONE_CLASSES: Readonly<Record<NonNullable<StatCardProps['tone']>, string>> = {
  default: 'bg-surface-elevated/50 text-text-primary ring-border-subtle',
  critical: 'bg-risk-critical/10 text-risk-critical ring-risk-critical/30',
  medium: 'bg-risk-medium/10 text-risk-medium ring-risk-medium/30',
  low: 'bg-risk-low/10 text-risk-low ring-risk-low/30',
  info: 'bg-risk-info/10 text-risk-info ring-risk-info/30',
};

const TONE_ICON: Readonly<Record<NonNullable<StatCardProps['tone']>, string>> = {
  default: 'bg-surface-muted text-text-muted',
  critical: 'bg-risk-critical/15 text-risk-critical ring-risk-critical/30',
  medium: 'bg-risk-medium/15 text-risk-medium ring-risk-medium/30',
  low: 'bg-risk-low/15 text-risk-low ring-risk-low/30',
  info: 'bg-risk-info/15 text-risk-info ring-risk-info/30',
};

/**
 * One KPI tile on the Dashboard. The tone controls the icon's color
 * and the value's color so a high critical count draws the eye
 * without screaming.
 */
function StatCard({ Icon, label, value, hint, tone = 'default' }: StatCardProps): JSX.Element {
  return (
    <div
      className={[
        'flex flex-col gap-2 rounded-2xl border p-4 shadow-panel sm:p-5',
        TONE_CLASSES[tone],
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-widest text-text-muted">
          {label}
        </p>
        <span
          aria-hidden="true"
          className={[
            'grid h-8 w-8 place-items-center rounded-lg ring-1',
            TONE_ICON[tone],
          ].join(' ')}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="font-mono text-2xl font-semibold">{value}</p>
      {hint && <p className="text-[11px] text-text-muted">{hint}</p>}
    </div>
  );
}

export default StatCard;
