import { tourDefs } from '../data.js';

export default function Tour({ ctx }) {
  const { s, tourGo, endTour } = ctx;

  const step = tourDefs[s.tourStep];
  const tr = s.tourRect;

  let hasSpot = false;
  let spotTop = '0px', spotLeft = '0px', spotW = '0px', spotH = '0px';
  let cardTop = '50%', cardLeft = '50%', cardTransform = 'translate(-50%,-50%)';

  if (tr) {
    hasSpot = true;
    const pad = 8;
    spotTop = tr.t - pad + 'px';
    spotLeft = tr.l - pad + 'px';
    spotW = tr.w + pad * 2 + 'px';
    spotH = tr.h + pad * 2 + 'px';
    const vw = window.innerWidth, vh = window.innerHeight, cw = 390, ch = 260;
    const cl = Math.min(Math.max(tr.l, 14), Math.max(14, vw - cw - 14));
    let ct = tr.t + tr.h + pad + 14;
    if (ct + ch > vh - 14) ct = Math.max(14, tr.t - pad - 14 - ch);
    cardTop = ct + 'px';
    cardLeft = cl + 'px';
    cardTransform = 'none';
  }

  const isLast = s.tourStep >= tourDefs.length - 1;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 95 }}>
      {hasSpot ? (
        <div style={{ position: 'absolute', borderRadius: 14, border: '3px solid #FFFFFF', boxShadow: '0 0 0 9999px rgba(25,12,15,0.55), 0 4px 30px rgba(0,0,0,0.35)', transition: 'all 0.35s ease', pointerEvents: 'none', top: spotTop, left: spotLeft, width: spotW, height: spotH }} />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(25,12,15,0.55)' }} />
      )}

      <div style={{ position: 'absolute', width: 390, maxWidth: '92vw', background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(24px) saturate(1.4)', borderRadius: 18, padding: 22, display: 'flex', flexDirection: 'column', gap: 11, boxShadow: '0 24px 70px rgba(0,0,0,0.4)', transition: 'all 0.35s ease', top: cardTop, left: cardLeft, transform: cardTransform }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <span style={{ width: 36, height: 36, flex: 'none', borderRadius: '50%', background: '#FBE5E8', color: '#8E0E22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800 }}>{s.tourStep + 1}</span>
          <span style={{ fontSize: 19, fontWeight: 800, color: '#8E0E22', letterSpacing: '-0.01em', flex: 1 }}>{step.t}</span>
          <button className="hv-text-dark" onClick={endTour} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 16, cursor: 'pointer', padding: 2 }}>
            ✕
          </button>
        </div>
        <span style={{ fontSize: 14.5, color: '#374151', lineHeight: 1.6, textWrap: 'pretty' }}>{step.b}</span>
        <div style={{ height: 1, background: '#F0F1F3' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {tourDefs.map((_, i) => (
            <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: i === s.tourStep ? '#8E0E22' : '#E5E7EB' }} />
          ))}
          <div style={{ flex: 1 }} />
          {s.tourStep > 0 && (
            <button className="hv-border-accent-strong" onClick={() => tourGo(s.tourStep - 1)} style={{ background: '#FFFFFF', border: '1px solid rgba(110,100,108,0.35)', color: '#374151', borderRadius: 10, padding: '10px 16px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>
              Back
            </button>
          )}
          <button className="hv-border-accent-strong" onClick={endTour} style={{ background: '#FFFFFF', border: '1px solid rgba(110,100,108,0.35)', color: '#374151', borderRadius: 10, padding: '10px 16px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>
            Skip
          </button>
          <button className="hv-dark" onClick={() => tourGo(s.tourStep + 1)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, background: '#8E0E22', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: '8px 18px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>
            <span>{isLast ? 'Finish' : 'Next'}</span>
            <span style={{ fontSize: 10.5, fontWeight: 600, opacity: 0.8 }}>{s.tourStep + 1} / {tourDefs.length}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
