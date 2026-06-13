import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, ChevronRight } from 'lucide-react';

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

/**
 * Top bar — route-aware title + breadcrumb on the left, "New scan" CTA on
 * the right that takes the user straight to `/auditor`. The CTA is hidden
 * when the user is already on the Auditor page so we never have a
 * self-pointing action.
 */
function Topbar(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const meta = metaFor(location.pathname);
  const onAuditor = location.pathname === '/auditor';

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border-subtle bg-surface/85 px-6 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
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
