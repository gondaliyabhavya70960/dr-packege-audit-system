import { MONO, glass, tabMode, ORDER_STATUSES, ORDER_CHANNELS, NOW_TS, isTransferOrder, orderRoute } from '../data.js';
import { Search, Plus, ChevronRight, ArrowRight, SearchX } from 'lucide-react';
import EmptyState from '../components/EmptyState.jsx';
import GlassSelect from '../components/GlassSelect.jsx';

const DAY = 86400000;
const START_TODAY = Date.parse('2026-06-15T00:00:00');

// dropdown option lists for the glass filters
const STATUS_OPTS = [{ value: 'all', label: 'All statuses' }, ...ORDER_STATUSES.map((st) => ({ value: st.key, label: st.label }))];
const CHANNEL_OPTS = [{ value: 'all', label: 'All channels' }, ...ORDER_CHANNELS.map((c) => ({ value: c, label: c }))];
const DATE_OPTS = [
  { value: 'all', label: 'Any time' },
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];
const SORT_OPTS = [
  { value: 'new', label: 'Newest first' },
  { value: 'old', label: 'Oldest first' },
  { value: 'valhigh', label: 'Value · high → low' },
  { value: 'vallow', label: 'Value · low → high' },
];

const COLS = '30px 1.4fr 1.4fr 0.55fr 0.75fr 0.7fr 0.7fr 1.1fr 1fr 0.85fr';

// filled (tinted) status pill — soft background + matching text, keyed by tone
const FILL = {
  green: { bg: 'rgba(23,163,95,0.13)', color: '#0E8A50', border: 'rgba(23,163,95,0.28)' },
  amber: { bg: 'rgba(217,142,4,0.15)', color: '#9A6A00', border: 'rgba(217,142,4,0.30)' },
  red: { bg: 'rgba(229,62,62,0.12)', color: '#C62B22', border: 'rgba(229,62,62,0.28)' },
  plain: { bg: 'rgba(27,29,33,0.06)', color: '#5B616B', border: 'rgba(27,29,33,0.12)' },
};
const fillTone = (t) => FILL[t] || FILL.plain;

// one Pk / Rc / Rt stage chip, filled by that stage's per-status mode:
// recorded (view) → green ✓, live (edit) → amber •, otherwise → grey ·
function StageBadge({ label, mode }) {
  const sty =
    mode === 'view'
      ? { bg: 'rgba(23,163,95,0.14)', color: '#0E8A50', border: 'rgba(23,163,95,0.32)', mark: '✓' }
      : mode === 'edit'
        ? { bg: 'rgba(217,142,4,0.16)', color: '#9A6A00', border: 'rgba(217,142,4,0.34)', mark: '•' }
        : { bg: 'rgba(27,29,33,0.05)', color: 'rgba(27,29,33,0.42)', border: 'rgba(27,29,33,0.10)', mark: '·' };
  return (
    <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 7, whiteSpace: 'nowrap', background: sty.bg, color: sty.color, border: '1px solid ' + sty.border }}>
      {label} {sty.mark}
    </span>
  );
}

