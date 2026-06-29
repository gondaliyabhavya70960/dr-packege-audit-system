import { useEffect, useRef, useState } from 'react';
import { glassPopover } from '../data.js';
import { Plus, ChevronDown, ShoppingCart, Sparkles, Boxes, Truck } from 'lucide-react';

// the order types the "New order" actions can create, each with a creative icon
export const NEW_ORDER_TYPES = [
  { type: 'ecommerce', label: 'E-commerce order', sub: 'Online customer order', Icon: ShoppingCart, color: '#2563EB' },
  { type: 'custom', label: 'Custom order', sub: 'Bespoke · made to order', Icon: Sparkles, color: '#8E0E22' },
  { type: 'bulk', label: 'Bulk order', sub: 'Wholesale · B2B consignment', Icon: Boxes, color: '#9A6A00' },
  { type: 'transfer', label: 'Transfer order', sub: 'Inter-branch challan', Icon: Truck, color: '#0E8A50' },
];

// "New order" split button → glass popover of typed create options
export default function NewOrderMenu({ onPick }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);
  const pick = (t) => { setOpen(false); onPick(t); };
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        data-tour="customorder"
        className="hv-brighten"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#8E0E22', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: '11px 16px', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(142,14,34,0.25)' }}
      >
        <Plus size={16} aria-hidden="true" />
        New order
        <ChevronDown size={15} aria-hidden="true" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.16s ease' }} />
      </button>
      {open && (
        <div role="menu" style={{ ...glassPopover, position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 288, borderRadius: 18, padding: 8, display: 'flex', flexDirection: 'column', gap: 2, zIndex: 80 }}>
          {NEW_ORDER_TYPES.map((o) => (
            <button
              key={o.type}
              role="menuitem"
              className="hv-white7"
              onClick={() => pick(o.type)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', border: 'none', background: 'transparent', borderRadius: 12, padding: '10px 11px', cursor: 'pointer' }}
            >
              <span style={{ width: 38, height: 38, flex: 'none', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', background: o.color + '1a', color: o.color }}>
                <o.Icon size={19} aria-hidden="true" />
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-2)' }}>{o.label}</span>
                <span style={{ fontSize: 12, color: 'var(--mute)' }}>{o.sub}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
