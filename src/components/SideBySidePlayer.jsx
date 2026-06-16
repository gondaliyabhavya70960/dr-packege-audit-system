import { X, Rewind, FastForward, Play, Pause } from 'lucide-react';
import { MONO, glassSheet, feedBg, fmt } from '../data.js';

const STILL_LABELS = ['stone', 'hallmark', 'certificate'];

export default function SideBySidePlayer({ ctx }) {
  const { s, set, showToast } = ctx;

  const fromFlag = s.playerFlagIdx >= 0;
  const closePlayer = () => set({ playerOpen: false, playing: false });

  const verdictPos = () => {
    if (fromFlag) {
      const flags = s.flags.filter((_, i) => i !== s.playerFlagIdx);
      set({ flags, playerOpen: false, playing: false, screen: 'dash-flagged' });
      showToast('Accept approved — refund released. Decision recorded with video reference.');
    } else {
      set({ playerOpen: false, playing: false });
      showToast('Verdict recorded: same item — feeds the accept decision.');
    }
  };

  const verdictNeg = () => {
    if (fromFlag) {
      set({ playerOpen: false, playing: false, screen: 'dash-flagged' });
      showToast('Flag upheld — refund stays on hold.');
    } else {
      set({ playerOpen: false, playing: false });
      showToast('Mismatch suspected — flag with a reason to hold the refund.');
    }
  };

  const clipPane = (label, meta, text) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: MONO, fontSize: 11, color: 'rgba(27,29,33,0.55)' }}>
        <span style={{ color: '#8E0E22' }}>{label}</span>
        <span>{meta}</span>
      </div>
      <div style={{ height: 230, borderRadius: 18, position: 'relative', ...feedBg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <span style={{ fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{text}</span>
        <div style={{ position: 'absolute', left: 0, bottom: 0, height: 4, background: '#8E0E22', width: s.t + '%' }} />
      </div>
    </div>
  );

  return (
    <div data-screen-label="07 Side-by-side player" style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(28,20,32,0.32)', backdropFilter: 'blur(16px) saturate(1.4)', WebkitBackdropFilter: 'blur(16px) saturate(1.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 30 }}>
      <div style={{ ...glassSheet, borderRadius: 28, width: 1040, maxWidth: '96%', maxHeight: '94vh', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: 18, fontWeight: 700 }}>
            Side-by-side · <span style={{ fontFamily: MONO, fontWeight: 500 }}>{s.playerId}</span>
          </span>
          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', padding: '4px 10px', borderRadius: 999, background: 'rgba(142,14,34,0.08)', color: '#8E0E22' }}>SAME ITEM? — ANSWERED VISUALLY</span>
          <button className="hv-white75" onClick={closePlayer} aria-label="Close player" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.45)', border: 'none', color: 'rgba(27,29,33,0.7)', borderRadius: '50%', width: 34, height: 34, cursor: 'pointer' }}>
            <X size={17} aria-hidden="true" />
          </button>
        </div>

        <div className="player-grid">
          {clipPane('PACK CLIP', '· packed 12 Jun · PACK-BENCH-1', '[ pack video ]')}
          {clipPane('RETURN CLIP', '· returned 24 Jun · RETURNS-1', '[ return video ]')}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px' }}>
          <button className="hv-white75" onClick={() => set({ t: Math.max(0, s.t - 10) })} aria-label="Back 10%" style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.45)', border: 'none', color: '#1B1D21', borderRadius: 999, padding: '8px 14px', cursor: 'pointer' }}>
            <Rewind size={16} aria-hidden="true" />
          </button>
          <button className="hv-brighten" onClick={() => set({ playing: !s.playing })} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#8E0E22', color: '#FFFFFF', border: 'none', borderRadius: 999, padding: '9px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', minWidth: 130 }}>
            {s.playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
            {s.playing ? 'Pause' : 'Sync play'}
          </button>
          <button className="hv-white75" onClick={() => set({ t: Math.min(100, s.t + 10) })} aria-label="Forward 10%" style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.45)', border: 'none', color: '#1B1D21', borderRadius: 999, padding: '8px 14px', cursor: 'pointer' }}>
            <FastForward size={16} aria-hidden="true" />
          </button>
          <input type="range" min="0" max="100" value={s.t} onChange={(e) => set({ t: Number(e.target.value) })} style={{ flex: 1, accentColor: '#8E0E22', cursor: 'pointer' }} />
          <span style={{ fontFamily: MONO, fontSize: 13, color: 'rgba(27,29,33,0.6)' }}>{fmt(Math.round(s.t * 0.84))} / 01:24</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 20px 14px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(27,29,33,0.5)' }}>STILLS</span>
          {STILL_LABELS.map((l, i) => {
            const active = s.still === i;
            return (
              <button
                key={l}
                onClick={() => set({ still: active ? -1 : i })}
                style={{ cursor: 'pointer', borderRadius: 999, padding: '9px 16px', fontSize: 13, fontWeight: 600, background: 'rgba(255,255,255,0.45)', border: '1px solid ' + (active ? 'rgba(142,14,34,0.7)' : 'rgba(0,0,0,0.08)'), color: active ? '#8E0E22' : 'rgba(27,29,33,0.6)' }}
              >
                {active ? l + ' · enlarged' : l}
              </button>
            );
          })}
          <span style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(27,29,33,0.35)' }}>click a still to enlarge</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderTop: '1px solid rgba(0,0,0,0.05)', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, color: 'rgba(27,29,33,0.6)' }}>{fromFlag ? 'Supervisor decision — releases or keeps the refund hold.' : 'Verdict feeds the accept / flag decision.'}</span>
          <div style={{ flex: 1 }} />
          <button className="hv-red05" onClick={verdictNeg} style={{ background: '#FFFFFF', border: '1px solid rgba(229,62,62,0.45)', color: '#C62B22', borderRadius: 10, padding: '11px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            {fromFlag ? 'Uphold flag — keep hold' : 'Mismatch suspected'}
          </button>
          <button className="hv-brighten" onClick={verdictPos} style={{ background: '#8E0E22', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: '11px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(142,14,34,0.25)' }}>
            {fromFlag ? 'Approve accept — release refund' : 'Same item — confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
