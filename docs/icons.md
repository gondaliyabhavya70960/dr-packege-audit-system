# Icon system — reference & how-to

Every UI icon in this app comes from **one collection: [Font Awesome 6 Free](https://fontawesome.com/icons)**
(solid + regular styles), plus a single in-house brand glyph. This doc covers the collection,
the brand colour rules, every icon in use, how to use icons in code, and exactly what to do
to add a new one.

---

## 1 · The collection

| | |
|---|---|
| Collection | **Font Awesome 6 Free** — solid (filled) + regular (outline) styles |
| Packages | `@fortawesome/react-fontawesome`, `@fortawesome/fontawesome-svg-core`, `@fortawesome/free-solid-svg-icons`, `@fortawesome/free-regular-svg-icons` — all installed (see `package.json`) |
| Delivery | Tree-shaken SVG imports — only imported icons ship in the bundle. No CDN, no icon font, no kit script. The core stylesheet loads once in `app/layout.jsx`. |
| App entry point | **`src/components/fa.jsx`** — the single place icons are imported and re-exported as app components. Screens/components import from here, never from Font Awesome directly. |
| Browse / search | <https://fontawesome.com/icons> — filter by **Free**; note the icon name (`truck-fast` → `faTruckFast`) |

**Custom icon:** `PackageIcon` (brand package glyph) in `src/components/icons.jsx` — used on the
login mock card and the welcome screen. **Brand image (not an icon):** `public/assets/mayave-logo.png`.

---

## 2 · Brand colours for icons

From the brand sheet — use these roles, in app tokens where they exist:

| Role | Hex | App token | Icons that use it |
|---|---|---|---|
| **Primary / brand red** | `#AA182C` | `var(--accent)` | **Featured icons** — section-header chips, primary actions, the bell, Tour, nav-active states, anything that identifies a feature |
| Primary text | `#171717` | `var(--ink)` / `var(--ink-2)` | **Utility icons** that sit with dark text — chevrons, sort arrows, calendar, search-adjacent controls |
| Secondary text | `#5D5D5D` | `var(--mute)` / `var(--mute-2)` | Quiet/inline utility icons (history marker, muted chevrons) |
| Backgrounds | `#FFFFFF` / `#EAEAEA` / `#F4F4F4` | `--surface` / `--surface-soft` | Icon chips sit on these; the featured chip tint is `rgba(var(--accent-rgb),0.1)` |

**The default rule:** a *featured* icon is brand red; a *utility* icon follows its text tone.
Semantic colours stay semantic (green = verified `#0E8A50`, red = flag/danger `#C62B22`,
amber = in-flight, per-status hues on the status tiles), and icons on filled/accent buttons
render white via `currentColor`.

In code, icons inherit `currentColor` by default; the wrapper also accepts a shorthand:

```jsx
<Truck size={16} tone="brand" />   // → color: var(--accent)  (#AA182C)
```

---

## 3 · How to use an icon

Import **from `src/components/fa.jsx`** (not from Font Awesome packages) and render with a size:

```jsx
import { Truck, Flag } from '../components/fa.jsx';

<Truck size={16} aria-hidden="true" style={{ flex: 'none' }} />
<Flag size={14} aria-hidden="true" style={{ color: '#C62B22' }} />
```

House conventions:

1. **`aria-hidden="true"` on decorative icons**; put an `aria-label` on icon-only buttons.
2. **`style={{ flex: 'none' }}`** in flex rows so the icon never squashes.
3. **Sizes:** 10–11px inline markers · 13–16px buttons/chips · 19px tile chips · 22px section-header chips.
   (Sizing is font-size based, so wide glyphs keep their natural aspect ratio.)
4. **Icon chip pattern** (tinted square behind a featured icon):
   ```jsx
   <span style={{ width: 40, height: 40, flex: 'none', borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: color + '1a', color }}>
     <Icon size={19} aria-hidden="true" />
   </span>
   ```
   For brand-red chips: `background: 'rgba(var(--accent-rgb),0.1)', color: 'var(--accent)'`.
5. **One collection only** — never mix in other icon sets or emoji as UI icons.

---

## 4 · What to do to add a new icon to the website

1. **Find it** at <https://fontawesome.com/icons> — filter **Free**, prefer **regular** (outline)
   when available for utility icons, **solid** otherwise.
2. **Register it in `src/components/fa.jsx`** — import the `fa*` icon from
   `@fortawesome/free-solid-svg-icons` or `free-regular-svg-icons` and add one line:
   ```jsx
   export const QrCode = make(faQrcode, 'QrCode');
   ```
3. **Import it from `fa.jsx`** in your screen/component and render with the conventions above.
4. **No install step** — the packages are already dependencies. (Pro styles like *light/thin*
   would need a Font Awesome Pro licence + kit package; Free solid/regular is the standard here.)
5. **Build to verify:** `npm run build`.

### Where icons are registered for common cases

| You want to… | Edit this |
|---|---|
| Add/point any icon at a Font Awesome glyph | `src/components/fa.jsx` (single mapping file) |
| New **order status** icon/colour/description | `STATUS_ICONS` / `STATUS_COLORS` / `STATUS_DESCS` in `src/screens/Home.jsx` |
| Map a new **timeline event** wording to an icon | `timelineIcon()` in `src/screens/OrderDetails.jsx` |
| **Bottom-nav tab** icon | `navTabs` in `src/components/TabBar.jsx` |
| **Order type** icon + colour | `NEW_ORDER_TYPES` in `src/components/NewOrderMenu.jsx` |
| **Top-bar control** | `src/components/TopBar.jsx` (see `TourButton` / `LanguageMenu`) |

---

## 5 · Every icon in use (app name → Font Awesome glyph → where)

The app keeps its own stable names in `fa.jsx`; the table shows the Font Awesome glyph behind each.

| App name | FA glyph (style) | Used in |
|---|---|---|
| AlertTriangle / TriangleAlert | `triangle-exclamation` (solid) | Dashboard warning banner · packaging mismatch dialog |
| ArrowDown / ArrowUp / ArrowUpDown | `arrow-down` / `arrow-up` / `arrows-up-down` (solid) | Orders sort headers |
| ArrowRight | `arrow-right` (solid) | Orders route arrow · dashboard rows · getting-started/welcome CTAs |
| BadgeCheck | `circle-check` (solid) | Return-Completed status tile · refund timeline icon |
| Bell | `bell` (regular) | Top bar notifications |
| Boxes | `boxes-stacked` (solid) | legacy bulk meta (unreachable; removal candidate) |
| CalendarDays | `calendar-days` (regular) | PLACED filter trigger |
| Camera | `camera` (solid) | capture still / take photo (3 screens) |
| Check | `check` (solid) | done/selected marks app-wide (menus, scan circles, hash lines, type radio…) |
| ChevronDown/Left/Right/Up | `chevron-*` (solid) | menus, back/next, drill-throughs, open/close states |
| CircleCheck | `circle-check` (regular) | Completed stat · Delivered tile · all-clear line |
| Compass | `compass` (regular) | getting-started tour step |
| Download | `download` (solid) | Export CSV |
| FastForward / Rewind | `forward` / `backward` (solid) | player ±10s |
| FileSearch | `magnifying-glass-chart` (solid) | welcome search feature · search empty state |
| FileText | `file-lines` (regular) | Ready-to-Pack tile · draft/challan timeline |
| Flag | `flag` (solid) | flag markers app-wide |
| Gauge | `gauge-high` (solid) | Order-summary header chip |
| Gem | `gem` (regular) | item thumbnails + item rows |
| Gift | `gift` (solid) | gifts in the create form |
| History | `clock-rotate-left` (solid) | UPDATED cell · retention pill |
| Inbox | `inbox` (solid) | Receiving tile · receive timeline/empty state |
| Languages | `language` (solid) | top-bar language selector |
| LayoutGrid | `table-cells-large` (solid) | Overview nav tab |
| ListChecks | `list-check` (solid) | Orders-by-status header chip |
| Lock | `lock` (solid) | recorded/read-only markers |
| LogOut / Settings / User | `right-from-bracket` / `gear` (solid) / `user` (regular) | profile menu |
| MapPin | `location-dot` (solid) | in-transit route line |
| MonitorPlay | `desktop` (solid) | getting-started live-station step |
| Package | `box` (solid) | nav Packaging · widget/stat/status icons · pack timeline |
| PackageCheck | `clipboard-check` (solid) | Received tile |
| PackageOpen | `box-open` (solid) | Return-Received tile |
| PackagePlus | `boxes-packing` (solid) | create-order header + popup chips |
| Pause / Play | `pause` / `play` (solid) | players + sessions |
| Plus | `plus` (solid) | create triggers, add item, manual add |
| RefreshCw | `arrows-rotate` (solid) | Pull from Gati |
| RotateCcw | `rotate-left` (solid) | return tiles/timeline · re-record |
| ScanLine | `barcode` (solid) | manual SKU input |
| Search | `magnifying-glass` (solid) | search inputs |
| SearchX | `magnifying-glass-minus` (solid) | no-match empty state |
| Send | `paper-plane` (solid) | Out-for-delivery tile |
| ShieldCheck | `shield-halved` (solid) | SOC-2 pill |
| ShoppingCart | `cart-shopping` (solid) | e-commerce type · order-placed timeline |
| Sparkles | `wand-sparkles` (solid) | Test fill |
| Square | `stop` (solid) | record stop |
| SquarePen | `pen-to-square` (regular) | pencil edit |
| Trash2 | `trash-can` (regular) | remove rows |
| Truck | `truck-fast` (solid — matches the brand sheet) | nav Transfers · transfer/transit everywhere |
| Undo2 | `reply` (solid) | Return-In-Transit tile · pickup timeline |
| Video | `video` (solid) | video pills + timeline |
| WandSparkles | `wand-magic-sparkles` (solid) | Tour button |
| X | `xmark` (solid) | dismiss/close |
| **PackageIcon** *(custom)* | in-house SVG | login mock card · welcome brand circle |
