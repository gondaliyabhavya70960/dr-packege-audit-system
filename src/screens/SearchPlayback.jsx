import { Search, ChevronRight, FileSearch, Check } from '../components/fa.jsx';
import { MONO, glass, tone } from '../data.js';
import EmptyState from '../components/EmptyState.jsx';
import PlaybackFrame from '../components/PlaybackFrame.jsx';

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
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', padding: '4px 10px', borderRadius: 999, background: 'rgba(var(--surf-rgb),0.5)', backdropFilter: 'blur(14px)', border: '1px solid rgba(var(--surf-rgb),0.65)', color: 'var(--mute-2)' }}>READ-ONLY AUDIT</span>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 520, display: 'flex', alignItems: 'center' }}>
          <span style={{ position: 'absolute', left: 16, color: 'var(--mute)', display: 'flex', pointerEvents: 'none' }} aria-hidden="true">
            <Search size={17} aria-hidden="true" />
          </span>
          <input
            data-tour="search"
            className="fc-accent"
            value={s.q}
            onChange={(e) => set({ q: e.target.value })}
            aria-label="Search records by order ID, RFID or challan"
            placeholder="order ID / RFID / challan…"
            style={{ width: '100%', background: 'rgba(var(--surf-rgb),0.5)', backdropFilter: 'blur(14px)', border: '1px solid rgba(var(--surf-rgb),0.65)', borderRadius: 10, padding: '12px 20px 12px 44px', color: 'var(--ink-2)', fontSize: 15, outline: 'none', boxShadow: '0 2px 10px rgba(15,30,60,0.04)' }}
          />
        </div>
        <span style={{ fontFamily: MONO, fontSize: 11, color: 'var(--mute)' }}>Filter: date / station / outcome</span>
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
                style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', cursor: 'pointer', background: 'rgba(var(--surf-rgb),0.65)', backdropFilter: 'blur(22px) saturate(1.4)', borderRadius: 18, padding: '13px 15px', border: '1px solid ' + (active ? 'rgba(var(--accent-rgb),0.6)' : 'rgba(0,0,0,0.05)'), boxShadow: '0 2px 8px rgba(15,30,60,0.04)' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
                  <span style={{ fontFamily: MONO, fontSize: 14, color: 'var(--ink-2)' }}>{r.id}</span>
                  <span style={{ fontSize: 13, color: 'var(--mute-2)' }}>{r.kinds}</span>
                </div>
                <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.06em', padding: '4px 11px', borderRadius: 999, border: '1px solid ' + t.border, color: t.color }}>{r.outcome}</span>
              </button>
            );
          })}
          {results.length === 0 && (
            <EmptyState icon={FileSearch} title="No records match" sub="Try an order ID, RFID or challan — e.g. ORD-10293, RFID-1021 or DC-2026-00417." />
          )}
        </div>

        {sel && (
          <div style={{ ...glass, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <PlaybackFrame />
            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: MONO, fontSize: 18 }}>{sel.id}</span>
                <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.06em', padding: '4px 11px', borderRadius: 999, border: '1px solid ' + selTone.border, color: selTone.color }}>{sel.outcome}</span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="hv-border-accent" onClick={() => openOrder(sel.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(var(--surf-rgb),0.55)', border: '1px solid rgba(var(--surf-rgb),0.75)', color: 'var(--accent)', borderRadius: 999, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    Custom order details <ChevronRight size={15} aria-hidden="true" />
                  </button>
                  {sel.pair && (
                    <button className="hv-accent14" onClick={() => openPlayer(sel.id, -1, 'search')} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(var(--accent-rgb),0.08)', border: 'none', color: 'var(--accent)', borderRadius: 999, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      Open side-by-side <ChevronRight size={15} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 12, color: 'var(--mute)' }}>Operator</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{sel.operator}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 12, color: 'var(--mute)' }}>Station</span>
                  <span style={{ fontFamily: MONO, fontSize: 13 }}>{sel.station}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 12, color: 'var(--mute)' }}>Timestamp</span>
                  <span style={{ fontFamily: MONO, fontSize: 13 }}>{sel.ts}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, background: 'rgba(var(--surf-rgb),0.45)', border: '1px solid rgba(var(--surf-rgb),0.55)', borderRadius: 12, padding: '11px 14px' }}>
                <span style={{ fontSize: 12, color: 'var(--mute)' }}>File hash — tamper evidence (re-verified on arrival)</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: MONO, fontSize: 13, color: '#0E8A50' }}>sha-256 · {sel.hash} <Check size={13} strokeWidth={3} aria-hidden="true" style={{ flex: 'none' }} /> verified</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
