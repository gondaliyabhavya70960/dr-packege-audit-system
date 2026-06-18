// Seed data, palette tones and shared helpers ported from the design prototype.

export const ACCENT = '#8E0E22';
export const RED = '#C62B22';
export const GREEN = '#0E8A50';
export const PLAIN = '#1B1D21';

// ---- orders list ----

// reference "now" for the date filters (matches the demo data window)
export const NOW_TS = Date.parse('2026-06-15T10:00:00');

// status groups used by the Orders filter; label + tone drive the badge.
// "Draft" is the earliest state — a bespoke / not-yet-packed order whose
// packing video is still pending.
export const ORDER_STATUSES = [
  { key: 'draft', label: 'Draft', tone: 'plain' },
  { key: 'packed', label: 'Packed', tone: 'plain' },
  { key: 'transit', label: 'In transit', tone: 'amber' },
  { key: 'receiving', label: 'Receiving', tone: 'amber' },
  { key: 'received', label: 'Received', tone: 'green' },
  { key: 'delivery', label: 'Out for delivery', tone: 'amber' },
  { key: 'delivered', label: 'Delivered', tone: 'green' },
  { key: 'returning', label: 'Return', tone: 'amber' },
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

// Fulfilling warehouse (origin). Override per order with `o.from`.
export const ORIGIN_WH = 'Surat WH';

// Best-effort city from a postal address like "14 Brigade Rd, Bengaluru 560001".
export function cityOf(address) {
  if (!address || address === '—') return '—';
  const parts = address.split(',').map((s) => s.trim()).filter(Boolean);
  const last = parts[parts.length - 1] || '';
  const city = last.replace(/\s*\d{4,6}\s*$/, '').trim();
  return city || parts[0] || '—';
}

// Sender -> receiver for an order row. Sender is the fulfilling warehouse;
// receiver is the destination store/branch for transfers, otherwise the
// customer's city.
export function orderRoute(o) {
  const transfer = isTransferOrder(o);
  return { from: o.from || ORIGIN_WH, to: transfer ? o.customer : cityOf(o.address), transfer };
}

const blankCustom = { priority: 'Standard', giftWrap: false, insured: '', slot: '', instructions: '', notes: '' };

// ---- order stages (pack -> receive -> return) ----
// Which stages a given order has already completed (read from its timeline /
// status). Used to lock completed stages to a read-only evidence view.
export function orderStages(o) {
  const labels = (o.timeline || []).map((e) => (e.label || '').toLowerCase());
  const has = (s) => labels.some((l) => l.includes(s));
  return {
    pack: has('packed') || ['transit', 'received', 'delivery', 'delivered', 'returned', 'flagged'].includes(o.statusKey),
    recv: has('received') || o.statusKey === 'received',
    ret: has('return inspected') || has('return ') || ['returned', 'flagged'].includes(o.statusKey),
  };
}

// The filed clip (+ a deterministic tamper-evident hash) for a completed stage.
export function stageClip(o, stage) {
  const want = stage === 'pack' ? 'packed' : stage === 'recv' ? 'received' : 'return';
  const e = (o.timeline || []).find((ev) => ev.clip && (ev.label || '').toLowerCase().includes(want));
  if (!e) return null;
  const seed = (o.id + stage).replace(/[^a-z0-9]/gi, '').toLowerCase().padEnd(8, '0');
  return { label: e.label, time: e.time, who: e.who, hash: seed.slice(0, 4) + '…' + seed.slice(-4) };
}

// ---- per-status tab modes on the single-order screen ----
// Each order-detail tab renders in one of four modes, driven purely by the
// order's status:
//   'view'   — read-only filed-clip view (a stage already on record)
//   'edit'   — the live, editable recording tool (the currently-active stage)
//   'status' — a read-only order-status / tracking view for a stage the order is
//              actively moving toward but hasn't reached (in transit / delivery)
//   'empty'  — a stage not reached yet (a placeholder zero-state)
// Detail is always 'view'. Lifecycle: draft → packed → transit → receiving →
// received → delivery → delivered → returning → returned / flagged.
// 'receiving' (Receive tab live/edit) and 'returning' (Return tab live/edit) are
// the active in-progress states, paired with the recorded 'received'/'returned'.
const TAB_MODES = {
  draft: { pack: 'edit', recv: 'empty', ret: 'empty' },
  packed: { pack: 'view', recv: 'empty', ret: 'empty' },
  transit: { pack: 'view', recv: 'status', ret: 'empty' },
  receiving: { pack: 'view', recv: 'edit', ret: 'empty' },
  received: { pack: 'view', recv: 'edit', ret: 'empty' },
  delivery: { pack: 'view', recv: 'status', ret: 'empty' },
  delivered: { pack: 'view', recv: 'view', ret: 'empty' },
  returning: { pack: 'view', recv: 'view', ret: 'edit' },
  returned: { pack: 'view', recv: 'view', ret: 'view' },
  flagged: { pack: 'view', recv: 'view', ret: 'view' },
};

export function tabMode(statusKey, tab) {
  if (tab === 'detail') return 'view';
  const row = TAB_MODES[statusKey] || TAB_MODES.packed;
  return row[tab] || 'empty';
}

// ---- deterministic demo-order generator (no Math.random -> SSR-safe) ----
const GEN_CITIES = [
  ['Mumbai', '400001'], ['Bengaluru', '560001'], ['New Delhi', '110001'], ['Hyderabad', '500034'],
  ['Chennai', '600020'], ['Pune', '411001'], ['Kolkata', '700019'], ['Ahmedabad', '380009'],
  ['Surat', '395007'], ['Jaipur', '302001'], ['Kochi', '682031'], ['Vadodara', '390007'],
  ['Indore', '452001'], ['Nagpur', '440001'], ['Lucknow', '226001'], ['Chandigarh', '160017'],
];
const GEN_AREAS = ['MG Road', 'Brigade Rd', 'Park Street', 'Banjara Hills', 'Koregaon Park', 'Jubilee Hills', 'Marine Drive', 'Civil Lines', 'C Scheme', 'Ghod Dod Rd', 'Linking Rd', 'Adyar', 'Salt Lake', 'Vasant Vihar'];
const GEN_NAMES = ['Aarav Shah', 'Isha Verma', 'Rohan Mehta', 'Neha Kapoor', 'Vikram Nair', 'Ananya Iyer', 'Kavya Reddy', 'Aditya Rao', 'Meera Joshi', 'Pooja Nair', 'Sanjay Gupta', 'Diya Patel', 'Arjun Menon', 'Riya Singh', 'Karan Malhotra', 'Sneha Pillai', 'Rahul Bose', 'Tara Krishnan', 'Dev Anand', 'Nisha Rao', 'Yash Agarwal', 'Anjali Desai', 'Manish Jain', 'Priya Chauhan', 'Varun Sethi', 'Ira Banerjee', 'Nikhil Kulkarni', 'Aisha Khan', 'Rohit Saxena', 'Lata Mani'];
const GEN_STORES = ['MG Road Store', 'Surat Flagship', 'Ahmedabad Flagship', 'Vadodara Branch', 'Jaipur Branch', 'Indore Store', 'Pune Galleria', 'Kochi Marine', 'Hyderabad Banjara', 'Chennai Express Ave', 'Delhi CP Store', 'Kolkata Park St'];
const GEN_ITEMS = [['SKU 4471', 'Solitaire ring'], ['SKU 4472', 'Diamond pendant'], ['SKU 4480', 'Gold bangle'], ['SKU 4490', 'Emerald drop earrings'], ['SKU 4502', 'Tennis bracelet'], ['SKU 4510', 'Polki necklace'], ['SKU 4521', 'Mangalsutra'], ['SKU 4530', 'Diamond choker'], ['SKU 4531', 'Cocktail ring'], ['SKU 4540', 'Gold coin · 8g'], ['SKU 4550', 'Kundan necklace set'], ['SKU 4560', 'Diamond stud earrings'], ['SKU 4571', 'Ruby cocktail ring'], ['SKU 4590', 'Pearl drop pendant'], ['SKU 4601', 'Temple jewellery set'], ['SKU 4612', 'Sapphire ring']];
const GEN_OPS = ['Mira', 'Rahul', 'Sana', 'Devang', 'Priya', 'Karan'];
const PACK_STATUS = ['packed', 'transit', 'delivery', 'delivered', 'delivered', 'returned', 'flagged', 'packed', 'delivered', 'transit'];
const XFER_STATUS = ['transit', 'received', 'received', 'transit', 'delivered'];

function statusMeta(k) {
  const m = {
    draft: ['Draft', 'plain'], packed: ['Packed', 'plain'], transit: ['In transit', 'amber'], receiving: ['Receiving', 'amber'], received: ['Received', 'green'],
    delivery: ['Out for delivery', 'amber'], delivered: ['Delivered', 'green'], returning: ['Return', 'amber'], returned: ['Returned', 'red'], flagged: ['Flagged', 'red'],
  };
  return m[k] || ['On record', 'plain'];
}
function condFor(k) {
  if (k === 'returned' || k === 'flagged') return 'disputed';
  if (k === 'delivered' || k === 'received') return 'verified';
  return 'pending';
}
function genTimeline(k, transfer, op, dm) {
  const T = [];
  if (transfer) {
    T.push({ label: 'Challan raised', time: dm + ' · 09:00', who: 'warehouse', clip: false });
    T.push({ label: 'Dispatched → Gati', time: dm + ' · 12:30', who: 'auto', clip: false });
    if (k === 'received') {
      T.push({ label: 'Received · Store', time: dm + ' · 15:30', who: op + ' · STORE-RECV-1', clip: true });
      T.push({ label: 'Shelved', time: dm + ' · 16:05', who: op, clip: false });
    } else T.push({ label: 'In transit', time: dm + ' · —', who: 'Gati · 2 days', clip: false });
    return T;
  }
  T.push({ label: 'Order placed', time: dm + ' · 09:14', who: 'web checkout', clip: false });
  T.push({ label: 'Packed · Warehouse', time: dm + ' · 11:02', who: op + ' · PACK-BENCH-1', clip: true });
  if (k === 'transit') T.push({ label: 'In transit', time: dm + ' · —', who: 'Gati', clip: false });
  if (k === 'delivery') T.push({ label: 'Out for delivery', time: dm + ' · 08:40', who: 'Gati', clip: false });
  if (k === 'delivered') T.push({ label: 'Delivered', time: dm + ' · 16:21', who: 'OTP confirmed', clip: false });
  if (k === 'returned' || k === 'flagged') {
    T.push({ label: 'Delivered', time: dm + ' · 13:00', who: 'OTP confirmed', clip: false });
    T.push({ label: 'Return requested', time: dm + ' · 09:20', who: 'customer', clip: false });
    T.push({ label: 'Return inspected', time: dm + ' · 16:21', who: op + ' · RETURNS-1', clip: true });
  }
  return T;
}
function generateOrders(n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const isB2B = i % 6 === 0;
    const isRfid = !isB2B && i % 11 === 0;
    const transfer = isB2B || isRfid;
    const k = transfer ? XFER_STATUS[i % XFER_STATUS.length] : PACK_STATUS[i % PACK_STATUS.length];
    const [city, pin] = GEN_CITIES[i % GEN_CITIES.length];
    const area = GEN_AREAS[(i * 3) % GEN_AREAS.length];
    const op = GEN_OPS[i % GEN_OPS.length];
    const customer = transfer ? GEN_STORES[i % GEN_STORES.length] : GEN_NAMES[i % GEN_NAMES.length];
    const channel = isB2B ? 'B2B' : i % 4 === 0 ? 'Store' : 'Online';
    const id = isB2B ? 'DC-2026-00' + (600 + i) : isRfid ? 'RFID-' + (1200 + i) : 'ORD-' + (10400 + i);
    const day = 2 + (i % 13);
    const hh = 8 + (i % 11);
    const mm = (i * 7) % 60;
    const pad = (x) => String(x).padStart(2, '0');
    const dm = pad(day) + ' Jun';
    const ts = Date.parse('2026-06-' + pad(day) + 'T' + pad(hh) + ':' + pad(mm) + ':00');
    const placed = pad(day) + ' Jun 2026 · ' + pad(hh) + ':' + pad(mm);
    const cond = condFor(k);
    const it1 = GEN_ITEMS[i % GEN_ITEMS.length];
    const items = [{ sku: it1[0], name: it1[1], qty: 1 + (i % 2), condition: cond }];
    if (i % 3 === 0) {
      const it2 = GEN_ITEMS[(i * 7 + 3) % GEN_ITEMS.length];
      items.push({ sku: it2[0], name: it2[1], qty: 1, condition: cond });
    }
    const valNum = 45000 + ((i * 37) % 60) * 5000;
    const [status, tone] = statusMeta(k);
    const order = {
      id, channel, customer, phone: '+91 9' + pad((i * 13) % 90) + '00 ' + pad((i * 7) % 90) + '' + pad((i * 3) % 90),
      address: ((i % 90) + 1) + ' ' + area + ', ' + city + ' ' + pin, placed, ts,
      statusKey: k, status, tone, station: transfer ? 'STORE-RECV-' + (1 + (i % 2)) : 'PACK-BENCH-' + (1 + (i % 2)),
      value: '₹' + (valNum / 100000).toFixed(2) + 'L', valNum,
      items, timeline: genTimeline(k, transfer, op, dm),
      custom: { ...blankCustom, insured: '₹' + (valNum / 100000).toFixed(2) + 'L', priority: i % 5 === 0 ? 'Express' : i % 9 === 0 ? 'White-glove' : 'Standard' },
      from: 'Surat WH',
    };
    if (i % 4 === 0) order.remarks = [{ who: op, time: placed.split(' · ')[0] + ' · 11:08', text: transfer ? 'RFIDs matched on dispatch.' : 'Condition verified at the bench.' }];
    out.push(order);
  }
  return out;
}

