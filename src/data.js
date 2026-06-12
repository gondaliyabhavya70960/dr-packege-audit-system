// Seed data, palette tones and shared helpers ported from the design prototype.

export const ACCENT = '#8E0E22';
export const RED = '#C62B22';
export const GREEN = '#0E8A50';
export const PLAIN = '#1B1D21';

export const initialState = {
  screen: 'login',
  username: '',
  password: '',
  userLabel: '',
  role: 'operator',
  mode: 'pack',
  scanInput: '',
  backConfirm: false,
  lastSession: 'ORD-10287 · sealed · 14:02',
  recSec: 0,
  // pack
  packId: '',
  packItems: [],
  packUnknown: false,
  packCond: 'pending',
  packStills: 0,
  // receiving
  recvChallan: '',
  recvRows: [],
  // returns
  retId: '',
  retStills: 0,
  retReason: null,
  retNeedReason: false,
  // player overlay
  playerOpen: false,
  playerId: '',
  playerFlagIdx: -1,
  playing: false,
  t: 22,
  still: -1,
  playerBackTo: null,
  // search
  q: '',
  selId: 'ORD-10293',
  // data
  flags: [
    { id: 'ORD-10311', reason: 'not genuine', age: '6h', amt: '₹1.4L' },
    { id: 'DC-2026-00411', reason: 'short 1', age: '1d', amt: '—' },
    { id: 'ORD-10288', reason: 'damaged', age: '3h', amt: '₹0.9L' },
  ],
  records: [
    { id: 'ORD-10293', kinds: 'pack + return', outcome: 'PASS', tone: 'green', operator: 'Mira', station: 'PACK-BENCH-1', ts: '12 Jun 2026 · 14:02', hash: '9f2c41aa…6b7a1', pair: true },
    { id: 'RFID-1021', kinds: 'pack + receive', outcome: 'received', tone: 'green', operator: 'Devang', station: 'STORE-RECV-1', ts: '11 Jun 2026 · 11:40', hash: '77d0e3c2…804fe', pair: false },
    { id: 'ORD-10311', kinds: 'return', outcome: 'flagged', tone: 'red', operator: 'Sana', station: 'RETURNS-1', ts: '10 Jun 2026 · 16:21', hash: 'c4a19b77…4e2d9', pair: true },
    { id: 'DC-2026-00417', kinds: 'challan', outcome: 'short', tone: 'amber', operator: 'Devang', station: 'STORE-RECV-1', ts: '09 Jun 2026 · 10:05', hash: '5b8fd210…9c33', pair: false },
  ],
  users: [
    { name: 'Mira', role: 'operator' },
    { name: 'Sana', role: 'operator' },
    { name: 'Devang', role: 'operator' },
    { name: 'Arjun', role: 'admin' },
  ],
  newUser: '',
  tiering: true,
  // tour
  tourOpen: false,
  tourStep: 0,
  tourRect: null,
  tourReturn: 'login',
  // menus
  adminMenuOpen: false,
  profileMenuOpen: false,
  toast: '',
};

export const demoChips = [
  { label: 'ORD-10293', sub: 'online order → Pack & Record', kind: 'pack', id: 'ORD-10293' },
  { label: 'DC-2026-00417', sub: 'challan → Store receiving', kind: 'recv', id: 'DC-2026-00417' },
  { label: 'ORD-10311', sub: 'customer return → Inspection', kind: 'ret', id: 'ORD-10311' },
];

export const tourDefs = [
  { k: 'login', t: 'Sign in by role', b: 'One login for everyone. An admin username opens the management console; any other name boots straight to the station kiosk. In this demo, any password works.', s: 'login' },
  { k: 'topbar', t: 'Station status at a glance', b: 'The top bar shows which station and task you are on, plus live health — camera, upload queue, connectivity — and who is signed in.', s: 'kiosk' },
  { k: 'modes', t: 'Pick a task', b: 'One station covers every job. Choose Pack, Receive, or Returns — the screen that opens is tailored to that task.', s: 'kiosk' },
  { k: 'scanner', t: 'Scan to start', b: 'Scan an order ID, RFID, or challan — or tap a demo scanner chip to simulate it. The session opens and recording starts automatically.', s: 'kiosk' },
  { k: 'packlist', t: 'Expected vs scanned', b: 'Every expected item is listed. Scan each RFID to tick it off — wrong or missing items lock the session until they are resolved.', s: 'pack', up: 2 },
  { k: 'packactions', t: 'Flag or close', b: 'If something is off, flag it — the video attaches as evidence and a supervisor is notified. When item, quantity, and condition all pass, close the session to seal the box.', s: 'pack', up: 1 },
  { k: 'nav', t: 'The admin console', b: 'Admins get search & playback, the side-by-side player, dashboards, the flagged queue, and user management — all one click away.', s: 'dash-coverage' },
  { k: 'search', t: 'Find any video in seconds', b: 'Type an order ID, RFID, or challan to pull up its full history — operator, station, timestamp, and a tamper-evident file hash.', s: 'search' },
  { k: 'dashkpis', t: 'Dashboards that drill to video', b: 'Coverage, consignments, returns, and the flagged queue — every number clicks through to the underlying recording.', s: 'dash-flagged' },
];

export const bannerTones = {
  red: { border: 'rgba(229,62,62,0.4)', bg: 'rgba(229,62,62,0.06)', color: '#C62B22' },
  amber: { border: 'rgba(217,142,4,0.4)', bg: 'rgba(217,142,4,0.06)', color: '#9A6A00' },
  green: { border: 'rgba(23,163,95,0.4)', bg: 'rgba(23,163,95,0.07)', color: '#0E8A50' },
};

export function tone(t) {
  if (t === 'green') return { border: 'rgba(23,163,95,0.5)', color: '#0E8A50' };
  if (t === 'red') return { border: 'rgba(229,62,62,0.5)', color: '#C62B22' };
  if (t === 'amber') return { border: 'rgba(217,142,4,0.5)', color: '#9A6A00' };
  return { border: 'rgba(0,0,0,0.2)', color: 'rgba(27,29,33,0.6)' };
}

export function dotFor(st) {
  if (st === 'ok') return { dot: '✓', dotColor: '#0E8A50', dotBorder: 'rgba(23,163,95,0.5)', dotBg: 'rgba(23,163,95,0.08)' };
  if (st === 'bad') return { dot: '!', dotColor: '#C62B22', dotBorder: 'rgba(229,62,62,0.5)', dotBg: 'rgba(229,62,62,0.06)' };
  return { dot: '···', dotColor: 'rgba(27,29,33,0.45)', dotBorder: 'rgba(0,0,0,0.15)', dotBg: 'transparent' };
}

export function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

export const MONO = "'IBM Plex Mono',monospace";

// shared liquid-glass card surface
export const glass = {
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(26px) saturate(1.5)',
  WebkitBackdropFilter: 'blur(26px) saturate(1.5)',
  border: '1px solid rgba(255,255,255,0.65)',
  borderRadius: 16,
  boxShadow: '0 2px 12px rgba(15,30,60,0.05)',
};

// dark camera-feed placeholder surface
export const feedBg = {
  background: 'repeating-linear-gradient(135deg,#17171D 0px,#17171D 14px,#121217 14px,#121217 28px)',
};
