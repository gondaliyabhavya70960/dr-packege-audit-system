import { Check, X, Plus, Package, MonitorPlay, Compass, ArrowRight } from './line-icons.jsx';
import { MONO, cardLight, surfaceSubtle } from '../data.js';

// Dismissible getting-started checklist on the Overview dashboard. Each step
// navigates somewhere useful and ticks itself off; state persists so it survives
// reloads and stays hidden once dismissed.
export default function GettingStarted({ ctx }) {
  const { s, set, openList, newOrder, openTour } = ctx;
  if (s.gsDismissed) return null;

  const steps = [
    { key: 'order', label: 'Create your first order', icon: Plus, go: () => newOrder('ecommerce') },
    { key: 'list', label: 'Explore packaging orders', icon: Package, go: () => openList('packaging') },
    { key: 'station', label: 'Open a live station', icon: MonitorPlay, go: () => set({ screen: 'kiosk' }) },
    { key: 'tour', label: 'Take the guided tour', icon: Compass, go: () => openTour() },
  ];

  const done = s.gsDone || [];
  const total = steps.length;
  const count = steps.filter((st) => done.includes(st.key)).length;

  const doStep = (st) => {
    if (!done.includes(st.key)) {
      const next = [...done, st.key];
      try {
        localStorage.setItem('pa_gs_done', JSON.stringify(next));
      } catch (e) {
        /* storage unavailable */
      }
      set({ gsDone: next });
    }
    st.go();
  };

  const dismiss = () => {
    try {
      localStorage.setItem('pa_gs_dismissed', '1');
    } catch (e) {
      /* storage unavailable */
    }
    set({ gsDismissed: true });
  };

  const allDone = count === total;

  return (
    <div style={{ ...cardLight, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 16, fontWeight: 700 }}>{allDone ? "You're all set" : 'Getting started'}</span>
        <span style={{ fontFamily: MONO, fontSize: 11, padding: '3px 9px', borderRadius: 999, background: 'rgba(var(--accent-rgb),0.1)', color: 'var(--accent)' }}>{count}/{total}</span>
        <div style={{ flex: 1, minWidth: 80, maxWidth: 240, height: 6, borderRadius: 999, background: 'rgba(var(--ink-rgb),0.08)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: (count / total) * 100 + '%', background: 'var(--accent)', borderRadius: 999, transition: 'width 0.25s ease' }} />
        </div>
        <button className="hv-white7" onClick={dismiss} aria-label="Dismiss getting started" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'transparent', color: 'var(--mute)', cursor: 'pointer' }}>
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        {steps.map((st) => {
          const isDone = done.includes(st.key);
          const Icon = st.icon;
          return (
            <button
              key={st.key}
              className="hv-chip"
              onClick={() => doStep(st)}
              style={{ display: 'flex', alignItems: 'center', gap: 11, textAlign: 'left', cursor: 'pointer', ...surfaceSubtle, border: '1px solid ' + (isDone ? 'rgba(var(--accent-rgb),0.4)' : 'var(--surface-soft-border)'), borderRadius: 12, padding: '11px 13px' }}
            >
              <span style={{ width: 26, height: 26, flex: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDone ? 'var(--accent)' : 'rgba(var(--accent-rgb),0.1)', color: isDone ? '#FFFFFF' : 'var(--accent)' }}>
                {isDone ? <Check size={15} strokeWidth={3} aria-hidden="true" /> : <Icon size={15} aria-hidden="true" />}
              </span>
              <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600, color: 'var(--ink-2)', textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.65 : 1 }}>{st.label}</span>
              {!isDone && <ArrowRight size={15} aria-hidden="true" style={{ flex: 'none', color: 'var(--mute)' }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
