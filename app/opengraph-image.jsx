import { ImageResponse } from 'next/og';

export const alt = 'Mayavé Packaging Audit — video proof at packing, receiving and returns';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Generated social card (no external assets needed).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          color: '#FFFFFF',
          background: 'linear-gradient(135deg, #7C0A1A 0%, #A81330 70%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 18,
              background: 'rgba(255,255,255,0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 38,
              fontWeight: 800,
            }}
          >
            M
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: 4 }}>MAYAVÉ</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05 }}>Packaging Audit System</div>
          <div style={{ marginTop: 20, fontSize: 32, opacity: 0.85 }}>One ID. Every checkpoint. Video proof in seconds.</div>
        </div>

        <div style={{ fontSize: 22, opacity: 0.72, letterSpacing: 6 }}>PACK · RECEIVE · RETURN</div>
      </div>
    ),
    { ...size }
  );
}
