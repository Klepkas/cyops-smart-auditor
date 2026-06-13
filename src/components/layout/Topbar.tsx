import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useUIState } from '../../hooks/useUIState';

interface RouteMeta {
  title: string;
  subtitle: string;
  breadcrumb: readonly string[];
}

const ROUTE_META: Readonly<Record<string, RouteMeta>> = {
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'Aggregate metrics from your scan history',
    breadcrumb: ['Dashboard'],
  },
  '/auditor': {
    title: 'Auditor',
    subtitle: 'Paste Solidity, run a multi-agent scan',
    breadcrumb: ['Auditor'],
  },
  '/history': {
    title: 'Scan History',
    subtitle: 'Re-open or delete past audit reports',
    breadcrumb: ['Scan History'],
  },
  '/settings': {
    title: 'Settings',
    subtitle: 'Default Solidity version, sensitivity, reset',
    breadcrumb: ['Settings'],
  },
};

const FALLBACK_META: RouteMeta = {
  title: 'Not found',
  subtitle: 'The page you requested does not exist',
  breadcrumb: ['Not found'],
};

function metaFor(pathname: string): RouteMeta {
  return ROUTE_META[pathname] ?? FALLBACK_META;
}

const DESKTOP_QUERY = '(min-width: 1024px)';

/**
 * Top bar — route-aware title + breadcrumb on the left, sidebar collapse
 * chevron in the middle, and a "New scan" primary CTA on the right.
 *
 * The chevron is the manual collapse toggle called out in the AC-3 spec
 * — it lifts a `userSidebarCollapsed` override into `useUIState`, which
 * the `Sidebar` honours over the media query. The icon shown is the
 * opposite of the *effective* current state (clicking the close icon
 * collapses; clicking the open icon expands).
 */
function Topbar(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const meta = metaFor(location.pathname);
  const onAuditor = location.pathname === '/auditor';
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const { userSidebarCollapsed, toggleSidebarCollapsed } = useUIState();

  // The toggle is only useful on wide screens. Below 1024px the rail is
  // always icon-only, so hide the button to avoid implying it does
  // something visible.
  const showToggle = isDesktop;

  // Mirrors the Sidebar's effective collapsed state for icon picking.
  const isExpandedNow =
    isDesktop && userSidebarCollapsed !== true;
  const ToggleIcon = isExpandedNow ? PanelLeftClose : PanelLeftOpen;
  const toggleLabel = isExpandedNow
    ? 'Collapse sidebar to icons'
    : 'Expand sidebar with labels';

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border-subtle bg-surface/85 px-6 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
      <div className="flex min-w-0 items-center gap-2">
        {showToggle && (
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            title={toggleLabel}
            aria-label={toggleLabel}
            aria-pressed={!isExpandedNow}
            className="focus-ring inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-muted transition hover:bg-surface-elevated hover:text-text-primary"
          >
            <ToggleIcon aria-hidden="true" className="h-4 w-4" />
          </button>
        )}

        <div className="min-w-0">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-xs text-text-muted"
          >
            {meta.breadcrumb.map((segment, idx) => (
              <span key={segment} className="flex items-center gap-1">
                {idx > 0 && (
                  <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
                )}
                <span className="truncate">{segment}</span>
              </span>
            ))}
          </nav>
          <div className="mt-0.5 flex items-baseline gap-2">
            <h1 className="truncate text-base font-semibold text-text-primary sm:text-lg">
              {meta.title}
            </h1>
            <p className="hidden truncate text-xs text-text-muted sm:block">
              {meta.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!onAuditor && (
          <button
            type="button"
            onClick={() => navigate('/auditor')}
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white shadow-panel transition hover:bg-brand-600 active:bg-brand-700"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            <span>New scan</span>
          </button>
        )}
      </div>
    </header>
  );
}

export default Topbar;
