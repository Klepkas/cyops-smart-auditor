import { useCallback, useState } from 'react';
import { Settings as SettingsIcon, Moon, Sliders, Code2, Trash2, Sun, Lock } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import {
  useSettings,
  SUPPORTED_SOLIDITY_VERSIONS,
  SUPPORTED_SENSITIVITIES,
  DEFAULT_SETTINGS,
  type SolidityVersion,
} from '../hooks/useSettings';
import { useScanHistory } from '../hooks/useScanHistory';
import type { RiskSensitivity as RiskSensitivityType } from '../lib/reportTypes';

/**
 * Settings page — three preference groups + a destructive "Reset all
 * data" action.
 *
 * - Theme: locked to "Dark" for v1; the "Light — coming soon" toggle
 *   is rendered disabled so the surface is in place.
 * - Default Solidity version: 0.8.20 / 0.8.24 / 0.8.26 (radio cards).
 * - Risk-score sensitivity: Low / Medium / High (radio cards).
 * - "Reset all data": destructive, gated by a confirmation modal that
 *   wipes both settings and history localStorage keys.
 */
function SettingsPage(): JSX.Element {
  const { settings, setSolidityVersion, setSensitivity, reset: resetSettings } = useSettings();
  const { history, clear: clearHistory } = useScanHistory();
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const handleReset = useCallback((): void => {
    // Wipe settings + history localStorage. We do this directly so the
    // reset is atomic from the user's perspective, then re-sync the
    // hooks from the (now default) state.
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem('smart-auditor:settings');
        window.localStorage.removeItem('smart-auditor:history');
      } catch {
        // ignore
      }
    }
    resetSettings();
    clearHistory();
    setShowResetConfirm(false);
  }, [resetSettings, clearHistory]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        description="Configure the default Solidity version, risk-score sensitivity, and reset all local data. Settings are persisted to localStorage."
      />

      <SettingsCard Icon={Moon} title="Theme" subtitle="Light mode is on the roadmap; dark is the only theme for v1.">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <ThemeRow
            Icon={Moon}
            label="Dark"
            description="Active. Uses the indigo→violet brand scale."
            active
          />
          <ThemeRow
            Icon={Sun}
            label="Light"
            description="Coming soon."
            disabled
          />
        </div>
      </SettingsCard>

      <SettingsCard
        Icon={Code2}
        title="Default Solidity version"
        subtitle="Picked at scan time and recorded in the report."
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {SUPPORTED_SOLIDITY_VERSIONS.map((version) => (
            <RadioCard
              key={version}
              label={version}
              description={
                version === '0.8.20'
                  ? 'Default · broadly deployed'
                  : version === '0.8.24'
                    ? 'PUSH0 + Cancun-aware'
                    : 'Latest · 0.8.26 stable'
              }
              selected={settings.solidityVersion === version}
              onClick={() => setSolidityVersion(version as SolidityVersion)}
            />
          ))}
        </div>
      </SettingsCard>

      <SettingsCard
        Icon={Sliders}
        title="Risk-score sensitivity"
        subtitle="Multiplies the weighted sum of findings (low × 0.7, medium × 1, high × 1.3)."
      >
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {SUPPORTED_SENSITIVITIES.map((value) => (
            <RadioCard
              key={value}
              label={capitalize(value)}
              description={
                value === 'low'
                  ? 'Conservative · ignores noise'
                  : value === 'medium'
                    ? 'Balanced (default)'
                    : 'Aggressive · flags every signal'
              }
              selected={settings.sensitivity === value}
              onClick={() => setSensitivity(value as RiskSensitivityType)}
            />
          ))}
        </div>
      </SettingsCard>

      <SettingsCard
        Icon={Trash2}
        title="Reset all data"
        subtitle="Clears the localStorage entries for settings and scan history."
        tone="destructive"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-text-muted">
            {history.length === 0
              ? 'No scan history to clear.'
              : `Currently ${history.length} scan${history.length === 1 ? '' : 's'} stored locally.`}
          </p>
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-risk-critical px-3.5 py-2 text-sm font-medium text-white shadow-panel transition hover:bg-red-600"
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" />
            <span>Reset all data</span>
          </button>
        </div>
      </SettingsCard>

      <ConfirmDialog
        open={showResetConfirm}
        title="Reset all local data?"
        description="This will clear your Solidity version + sensitivity preferences and delete all stored scan history from this device. This action cannot be undone."
        confirmLabel="Reset everything"
        confirmTone="destructive"
        onConfirm={handleReset}
        onCancel={() => setShowResetConfirm(false)}
      />

      <p className="text-center font-mono text-[11px] text-text-muted">
        Defaults: Solidity {DEFAULT_SETTINGS.solidityVersion} · sensitivity{' '}
        {DEFAULT_SETTINGS.sensitivity} · theme {DEFAULT_SETTINGS.theme}
      </p>
    </div>
  );
}

