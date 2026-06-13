import { useEffect, useState } from 'react';

/**
 * Returns `true` when the viewport matches the supplied media query.
 *
 * Implemented with `window.matchMedia` so we avoid pulling in a full
 * responsive React library. The hook subscribes to change events so the
 * returned value stays in sync as the user resizes the window or rotates
 * a tablet.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent): void => {
      setMatches(event.matches);
    };
    // Initial sync (in case it changed between SSR/initial render and effect).
    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}
