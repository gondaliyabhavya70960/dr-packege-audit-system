import { Package, Inbox, RotateCcw, FileSearch, ArrowRight } from 'lucide-react';
import { MONO, glass } from '../data.js';
import { PackageIcon } from './icons.jsx';

// First-run welcome (shown once after a user's first sign-in). A full page — not
// a modal — introducing the four core steps, with Get started / Take the tour.
const FEATURES = [
  { icon: Package, title: 'Pack & record', desc: 'Every order packed on camera, SKUs scanned and matched.' },
  { icon: Inbox, title: 'Receive', desc: 'Scan each RFID at the store desk against the challan.' },
  { icon: RotateCcw, title: 'Return', desc: 'Inspect returns on video and log a reasoned verdict.' },
  { icon: FileSearch, title: 'Audit', desc: 'Search any order and replay the evidence, side by side.' },
];

export default function Welcome({ ctx }) {
  const { set, openTour } = ctx;

  const finish = (tour) => {
    try {
      localStorage.setItem('pa_welcome_seen', '1');
    } catch (e) {
      /* storage unavailable */
    }
    set({ showWelcome: false });
    if (tour) openTour();
  };

  return (
    <div data-screen-label="00 Welcome" style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'var(--app-bg)', backgroundAttachment: 'fixed', overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: 720, maxWidth: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>
        <span style={{ width: 60, height: 60, borderRadius: 16, flex: 'none', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px -8px rgba(var(--accent-rgb),0.6)' }}>
          <PackageIcon size={30} color="#FFFFFF" />
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.18em', color: 'var(--accent)' }}>WELCOME TO MAYAVÉ</span>
          <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>Video-verified packaging, end to end</h1>
          <p style={{ margin: 0, fontSize: 16, color: 'var(--mute-2)', maxWidth: 520, lineHeight: 1.5 }}>
            One ID follows each order from packing to delivery and returns — with camera evidence you can pull up in seconds.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, width: '100%', marginTop: 4 }}>
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} style={{ ...glass, padding: 16, display: 'flex', alignItems: 'flex-start', gap: 12, textAlign: 'left' }}>
                <span style={{ width: 40, height: 40, flex: 'none', borderRadius: 11, background: 'rgba(var(--accent-rgb),0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>{f.title}</span>
                  <span style={{ fontSize: 13, color: 'var(--mute-2)', lineHeight: 1.4 }}>{f.desc}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="hv-brighten" onClick={() => finish(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent)', color: '#FFFFFF', border: 'none', borderRadius: 12, padding: '13px 26px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 22px -8px rgba(var(--accent-rgb),0.6)' }}>
            Get started <ArrowRight size={16} aria-hidden="true" />
          </button>
          <button className="hv-border-accent" onClick={() => finish(true)} style={{ background: 'var(--surface)', border: '1px solid rgba(var(--accent-rgb),0.4)', color: 'var(--accent)', borderRadius: 12, padding: '13px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            Take the tour
          </button>
        </div>
        <span style={{ fontSize: 12.5, color: 'var(--mute)' }}>You can reopen the tour anytime from the Tour button.</span>
      </div>
    </div>
  );
}
