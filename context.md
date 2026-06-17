# context.md — Mayavé Packaging Audit System

> **Read this first.** Single source of truth for picking up new work on this repo.
> Repo: `gondaliyabhavya70960/dr-packege-audit-system` · work branch: `claude/adoring-keller-duuxt2` · deploys on **Vercel**.

---

## 1. What it is
Internal **operations console** for **Dholakia Retail / Mayavé** that captures **tamper‑evident video proof at three checkpoints — packing, store receiving, returns** — every clip linked to one ID (order ID / RFID / challan). It is **not** an e‑commerce/marketing site. Users: warehouse operators & store staff on kiosk/iPad touch screens, plus auditors/managers on desktop. Success = operator speed, error rate, and how fast an auditor can find & trust a clip. All demo state is client‑side (no real backend).

## 2. Stack & how it runs
- **Next.js 14 (App Router) + React 18**, deployed on Vercel. `vercel.json` pins `framework: nextjs`.
- **Tailwind 3.4** added **additively** (`preflight: false`) — styling is still mostly **inline styles + one global stylesheet** (`src/styles.css`), with design tokens in `src/data.js`.
- `lucide-react` for all UI icons.
- Run: `npm install` → `npm run dev` (**http://localhost:3000**) · `npm run build` · `npm run start`.
- **Demo login:** username `admin`/`manager`/`auditor` → admin console; anything else (e.g. `operator`) → operator. **Any password.** Pick **Warehouse** or **Store** side at login.
- Migration notes (from the original Vite SPA): see `MIGRATION.md`.

## 3. Architecture (important)
The whole interactive app is a **client island** — `src/App.jsx` (`'use client'`) — mounted **once in `app/layout.jsx`** so its state survives client‑side navigation. Each route's `page.jsx` is a **metadata‑only carrier** (returns `null`) for SEO.

- **State machine:** one `s` object in `App.jsx` (seeded from `initialState` in `data.js`); update via `set({ ...patch })`.
- **Routing = URL ⇄ screen sync.** `App.jsx` derives the screen from the path and pushes the path when the screen changes (`pathToNav` / `navToPath` + `usePathname`/`useRouter`). **You navigate by `set({ screen, orderId, listKind })`** — the sync effects translate it to `router.push`. Don't rewrite call sites to `router.push`.
- **Routes:** `/` (login) · `/overview` (Home dashboard) · `/packaging` & `/transfers` (the two order lists) · `/orders/[id]` (single order; `/orders/new` = create) · `/admin/[section]` (search/config/coverage/consignment/returns/flagged/stations) · `/kiosk` & `/session/[mode]` (legacy scan flow, reached via the guided tour) · `/api/orders` (mock Route Handler) · `app/opengraph-image.jsx` (generated OG card) · `app/error.jsx` (error boundary).
- **Chrome:** `TopBar` + `TabBar` + overlays are rendered by `App.jsx` per surface (operator vs admin). Bottom bar = **Overview · Packaging · Transfers** (+ **Admin** dropdown for admins).

⚠️ **Gotchas**
- **Determinism / hydration:** never use `Math.random()` or `Date.now()` during render or in seed data — SSR and client must match. The order generator is index‑based on purpose.
- Only the client island may import `next/navigation`.
- Fonts load via `<link>` in `layout.jsx` (IBM Plex Mono + Figtree). `next/font` is the future optimization.

## 4. Design system (tokens in `src/data.js`)
- **Colours:** accent maroon `ACCENT #8E0E22`; `INK #0F1115`; `MUTE #6B7280`; `HAIRLINE #F0F1F3`; `RED/#C62B22`, `GREEN/#0E8A50`, warn `#9A6A00`. Contrast‑safe muted tiers: **`#5B616B`** (strong) / **`#6B7280`** (light) — use these, not low‑alpha greys.
- **Type:** `MONO` = IBM Plex Mono (IDs/hashes/timecodes only); Figtree for UI. `TYPE`/`LH`/`SPACE` scale tokens exist. Body has `tabular-nums`.
- **Surfaces — two systems coexist (by design):**
  - **`glass` / `glassFloat` / `glassPopover` / `glassSheet`** = frosted "Liquid Glass" (most screens).
  - **`cardLight` / `surfaceSubtle`** = clean white cards — used on the **order‑detail** page.
  - The app‑wide **glass→clean unification is intentionally NOT done** (owner's call). Respect both; don't rebrand colours.
- **Icons:** **Lucide is the single source of truth.** `src/components/icons.jsx` keeps only the brand `PackageIcon`. Wrap icon‑only buttons with `aria-label`, decorative icons `aria-hidden`.

## 5. Core flows & screens
**`src/screens/`:** `Login` (role + side select) · `Home` (Overview: order counts + the two lists) · `Orders` (the list; serves both Packaging & Transfers) · `OrderDetails` (single‑order tabbed hub) · `PackRecord` / `Receiving` / `ReturnInspection` (live recording tools) · `KioskHome` (legacy scanner) · `SearchPlayback` · `Dashboard` (admin dashboards) · `UsersConfig`.

- **Two order lists** = `Orders.jsx` filtered by `s.listKind` (`packaging` vs `transfer`) via `isTransferOrder(o)`. Has search/status/channel/date filters, sort, bulk‑select + CSV, and a **Route column** (`orderRoute`: `Surat WH → city` for packaging, `→ store/branch` for transfers).
- **Single order** (`OrderDetails`) = tabbed: **Detail · Packing · Receive · Return** — all four tabs show on every side (`ORDER_TABS`). Detail shows items, timeline, customer & shipping, custom fields (editable), linked evidence, and the **Remarks** thread. Packing/Receive/Return run **inline**.
  - **Status‑driven tab modes** (`tabMode(statusKey, tab)`): each non‑Detail tab renders in one of three modes by order status — **`view`** (read‑only filed clip via `CompletedStage` + 🔒 badge), **`edit`** (the live, editable tool — `PackRecord`/`Receiving`), or **`empty`** (a not‑yet‑reached zero‑state, `EmptyStage`). Tab badges follow: pulsing dot = edit, lock = view, dimmed = empty. Matrix by lifecycle (`draft→packed→transit→received→delivery→delivered→returned/flagged`): **Packing** edit on `draft` else view; **Receive** empty until `received` (edit), then view from `delivery` on; **Return** empty until `returned`/`flagged` (view). Detail is always view.
  - **Create mode** (`/orders/new`) adds a **Packing video capture** section (`PackingCapture`): a `VideoCaptureCard` + the list of clips filed so far (held on `orderDraft.packVideos`). Saving with ≥1 clip files the order as **Packed**; with none, as **Draft**.
- **Remarks** (`RemarkBox`): per‑order comments stamped with username + time. `variant="thread"` (Detail, with input) / `variant="input"` (steps) / `readOnly` (locked stages).
- **Admin:** `SearchPlayback`, dashboards, `UsersConfig`, and the **`SideBySidePlayer`** modal (pack vs return, evidence overlay, `useDialog` a11y).

## 6. Data model (`src/data.js`)
- `seedOrders = [...curatedOrders (16 hand‑written), ...generateOrders(104)]` → **~120 orders** (deterministic generator: varied channel/status/city/items/value, some with `remarks`).
- **Order shape:** `{ id, channel('Online'|'Store'|'B2B'), customer, phone, address, placed, ts, statusKey, status, tone, station, value, valNum, items[]{sku,name,qty,condition}, timeline[]{label,time,who,clip}, custom{}, remarks?[]{who,time,text}, from? }`.
- **Helpers:** `isTransferOrder` · `cityOf(address)` · `orderRoute(o)` · `orderStages(o)→{pack,recv,ret}` · `stageClip(o,stage)` · `tabMode(statusKey,tab)→view|edit|empty` (single‑order tab modes) · `tone()` · `dotFor()` · `fmt()` · `nowStamp()` · `synthOrder()` · `emptyCustomOrder()`. Also `flags`, `records`, `users` arrays + `tourDefs`.
- Stage completion is read from the **timeline labels** (`Packed…`, `Received…`, `Return inspected…`) + `statusKey`.
- **`ORDER_STATUSES`** (drives the filter + Home counts): `draft` · `packed` · `transit` · `received` · `delivery` · `delivered` · `returned` · `flagged`. **Draft** = bespoke / not‑yet‑packed (tone `plain`). `emptyCustomOrder()` seeds `packVideos: []`.
- **`initialState.recActive`** (default `true`) — live‑recording on/off; the 1s heartbeat only advances `recSec` while it's on (Start/Stop toggle on every live feed).

## 7. Key components (`src/components/`)
- **`ClipPlayer`** — real `<video>` pipeline: poster + MP4/WebM sources + `muted/playsInline/preload="none"` + **evidence overlay (id·ts·hash)** + buffering/error states; **falls back** to the styled placeholder until clips exist at `/public/assets/clips/<id>.{mp4,webm}`.
- **`SideBySidePlayer`** — review modal (uses `useDialog`, `ClipPlayer`).
- **`useDialog(onClose)`** — `role="dialog"`/`aria-modal`, **Esc to close**, focus trap + restore. Used by player, `BackConfirm`, `Tour`.
- **`RecordButton`** — shared Start/Stop recording toggle (red Stop while live, accent Start when idle); on every live feed (`PackRecord`/`Receiving`/`ReturnInspection`) + `VideoCaptureCard`.
- **`VideoCaptureCard`** — self‑contained recording card: live feed + `RecordButton` + running timer + still capture; **Stop** files a take via `onCapture({label,dur,stills,time,hash})`. Used by `PackingCapture` in the create form.
- **`RemarkBox`**, **`PrevStepClip`** (mini prev‑step clip on Receive), **`EmptyState`** (icon+title+sub+action), **`Toast`** (`aria-live`), **`TopBar`**, **`TabBar`**, **`Tour`**, **`BackConfirm`**, **`icons.jsx`** (PackageIcon only).

## 8. History (merged PRs #9–#24, newest first)
- **#24** 100+ generated orders · stage‑lock on order detail · `EmptyState` + `app/error.jsx` · contrast on top‑bar chips.
- **#23** sender→receiver **Route** column on the order lists.
- **#22** consolidate UI icons on Lucide (drop 7 hand‑rolled dupes, keep `PackageIcon`).
- **#21** clip **evidence overlay** + modal/keyboard a11y (`useDialog`) + Toast `aria-live` + tabular‑nums.
- **#20** AA contrast sweep · remaining glyphs→Lucide · `ClipPlayer` video pipeline · OG image · type/spacing tokens · mobile pass.
- **#19** Tailwind added · fonts loaded (Plex Mono + Figtree) · emoji→Lucide · base a11y · code‑split player.
- **#18** **Migrate Vite→Next.js (App Router)** + expand demo data.
- **#17** Remarks card under Timeline. **#16** clean‑light order‑detail cards. **#15** per‑order remark system. **#14/#13** prev‑step mini clip (inline). **#12** drop list summary chip. **#11** top‑bar station block only on single order. **#10** login‑side select + Overview + Packaging/Transfers lists. **#9** Warehouse/Store sides + tabbed single‑order flow.

## 9. Outstanding / deferred (with reasons)
- **Logo → SVG** — `public/assets/mayave-logo.png` is a custom logotype; needs the **source vector** (no tracer in this env). Drop a `.svg` in and swap the `<img>` in `TopBar.jsx`.
- **Frame‑synced side‑by‑side player + real clips/posters** — pipeline/controller ready; needs **real media** in `/public/assets/clips/` to be meaningful.
- **Glass → clean‑light unification** app‑wide — deliberately **not** done (owner's call to keep the look).
- Full contrast‑backplate pass (only top‑bar chips done) · deeper mobile pass · dashboard loading/empty states.

## 10. Working conventions
- Develop on **`claude/adoring-keller-duuxt2`**; open a **draft PR** to `main` per change; Vercel auto‑deploys the preview. Verify with `npm run build` + a quick browser check before pushing.
- Keep changes **within the existing tokens** (don't change the palette unless asked). Preserve determinism. Add `aria-label`s for icon‑only controls.