const curatedOrders = [
  {
    id: 'ORD-10350', channel: 'Online', customer: 'Tanvi Desai', phone: '+91 98250 41200',
    address: '18 CG Road, Ahmedabad 380009', placed: '15 Jun 2026 · 09:30', ts: Date.parse('2026-06-15T09:30:00'),
    statusKey: 'draft', status: 'Draft', tone: 'plain', station: 'PACK-BENCH-1', value: '₹1.05L', valNum: 105000,
    items: [
      { sku: 'SKU 4471', name: 'Solitaire ring', qty: 1, condition: 'pending' },
      { sku: 'SKU 4490', name: 'Emerald drop earrings', qty: 1, condition: 'pending' },
    ],
    timeline: [
      { label: 'Order placed', time: '15 Jun · 09:30', who: 'web checkout', clip: false },
      { label: 'Draft saved', time: '15 Jun · 09:32', who: 'Mira · PACK-BENCH-1', clip: false },
    ],
    custom: { priority: 'Standard', giftWrap: false, insured: '₹1.10L', slot: 'awaiting pack', instructions: 'Draft order — pack video not yet captured.', notes: 'Created as a draft; open the Packing tab to record and file.' },
    remarks: [{ who: 'Mira', time: '15 Jun · 09:33', text: 'Held as draft — awaiting the pack-bench video before dispatch.' }],
  },
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
    remarks: [
      { who: 'Mira', time: '12 Jun · 11:05', text: 'Packed with extra bubble wrap — fragile solitaire.' },
      { who: 'Arjun', time: '13 Jun · 16:30', text: 'Delivery OTP verified, customer happy.' },
    ],
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
    id: 'RFID-1048', channel: 'Store', customer: 'Ahmedabad Flagship', phone: '+91 79 4002 7700',
    address: 'CG Road, Ahmedabad 380009', placed: '15 Jun 2026 · 10:20', ts: Date.parse('2026-06-15T10:20:00'),
    statusKey: 'receiving', status: 'Receiving', tone: 'amber', station: 'STORE-RECV-2', value: '₹2.30L', valNum: 230000,
    items: [
      { sku: 'SKU 4471', name: 'Solitaire ring', qty: 1, condition: 'pending' },
      { sku: 'SKU 4472', name: 'Diamond pendant', qty: 1, condition: 'pending' },
      { sku: 'SKU 4480', name: 'Gold bangle', qty: 1, condition: 'pending' },
    ],
    timeline: [
      { label: 'Challan raised', time: '13 Jun · 09:10', who: 'warehouse', clip: false },
      { label: 'Packed · Warehouse', time: '13 Jun · 11:30', who: 'Mira · PACK-BENCH-1', clip: true },
      { label: 'Dispatched → Gati', time: '13 Jun · 13:20', who: 'auto', clip: false },
      { label: 'Arrived at store', time: '15 Jun · 10:20', who: 'Devang · STORE-RECV-2', clip: false },
    ],
    custom: { ...blankCustom, insured: '₹2.40L', slot: '—', instructions: 'Scan each RFID at the desk to receive.', notes: 'Receiving in progress — confirm to shelve.' },
    remarks: [{ who: 'Devang', time: '15 Jun · 10:22', text: 'Box opened at the desk — scanning RFIDs now.' }],
  },
  {
    id: 'ORD-10318', channel: 'Online', customer: 'Kavya Reddy', phone: '+91 90000 88776',
    address: '18 Jubilee Hills, Hyderabad 500033', placed: '08 Jun 2026 · 12:30', ts: Date.parse('2026-06-08T12:30:00'),
    statusKey: 'returning', status: 'Return', tone: 'amber', station: 'RETURNS-1', value: '₹1.35L', valNum: 135000,
    items: [{ sku: 'SKU 4590', name: 'Pearl drop pendant', qty: 1, condition: 'pending' }],
    timeline: [
      { label: 'Order placed', time: '08 Jun · 12:30', who: 'web checkout', clip: false },
      { label: 'Packed · Warehouse', time: '08 Jun · 15:10', who: 'Mira · PACK-BENCH-1', clip: true },
      { label: 'Delivered', time: '10 Jun · 13:00', who: 'OTP confirmed', clip: false },
      { label: 'Return requested', time: '14 Jun · 09:20', who: 'customer · "size issue"', clip: false },
      { label: 'Return inspection started', time: '14 Jun · 12:30', who: 'Sana · RETURNS-1', clip: false },
    ],
    custom: { priority: 'Standard', giftWrap: false, insured: '₹1.40L', slot: '—', instructions: 'Inspect at the returns desk and record the verdict.', notes: 'Return inspection in progress.' },
    remarks: [{ who: 'Sana', time: '14 Jun · 12:31', text: 'Customer reports loose clasp — inspecting now.' }],
  },
  {
    id: 'ORD-10362', channel: 'Online', customer: 'Rhea Malhotra', phone: '+91 98330 21145',
    address: '12 Linking Rd, Mumbai 400050', placed: '15 Jun 2026 · 11:20', ts: Date.parse('2026-06-15T11:20:00'),
    statusKey: 'draft', status: 'Draft', tone: 'plain', station: 'PACK-BENCH-2', value: '₹3.20L', valNum: 320000,
    items: [
      { sku: 'SKU 4550', name: 'Kundan necklace set', qty: 1, condition: 'pending' },
      { sku: 'SKU 4560', name: 'Diamond stud earrings', qty: 1, condition: 'pending' },
      { sku: 'SKU 4521', name: 'Mangalsutra', qty: 1, condition: 'pending' },
    ],
    timeline: [
      { label: 'Order placed', time: '15 Jun · 11:20', who: 'web checkout', clip: false },
      { label: 'Draft saved', time: '15 Jun · 11:24', who: 'Rahul · PACK-BENCH-2', clip: false },
    ],
    custom: { priority: 'Express', giftWrap: true, insured: '₹3.30L', slot: 'awaiting pack', instructions: 'Bridal set — pack with tamper seals.', notes: 'Draft — pack-bench video pending before dispatch.' },
    remarks: [{ who: 'Rahul', time: '15 Jun · 11:25', text: 'Held as draft until the bench is free for the pack video.' }],
  },
  {
    id: 'ORD-10365', channel: 'Store', customer: 'Imran Qureshi', phone: '+91 99860 55410',
    address: '3 Commercial St, Bengaluru 560001', placed: '15 Jun 2026 · 12:05', ts: Date.parse('2026-06-15T12:05:00'),
    statusKey: 'draft', status: 'Draft', tone: 'plain', station: 'PACK-BENCH-1', value: '₹1.15L', valNum: 115000,
    items: [
      { sku: 'SKU 4471', name: 'Solitaire ring', qty: 1, condition: 'pending' },
      { sku: 'SKU 4540', name: 'Gold coin · 8g', qty: 2, condition: 'pending' },
    ],
    timeline: [
      { label: 'Order placed', time: '15 Jun · 12:05', who: 'store counter', clip: false },
      { label: 'Draft saved', time: '15 Jun · 12:09', who: 'Mira · PACK-BENCH-1', clip: false },
    ],
    custom: { priority: 'Standard', giftWrap: false, insured: '₹1.20L', slot: 'awaiting pack', instructions: 'Walk-in order — customer collecting Saturday.', notes: 'Draft — awaiting pack-bench video.' },
  },
  {
    id: 'DC-2026-00455', channel: 'B2B', customer: 'Jaipur Branch', phone: '+91 141 400 7788',
    address: 'C Scheme, Jaipur 302001', placed: '13 Jun 2026 · 08:30', ts: Date.parse('2026-06-13T08:30:00'),
    statusKey: 'receiving', status: 'Receiving', tone: 'amber', station: 'STORE-RECV-2', value: '₹6.80L', valNum: 680000,
    items: [
      { sku: 'SKU 4510', name: 'Polki necklace', qty: 2, condition: 'pending' },
      { sku: 'SKU 4601', name: 'Temple jewellery set', qty: 1, condition: 'pending' },
      { sku: 'SKU 4480', name: 'Gold bangle', qty: 3, condition: 'pending' },
      { sku: 'SKU 4550', name: 'Kundan necklace set', qty: 1, condition: 'pending' },
    ],
    timeline: [
      { label: 'Challan raised', time: '13 Jun · 08:30', who: 'warehouse', clip: false },
      { label: 'Packed · Warehouse', time: '13 Jun · 10:40', who: 'Priya · PACK-BENCH-1', clip: true },
      { label: 'Dispatched → Gati', time: '13 Jun · 14:00', who: 'auto', clip: false },
      { label: 'Arrived at store', time: '15 Jun · 09:15', who: 'Devang · STORE-RECV-2', clip: false },
    ],
    custom: { ...blankCustom, insured: '₹6.90L', slot: '—', instructions: 'Festive replenishment — reconcile every RFID at the desk.', notes: 'Receiving in progress — confirm to shelve.' },
    remarks: [{ who: 'Devang', time: '15 Jun · 09:18', text: 'Two cartons open — scanning RFIDs against the challan.' }],
  },
  {
    id: 'RFID-1071', channel: 'Store', customer: 'Pune Galleria', phone: '+91 20 4120 6600',
    address: 'Koregaon Park, Pune 411001', placed: '14 Jun 2026 · 09:50', ts: Date.parse('2026-06-14T09:50:00'),
    statusKey: 'receiving', status: 'Receiving', tone: 'amber', station: 'STORE-RECV-1', value: '₹2.95L', valNum: 295000,
    items: [
      { sku: 'SKU 4530', name: 'Diamond choker', qty: 1, condition: 'pending' },
      { sku: 'SKU 4612', name: 'Sapphire ring', qty: 1, condition: 'pending' },
      { sku: 'SKU 4590', name: 'Pearl drop pendant', qty: 2, condition: 'pending' },
    ],
    timeline: [
      { label: 'Challan raised', time: '14 Jun · 09:50', who: 'warehouse', clip: false },
      { label: 'Packed · Warehouse', time: '14 Jun · 11:20', who: 'Mira · PACK-BENCH-2', clip: true },
      { label: 'Dispatched → Gati', time: '14 Jun · 15:10', who: 'auto', clip: false },
      { label: 'Arrived at store', time: '15 Jun · 10:40', who: 'Sana · STORE-RECV-1', clip: false },
    ],
    custom: { ...blankCustom, insured: '₹3.00L', slot: '—', instructions: 'Scan each RFID before shelving.', notes: 'Receiving — first carton opened at the desk.' },
  },
  {
    id: 'ORD-10324', channel: 'Online', customer: 'Farah Sheikh', phone: '+91 90040 33218',
    address: '9 Adyar, Chennai 600020', placed: '06 Jun 2026 · 10:10', ts: Date.parse('2026-06-06T10:10:00'),
    statusKey: 'returning', status: 'Return', tone: 'amber', station: 'RETURNS-1', value: '₹1.85L', valNum: 185000,
    items: [
      { sku: 'SKU 4490', name: 'Emerald drop earrings', qty: 1, condition: 'pending' },
      { sku: 'SKU 4571', name: 'Ruby cocktail ring', qty: 1, condition: 'pending' },
    ],
    timeline: [
      { label: 'Order placed', time: '06 Jun · 10:10', who: 'web checkout', clip: false },
      { label: 'Packed · Warehouse', time: '06 Jun · 13:25', who: 'Rahul · PACK-BENCH-1', clip: true },
      { label: 'Delivered', time: '09 Jun · 12:40', who: 'OTP confirmed', clip: false },
      { label: 'Return requested', time: '14 Jun · 10:05', who: 'customer · "colour mismatch"', clip: false },
      { label: 'Return inspection started', time: '15 Jun · 11:30', who: 'Sana · RETURNS-1', clip: false },
    ],
    custom: { priority: 'Standard', giftWrap: false, insured: '₹1.90L', slot: '—', instructions: 'Verify stones against the pack clip before verdict.', notes: 'Return inspection in progress.' },
    remarks: [{ who: 'Sana', time: '15 Jun · 11:32', text: 'Comparing emerald hue with the dispatch still now.' }],
  },
  {
    id: 'ORD-10327', channel: 'Online', customer: 'Aditya Banerjee', phone: '+91 98300 77451',
    address: '21 Salt Lake, Kolkata 700064', placed: '05 Jun 2026 · 18:30', ts: Date.parse('2026-06-05T18:30:00'),
    statusKey: 'returning', status: 'Return', tone: 'amber', station: 'RETURNS-1', value: '₹1.30L', valNum: 130000,
    items: [{ sku: 'SKU 4502', name: 'Tennis bracelet', qty: 1, condition: 'pending' }],
    timeline: [
      { label: 'Order placed', time: '05 Jun · 18:30', who: 'web checkout', clip: false },
      { label: 'Packed · Warehouse', time: '06 Jun · 09:40', who: 'Mira · PACK-BENCH-2', clip: true },
      { label: 'Delivered', time: '08 Jun · 14:10', who: 'OTP confirmed', clip: false },
      { label: 'Return requested', time: '14 Jun · 16:20', who: 'customer · "clasp loose"', clip: false },
      { label: 'Return inspection started', time: '15 Jun · 09:50', who: 'Devang · RETURNS-1', clip: false },
    ],
    custom: { priority: 'Standard', giftWrap: false, insured: '₹1.35L', slot: '—', instructions: 'Check the clasp and weigh against dispatch.', notes: 'Return inspection underway.' },
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
  {
    id: 'ORD-10330', channel: 'Online', customer: 'Kavya Reddy', phone: '+91 90030 21145',
    address: '12 Jubilee Hills, Hyderabad 500033', placed: '14 Jun 2026 · 12:20', ts: Date.parse('2026-06-14T12:20:00'),
    statusKey: 'packed', status: 'Packed', tone: 'plain', station: 'PACK-BENCH-2', value: '₹2.75L', valNum: 275000,
    items: [
      { sku: 'SKU 4550', name: 'Kundan necklace set', qty: 1, condition: 'verified' },
      { sku: 'SKU 4551', name: 'Matching maang tikka', qty: 1, condition: 'verified' },
    ],
    timeline: [
      { label: 'Order placed', time: '14 Jun · 12:20', who: 'web checkout', clip: false },
      { label: 'Packed · Warehouse', time: '14 Jun · 15:05', who: 'Rahul · PACK-BENCH-2', clip: true },
    ],
    custom: { priority: 'White-glove', giftWrap: true, insured: '₹2.80L', slot: 'awaiting dispatch', instructions: 'Bridal trousseau — double box, fragile.', notes: '' },
    remarks: [{ who: 'Rahul', time: '14 Jun · 15:08', text: 'Kundan stones counted twice — 42/42 intact.' }],
  },
  {
    id: 'ORD-10331', channel: 'Online', customer: 'Aditya Rao', phone: '+91 98860 77342',
    address: '8 Indiranagar, Bengaluru 560038', placed: '13 Jun 2026 · 19:30', ts: Date.parse('2026-06-13T19:30:00'),
    statusKey: 'transit', status: 'In transit', tone: 'amber', station: 'PACK-BENCH-1', value: '₹0.95L', valNum: 95000,
    items: [{ sku: 'SKU 4560', name: 'Diamond stud earrings', qty: 1, condition: 'verified' }],
    timeline: [
      { label: 'Order placed', time: '13 Jun · 19:30', who: 'web checkout', clip: false },
      { label: 'Packed · Warehouse', time: '14 Jun · 09:40', who: 'Mira · PACK-BENCH-1', clip: true },
      { label: 'Dispatched → Blue Dart', time: '14 Jun · 13:10', who: 'auto', clip: false },
      { label: 'In transit', time: '15 Jun · —', who: 'Blue Dart', clip: false },
    ],
    custom: { ...blankCustom, priority: 'Express', insured: '₹1.00L' },
  },
  {
    id: 'ORD-10333', channel: 'Online', customer: 'Meera Joshi', phone: '+91 99875 12390',
    address: '21 Aundh, Pune 411007', placed: '08 Jun 2026 · 14:05', ts: Date.parse('2026-06-08T14:05:00'),
    statusKey: 'returned', status: 'Returned', tone: 'red', station: 'RETURNS-1', value: '₹1.65L', valNum: 165000,
    items: [{ sku: 'SKU 4571', name: 'Ruby cocktail ring', qty: 1, condition: 'disputed' }],
    timeline: [
      { label: 'Order placed', time: '02 Jun · 11:00', who: 'web checkout', clip: false },
      { label: 'Packed · Warehouse', time: '02 Jun · 16:20', who: 'Rahul · PACK-BENCH-2', clip: true },
      { label: 'Delivered', time: '04 Jun · 12:40', who: 'OTP confirmed', clip: false },
      { label: 'Return requested', time: '07 Jun · 10:15', who: 'customer · "size issue"', clip: false },
      { label: 'Return inspected', time: '08 Jun · 14:05', who: 'Sana · RETURNS-1', clip: true },
    ],
    custom: { priority: 'Standard', giftWrap: false, insured: '₹1.70L', slot: '—', instructions: 'Customer wants exchange for larger size.', notes: 'Item matches pack clip — exchange approved.' },
    remarks: [
      { who: 'Sana', time: '08 Jun · 14:12', text: 'Side-by-side confirms same ring — no tampering.' },
      { who: 'Arjun', time: '08 Jun · 15:00', text: 'Approved exchange, refund hold released.' },
    ],
  },
  {
    id: 'DC-2026-00420', channel: 'B2B', customer: 'Ahmedabad Flagship', phone: '+91 79 4002 8800',
    address: 'CG Road, Ahmedabad 380009', placed: '13 Jun 2026 · 08:45', ts: Date.parse('2026-06-13T08:45:00'),
    statusKey: 'transit', status: 'In transit · short', tone: 'amber', station: 'STORE-RECV-2', value: '₹8.20L', valNum: 820000,
    items: [
      { sku: 'SKU 4471', name: 'Solitaire ring', qty: 3, condition: 'pending' },
      { sku: 'SKU 4510', name: 'Polki necklace', qty: 2, condition: 'pending' },
    ],
    timeline: [
      { label: 'Challan raised', time: '13 Jun · 08:45', who: 'warehouse', clip: false },
      { label: 'Dispatched → Gati', time: '13 Jun · 12:30', who: 'auto', clip: false },
      { label: 'In transit', time: '14 Jun · —', who: 'Gati · 2 days', clip: false },
    ],
    custom: { ...blankCustom, insured: '₹8.20L', notes: 'Festive replenishment — 5 pcs, reconcile on arrival.' },
  },
  {
    id: 'RFID-1055', channel: 'Store', customer: 'Vadodara Branch', phone: '+91 265 233 4500',
    address: 'Alkapuri, Vadodara 390007', placed: '12 Jun 2026 · 10:30', ts: Date.parse('2026-06-12T10:30:00'),
    statusKey: 'received', status: 'Received', tone: 'green', station: 'STORE-RECV-2', value: '₹1.10L', valNum: 110000,
    items: [{ sku: 'SKU 4480', name: 'Gold bangle', qty: 2, condition: 'verified' }],
    timeline: [
      { label: 'Dispatched → Gati', time: '11 Jun · 09:30', who: 'warehouse', clip: false },
      { label: 'Received · Store', time: '12 Jun · 10:30', who: 'Devang · STORE-RECV-2', clip: true },
      { label: 'Shelved', time: '12 Jun · 11:00', who: 'Devang', clip: false },
    ],
    custom: { ...blankCustom, insured: '₹1.10L', notes: 'Both bangles hallmark-checked on arrival.' },
    remarks: [{ who: 'Devang', time: '12 Jun · 10:45', text: 'Both RFIDs ticked, weights match challan.' }],
  },
  {
    id: 'ORD-10341', channel: 'Online', customer: 'Pooja Nair', phone: '+91 98470 66218',
    address: '5 Panampilly Nagar, Kochi 682036', placed: '12 Jun 2026 · 09:50', ts: Date.parse('2026-06-12T09:50:00'),
    statusKey: 'delivered', status: 'Delivered', tone: 'green', station: 'PACK-BENCH-1', value: '₹0.58L', valNum: 58000,
    items: [{ sku: 'SKU 4590', name: 'Pearl drop pendant', qty: 1, condition: 'verified' }],
    timeline: [
      { label: 'Order placed', time: '10 Jun · 21:15', who: 'web checkout', clip: false },
      { label: 'Packed · Warehouse', time: '11 Jun · 10:05', who: 'Mira · PACK-BENCH-1', clip: true },
      { label: 'Delivered', time: '12 Jun · 09:50', who: 'OTP confirmed', clip: false },
    ],
    custom: { ...blankCustom, insured: '₹0.60L', slot: '12 Jun · 9–12 PM' },
    remarks: [{ who: 'Mira', time: '11 Jun · 10:10', text: 'Gift note card added as requested.' }],
  },
];

