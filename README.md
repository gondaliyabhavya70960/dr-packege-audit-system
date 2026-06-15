# Packaging Audit System · Mayavé

Working web implementation of the [Claude design](https://claude.ai/design/p/2d076676-59d4-4255-a07a-1082b09f16c5?file=export-src.dc.html&via=share) for the Dholakia Retail / Mayavé **Packaging Audit System** — video proof at the three moments that matter (packing, store receiving, returns), all linked to one ID (order ID / RFID / challan).

The original design source is kept at [`design/export-src.dc.html`](design/export-src.dc.html) for reference.

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # serve the production build
```

## Demo accounts

Any password works in this prototype.

| Username                        | Surface                                                        |
| ------------------------------- | -------------------------------------------------------------- |
| `admin` / `manager` / `auditor` | Admin console — search & playback, dashboards, users & config  |
| anything else (e.g. `operator`) | Station kiosk — Pack · Receive · Returns                       |

## Screens

| #     | Screen                | Where                                                              |
| ----- | --------------------- | ------------------------------------------------------------------ |
| 01    | Login                 | role-based routing, guided-tour entry                              |
| 02    | Kiosk home            | demo HID scanner — chips or free input (`ORD-…` / `RFID-…` / `DC-…`) |
| 03    | Pack & Record         | live-feed pane, expected-vs-scanned, condition check, flag/close   |
| 04    | Store receiving       | challan reconcile, short/extra detection, arrival feed             |
| 05    | Return inspection     | unboxing feed vs original pack clip, outcome reasons, refund hold  |
| 06    | Search & playback     | any ID → full history, tamper-evident hash                         |
| 07    | Side-by-side player   | pack vs return clip, sync play, stills, supervisor verdicts        |
| 08–12 | Dashboards            | coverage, consignment, returns, flagged queue, station health      |
| 13    | Users & config        | roles, retention & tiering, alert thresholds                       |
| 14    | Orders                | searchable/filterable order list with bulk select and CSV export   |
| 15    | Custom order details  | per-order detail view with editable custom fields; create new      |

Plus: floating task/admin tab bar, save-as-draft back confirmation, 9-step feature tour (auto-starts on first visit), toasts.

### Orders & custom order details

**Orders** is available to **both roles** — operators reach it from the **Orders** tab in the
floating bottom bar (next to Pack / Receive / Returns), and admins get the same tab alongside
the Admin menu. Each role sees it under its own chrome, and the order data is shared between
them. It's a full order list with:

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

- [Vite](https://vitejs.dev) + [React 18](https://react.dev) — no other runtime dependencies
- All demo state lives in a single client-side store (`src/App.jsx`), ported 1:1 from the design prototype's state machine
- iPadOS-style **Liquid Glass** visual language: layered radial-gradient canvas; translucent, heavily-blurred material with specular rim highlights; concentric rounded corners; springy/press-scaled controls and accent focus rings — built from shared material tokens (`glass`, `glassFloat`, `glassPopover`, `glassSheet` in `src/data.js`). `#8E0E22` Mayavé maroon accent with IBM Plex Mono data values.
- **Adaptive light/dark materials**: every surface is themed through CSS variables (`:root` / `[data-theme="dark"]` in `src/styles.css`) — canvas "wallpaper", glass tints, ink ramp, hairlines and tiles all swap together. Theme follows the OS by default (auto) and a sun/moon/auto toggle in the top bar (and on login) cycles auto → light → dark, persisted to `localStorage`. The translucent materials pick up the wallpaper's colour glow behind them.
- **Motion**: pointer **parallax + a specular "lensing" sheen** on the floating top/tab bars, and **spring entrance** animations on cards, sheets and menus — all baked into the material tokens and gated behind `prefers-reduced-motion`.

## Project layout

```
src/
  App.jsx              # state machine + routing (port of the design's DCLogic)
  data.js              # seed records/flags/users, tour steps, palette helpers
  screens/             # 01–13 screen components
  components/          # top bar, tab bar, player, tour, modals, toast
design/
  export-src.dc.html   # original Claude design source (reference)
```
