import { useCallback, useEffect, useState } from 'react';
import type { Report } from '../lib/reportTypes';

/**
 * `useScanHistory` — localStorage-backed (key: `smart-auditor:history`).
 *
 * Capped at 100 entries FIFO (oldest evicted first), the same key the
 * plan locks in. Cross-tab sync is best-effort via a `storage` event
 * listener. Reads are try/catch'd so private-mode browsers don't
 * throw.
 */

const HISTORY_KEY = 'smart-auditor:history';
const MAX_ENTRIES = 100;

function read(): Report[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Report[];
  } catch {
    return [];
  }
}

function write(reports: readonly Report[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(reports));
  } catch {
    // Quota / private mode — silently ignore. The UI keeps working
    // in-memory for the session.
  }
}

export interface UseScanHistoryResult {
  history: readonly Report[];
  add: (report: Report) => void;
  remove: (id: string) => void;
  clear: () => void;
}

/**
 * Persistent scan history. Use this hook on any page that needs to
 * render the history (Dashboard, History, Auditor when re-opening a
 * report from history).
 */
export function useScanHistory(): UseScanHistoryResult {
  const [history, setHistory] = useState<Report[]>(read);

  // Cross-tab sync.
  useEffect(() => {
    function onStorage(event: StorageEvent): void {
      if (event.key !== HISTORY_KEY) return;
      setHistory(read());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const add = useCallback((report: Report): void => {
    setHistory((prev) => {
      // De-dup by id (same scan re-added) and by codeHash (re-running
      // the same contract overwrites the prior row).
      const filtered = prev.filter(
        (r) => r.id !== report.id && r.codeHash !== report.codeHash,
      );
      const next = [report, ...filtered].slice(0, MAX_ENTRIES);
      write(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string): void => {
    setHistory((prev) => {
      const next = prev.filter((r) => r.id !== id);
      write(next);
      return next;
    });
  }, []);

  const clear = useCallback((): void => {
    setHistory(() => {
      write([]);
      return [];
    });
  }, []);

  return { history, add, remove, clear };
}
