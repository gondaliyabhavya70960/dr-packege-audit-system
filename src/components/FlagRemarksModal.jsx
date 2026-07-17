import { useState } from 'react';
import { Flag, Check } from './line-icons.jsx';
import { MONO, glassSheet } from '../data.js';
import useDialog from './useDialog.js';

// Blocking popup shown when a session is saved with flagged products: every
// flagged product must carry a remark before the save can proceed. Sessions
// with no flagged products never see this — they save directly.
export default function FlagRemarksModal({ items, step, cta, onCancel, onSave }) {
  const [vals, setVals] = useState({});
  const dialogRef = useDialog(onCancel);

  const val = (k) => (vals[k] || '').trim();
  const allFilled = items.every((i) => val(i.key));
  const missing = items.filter((i) => !val(i.key)).length;

  const save = () => {
    if (!allFilled) return;
    const out = {};
    items.forEach((i) => {
      out[i.key] = val(i.key);
    });
    onSave(out);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(22,16,28,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="flag-remarks-title" tabIndex={-1} style={{ ...glassSheet, borderRadius: 24, width: 560, maxWidth: '100%', maxHeight: '88vh', overflow: 'auto', padding: 22, display: 'flex', flexDirection: 'column', gap: 14, outline: 'none' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span id="flag-remarks-title" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 700 }}>
            <Flag size={17} aria-hidden="true" style={{ color: '#C62B22' }} />
            Add a remark for each flagged product
          </span>
          <span style={{ fontSize: 13.5, color: 'var(--mute-2)', lineHeight: 1.45 }}>
            {items.length} product{items.length === 1 ? '' : 's'} flagged during {step}. A remark on every flagged product is required before the session can be saved.
          </span>
        </div>

        {items.map((i) => (
          <div key={i.key} style={{ display: 'flex', flexDirection: 'column', gap: 6, background: 'rgba(229,62,62,0.04)', border: '1px solid rgba(229,62,62,0.25)', borderRadius: 14, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14.5, fontWeight: 700 }}>{i.name}</span>
              <span style={{ fontFamily: MONO, fontSize: 11, color: 'var(--mute)' }}>{i.sku}</span>
              {val(i.key) ? (
                <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: MONO, fontSize: 10, color: '#0E8A50' }}><Check size={11} strokeWidth={3} aria-hidden="true" style={{ flex: 'none' }} /> remark added</span>
              ) : (
                <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 10, color: '#C62B22' }}>remark required</span>
              )}
            </div>
            <textarea
              className="fc-accent"
              rows={2}
              aria-label={'Remark for ' + i.name + ' · ' + i.sku}
              value={vals[i.key] || ''}
              onChange={(e) => setVals((cur) => ({ ...cur, [i.key]: e.target.value }))}
              placeholder="Why is this product flagged? e.g. clasp loose · hallmark unclear on camera…"
              style={{ resize: 'vertical', background: 'var(--surface)', border: '1px solid rgba(110,100,108,0.3)', borderRadius: 10, padding: '9px 12px', fontSize: 13.5, color: 'var(--ink-2)', outline: 'none', fontFamily: 'inherit' }}
            />
          </div>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12.5, color: allFilled ? '#0E8A50' : 'var(--mute)' }}>
            {allFilled ? 'All flagged products have remarks — ready to save.' : missing + ' remark' + (missing === 1 ? '' : 's') + ' still needed.'}
          </span>
          <div style={{ flex: 1 }} />
          <button className="hv-white75" onClick={onCancel} style={{ background: 'rgba(var(--surf-rgb),0.5)', border: '1px solid rgba(0,0,0,0.08)', color: 'rgba(var(--ink-rgb),0.7)', borderRadius: 10, padding: '11px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Back to session
          </button>
          <button className="hv-brighten" onClick={save} disabled={!allFilled} style={{ background: 'var(--accent)', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: '11px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: allFilled ? 1 : 0.4, boxShadow: '0 4px 14px rgba(var(--accent-rgb),0.25)' }}>
            {cta}
          </button>
        </div>
      </div>
    </div>
  );
}
