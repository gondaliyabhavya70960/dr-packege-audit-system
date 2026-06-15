import { MONO, glass, tone, ORDER_STATUSES, ORDER_CHANNELS, NOW_TS } from '../data.js';
import { SearchIcon, PlusIcon, ChevronRightIcon } from '../components/icons.jsx';

const DAY = 86400000;
const START_TODAY = Date.parse('2026-06-15T00:00:00');

const selectStyle = {
  appearance: 'none',
  WebkitAppearance: 'none',
  background: 'rgba(255,255,255,0.5)',
  backdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.65)',
  borderRadius: 10,
  padding: '10px 32px 10px 14px',
  fontSize: 13.5,
  fontWeight: 600,
  color: '#1B1D21',
  outline: 'none',
  cursor: 'pointer',
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238E0E22' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
};

const COLS = '30px 1.7fr 0.7fr 0.9fr 0.8fr 1fr 1.1fr 1.3fr';

function Select({ value, onChange, children, label }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.12em', color: 'rgba(27,29,33,0.45)' }}>{label}</span>
      <select className="fc-accent" value={value} onChange={onChange} style={selectStyle}>
        {children}
      </select>
    </label>
  );
}

export default function Orders({ ctx }) {
  const { s, set, openOrder, newCustomOrder } = ctx;

  const sideLabel = s.side === 'store' ? 'Store' : 'Warehouse';

  const ql = s.oq.trim().toLowerCase();
  let list = s.orders.filter((o) => {
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

  const flaggedCount = s.orders.filter((o) => o.tone === 'red').length;
  const transitVal = s.orders.filter((o) => o.statusKey === 'transit').reduce((n, o) => n + o.valNum, 0);
  const transitLabel = transitVal >= 100000 ? '₹' + (transitVal / 100000).toFixed(2) + 'L' : '₹' + transitVal.toLocaleString('en-IN');

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
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em' }}>{sideLabel} · Orders</h1>
            <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.14em', padding: '4px 10px', borderRadius: 999, background: 'rgba(142,14,34,0.08)', color: '#8E0E22' }}>{sideLabel.toUpperCase()}</span>
          </div>
          <span style={{ fontSize: 13, color: 'rgba(27,29,33,0.55)' }}>Packaging &amp; transferring goods — open an order to pack, receive, return or view its detail.</span>
        </div>
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.65)', color: 'rgba(27,29,33,0.55)' }}>
          {s.orders.length} TOTAL · {flaggedCount} FLAGGED · {transitLabel} IN TRANSIT
        </span>
        <div style={{ flex: 1 }} />
        <button
          data-tour="customorder"
          className="hv-brighten"
          onClick={newCustomOrder}
          style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#8E0E22', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: '11px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(142,14,34,0.25)' }}
        >
          <PlusIcon size={16} />
          Custom order details
        </button>
      </div>

      {/* toolbar: search + filters */}
      <div style={{ ...glass, padding: 14, display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 220 }}>
          <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.12em', color: 'rgba(27,29,33,0.45)' }}>SEARCH</span>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 13, color: 'rgba(27,29,33,0.4)', display: 'flex' }}>
              <SearchIcon size={16} />
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

        <Select label="STATUS" value={s.oStatus} onChange={(e) => set({ oStatus: e.target.value })}>
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((st) => (
            <option key={st.key} value={st.key}>{st.label}</option>
          ))}
        </Select>

        <Select label="CHANNEL" value={s.oChannel} onChange={(e) => set({ oChannel: e.target.value })}>
          <option value="all">All channels</option>
          {ORDER_CHANNELS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>

        <Select label="DATE" value={s.oDate} onChange={(e) => set({ oDate: e.target.value })}>
          <option value="all">Any time</option>
          <option value="today">Today</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </Select>

        <Select label="SORT" value={s.oSort} onChange={(e) => set({ oSort: e.target.value })}>
          <option value="new">Newest first</option>
          <option value="old">Oldest first</option>
          <option value="valhigh">Value · high → low</option>
          <option value="vallow">Value · low → high</option>
        </Select>

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
          <button className="hv-text-dark" onClick={() => set({ oSel: [] })} style={{ background: 'none', border: 'none', color: 'rgba(27,29,33,0.55)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Clear selection
          </button>
        </div>
      )}

      {/* table */}
      <div style={{ ...glass, padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 880 }}>
            {/* header row */}
            <div style={{ display: 'grid', gridTemplateColumns: COLS, gap: 12, alignItems: 'center', padding: '12px 18px', borderBottom: '1px solid rgba(0,0,0,0.06)', fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', color: 'rgba(27,29,33,0.5)' }}>
              <input type="checkbox" checked={allSel} onChange={toggleAll} style={{ accentColor: '#8E0E22', cursor: 'pointer', width: 15, height: 15 }} />
              <span>ORDER</span>
              <span>ITEMS</span>
              <span>VALUE</span>
              <span>CHANNEL</span>
              <span>DATE</span>
              <span>STATUS</span>
              <span style={{ textAlign: 'right' }}>ACTION</span>
            </div>

            {list.map((o) => {
              const t = tone(o.tone);
              const items = o.items.reduce((n, it) => n + it.qty, 0);
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
                    <span style={{ fontSize: 13, color: 'rgba(27,29,33,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.customer}</span>
                  </div>
                  <span style={{ fontSize: 14, color: 'rgba(27,29,33,0.7)' }}>{items} pc{items === 1 ? '' : 's'}</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{o.value}</span>
                  <span style={{ fontSize: 13, color: 'rgba(27,29,33,0.6)' }}>{o.channel}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: 'rgba(27,29,33,0.55)' }}>{o.placed.split(' · ')[0]}</span>
                  <span>
                    <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.04em', padding: '4px 11px', borderRadius: 999, border: '1px solid ' + t.border, color: t.color, whiteSpace: 'nowrap' }}>{o.status}</span>
                  </span>
                  <span style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      className="hv-accent14"
                      onClick={(e) => { e.stopPropagation(); openOrder(o.id); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(142,14,34,0.08)', border: 'none', color: '#8E0E22', borderRadius: 999, padding: '7px 14px', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      Custom details
                      <ChevronRightIcon size={14} />
                    </button>
                  </span>
                </div>
              );
            })}

            {list.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: 'rgba(27,29,33,0.45)', fontSize: 14 }}>
                No orders match these filters — <button onClick={resetFilters} style={{ background: 'none', border: 'none', color: '#8E0E22', fontSize: 14, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>clear filters</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(27,29,33,0.35)' }}>
        showing {list.length} of {s.orders.length} orders · every row opens the custom order details with its linked video evidence
      </div>
    </div>
  );
}