// curated demo orders + ~104 generated ones (varied stage / status / city / channel)
export const seedOrders = [...curatedOrders, ...generateOrders(104)];

export const PRIORITY_OPTIONS = ['Standard', 'Express', 'White-glove'];

export function emptyCustomOrder() {
  return { id: '', channel: 'Online', customer: '', value: '', station: 'AUDIT-BENCH-1', packVideos: [], ...blankCustom };
}

// Build an order record from a custom-order draft. Shared by the create form and
// the leave-and-save dialog so both file an identical order. A pack clip captured
// in the draft files it as Packed; otherwise it lands as a Draft.
export function buildCustomOrder(d, who) {
  const id = (d.id || '').trim().toUpperCase();
  const op = who || 'admin';
  const packed = (d.packVideos || []).length > 0;
  const timeline = [{ label: 'Custom order created', time: 'today', who: op, clip: false }];
  if (packed) timeline.push({ label: 'Packed · Warehouse', time: 'today', who: op + ' · ' + d.station, clip: true });
  return {
    id, channel: d.channel, customer: (d.customer || '').trim(), phone: '—', address: '—',
    placed: 'today · custom entry', ts: Date.now(),
    statusKey: packed ? 'packed' : 'draft', status: packed ? 'Packed' : 'Draft',
    tone: 'plain', station: d.station, value: (d.value || '').trim() || '—', valNum: 0,
    items: [], timeline,
    custom: { priority: d.priority, giftWrap: d.giftWrap, insured: d.insured, slot: d.slot, instructions: d.instructions, notes: d.notes },
  };
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
  leaveConfirm: false, // "save all details?" guard when leaving an edit/session via the logo
  lastSession: 'ORD-10287 · sealed · 14:02',
  recSec: 0,
  recActive: true, // live camera recording on/off — drives the session timer + REC indicator
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
    { id: 'DC-2026-00420', reason: 'short 1', age: '5h', amt: '₹8.2L' },
  ],
  records: [
    { id: 'ORD-10293', kinds: 'pack + return', outcome: 'PASS', tone: 'green', operator: 'Mira', station: 'PACK-BENCH-1', ts: '12 Jun 2026 · 14:02', hash: '9f2c41aa…6b7a1', pair: true },
    { id: 'RFID-1021', kinds: 'pack + receive', outcome: 'received', tone: 'green', operator: 'Devang', station: 'STORE-RECV-1', ts: '11 Jun 2026 · 11:40', hash: '77d0e3c2…804fe', pair: false },
    { id: 'ORD-10311', kinds: 'return', outcome: 'flagged', tone: 'red', operator: 'Sana', station: 'RETURNS-1', ts: '10 Jun 2026 · 16:21', hash: 'c4a19b77…4e2d9', pair: true },
    { id: 'DC-2026-00417', kinds: 'challan', outcome: 'short', tone: 'amber', operator: 'Devang', station: 'STORE-RECV-1', ts: '09 Jun 2026 · 10:05', hash: '5b8fd210…9c33', pair: false },
    { id: 'ORD-10330', kinds: 'pack', outcome: 'PASS', tone: 'green', operator: 'Rahul', station: 'PACK-BENCH-2', ts: '14 Jun 2026 · 15:05', hash: 'a83bd91c…2f4e', pair: false },
    { id: 'RFID-1055', kinds: 'challan · receive', outcome: 'received', tone: 'green', operator: 'Devang', station: 'STORE-RECV-2', ts: '12 Jun 2026 · 10:30', hash: 'e017c4aa…77b2', pair: false },
    { id: 'ORD-10333', kinds: 'return', outcome: 'exchange', tone: 'green', operator: 'Sana', station: 'RETURNS-1', ts: '08 Jun 2026 · 14:05', hash: 'b6620f3d…1c0a', pair: true },
  ],
  users: [
    { name: 'Mira', role: 'operator' },
    { name: 'Sana', role: 'operator' },
    { name: 'Devang', role: 'operator' },
    { name: 'Rahul', role: 'operator' },
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
  return { border: 'rgba(0,0,0,0.2)', color: '#5B616B' };
}

