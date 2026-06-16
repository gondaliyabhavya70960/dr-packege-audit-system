import { cardLight } from '../data.js';

// Shared zero-state: icon + title + sub + optional action. Uses the brand tokens.
export default function EmptyState({ icon: Icon, title, sub, action }) {
  return (
    <div style={{ ...cardLight, padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
      {Icon && (
        <span style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(142,14,34,0.08)', color: '#8E0E22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={26} aria-hidden="true" />
        </span>
      )}
      <span style={{ fontSize: 16, fontWeight: 700, color: '#0F1115' }}>{title}</span>
      {sub && <span style={{ fontSize: 13.5, color: '#6B7280', maxWidth: 400, lineHeight: 1.5 }}>{sub}</span>}
      {action}
    </div>
  );
}
