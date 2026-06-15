# Packaging Audit System · Mayavé

Working web implementation of the [Claude design](https://claude.ai/design/p/2d076676-59d4-4255-a07a-1082b09f16c5?file=export-src.dc.html&via=share) for the Dholakia Retail / Mayavé **Packaging Audit System** — video proof at the three moments that matter (packing, store receiving, returns), all linked to one ID (order ID / RFID / challan).

The original design source is kept at [`design/export-src.dc.html`](design/export-src.dc.html) for reference.

## Run it

This is a **Next.js (App Router)** app.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build → .next/
npm run start    # serve the production build
```

Migrating from the old Vite setup? See [`MIGRATION.md`](MIGRATION.md) for the
full step‑by‑step (routing, SSR/hydration, data fetching, SEO, env, best
practices).

## Demo accounts

Any password works in this prototype.

| Username                        | Surface                                                        |
| ------------------------------- | -------------------------------------------------------------- |
| `admin` / `manager` / `auditor` | Admin console — search & playback, dashboards, users & config  |
| anything else (e.g. `operator`) | Station kiosk — Pack · Receive · Returns                       |

## Screens

| #     | Screen                | Where                                                              |
| ----- | --------------------- | ------------------------------------------------------------------ |
| 01    | Login                 | role-based routing, Warehouse/Store side selection, guided-tour entry |
| 02    | Kiosk home            | demo HID scanner — chips or free input (`ORD-…` / `RFID-…` / `DC-…`) |
| 03    | Pack & Record         | live-feed pane, expected-vs-scanned, condition check, flag/close   |
| 04    | Store receiving       | challan reconcile, short/extra detection, arrival feed             |
| 05    | Return inspection     | unboxing feed vs original pack clip, outcome reasons, refund hold  |
| 06    | Search & playback     | any ID → full history, tamper-evident hash                         |
| 07    | Side-by-side player   | pack vs return clip, sync play, stills, supervisor verdicts        |
| 08–12 | Dashboards            | coverage, consignment, returns, flagged queue, station health      |
| 13    | Users & config        | roles, retention & tiering, alert thresholds                       |
| 14    | Orders                | per-side order list (Warehouse / Store) — search/filters, bulk select, CSV export |
| 15    | Single order          | tabbed hub — Detail + inline Packing / Receive / Return tools, editable custom fields, create new |

Plus: post-login **Overview** dashboard (order counts → the two lists), floating Overview / Packaging / Transfers + admin tab bar, save-as-draft back confirmation, 9-step feature tour (auto-starts on first visit), toasts.

### Warehouse / Store flow

You pick your **side — Warehouse or Store — at login**. It drives which tools a single order
exposes (warehouse adds Receive) and rides along as a chip in the top bar. The whole flow is
identical for **operators and admins**; each just renders under its own chrome.

```
login (pick side)  →  Overview dashboard  →  order list  →  single order  →  action tabs
```

1. **Overview** — the post-login landing: a total order count, per-status counts, and the two
   working lists one tap away.
2. **Two lists** — the floating bottom bar is **Overview · Packaging · Transfers** (+ **Admin**
   for admins):
   - **Packaging orders** — customer orders to pack & dispatch.
   - **Transferring goods** — inter-branch challans & consignments (DC / RFID ids, B2B channel).
3. **Single order** — every row opens the order, which carries a tab bar of side-specific tools:
   - **Warehouse:** Detail · **Packing** · **Receive** · **Return**
   - **Store:** Detail · **Packing** · **Return** _(no Receive)_
4. **Tools run inline** — picking Packing / Receive / Return runs that recording tool (live
   feed, expected-vs-scanned, flag/close) **in place on the order**, anchored to its ID. Closing
   or flagging a session writes the outcome back to the order's timeline and returns to **Detail**.

### Orders & custom order details

**Orders** is available to **both roles** under each side's chrome, and the order data is shared
between them. It's a full order list with:

- Search (order ID / customer / channel) and filters for **status**, **channel**, and **date range**
- Sort by newest/oldest or order value
- Multi-select with a bulk-action bar (CSV export)
- A row action and a header **"Custom order details"** button that open the detail view

**Custom order details** shows the order's items, full event timeline (with links to the
filed video clips), customer & shipping, linked evidence with tamper-evident hashes, and an
editable **custom fields** block — priority, gift wrap, insured value, delivery slot, special
instructions and internal notes. The header button can also create a brand-new custom order,
which is added to the list. Search & playback links straight into the same detail view.

## Stack

- [Next.js 14 (App Router)](https://nextjs.org) + [React 18](https://react.dev)
- Real routes per surface (`/overview`, `/packaging`, `/transfers`, `/orders/[id]`, `/admin/[section]`, …) with per-route SEO metadata and SSR; the interactive app is a client island mounted in `app/layout.jsx`, with `src/App.jsx` syncing its `screen` state to the URL
- All demo state lives in a single client-side store (`src/App.jsx`); orders are also exposed via a mock Route Handler at `/api/orders`
- iPadOS-style **Liquid Glass** visual language: layered radial-gradient canvas; translucent, heavily-blurred material with specular rim highlights; concentric rounded corners; springy/press-scaled controls and accent focus rings — built from shared material tokens (`glass`, `glassFloat`, `glassPopover`, `glassSheet` in `src/data.js`). Palette is unchanged: `#8E0E22` Mayavé maroon with IBM Plex Mono data accents.

## Project layout

```
app/
  layout.jsx           # <html><body>, global CSS, default SEO metadata, mounts <App/>
  page.jsx             # "/" + per-route page.jsx files (metadata carriers)
  orders/[id]/         # dynamic order route (generateMetadata)
  admin/[section]/     # dynamic admin route
  session/[mode]/      # standalone pack/receive/return (legacy, via kiosk/tour)
  api/orders/route.js  # mock data source (Route Handler)
src/
  App.jsx              # 'use client' state machine + URL⇄screen sync
  data.js              # seed records/flags/users, tour steps, palette helpers
  screens/             # screen components
  components/          # top bar, tab bar, player, tour, modals, remarks, toast
  styles.css           # global stylesheet (imported in app/layout.jsx)
design/
  export-src.dc.html   # original Claude design source (reference)
```
