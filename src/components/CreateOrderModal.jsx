import { glassSheet } from '../data.js';
import useDialog from './useDialog.js';
import { CreateOrderForm } from '../screens/OrderDetails.jsx';

// Popup wrapper for the custom-order create form — a blurred glass sheet over a
// dimmed backdrop. Closing files the order (then opens it) or discards the draft.
export default function CreateOrderModal({ ctx }) {
  const { set, openOrder } = ctx;
  const close = (savedId) => {
    set({ createOpen: false, orderDraft: null });
    if (savedId) openOrder(savedId);
  };
  const dialogRef = useDialog(() => close(null));

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 95, background: 'rgba(28,20,32,0.32)', backdropFilter: 'blur(14px) saturate(1.4)', WebkitBackdropFilter: 'blur(14px) saturate(1.4)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 24, overflowY: 'auto' }}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Custom order details"
        tabIndex={-1}
        style={{ ...glassSheet, width: 760, maxWidth: '96%', borderRadius: 24, padding: 24, marginTop: 'auto', marginBottom: 'auto', outline: 'none' }}
      >
        <CreateOrderForm ctx={ctx} onClose={close} />
      </div>
    </div>
  );
}
