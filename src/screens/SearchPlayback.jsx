import { Play, Search, ChevronRight } from 'lucide-react';
import { MONO, glass, feedBg, tone } from '../data.js';

export default function SearchPlayback({ ctx }) {
  const { s, set, openPlayer, openOrder } = ctx;

  const ql = s.q.trim().toLowerCase();
  const results = s.records.filter((r) => !ql || r.id.toLowerCase().includes(ql) || r.kinds.toLowerCase().includes(ql) || r.outcome.toLowerCase().includes(ql));
  const sel = results.find((r) => r.id === s.selId) || results[0] || null;
  const selTone = sel ? tone(sel.tone) : tone('');

  return (
    <div data-screen-label="06 Search and playback" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, minHeight: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em' }}>Search &amp; playback</h1>
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.65)', color: '#5B616B' }}>READ-ONLY AUDIT</span>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 520, display: 'flex', alignItems: 'center' }}>
          <span style={{ position: 'absolute', left: 16, color: '#6B7280', display: 'flex', pointerEvents: 'none' }} aria-hidden="true">
            <Search size={17} aria-hidden="true" />
          </span>
          <input
            data-tour="search"
            className="fc-accent"
            value={s.q}
            onChange={(e) => set({ q: e.target.value })}
            aria-label="Search records by order ID, RFID or challan"
            placeholder="order ID / RFID / challan…"
            style={{ width: '100%', background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.65)', borderRadius: 10, padding: '12px 20px 12px 44px', color: '#1B1D21', fontSize: 15, outline: 'none', boxShadow: '0 2px 10px rgba(15,30,60,0.04)' }}
          />
        </div>
        <span style={{ fontFamily: MONO, fontSize: 11, color: '#6B7280' }}>Filter: date / station / outcome</span>
      </div>

      <div className="search-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {results.map((r) => {
            const t = tone(r.tone);
            const active = sel && r.id === sel.id;
            return (
              <button
                key={r.id}
                className="hv-border-accent"
                onClick={() => set({ selId: r.id })}
                style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', cursor: 'pointer', background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(22px) saturate(1.4)', borderRadius: 18, padding: '13px 15px', border: '1px solid ' + (active ? 'rgba(142,14,34,0.6)' : 'rgba(0,0,0,0.05)'), boxShadow: '0 2px 8px rgba(15,30,60,0.04)' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
                  <span style={{ fontFamily: MONO, fontSize: 14, color: '#1B1D21' }}>{r.id}</span>
                  <span style={{ fontSize: 13, color: '#5B616B' }}>{r.kinds}</span>
                </div>
                <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.06em', padding: '4px 11px', borderRadius: 999, border: '1px solid ' + t.border, color: t.color }}>{r.outcome}</span>
              </button>
            );
          })}
          {results.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: '#6B7280', fontSize: 14, border: '1px dashed rgba(0,0,0,0.15)', borderRadius: 16 }}>
              No records match — try ORD-10293, RFID-1021 or DC-2026-00417
            </div>
          )}
        </div>

        {sel && (
          <div style={{ ...glass, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ height: 280, position: 'relative', ...feedBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span role="button" aria-label="Play record" style={{ width: 58, height: 58, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', background: 'rgba(142,14,34,0.9)', cursor: 'pointer' }}><Play size={22} aria-hidden="true" /></span>
              <span style={{ position: 'absolute', top: 12, left: 14, fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>selected record · streamed from S3 via signed URL</span>
            </div>
            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: MONO, fontSize: 18 }}>{sel.id}</span>
                <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.06em', padding: '4px 11px', borderRadius: 999, border: '1px solid ' + selTone.border, color: selTone.color }}>{sel.outcome}</span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="hv-border-accent" onClick={() => openOrder(sel.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.75)', color: '#8E0E22', borderRadius: 999, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    Custom order details <ChevronRight size={15} aria-hidden="true" />
                  </button>
                  {sel.pair && (
                    <button className="hv-accent14" onClick={() => openPlayer(sel.id, -1, 'search')} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(142,14,34,0.08)', border: 'none', color: '#8E0E22', borderRadius: 999, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      Open side-by-side <ChevronRight size={15} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>Operator</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{sel.operator}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>Station</span>
                  <span style={{ fontFamily: MONO, fontSize: 13 }}>{sel.station}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>Timestamp</span>
                  <span style={{ fontFamily: MONO, fontSize: 13 }}>{sel.ts}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, background: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.55)', borderRadius: 12, padding: '11px 14px' }}>
                <span style={{ fontSize: 12, color: '#6B7280' }}>File hash — tamper evidence (re-verified on arrival)</span>
                <span style={{ fontFamily: MONO, fontSize: 13, color: '#0E8A50' }}>sha-256 · {sel.hash} ✓ verified</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