interface SettingsCardProps {
  Icon: typeof SettingsIcon;
  title: string;
  subtitle: string;
  tone?: 'default' | 'destructive';
  children: React.ReactNode;
}

function SettingsCard({
  Icon,
  title,
  subtitle,
  tone = 'default',
  children,
}: SettingsCardProps): JSX.Element {
  return (
    <section
      className={[
        'rounded-2xl border p-4 shadow-panel sm:p-5',
        tone === 'destructive'
          ? 'border-risk-critical/30 bg-risk-critical/5'
          : 'border-border-subtle bg-surface-panel',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={[
            'grid h-9 w-9 shrink-0 place-items-center rounded-lg ring-1',
            tone === 'destructive'
              ? 'bg-risk-critical/15 text-risk-critical ring-risk-critical/30'
              : 'bg-brand-500/15 text-brand-300 ring-brand-500/30',
          ].join(' ')}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

interface RadioCardProps {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}

function RadioCard({ label, description, selected, onClick }: RadioCardProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        'focus-ring flex w-full flex-col items-start gap-1 rounded-xl border p-3 text-left transition',
        selected
          ? 'border-brand-500/60 bg-brand-500/10 shadow-panel'
          : 'border-border-subtle bg-surface-elevated/30 hover:border-border-strong hover:bg-surface-elevated/60',
      ].join(' ')}
    >
      <span className="flex w-full items-center justify-between gap-2">
        <span className="text-sm font-medium text-text-primary">{label}</span>
        <span
          aria-hidden="true"
          className={[
            'grid h-4 w-4 place-items-center rounded-full border',
            selected ? 'border-brand-400 bg-brand-500' : 'border-border-strong',
          ].join(' ')}
        >
          {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
        </span>
      </span>
      {description && <p className="text-xs text-text-muted">{description}</p>}
    </button>
  );
}

interface ThemeRowProps {
  Icon: typeof Moon;
  label: string;
  description: string;
  active?: boolean;
  disabled?: boolean;
}

function ThemeRow({ Icon, label, description, active = false, disabled = false }: ThemeRowProps): JSX.Element {
  return (
    <div
      className={[
        'flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5',
        active
          ? 'border-brand-500/60 bg-brand-500/10'
          : 'border-border-subtle bg-surface-elevated/30',
        disabled ? 'opacity-60' : '',
      ].join(' ')}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={[
            'grid h-8 w-8 place-items-center rounded-lg ring-1',
            active
              ? 'bg-brand-500/20 text-brand-200 ring-brand-500/30'
              : 'bg-surface-muted text-text-muted ring-border-subtle',
          ].join(' ')}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-medium text-text-primary">
            {label}
            {disabled && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-surface-muted px-1.5 py-0.5 font-mono text-[11px] text-text-muted ring-1 ring-border-subtle">
                <Lock aria-hidden="true" className="h-3 w-3" />
                <span>soon</span>
              </span>
            )}
          </p>
          <p className="text-xs text-text-muted">{description}</p>
        </div>
      </div>
      <button
        type="button"
        disabled={disabled}
        aria-pressed={active}
        className={[
          'focus-ring relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition',
          active ? 'bg-brand-500' : 'bg-surface-muted',
          disabled ? 'cursor-not-allowed' : '',
        ].join(' ')}
      >
        <span
          className={[
            'inline-block h-5 w-5 transform rounded-full bg-white shadow transition',
            active ? 'translate-x-5' : 'translate-x-0.5',
          ].join(' ')}
        />
      </button>
    </div>
  );
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
}

export default SettingsPage;
