import { useState } from 'react';
import { Package, Truck, ChevronRight, FileText, Inbox, PackageCheck, Send, CircleCheck, RotateCcw, Undo2, PackageOpen, BadgeCheck, Flag, TriangleAlert } from 'lucide-react';
import { MONO, MUTE, glass, fillTone, ORDER_STATUSES, NOW_TS, isTransferOrder } from '../data.js';
import { NEW_ORDER_TYPES } from '../components/NewOrderMenu.jsx';
import GettingStarted from '../components/GettingStarted.jsx';
import GlassSelect from '../components/GlassSelect.jsx';

const DAY = 86400000;
const START_TODAY = Date.parse('2026-06-15T00:00:00');
const RANGE_OPTS = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];

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
  'return-transit': Undo2,
  'return-received': PackageOpen,
  returned: BadgeCheck,
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
  'return-transit': '#FB923C',
  'return-received': '#A855F7',
  returned: '#14B8A6',
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
      <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: MONO, fontSize: size * 0.22, fontWeight: 600, fill: 'var(--ink-2)' }}>{total}</text>
      <text x="50%" y="63%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 10, letterSpacing: '0.04em', fill: 'var(--mute)' }}>orders</text>
    </svg>
  );
}

// screenshot-style KPI card: coloured left rule, title + icon, big value, sub-line
function KpiCard({ accent, title, value, unit, sub, subColor, Icon }) {
  return (
    <div style={{ ...glass, padding: 18, borderLeft: '3px solid ' + accent, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--mute-2)' }}>{title}</span>
        <span style={{ width: 30, height: 30, flex: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: accent + '1a', color: accent }}>
          <Icon size={16} aria-hidden="true" />
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
        <span style={{ fontSize: 30, fontWeight: 800, color: 'var(--ink-2)', lineHeight: 1, letterSpacing: '-0.01em' }}>{value}</span>
        {unit && <span style={{ fontSize: 14, color: 'var(--mute)' }}>{unit}</span>}
      </div>
      {sub && <span style={{ fontSize: 12.5, color: subColor || 'var(--mute)' }}>{sub}</span>}
    </div>
  );
}

// Post-login landing: an at-a-glance count of the order book, with the two
// working lists (packaging vs transferring goods) one tap away.
export default function Home({ ctx }) {
  const { s, openList, newOrder } = ctx;
  const sideLabel = s.side === 'store' ? 'Store' : 'Warehouse';

  // time-based filter — every number on the page respects the selected window
  const [range, setRange] = useState('all');
  const inRange = (o) => {
    if (range === 'today') return o.ts >= START_TODAY;
    if (range === '7d') return (NOW_TS - o.ts) / DAY <= 7;
    if (range === '30d') return (NOW_TS - o.ts) / DAY <= 30;
    return true;
  };
  const orders = s.orders.filter(inRange);

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
          <span style={{ width: 44, height: 44, flex: 'none', borderRadius: 13, background: 'rgba(var(--accent-rgb),0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={22} aria-hidden="true" />
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 17, fontWeight: 700 }}>{label}</span>
            <span style={{ fontSize: 12.5, color: MUTE }}>{sub}</span>
          </div>
          <button className="hv-accent14" onClick={() => openList(kind, null, range)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(var(--accent-rgb),0.08)', border: 'none', color: 'var(--accent)', borderRadius: 999, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
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
                <button key={d.key} onClick={() => openList(kind, d.key, range)} className="hv-white7" style={{ display: 'flex', alignItems: 'center', gap: 10, border: 'none', background: 'transparent', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ width: 9, height: 9, flex: 'none', borderRadius: '50%', background: d.color }} />
                  <span style={{ fontSize: 13.5, color: 'var(--ink-2)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</span>
                  <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>{d.value}</span>
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
            <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.14em', padding: '4px 10px', borderRadius: 999, background: 'rgba(var(--accent-rgb),0.08)', color: 'var(--accent)' }}>{sideLabel.toUpperCase()}</span>
          </div>
          <span style={{ fontSize: 13, color: 'var(--mute-2)' }}>Welcome{s.userLabel ? ', ' + s.userLabel : ''} — your order book at a glance. Pick a list to start.</span>
        </div>
        <div style={{ flex: 1 }} />
        {/* time window for every figure on this page */}
        <div style={{ position: 'relative', zIndex: 30 }}>
          <GlassSelect label="PERIOD" value={range} onChange={setRange} options={RANGE_OPTS} minWidth={150} />
        </div>
      </div>

      {/* first-run getting-started checklist (dismissible) */}
      <GettingStarted ctx={ctx} />

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
        <KpiCard accent="var(--accent)" title="Total orders" value={orders.length} unit="orders" sub="across packaging & transfers" Icon={Package} />
        <KpiCard accent={flaggedCount ? '#E53E3E' : '#17A35F'} title="Flagged" value={flaggedCount} unit="flagged" sub={flaggedCount ? 'need attention' : 'all clear'} subColor={flaggedCount ? '#C62B22' : '#0E8A50'} Icon={TriangleAlert} />
        <KpiCard accent="#2563EB" title="In transit" value={transitLabel} sub="value on the move" Icon={Truck} />
      </div>

      {/* two working lists with status-mix donuts (stretched to equal height) */}
      <div className="config-grid" style={{ alignItems: 'stretch' }}>
        <DonutCard kind="packaging" label="Packaging orders" sub="Customer orders to pack &amp; dispatch" Icon={Package} lst={packaging} />
        <DonutCard kind="transfer" label="Transferring goods" sub="Inter-branch challans &amp; consignments" Icon={Truck} lst={transfer} />
      </div>

      {/* quick create — typed new-order shortcuts */}
      <div style={{ ...glass, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span style={{ fontSize: 16, fontWeight: 700 }}>Create a new order</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {NEW_ORDER_TYPES.map((o) => (
            <button
              key={o.type}
              onClick={() => newOrder(o.type)}
              className="hv-border-accent"
              style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(var(--surf-rgb),0.55)', border: '1px solid rgba(var(--surf-rgb),0.6)', borderRadius: 16, padding: '14px 16px', cursor: 'pointer', textAlign: 'left' }}
            >
              <span style={{ width: 42, height: 42, flex: 'none', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: o.color + '1a', color: o.color }}>
                <o.Icon size={21} aria-hidden="true" />
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-2)' }}>{o.label}</span>
                <span style={{ fontSize: 12.5, color: MUTE }}>{o.sub}</span>
              </div>
              <ChevronRight size={18} aria-hidden="true" style={{ color: 'var(--accent)', flex: 'none' }} />
            </button>
          ))}
        </div>
      </div>

      {/* counts by status — one clean column: icon · label · share bar · count */}
      <div style={{ ...glass, padding: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Orders by status</span>
          <span style={{ fontFamily: MONO, fontSize: 11, padding: '2px 9px', borderRadius: 999, background: 'rgba(var(--accent-rgb),0.08)', color: 'var(--accent)' }}>{orders.length}</span>
        </div>
        {(() => {
          const max = Math.max(1, ...statuses.map((st) => st.n));
          return statuses.map((st) => {
            const f = fillTone(st.tone);
            const Icon = STATUS_ICONS[st.key] || Package;
            const color = STATUS_COLORS[st.key] || '#94A3B8';
            return (
              <button
                key={st.key}
                onClick={() => openList(st.kind, st.key, range)}
                className="hv-white7"
                style={{ display: 'grid', gridTemplateColumns: '34px minmax(150px, 0.9fr) 1.6fr 44px 18px', alignItems: 'center', gap: 12, background: 'transparent', border: 'none', borderRadius: 10, padding: '8px 10px', cursor: 'pointer', textAlign: 'left', opacity: st.n ? 1 : 0.55 }}
              >
                <span style={{ width: 32, height: 32, flex: 'none', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: f.bg, color: f.color, border: '1px solid ' + f.border }}>
                  <Icon size={16} aria-hidden="true" />
                </span>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{st.label}</span>
                <span style={{ height: 7, borderRadius: 999, background: 'rgba(var(--ink-rgb),0.07)', overflow: 'hidden' }}>
                  <span style={{ display: 'block', height: '100%', width: (st.n / max) * 100 + '%', borderRadius: 999, background: color, transition: 'width 0.25s ease' }} />
                </span>
                <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 600, color: st.n ? 'var(--ink-2)' : 'var(--mute)', textAlign: 'right' }}>{st.n}</span>
                <ChevronRight size={14} aria-hidden="true" style={{ color: 'var(--mute)' }} />
              </button>
            );
          });
        })()}
      </div>
    </div>
  );
}
