# Icon system — reference & how-to

Every UI icon in this app is a **line icon** from **one collection: [Phosphor](https://phosphoricons.com)**,
rendered at the **bold** weight (2.5px strokes — clearly visible line icons), plus a single
in-house brand glyph. This doc covers the collection, the brand colour rules, every icon in use,
how to use icons in code, and exactly what to do to add a new one.

---

## 1 · The collection

| | |
|---|---|
| Collection | **Phosphor** — open source (MIT), 1,500+ glyphs, every one available as a line icon |
| Package | `@phosphor-icons/react` — installed (see `package.json`) |
| Weight | **`bold`** everywhere — 2.5px line icons that stay clearly visible at small sizes, set once in the app layer. (Other weights — thin/light/regular/duotone/fill — exist but are not used; line only.) |
| Delivery | Tree-shaken SVG React components — only imported icons ship in the bundle. No CDN, no icon font, no stylesheet. |
| App entry point | **`src/components/line-icons.jsx`** — the single place icons are imported and re-exported as app components. Screens/components import from here, never from Phosphor directly. |
| Browse / search | <https://phosphoricons.com> — search, note the PascalCase name (`magnifying-glass` → `MagnifyingGlass`) |

**Custom icon:** `PackageIcon` (brand package glyph) in `src/components/icons.jsx` — login mock card
and welcome screen. **Brand image (not an icon):** `public/assets/mayave-logo.png`; the favicon is
the uploaded brand mark with a dark-scheme media query.

---

## 2 · Icon colours — brand, status & condition

From the brand sheet, with the app's tokens:

| Role | Hex | App token | Applied to |
|---|---|---|---|
| **Primary / brand red** | `#AA182C` | `var(--accent)` | **Featured icons** — section-header chips, primary actions, bell, Tour, nav-active states. Shorthand: `tone="brand"`. |
| Primary text | `#171717` | `var(--ink)` / `var(--ink-2)` | Utility icons beside dark text — chevrons, sort arrows, calendar, toolbar controls |
| Secondary text | `#5D5D5D` | `var(--mute)` / `var(--mute-2)` | Quiet inline utility icons |
| Backgrounds | `#FFFFFF` / `#EAEAEA` / `#F4F4F4` | `--surface` / `--surface-soft` | Icon chips sit on these; brand chips use `rgba(var(--accent-rgb),0.1)` |

**Status-wise & condition-wise colours (rule):** an icon that represents a *status* or a
*condition* always takes **that status' colour**, never a fixed neutral:

- **Overview status tiles** — each icon uses its status colour from `STATUS_COLORS`
  (`src/screens/Home.jsx`): draft `#94A3B8`, packed `#3B82F6`, transit `#F59E0B`,
  receiving `#8B5CF6`, received `#10B981`, delivery `#06B6D4`, delivered `#22C55E`,
  returning `#F97316`, return-transit `#FB923C`, return-received `#A855F7`,
  returned `#14B8A6`, flagged `#DC2626`.
- **Order timeline** — every event node is coloured by `timelineTone()`
  (`src/screens/OrderDetails.jsx`): flag red, refund teal, return orange, delivered green,
  transit amber, placed blue, received green, draft grey; pack/record events carry the brand red.
- **Item condition** — the item glyph in detection thumbs takes the condition tone
  (`condTone`): verified green, damaged/disputed/missing red, pending amber.
- **Session scan states** — scanned green check, unknown red `!`, waiting outline.
- Semantic constants stay: verified green `#0E8A50`, danger red `#C62B22`; icons on filled
  accent buttons render white via `currentColor`.

---

## 3 · How to use an icon

Import **from `src/components/line-icons.jsx`** (never from `@phosphor-icons/react` directly)
and render with a size:

```jsx
import { Truck, Flag } from '../components/line-icons.jsx';

<Truck size={16} aria-hidden="true" style={{ flex: 'none' }} />
<Truck size={16} tone="brand" />                        // brand red shorthand
<Flag size={14} aria-hidden="true" style={{ color: '#C62B22' }} />
```

House conventions:

1. **`aria-hidden="true"` on decorative icons**; `aria-label` on icon-only buttons.
2. **`style={{ flex: 'none' }}`** in flex rows so the icon never squashes.
3. **Sizes:** 10–11px inline markers · 13–16px buttons/chips · 19px tile chips · 22px section-header chips.
4. **Icon chip pattern** (tinted square behind a featured/status icon):
   ```jsx
   <span style={{ width: 40, height: 40, flex: 'none', borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: color + '1a', color }}>
     <Icon size={19} aria-hidden="true" />
   </span>
   ```
5. **Line icons only, one collection only** — never mix in filled icons, other sets, or emoji.
   The `bold` weight is fixed inside `line-icons.jsx`; don't override it per call site.

---

## 4 · What to do to add a new icon to the website

1. **Find it** at <https://phosphoricons.com> (every glyph has a line form — pick by meaning).
2. **Register it in `src/components/line-icons.jsx`** — import the Phosphor component and add one line:
   ```jsx
   import { QrCode as PQrCode } from '@phosphor-icons/react';
   export const QrCode = make(PQrCode, 'QrCode');
   ```
3. **Import it from `line-icons.jsx`** in your screen/component and render with the conventions above.
4. **Colour it by role:** featured → `tone="brand"`; status/condition → the status' colour;
   utility → let it inherit the text colour.
5. **No install step** — the package is already a dependency. **Build to verify:** `npm run build`.

### Where icons are registered for common cases

| You want to… | Edit this |
|---|---|
| Point any app icon at a Phosphor glyph | `src/components/line-icons.jsx` (single mapping file) |
| New **order status** icon/colour/description | `STATUS_ICONS` / `STATUS_COLORS` / `STATUS_DESCS` in `src/screens/Home.jsx` |
| New **timeline event** icon or colour | `timelineIcon()` / `timelineTone()` in `src/screens/OrderDetails.jsx` |
| **Bottom-nav tab** icon | `navTabs` in `src/components/TabBar.jsx` |
| **Order type** icon + colour | `NEW_ORDER_TYPES` in `src/components/NewOrderMenu.jsx` |
| **Top-bar control** | `src/components/TopBar.jsx` (see `TourButton` / `LanguageMenu`) |

---

## 5 · Every icon in use (app name → Phosphor glyph → where)

The app keeps its own stable names in `line-icons.jsx`; the table shows the Phosphor glyph behind each.

| App name | Phosphor glyph | Used in |
|---|---|---|
| AlertTriangle / TriangleAlert | `Warning` | dashboard warning banner · packaging mismatch dialog |
| ArrowDown / ArrowUp / ArrowUpDown | `ArrowDown` / `ArrowUp` / `ArrowsDownUp` | orders sort headers |
| ArrowRight | `ArrowRight` | orders route arrow · dashboard rows · getting-started/welcome CTAs |
| BadgeCheck | `SealCheck` | Return-Completed tile · refund timeline |
| Bell | `Bell` | top-bar notifications |
| Boxes | `Stack` | legacy bulk meta (unreachable; removal candidate) |
| CalendarDays | `CalendarDots` | PLACED filter trigger |
| Camera | `Camera` | capture still / take photo (3 screens) |
| Check | `Check` | done/selected marks app-wide |
| ChevronDown/Left/Right/Up | `CaretDown/Left/Right/Up` | menus, back/next, drill-throughs |
| CircleCheck | `CheckCircle` | Completed stat · Delivered tile · all-clear line |
| Compass | `Compass` | getting-started tour step |
| Download | `DownloadSimple` | Export CSV |
| FastForward / Rewind | `FastForward` / `Rewind` | player ±10s |
| FileSearch | `FileMagnifyingGlass` | welcome search feature · search empty state |
| FileText | `FileText` | Ready-to-Pack tile · draft/challan timeline |
| Flag | `Flag` | flag markers app-wide |
| Gauge | `Gauge` | Order-summary header chip |
| Gem | `Diamond` | item thumbnails + item rows |
| Gift | `Gift` | gifts in the create form |
| History | `ClockCounterClockwise` | UPDATED cell · retention pill |
| Inbox | `Tray` | Receiving tile · receive timeline/empty state |
| Languages | `Translate` | top-bar language selector |
| LayoutGrid | `SquaresFour` | Overview nav tab |
| ListChecks | `ListChecks` | Orders-by-status header chip |
| Lock | `Lock` | recorded/read-only markers |
| LogOut / Settings / User | `SignOut` / `GearSix` / `User` | profile menu |
| MapPin | `MapPin` | in-transit route line |
| MonitorPlay | `MonitorPlay` | getting-started live-station step |
| Package | `Package` | nav Packaging · widget/stat/status icons · pack timeline |
| PackageCheck | `Checks` | Received tile |
| PackageOpen | `BoxArrowDown` | Return-Received tile |
| PackagePlus | `BoxArrowUp` | create-order header + popup chips |
| Pause / Play / Plus | `Pause` / `Play` / `Plus` | players, sessions, create/add actions |
| RefreshCw | `ArrowsClockwise` | Pull from Gati |
| RotateCcw | `ArrowCounterClockwise` | return tiles/timeline · re-record |
| ScanLine | `Barcode` | manual SKU input |
| Search / SearchX | `MagnifyingGlass` / `MagnifyingGlassMinus` | search inputs · no-match empty state |
| Send | `PaperPlaneTilt` | Out-for-delivery tile |
| ShieldCheck | `ShieldCheck` | SOC-2 pill |
| ShoppingCart | `ShoppingCart` | e-commerce type · order-placed timeline |
| Sparkles | `Sparkle` | Test fill |
| Square | `Stop` | record stop |
| SquarePen | `PencilSimpleLine` | pencil edit |
| Trash2 | `Trash` | remove rows |
| Truck | `Truck` | nav Transfers · transfer/transit everywhere |
| Undo2 | `ArrowUUpLeft` | Return-In-Transit tile · pickup timeline |
| Video | `VideoCamera` | video pills + timeline |
| WandSparkles | `MagicWand` | Tour button |
| X | `X` | dismiss/close |
| **PackageIcon** *(custom)* | in-house SVG | login mock card · welcome brand circle |
