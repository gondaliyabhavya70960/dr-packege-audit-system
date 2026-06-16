import { useState } from 'react';
import { MONO, glass, cardLight, INK } from '../data.js';

// Per-order remark / comment system. `variant="thread"` shows the full
// comment list plus an input (used on the order's Detail/overview); the default
// compact input is used on each step (Packing / Receive / Return). Every remark
// is stamped with the signed-in user and the time it was added.
export default function RemarkBox({ ctx, id, variant = 'input', readOnly = false }) {
  const { s, addRemark } = ctx;
  const [text, setText] = useState('');
  const order = s.orders.find((o) => o.id === id);
  if (!order) return null;
  const remarks = order.remarks || [];

  const submit = () => {
    if (!text.trim()) return;
    addRemark(id, text);
    setText('');
  };

  const inputRow = (
    <div style={{ display: 'flex', gap: 8 }}>
      <input
        className="fc-accent"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        placeholder="Add a remark…"
        style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E2E4E9', borderRadius: 12, padding: '11px 14px', fontSize: 14, color: '#1B1D21', outline: 'none' }}
      />
      <button
        className="hv-brighten"
        onClick={submit}
        disabled={!text.trim()}
        style={{ flex: 'none', background: '#8E0E22', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', opacity: text.trim() ? 1 : 0.45 }}
      >
        Add
      </button>
    </div>
  );

  if (variant === 'input') {
    return (
      <div style={{ ...glass, padding: 14, display: 'flex', flexDirection: 'column', gap: 9 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Remark</span>
          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.08em', color: '#6B7280' }}>{remarks.length} on this order · shown in Detail</span>
        </div>
        {inputRow}
      </div>
    );
  }

  // thread (Detail / overview)
  return (
    <div style={{ ...cardLight, padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: INK, letterSpacing: '-0.01em' }}>Remarks</span>
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.1em', padding: '3px 9px', borderRadius: 999, background: 'rgba(142,14,34,0.08)', color: '#8E0E22' }}>{remarks.length}</span>
      </div>
      {remarks.length === 0 && <span style={{ fontSize: 13, color: '#6B7280' }}>{readOnly ? 'No remarks on this order.' : 'No remarks yet — add one from any step.'}</span>}
      {remarks.map((r, i) => (
        <div key={i} style={{ display: 'flex', gap: 10 }}>
          <span style={{ width: 30, height: 30, flex: 'none', borderRadius: '50%', background: 'rgba(142,14,34,0.12)', color: '#8E0E22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
            {(r.who || '?').charAt(0).toUpperCase()}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13.5, fontWeight: 700 }}>{r.who}</span>
              <span style={{ fontFamily: MONO, fontSize: 11, color: '#6B7280' }}>{r.time}</span>
            </div>
            <span style={{ fontSize: 14, color: 'rgba(27,29,33,0.8)', textWrap: 'pretty' }}>{r.text}</span>
          </div>
        </div>
      ))}
      {!readOnly && inputRow}
    </div>
  );
}