export function dotFor(st) {
  if (st === 'ok') return { dot: '✓', dotColor: '#0E8A50', dotBorder: 'rgba(23,163,95,0.5)', dotBg: 'rgba(23,163,95,0.08)' };
  if (st === 'bad') return { dot: '!', dotColor: '#C62B22', dotBorder: 'rgba(229,62,62,0.5)', dotBg: 'rgba(229,62,62,0.06)' };
  return { dot: '···', dotColor: '#6B7280', dotBorder: 'rgba(0,0,0,0.15)', dotBg: 'transparent' };
}

export function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

// human timestamp for a freshly-added remark, e.g. "15 Jun · 10:32"
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function nowStamp() {
  const d = new Date();
  return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' · ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

export const MONO = "'IBM Plex Mono',monospace";

// Shared type + spacing scale. Mirrors Tailwind's text-*/space utilities so
// inline-styled components and utility classes stay on the same rhythm.
// (Tailwind: text-xs=12 sm=14 base=16 lg=18 xl=20 2xl=24 3xl=30; spacing 1=4px.)
export const TYPE = { xs: 12, sm: 13, label: 11, base: 14, md: 16, lg: 20, xl: 24, display: 32 };
export const LH = { tight: 1.2, snug: 1.35, normal: 1.5 };
export const SPACE = { '1': 4, '2': 8, '3': 12, '4': 16, '5': 20, '6': 24, '8': 32 };

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

// ---- clean / minimal surfaces (modern light look — used on the order detail page) ----
export const cardLight = {
  background: '#FFFFFF',
  border: '1px solid #ECEDF0',
  borderRadius: 18,
  boxShadow: '0 1px 2px rgba(15,17,21,0.05), 0 14px 32px -22px rgba(15,17,21,0.28)',
};
export const surfaceSubtle = {
  background: '#F7F8FA',
  border: '1px solid #EDEFF2',
};
export const INK = '#0F1115';
export const MUTE = '#6B7280';
export const HAIRLINE = '#F0F1F3';
