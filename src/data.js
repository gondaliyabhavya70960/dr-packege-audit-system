// Seed data, palette tones and shared helpers ported from the design prototype.

export const ACCENT = '#8E0E22';
export const RED = '#C62B22';
export const GREEN = '#0E8A50';
export const PLAIN = '#1B1D21';

// ---- orders list ----

// reference "now" for the date filters (matches the demo data window)
export const NOW_TS = Date.parse('2026-06-15T10:00:00');

// status groups used by the Orders filter; label + tone drive the badge
export const ORDER_STATUSES = [
  { key: 'packed', label: 'Packed', tone: 'plain' },
  { key: 'transit', label: 'In transit', tone: 'amber' },
  { key: 'received', label: 'Received', tone: 'green' },
  { key: 'delivery', label: 'Out for delivery', tone: 'amber' },
  { key: 'delivered', label: 'Delivered', tone: 'green' },
  { key: 'returned', label: 'Returned', tone: 'red' },
  { key: 'flagged', label: 'Flagged', tone: 'red' },
];

export const ORDER_CHANNELS = ['Online', 'Store', 'B2B'];

// Split the shared order pool into the two working lists: "transferring goods"
// (inter-branch challans / consignments — DC & RFID ids, B2B channel) vs
// "packaging" (everything else — customer orders to pack & dispatch).
export function isTransferOrder(o) {
  return o.channel === 'B2B' || /^(DC|RFID)/i.test(o.id);
}

const blankCustom = { priority: 'Standard', giftWrap: false, insured: '', slot: '', instructions: '', notes: '' };