export default function Orders({ ctx }) {
  const { s, set, openOrder, newCustomOrder } = ctx;

  const sideLabel = s.side === 'store' ? 'Store' : 'Warehouse';
  const isTransfer = s.listKind === 'transfer';
  const listLabel = isTransfer ? 'Transferring goods' : 'Packaging orders';
  const kindOrders = s.orders.filter((o) => isTransferOrder(o) === isTransfer);

  const ql = s.oq.trim().toLowerCase();
  let list = kindOrders.filter((o) => {
    if (ql && !(o.id.toLowerCase().includes(ql) || o.customer.toLowerCase().includes(ql) || o.channel.toLowerCase().includes(ql) || o.status.toLowerCase().includes(ql))) return false;
    if (s.oStatus !== 'all' && o.statusKey !== s.oStatus) return false;
    if (s.oChannel !== 'all' && o.channel !== s.oChannel) return false;
    if (s.oDate === 'today' && o.ts < START_TODAY) return false;
    if (s.oDate === '7d' && (NOW_TS - o.ts) / DAY > 7) return false;
    if (s.oDate === '30d' && (NOW_TS - o.ts) / DAY > 30) return false;
    return true;
  });

  list = [...list].sort((a, b) => {
    if (s.oSort === 'old') return a.ts - b.ts;
    if (s.oSort === 'valhigh') return b.valNum - a.valNum;
    if (s.oSort === 'vallow') return a.valNum - b.valNum;
    return b.ts - a.ts; // new
  });

  const allIds = list.map((o) => o.id);
  const allSel = allIds.length > 0 && allIds.every((id) => s.oSel.includes(id));
  const toggleAll = () => set({ oSel: allSel ? [] : allIds });
  const toggleOne = (id) => set({ oSel: s.oSel.includes(id) ? s.oSel.filter((x) => x !== id) : [...s.oSel, id] });

  const resetFilters = () => set({ oq: '', oStatus: 'all', oChannel: 'all', oDate: 'all', oSort: 'new' });
  const filtersActive = ql || s.oStatus !== 'all' || s.oChannel !== 'all' || s.oDate !== 'all' || s.oSort !== 'new';

  return (
    <div data-screen-label="14 Orders" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, minHeight: '100%' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em' }}>{listLabel}</h1>
            <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.14em', padding: '4px 10px', borderRadius: 999, background: 'rgba(142,14,34,0.08)', color: '#8E0E22' }}>{sideLabel.toUpperCase()}</span>
          </div>
          <span style={{ fontSize: 13, color: '#5B616B' }}>{isTransfer ? 'Inter-branch challans & consignments — open one to receive, return or view its detail.' : 'Customer orders to pack & dispatch — open one to pack, return or view its detail.'}</span>
        </div>
        <div style={{ flex: 1 }} />
        <button
          data-tour="customorder"
          className="hv-brighten"
          onClick={newCustomOrder}
          style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#8E0E22', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: '11px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(142,14,34,0.25)' }}
        >
          <Plus size={16} aria-hidden="true" />
          Custom order details
        </button>
      </div>

      {/* toolbar: search + filters (raised so the glass dropdowns overlay the table) */}
      <div style={{ ...glass, padding: 14, display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', position: 'relative', zIndex: 30 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 220 }}>
          <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.12em', color: '#6B7280' }}>SEARCH</span>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 13, color: '#6B7280', display: 'flex' }}>
              <Search size={16} aria-hidden="true" />
            </span>
            <input
              className="fc-accent"
              value={s.oq}
              onChange={(e) => set({ oq: e.target.value })}
              placeholder="order ID, customer, channel…"
              style={{ width: '100%', background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.65)', borderRadius: 10, padding: '10px 14px 10px 38px', color: '#1B1D21', fontSize: 14, outline: 'none' }}
            />
          </div>
        </label>

        <GlassSelect label="STATUS" value={s.oStatus} onChange={(v) => set({ oStatus: v })} options={STATUS_OPTS} minWidth={150} />

        <GlassSelect label="CHANNEL" value={s.oChannel} onChange={(v) => set({ oChannel: v })} options={CHANNEL_OPTS} minWidth={140} />

        <GlassSelect label="DATE" value={s.oDate} onChange={(v) => set({ oDate: v })} options={DATE_OPTS} minWidth={130} />

        <GlassSelect label="SORT" value={s.oSort} onChange={(v) => set({ oSort: v })} options={SORT_OPTS} minWidth={150} />

        {filtersActive && (
          <button className="hv-border-accent" onClick={resetFilters} style={{ background: 'rgba(255,255,255,0.45)', border: '1px solid rgba(0,0,0,0.08)', color: 'rgba(27,29,33,0.7)', borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Clear
          </button>
        )}
      </div>

      {/* bulk action bar */}
      {s.oSel.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(142,14,34,0.06)', border: '1px solid rgba(142,14,34,0.25)', borderRadius: 14, padding: '10px 16px' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#8E0E22' }}>{s.oSel.length} selected</span>
          <button className="hv-accent14" onClick={() => ctx.showToast('Exported ' + s.oSel.length + ' order' + (s.oSel.length === 1 ? '' : 's') + ' to CSV (prototype).')} style={{ background: 'rgba(142,14,34,0.1)', border: 'none', color: '#8E0E22', borderRadius: 999, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Export CSV
          </button>
          <div style={{ flex: 1 }} />
          <button className="hv-text-dark" onClick={() => set({ oSel: [] })} style={{ background: 'none', border: 'none', color: '#5B616B', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Clear selection
          </button>
        </div>
      )}

      {/* table */}
      <div style={{ ...glass, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 1200 }}>
            {/* header row */}
            <div style={{ display: 'grid', gridTemplateColumns: COLS, gap: 12, alignItems: 'center', padding: '12px 18px', borderBottom: '1px solid rgba(0,0,0,0.06)', fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', color: '#6B7280' }}>
              <input type="checkbox" checked={allSel} onChange={toggleAll} style={{ accentColor: '#8E0E22', cursor: 'pointer', width: 15, height: 15 }} />
              <span>ORDER</span>
              <span>ROUTE</span>
              <span>ITEMS</span>
              <span>VALUE</span>
              <span>CHANNEL</span>
              <span>DATE</span>
              <span>STAGES</span>
              <span>STATUS</span>
              <span style={{ textAlign: 'right' }}>ACTION</span>
            </div>

            {list.map((o) => {
              const f = fillTone(o.tone);
              const items = o.items.reduce((n, it) => n + it.qty, 0);
              const route = orderRoute(o);
              const sel = s.oSel.includes(o.id);
              return (
                <div
                  key={o.id}
                  className="order-row"
                  style={{ display: 'grid', gridTemplateColumns: COLS, gap: 12, alignItems: 'center', padding: '13px 18px', borderBottom: '1px solid rgba(0,0,0,0.04)', background: sel ? 'rgba(142,14,34,0.04)' : 'transparent', cursor: 'pointer' }}
                  onClick={() => openOrder(o.id)}
                >
                  <input type="checkbox" checked={sel} onClick={(e) => e.stopPropagation()} onChange={() => toggleOne(o.id)} style={{ accentColor: '#8E0E22', cursor: 'pointer', width: 15, height: 15 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                    <span style={{ fontFamily: MONO, fontSize: 14, color: '#1B1D21' }}>{o.id}</span>
                    <span style={{ fontSize: 13, color: '#5B616B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.customer}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                    <span title={'From ' + route.from} style={{ fontSize: 12.5, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{route.from}</span>
                    <span title={'To ' + route.to} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#1B1D21', minWidth: 0 }}>
                      <ArrowRight size={12} aria-hidden="true" style={{ flex: 'none', color: '#8E0E22' }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{route.to}</span>
                    </span>
                  </div>
                  <span style={{ fontSize: 14, color: 'rgba(27,29,33,0.7)' }}>{items} pc{items === 1 ? '' : 's'}</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{o.value}</span>
                  <span style={{ fontSize: 13, color: '#5B616B' }}>{o.channel}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: '#5B616B' }}>{o.placed.split(' · ')[0]}</span>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    <StageBadge label="Pk" mode={tabMode(o.statusKey, 'pack')} />
                    <StageBadge label="Rc" mode={tabMode(o.statusKey, 'recv')} />
                    <StageBadge label="Rt" mode={tabMode(o.statusKey, 'ret')} />
                  </div>
                  <span>
                    <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: '0.03em', padding: '5px 12px', borderRadius: 999, background: f.bg, color: f.color, border: '1px solid ' + f.border, whiteSpace: 'nowrap' }}>{o.status}</span>
                  </span>
                  <span style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      className="hv-accent14"
                      onClick={(e) => { e.stopPropagation(); openOrder(o.id); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(142,14,34,0.08)', border: 'none', color: '#8E0E22', borderRadius: 999, padding: '7px 16px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Open
                      <ChevronRight size={14} aria-hidden="true" />
                    </button>
                  </span>
                </div>
              );
            })}

            {list.length === 0 && (
              <div style={{ padding: 18 }}>
                <EmptyState
                  icon={SearchX}
                  title="No orders match"
                  sub={'Nothing in ' + listLabel.toLowerCase() + ' matches these filters.'}
                  action={
                    <button onClick={resetFilters} style={{ marginTop: 4, background: 'rgba(142,14,34,0.08)', border: 'none', color: '#8E0E22', borderRadius: 999, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      Clear filters
                    </button>
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ fontFamily: MONO, fontSize: 11, color: '#6B7280' }}>
        showing {list.length} of {kindOrders.length} {listLabel.toLowerCase()} · every row opens the single order with its linked video evidence
      </div>
    </div>
  );
}
