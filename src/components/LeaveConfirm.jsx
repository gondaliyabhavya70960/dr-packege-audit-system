import { fmt, glassSheet, buildCustomOrder } from '../data.js';
import useDialog from './useDialog.js';

// Shown when the operator taps the Mayavé logo (→ dashboard) while there is
// unsaved work: a live recording session, or an order being created / edited.
// Offers Save & go, Discard & go, or Cancel.
export default function LeaveConfirm({ ctx }) {
  const { s, set, showToast } = ctx;
  const dialogRef = useDialog(() => set({ leaveConfirm: false }));

  const tab = ['pack', 'recv', 'ret'].includes(s.screen) ? s.screen : s.orderTab;
  const inSession = ['pack', 'recv', 'ret'].includes(tab) && (['pack', 'recv', 'ret'].includes(s.screen) || s.screen === 'order');
  const creating = s.orderEditing && !s.orderId;
  const sid = tab === 'pack' ? s.packId : tab === 'recv' ? s.recvChallan : s.retId;

  const toDashboard = (extra) =>
    set({ leaveConfirm: false, screen: 'home', recActive: false, orderEditing: false, orderDraft: null, sessionReturn: null, profileMenuOpen: false, adminMenuOpen: false, ...(extra || {}) });

  const discard = () => {
    toDashboard();
    showToast(inSession ? 'Session discarded — back to dashboard.' : 'Changes discarded — back to dashboard.');
  };

  const save = () => {
    if (inSession) {
      const kind = tab === 'pack' ? 'pack' : tab === 'recv' ? 'challan · receive' : 'return';
      const rec = { id: sid, kinds: kind, outcome: 'draft', tone: 'amber', operator: s.userLabel, station: 'AUDIT-BENCH-1', ts: 'today · paused at ' + fmt(s.recSec), hash: 'f0' + Math.random().toString(16).slice(2, 8) + '…2d88', pair: false };
      toDashboard({ records: [rec, ...s.records], lastSession: sid + ' · saved as draft' });
      showToast('Session saved as draft — scan ' + sid + ' to resume.');
      return;
    }
    if (creating) {
      const d = s.orderDraft || {};
      const id = (d.id || '').trim().toUpperCase();
      if (!id || !(d.customer || '').trim()) {
        showToast('Add an order ID and customer before saving.');
        return; // keep the dialog open so they can finish or discard
      }
      const newOrder = buildCustomOrder(d, s.userLabel || 'admin');
      toDashboard({ orders: [newOrder, ...s.orders], orderId: id, lastSession: id + ' · saved' });
      showToast('Order ' + id + ' saved to the orders list.');
      return;
    }
    // editing an existing order's custom details
    toDashboard({ orders: s.orders.map((o) => (o.id === s.orderId ? { ...o, custom: s.orderDraft } : o)) });
    showToast('Custom details saved for ' + s.orderId + '.');
  };

  const title = inSession ? 'Leave this session?' : 'Save your changes?';
  const body = inSession
    ? 'Recording will stop. Save your progress as a draft to resume later, or discard the session — no video will be filed.'
    : 'You have unsaved edits on this order. Save all details before heading to the dashboard, or discard your changes.';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(28,20,32,0.32)', backdropFilter: 'blur(14px) saturate(1.4)', WebkitBackdropFilter: 'blur(14px) saturate(1.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="leaveconfirm-title" tabIndex={-1} style={{ ...glassSheet, width: 440, maxWidth: '94%', borderRadius: 26, padding: 26, display: 'flex', flexDirection: 'column', gap: 14, outline: 'none' }}>
        <span id="leaveconfirm-title" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</span>
        <span style={{ fontSize: 14, color: '#5B616B', lineHeight: 1.5, textWrap: 'pretty' }}>{body}</span>
        <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
          <button className="hv-white75" onClick={() => set({ leaveConfirm: false })} style={{ background: 'rgba(255,255,255,0.45)', border: '1px solid rgba(0,0,0,0.06)', color: 'rgba(27,29,33,0.7)', borderRadius: 10, padding: '12px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Cancel
          </button>
          <div style={{ flex: 1 }} />
          <button className="hv-red05" onClick={discard} style={{ background: '#FFFFFF', border: '1px solid rgba(229,62,62,0.45)', color: '#C62B22', borderRadius: 10, padding: '12px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Discard
          </button>
          <button className="hv-brighten" onClick={save} style={{ background: '#8E0E22', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: '12px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(142,14,34,0.25)' }}>
            Save &amp; go
          </button>
        </div>
      </div>
    </div>
  );
}
