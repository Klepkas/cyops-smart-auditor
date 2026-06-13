import { useCallback, useEffect, useState } from 'react';
import type { RiskSensitivity } from '../lib/reportTypes';

/**
 * `useSettings` — localStorage-backed user preferences
 * (key: `smart-auditor:settings`).
 *
 * Three values, all optional, all with safe defaults so a corrupt /
 * missing localStorage entry doesn't crash the app:
 *
 *   - `solidityVersion`: '0.8.20' | '0.8.24' | '0.8.26'
 *   - `sensitivity`:     'low'    | 'medium'    | 'high'
 *   - `theme`:           'dark'   — locked, the UI never sets anything else
 *
 * Theme is included in the type for completeness; v1 only ships dark
 * and the Settings page shows the toggle as a disabled "coming soon".
 */

const SETTINGS_KEY = 'smart-auditor:settings';

export const SUPPORTED_SOLIDITY_VERSIONS = ['0.8.20', '0.8.24', '0.8.26'] as const;
export type SolidityVersion = (typeof SUPPORTED_SOLIDITY_VERSIONS)[number];

export type Theme = 'dark';

export const SUPPORTED_SENSITIVITIES: readonly RiskSensitivity[] = ['low', 'medium', 'high'];

export interface AppSettings {
  solidityVersion: SolidityVersion;
  sensitivity: RiskSensitivity;
  theme: Theme;
}

export const DEFAULT_SETTINGS: AppSettings = {
  solidityVersion: '0.8.20',
  sensitivity: 'medium',
  theme: 'dark',
};

function isSolidityVersion(value: unknown): value is SolidityVersion {
  return typeof value === 'string'
    && (SUPPORTED_SOLIDITY_VERSIONS as readonly string[]).includes(value);
}

function isSensitivity(value: unknown): value is RiskSensitivity {
  return value === 'low' || value === 'medium' || value === 'high';
}

function read(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_SETTINGS;
    const obj = parsed as Partial<AppSettings>;
    return {
      solidityVersion: isSolidityVersion(obj.solidityVersion)
        ? obj.solidityVersion
        : DEFAULT_SETTINGS.solidityVersion,
      sensitivity: isSensitivity(obj.sensitivity)
        ? obj.sensitivity
        : DEFAULT_SETTINGS.sensitivity,
      theme: 'dark',
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function write(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Quota / private mode — ignore.
  }
}

export interface UseSettingsResult {
  settings: AppSettings;
  setSolidityVersion: (version: SolidityVersion) => void;
  setSensitivity: (sensitivity: RiskSensitivity) => void;
  reset: () => void;
}

/**
 * Persistence + accessor for the user-facing preferences. The
 * Auditor's scan engine reads `sensitivity` at scan time so changing
 * it here directly affects the next run.
 */
export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState<AppSettings>(read);

  // Cross-tab sync.
  useEffect(() => {
    function onStorage(event: StorageEvent): void {
      if (event.key !== SETTINGS_KEY) return;
      setSettings(read());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const update = useCallback((patch: Partial<AppSettings>): void => {
    setSettings((prev) => {
      const next: AppSettings = { ...prev, ...patch, theme: 'dark' };
      write(next);
      return next;
    });
  }, []);

  const setSolidityVersion = useCallback(
    (version: SolidityVersion): void => update({ solidityVersion: version }),
    [update],
  );
  const setSensitivity = useCallback(
    (sensitivity: RiskSensitivity): void => update({ sensitivity }),
    [update],
  );
  const reset = useCallback((): void => {
    setSettings(() => {
      write(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    });
  }, []);

  return { settings, setSolidityVersion, setSensitivity, reset };
}
