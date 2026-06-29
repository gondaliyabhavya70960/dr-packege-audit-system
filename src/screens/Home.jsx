import { Package, Truck, ChevronRight, FileText, Inbox, PackageCheck, Send, CircleCheck, RotateCcw, Undo2, Flag, TriangleAlert } from 'lucide-react';
import { MONO, MUTE, glass, fillTone, ORDER_STATUSES, isTransferOrder } from '../data.js';

// a vector per order status — gives each card a fill cue matching its stage
const STATUS_ICONS = {
  draft: FileText,
  packed: Package,
  transit: Truck,
  receiving: Inbox,
  received: PackageCheck,
  delivery: Send,
  delivered: CircleCheck,
  returning: RotateCcw,
  returned: Undo2,
  flagged: Flag,
};

// a distinct donut-segment colour per status (the badges stay tone-based; the
// donut needs separable hues since several statuses share a tone)
const STATUS_COLORS = {
  draft: '#94A3B8',
  packed: '#3B82F6',
  transit: '#F59E0B',
  receiving: '#8B5CF6',
  received: '#10B981',
  delivery: '#06B6D4',
  delivered: '#22C55E',
  returning: '#F97316',
  returned: '#EF4444',
  flagged: '#DC2626',
};

// SLA-Health-style ring: arcs sized by value, total in the centre.
function Donut({ data, total, size = 132, thickness = 16 }) {
  const r = (size - thickness) / 2;
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flex: 'none' }} aria-hidden="true">
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(15,17,21,0.06)" strokeWidth={thickness} />
        {data.map((d) => {
          const pct = total ? (d.value / total) * 100 : 0;
          const seg = (
            <circle key={d.key} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={d.color} strokeWidth={thickness} pathLength={100} strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={-acc} strokeLinecap="butt" />
          );
          acc += pct;
          return seg;
        })}
      </g>
      <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: MONO, fontSize: size * 0.22, fontWeight: 600, fill: '#1B1D21' }}>{total}</text>
      <text x="50%" y="63%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 10, letterSpacing: '0.04em', fill: '#6B7280' }}>orders</text>
    </svg>
  );
}

// screenshot-style KPI card: coloured left rule, title + icon, big value, sub-line
function KpiCard({ accent, title, value, unit, sub, subColor, Icon }) {
  return (
    <div style={{ ...glass, padding: 18, borderLeft: '3px solid ' + accent, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: '#5B616B' }}>{title}</span>
        <span style={{ width: 30, height: 30, flex: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: accent + '1a', color: accent }}>
          <Icon size={16} aria-hidden="true" />
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
        <span style={{ fontSize: 30, fontWeight: 800, color: '#1B1D21', lineHeight: 1, letterSpacing: '-0.01em' }}>{value}</span>
        {unit && <span style={{ fontSize: 14, color: '#6B7280' }}>{unit}</span>}
      </div>
      {sub && <span style={{ fontSize: 12.5, color: subColor || '#6B7280' }}>{sub}</span>}
    </div>
  );
}

