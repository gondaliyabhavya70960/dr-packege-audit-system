import { Rewind, FastForward, Play, Pause, ChevronLeft, Check } from './line-icons.jsx';
import { MONO, glass, fmt } from '../data.js';
import PlaybackFrame from './PlaybackFrame.jsx';

const STILL_LABELS = ['stone', 'hallmark', 'certificate'];

// Full-page video review (was a centered modal). Rendered as an opaque page over
// the app with its own back button; closing returns to the screen underneath.
export default function SideBySidePlayer({ ctx }) {
  const { s, set, showToast } = ctx;

  const fromFlag = s.playerFlagIdx >= 0;
  const closePlayer = () => set({ playerOpen: false, playing: false });
  const playerRec = s.records.find((r) => r.id === s.playerId);

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

  const clipPane = (label, meta, streamLabel) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: MONO, fontSize: 11, color: 'var(--mute-2)' }}>
        <span style={{ color: 'var(--accent)' }}>{label}</span>
        <span>{meta}</span>
      </div>
      {/* same evidence frame as Search & playback (dark feed + accent play + S3 label) */}
      <PlaybackFrame label={streamLabel} height={250} radius={18} progress={s.t} onPlay={() => set({ playing: true })} />
    </div>
  );

  return (
    <div data-screen-label="07 Side-by-side player" style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'var(--app-bg)', backgroundAttachment: 'fixed', overflowY: 'auto' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '20px 24px 32px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: '100%' }}>
        {/* page header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button className="hv-white75" onClick={closePlayer} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(var(--surf-rgb),0.5)', border: '1px solid rgba(var(--surf-rgb),0.6)', color: 'var(--ink-2)', borderRadius: 999, padding: '8px 16px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>
            <ChevronLeft size={15} aria-hidden="true" /> Back
          </button>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>
            Side-by-side · <span style={{ fontFamily: MONO, fontWeight: 500 }}>{s.playerId}</span>
          </h1>
          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', padding: '4px 10px', borderRadius: 999, background: 'rgba(var(--accent-rgb),0.08)', color: 'var(--accent)' }}>SAME ITEM? — ANSWERED VISUALLY</span>
        </div>

        {/* media + transport + stills */}
        <div style={{ ...glass, display: 'flex', flexDirection: 'column' }}>
          <div className="player-grid">
            {clipPane('PACK CLIP', '· packed 12 Jun · PACK-BENCH-1', 'pack clip · streamed from S3 via signed URL')}
            {clipPane('RETURN CLIP', '· returned 24 Jun · RETURNS-1', 'return clip · streamed from S3 via signed URL')}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px' }}>
            <button className="hv-white75" onClick={() => set({ t: Math.max(0, s.t - 10) })} aria-label="Back 10%" style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(var(--surf-rgb),0.45)', border: 'none', color: 'var(--ink-2)', borderRadius: 999, padding: '8px 14px', cursor: 'pointer' }}>
              <Rewind size={16} aria-hidden="true" />
            </button>
            <button className="hv-brighten" onClick={() => set({ playing: !s.playing })} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--accent)', color: '#FFFFFF', border: 'none', borderRadius: 999, padding: '9px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer', minWidth: 130 }}>
              {s.playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
              {s.playing ? 'Pause' : 'Sync play'}
            </button>
            <button className="hv-white75" onClick={() => set({ t: Math.min(100, s.t + 10) })} aria-label="Forward 10%" style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(var(--surf-rgb),0.45)', border: 'none', color: 'var(--ink-2)', borderRadius: 999, padding: '8px 14px', cursor: 'pointer' }}>
              <FastForward size={16} aria-hidden="true" />
            </button>
            <input type="range" min="0" max="100" value={s.t} onChange={(e) => set({ t: Number(e.target.value) })} style={{ flex: 1, accentColor: 'var(--accent)', cursor: 'pointer' }} />
            <span style={{ fontFamily: MONO, fontSize: 13, color: 'var(--mute-2)' }}>{fmt(Math.round(s.t * 0.84))} / 01:24</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 20px 16px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: 'var(--mute)' }}>STILLS</span>
            {STILL_LABELS.map((l, i) => {
              const active = s.still === i;
              return (
                <button
                  key={l}
                  onClick={() => set({ still: active ? -1 : i })}
                  style={{ cursor: 'pointer', borderRadius: 999, padding: '9px 16px', fontSize: 13, fontWeight: 600, background: 'rgba(var(--surf-rgb),0.45)', border: '1px solid ' + (active ? 'rgba(var(--accent-rgb),0.7)' : 'rgba(0,0,0,0.08)'), color: active ? 'var(--accent)' : 'var(--mute-2)' }}
                >
                  {active ? l + ' · enlarged' : l}
                </button>
              );
            })}
            <span style={{ fontFamily: MONO, fontSize: 11, color: 'var(--mute)' }}>click a still to enlarge</span>
          </div>
        </div>

        {/* record evidence + verdict */}
        <div style={{ ...glass, display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, background: 'rgba(var(--surf-rgb),0.45)', border: '1px solid rgba(var(--surf-rgb),0.55)', borderRadius: 12, padding: '11px 14px' }}>
            <span style={{ fontSize: 12, color: 'var(--mute)' }}>File hash — tamper evidence (re-verified on arrival)</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: MONO, fontSize: 13, color: '#0E8A50' }}>sha-256 · {playerRec ? playerRec.hash : '9f2c41aa…6b7a1'} <Check size={13} strokeWidth={3} aria-hidden="true" style={{ flex: 'none' }} /> verified</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, color: 'var(--mute-2)' }}>{fromFlag ? 'Supervisor decision — releases or keeps the refund hold.' : 'Verdict feeds the accept / flag decision.'}</span>
            <div style={{ flex: 1 }} />
            <button className="hv-red05" onClick={verdictNeg} style={{ background: 'var(--surface)', border: '1px solid rgba(229,62,62,0.45)', color: '#C62B22', borderRadius: 10, padding: '11px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              {fromFlag ? 'Uphold flag — keep hold' : 'Mismatch suspected'}
            </button>
            <button className="hv-brighten" onClick={verdictPos} style={{ background: 'var(--accent)', color: '#FFFFFF', border: 'none', borderRadius: 10, padding: '11px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(var(--accent-rgb),0.25)' }}>
              {fromFlag ? 'Approve accept — release refund' : 'Same item — confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
