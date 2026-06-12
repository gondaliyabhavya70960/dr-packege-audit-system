export default function Toast({ msg }) {
  return (
    <div style={{ position: 'fixed', left: '50%', bottom: 96, transform: 'translateX(-50%)', zIndex: 80, background: '#2A2D32', color: '#FFFFFF', borderRadius: 10, padding: '12px 24px', fontSize: 14, fontWeight: 500, boxShadow: '0 12px 32px rgba(15,30,60,0.3)', animation: 'toastIn 0.25s ease' }}>
      {msg}
    </div>
  );
}
