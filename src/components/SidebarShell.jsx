import { Gem, LayoutDashboard, Package, Truck, Search, Gauge, Boxes, RotateCcw, Flag, Activity, Settings, ChevronsUpDown, Bell, LifeBuoy, LogOut } from 'lucide-react';
import { ProfileMenu } from './TopBar.jsx';

// Vertical-menu layout shared by the "Devias Pro" (dark sidebar) and
// "Materialize" (light vertical menu) themes: a permanent left sidebar plus a
// content area with a slim top header. It replaces the floating TopBar + TabBar
// chrome used by the top-bar themes. The two skins differ only in CSS
// ([data-theme] overrides on the .sb-* classes); the structure is identical.

const NAV_MAIN = [
  { id: 'home', label: 'Overview', icon: LayoutDashboard },
  { id: 'packaging', label: 'Packaging', icon: Package },
  { id: 'transfer', label: 'Transfers', icon: Truck },
];

const NAV_ADMIN = [
  { id: 'search', label: 'Search & playback', icon: Search },
  { id: 'dash-coverage', label: 'Coverage', icon: Gauge },
  { id: 'dash-consignment', label: 'Consignment', icon: Boxes },
  { id: 'dash-returns', label: 'Returns', icon: RotateCcw },
  { id: 'dash-flagged', label: 'Flagged queue', icon: Flag },
  { id: 'dash-stations', label: 'Station health', icon: Activity },
  { id: 'config', label: 'Users & config', icon: Settings },
];

function NavItem({ item, active, onClick, badge }) {
  const Icon = item.icon;
  return (
    <button className={'sb-nav' + (active ? ' is-active' : '')} onClick={onClick} title={item.label}>
      <Icon size={20} strokeWidth={2} className="sb-nav-icon" aria-hidden="true" />
      <span className="sb-nav-label">{item.label}</span>
      {badge ? <span className="sb-nav-badge">{badge}</span> : null}
    </button>
  );
}

function Sidebar({ ctx }) {
  const { s, set, openList, openTour, signOut } = ctx;
  const screen = s.screen;
  const onOrders = screen === 'orders' || screen === 'order';
  const isAdmin = s.role === 'admin';

  const mainActive = (id) => (id === 'home' ? screen === 'home' : onOrders && s.listKind === id);
  const mainGo = (id) => (id === 'home' ? set({ screen: 'home', adminMenuOpen: false }) : openList(id));

  return (
    <aside className="sb-aside">
      <button className="sb-brand" onClick={() => set({ screen: 'home', adminMenuOpen: false })} title="Mayavé — Overview">
        <span className="sb-brand-mark"><Gem size={20} color="#fff" aria-hidden="true" /></span>
        <span className="sb-brand-name">Mayavé</span>
      </button>

      <div className="sb-ws">
        <span className="sb-ws-avatar">{(s.userLabel || 'M').charAt(0).toUpperCase()}</span>
        <span className="sb-ws-text">
          <span className="sb-ws-label">Workspace</span>
          <span className="sb-ws-name">{s.side === 'store' ? 'Store' : 'Warehouse'}</span>
        </span>
        <ChevronsUpDown size={16} className="sb-ws-chev" aria-hidden="true" />
      </div>

      <nav className="sb-nav-group">
        {NAV_MAIN.map((it) => (
          <NavItem key={it.id} item={it} active={mainActive(it.id)} onClick={() => mainGo(it.id)} />
        ))}
      </nav>

      {isAdmin && (
        <>
          <div className="sb-section">Admin</div>
          <nav className="sb-nav-group">
            {NAV_ADMIN.map((it) => (
              <NavItem
                key={it.id}
                item={it}
                active={screen === it.id}
                onClick={() => set({ screen: it.id, adminMenuOpen: false })}
                badge={it.id === 'dash-flagged' && s.flags && s.flags.length ? String(s.flags.length) : null}
              />
            ))}
          </nav>
        </>
      )}

      <div className="sb-foot">
        <button className="sb-nav" onClick={openTour} title="Take a tour">
          <LifeBuoy size={20} className="sb-nav-icon" aria-hidden="true" />
          <span className="sb-nav-label">Take a tour</span>
        </button>
        <button className="sb-nav" onClick={signOut} title="Sign out">
          <LogOut size={20} className="sb-nav-icon" aria-hidden="true" />
          <span className="sb-nav-label">Sign out</span>
        </button>
      </div>
    </aside>
  );
}

function SidebarHeader({ ctx }) {
  const { s } = ctx;
  const isAdmin = s.role === 'admin';
  return (
    <header className="sb-header">
      <label className="sb-search">
        <Search size={18} aria-hidden="true" />
        <input placeholder="Search orders, SKUs, challans…" aria-label="Search" />
      </label>
      <div style={{ flex: 1 }} />
      <button className="sb-icon-btn" title="Notifications" aria-label="Notifications">
        <Bell size={19} aria-hidden="true" />
        <span className="sb-dot" />
      </button>
      <ProfileMenu ctx={ctx} roleChip={isAdmin ? 'ADMIN' : 'OPERATOR'} roleLine={isAdmin ? 'ADMIN · ALL ACCESS' : 'OPERATOR · PACK · RECEIVE · RETURNS'} />
    </header>
  );
}

export default function SidebarShell({ ctx, children }) {
  return (
    <div className="sb-shell">
      <Sidebar ctx={ctx} />
      <div className="sb-main">
        <SidebarHeader ctx={ctx} />
        <div className="sb-content">{children}</div>
      </div>
    </div>
  );
}
