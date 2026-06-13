import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

/**
 * App entry — declares the route tree. The shell (sidebar + topbar) is
 * rendered by `Layout`, which also provides the `<Outlet />` for the
 * current page. `/` redirects to `/dashboard` so the URL bar always lands
 * the user on a real surface.
 *
 * The Auditor route is `React.lazy()`-loaded. It is the only route
 * that needs CodeMirror 6 and the Recharts risk-gauge, and it is the
 * only route that lazy-loads its own vendor chunk (vendor-codemirror)
 * on demand. The History / Dashboard / Settings routes never pay for
 * CodeMirror.
 */
const Auditor = lazy(() => import('./pages/Auditor'));

/**
 * Skeleton shown while a lazy route chunk is being fetched. Matches
 * the Auditor's editor surface (a `min-h-[420px]` panel with a soft
 * "Loading…" label) so the layout doesn't jump when the chunk lands.
 */
function RouteFallback(): JSX.Element {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex h-full max-w-6xl flex-col gap-4"
    >
      <div className="h-12 rounded-2xl border border-border-subtle bg-surface-panel/60" />
      <div className="flex min-h-[420px] flex-1 items-center justify-center rounded-2xl border border-border-subtle bg-surface-panel/60 shadow-panel">
        <p className="text-sm font-medium text-text-muted">Loading editor…</p>
      </div>
    </div>
  );
}

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/auditor"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Auditor />
              </Suspense>
            }
          />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
