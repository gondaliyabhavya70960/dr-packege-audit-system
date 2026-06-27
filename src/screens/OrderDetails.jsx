import { useState } from 'react';
import { Play, SquarePen, ChevronRight, Lock, Video, Trash2, Package, Inbox, RotateCcw, Truck, MapPin, Gem } from 'lucide-react';
import { MONO, glass, tone, synthOrder, PRIORITY_OPTIONS, ORDER_CHANNELS, cardLight, surfaceSubtle, INK, MUTE, HAIRLINE, tabMode, stageClip, orderRoute, feedBg, buildCustomOrder, fmt } from '../data.js';
import PackRecord from './PackRecord.jsx';
import Receiving from './Receiving.jsx';
import ReturnInspection from './ReturnInspection.jsx';
import RemarkBox from '../components/RemarkBox.jsx';
import ClipPlayer from '../components/ClipPlayer.jsx';
import VideoCaptureCard from '../components/VideoCaptureCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import GlassSelect from '../components/GlassSelect.jsx';

const STAGE_TITLES = { pack: 'Packing', recv: 'Receiving', ret: 'Return inspection' };

// A completed stage is locked to a read-only evidence view: the filed clip +
// the order's remarks. No live recording controls.
function CompletedStage({ order, stage, ctx }) {
  const clip = stageClip(order, stage);
  const g = tone('green');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ ...cardLight, padding: 18, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: INK, letterSpacing: '-0.01em' }}>{STAGE_TITLES[stage]}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.04em', padding: '4px 11px', borderRadius: 999, border: '1px solid ' + g.border, color: g.color }}>
          <Lock size={11} aria-hidden="true" /> RECORDED · READ-ONLY
        </span>
        {clip && <span style={{ fontFamily: MONO, fontSize: 12, color: MUTE }}>{clip.time} · {clip.who}</span>}
      </div>
      <div style={{ ...cardLight, padding: 14 }}>
        <ClipPlayer
          label={clip ? '[ ' + clip.label + ' — filed clip ]' : '[ no clip on file for this step ]'}
          id={order.id}
          ts={clip ? clip.time : undefined}
          hash={clip ? clip.hash : undefined}
          height={320}
          radius={14}
        />
      </div>
      <RemarkBox ctx={ctx} id={order.id} variant="thread" readOnly />
    </div>
  );
}

// A stage the order hasn't reached yet ('empty' mode) — a read-only zero-state
// explaining when the step will unlock.
const EMPTY_COPY = {
  pack: { icon: Package, title: 'Packing not started', sub: 'This order has not been packed yet. The Packing step is editable while the order is a draft.' },
  recv: { icon: Inbox, title: 'Receiving not started', sub: 'This order has not reached store receiving yet. The Receive step unlocks when the consignment arrives and is scanned in.' },
  ret: { icon: RotateCcw, title: 'No return on this order', sub: 'Nothing has been returned. The Return step unlocks if the customer raises a return and it is inspected at the desk.' },
};

function EmptyStage({ stage }) {
  const c = EMPTY_COPY[stage] || EMPTY_COPY.recv;
  return <EmptyState icon={c.icon} title={c.title} sub={c.sub} />;
}

// A stage the order is actively moving toward but hasn't reached ('status' mode)
// — a read-only order-status / tracking view (in transit / out for delivery). It
// shows where the consignment is on its journey and when the step will unlock.
const JOURNEY = [
  { key: 'packed', label: 'Packed' },
  { key: 'transit', label: 'In transit' },
  { key: 'delivery', label: 'Out for delivery' },
  { key: 'delivered', label: 'Delivered' },
];

const STATUS_COPY = {
  transit: 'The consignment has left the warehouse and is on its way. The Receive step unlocks when it arrives at the store and is scanned in.',
  delivery: 'The order is out for last-mile delivery. The Receive step unlocks once the consignment is checked in.',
};

