import { Play } from 'lucide-react';
import { MONO, glass, tone, synthOrder, PRIORITY_OPTIONS, ORDER_CHANNELS, cardLight, surfaceSubtle, INK, MUTE, HAIRLINE } from '../data.js';
import { EditIcon, ChevronRightIcon } from '../components/icons.jsx';
import PackRecord from './PackRecord.jsx';
import Receiving from './Receiving.jsx';
import ReturnInspection from './ReturnInspection.jsx';
import RemarkBox from '../components/RemarkBox.jsx';

// Action tabs shown on a single order, by side. The warehouse handles incoming
// stock so it also gets Receive; the store side does not.
const SIDE_TABS = {
  warehouse: [
    { id: 'detail', label: 'Detail' },
    { id: 'pack', label: 'Packing' },
    { id: 'recv', label: 'Receive' },
    { id: 'ret', label: 'Return' },
  ],
  store: [
    { id: 'detail', label: 'Detail' },
    { id: 'pack', label: 'Packing' },
    { id: 'ret', label: 'Return' },
  ],
};

const LIVE_TABS = ['pack', 'recv', 'ret'];

function OrderTabs({ tabs, active, onPick }) {
  return (
    <div style={{ ...cardLight, padding: 6, display: 'inline-flex', gap: 4, borderRadius: 14, alignSelf: 'flex-start', flexWrap: 'wrap', maxWidth: '100%' }}>
      {tabs.map((tb) => {
        const on = tb.id === active;
        const live = on && LIVE_TABS.includes(tb.id);
        return (
          <button
            key={tb.id}
            onClick={() => onPick(tb.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7, border: 'none', cursor: 'pointer', borderRadius: 11,
              padding: '9px 18px', fontSize: 13.5, fontWeight: 700,
              background: on ? '#8E0E22' : 'transparent', color: on ? '#FFFFFF' : 'rgba(27,29,33,0.65)',
              boxShadow: on ? '0 4px 14px rgba(142,14,34,0.25)' : 'none',
            }}
          >
            {live && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FFFFFF', animation: 'pulse 1.4s ease-in-out infinite' }} />}
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

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.12em', color: 'rgba(27,29,33,0.45)' }}>{label}</span>
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
          <select className="fc-accent" value={draft.priority} onChange={(e) => upd('priority', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
            {PRIORITY_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Field>
        <Field label="GIFT WRAP">
          <button
            onClick={() => upd('giftWrap', !draft.giftWrap)}
            style={{ ...inputStyle, cursor: 'pointer', textAlign: 'left', fontWeight: 700, color: draft.giftWrap ? '#0E8A50' : 'rgba(27,29,33,0.5)' }}
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

function ReadRow({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '9px 0', borderBottom: '1px solid ' + HAIRLINE }}>
      <span style={{ fontSize: 13, color: MUTE, width: 130, flex: 'none' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: accent ? 700 : 600, color: accent ? '#8E0E22' : INK, textWrap: 'pretty' }}>{value || '—'}</span>
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

  // ---- create mode ----
  if (creating) {
    const d = s.orderDraft;
    const saveCreate = () => {
      const id = (d.id || '').trim().toUpperCase();
      if (!id || !d.customer.trim()) {
        showToast('Add at least an order ID and customer to save.');
        return;
      }
      const newOrder = {
        id, channel: d.channel, customer: d.customer.trim(), phone: '—', address: '—',
        placed: 'today · custom entry', ts: Date.now(), statusKey: 'packed', status: 'Custom · on record',
        tone: 'plain', station: d.station, value: d.value.trim() || '—', valNum: 0,
        items: [], timeline: [{ label: 'Custom order created', time: 'today', who: s.userLabel || 'admin', clip: false }],
        custom: { priority: d.priority, giftWrap: d.giftWrap, insured: d.insured, slot: d.slot, instructions: d.instructions, notes: d.notes },
      };
      set({ orders: [newOrder, ...s.orders], orderId: id, orderEditing: false, orderDraft: null });
      showToast('Custom order ' + id + ' saved to the orders list.');
    };

    return (
      <div data-screen-label="15 Custom order details" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, minHeight: '100%' }}>
        <Breadcrumb onBack={backToList} crumb="New custom order" />
        <div style={{ ...glass, padding: 22, maxWidth: 760, width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#8E0E22', letterSpacing: '-0.01em' }}>Custom order details</span>
            <span style={{ fontSize: 14, color: 'rgba(27,29,33,0.55)' }}>Record a bespoke order with its handling, insurance and audit notes. It joins the orders list and links to any video filed under the same ID.</span>
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
              <select className="fc-accent" value={d.channel} onChange={(e) => upd('channel', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {ORDER_CHANNELS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
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

          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            <button className="hv-white75" onClick={backToList} style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.08)', color: 'rgba(27,29,33,0.7)', borderRadius: 10, padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Cancel
            </button>
            <div style={{ flex: 1 }} />
            <button className="hv-brighten" onClick={saveCreate} style={{ background: '#8E0E22', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(142,14,34,0.25)' }}>
              Save custom order
            </button>
          </div>
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

  // side-aware action tabs on the single order (Detail / Packing / Receive / Return)
  const tabs = SIDE_TABS[s.side] || SIDE_TABS.warehouse;
  const activeTab = tabs.some((tb) => tb.id === s.orderTab) ? s.orderTab : 'detail';
  const onTab = (id) => (id === 'detail' ? set({ orderTab: 'detail' }) : openSession(id, order.id, 'order'));
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
            <EditIcon size={15} />
            Edit custom details
          </button>
        )}
          </>
        )}
      </div>

      <OrderTabs tabs={tabs} active={activeTab} onPick={onTab} />

      {activeTab === 'detail' && (
      <div className="order-grid">
        {/* left: items + timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ ...cardLight, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: INK, letterSpacing: '-0.01em' }}>Items</span>
            {order.items.length === 0 && <span style={{ fontSize: 13, color: 'rgba(27,29,33,0.45)' }}>No line items recorded for this entry.</span>}
            {order.items.map((it, i) => {
              const ct = condTone(it.condition);
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, ...surfaceSubtle, borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{it.name}</span>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(27,29,33,0.5)' }}>{it.sku}</span>
                  </div>
                  <span style={{ fontFamily: MONO, fontSize: 13, color: 'rgba(27,29,33,0.6)' }}>×{it.qty}</span>
                  <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.04em', padding: '4px 11px', borderRadius: 999, border: '1px solid ' + ct.border, color: ct.color }}>{it.condition}</span>
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
                    <span style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(27,29,33,0.5)' }}>{e.time} · {e.who}</span>
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
            {clips.length === 0 && <span style={{ fontSize: 13, color: 'rgba(27,29,33,0.45)' }}>No video filed yet.</span>}
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
                <ChevronRightIcon size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>
      )}

      {activeTab !== 'detail' && (
        <div className="order-tool" style={{ marginTop: 2 }}>
          {activeTab === 'pack' && <PackRecord ctx={ctx} />}
          {activeTab === 'recv' && <Receiving ctx={ctx} />}
          {activeTab === 'ret' && <ReturnInspection ctx={ctx} />}
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
      <span style={{ color: 'rgba(27,29,33,0.35)' }}>/</span>
      <span style={{ fontFamily: MONO, color: 'rgba(27,29,33,0.6)' }}>{crumb}</span>
    </div>
  );
}
