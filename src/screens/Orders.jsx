import { useEffect, useRef, useState } from 'react';
import { MONO, cardLight, glassPopover, ORDER_STATUSES, ORDER_CHANNELS, NOW_TS, isTransferOrder, orderRoute } from '../data.js';
import { Search, ChevronRight, ChevronLeft, ArrowRight, ArrowUp, ArrowDown, ArrowUpDown, SearchX, RefreshCw, Download, CalendarDays, History } from '../components/line-icons.jsx';
import EmptyState from '../components/EmptyState.jsx';
import GlassSelect from '../components/GlassSelect.jsx';
import NewOrderMenu from '../components/NewOrderMenu.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const PAGE_SIZE = 15;

const DAY = 86400000;
const START_TODAY = Date.parse('2026-06-15T00:00:00');

// Last-change cell: the newest timeline entry's date/time. Hover (desktop) or
// tap (touch screens) opens a popover with that order's timeline, newest first.
// Popover opens downward on the first rows so it never clips the card edge.
function LastUpdate({ order, openDown }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  // a tap fires mouseenter + click together — this flag stops the click from
  // instantly toggling the popover closed again
  const openedByHover = useRef(false);
  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('touchstart', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('touchstart', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const tl = order.timeline || [];
  const last = tl[tl.length - 1];
  if (!last) return <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--mute-2)' }}>—</span>;
  const [datePart, timePart] = (last.time || '').split(' · ');
  const events = [...tl].reverse();

  const onEnter = () => {
    if (!open) {
      openedByHover.current = true;
      setOpen(true);
    }
  };
  const onLeave = () => {
    openedByHover.current = false;
    setOpen(false);
  };
  const onTap = (e) => {
    e.stopPropagation(); // the row itself opens the order
    if (open && openedByHover.current) {
      openedByHover.current = false; // hover already opened it — keep it open
      return;
    }
    setOpen((v) => !v);
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', minWidth: 0 }} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <button
        type="button"
        onClick={onTap}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={'Show timeline · last change ' + (last.time || '')}
        style={{ display: 'flex', flexDirection: 'column', gap: 2, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', font: 'inherit', minWidth: 0, maxWidth: '100%' }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: MONO, fontSize: 12, color: 'var(--ink-2)' }}>
          <History size={11} aria-hidden="true" style={{ flex: 'none', color: 'var(--mute-2)' }} />
          {datePart}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 11, color: 'var(--mute-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{timePart || last.who}</span>
      </button>
      {open && (
        <div
          role="dialog"
          aria-label={'Timeline for ' + order.id}
          onClick={(e) => e.stopPropagation()}
          style={{ ...glassPopover, position: 'absolute', left: 0, ...(openDown ? { top: 'calc(100% + 6px)' } : { bottom: 'calc(100% + 6px)' }), width: 280, borderRadius: 14, padding: '12px 14px', zIndex: 70, display: 'flex', flexDirection: 'column', gap: 9, maxHeight: 262, overflowY: 'auto' }}
        >
          <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--ink)' }}>TIMELINE · {order.id}</span>
          {events.map((e, i) => (
            <div key={i} style={{ display: 'flex', gap: 9 }}>
              <span style={{ width: 8, height: 8, flex: 'none', borderRadius: '50%', marginTop: 4, background: i === 0 ? 'var(--accent)' : 'rgba(var(--ink-rgb),0.25)' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', lineHeight: 1.3 }}>{e.label}</span>
                <span style={{ fontFamily: MONO, fontSize: 10.5, color: 'var(--mute-2)' }}>{e.time}{e.who ? ' · ' + e.who : ''}</span>
              </div>
            </div>
          ))}
          <span style={{ fontSize: 11.5, color: 'var(--mute-2)', borderTop: '1px solid rgba(var(--ink-rgb),0.08)', paddingTop: 7 }}>Open the order for clips &amp; full details.</span>
        </div>
      )}
    </div>
  );
}

// which step(s) an order was flagged at — from its per-product flag entries,
// falling back to the status wording for seed flagged orders
function flagStepsOf(o) {
  const steps = [...new Set((o.flagged || []).map((f) => (f.step || '').toUpperCase()).filter(Boolean))];
  if (steps.length === 0 && o.statusKey === 'flagged') {
    const st = (o.status || '').toLowerCase();
    steps.push(st.includes('return') ? 'RETURN' : st.includes('receiv') ? 'RECEIVE' : 'PACKAGING');
  }
  return steps;
}

// dropdown option lists for the toolbar filters
const STATUS_OPTS = [{ value: 'all', label: 'All statuses' }, ...ORDER_STATUSES.map((st) => ({ value: st.key, label: st.label }))];
const CHANNEL_OPTS = [{ value: 'all', label: 'All types' }, ...ORDER_CHANNELS.map((c) => ({ value: c, label: c }))];
const DATE_OPTS = [
  { value: 'all', label: 'All dates' },
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];
const SORT_OPTS = [
  { value: 'new', label: 'Newest first' },
  { value: 'old', label: 'Oldest first' },
  { value: 'orderaz', label: 'Order · A → Z' },
  { value: 'orderza', label: 'Order · Z → A' },
  { value: 'valhigh', label: 'Value · high → low' },
  { value: 'vallow', label: 'Value · low → high' },
];

export default function Orders({ ctx }) {
  const { s, set, openOrder, newOrder } = ctx;
  const [pageRaw, setPage] = useState(0);

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

  // page through the book 15 at a time; the raw index self-clamps when filters shrink the list
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const page = Math.min(Math.max(0, pageRaw), pages - 1);
  const paged = list.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const COLS = ['30px', '1.4fr', '1.5fr', '0.55fr', ...(showValue ? ['0.75fr'] : []), '0.7fr', '0.75fr', '0.85fr', '1.05fr', '0.85fr'].join(' ');

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
        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: active ? 'var(--accent)' : 'var(--ink)' }}
      >
        {label}
        <Icon size={12} aria-hidden="true" style={{ flex: 'none', opacity: active ? 1 : 0.7 }} />
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
        <button
          className="hv-white85"
          onClick={() => ctx.showToast('Pulled latest tracking updates from Gati (prototype).')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--surface-border)', color: 'var(--ink-2)', borderRadius: 10, padding: '11px 16px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}
        >
          <RefreshCw size={15} aria-hidden="true" /> Pull from Gati
        </button>
        <button
          className="hv-white85"
          onClick={() => ctx.showToast('Exported ' + kindOrders.length + ' orders to CSV (prototype).')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: '1px solid var(--surface-border)', color: 'var(--ink-2)', borderRadius: 10, padding: '11px 16px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}
        >
          <Download size={15} aria-hidden="true" /> Export CSV
        </button>
        <NewOrderMenu onPick={newOrder} />
      </div>

      {/* toolbar: search + filters on a solid card (raised so the dropdowns overlay the table) */}
      <div style={{ ...cardLight, padding: 16, display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', position: 'relative', zIndex: 30 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 220 }}>
          <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--ink)' }}>SEARCH</span>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 14, color: 'var(--mute)', display: 'flex' }}>
              <Search size={16} aria-hidden="true" />
            </span>
            <input
              className="fc-accent"
              value={s.oq}
              onChange={(e) => set({ oq: e.target.value })}
              placeholder="Search by tracking ID, order or delivery challan…"
              style={{ width: '100%', background: 'var(--surface-soft)', border: '1px solid var(--surface-soft-border)', borderRadius: 12, padding: '12px 14px 12px 40px', color: 'var(--ink-2)', fontSize: 14.5, outline: 'none' }}
            />
          </div>
        </label>

        <GlassSelect label="STATUS" value={s.oStatus} onChange={(v) => set({ oStatus: v })} options={STATUS_OPTS} minWidth={150} />

        <GlassSelect label="TYPE" value={s.oChannel} onChange={(v) => set({ oChannel: v })} options={CHANNEL_OPTS} minWidth={140} />

        <GlassSelect label="PLACED" value={s.oDate} onChange={(v) => set({ oDate: v })} options={DATE_OPTS} minWidth={150} Icon={CalendarDays} />

        <GlassSelect label="SORT" value={oSort} onChange={(v) => set({ oSort: v })} options={sortOpts} minWidth={150} />

        {filtersActive && (
          <button className="hv-ink04" onClick={resetFilters} style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', color: 'var(--ink-2)', borderRadius: 12, padding: '12px 20px', fontSize: 14.5, fontWeight: 700, cursor: 'pointer' }}>
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
          <div style={{ minWidth: showValue ? 1040 : 960 }}>
            {/* header row */}
            <div style={{ display: 'grid', gridTemplateColumns: COLS, gap: 14, alignItems: 'center', padding: '13px 18px', borderBottom: '1px solid var(--surface-border)', fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--ink)' }}>
              <input type="checkbox" checked={allSel} onChange={toggleAll} style={{ accentColor: 'var(--accent)', cursor: 'pointer', width: 15, height: 15 }} />
              <SortHeader label="ORDER" asc="orderaz" desc="orderza" />
              <span>ROUTE</span>
              <span>ITEMS</span>
              {showValue && <span>VALUE</span>}
              <span>TYPE</span>
              <SortHeader label="DATE" asc="old" desc="new" />
              <span>UPDATED</span>
              <span>STATUS</span>
              <span style={{ textAlign: 'right' }}>ACTION</span>
            </div>

            {paged.map((o, ri) => {
              const items = o.items.reduce((n, it) => n + it.qty, 0);
              const route = orderRoute(o);
              const sel = s.oSel.includes(o.id);
              const flagSteps = flagStepsOf(o);
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
                  {/* route: origin above, arrowed destination below */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                    <span title={'From ' + route.from} style={{ fontSize: 13, color: 'var(--mute-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{route.from}</span>
                    <span title={'To ' + route.to} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--ink-2)', minWidth: 0 }}>
                      <ArrowRight size={12} aria-hidden="true" style={{ flex: 'none', color: 'var(--accent)' }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{route.to}</span>
                    </span>
                  </div>
                  <span style={{ fontSize: 14, color: 'rgba(var(--ink-rgb),0.7)' }}>{items} pc{items === 1 ? '' : 's'}</span>
                  {showValue && <span style={{ fontSize: 14, fontWeight: 600 }}>{o.value}</span>}
                  <span style={{ fontSize: 13, color: 'var(--mute-2)' }}>{o.channel}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--ink-2)' }}>{o.placed.split(' · ')[0]}</span>
                    <span style={{ fontFamily: MONO, fontSize: 11.5, color: 'var(--mute-2)' }}>{o.placed.split(' · ')[1] || ''}</span>
                  </div>
                  <LastUpdate order={o} openDown={ri < 3} />
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flexWrap: 'wrap' }}>
                    <StatusBadge status={o.status} tone={o.tone} />
                    {/* plain mono flag-step marker beside a flagged status — no icon */}
                    {flagSteps.length > 0 && (
                      <span title={'Flagged at ' + flagSteps.join(' & ').toLowerCase()} style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: '#C62B22', whiteSpace: 'nowrap' }}>
                        {flagSteps.join(' · ')}
                      </span>
                    )}
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

        {/* pagination footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderTop: '1px solid var(--hairline)' }}>
          <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--mute)' }}>
            {list.length === 0 ? '0 orders' : page * PAGE_SIZE + 1 + '-' + Math.min(list.length, (page + 1) * PAGE_SIZE) + ' of ' + list.length + ' orders'}
          </span>
          <div style={{ flex: 1 }} />
          <button
            className="hv-white85"
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--surface)', border: '1px solid var(--surface-border)', color: 'var(--ink-2)', borderRadius: 999, padding: '7px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: page === 0 ? 0.4 : 1 }}
          >
            <ChevronLeft size={14} aria-hidden="true" /> Prev
          </button>
          <button
            className="hv-white85"
            onClick={() => setPage(page + 1)}
            disabled={page >= pages - 1}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--surface)', border: '1px solid var(--surface-border)', color: 'var(--ink-2)', borderRadius: 999, padding: '7px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: page >= pages - 1 ? 0.4 : 1 }}
          >
            Next <ChevronRight size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
