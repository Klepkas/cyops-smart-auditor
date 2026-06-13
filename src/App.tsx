import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Auditor from './pages/Auditor';
import History from './pages/History';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

/**
 * App entry — declares the route tree. The shell (sidebar + topbar) is
 * rendered by `Layout`, which also provides the `<Outlet />` for the
 * current page. `/` redirects to `/dashboard` so the URL bar always lands
 * the user on a real surface.
 */
function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/auditor" element={<Auditor />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
