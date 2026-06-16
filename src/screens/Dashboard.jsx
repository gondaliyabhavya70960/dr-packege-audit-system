import { ArrowRight, ChevronRight, AlertTriangle } from 'lucide-react';
import { MONO, glass, ACCENT, RED, GREEN, PLAIN } from '../data.js';

export default function Dashboard({ ctx }) {
  const { s, set, openPlayer } = ctx;
  const screen = s.screen;

  const drill = (id) => set({ screen: 'search', q: id, selId: id });

  let dash = null;
  if (screen === 'dash-coverage')
    dash = {
      label: '08 Dashboard coverage',
      title: 'Dashboard · Packing coverage',
      chip: 'DRILLS TO VIDEO',
      kpis: [
        { num: '418', label: 'packed today', color: PLAIN },
        { num: '405', label: 'with video', color: PLAIN },
        { num: '96.9%', label: 'coverage', color: ACCENT },
        { num: '13', label: 'missing video', color: RED },
      ],
      listTitle: 'Missing-video list — by day / station / operator',
      rows: [
        { title: 'PACK-BENCH-2 · op. Rahul', sub: 'today · camera offline 41 min', right: '7 missing', rightColor: RED, action: '→', go: () => drill('ORD-10293') },
        { title: 'PACK-BENCH-1 · op. Mira', sub: 'today · sessions closed early', right: '4 missing', rightColor: RED, action: '→', go: () => drill('ORD-10293') },
        { title: 'RETURNS-1 · op. Sana', sub: 'yesterday · upload retry pending', right: '2 missing', rightColor: '#5B616B', action: '→', go: () => drill('ORD-10311') },
      ],
      foot: 'coverage_rate = packed-with-video vs total · threshold alert fires on a coverage gap < 95%',
    };

  if (screen === 'dash-consignment')
    dash = {
      label: '09 Dashboard consignment',
      title: 'Dashboard · Consignment / challan',
      chip: 'DRILLS TO VIDEO',
      kpis: [
        { num: '36', label: 'dispatched', color: PLAIN },
        { num: '31', label: 'received', color: PLAIN },
        { num: '28', label: 'reconciled', color: GREEN },
        { num: '3', label: 'short', color: RED },
      ],
      listTitle: 'In-transit & short consignments · days-in-transit',
      rows: [
        { title: 'DC-2026-00417 · MG Road', sub: 'dispatched 10 Jun · 3 items', right: 'in transit · 2d', rightColor: ACCENT, action: '→', go: () => drill('DC-2026-00417') },
        { title: 'DC-2026-00411 · Surat', sub: 'received 09 Jun · reconcile open', right: 'short 1', rightColor: RED, action: '→', go: () => drill('DC-2026-00417') },
        { title: 'DC-2026-00409 · Mumbai', sub: 'received 08 Jun · all RFIDs ticked', right: 'reconciled', rightColor: GREEN, action: '→', go: () => drill('DC-2026-00417') },
      ],
      foot: 'in_transit & short consignments derived from reconcile + challan status · alert on a challan overdue or short',
    };

  if (screen === 'dash-returns')
    dash = {
      label: '10 Dashboard returns',
      title: 'Dashboard · Returns summary',
      chip: 'DRILLS TO VIDEO',
      kpis: [
        { num: '52', label: 'received', color: PLAIN },
        { num: '44', label: 'accepted', color: GREEN },
        { num: '8', label: 'flagged', color: RED },
        { num: '84.6%', label: 'accept rate', color: ACCENT },
      ],
      listTitle: 'Flag reasons · acceptance rate by channel',
      rows: [
        { title: 'Not genuine', sub: 'highest-risk reason · trend +1 this week', right: '3', rightColor: RED, action: '→', go: () => set({ screen: 'dash-flagged' }) },
        { title: 'Damaged', sub: 'transit damage · 2 channels', right: '2', rightColor: RED, action: '→', go: () => set({ screen: 'dash-flagged' }) },
        { title: 'Wrong item', sub: 'pick error suspected', right: '2', rightColor: RED, action: '→', go: () => set({ screen: 'dash-flagged' }) },
        { title: 'Empty box', sub: 'fraud pattern watch', right: '1', rightColor: RED, action: '→', go: () => set({ screen: 'dash-flagged' }) },
      ],
      foot: 'return_flag_rate derived from return outcomes · every number clicks through to its video',
    };

  if (screen === 'dash-flagged') {
    const over24 = s.flags.filter((f) => f.age.includes('d')).length;
    dash = {
      label: '11 Dashboard flagged queue',
      title: 'Flagged items queue',
      chip: 'REFUNDS HELD',
      kpis: [
        { num: String(s.flags.length), label: 'open flags', color: PLAIN },
        { num: String(over24), label: '> 24h', color: RED },
        { num: '₹6.2L', label: 'refunds on hold', color: ACCENT },
        { num: '2', label: 'escalated', color: RED },
      ],
      listTitle: 'Open flags awaiting decision — sorted by age',
      rows: s.flags.map((f, i) => ({
        title: f.id + ' · ' + f.reason,
        sub: 'age ' + f.age + ' · ' + (f.amt === '—' ? 'no refund hold' : f.amt + ' on hold'),
        right: f.amt,
        rightColor: f.amt === '—' ? '#6B7280' : ACCENT,
        action: 'Review ▸',
        go: () => openPlayer(f.id, i, 'dash-flagged'),
      })),
      foot: 'decision recorded with operator + timestamp + video reference · ageing flags escalate to the supervisor',
    };
  }

  if (screen === 'dash-stations')
    dash = {
      label: '12 Dashboard station health',
      title: 'Station health',
      chip: 'TELEMETRY',
      kpis: null,
      banner: '⚠ 2 stations need attention — threshold alerts sent',
      listTitle: 'Last upload · pending queue · disk / browser storage · camera',
      rows: [
        { title: 'PACK-BENCH-1', sub: 'up 2m ago · 0 queued · disk 38%', right: 'cam OK', rightColor: GREEN, action: '→', go: () => drill('ORD-10293') },
        { title: 'PACK-BENCH-2', sub: 'up 41m ago · 12 queued · disk 61%', right: 'offline', rightColor: RED, action: '→', go: () => drill('ORD-10293') },
        { title: 'STORE-RECV-1', sub: 'up 5m ago · 0 queued · disk 24%', right: 'cam OK', rightColor: GREEN, action: '→', go: () => drill('RFID-1021') },
        { title: 'RETURNS-1', sub: 'up 9m ago · 1 queued · disk 92%', right: 'disk high', rightColor: ACCENT, action: '→', go: () => drill('ORD-10311') },
      ],
      foot: 'chunks buffer in IndexedDB · background uploader pushes via signed URLs with checksum + retry',
    };

  if (!dash) return null;

  return (
    <div data-screen-label={dash.label} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, minHeight: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em' }}>{dash.title}</h1>
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.65)', color: '#5B616B' }}>{dash.chip}</span>
      </div>

      {dash.kpis && (
        <div data-tour="dashkpis" className="kpi-grid">
          {dash.kpis.map((k) => (
            <div key={k.label} style={{ ...glass, borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 4, boxShadow: '0 2px 10px rgba(15,30,60,0.04)' }}>
              <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', color: k.color }}>{k.num}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#5B616B' }}>{k.label}</span>
            </div>
          ))}
        </div>
      )}

      {dash.banner && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, border: '1px solid rgba(217,142,4,0.35)', background: 'rgba(217,142,4,0.07)', color: '#9A6A00', borderRadius: 16, padding: '13px 16px', fontSize: 14, fontWeight: 600 }}>
          <AlertTriangle size={17} aria-hidden="true" style={{ flex: 'none' }} />
          <span>{dash.banner.replace(/^⚠\s*/, '')}</span>
        </div>
      )}

      <div style={{ ...glass, padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'rgba(27,29,33,0.75)' }}>{dash.listTitle}</span>
        {dash.rows.map((r, i) => (
          <button key={i} className="hv-chip" onClick={r.go} style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', cursor: 'pointer', background: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.55)', borderRadius: 14, padding: '12px 15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#1B1D21' }}>{r.title}</span>
              <span style={{ fontFamily: MONO, fontSize: 11, color: '#6B7280' }}>{r.sub}</span>
            </div>
            <span style={{ fontFamily: MONO, fontSize: 12, color: r.rightColor }}>{r.right}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flex: 'none', fontSize: 13, fontWeight: 700, color: '#8E0E22' }}>
              {r.action === '→' ? (
                <ArrowRight size={16} aria-hidden="true" />
              ) : (
                <>
                  {r.action.replace(/\s*▸\s*$/, '')}
                  <ChevronRight size={15} aria-hidden="true" />
                </>
              )}
            </span>
          </button>
        ))}
      </div>

      <div style={{ fontFamily: MONO, fontSize: 11, color: '#6B7280' }}>{dash.foot}</div>
    </div>
  );
}
