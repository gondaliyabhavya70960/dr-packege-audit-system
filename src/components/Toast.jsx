export default function Toast({ msg }) {
  return (
    <div style={{ position: 'fixed', left: '50%', bottom: 96, transform: 'translateX(-50%)', zIndex: 80, background: 'rgba(34,28,40,0.82)', backdropFilter: 'blur(24px) saturate(1.6)', WebkitBackdropFilter: 'blur(24px) saturate(1.6)', color: '#FFFFFF', borderRadius: 16, padding: '13px 26px', fontSize: 14, fontWeight: 500, boxShadow: '0 18px 44px -10px rgba(20,14,28,0.5), inset 0 1px 0 rgba(255,255,255,0.18)', animation: 'toastIn 0.25s ease' }}>
      {msg}
    </div>
  );
}
