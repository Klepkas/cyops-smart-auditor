/**
 * Type definitions for the simulated multi-agent scan pipeline.
 *
 * This module is the single source of truth for the data shapes that
 * flow through the scan engine, the React hook, and the report UI. It
 * is intentionally decoupled from any runtime concerns (no functions,
 * no React imports) so it can be imported from any layer — including
 * the Report rendering surface that lands in AC-6.
 *
 * No `any` lives in this file (AC-11). All arrays are `readonly`, all
 * objects use `readonly` fields where the consumer should not mutate
 * them, and discriminated unions (`AgentStatus`, `Severity`) drive the
 * UI's type-narrowed branches.
 */

/** Severity of a finding. Drives badge color, table sort, and score. */
export type Severity = 'critical' | 'medium' | 'low' | 'info';

/** Static identifier for one of the four simulated review agents. */
export type AgentId =
  | 'staticAnalyzer'
  | 'symbolicExecutor'
  | 'aiReviewer'
  | 'gasOptimizer';

/** Lifecycle of a single agent. */
export type AgentStatus = 'pending' | 'running' | 'done' | 'cancelled';

/**
 * The immutable description of an agent (id + name + tagline). The
 * `status` / `progress` / `message` fields are mutable per-scan and live
 * on `AgentState` instead.
 */
export interface AgentDefinition {
  readonly id: AgentId;
  readonly name: string;
  readonly description: string;
  /** Tailwind text-color class for the agent's icon row, keyed off brand tokens. */
  readonly accentClass: string;
}

/** Per-agent runtime state, mutated as the scan progresses. */
export interface AgentState extends AgentDefinition {
  status: AgentStatus;
  /** 0–100 inclusive. */
  progress: number;
  /** Short, human-readable status text shown next to the spinner. */
  message: string;
  /** Wall-clock milliseconds spent in the running state (set on done). */
  durationMs: number;
}

/** A single progress event emitted by the engine. */
export interface AgentProgressUpdate {
  agent: AgentId;
  status: AgentStatus;
  progress: number;
  message: string;
  elapsedMs: number;
  /** True if the entire scan was aborted (not just the current agent). */
  aborted: boolean;
}

/** Inclusive 1-based line range in the original source. */
export interface LineRange {
  readonly start: number;
  readonly end: number;
}

/** A vulnerability surfaced by the static analyzer or symbolic executor. */
export interface Vulnerability {
  readonly id: string;
  readonly title: string;
  readonly category: string;
  readonly severity: Severity;
  readonly lineRange: LineRange;
  readonly description: string;
  /** Optional short source snippet for context. */
  readonly snippet?: string;
  /** Which agent surfaced this finding. */
  readonly source: AgentId;
}

/** A remediation suggestion tied to a specific vulnerability. */
export interface Suggestion {
  readonly id: string;
  readonly vulnerabilityId: string;
  readonly title: string;
  readonly description: string;
  /** Markdown-ish text block with the suggested fix. */
  readonly remediation: string;
  readonly lineRange: LineRange;
}

/** A gas-optimization tip (no required vulnerability). */
export interface GasTip {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  /** Estimated gas savings per call (an integer; the UI formats it). */
  readonly estimatedGasSavings: number;
  readonly lineRange?: LineRange;
  /** Optional short code snippet illustrating the fix. */
  readonly snippet?: string;
}

/** Per-agent attribution stored in the report. */
export interface AgentContribution {
  readonly id: AgentId;
  readonly name: string;
  readonly durationMs: number;
  readonly status: AgentStatus;
  /** How many findings this agent produced (vulns, suggestions, or tips). */
  readonly findings: number;
}

/** A complete audit report — the result of one scan. */
export interface Report {
  readonly id: string;
  /** ISO-8601 timestamp captured when the scan completed. */
  readonly createdAt: string;
  readonly code: string;
  /** Deterministic hash of the source code (used for history dedupe). */
  readonly codeHash: string;
  /** One-paragraph natural-language summary produced by the AI reviewer. */
  readonly summary: string;
  /** 0–100 inclusive. Drives the gauge color in AC-6. */
  readonly riskScore: number;
  readonly vulnerabilities: readonly Vulnerability[];
  readonly suggestions: readonly Suggestion[];
  readonly gasTips: readonly GasTip[];
  /** Wall-clock ms from the first agent to the last (excludes pre-scan time). */
  readonly totalDurationMs: number;
  readonly agentContributions: readonly AgentContribution[];
  /** The Solidity version the user had selected at scan time (AC-9). */
  readonly solidityVersion: string;
  /** The risk-score sensitivity the user had selected at scan time (AC-9). */
  readonly sensitivity: RiskSensitivity;
}

/** Risk-score sensitivity selector. Wired to the Settings page in AC-9. */
export type RiskSensitivity = 'low' | 'medium' | 'high';

/** A short, ordered list of severities used by the table grouping (AC-6). */
export const SEVERITY_ORDER: readonly Severity[] = [
  'critical',
  'medium',
  'low',
  'info',
] as const;
