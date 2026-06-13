import type {
  AgentContribution,
  AgentId,
  AgentProgressUpdate,
  AgentState,
  GasTip,
  Report,
  RiskSensitivity,
  Severity,
  Suggestion,
  Vulnerability,
} from './reportTypes';
import { AGENTS, AGENTS_BY_ID } from './agentConfig';
import { scanForPatterns, VULNERABILITY_PATTERNS, type RawMatch } from '../data/vulnerabilityPatterns';

/**
 * Per-agent jittered wall-clock budget in milliseconds.  The scan
 * engine picks a random duration in `[MIN_AGENT_MS, MAX_AGENT_MS]`
 * for each agent and splits it into a handful of progress ticks so
 * the UI bar moves smoothly.  With four agents, the total wall-clock
 * budget lands in roughly 2.0–3.6s, in the spirit of the AC-5
 * 2.5–4.0s verification signal.
 */
const MIN_AGENT_MS = 500;
const MAX_AGENT_MS = 900;
const TICKS_PER_AGENT = 4;

/** Severity weights for the composite risk score (per the plan). */
const SEVERITY_WEIGHTS: Readonly<Record<Severity, number>> = {
  critical: 25,
  medium: 10,
  low: 3,
  info: 1,
};

/** Sensitivity multiplies the raw weighted sum. */
const SENSITIVITY_MULTIPLIER: Readonly<Record<RiskSensitivity, number>> = {
  low: 0.7,
  medium: 1,
  high: 1.3,
};

const DEFAULT_SENSITIVITY: RiskSensitivity = 'medium';
const DEFAULT_SOLIDITY_VERSION = '0.8.20';

/**
 * Deterministic 32-bit FNV-1a hash. Used to seed the simulated RNG so
 * the same source code always produces the same report (the user can
 * re-scan and see identical results, which makes the demo predictable).
 */
function hashCode(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  // Pad to 8 hex chars for a stable, human-friendly identifier.
  return h.toString(16).padStart(8, '0');
}

/** Small seedable LCG. Not cryptographic — only used for demo variation. */
function createRng(seed: number): () => number {
  let s = seed >>> 0;
  if (s === 0) s = 1;
  return () => {
    // Numerical Recipes LCG constants.
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x1_0000_0000;
  };
}

function pickInRange(rng: () => number, min: number, max: number): number {
  return Math.floor(min + rng() * (max - min + 1));
}

function pickOne<T>(rng: () => number, items: readonly T[]): T {
  if (items.length === 0) {
    // Unreachable in practice (callers pass non-empty arrays), but the
    // function is total so the type system is happy.
    throw new Error('pickOne called with an empty array');
  }
  const idx = Math.min(items.length - 1, Math.floor(rng() * items.length));
  // `noUncheckedIndexedAccess` is on, so guard explicitly.
  return items[idx] ?? items[0]!;
}

/**
 * Cancellable sleep. Resolves after `ms`, or rejects with an
 * `AbortError` if `signal` fires first. Used by the engine to keep
 * the simulated agents on screen long enough to be observable.
 */
function abortableSleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(makeAbortError());
      return;
    }
    const id = window.setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = (): void => {
      window.clearTimeout(id);
      reject(makeAbortError());
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

function makeAbortError(): Error {
  // `DOMException` is the WHATWG-standard way to surface cancellation;
  // falling back to a plain Error keeps Node test environments happy.
  if (typeof DOMException !== 'undefined') {
    return new DOMException('Scan cancelled', 'AbortError');
  }
  const err = new Error('Scan cancelled');
  err.name = 'AbortError';
  return err;
}

/**
 * Build the initial `AgentState` for one agent.  Every agent starts
 * in `pending` with a friendly queueing message.
 */
function initialAgentState(id: AgentId): AgentState {
  const def = AGENTS_BY_ID[id];
  return {
    id: def.id,
    name: def.name,
    description: def.description,
    accentClass: def.accentClass,
    status: 'pending',
    progress: 0,
    message: 'Queued',
    durationMs: 0,
  };
}

function emit(
  onProgress: (update: AgentProgressUpdate) => void,
  state: AgentState,
  elapsedMs: number,
  aborted: boolean,
): void {
  onProgress({
    agent: state.id,
    status: state.status,
    progress: state.progress,
    message: state.message,
    elapsedMs,
    aborted,
  });
}

/**
 * Drive one agent from `pending → running → done` with periodic
 * progress updates. Throws via `abortableSleep` if the signal aborts
 * mid-flight.
 */
async function runAgent(
  state: AgentState,
  totalBudgetMs: number,
  startMs: number,
  onProgress: (update: AgentProgressUpdate) => void,
  signal: AbortSignal,
): Promise<void> {
  // Mark as running.
  state.status = 'running';
  state.message = 'Initialising…';
  state.progress = 0;
  emit(onProgress, state, performance.now() - startMs, false);

  const tickMs = Math.max(40, Math.floor(totalBudgetMs / TICKS_PER_AGENT));
  let elapsed = 0;
  for (let tick = 1; tick <= TICKS_PER_AGENT; tick++) {
    const remaining = totalBudgetMs - elapsed;
    const slice = Math.min(tickMs, remaining);
    await abortableSleep(slice, signal);
    elapsed += slice;
    state.progress = Math.min(100, Math.round((elapsed / totalBudgetMs) * 100));
    state.message = runningMessage(state.id, state.progress);
    emit(onProgress, state, performance.now() - startMs, false);
  }

  state.status = 'done';
  state.progress = 100;
  state.message = doneMessage(state.id);
  state.durationMs = totalBudgetMs;
  emit(onProgress, state, performance.now() - startMs, false);
}

function runningMessage(id: AgentId, progress: number): string {
  switch (id) {
    case 'staticAnalyzer':
      if (progress < 30) return 'Lexing source…';
      if (progress < 60) return 'Matching vulnerability patterns…';
      if (progress < 90) return 'Cross-referencing known CVEs…';
      return 'Compiling findings…';
    case 'symbolicExecutor':
      if (progress < 30) return 'Building control-flow graph…';
      if (progress < 60) return 'Exploring branch predicates…';
      if (progress < 90) return 'Tracing state mutations…';
      return 'Synthesising path coverage…';
    case 'aiReviewer':
      if (progress < 30) return 'Reading findings…';
      if (progress < 60) return 'Drafting remediation snippets…';
      if (progress < 90) return 'Ranking by exploitability…';
      return 'Polishing summary…';
    case 'gasOptimizer':
      if (progress < 30) return 'Scanning storage layout…';
      if (progress < 60) return 'Profiling loop bounds…';
      if (progress < 90) return 'Estimating call costs…';
      return 'Summarising gas tips…';
  }
}

function doneMessage(id: AgentId): string {
  switch (id) {
    case 'staticAnalyzer':
      return 'Static rules complete';
    case 'symbolicExecutor':
      return 'Path coverage complete';
    case 'aiReviewer':
      return 'Remediation drafted';
    case 'gasOptimizer':
      return 'Gas profile ready';
  }
}

// ---------------------------------------------------------------------------
// Per-agent content generation
// ---------------------------------------------------------------------------

function toLineRange(line: number, span = 1): { start: number; end: number } {
  return { start: line, end: line + Math.max(0, span - 1) };
}

function buildVulnerabilities(
  rawMatches: readonly RawMatch[],
): readonly Vulnerability[] {
  return rawMatches.map((match, index) => ({
    id: `vuln-${match.pattern.id}-${match.line}-${index}`,
    title: match.pattern.title,
    category: match.pattern.category,
    severity: match.pattern.severity,
    lineRange: toLineRange(match.line, 1),
    description: match.pattern.description,
    snippet: match.matchedText.trim(),
    source: 'staticAnalyzer',
  }));
}

const SYMBOLIC_FINDINGS: ReadonlyArray<{
  id: string;
  title: string;
  category: string;
  severity: Severity;
  description: string;
  regex: RegExp;
}> = [
  {
    id: 'symbolic-missing-zero-check',
    title: 'Missing zero-address check',
    category: 'Input Validation',
    severity: 'low',
    description:
      'Symbolic execution flagged an address parameter that is forwarded to a low-level call without a `require(addr != address(0))` guard. While not exploitable in isolation, it is a common foot-gun during upgrades.',
    regex: /\b(address\s+\w+\s*[,)]|payable\s*\(\s*address\s*\(\s*\w+\s*\)\s*\))/,
  },
  {
    id: 'symbolic-public-mint',
    title: 'Public function that mutates balances without access guard',
    category: 'Access Control',
    severity: 'info',
    description:
      'A function modifies the `balances` mapping without any `onlyOwner` / role check. Symbolic execution walked the call graph and found no upstream guard; confirm this is intentional.',
    regex: /\bfunction\s+\w+\s*\([^)]*\)\s*public[^{]*\{[^}]*balances\s*\[/,
  },
  {
    id: 'symbolic-unchecked-arith',
    title: 'Arithmetic in legacy pre-0.8 block (no SafeMath)',
    category: 'Arithmetic',
    severity: 'info',
    description:
      'Symbolic execution found arithmetic inside what looks like a Solidity < 0.8 block (no `using SafeMath for ...` declaration). Confirm overflow safety before deployment.',
    regex: /\busing\s+SafeMath\b/,
  },
];

/**
 * Add "path coverage" findings that complement the regex bank with
 * control-flow-aware observations. We keep them `info` / `low` so
 * they don't double-count the regex-driven score.
 */
function buildSymbolicFindings(
  code: string,
  baseVulns: readonly Vulnerability[],
): readonly Vulnerability[] {
  const lines = code.split('\n');
  const out: Vulnerability[] = [];
  const seen = new Set<string>();
  for (const finding of SYMBOLIC_FINDINGS) {
    const re = new RegExp(finding.regex.source, finding.regex.flags);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? '';
      re.lastIndex = 0;
      if (!re.test(line)) continue;
      // Skip lines already covered by a more severe base vuln.
      const overlap = baseVulns.some(
        (v) => v.lineRange.start === i + 1,
      );
      if (overlap) continue;
      const key = `${finding.id}:${i + 1}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        id: `vuln-${finding.id}-${i + 1}`,
        title: finding.title,
        category: finding.category,
        severity: finding.severity,
        lineRange: toLineRange(i + 1, 1),
        description: finding.description,
        snippet: line.trim(),
        source: 'symbolicExecutor',
      });
    }
  }
  return out;
}

function buildSuggestions(
  vulns: readonly Vulnerability[],
  rng: () => number,
): readonly Suggestion[] {
  return vulns.map((vuln) => {
    const pattern = VULNERABILITY_PATTERNS.find((p) => vuln.id.startsWith(`vuln-${p.id}-`));
    const remediation = pattern?.remediation ?? genericRemediation(vuln, rng);
    return {
      id: `sugg-${vuln.id}`,
      vulnerabilityId: vuln.id,
      title: `Fix: ${vuln.title}`,
      description: pattern?.description ?? vuln.description,
      remediation,
      lineRange: vuln.lineRange,
    };
  });
}

function genericRemediation(vuln: Vulnerability, rng: () => number): string {
  const tip = pickOne(rng, [
    'Add a `require` guard before the affected operation.',
    'Split the function so the dangerous branch is in a private helper.',
    'Document the assumption in a NatSpec `@dev` comment.',
  ]);
  return `Line ${vuln.lineRange.start}: ${tip}`;
}

const GAS_TIPS: ReadonlyArray<{
  id: string;
  title: string;
  description: string;
  regex: RegExp;
  estimatedGasSavings: number;
  snippet: string;
}> = [
  {
    id: 'gas-uint-vs-uint256',
    title: 'Pack smaller uints into 32-byte slots',
    description:
      'Solidity stores each `uint256` in a full 32-byte storage slot. Pack adjacent `uint128` / `uint64` / `bool` fields into a single struct to save one SSTORE per write.',
    regex: /\b(uint256|uint|int)\s+\w+\s*;\s*\n\s*(uint256|uint|int)\s+\w+\s*;/m,
    estimatedGasSavings: 20_000,
    snippet: 'struct VaultState { uint128 lockedUntil; uint128 balance; }',
  },
  {
    id: 'gas-cache-storage-read',
    title: 'Cache storage reads in a local variable',
    description:
      'Each `SLOAD` costs 2,100 gas (warm) or 100 gas (cold after the first read). Inside a loop, cache `storage.var` in a local to avoid repeated SLOADs.',
    regex: /\bfor\s*\([^)]*\{[^}]*\b\w+\.length\b[^}]*\}/m,
    estimatedGasSavings: 2_100,
    snippet: 'uint256 len = array.length; for (uint256 i; i < len; ++i) { ... }',
  },
  {
    id: 'gas-unchecked-loop',
    title: 'Use `unchecked { ++i; }` in bounded loops',
    description:
      'Solidity 0.8+ inserts overflow checks on every `++i`. In a loop bounded by `array.length`, the wrap-around is impossible; wrap the increment in `unchecked { }` to save ~30–40 gas per iteration.',
    regex: /\bfor\s*\([^)]*;\s*\w+\s*<\s*\w+\.length\s*;[^)]*\+\+\w+\)/,
    estimatedGasSavings: 35,
    snippet: 'for (uint256 i; i < len;) { /* body */ unchecked { ++i; } }',
  },
  {
    id: 'gas-calldata-vs-memory',
    title: 'Use `calldata` instead of `memory` for external function parameters',
    description:
      'External functions that only read their arguments can use `calldata` to avoid a memory copy. For long strings / structs this saves hundreds of gas per call.',
    regex: /\bfunction\s+\w+\s*\([^)]*string\s+memory\b/,
    estimatedGasSavings: 200,
    snippet: 'function foo(string calldata name) external pure returns (uint256) { ... }',
  },
];

function buildGasTips(
  code: string,
  rawMatches: readonly RawMatch[],
): readonly GasTip[] {
  const lines = code.split('\n');
  const out: GasTip[] = [];
  const seen = new Set<string>();

  // Pull the gas-savings that ride along with each static finding.
  for (const match of rawMatches) {
    if (!match.pattern.gasSavings) continue;
    const key = `inline-${match.pattern.id}-${match.line}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      id: `gas-inline-${match.pattern.id}-${match.line}`,
      title: match.pattern.gasSavings.title,
      description: match.pattern.gasSavings.description,
      estimatedGasSavings: match.pattern.gasSavings.estimatedGasSavings,
      lineRange: toLineRange(match.line, 1),
    });
  }

  // Add the structural gas tips.
  for (const tip of GAS_TIPS) {
    const re = new RegExp(tip.regex.source, tip.regex.flags);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? '';
      re.lastIndex = 0;
      if (!re.test(line)) continue;
      const key = `${tip.id}-${i + 1}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        id: `gas-${tip.id}-${i + 1}`,
        title: tip.title,
        description: tip.description,
        estimatedGasSavings: tip.estimatedGasSavings,
        lineRange: toLineRange(i + 1, 1),
        snippet: tip.snippet,
      });
      // One match per tip is enough.
      break;
    }
  }

  return out;
}

function buildSummary(
  codeHash: string,
  vulns: readonly Vulnerability[],
  riskScore: number,
): string {
  const counts = vulns.reduce<Record<Severity, number>>(
    (acc, v) => {
      acc[v.severity] += 1;
      return acc;
    },
    { critical: 0, medium: 0, low: 0, info: 0 },
  );
  const criticalPhrase =
    counts.critical > 0
      ? `${counts.critical} critical`
      : counts.medium > 0
        ? `${counts.medium} medium`
        : counts.low > 0
          ? `${counts.low} low`
          : 'no material';
  return [
    `Risk score ${riskScore}/100.`,
    `The multi-agent pipeline surfaced ${criticalPhrase} finding${vulns.length === 1 ? '' : 's'}`,
    `across ${counts.critical + counts.medium + counts.low + counts.info} total issue${vulns.length === 1 ? '' : 's'}.`,
    `Review the suggestions and gas tips below before deploying.`,
    `Source fingerprint: ${codeHash}.`,
  ].join(' ');
}

function computeRiskScore(
  vulns: readonly Vulnerability[],
  sensitivity: RiskSensitivity,
): number {
  const raw = vulns.reduce<number>((sum, v) => sum + SEVERITY_WEIGHTS[v.severity], 0);
  const scaled = raw * SENSITIVITY_MULTIPLIER[sensitivity];
  return Math.max(0, Math.min(100, Math.round(scaled)));
}

// ---------------------------------------------------------------------------
// Public surface
// ---------------------------------------------------------------------------

/**
 * Optional knobs the Auditor can pass to override the engine defaults.
 * Kept narrow on purpose — the engine only exposes the two levers the
 * Settings page lets the user change.
 */
export interface RunScanOptions {
  readonly sensitivity?: RiskSensitivity;
  readonly solidityVersion?: string;
}

/**
 * Run the simulated multi-agent scan against `code` and resolve with a
 * complete `Report`. The function is deterministic with respect to
 * `code` (same code → same report) and cancellable via `signal`.
 *
 * - `onProgress` is invoked with each `AgentProgressUpdate`. The first
 *   event is emitted synchronously so the UI can show the initial
 *   agent grid before the first tick fires.
 * - `signal` aborts the entire scan; in-flight `setTimeout`s are
 *   cleared, the current agent is marked `cancelled`, and the
 *   returned promise rejects with an `AbortError`.
 * - `options` lets the caller override the default sensitivity and
 *   Solidity version; both are recorded in the resulting `Report`.
 */
export async function runScan(
  code: string,
  onProgress: (update: AgentProgressUpdate) => void,
  signal: AbortSignal,
  options: RunScanOptions = {},
): Promise<Report> {
  if (signal.aborted) {
    throw makeAbortError();
  }

  const startMs = performance.now();
  const codeHash = hashCode(code);
  const seed = parseInt(codeHash, 16) || 1;
  const rng = createRng(seed);

  // Initial emission so the UI can render the agent grid at t=0.
  for (const def of AGENTS) {
    const state = initialAgentState(def.id);
    emit(onProgress, state, 0, false);
  }

  const states: AgentState[] = AGENTS.map((def) => initialAgentState(def.id));
  const contributions: AgentContribution[] = [];

  // Per-agent wall-clock budget, jittered.  We materialise these
  // BEFORE the loop so the four-agent "stagger" is consistent.
  const budgets: Record<AgentId, number> = {
    staticAnalyzer: pickInRange(rng, MIN_AGENT_MS, MAX_AGENT_MS),
    symbolicExecutor: pickInRange(rng, MIN_AGENT_MS, MAX_AGENT_MS),
    aiReviewer: pickInRange(rng, MIN_AGENT_MS, MAX_AGENT_MS),
    gasOptimizer: pickInRange(rng, MIN_AGENT_MS, MAX_AGENT_MS),
  };

  // ----- Static Analyzer -------------------------------------------------
  const staticState = states[0]!;
  const rawMatches = scanForPatterns(code);
  const staticVulns = buildVulnerabilities(rawMatches);
  await runAgent(staticState, budgets.staticAnalyzer, startMs, onProgress, signal);
  contributions.push(makeContribution(staticState, staticVulns.length));

  // ----- Symbolic Executor -----------------------------------------------
  const symbolicState = states[1]!;
  const symbolicVulns = buildSymbolicFindings(code, staticVulns);
  await runAgent(
    symbolicState,
    budgets.symbolicExecutor,
    startMs,
    onProgress,
    signal,
  );
  contributions.push(makeContribution(symbolicState, symbolicVulns.length));

  // ----- AI Security Reviewer --------------------------------------------
  const aiState = states[2]!;
  const allVulns = [...staticVulns, ...symbolicVulns];
  const suggestions = buildSuggestions(allVulns, rng);
  await runAgent(aiState, budgets.aiReviewer, startMs, onProgress, signal);
  contributions.push(makeContribution(aiState, suggestions.length));

  // ----- Gas Optimizer ---------------------------------------------------
  const gasState = states[3]!;
  const gasTips = buildGasTips(code, rawMatches);
  await runAgent(gasState, budgets.gasOptimizer, startMs, onProgress, signal);
  contributions.push(makeContribution(gasState, gasTips.length));

  const totalDurationMs = Math.round(performance.now() - startMs);
  const sensitivity: RiskSensitivity = options.sensitivity ?? DEFAULT_SENSITIVITY;
  const solidityVersion = options.solidityVersion ?? DEFAULT_SOLIDITY_VERSION;
  const riskScore = computeRiskScore(allVulns, sensitivity);
  const summary = buildSummary(codeHash, allVulns, riskScore);

  return {
    id: `report-${codeHash}-${totalDurationMs}`,
    createdAt: new Date().toISOString(),
    code,
    codeHash,
    summary,
    riskScore,
    vulnerabilities: allVulns,
    suggestions,
    gasTips,
    totalDurationMs,
    agentContributions: contributions,
    solidityVersion,
    sensitivity,
  };
}

function makeContribution(state: AgentState, findings: number): AgentContribution {
  return {
    id: state.id,
    name: state.name,
    durationMs: state.durationMs,
    status: state.status,
    findings,
  };
}
