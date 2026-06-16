import { Package, Truck, ChevronRight } from 'lucide-react';
import { MONO, MUTE, glass, tone, ORDER_STATUSES, isTransferOrder } from '../data.js';

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

  const ListCard = ({ kind, label, count, sub, Icon }) => (
    <button
      onClick={() => openList(kind)}
      aria-label={`${label} — ${count} orders`}
      className="hv-border-accent"
      style={{ ...glass, textAlign: 'left', cursor: 'pointer', padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}
    >
      <span style={{ width: 56, height: 56, flex: 'none', borderRadius: 16, background: 'rgba(142,14,34,0.1)', color: '#8E0E22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={26} strokeWidth={2} aria-hidden="true" />
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 17, fontWeight: 700 }}>{label}</span>
        <span style={{ fontSize: 13, color: MUTE }}>{sub}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <span style={{ fontFamily: MONO, fontSize: 30, fontWeight: 500, color: '#8E0E22', lineHeight: 1 }}>{count}</span>
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', color: MUTE }}>ORDERS</span>
      </div>
      <ChevronRight size={18} aria-hidden="true" />
    </button>
  );

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
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', padding: '6px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.65)', color: '#5B616B' }}>
          {orders.length} TOTAL · {flaggedCount} FLAGGED · {transitLabel} IN TRANSIT
        </span>
      </div>

      {/* two working lists */}
      <div className="config-grid">
        <ListCard kind="packaging" label="Packaging orders" count={packaging.length} sub="Customer orders to pack &amp; dispatch" Icon={Package} />
        <ListCard kind="transfer" label="Transferring goods" count={transfer.length} sub="Inter-branch challans &amp; consignments" Icon={Truck} />
      </div>

      {/* counts by status */}
      <div style={{ ...glass, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span style={{ fontSize: 16, fontWeight: 700 }}>Orders by status</span>
        <div className="kpi-grid">
          {statuses.map((st) => {
            const tn = tone(st.tone === 'plain' ? 'plain' : st.tone);
            return (
              <button
                key={st.key}
                onClick={() => openList(st.kind, st.key)}
                className="hv-border-accent"
                style={{ background: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.55)', borderRadius: 16, padding: '14px 16px', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 6 }}
              >
                <span style={{ fontFamily: MONO, fontSize: 28, fontWeight: 500, lineHeight: 1, color: st.n ? '#1B1D21' : '#6B7280' }}>{st.n}</span>
                <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.04em', padding: '3px 9px', borderRadius: 999, alignSelf: 'flex-start', border: '1px solid ' + tn.border, color: tn.color }}>{st.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
