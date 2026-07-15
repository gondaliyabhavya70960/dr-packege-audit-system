import { useState } from 'react';
import { ArrowRight, ChevronRight, AlertTriangle, Search } from 'lucide-react';
import { MONO, glass, ACCENT, RED, GREEN, PLAIN } from '../data.js';
import GlassSelect from '../components/GlassSelect.jsx';

export default function Dashboard({ ctx }) {
  const { s, set, openPlayer } = ctx;
  const screen = s.screen;

  // Station health gets its own card-grid layout (search / filter / sort + a
  // Store | Warehouse split), so branch out before the generic dashboard render.
  if (screen === 'dash-stations') return <StationHealth ctx={ctx} />;

  const drill = (id) => set({ screen: 'search', q: id, selId: id });

  let dash = null;
  if (screen === 'dash-coverage')
    dash = {
      label: '08 Dashboard coverage',
      title: 'Dashboard · Packaging coverage',
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
        { title: 'RETURNS-1 · op. Sana', sub: 'yesterday · upload retry pending', right: '2 missing', rightColor: 'var(--mute-2)', action: '→', go: () => drill('ORD-10311') },
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
        rightColor: f.amt === '—' ? 'var(--mute)' : ACCENT,
        action: 'Review',
        go: () => openPlayer(f.id, i, 'dash-flagged'),
      })),
      foot: 'decision recorded with operator + timestamp + video reference · ageing flags escalate to the supervisor',
    };
  }

  if (!dash) return null;

  return (
    <div data-screen-label={dash.label} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, minHeight: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em' }}>{dash.title}</h1>
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', padding: '4px 10px', borderRadius: 999, background: 'rgba(var(--surf-rgb),0.5)', backdropFilter: 'blur(14px)', border: '1px solid rgba(var(--surf-rgb),0.65)', color: 'var(--mute-2)' }}>{dash.chip}</span>
      </div>

      {dash.kpis && (
        <div data-tour="dashkpis" className="kpi-grid">
          {dash.kpis.map((k) => (
            <div key={k.label} style={{ ...glass, borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 4, boxShadow: '0 2px 10px rgba(15,30,60,0.04)' }}>
              <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', color: k.color }}>{k.num}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--mute-2)' }}>{k.label}</span>
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
        <span style={{ fontSize: 15, fontWeight: 700, color: 'rgba(var(--ink-rgb),0.75)' }}>{dash.listTitle}</span>
        {dash.rows.map((r, i) => (
          <button key={i} className="hv-chip" onClick={r.go} style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', cursor: 'pointer', background: 'rgba(var(--surf-rgb),0.45)', border: '1px solid rgba(var(--surf-rgb),0.55)', borderRadius: 14, padding: '12px 15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-2)' }}>{r.title}</span>
              <span style={{ fontFamily: MONO, fontSize: 11, color: 'var(--mute)' }}>{r.sub}</span>
            </div>
            <span style={{ fontFamily: MONO, fontSize: 12, color: r.rightColor }}>{r.right}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flex: 'none', fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
              {r.action === '→' ? (
                <ArrowRight size={16} aria-hidden="true" />
              ) : (
                <>
                  {r.action}
                  <ChevronRight size={15} aria-hidden="true" />
                </>
              )}
            </span>
          </button>
        ))}
      </div>

      <div style={{ fontFamily: MONO, fontSize: 11, color: 'var(--mute)' }}>{dash.foot}</div>
    </div>
  );
}

// ---- Station health -------------------------------------------------------
// Per-station telemetry, grouped into a Store (60%) and Warehouse (40%) column
// with a divider between, plus search / filter / sort over both lists.
const STATIONS = [
  { name: 'NH53, Gujarat, India', side: 'store', records: 36, last: '2026-06-19T05:05:02.755306Z', pending: 5, camera: 'unknown' },
  { name: 'store-1', side: 'store', records: 6, last: '2026-06-18T06:41:06.537198Z', pending: 2, camera: 'unknown' },
  { name: 'store-mg-road', side: 'store', records: 4, last: '2026-06-17T10:06:09.884057Z', pending: 4, camera: 'unknown' },
  { name: 'pack-1', side: 'warehouse', records: 269, last: '2026-06-29T09:02:48.886273Z', pending: 26, camera: 'unknown' },
  { name: 'Test Bench', side: 'warehouse', records: 40, last: '2026-06-19T09:48:02.091096Z', pending: 6, camera: 'unknown' },
  { name: 'returns-1', side: 'warehouse', records: 9, last: '2026-06-18T05:04:07.017631Z', pending: 5, camera: 'unknown' },
  { name: 'claude-test', side: 'warehouse', records: 2, last: '2026-06-18T09:15:25.970247Z', pending: 2, camera: 'unknown' },
  { name: 'bench-1', side: 'warehouse', records: 1, last: '2026-06-18T04:51:59.305920Z', pending: 0, camera: 'unknown' },
  { name: 'pack-2', side: 'warehouse', records: 1, last: '2026-06-16T11:26:40.872374Z', pending: 1, camera: 'unknown' },
];

const STATION_FILTERS = [
  { value: 'all', label: 'All stations' },
  { value: 'pending', label: 'With pending video' },
  { value: 'clear', label: 'No pending video' },
];
const STATION_SORTS = [
  { value: 'records', label: 'Most records' },
  { value: 'pending', label: 'Most pending' },
  { value: 'recent', label: 'Recent activity' },
  { value: 'name', label: 'Name A–Z' },
];

function StationCard({ st, onClick }) {
  return (
    <button
      type="button"
      className="hv-chip"
      onClick={onClick}
      style={{ ...glass, textAlign: 'left', cursor: 'pointer', padding: 20, borderRadius: 18, display: 'flex', flexDirection: 'column', gap: 6, border: '1px solid rgba(var(--surf-rgb),0.55)' }}
    >
      <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>{st.name}</span>
      <span style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ink-2)', lineHeight: 1.1 }}>
        {st.records} <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--mute)' }}>records</span>
      </span>
      <span style={{ fontFamily: MONO, fontSize: 12, color: 'var(--mute)' }}>last activity {st.last}</span>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: st.pending > 0 ? RED : 'var(--mute)' }}>{st.pending} pending video</span>
      <span style={{ fontSize: 12.5, color: 'var(--mute)' }}>camera {st.camera}</span>
    </button>
  );
}

