import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

/**
 * Application shell — sticky left sidebar + sticky topbar with the route
 * outlet below. The main scroll container is the Outlet wrapper, not the
 * body, so the sidebar/topbar stay pinned at any scroll position.
 */
function Layout(): JSX.Element {
  return (
    <div className="flex min-h-screen bg-surface text-text-primary">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto bg-surface px-4 py-6 sm:px-6 lg:px-8"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