function StatusStage({ order, stage }) {
  const a = tone('amber');
  const route = orderRoute(order);
  const curIdx = JOURNEY.findIndex((m) => m.key === order.statusKey);
  const sub = STATUS_COPY[order.statusKey] || STATUS_COPY.transit;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ ...cardLight, padding: 18, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: INK, letterSpacing: '-0.01em' }}>{STAGE_TITLES[stage]}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.04em', padding: '4px 11px', borderRadius: 999, border: '1px solid ' + a.border, color: a.color }}>
          <Truck size={11} aria-hidden="true" /> {order.status.toUpperCase()}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 12, color: MUTE }}>live status · read-only</span>
      </div>

      <div style={{ ...cardLight, padding: 22, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap', fontSize: 14, color: INK }}>
          <MapPin size={15} aria-hidden="true" style={{ color: '#8E0E22', flex: 'none' }} />
          <span style={{ fontWeight: 700 }}>{route.from}</span>
          <ChevronRight size={15} aria-hidden="true" style={{ color: MUTE, flex: 'none' }} />
          <span style={{ fontWeight: 700 }}>{route.to}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          {JOURNEY.map((m, i) => {
            const done = curIdx >= 0 && i < curIdx;
            const active = i === curIdx;
            const reached = done || active;
            return (
              <div key={m.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative' }}>
                {i < JOURNEY.length - 1 && (
                  <span style={{ position: 'absolute', top: 9, left: '50%', width: '100%', height: 2, background: done ? '#8E0E22' : 'rgba(27,29,33,0.12)' }} />
                )}
                <span style={{ position: 'relative', width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? '#8E0E22' : done ? 'rgba(142,14,34,0.15)' : '#FFFFFF', border: '2px solid ' + (reached ? '#8E0E22' : 'rgba(27,29,33,0.2)') }}>
                  {active && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FFFFFF', animation: 'pulse 1.4s ease-in-out infinite' }} />}
                </span>
                <span style={{ fontSize: 12, fontWeight: active ? 700 : 600, color: reached ? '#8E0E22' : 'rgba(27,29,33,0.4)', textAlign: 'center' }}>{m.label}</span>
              </div>
            );
          })}
        </div>

        <div style={{ ...surfaceSubtle, borderRadius: 12, padding: '14px 16px', fontSize: 13.5, color: '#5B616B', lineHeight: 1.5 }}>{sub}</div>
      </div>
    </div>
  );
}

// Every single order exposes the full set of tabs — Detail, Packing, Receive
// and Return — regardless of which side (warehouse / store) is signed in. Each
// stage opens its tool inline; completed stages lock to a read-only clip view.
const ORDER_TABS = [
  { id: 'detail', label: 'Detail' },
  { id: 'pack', label: 'Packing' },
  { id: 'recv', label: 'Receive' },
  { id: 'ret', label: 'Return' },
];

// Tab strip indicators reflect each tab's mode: a pulsing dot marks the live,
// editable stage; a lock marks a recorded (view) stage; an empty stage reads
// dimmed (not started). Detail carries no badge.
function OrderTabs({ tabs, active, onPick, modeOf }) {
  return (
    <div style={{ ...cardLight, padding: 6, display: 'inline-flex', gap: 4, borderRadius: 14, alignSelf: 'flex-start', flexWrap: 'wrap', maxWidth: '100%' }}>
      {tabs.map((tb) => {
        const on = tb.id === active;
        const mode = modeOf(tb.id);
        const isEdit = mode === 'edit' && tb.id !== 'detail';
        const isView = mode === 'view' && tb.id !== 'detail';
        const isStatus = mode === 'status' && tb.id !== 'detail';
        const isEmpty = mode === 'empty';
        return (
          <button
            key={tb.id}
            onClick={() => onPick(tb.id)}
            title={isEdit ? tb.label + ' · live · edit' : isView ? tb.label + ' · recorded' : isStatus ? tb.label + ' · in transit' : isEmpty ? tb.label + ' · not started' : tb.label}
            style={{
              display: 'flex', alignItems: 'center', gap: 7, border: 'none', cursor: 'pointer', borderRadius: 11,
              padding: '9px 18px', fontSize: 13.5, fontWeight: 700,
              background: on ? '#8E0E22' : 'transparent',
              color: on ? '#FFFFFF' : isEmpty ? 'rgba(27,29,33,0.4)' : 'rgba(27,29,33,0.65)',
              boxShadow: on ? '0 4px 14px rgba(142,14,34,0.25)' : 'none',
            }}
          >
            {isEdit && <span style={{ width: 7, height: 7, borderRadius: '50%', background: on ? '#FFFFFF' : '#8E0E22', animation: 'pulse 1.4s ease-in-out infinite' }} />}
            {isView && <Lock size={12} aria-hidden="true" style={{ opacity: on ? 0.9 : 0.7 }} />}
            {isStatus && <Truck size={13} aria-hidden="true" style={{ opacity: on ? 0.95 : 0.75 }} />}
            {tb.label}
          </button>
        );
      })}
    </div>
  );
}

const inputStyle = {
  background: 'rgba(255,255,255,0.6)',
  border: '1px solid rgba(0,0,0,0.1)',
  borderRadius: 10,
  padding: '9px 13px',
  fontSize: 14,
  color: '#1B1D21',
  outline: 'none',
  width: '100%',
  fontFamily: 'inherit',
};

const condTone = (c) => {
  if (c === 'verified') return tone('green');
  if (c === 'damaged' || c === 'disputed' || c === 'missing') return tone('red');
  return tone('amber');
};

// A mini "scan frame" thumbnail for a line item — a jewelry glyph over a dark
// camera-feed crop with a YOLO-style detection box, tinted to the item's
// condition. Stands in for the still where the product was picked up on video.
function DetectedThumb({ item }) {
  const ct = condTone(item.condition);
  return (
    <div
      role="img"
      aria-label={'Scan frame · ' + item.name + ' detected'}
      title={'Detected on scan video · ' + item.name}
      style={{ position: 'relative', width: 44, height: 44, flex: 'none', borderRadius: 9, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', ...feedBg, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)' }}
    >
      <Gem size={19} aria-hidden="true" style={{ color: 'rgba(255,255,255,0.9)' }} />
      <span style={{ position: 'absolute', inset: 7, border: '1.5px solid ' + ct.color, borderRadius: 4 }} />
      <span style={{ position: 'absolute', top: 4, right: 4, width: 5, height: 5, borderRadius: '50%', background: ct.color, boxShadow: '0 0 0 1.5px rgba(0,0,0,0.35)' }} />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 500, letterSpacing: '0.1em', color: '#6B7280' }}>{label}</span>
      {children}
    </div>
  );
}