export const seedOrders = [
  {
    id: 'ORD-10293', channel: 'Online', customer: 'Aarav Shah', phone: '+91 98200 11234',
    address: '14 Brigade Rd, Bengaluru 560001', placed: '12 Jun 2026 · 09:14', ts: Date.parse('2026-06-12T09:14:00'),
    statusKey: 'delivered', status: 'Delivered', tone: 'green', station: 'PACK-BENCH-1', value: '₹1.42L', valNum: 142000,
    items: [
      { sku: 'SKU 4471', name: 'Solitaire ring', qty: 1, condition: 'verified' },
      { sku: 'SKU 4472', name: 'Diamond pendant', qty: 1, condition: 'verified' },
      { sku: 'SKU 4480', name: 'Gold bangle', qty: 1, condition: 'verified' },
    ],
    timeline: [
      { label: 'Order placed', time: '12 Jun · 09:14', who: 'web checkout', clip: false },
      { label: 'Packed · Warehouse', time: '12 Jun · 11:02', who: 'Mira · PACK-BENCH-1', clip: true },
      { label: 'Dispatched → Gati', time: '12 Jun · 14:02', who: 'auto', clip: false },
      { label: 'Out for delivery', time: '13 Jun · 08:40', who: 'Gati', clip: false },
      { label: 'Delivered', time: '13 Jun · 16:21', who: 'OTP confirmed', clip: false },
    ],
    custom: { priority: 'White-glove', giftWrap: true, insured: '₹1.50L', slot: '13 Jun · 4–7 PM', instructions: 'Call before delivery. Hand to addressee only.', notes: 'Repeat VIP customer — 4th order this quarter.' },
  },
  {
    id: 'ORD-10311', channel: 'Online', customer: 'Isha Verma', phone: '+91 99300 55678',
    address: '7 Koregaon Park, Pune 411001', placed: '13 Jun 2026 · 10:05', ts: Date.parse('2026-06-13T10:05:00'),
    statusKey: 'returned', status: 'Returned · flagged', tone: 'red', station: 'RETURNS-1', value: '₹1.20L', valNum: 120000,
    items: [{ sku: 'SKU 4490', name: 'Emerald drop earrings', qty: 1, condition: 'disputed' }],
    timeline: [
      { label: 'Order placed', time: '06 Jun · 12:30', who: 'web checkout', clip: false },
      { label: 'Packed · Warehouse', time: '06 Jun · 15:10', who: 'Mira · PACK-BENCH-1', clip: true },
      { label: 'Delivered', time: '08 Jun · 13:00', who: 'OTP confirmed', clip: false },
      { label: 'Return requested', time: '11 Jun · 09:20', who: 'customer · "not genuine"', clip: false },
      { label: 'Return inspected', time: '13 Jun · 16:21', who: 'Sana · RETURNS-1', clip: true },
    ],
    custom: { priority: 'Express', giftWrap: false, insured: '₹1.20L', slot: '—', instructions: 'Customer claims item differs from photos.', notes: 'Refund held pending side-by-side verdict.' },
  },
  {
    id: 'DC-2026-00417', channel: 'B2B', customer: 'MG Road Store', phone: '+91 80 4112 9000',
    address: 'MG Road, Bengaluru 560001', placed: '10 Jun 2026 · 10:05', ts: Date.parse('2026-06-10T10:05:00'),
    statusKey: 'transit', status: 'In transit · short', tone: 'amber', station: 'STORE-RECV-1', value: '₹5.60L', valNum: 560000,
    items: [
      { sku: 'SKU 4471', name: 'Solitaire ring', qty: 1, condition: 'pending' },
      { sku: 'SKU 4472', name: 'Diamond pendant', qty: 1, condition: 'pending' },
      { sku: 'SKU 4480', name: 'Gold bangle', qty: 1, condition: 'pending' },
    ],
    timeline: [
      { label: 'Challan raised', time: '10 Jun · 10:05', who: 'warehouse', clip: false },
      { label: 'Dispatched → Gati', time: '10 Jun · 13:40', who: 'auto', clip: false },
      { label: 'In transit', time: '11 Jun · —', who: 'Gati · 2 days', clip: false },
    ],
    custom: { priority: 'Standard', giftWrap: false, insured: '₹5.60L', slot: '—', instructions: 'Inter-branch transfer for festive stock.', notes: 'Reconcile expected short by 1 — confirm on arrival.' },
  },
  {
    id: 'RFID-1021', channel: 'Store', customer: 'Surat Flagship', phone: '+91 261 245 1100',
    address: 'Ghod Dod Rd, Surat 395007', placed: '11 Jun 2026 · 11:40', ts: Date.parse('2026-06-11T11:40:00'),
    statusKey: 'received', status: 'Received', tone: 'green', station: 'STORE-RECV-1', value: '₹0.78L', valNum: 78000,
    items: [{ sku: 'SKU 4471', name: 'Solitaire ring', qty: 1, condition: 'verified' }],
    timeline: [
      { label: 'Dispatched → Gati', time: '10 Jun · 09:00', who: 'warehouse', clip: false },
      { label: 'Received · Store', time: '11 Jun · 11:40', who: 'Devang · STORE-RECV-1', clip: true },
      { label: 'Shelved', time: '11 Jun · 12:05', who: 'Devang', clip: false },
    ],
    custom: { ...blankCustom, insured: '₹0.80L', notes: 'All RFIDs ticked on arrival.' },
  },
  {
    id: 'ORD-10288', channel: 'Online', customer: 'Rohan Mehta', phone: '+91 97400 33221',
    address: '22 Banjara Hills, Hyderabad 500034', placed: '10 Jun 2026 · 08:30', ts: Date.parse('2026-06-10T08:30:00'),
    statusKey: 'flagged', status: 'Flagged · damaged', tone: 'red', station: 'RETURNS-1', value: '₹0.90L', valNum: 90000,
    items: [{ sku: 'SKU 4502', name: 'Tennis bracelet', qty: 1, condition: 'damaged' }],
    timeline: [
      { label: 'Order placed', time: '04 Jun · 18:10', who: 'web checkout', clip: false },
      { label: 'Packed · Warehouse', time: '05 Jun · 10:20', who: 'Rahul · PACK-BENCH-2', clip: true },
      { label: 'Return inspected', time: '10 Jun · 14:30', who: 'Sana · RETURNS-1', clip: true },
    ],
    custom: { priority: 'Standard', giftWrap: false, insured: '₹0.90L', slot: '—', instructions: 'Transit damage suspected.', notes: '2 channels affected this week.' },
  },
  {
    id: 'ORD-10301', channel: 'Online', customer: 'Neha Kapoor', phone: '+91 98115 77654',
    address: '5 Vasant Vihar, New Delhi 110057', placed: '12 Jun 2026 · 16:45', ts: Date.parse('2026-06-12T16:45:00'),
    statusKey: 'packed', status: 'Packed', tone: 'plain', station: 'PACK-BENCH-1', value: '₹2.10L', valNum: 210000,
    items: [
      { sku: 'SKU 4510', name: 'Polki necklace', qty: 1, condition: 'verified' },
      { sku: 'SKU 4511', name: 'Matching jhumkas', qty: 1, condition: 'verified' },
    ],
    timeline: [
      { label: 'Order placed', time: '12 Jun · 16:45', who: 'web checkout', clip: false },
      { label: 'Packed · Warehouse', time: '12 Jun · 18:30', who: 'Mira · PACK-BENCH-1', clip: true },
    ],
    custom: { priority: 'White-glove', giftWrap: true, insured: '₹2.20L', slot: 'awaiting dispatch', instructions: 'Bridal set — fragile, double box.', notes: '' },
  },
  {
    id: 'ORD-10305', channel: 'Online', customer: 'Vikram Nair', phone: '+91 96000 12000',
    address: '31 Marine Drive, Kochi 682031', placed: '13 Jun 2026 · 07:20', ts: Date.parse('2026-06-13T07:20:00'),
    statusKey: 'delivery', status: 'Out for delivery', tone: 'amber', station: 'PACK-BENCH-2', value: '₹0.65L', valNum: 65000,
    items: [{ sku: 'SKU 4521', name: 'Mangalsutra', qty: 1, condition: 'verified' }],
    timeline: [
      { label: 'Order placed', time: '11 Jun · 20:00', who: 'web checkout', clip: false },
      { label: 'Packed · Warehouse', time: '12 Jun · 09:15', who: 'Rahul · PACK-BENCH-2', clip: true },
      { label: 'Out for delivery', time: '13 Jun · 07:20', who: 'Gati', clip: false },
    ],
    custom: { ...blankCustom, insured: '₹0.70L', slot: '13 Jun · 12–3 PM' },
  },
  {
    id: 'ORD-10312', channel: 'Online', customer: 'Ananya Iyer', phone: '+91 99020 45000',
    address: '9 Adyar, Chennai 600020', placed: '14 Jun 2026 · 11:10', ts: Date.parse('2026-06-14T11:10:00'),
    statusKey: 'packed', status: 'Packed', tone: 'plain', station: 'PACK-BENCH-1', value: '₹3.40L', valNum: 340000,
    items: [
      { sku: 'SKU 4530', name: 'Diamond choker', qty: 1, condition: 'verified' },
      { sku: 'SKU 4531', name: 'Cocktail ring', qty: 2, condition: 'verified' },
    ],
    timeline: [
      { label: 'Order placed', time: '14 Jun · 11:10', who: 'web checkout', clip: false },
      { label: 'Packed · Warehouse', time: '14 Jun · 13:50', who: 'Mira · PACK-BENCH-1', clip: true },
    ],
    custom: { priority: 'Express', giftWrap: true, insured: '₹3.50L', slot: 'awaiting dispatch', instructions: 'Anniversary gift — include note card.', notes: '' },
  },
  {
    id: 'DC-2026-00411', channel: 'B2B', customer: 'Surat Flagship', phone: '+91 261 245 1100',
    address: 'Ghod Dod Rd, Surat 395007', placed: '09 Jun 2026 · 09:00', ts: Date.parse('2026-06-09T09:00:00'),
    statusKey: 'received', status: 'Received · short', tone: 'amber', station: 'STORE-RECV-1', value: '₹4.10L', valNum: 410000,
    items: [
      { sku: 'SKU 4471', name: 'Solitaire ring', qty: 2, condition: 'verified' },
      { sku: 'SKU 4480', name: 'Gold bangle', qty: 1, condition: 'missing' },
    ],
    timeline: [
      { label: 'Challan raised', time: '08 Jun · 17:30', who: 'warehouse', clip: false },
      { label: 'Received · Store', time: '09 Jun · 09:00', who: 'Devang · STORE-RECV-1', clip: true },
      { label: 'Reconcile open', time: '09 Jun · 09:30', who: 'short 1', clip: false },
    ],
    custom: { ...blankCustom, insured: '₹4.10L', notes: 'One bangle short — flagged with arrival video.' },
  },
  {
    id: 'ORD-10322', channel: 'Store', customer: 'Walk-in · Surat', phone: '—',
    address: 'Ghod Dod Rd, Surat 395007', placed: '14 Jun 2026 · 17:55', ts: Date.parse('2026-06-14T17:55:00'),
    statusKey: 'delivered', status: 'Delivered', tone: 'green', station: 'STORE-RECV-1', value: '₹0.48L', valNum: 48000,
    items: [{ sku: 'SKU 4540', name: 'Gold coin · 8g', qty: 1, condition: 'verified' }],
    timeline: [
      { label: 'In-store purchase', time: '14 Jun · 17:55', who: 'counter 2', clip: false },
      { label: 'Handed over', time: '14 Jun · 18:02', who: 'verified at desk', clip: true },
    ],
    custom: { ...blankCustom },
  },
];

