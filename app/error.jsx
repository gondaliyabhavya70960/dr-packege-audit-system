'use client';

// Route-segment error boundary. Catches render errors in the app island and
// offers a retry instead of a blank screen.
export default function Error({ error, reset }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #ECEDF0',
          borderRadius: 18,
          boxShadow: '0 1px 2px rgba(15,17,21,0.05), 0 14px 32px -22px rgba(15,17,21,0.28)',
          padding: 28,
          maxWidth: 460,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: 19, fontWeight: 800, color: '#8E0E22', letterSpacing: '-0.01em' }}>Something went wrong</span>
        <span style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.5 }}>
          The console hit an unexpected error{error && error.digest ? ' (' + error.digest + ')' : ''}. Your data is safe — try again.
        </span>
        <button
          onClick={() => reset()}
          style={{ alignSelf: 'center', marginTop: 4, background: '#8E0E22', color: '#FFFFFF', border: 'none', borderRadius: 12, padding: '11px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(142,14,34,0.25)' }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
