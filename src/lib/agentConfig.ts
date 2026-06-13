import type { AgentDefinition, AgentId } from './reportTypes';

/**
 * The four simulated review agents, in the order they execute.
 *
 * Names, descriptions, and accent colors are intentionally the same
 * shape that the UI renders as the row header, the per-agent spinner
 * label, and the "current step" badge in the progress panel. The order
 * here is the visual order in the AgentProgress list and the execution
 * order in `scanEngine.runScan`.
 *
 * Adding a new agent: append to this array, extend the `AgentId` union
 * in `reportTypes.ts`, and implement the per-agent pass in `scanEngine`.
 * No other file needs to know that an agent exists.
 */
export const AGENTS: readonly AgentDefinition[] = [
  {
    id: 'staticAnalyzer',
    name: 'Static Analyzer',
    description: 'Regex + AST rules for known Solidity pitfalls',
    accentClass: 'text-brand-300',
  },
  {
    id: 'symbolicExecutor',
    name: 'Symbolic Executor',
    description: 'Path-coverage and control-flow exploration',
    accentClass: 'text-risk-info',
  },
  {
    id: 'aiReviewer',
    name: 'AI Security Reviewer',
    description: 'Contextual remediation and security suggestions',
    accentClass: 'text-risk-medium',
  },
  {
    id: 'gasOptimizer',
    name: 'Gas Optimizer',
    description: 'Storage packing, loop, and call-cost heuristics',
    accentClass: 'text-risk-low',
  },
] as const;

/** Convenience map keyed by id for O(1) lookups from the engine. */
export const AGENTS_BY_ID: Readonly<Record<AgentId, AgentDefinition>> =
  AGENTS.reduce<Record<AgentId, AgentDefinition>>(
    (acc, agent) => {
      acc[agent.id] = agent;
      return acc;
    },
    {
      staticAnalyzer: AGENTS[0]!,
      symbolicExecutor: AGENTS[1]!,
      aiReviewer: AGENTS[2]!,
      gasOptimizer: AGENTS[3]!,
    },
  );