export const PRIORITY_OPTIONS = ['Standard', 'Express', 'White-glove'];

export function emptyCustomOrder() {
  return { id: '', channel: 'Online', customer: '', value: '', station: 'AUDIT-BENCH-1', ...blankCustom };
}

// fallback order built for an id that has no seeded record (e.g. a session just closed)
export function synthOrder(id) {
  return {
    id, channel: '—', customer: '—', phone: '—', address: '—', placed: 'today',
    ts: NOW_TS, statusKey: 'packed', status: 'On record', tone: 'plain', station: 'AUDIT-BENCH-1',
    value: '—', valNum: 0, items: [], timeline: [{ label: 'Session filed', time: 'today', who: 'auto', clip: true }],
    custom: { ...blankCustom },
  };
}

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
  // orders list + custom order details
  orders: seedOrders,
  oq: '',
  oStatus: 'all',
  oChannel: 'all',
  oDate: 'all',
  oSort: 'new',
  oSel: [],
  orderId: '',
  orderEditing: false,
  orderDraft: null,
  // warehouse / store flow
  side: 'warehouse', // 'warehouse' | 'store' — chosen at login; drives single-order tools
  listKind: 'packaging', // 'packaging' | 'transfer' — which working list is open
  orderTab: 'detail', // 'detail' | 'pack' | 'recv' | 'ret' — active tool on the single order
  sessionReturn: 'kiosk', // where a pack/recv/ret session returns on close: 'kiosk' | 'order'
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

