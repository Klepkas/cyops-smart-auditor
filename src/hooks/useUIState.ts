import { useCallback, useEffect, useState } from 'react';

/**
 * UI state that survives page reloads but does not need to be shared
 * between tabs (no `storage` event listener). Backed by `localStorage`
 * with a try/catch around reads so SSR / private-mode browsers do not
 * throw.
 */
const UI_STATE_KEY = 'smart-auditor:ui';

interface UIState {
  /**
   * `null` = follow the responsive auto-collapse rule (default).
   * `true` = user has explicitly collapsed the sidebar (icon-only).
   * `false` = user has explicitly expanded the sidebar (icon + label).
   */
  userSidebarCollapsed: boolean | null;
}

const DEFAULT_STATE: UIState = {
  userSidebarCollapsed: null,
};

function readState(): UIState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(UI_STATE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<UIState>;
    return {
      userSidebarCollapsed:
        typeof parsed.userSidebarCollapsed === 'boolean'
          ? parsed.userSidebarCollapsed
          : null,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function writeState(state: UIState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(UI_STATE_KEY, JSON.stringify(state));
  } catch {
    // localStorage quota / private mode — silently ignore, the UI keeps
    // working in-memory for the session.
  }
}

export interface UseUIStateResult {
  userSidebarCollapsed: boolean | null;
  toggleSidebarCollapsed: () => void;
}

/**
 * Persistence + accessor for the small UI-preference state the app keeps
 * outside of routing. Used by the Topbar's collapse chevron to honour a
 * manual collapse / expand that survives reloads (AC-3 P2 follow-up).
 *
 * Note: the Sidebar itself does not currently consume the persisted
 * `userSidebarCollapsed` flag — the desktop rail renders at its default
 * expanded width regardless. The flag drives only the Topbar's chevron
 * icon. Wiring the Sidebar to actually apply the flag is tracked as a
 * future iteration.
 */
export function useUIState(): UseUIStateResult {
  const [state, setState] = useState<UIState>(readState);

  // Sync across tabs (best-effort).
  useEffect(() => {
    function onStorage(event: StorageEvent): void {
      if (event.key !== UI_STATE_KEY) return;
      setState(readState());
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleSidebarCollapsed = useCallback((): void => {
    setState((prev) => {
      const current = prev.userSidebarCollapsed ?? false;
      const next: UIState = { ...prev, userSidebarCollapsed: !current };
      writeState(next);
      return next;
    });
  }, []);

  return {
    userSidebarCollapsed: state.userSidebarCollapsed,
    toggleSidebarCollapsed,
  };
}
