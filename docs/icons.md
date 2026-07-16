# Icon system — reference & how-to

Everything visual-glyph in this app comes from **one collection: [Lucide](https://lucide.dev)**,
plus a single in-house brand glyph. This doc lists every icon in use, where it is used,
how to use icons in code, and exactly what to do to add a new one.

---

## 1 · The collection

| | |
|---|---|
| Collection | **Lucide** (open source, ISC license) |
| Package | `lucide-react` — already installed (see `package.json`, v1.18.0) |
| Delivery | Tree-shaken ES imports — only the icons you import ship in the bundle. No CDN, no icon font, no extra requests. |
| Drawing style | 24×24 grid · 2px stroke · rounded caps/joins · `currentColor` |
| Browse / search | <https://lucide.dev/icons> — search there, then use the **PascalCase** name in code (`qr-code` → `QrCode`) |

**Custom icons:** only `PackageIcon` (brand package glyph) in `src/components/icons.jsx`,
hand-drawn to the same 24-grid / 2px-stroke rules so it is indistinguishable from Lucide.

**Brand image (not an icon):** `public/assets/mayave-logo.png` — top bar (97×40) and login (100px tall).

---

## 2 · How to use an icon (existing or new)

Icons are React components. Import from `lucide-react`, render with a size:

```jsx
import { Truck, Flag } from 'lucide-react';

// inline in a button / label
<Truck size={16} aria-hidden="true" style={{ flex: 'none' }} />

// coloured via CSS `color` (icons use currentColor)
<Flag size={14} aria-hidden="true" style={{ color: '#C62B22' }} />
```

House conventions (follow these so new icons match everything else):

1. **`aria-hidden="true"` on decorative icons** — and give the *button* an `aria-label`
   if the icon is its only content (see the bell in `TopBar.jsx`).
2. **`style={{ flex: 'none' }}`** when the icon sits in a flex row, so it never squashes.
3. **Sizes:** 10–11px inline text markers · 13–16px buttons and chips · 19px tile chips ·
   22px section-header chips. Don't invent new sizes without reason.
4. **Icon chip pattern** (the tinted square behind an icon):
   ```jsx
   <span style={{ width: 40, height: 40, flex: 'none', borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: color + '1a', color }}>   {/* '1a' = 10% alpha tint */}
     <Icon size={19} aria-hidden="true" />
   </span>
   ```
   For accent-red chips use `background: 'rgba(var(--accent-rgb),0.1)', color: 'var(--accent)'`.
5. **One collection only.** Never mix in FontAwesome/Material/emoji as UI icons.
   Text glyphs (`·`, `→` in copy, `×3`, `!` in scan circles) are typography, not icons.

---

## 3 · What to do to add a new icon to the website

1. **Find it:** search <https://lucide.dev/icons>. Note the PascalCase component name.
2. **Import it** in the file where you need it — extend the existing lucide import line:
   ```jsx
   import { Search, ChevronRight, QrCode } from 'lucide-react';
   ```
3. **Render it** using the conventions above (size + `aria-hidden` + `flex: 'none'`).
4. **No install step is needed** — the package is already a dependency.
   If a very new Lucide icon doesn't exist in our version, either
   `npm i lucide-react@latest`, or add a custom SVG to `src/components/icons.jsx`
   following the `PackageIcon` template (24×24 viewBox, 2px stroke, `currentColor`).
5. **Build to verify:** `npm run build`.

### Where icons are registered for common cases

| You want to… | Edit this |
|---|---|
| Give a new **order status** an icon/colour/description on the Overview tiles | `STATUS_ICONS`, `STATUS_COLORS`, `STATUS_DESCS` in `src/screens/Home.jsx` |
| Map a new **timeline event** wording to an icon | keyword map in `timelineIcon()` in `src/screens/OrderDetails.jsx` |
| Add a **bottom-nav tab** icon | `navTabs` in `src/components/TabBar.jsx` |
| Add an **order type** (icon + colour) | `NEW_ORDER_TYPES` in `src/components/NewOrderMenu.jsx` |
| Add a **top-bar control** | compose a button in `src/components/TopBar.jsx` (see `TourButton` / `LanguageMenu`) |

---

## 4 · Every icon in use, A–Z (55 Lucide + 1 custom)

| Icon | Used in |
|---|---|
| AlertTriangle | Dashboard — warning banner *(same glyph as TriangleAlert; standardise on one name eventually)* |
| ArrowDown / ArrowUp / ArrowUpDown | Orders — ORDER/DATE sort headers |
| ArrowRight | Orders — route arrow · Dashboard — row action · Getting-started + Welcome — CTA arrows |
| BadgeCheck | Overview — Return Completed tile · Order details — refund/approved timeline |
| Bell | Top bar — notifications |
| Boxes | Order details — legacy bulk-order meta (unreachable; removal candidate) |
| CalendarDays | Orders — PLACED filter trigger |
| Camera | Video capture card · Packaging "Take photo" · Return inspection |
| Check | Done/selected marks everywhere: getting-started steps, remark-added, select + language menus, hash-verified lines, login mock card, create-form type radio, scan circles, default timeline icon |
| ChevronDown / ChevronUp | Select + menu triggers, profile/language/Admin open-close states |
| ChevronLeft | Session Back · order-details back circle · Prev page · player Back |
| ChevronRight | Open/Next/Review/drill-through arrows across Orders, Overview, Dashboard, order details, prev-step clip, search results |
| CircleCheck | Overview — Completed stat + Delivered tile · Order details — all-clear + delivered timeline |
| Compass | Getting-started — tour step |
| Download | Orders — Export CSV |
| FastForward / Rewind | Side-by-side player — ±10s |
| FileSearch | Welcome — search feature · Search & playback empty state |
| FileText | Overview — Ready to Pack tile · timeline challan/draft |
| Flag | Flag markers everywhere: remarks popup, Flagged tile, flagged-items card, needs-attention, session flag toggles, save-&-flag |
| Gauge | Overview — Order summary header chip |
| Gem | Item thumbnails (captured/detected) + item row icons |
| Gift | Create form — gifts (button, heading, rows) |
| History | Orders — UPDATED cell · Login — retention pill |
| Inbox | Overview — Receiving tile · Welcome — receive · timeline receive + empty state |
| Languages | Top bar — language selector |
| LayoutGrid | Bottom nav — Overview tab |
| ListChecks | Overview — Orders-by-status header chip |
| Lock | Order details — recorded/read-only chip + tab marker |
| LogOut / Settings / User | Top bar — profile menu rows |
| MapPin | Order details — in-transit route line |
| MonitorPlay | Getting-started — live station step |
| Package | Nav Packaging tab · Overview (widget header, Total stat, Packed tile) · Welcome · timeline pack + empty state |
| PackageCheck | Overview — Received tile |
| PackageOpen | Overview — Return Received tile |
| PackagePlus | Overview create header chip · create-popup heading chip |
| Pause | Player, prev-step clip, packaging session pause |
| Play | Playback frames, prev-step clip, record start, player, clip buttons, keep-recording |
| Plus | Create-order trigger, getting-started create, add item, manual add |
| RefreshCw | Orders — Pull from Gati |
| RotateCcw | Overview — Return Requested tile · Welcome returns · timeline return + empty state · Re-record |
| ScanLine | Packaging — manual SKU input |
| Search | Search inputs (orders, station health, search & playback) |
| SearchX | Orders — no-match empty state |
| Send | Overview — Out for delivery tile |
| ShieldCheck | Login — SOC-2 pill |
| ShoppingCart | E-commerce order type · order-placed timeline |
| Sparkles | Create form — Test fill |
| Square | Record button — stop |
| SquarePen | Order details — pencil edit |
| Trash2 | Create form — remove item/gift rows |
| TriangleAlert | Packaging — mismatch dialog header |
| Truck | Nav Transfers tab · Overview (widget header, In-transit stat + tile) · Transfer type · transit chip/journey/dispatch timeline |
| Undo2 | Overview — Return In Transit tile · pickup timeline |
| Video | Login — video pill · CLIP pills + recording timeline |
| WandSparkles | Top bar — Tour button |
| X | Dismiss/close (getting-started, tour, prev-step clip) |
| **PackageIcon** *(custom)* | Login mock card · Welcome brand circle |