// editable custom-details form, shared by create + edit modes
function CustomEditor({ draft, upd }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="PRIORITY">
          <GlassSelect value={draft.priority} onChange={(v) => upd('priority', v)} options={PRIORITY_OPTIONS.map((p) => ({ value: p, label: p }))} minWidth={0} />
        </Field>
        <Field label="GIFT WRAP">
          <button
            onClick={() => upd('giftWrap', !draft.giftWrap)}
            style={{ ...inputStyle, cursor: 'pointer', textAlign: 'left', fontWeight: 700, color: draft.giftWrap ? '#0E8A50' : '#6B7280' }}
          >
            {draft.giftWrap ? 'Yes · gift wrap' : 'No'}
          </button>
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="INSURED VALUE">
          <input className="fc-accent" value={draft.insured} onChange={(e) => upd('insured', e.target.value)} placeholder="₹0.00L" style={inputStyle} />
        </Field>
        <Field label="DELIVERY SLOT">
          <input className="fc-accent" value={draft.slot} onChange={(e) => upd('slot', e.target.value)} placeholder="e.g. 4–7 PM" style={inputStyle} />
        </Field>
      </div>
      <Field label="SPECIAL INSTRUCTIONS">
        <textarea className="fc-accent" value={draft.instructions} onChange={(e) => upd('instructions', e.target.value)} rows={2} placeholder="Handling, delivery or packing notes…" style={{ ...inputStyle, resize: 'vertical' }} />
      </Field>
      <Field label="INTERNAL NOTES">
        <textarea className="fc-accent" value={draft.notes} onChange={(e) => upd('notes', e.target.value)} rows={2} placeholder="Visible to the audit team only…" style={{ ...inputStyle, resize: 'vertical' }} />
      </Field>
    </div>
  );
}

