import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { runScan } from '../lib/scanEngine';
import { AGENTS, AGENTS_BY_ID } from '../lib/agentConfig';
import type {
  AgentId,
  AgentProgressUpdate,
  AgentState,
  Report,
} from '../lib/reportTypes';

/**
 * The view-model exposed by `useScan`. The hook owns the
 * AbortController, the per-agent progress state, and the latest
 * report. Callers do not need to handle cancellation plumbing; they
 * just call `start()` / `cancel()` and render the current state.
 */
export interface UseScanState {
  /** True between `start()` and either completion or cancellation. */
  isScanning: boolean;
  /** True after the scan resolves with a `Report`. */
  isComplete: boolean;
  /** True after the scan rejects with an `AbortError`. */
  isCancelled: boolean;
  /** The last successful report, or `null` if none. */
  report: Report | null;
  /** Error thrown by the engine (AbortError excluded). */
  error: Error | null;
  /** Per-agent runtime state in execution order. */
  agents: readonly AgentState[];
  /** Wall-clock ms since the current scan started. */
  elapsedMs: number;
  /** Total progress 0-100 across all four agents. */
  overallProgress: number;
}

export interface UseScanResult extends UseScanState {
  /** Start a new scan. Cancels any in-flight scan first. */
  start: (code: string) => void;
  /** Abort the in-flight scan (no-op if idle). */
  cancel: () => void;
  /** Forget the current report and return to the idle state. */
  reset: () => void;
  /** Convenience: `true` while a scan is running. */
  isActive: boolean;
  /** Per-agent live lookup keyed by id. */
  byId: Readonly<Record<AgentId, AgentState>>;
}

type Action =
  | { type: 'start'; code: string }
  | { type: 'progress'; update: AgentProgressUpdate }
  | { type: 'tick'; elapsedMs: number }
  | { type: 'complete'; report: Report; elapsedMs: number }
  | { type: 'cancel'; elapsedMs: number }
  | { type: 'fail'; error: Error; elapsedMs: number }
  | { type: 'reset' };

function makeInitialAgents(): AgentState[] {
  return AGENTS.map((def) => {
    const initial = AGENTS_BY_ID[def.id];
    return {
      id: initial.id,
      name: initial.name,
      description: initial.description,
      accentClass: initial.accentClass,
      status: 'pending' as const,
      progress: 0,
      message: 'Waiting',
      durationMs: 0,
    };
  });
}

function computeOverallProgress(agents: readonly AgentState[]): number {
  if (agents.length === 0) return 0;
  const sum = agents.reduce((acc, a) => acc + a.progress, 0);
  return Math.round(sum / agents.length);
}

const INITIAL_STATE: UseScanState = {
  isScanning: false,
  isComplete: false,
  isCancelled: false,
  report: null,
  error: null,
  agents: makeInitialAgents(),
  elapsedMs: 0,
  overallProgress: 0,
};

function reducer(state: UseScanState, action: Action): UseScanState {
  switch (action.type) {
    case 'start': {
      return {
        ...INITIAL_STATE,
        isScanning: true,
        agents: makeInitialAgents(),
      };
    }
    case 'progress': {
      const agents = state.agents.map((a) =>
        a.id === action.update.agent
          ? {
              ...a,
              status: action.update.status,
              progress: action.update.progress,
              message: action.update.message,
            }
          : a,
      );
      return {
        ...state,
        agents,
        elapsedMs: action.update.elapsedMs,
        overallProgress: computeOverallProgress(agents),
      };
    }
    case 'tick': {
      // Only update the wall-clock; per-agent progress comes from the engine.
      if (!state.isScanning) return state;
      return { ...state, elapsedMs: action.elapsedMs };
    }
    case 'complete': {
      return {
        ...state,
        isScanning: false,
        isComplete: true,
        isCancelled: false,
        report: action.report,
        elapsedMs: action.elapsedMs,
        overallProgress: 100,
      };
    }
    case 'cancel': {
      // Mark the still-pending / still-running agents as cancelled so
      // the UI shows a clean "cancelled" state instead of a half-bar.
      const agents = state.agents.map((a) =>
        a.status === 'pending' || a.status === 'running'
          ? { ...a, status: 'cancelled' as const, message: 'Cancelled' }
          : a,
      );
      return {
        ...state,
        isScanning: false,
        isCancelled: true,
        agents,
        elapsedMs: action.elapsedMs,
      };
    }
    case 'fail': {
      return {
        ...state,
        isScanning: false,
        error: action.error,
        elapsedMs: action.elapsedMs,
      };
    }
    case 'reset': {
      return { ...INITIAL_STATE, agents: makeInitialAgents() };
    }
  }
}

/**
 * `useScan` — React glue around `runScan`. Owns the AbortController
 * and an rAF-driven elapsed timer, exposes a stable API for the
 * Auditor page, and never leaves stale state across rapid
 * start/cancel cycles.
 */
export function useScan(): UseScanResult {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const controllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  /**
   * Cancel a running scan. Idempotent: calling on an already-cancelled
   * or never-started controller is a no-op.
   */
  const cancel = useCallback((): void => {
    const controller = controllerRef.current;
    if (controller) {
      controller.abort();
      controllerRef.current = null;
    }
  }, []);

  /**
   * Start a scan. Cancels any in-flight scan first so the user can
   * never see two reports interleaved.
   */
  const start = useCallback(
    (code: string): void => {
      cancel();
      const controller = new AbortController();
      controllerRef.current = controller;
      startTimeRef.current = performance.now();
      dispatch({ type: 'start', code });

      // Wall-clock timer for the progress panel. Independent of the
      // engine so the user sees a smooth "00:02" counter even during
      // the brief gaps between agent events.
      const tick = (): void => {
        if (!controllerRef.current) {
          rafRef.current = null;
          return;
        }
        dispatch({ type: 'tick', elapsedMs: performance.now() - startTimeRef.current });
        rafRef.current = window.requestAnimationFrame(tick);
      };
      rafRef.current = window.requestAnimationFrame(tick);

      runScan(code, (update) => dispatch({ type: 'progress', update }), controller.signal)
        .then((report) => {
          // If `cancel` was called between the resolve and this microtask
          // the dispatch will be a no-op for the elapsed counter.
          if (!controllerRef.current) return;
          controllerRef.current = null;
          dispatch({
            type: 'complete',
            report,
            elapsedMs: performance.now() - startTimeRef.current,
          });
        })
        .catch((err: unknown) => {
          controllerRef.current = null;
          if (err instanceof Error && err.name === 'AbortError') {
            dispatch({
              type: 'cancel',
              elapsedMs: performance.now() - startTimeRef.current,
            });
            return;
          }
          const wrapped = err instanceof Error ? err : new Error(String(err));
          dispatch({
            type: 'fail',
            error: wrapped,
            elapsedMs: performance.now() - startTimeRef.current,
          });
        });
    },
    [cancel],
  );

  /**
   * Reset to a clean idle state. Used by the "Run another scan" /
   * "Clear" buttons so a previous report doesn't bleed into the next
   * scan's UI.
   */
  const reset = useCallback((): void => {
    cancel();
    dispatch({ type: 'reset' });
  }, [cancel]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
        controllerRef.current = null;
      }
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  const byId = useMemo<Readonly<Record<AgentId, AgentState>>>(() => {
    const map = {} as Record<AgentId, AgentState>;
    for (const agent of state.agents) {
      map[agent.id] = agent;
    }
    return map;
  }, [state.agents]);

  return {
    ...state,
    start,
    cancel,
    reset,
    isActive: state.isScanning,
    byId,
  };
}
