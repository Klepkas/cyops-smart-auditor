import type { Severity } from './reportTypes';

/**
 * Severity colour + label helpers.
 *
 * The Tailwind tokens live in `tailwind.config.ts` (`risk.critical`,
 * `risk.medium`, `risk.low`, `risk.info`). Because Tailwind only
 * generates classes it can see at build time, we expose both the raw
 * hex and a class-friendly set. The class is only emitted in this
 * file (and the audit components) so Tailwind picks it up.
 */

export interface SeverityMeta {
  readonly label: string;
  /** Tailwind text- class. */
  readonly textClass: string;
  /** Tailwind bg- class with /20 opacity for soft tiles. */
  readonly bgClass: string;
  /** Tailwind ring- class with /30 opacity for badges. */
  readonly ringClass: string;
  /** Plain hex (for the gauge stroke + charts). */
  readonly hex: string;
}

export const SEVERITY_META: Readonly<Record<Severity, SeverityMeta>> = {
  critical: {
    label: 'Critical',
    textClass: 'text-risk-critical',
    bgClass: 'bg-risk-critical/15',
    ringClass: 'ring-risk-critical/30',
    hex: '#ef4444',
  },
  medium: {
    label: 'Medium',
    textClass: 'text-risk-medium',
    bgClass: 'bg-risk-medium/15',
    ringClass: 'ring-risk-medium/30',
    hex: '#f59e0b',
  },
  low: {
    label: 'Low',
    textClass: 'text-risk-low',
    bgClass: 'bg-risk-low/15',
    ringClass: 'ring-risk-low/30',
    hex: '#22c55e',
  },
  info: {
    label: 'Info',
    textClass: 'text-risk-info',
    bgClass: 'bg-risk-info/15',
    ringClass: 'ring-risk-info/30',
    hex: '#3b82f6',
  },
};

export function severityMeta(severity: Severity): SeverityMeta {
  return SEVERITY_META[severity];
}

/** The risk-score band a 0-100 score falls into. */
export type RiskBand = 'low' | 'medium' | 'critical';

export interface RiskBandMeta {
  readonly band: RiskBand;
  readonly label: string;
  readonly textClass: string;
  readonly hex: string;
}

export function riskBandFor(score: number): RiskBandMeta {
  if (score >= 70) {
    return {
      band: 'critical',
      label: 'Critical',
      textClass: 'text-risk-critical',
      hex: SEVERITY_META.critical.hex,
    };
  }
  if (score >= 40) {
    return {
      band: 'medium',
      label: 'Moderate',
      textClass: 'text-risk-medium',
      hex: SEVERITY_META.medium.hex,
    };
  }
  return {
    band: 'low',
    label: 'Healthy',
    textClass: 'text-risk-low',
    hex: SEVERITY_META.low.hex,
  };
}

/** Format a gas-savings integer as a human-friendly string. */
export function formatGasSavings(savings: number): string {
  if (savings >= 1000) {
    return `~${(savings / 1000).toFixed(savings % 1000 === 0 ? 0 : 1)}k gas`;
  }
  return `~${savings.toLocaleString()} gas`;
}

/** Format a "L42-L48" style line range label. */
export function formatLineRange(start: number, end: number): string {
  if (start === end) return `Line ${start}`;
  return `Lines ${start}-${end}`;
}
