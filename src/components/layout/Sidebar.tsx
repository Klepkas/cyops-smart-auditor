import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, History, Settings as SettingsIcon } from 'lucide-react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useUIState } from '../../hooks/useUIState';

interface NavItem {
  to: string;
  label: string;
  Icon: typeof LayoutDashboard;
}

/**
 * Navigation items shown in the sidebar. Order is the visual order too.
 * The icons come from `lucide-react` to keep the stroke style consistent
 * with the rest of the app.
 */
const NAV_ITEMS: readonly NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/auditor', label: 'Auditor', Icon: ShieldCheck },
  { to: '/history', label: 'Scan History', Icon: History },
  { to: '/settings', label: 'Settings', Icon: SettingsIcon },
] as const;

const DESKTOP_QUERY = '(min-width: 1024px)';

/**
 * Persistent left sidebar.
 *
 * Collapse rules (last one wins):
 *   1. The viewport is < 1024px → icon-only rail (auto).
 *   2. The user manually toggled the rail via the topbar chevron and
 *      that override is stored in `localStorage` → honour the override
 *      regardless of viewport.
 *   3. Otherwise → expanded at >= 1024px.
 *
 * Active route gets a brand-tinted background plus a 2 px brand left
 * border. Inactive items are dim and brighten on hover.
 */
function Sidebar(): JSX.Element {
  // `isDesktop` is the auto-collapse rule (no user override).
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const { userSidebarCollapsed } = useUIState();

  // Effective collapsed state: an explicit user override beats the media
  // query. `null` = follow the media query.
  const userWantsCollapsed = userSidebarCollapsed === true;
  const userWantsExpanded = userSidebarCollapsed === false;
  const collapsed = userWantsCollapsed || (!userWantsExpanded && !isDesktop);
  const isDesktopAndNotOverridden = isDesktop && userSidebarCollapsed === null;
  const showLabels = isDesktopAndNotOverridden;

  const widthClass = showLabels ? 'w-60' : 'w-[72px]';
  const labelClass = showLabels
    ? 'opacity-100'
    : 'opacity-0 pointer-events-none w-0 overflow-hidden';

  return (
    <aside
      data-collapsed={collapsed ? 'true' : 'false'}
      aria-label="Primary"
      className={[
        'sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-border-subtle bg-surface-panel',
        'transition-[width] duration-200 ease-out',
        widthClass,
      ].join(' ')}
    >
      <div className="flex h-16 items-center gap-3 border-b border-border-subtle px-4">
        <span
          aria-hidden="true"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-500/20 text-brand-300 ring-1 ring-brand-500/30"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2.5 4 6v6c0 4.5 3.2 8.6 8 9.5 4.8-.9 8-5 8-9.5V6l-8-3.5Z" />
            <path d="m9 12 2.2 2.2L15 9" />
          </svg>
        </span>
        <div className={`min-w-0 transition-opacity duration-200 ${labelClass}`}>
          <p className="truncate text-[11px] uppercase tracking-widest text-text-muted">
            Cyops
          </p>
          <p className="truncate text-sm font-semibold text-text-primary">
            Smart Auditor
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                title={showLabels ? undefined : label}
                aria-label={label}
                className={({ isActive }) =>
                  [
                    'focus-ring group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition',
                    isActive
                      ? 'bg-brand-500/15 text-brand-300'
                      : 'text-text-muted hover:bg-surface-elevated hover:text-text-primary',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      aria-hidden="true"
                      className={[
                        'absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full bg-brand-400 transition-opacity',
                        isActive ? 'opacity-100' : 'opacity-0',
                      ].join(' ')}
                    />
                    <Icon
                      className={[
                        'h-5 w-5 shrink-0 transition-colors',
                        isActive
                          ? 'text-brand-300'
                          : 'text-text-muted group-hover:text-text-primary',
                      ].join(' ')}
                    />
                    <span
                      className={`min-w-0 truncate transition-opacity duration-200 ${labelClass}`}
                    >
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-border-subtle p-3">
        <div
          className={`flex items-center gap-3 rounded-lg bg-surface-elevated p-2.5 ${
            showLabels ? '' : 'justify-center'
          }`}
        >
          <span
            aria-hidden="true"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-500/25 text-xs font-semibold text-brand-200"
          >
            v1
          </span>
          <div className={`min-w-0 transition-opacity duration-200 ${labelClass}`}>
            <p className="truncate text-xs font-medium text-text-primary">
              Simulated scan
            </p>
            <p className="truncate text-[11px] text-text-muted">
              v0.1.0 · dark
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
