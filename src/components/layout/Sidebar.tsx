import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, History, Settings as SettingsIcon, type LucideIcon } from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  Icon: LucideIcon;
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

interface SidebarContentProps {
  /**
   * `true` when the sidebar is rendered inside the mobile drawer
   * (so labels are always shown, never collapsed to icons).
   */
  /** Called when a nav link is clicked inside the drawer — closes the drawer. */
  onNavigate?: () => void;
}

/**
 * Sidebar body — shared between the persistent desktop rail and the
 * mobile drawer. The parent decides which to render based on viewport
 * width.
 */
function SidebarContent({
  onNavigate,
}: SidebarContentProps): JSX.Element {
  return (
    <>
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
        <div className="min-w-0">
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
                onClick={onNavigate}
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
                    <span className="min-w-0 truncate">{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-border-subtle p-3">
        <div className="flex items-center gap-3 rounded-lg bg-surface-elevated p-2.5">
          <span
            aria-hidden="true"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-500/25 text-xs font-semibold text-brand-200"
          >
            v1
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-text-primary">
              Simulated scan
            </p>
            <p className="truncate text-[11px] text-text-muted">
              v0.1.0 · dark
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

interface SidebarProps {
  /** Open/close state for the mobile drawer (no-op on desktop). */
  drawerOpen: boolean;
  onDrawerClose: () => void;
}

/**
 * Persistent left sidebar (desktop rail) + a mobile drawer that
 * slides in from the left. The rail is hidden on screens < 1024px
 * and the drawer is mounted into the same component so the
 * `Layout` only needs one `<Sidebar />` element.
 *
 * Active route gets a brand-tinted background plus a 2 px brand left
 * border. Inactive items are dim and brighten on hover.
 */
function Sidebar({ drawerOpen, onDrawerClose }: SidebarProps): JSX.Element {
  return (
    <>
      <aside
        aria-label="Primary"
        className="sticky top-0 z-30 hidden h-screen w-60 shrink-0 flex-col border-r border-border-subtle bg-surface-panel transition-[width] duration-200 ease-out lg:flex"
      >
        <SidebarContent />
      </aside>
      {drawerOpen && (
        <MobileSidebarDrawer open={drawerOpen} onClose={onDrawerClose} />
      )}
    </>
  );
}

interface MobileSidebarDrawerProps {
  open: boolean;
  onClose: () => void;
}

// Inline import to avoid circular deps at module-load time.
import Drawer from '../ui/Drawer';

function MobileSidebarDrawer({ open, onClose }: MobileSidebarDrawerProps): JSX.Element {
  return (
    <Drawer open={open} onClose={onClose} ariaLabel="Primary navigation">
      <div className="flex h-full w-full flex-col">
        <SidebarContent onNavigate={onClose} />
      </div>
    </Drawer>
  );
}

export default Sidebar;
export { SidebarContent, NAV_ITEMS };