// Post-login landing: an at-a-glance count of the order book, with the two
// working lists (packaging vs transferring goods) one tap away.
export default function Home({ ctx }) {
  const { s, openList } = ctx;
  const sideLabel = s.side === 'store' ? 'Store' : 'Warehouse';
  const orders = s.orders;

  const transfer = orders.filter(isTransferOrder);
  const packaging = orders.filter((o) => !isTransferOrder(o));
  const flaggedCount = orders.filter((o) => o.tone === 'red').length;
  const transitVal = orders.filter((o) => o.statusKey === 'transit').reduce((n, o) => n + o.valNum, 0);
  const transitLabel = transitVal >= 100000 ? '₹' + (transitVal / 100000).toFixed(2) + 'L' : '₹' + transitVal.toLocaleString('en-IN');

  // per-status counts; clicking routes to whichever list actually holds that status
  const statuses = ORDER_STATUSES.map((st) => {
    const p = packaging.filter((o) => o.statusKey === st.key).length;
    const t = transfer.filter((o) => o.statusKey === st.key).length;
    return { ...st, n: p + t, kind: t > p ? 'transfer' : 'packaging' };
  });

  // status mix (donut + legend) for one working list
  const mixOf = (lst) =>
    ORDER_STATUSES.map((st) => ({ key: st.key, label: st.label, color: STATUS_COLORS[st.key] || '#94A3B8', value: lst.filter((o) => o.statusKey === st.key).length }))
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value);

  const DonutCard = ({ kind, label, sub, Icon, lst }) => {
    const mix = mixOf(lst);
    const total = lst.length;
    return (
      <div style={{ ...glass, height: '100%', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 44, height: 44, flex: 'none', borderRadius: 13, background: 'rgba(142,14,34,0.1)', color: '#8E0E22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={22} aria-hidden="true" />
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 17, fontWeight: 700 }}>{label}</span>
            <span style={{ fontSize: 12.5, color: MUTE }}>{sub}</span>
          </div>
          <button className="hv-accent14" onClick={() => openList(kind)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(142,14,34,0.08)', border: 'none', color: '#8E0E22', borderRadius: 999, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Open
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <Donut data={mix} total={total} />
          <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {mix.length === 0 && <span style={{ fontSize: 13, color: MUTE }}>No orders in this list yet.</span>}
            {mix.map((d) => {
              const pct = total ? Math.round((d.value / total) * 100) : 0;
              return (
                <button key={d.key} onClick={() => openList(kind, d.key)} className="hv-white7" style={{ display: 'flex', alignItems: 'center', gap: 10, border: 'none', background: 'transparent', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ width: 9, height: 9, flex: 'none', borderRadius: '50%', background: d.color }} />
                  <span style={{ fontSize: 13.5, color: '#1B1D21', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</span>
                  <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: '#1B1D21' }}>{d.value}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: MUTE, width: 38, textAlign: 'right' }}>{pct}%</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, minHeight: '100%' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em' }}>{sideLabel} · Overview</h1>
            <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.14em', padding: '4px 10px', borderRadius: 999, background: 'rgba(142,14,34,0.08)', color: '#8E0E22' }}>{sideLabel.toUpperCase()}</span>
          </div>
          <span style={{ fontSize: 13, color: '#5B616B' }}>Welcome{s.userLabel ? ', ' + s.userLabel : ''} — your order book at a glance. Pick a list to start.</span>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <KpiCard accent="#8E0E22" title="Total orders" value={orders.length} unit="orders" sub="across packaging & transfers" Icon={Package} />
        <KpiCard accent={flaggedCount ? '#E53E3E' : '#17A35F'} title="Flagged" value={flaggedCount} unit="flagged" sub={flaggedCount ? 'need attention' : 'all clear'} subColor={flaggedCount ? '#C62B22' : '#0E8A50'} Icon={TriangleAlert} />
        <KpiCard accent="#2563EB" title="In transit" value={transitLabel} sub="value on the move" Icon={Truck} />
      </div>

      {/* two working lists with status-mix donuts (stretched to equal height) */}
      <div className="config-grid" style={{ alignItems: 'stretch' }}>
        <DonutCard kind="packaging" label="Packaging orders" sub="Customer orders to pack &amp; dispatch" Icon={Package} lst={packaging} />
        <DonutCard kind="transfer" label="Transferring goods" sub="Inter-branch challans &amp; consignments" Icon={Truck} lst={transfer} />
      </div>

      {/* counts by status */}
      <div style={{ ...glass, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span style={{ fontSize: 16, fontWeight: 700 }}>Orders by status</span>
        <div className="kpi-grid">
          {statuses.map((st) => {
            const f = fillTone(st.tone);
            const Icon = STATUS_ICONS[st.key] || Package;
            return (
              <button
                key={st.key}
                onClick={() => openList(st.kind, st.key)}
                className="hv-border-accent"
                style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: 16, padding: '14px 16px', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ width: 38, height: 38, flex: 'none', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', background: f.bg, color: f.color, border: '1px solid ' + f.border }}>
                    <Icon size={19} aria-hidden="true" />
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 30, fontWeight: 500, lineHeight: 1, color: st.n ? '#1B1D21' : '#9AA0A6' }}>{st.n}</span>
                </div>
                <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', padding: '4px 11px', borderRadius: 999, alignSelf: 'flex-start', background: f.bg, color: f.color, border: '1px solid ' + f.border }}>{st.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
