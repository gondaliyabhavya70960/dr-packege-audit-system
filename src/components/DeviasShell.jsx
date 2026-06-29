import { Gem, LayoutDashboard, Package, Truck, Search, Gauge, Boxes, RotateCcw, Flag, Activity, Settings, ChevronsUpDown, Bell, LifeBuoy, LogOut } from 'lucide-react';
import { ProfileMenu } from './TopBar.jsx';

// Devias Kit Pro layout variant: a permanent dark navy sidebar on the left and
// a light content area on the right. The sidebar replaces the floating TabBar +
// TopBar chrome used by the other themes. Navigation maps to the same screens.

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
    <button className={'dv-nav' + (active ? ' is-active' : '')} onClick={onClick} title={item.label}>
      <Icon size={20} strokeWidth={2} className="dv-nav-icon" aria-hidden="true" />
      <span className="dv-nav-label">{item.label}</span>
      {badge ? <span className="dv-nav-badge">{badge}</span> : null}
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
    <aside className="devias-sidebar">
      <button className="dv-brand" onClick={() => set({ screen: 'home', adminMenuOpen: false })} title="Mayavé — Overview">
        <span className="dv-brand-mark"><Gem size={20} color="#fff" aria-hidden="true" /></span>
        <span className="dv-brand-name">Mayavé</span>
      </button>

      <div className="dv-workspace">
        <span className="dv-ws-avatar">{(s.userLabel || 'M').charAt(0).toUpperCase()}</span>
        <span className="dv-ws-text">
          <span className="dv-ws-label">Workspace</span>
          <span className="dv-ws-name">{s.side === 'store' ? 'Store' : 'Warehouse'}</span>
        </span>
        <ChevronsUpDown size={16} className="dv-ws-chev" aria-hidden="true" />
      </div>

      <nav className="dv-nav-group">
        {NAV_MAIN.map((it) => (
          <NavItem key={it.id} item={it} active={mainActive(it.id)} onClick={() => mainGo(it.id)} />
        ))}
      </nav>

      {isAdmin && (
        <>
          <div className="dv-section">Admin</div>
          <nav className="dv-nav-group">
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

      <div className="dv-side-foot">
        <button className="dv-nav" onClick={openTour} title="Take a tour">
          <LifeBuoy size={20} className="dv-nav-icon" aria-hidden="true" />
          <span className="dv-nav-label">Take a tour</span>
        </button>
        <button className="dv-nav" onClick={signOut} title="Sign out">
          <LogOut size={20} className="dv-nav-icon" aria-hidden="true" />
          <span className="dv-nav-label">Sign out</span>
        </button>
      </div>
    </aside>
  );
}

function DeviasHeader({ ctx }) {
  const { s } = ctx;
  const isAdmin = s.role === 'admin';
  return (
    <header className="devias-header">
      <label className="dv-search">
        <Search size={18} aria-hidden="true" />
        <input placeholder="Search orders, SKUs, challans…" aria-label="Search" />
      </label>
      <div style={{ flex: 1 }} />
      <button className="dv-icon-btn" title="Notifications" aria-label="Notifications">
        <Bell size={19} aria-hidden="true" />
        <span className="dv-dot" />
      </button>
      <ProfileMenu ctx={ctx} roleChip={isAdmin ? 'ADMIN' : 'OPERATOR'} roleLine={isAdmin ? 'ADMIN · ALL ACCESS' : 'OPERATOR · PACK · RECEIVE · RETURNS'} />
    </header>
  );
}

export default function DeviasShell({ ctx, children }) {
  return (
    <div className="devias-shell">
      <Sidebar ctx={ctx} />
      <div className="devias-main">
        <DeviasHeader ctx={ctx} />
        <div className="devias-content">{children}</div>
      </div>
    </div>
  );
}
