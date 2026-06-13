import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

/**
 * Application shell — sticky left sidebar + sticky topbar with the route
 * outlet below. The main scroll container is the Outlet wrapper, not the
 * body, so the sidebar/topbar stay pinned at any scroll position.
 *
 * Below 1024px the desktop rail is replaced by a mobile drawer that
 * the topbar's hamburger button toggles. The drawer state is owned
 * here (it spans sidebar + topbar) and closed on every successful
 * navigation.
 */
function Layout(): JSX.Element {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const openDrawer = useCallback((): void => setDrawerOpen(true), []);
  const closeDrawer = useCallback((): void => setDrawerOpen(false), []);

  return (
    <div className="flex min-h-screen bg-surface text-text-primary">
      <Sidebar drawerOpen={drawerOpen} onDrawerClose={closeDrawer} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMobileNav={openDrawer} />
        <main
          id="main-content"
          className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-surface px-4 py-6 sm:px-6 lg:px-8"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