// shared liquid-glass card surface (iPadOS-style material — colours unchanged)
export const glass = {
  background: 'rgba(255,255,255,0.5)',
  backdropFilter: 'blur(40px) saturate(1.8)',
  WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
  border: '1px solid rgba(255,255,255,0.55)',
  borderRadius: 24,
  boxShadow: '0 10px 34px -10px rgba(30,22,40,0.20), 0 2px 8px rgba(30,22,40,0.05), inset 0 1px 0 rgba(255,255,255,0.85), inset 0 0 0 0.5px rgba(255,255,255,0.30)',
};

// floating chrome (top bars, tab bar) — brighter rim, deeper lift
export const glassFloat = {
  background: 'rgba(255,255,255,0.42)',
  backdropFilter: 'blur(50px) saturate(1.9)',
  WebkitBackdropFilter: 'blur(50px) saturate(1.9)',
  border: '1px solid rgba(255,255,255,0.6)',
  boxShadow: '0 16px 44px -8px rgba(40,28,50,0.24), 0 4px 12px rgba(40,28,50,0.08), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 1px rgba(255,255,255,0.25)',
};

// popovers / dropdown menus — more opaque for legibility over content
export const glassPopover = {
  background: 'rgba(255,255,255,0.72)',
  backdropFilter: 'blur(50px) saturate(2)',
  WebkitBackdropFilter: 'blur(50px) saturate(2)',
  border: '1px solid rgba(255,255,255,0.7)',
  boxShadow: '0 24px 60px -12px rgba(40,28,50,0.34), inset 0 1px 0 rgba(255,255,255,0.95)',
};

// modal sheets / overlays
export const glassSheet = {
  background: 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(50px) saturate(1.9)',
  WebkitBackdropFilter: 'blur(50px) saturate(1.9)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 40px 90px -20px rgba(20,14,28,0.45), inset 0 1px 0 rgba(255,255,255,0.9)',
};

// dark camera-feed placeholder surface
export const feedBg = {
  background: 'repeating-linear-gradient(135deg,#17171D 0px,#17171D 14px,#121217 14px,#121217 28px)',
};