function StationColumn({ title, list, onOpen, minCard }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--ink-2)' }}>{title}</h2>
        <span style={{ fontFamily: MONO, fontSize: 11, padding: '2px 9px', borderRadius: 999, background: 'rgba(var(--accent-rgb),0.1)', color: 'var(--accent)' }}>{list.length}</span>
      </div>
      {list.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--mute)', padding: '18px 4px' }}>No stations match.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${minCard}px, 1fr))`, gap: 14, alignContent: 'start' }}>
          {list.map((st) => (
            <StationCard key={st.name} st={st} onClick={() => onOpen(st.name)} />
          ))}
        </div>
      )}
    </section>
  );
}

function StationHealth({ ctx }) {
  const { set } = ctx;
  const [q, setQ] = useState('');
  const [filt, setFilt] = useState('all');
  const [sort, setSort] = useState('records');

  const apply = (list) => {
    const needle = q.trim().toLowerCase();
    let r = list.filter((st) => st.name.toLowerCase().includes(needle));
    if (filt === 'pending') r = r.filter((st) => st.pending > 0);
    if (filt === 'clear') r = r.filter((st) => st.pending === 0);
    return [...r].sort((a, b) => {
      if (sort === 'records') return b.records - a.records;
      if (sort === 'pending') return b.pending - a.pending;
      if (sort === 'recent') return b.last.localeCompare(a.last); // ISO 8601 sorts lexically
      if (sort === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  };

  const store = apply(STATIONS.filter((st) => st.side === 'store'));
  const warehouse = apply(STATIONS.filter((st) => st.side === 'warehouse'));
  const openStation = (name) => set({ screen: 'search', q: name, selId: name });
  const dirty = q || filt !== 'all' || sort !== 'records';

  return (
    <div data-screen-label="12 Dashboard station health" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, minHeight: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em' }}>Station health</h1>
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', padding: '4px 10px', borderRadius: 999, background: 'rgba(var(--surf-rgb),0.5)', backdropFilter: 'blur(14px)', border: '1px solid rgba(var(--surf-rgb),0.65)', color: 'var(--mute-2)' }}>TELEMETRY</span>
      </div>

      {/* toolbar: search + filter + sort on a solid card, matching the orders list */}
      <div style={{ ...cardLight, padding: 16, display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', position: 'relative', zIndex: 30 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 220 }}>
          <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--ink)' }}>SEARCH</span>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 14, color: 'var(--mute)', display: 'flex' }}>
              <Search size={16} aria-hidden="true" />
            </span>
            <input
              className="fc-accent"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="station name…"
              style={{ width: '100%', background: 'var(--surface-soft)', border: '1px solid var(--surface-soft-border)', borderRadius: 12, padding: '12px 14px 12px 40px', color: 'var(--ink-2)', fontSize: 14.5, outline: 'none' }}
            />
          </div>
        </label>
        <GlassSelect label="FILTER" value={filt} onChange={setFilt} options={STATION_FILTERS} minWidth={170} />
        <GlassSelect label="SORT BY" value={sort} onChange={setSort} options={STATION_SORTS} minWidth={160} />
        {dirty && (
          <button
            className="hv-ink04"
            onClick={() => { setQ(''); setFilt('all'); setSort('records'); }}
            style={{ background: 'var(--surface)', border: '1px solid var(--surface-border)', color: 'var(--ink-2)', borderRadius: 12, padding: '12px 20px', fontSize: 14.5, fontWeight: 700, cursor: 'pointer' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Store (60%) | divider | Warehouse (40%) */}
      <div className="station-split">
        <div className="station-col-store">
          <StationColumn title="Store" list={store} onOpen={openStation} minCard={220} />
        </div>
        <div className="station-divider" aria-hidden="true" />
        <div className="station-col-wh">
          <StationColumn title="Warehouse" list={warehouse} onOpen={openStation} minCard={200} />
        </div>
      </div>
    </div>
  );
}
