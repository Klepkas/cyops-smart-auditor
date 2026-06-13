import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, PanelLeftClose, PanelLeftOpen, Menu } from 'lucide-react';
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

interface TopbarProps {
  /** Called when the hamburger button is tapped on mobile. */
  onOpenMobileNav: () => void;
}

/**
 * Top bar — route-aware title + breadcrumb on the left, sidebar
 * collapse / hamburger toggle in the middle, and a "New scan"
 * primary CTA on the right.
 *
 * Below 1024px the rail is replaced by the mobile drawer, so the
 * leftmost button is a hamburger (`Menu`) that opens it. At
 * 1024px+ the hamburger is hidden and the chevron takes its place
 * (so the toggle remains useful on tablet+ / desktop).
 */
function Topbar({ onOpenMobileNav }: TopbarProps): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const meta = metaFor(location.pathname);
  const onAuditor = location.pathname === '/auditor';
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const { userSidebarCollapsed, toggleSidebarCollapsed } = useUIState();

  // Below 1024px the rail is replaced by a drawer, so show a
  // hamburger. At/above 1024px show the chevron (existing AC-3
  // behaviour).
  const showHamburger = !isDesktop;
  const showChevron = isDesktop;

  // Mirrors the Sidebar's effective collapsed state for icon picking.
  const isExpandedNow = isDesktop && userSidebarCollapsed !== true;
  const ToggleIcon = isExpandedNow ? PanelLeftClose : PanelLeftOpen;
  const toggleLabel = isExpandedNow
    ? 'Collapse sidebar to icons'
    : 'Expand sidebar with labels';

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border-subtle bg-surface/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-surface/70 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        {showHamburger && (
          <button
            type="button"
            onClick={onOpenMobileNav}
            title="Open navigation"
            aria-label="Open navigation"
            className="focus-ring inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-muted transition hover:bg-surface-elevated hover:text-text-primary"
          >
            <Menu aria-hidden="true" className="h-5 w-5" />
          </button>
        )}
        {showChevron && (
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
            <span className="hidden sm:inline">New scan</span>
            <span className="sm:hidden">Scan</span>
          </button>
        )}
      </div>
    </header>
  );
}

export default Topbar;
