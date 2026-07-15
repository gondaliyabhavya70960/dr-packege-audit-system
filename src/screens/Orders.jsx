import { MONO, glass, cardLight, ORDER_STATUSES, ORDER_CHANNELS, NOW_TS, isTransferOrder, orderRoute } from '../data.js';
import { Search, ChevronRight, ArrowRight, ArrowUp, ArrowDown, ArrowUpDown, SearchX } from 'lucide-react';
import EmptyState from '../components/EmptyState.jsx';
import GlassSelect from '../components/GlassSelect.jsx';
import NewOrderMenu from '../components/NewOrderMenu.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

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
  { value: 'new', label: 'Date · newest first' },
  { value: 'old', label: 'Date · oldest first' },
  { value: 'orderaz', label: 'Order · A → Z' },
  { value: 'orderza', label: 'Order · Z → A' },
  { value: 'valhigh', label: 'Value · high → low' },
  { value: 'vallow', label: 'Value · low → high' },
];

export default function Orders({ ctx }) {
  const { s, set, openOrder, newOrder } = ctx;

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

  // operators see the list without monetary values; the value column — and the
  // value sorts — are admin-only. A lingering value sort falls back to newest.
  const showValue = s.role === 'admin';
  const oSort = !showValue && (s.oSort === 'valhigh' || s.oSort === 'vallow') ? 'new' : s.oSort;
  const sortOpts = showValue ? SORT_OPTS : SORT_OPTS.filter((o) => o.value !== 'valhigh' && o.value !== 'vallow');

  list = [...list].sort((a, b) => {
    if (oSort === 'old') return a.ts - b.ts;
    if (oSort === 'orderaz') return a.id.localeCompare(b.id);
    if (oSort === 'orderza') return b.id.localeCompare(a.id);
    if (oSort === 'valhigh') return b.valNum - a.valNum;
    if (oSort === 'vallow') return a.valNum - b.valNum;
    return b.ts - a.ts; // new
  });
  const COLS = ['30px', '1.5fr', '1.7fr', '0.6fr', ...(showValue ? ['0.8fr'] : []), '0.8fr', '0.8fr', '1.15fr', '0.9fr'].join(' ');

  // clickable column header that toggles between an asc / desc sort key
  const SortHeader = ({ label, asc, desc }) => {
    const isAsc = oSort === asc;
    const isDesc = oSort === desc;
    const active = isAsc || isDesc;
    const Icon = !active ? ArrowUpDown : isAsc ? ArrowUp : ArrowDown;
    return (
      <button
        onClick={() => set({ oSort: isDesc || !active ? asc : desc })}
        title={'Sort by ' + label.toLowerCase()}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: MONO, fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', color: active ? 'var(--accent)' : 'var(--mute)' }}
      >
        {label}
        <Icon size={12} aria-hidden="true" style={{ flex: 'none', opacity: active ? 1 : 0.55 }} />
      </button>
    );
  };

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
            <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.14em', padding: '4px 10px', borderRadius: 999, background: 'rgba(var(--accent-rgb),0.08)', color: 'var(--accent)' }}>{sideLabel.toUpperCase()}</span>
          </div>
          <span style={{ fontSize: 13, color: 'var(--mute-2)' }}>{isTransfer ? 'Inter-branch challans & consignments — open one to receive, return or view its detail.' : 'Customer orders to pack & dispatch — open one to pack, return or view its detail.'}</span>
        </div>
        <div style={{ flex: 1 }} />
        <NewOrderMenu onPick={newOrder} />
      </div>

      {/* toolbar: search + filters (raised so the glass dropdowns overlay the table) */}
      <div style={{ ...glass, padding: 14, display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', position: 'relative', zIndex: 30 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 220 }}>
          <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 500, letterSpacing: '0.1em', color: 'var(--mute)' }}>SEARCH</span>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 13, color: 'var(--mute)', display: 'flex' }}>
              <Search size={16} aria-hidden="true" />
            </span>
            <input
              className="fc-accent"
              value={s.oq}
              onChange={(e) => set({ oq: e.target.value })}
              placeholder="order ID, customer, channel…"
              style={{ width: '100%', background: 'rgba(var(--surf-rgb),0.5)', backdropFilter: 'blur(14px)', border: '1px solid rgba(var(--surf-rgb),0.65)', borderRadius: 10, padding: '10px 14px 10px 38px', color: 'var(--ink-2)', fontSize: 14, outline: 'none' }}
            />
          </div>
        </label>

        <GlassSelect label="STATUS" value={s.oStatus} onChange={(v) => set({ oStatus: v })} options={STATUS_OPTS} minWidth={150} />

        <GlassSelect label="CHANNEL" value={s.oChannel} onChange={(v) => set({ oChannel: v })} options={CHANNEL_OPTS} minWidth={140} />

        <GlassSelect label="DATE" value={s.oDate} onChange={(v) => set({ oDate: v })} options={DATE_OPTS} minWidth={130} />

        <GlassSelect label="SORT" value={oSort} onChange={(v) => set({ oSort: v })} options={sortOpts} minWidth={150} />

        {filtersActive && (
          <button className="hv-border-accent" onClick={resetFilters} style={{ background: 'rgba(var(--surf-rgb),0.45)', border: '1px solid rgba(0,0,0,0.08)', color: 'rgba(var(--ink-rgb),0.7)', borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Clear
          </button>
        )}
      </div>

      {/* bulk action bar */}
      {s.oSel.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(var(--accent-rgb),0.06)', border: '1px solid rgba(var(--accent-rgb),0.25)', borderRadius: 14, padding: '10px 16px' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>{s.oSel.length} selected</span>
          <button className="hv-accent14" onClick={() => ctx.showToast('Exported ' + s.oSel.length + ' order' + (s.oSel.length === 1 ? '' : 's') + ' to CSV (prototype).')} style={{ background: 'rgba(var(--accent-rgb),0.1)', border: 'none', color: 'var(--accent)', borderRadius: 999, padding: '7px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Export CSV
          </button>
          <div style={{ flex: 1 }} />
          <button className="hv-text-dark" onClick={() => set({ oSel: [] })} style={{ background: 'none', border: 'none', color: 'var(--mute-2)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Clear selection
          </button>
        </div>
      )}

      {/* table — clean white card (no translucent grey), tighter columns */}
      <div style={{ ...cardLight, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: showValue ? 1060 : 980 }}>
            {/* header row */}
            <div style={{ display: 'grid', gridTemplateColumns: COLS, gap: 14, alignItems: 'center', padding: '13px 18px', borderBottom: '1px solid var(--surface-border)', fontFamily: MONO, fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', color: 'var(--mute)' }}>
              <input type="checkbox" checked={allSel} onChange={toggleAll} style={{ accentColor: 'var(--accent)', cursor: 'pointer', width: 15, height: 15 }} />
              <SortHeader label="ORDER" asc="orderaz" desc="orderza" />
              <span>ROUTE</span>
              <span>ITEMS</span>
              {showValue && <span>VALUE</span>}
              <span>CHANNEL</span>
              <SortHeader label="DATE" asc="old" desc="new" />
              <span>STATUS</span>
              <span style={{ textAlign: 'right' }}>ACTION</span>
            </div>

            {list.map((o) => {
              const items = o.items.reduce((n, it) => n + it.qty, 0);
              const route = orderRoute(o);
              const sel = s.oSel.includes(o.id);
              return (
                <div
                  key={o.id}
                  className="order-row"
                  style={{ display: 'grid', gridTemplateColumns: COLS, gap: 14, alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--hairline)', background: sel ? 'rgba(var(--accent-rgb),0.04)' : 'transparent', cursor: 'pointer' }}
                  onClick={() => openOrder(o.id)}
                >
                  <input type="checkbox" checked={sel} onClick={(e) => e.stopPropagation()} onChange={() => toggleOne(o.id)} style={{ accentColor: 'var(--accent)', cursor: 'pointer', width: 15, height: 15 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                    <span style={{ fontFamily: MONO, fontSize: 14, color: 'var(--ink-2)' }}>{o.id}</span>
                    <span style={{ fontSize: 13, color: 'var(--mute-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.customer}</span>
                  </div>
                  {/* route on a single line: from → to */}
                  <span title={route.from + ' → ' + route.to} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-2)', minWidth: 0 }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--mute-2)' }}>{route.from}</span>
                    <ArrowRight size={13} aria-hidden="true" style={{ flex: 'none', color: 'var(--accent)' }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{route.to}</span>
                  </span>
                  <span style={{ fontSize: 14, color: 'rgba(var(--ink-rgb),0.7)' }}>{items} pc{items === 1 ? '' : 's'}</span>
                  {showValue && <span style={{ fontSize: 14, fontWeight: 600 }}>{o.value}</span>}
                  <span style={{ fontSize: 13, color: 'var(--mute-2)' }}>{o.channel}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--mute-2)' }}>{o.placed.split(' · ')[0]}</span>
                  <span style={{ minWidth: 0 }}>
                    <StatusBadge status={o.status} tone={o.tone} />
                  </span>
                  <span style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      className="hv-accent14"
                      onClick={(e) => { e.stopPropagation(); openOrder(o.id); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(var(--accent-rgb),0.08)', border: 'none', color: 'var(--accent)', borderRadius: 999, padding: '7px 16px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
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
                    <button onClick={resetFilters} style={{ marginTop: 4, background: 'rgba(var(--accent-rgb),0.08)', border: 'none', color: 'var(--accent)', borderRadius: 999, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      Clear filters
                    </button>
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ fontFamily: MONO, fontSize: 11, color: 'var(--mute)' }}>
        showing {list.length} of {kindOrders.length} {listLabel.toLowerCase()} · every row opens the single order with its linked video evidence
      </div>
    </div>
  );
}