// Packing video capture for the new custom-order form: a live recording card
// (start / stop / capture still) plus the list of clips filed so far. Each clip
// expands to an evidence player. The list lives on the draft, so it saves with
// the order.
function PackingCapture({ orderId, videos, setVideos }) {
  const [openIdx, setOpenIdx] = useState(-1);
  const list = videos || [];

  const addClip = (clip) => setVideos([...list, clip]);
  const removeClip = (i) => {
    setVideos(list.filter((_, idx) => idx !== i));
    setOpenIdx((cur) => (cur === i ? -1 : cur > i ? cur - 1 : cur));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 16, fontWeight: 700, color: INK, letterSpacing: '-0.01em' }}>
          <Video size={17} aria-hidden="true" style={{ color: '#8E0E22' }} /> Packing video capture
        </span>
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', padding: '3px 9px', borderRadius: 999, background: 'rgba(142,14,34,0.08)', color: '#8E0E22' }}>{list.length} CLIP{list.length === 1 ? '' : 'S'}</span>
      </div>
      <span style={{ fontSize: 13, color: '#5B616B' }}>Record the pack at the bench — start, capture stills, then stop to file each clip against this order. Filed clips appear in the list below.</span>

      <VideoCaptureCard id={orderId || 'NEW-ORDER'} label="Pack capture" camLabel="CAM-01 · pack bench" feedText="[ live feed — top-view · pack bench ]" onCapture={addClip} minHeight={210} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {list.length === 0 ? (
          <div style={{ ...surfaceSubtle, borderRadius: 12, padding: '14px 16px', fontSize: 13, color: '#6B7280' }}>No clips captured yet — press <strong style={{ color: '#8E0E22' }}>Start recording</strong> above to film the pack.</div>
        ) : (
          list.map((v, i) => {
            const open = openIdx === i;
            return (
              <div key={i} style={{ ...surfaceSubtle, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
                  <button
                    onClick={() => setOpenIdx(open ? -1 : i)}
                    aria-label={open ? 'Hide clip' : 'Play clip'}
                    className="hv-accent14"
                    style={{ width: 34, height: 34, flex: 'none', borderRadius: 9, background: 'rgba(142,14,34,0.1)', color: '#8E0E22', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
                  >
                    <Play size={15} aria-hidden="true" />
                  </button>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Pack clip {i + 1} · {fmt(v.dur)}{v.stills ? ' · ' + v.stills + ' still' + (v.stills === 1 ? '' : 's') : ''}</span>
                    <span style={{ fontFamily: MONO, fontSize: 10.5, color: '#0E8A50' }}>{v.time} · sha {v.hash} ✓</span>
                  </div>
                  <button onClick={() => removeClip(i)} aria-label="Remove clip" className="hv-red08" style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, background: 'transparent', border: '1px solid rgba(0,0,0,0.08)', color: '#C62B22', cursor: 'pointer' }}>
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
                {open && (
                  <div style={{ padding: '0 14px 14px' }}>
                    <ClipPlayer label={'[ pack clip ' + (i + 1) + ' — filed ]'} id={orderId || 'NEW-ORDER'} ts={v.time} hash={v.hash} height={180} radius={12} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ReadRow({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '9px 0', borderBottom: '1px solid ' + HAIRLINE }}>
      <span style={{ fontSize: 13, color: MUTE, width: 130, flex: 'none' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: accent ? 700 : 600, color: accent ? '#8E0E22' : INK, textWrap: 'pretty' }}>{value || '—'}</span>
    </div>
  );
}

// The custom-order create form — shared by the page route and the popup modal.
// Reads/writes the draft on ctx state; calls onClose(savedId) after save, or
// onClose(null) on cancel.
export function CreateOrderForm({ ctx, onClose }) {
  const { s, set, showToast } = ctx;
  const d = s.orderDraft;
  if (!d) return null;
  const upd = (k, v) => set({ orderDraft: { ...s.orderDraft, [k]: v } });
  const cancel = () => { set({ orderDraft: null }); onClose && onClose(null); };
  const saveCreate = () => {
    const id = (d.id || '').trim().toUpperCase();
    if (!id || !(d.customer || '').trim()) {
      showToast('Add at least an order ID and customer to save.');
      return;
    }
    const newOrder = buildCustomOrder(d, s.userLabel || 'admin'); // captured a pack clip -> Packed, else Draft
    const packed = newOrder.statusKey === 'packed';
    set({ orders: [newOrder, ...s.orders], orderDraft: null });
    showToast(packed ? 'Custom order ' + id + ' filed with pack video — saved to the orders list.' : 'Draft order ' + id + ' saved to the orders list.');
    onClose && onClose(id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: '#8E0E22', letterSpacing: '-0.01em' }}>Custom order details</span>
        <span style={{ fontSize: 14, color: '#5B616B' }}>Record a bespoke order with its handling, insurance and audit notes. It joins the orders list and links to any video filed under the same ID.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="ORDER ID *">
          <input className="fc-accent" value={d.id} onChange={(e) => upd('id', e.target.value)} placeholder="ORD-… / DC-… / RFID-…" style={{ ...inputStyle, fontFamily: MONO }} />
        </Field>
        <Field label="CUSTOMER *">
          <input className="fc-accent" value={d.customer} onChange={(e) => upd('customer', e.target.value)} placeholder="name or store" style={inputStyle} />
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Field label="CHANNEL">
          <GlassSelect value={d.channel} onChange={(v) => upd('channel', v)} options={ORDER_CHANNELS.map((c) => ({ value: c, label: c }))} minWidth={0} />
        </Field>
        <Field label="STATION">
          <input className="fc-accent" value={d.station} onChange={(e) => upd('station', e.target.value)} style={{ ...inputStyle, fontFamily: MONO }} />
        </Field>
        <Field label="ORDER VALUE">
          <input className="fc-accent" value={d.value} onChange={(e) => upd('value', e.target.value)} placeholder="₹0.00L" style={inputStyle} />
        </Field>
      </div>

      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }} />
      <CustomEditor draft={d} upd={upd} />

      <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }} />
      <PackingCapture orderId={d.id} videos={d.packVideos} setVideos={(v) => upd('packVideos', v)} />

      <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
        <button className="hv-white75" onClick={cancel} style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.08)', color: 'rgba(27,29,33,0.7)', borderRadius: 10, padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          Cancel
        </button>
        <div style={{ flex: 1 }} />
        <button className="hv-brighten" onClick={saveCreate} style={{ background: '#8E0E22', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(142,14,34,0.25)' }}>
          Save custom order
        </button>
      </div>
    </div>
  );
}

export default function OrderDetails({ ctx }) {
  const { s, set, showToast, openPlayer, openSession } = ctx;

  const creating = s.orderId === '' && s.orderEditing && s.orderDraft;
  const order = creating ? null : s.orders.find((o) => o.id === s.orderId) || synthOrder(s.orderId);
  const editing = s.orderEditing && !creating;

  const upd = (k, v) => set({ orderDraft: { ...s.orderDraft, [k]: v } });
  const backToList = () => set({ screen: 'orders', orderTab: 'detail', orderEditing: false, orderDraft: null });

  // ---- create mode (page fallback; the primary entry is the popup modal) ----
  if (creating) {
    return (
      <div data-screen-label="15 Custom order details" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, minHeight: '100%' }}>
        <Breadcrumb onBack={backToList} crumb="New custom order" />
        <div style={{ ...glass, padding: 22, maxWidth: 760, width: '100%' }}>
          <CreateOrderForm ctx={ctx} onClose={(id) => (id ? set({ orderEditing: false, orderId: id }) : backToList())} />
        </div>
      </div>
    );
  }

  // ---- view / edit existing ----
  const t = tone(order.tone);
  const clips = order.timeline.filter((e) => e.clip);
  const hasPair = clips.length >= 2;

  const startEdit = () => set({ orderEditing: true, orderDraft: { ...order.custom } });
  const cancelEdit = () => set({ orderEditing: false, orderDraft: null });
  const saveEdit = () => {
    set({ orders: s.orders.map((o) => (o.id === order.id ? { ...o, custom: s.orderDraft } : o)), orderEditing: false, orderDraft: null });
    showToast('Custom details updated for ' + order.id + '.');
  };

  const c = editing ? s.orderDraft : order.custom;

  // all four action tabs on the single order (Detail / Packing / Receive / Return)
  const tabs = ORDER_TABS;
  const activeTab = tabs.some((tb) => tb.id === s.orderTab) ? s.orderTab : 'detail';
  // each tab's mode is derived from the order status: view | edit | status | empty
  const modeFor = (id) => tabMode(order.statusKey, id);
  const onTab = (id) => {
    if (id === 'detail') return set({ orderTab: 'detail' });
    if (modeFor(id) === 'edit') return openSession(id, order.id, 'order'); // active stage -> live tool
    return set({ orderTab: id, orderEditing: false, orderDraft: null }); // view / status / empty -> read-only
  };
  const backLabel = s.listKind === 'transfer' ? 'Transferring goods' : 'Packaging';

  return (
    <div data-screen-label="15 Custom order details" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, minHeight: '100%' }}>
      <Breadcrumb onBack={backToList} crumb={order.id} back={backLabel} />

      {/* header card */}
      <div style={{ ...cardLight, padding: 20, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: MONO, fontSize: 20, fontWeight: 500 }}>{order.id}</span>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.04em', padding: '4px 11px', borderRadius: 999, border: '1px solid ' + t.border, color: t.color }}>{order.status}</span>
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', padding: '4px 10px', borderRadius: 999, background: 'rgba(142,14,34,0.08)', color: '#8E0E22' }}>{order.channel.toUpperCase()}</span>
          </div>
          <span style={{ fontSize: 14, color: MUTE }}>{order.customer} · {order.value} · placed {order.placed}</span>
        </div>
        <div style={{ flex: 1 }} />
        {activeTab === 'detail' && (
          <>
        {hasPair && (
          <button className="hv-accent14" onClick={() => openPlayer(order.id, -1, 'order')} style={{ background: 'rgba(142,14,34,0.08)', border: 'none', color: '#8E0E22', borderRadius: 999, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            Open side-by-side ▸
          </button>
        )}
        {editing ? (
          <>
            <button className="hv-white75" onClick={cancelEdit} style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.08)', color: 'rgba(27,29,33,0.7)', borderRadius: 10, padding: '10px 18px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>
              Cancel
            </button>
            <button className="hv-brighten" onClick={saveEdit} style={{ background: '#8E0E22', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(142,14,34,0.25)' }}>
              Save changes
            </button>
          </>
        ) : (
          <button className="hv-border-accent" onClick={startEdit} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.75)', color: '#8E0E22', borderRadius: 999, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            <SquarePen size={15} aria-hidden="true" />
            Edit custom details
          </button>
        )}
          </>
        )}
      </div>

      <OrderTabs tabs={tabs} active={activeTab} onPick={onTab} modeOf={modeFor} />

      {activeTab === 'detail' && (
      <div className="order-grid">
        {/* left: items + timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ ...cardLight, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: INK, letterSpacing: '-0.01em' }}>Items</span>
            {order.items.length === 0 && <span style={{ fontSize: 13, color: '#6B7280' }}>No line items recorded for this entry.</span>}
            {order.items.map((it, i) => {
              const ct = condTone(it.condition);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, ...surfaceSubtle, borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{it.name}</span>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: '#6B7280' }}>{it.sku}</span>
                  </div>
                  <span style={{ fontFamily: MONO, fontSize: 13, color: '#5B616B' }}>×{it.qty}</span>
                  <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.04em', padding: '4px 11px', borderRadius: 999, border: '1px solid ' + ct.border, color: ct.color }}>{it.condition}</span>
                  <DetectedThumb item={it} />
                </div>
              );
            })}
          </div>

          <div style={{ ...cardLight, padding: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: INK, letterSpacing: '-0.01em' }}>Timeline</span>
            {order.timeline.map((e, i) => {
              const last = i === order.timeline.length - 1;
              return (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 'none' }}>
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: last ? '#8E0E22' : 'rgba(142,14,34,0.25)', border: '2px solid #fff', boxShadow: '0 0 0 1px rgba(142,14,34,0.25)' }} />
                    {!last && <span style={{ width: 2, flex: 1, minHeight: 28, background: 'rgba(142,14,34,0.15)' }} />}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: last ? 0 : 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{e.label}</span>
                      {e.clip && (
                        <button onClick={() => openPlayer(order.id, -1, 'order')} aria-label="Play clip" className="hv-accent14" style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(142,14,34,0.08)', border: 'none', color: '#8E0E22', borderRadius: 999, padding: '2px 9px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                          <Play size={11} aria-hidden="true" /> clip
                        </button>
                      )}
                    </div>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: '#6B7280' }}>{e.time} · {e.who}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <RemarkBox ctx={ctx} id={order.id} variant="thread" />
        </div>

        {/* right: customer + custom details + media */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ ...cardLight, padding: 20, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: INK, letterSpacing: '-0.01em' }}>Customer &amp; shipping</span>
            <ReadRow label="Customer" value={order.customer} />
            <ReadRow label="Phone" value={order.phone} />
            <ReadRow label="Address" value={order.address} />
            <ReadRow label="Channel" value={order.channel} />
            <ReadRow label="Station" value={order.station} />
          </div>

          <div style={{ ...cardLight, padding: 20, display: 'flex', flexDirection: 'column', gap: 12, border: editing ? '1px solid rgba(142,14,34,0.4)' : cardLight.border }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: INK, letterSpacing: '-0.01em' }}>Custom order details</span>
              {editing && <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', padding: '3px 9px', borderRadius: 999, background: 'rgba(142,14,34,0.1)', color: '#8E0E22' }}>EDITING</span>}
            </div>
            {editing ? (
              <CustomEditor draft={c} upd={upd} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <ReadRow label="Priority" value={c.priority} accent={c.priority !== 'Standard'} />
                <ReadRow label="Gift wrap" value={c.giftWrap ? 'Yes' : 'No'} />
                <ReadRow label="Insured value" value={c.insured} />
                <ReadRow label="Delivery slot" value={c.slot} />
                <ReadRow label="Instructions" value={c.instructions} />
                <ReadRow label="Internal notes" value={c.notes} />
              </div>
            )}
          </div>

          <div style={{ ...cardLight, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: INK, letterSpacing: '-0.01em' }}>Linked evidence</span>
            {clips.length === 0 && <span style={{ fontSize: 13, color: '#6B7280' }}>No video filed yet.</span>}
            {clips.map((e, i) => (
              <button
                key={i}
                onClick={() => openPlayer(order.id, -1, 'order')}
                className="hv-chip"
                style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', cursor: 'pointer', ...surfaceSubtle, borderRadius: 12, padding: '12px 14px' }}
              >
                <span style={{ width: 34, height: 34, flex: 'none', borderRadius: 9, background: 'rgba(142,14,34,0.1)', color: '#8E0E22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play size={15} aria-hidden="true" /></span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{e.label}</span>
                  <span style={{ fontFamily: MONO, fontSize: 10.5, color: '#0E8A50' }}>sha-256 · {order.id.replace(/[^a-z0-9]/gi, '').slice(-4).toLowerCase()}{(i + 7).toString(16)}c1…f{i}2 ✓</span>
                </div>
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>
      )}

      {activeTab !== 'detail' && (
        <div className="order-tool" style={{ marginTop: 2 }}>
          {modeFor(activeTab) === 'edit' ? (
            <>
              {activeTab === 'pack' && <PackRecord ctx={ctx} />}
              {activeTab === 'recv' && <Receiving ctx={ctx} />}
              {activeTab === 'ret' && <ReturnInspection ctx={ctx} />}
            </>
          ) : modeFor(activeTab) === 'view' ? (
            <CompletedStage order={order} stage={activeTab} ctx={ctx} />
          ) : modeFor(activeTab) === 'status' ? (
            <StatusStage order={order} stage={activeTab} />
          ) : (
            <EmptyStage stage={activeTab} />
          )}
        </div>
      )}
    </div>
  );
}

function Breadcrumb({ onBack, crumb, back }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
      <button className="hv-text-dark" onClick={onBack} style={{ background: 'none', border: 'none', color: '#8E0E22', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
        ← {back || 'Orders'}
      </button>
      <span style={{ color: '#6B7280' }}>/</span>
      <span style={{ fontFamily: MONO, color: '#5B616B' }}>{crumb}</span>
    </div>
  );
}
