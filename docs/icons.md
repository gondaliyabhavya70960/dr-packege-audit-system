# Icon system — reference & how-to

Every UI icon in this app is a **line icon** from **one collection: [Phosphor](https://phosphoricons.com)**,
rendered at the **regular** weight (2px strokes), plus a single
in-house brand glyph. This doc covers the collection, the brand colour rules, every icon in use,
how to use icons in code, and exactly what to do to add a new one.

---

## 1 · The collection

| | |
|---|---|
| Collection | **Phosphor** — open source (MIT), 1,500+ glyphs, every one available as a line icon |
| Package | `@phosphor-icons/react` — installed (see `package.json`) |
| Weight | **`regular`** everywhere — 2px line icons, set once in the app layer. (Other weights — thin/light/bold/duotone/fill — exist but are not used; line only.) |
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
3. **Sizes — pick by slot** (these are the sizes actually used; match the slot, don't invent):

   | Slot | Icon size | Container |
   |---|---|---|
   | Section-header chips (widget/card headers) | **22px** | 44px rounded square |
   | Dialog header icon (mismatch alert) | **20px** | 42px circle |
   | Status / summary / create tile chips | **19px** | 40–44px rounded square |
   | Empty states (`EmptyState`) | **26px** | 56px circle |
   | Playback overlay play | **22px** | feed overlay button |
   | Bell (top bar) | **18px** | 42px round button |
   | Search-screen input | **17px** | input adornment |
   | Buttons & menu rows / inputs / nav tabs | **15–16px** | text-height controls |
   | Timeline event nodes | **14px** | 30px rounded square |
   | Trust pills / small labels / journey chips | **13–14px** | pill text |
   | Menu open/close carets, sort arrows, prev-clip controls | **12–13px** | inline |
   | Inline micro markers (hash ✓, CLIP pill, UPDATED cell, read-only lock) | **11px** | inline mono text |
   | Record button | **15px** (13px small variant) | round CTA |

4. **Icon chip pattern** (tinted square behind a featured/status icon):
   ```jsx
   <span style={{ width: 40, height: 40, flex: 'none', borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: color + '1a', color }}>
     <Icon size={19} aria-hidden="true" />
   </span>
   ```
5. **Line icons only, one collection only** — never mix in filled icons, other sets, or emoji.
   The `regular` (2px) weight is fixed inside `line-icons.jsx`; don't override it per call site.

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
| AlertTriangle / TriangleAlert | `Warning` | dashboard warning banner **17px** · packaging mismatch dialog header **20px** |
| ArrowDown / ArrowUp / ArrowUpDown | `ArrowDown` / `ArrowUp` / `ArrowsDownUp` | orders sort headers **12px** |
| ArrowRight | `ArrowRight` | orders route arrow **12px** · dashboard rows **16px** · getting-started steps **15px** · welcome CTA **16px** |
| BadgeCheck | `SealCheck` | Return-Completed tile **19px** · refund timeline node **14px** |
| Bell | `Bell` | top-bar notifications **18px** |
| Boxes | `Stack` | legacy bulk meta (unreachable; removal candidate) |
| CalendarDays | `CalendarDots` | PLACED filter trigger **17px** |
| Camera | `Camera` | capture still / take photo (3 screens) **16px** |
| Check | `Check` | hash-verified lines & remark-added **11px** · login mock ticks & scan circles **13px** · menu/language selected **14px** · login banner & type-tile radio **15px** (11px inside the radio dot) · session "item detected" flash **18px** |
| ChevronDown/Left/Right/Up | `CaretDown/Left/Right/Up` | open/close carets **13px** · back/next & row chevrons **14–15px** · select triggers **16px** · create tiles **18px** · order-details back circle **19px** |
| CircleCheck | `CheckCircle` | all-clear line **15px** · Completed stat & Delivered tile **19px** · delivered timeline node **14px** |
| Compass | `Compass` | getting-started tour step **15px** |
| Download | `DownloadSimple` | Export CSV **15px** |
| FastForward / Rewind | `FastForward` / `Rewind` | player ±10s **16px** |
| FileSearch | `FileMagnifyingGlass` | welcome search feature **16px** · search empty state **26px** |
| FileText | `FileText` | Ready-to-Pack tile **19px** · draft/challan timeline node **14px** |
| Flag | `Flag` | session row flag toggles **13px** · needs-attention & save-&-flag **14px** · flagged-items card **15px** · remarks popup title **17px** · Flagged tile **19px** |
| Gauge | `Gauge` | Order-summary header chip **22px** |
| Gem | `Diamond` | pack session rows **15px** · create-form item rows **16px** · detection thumbs **19px** (captured thumbs scale at 46% of thumb) |
| Gift | `Gift` | Add-gift button **13px** · gifts heading **14px** · gift rows **15px** |
| History | `ClockCounterClockwise` | UPDATED cell **11px** · retention trust pill **14px** |
| Inbox | `Tray` | Receiving tile **19px** · welcome feature **16px** · receive timeline node **14px** · empty state **26px** |
| Languages | `Translate` | top-bar language selector **15px** |
| LayoutGrid | `SquaresFour` | Overview nav tab **16px** |
| ListChecks | `ListChecks` | Orders-by-status header chip **22px** |
| Lock | `Lock` | recorded/read-only chip **11px** · recorded tab marker **12px** |
| LogOut / Settings / User | `SignOut` / `GearSix` / `User` | profile menu rows **16px** |
| MapPin | `MapPin` | in-transit route line **15px** |
| MonitorPlay | `MonitorPlay` | getting-started live-station step **15px** |
| Package | `Package` | nav Packaging tab **16px** · widget header **22px** · Total-orders stat & Packed tile **19px** · pack timeline node **14px** · empty state **26px** |
| PackageCheck | `Checks` | Received tile **19px** |
| PackageOpen | `BoxArrowDown` | Return-Received tile **19px** |
| PackagePlus | `BoxArrowUp` | create-order header + popup chips **22px** |
| Pause / Play / Plus | `Pause` / `Play` / `Plus` | playback overlay **22px** · record button & clip buttons **15px** (13px small) · keep-recording & add item/manual add **14px** · create trigger **16px** · prev-clip **12–13px** |
| RefreshCw | `ArrowsClockwise` | Pull from Gati **15px** |
| RotateCcw | `ArrowCounterClockwise` | Re-record **15px** · return tile **19px** · return timeline node **14px** · empty state **26px** |
| ScanLine | `Barcode` | manual SKU input **15px** |
| Search / SearchX | `MagnifyingGlass` / `MagnifyingGlassMinus` | list search inputs **16px** · search screen **17px** · no-match empty state **26px** |
| Send | `PaperPlaneTilt` | Out-for-delivery tile **19px** |
| ShieldCheck | `ShieldCheck` | SOC-2 trust pill **14px** |
| ShoppingCart | `ShoppingCart` | e-commerce type tiles/menu **19px** · order-placed timeline node **14px** |
| Sparkles | `Sparkle` | Test fill **14px** |
| Square | `Stop` | record stop **15px** (13px small) |
| SquarePen | `PencilSimpleLine` | pencil edit **16px** |
| Trash2 | `Trash` | remove item/gift rows **14px** |
| Truck | `Truck` | nav Transfers tab **16px** · widget header **22px** · In-transit stat & tile **19px** · transit status chip **11px** · view-tab marker **13px** · journey/dispatch timeline nodes **14px** |
| Undo2 | `ArrowUUpLeft` | Return-In-Transit tile **19px** · pickup timeline node **14px** |
| Video | `VideoCamera` | tamper-evident trust pill **14px** · CLIP pills **11px** · recording timeline node **14px** |
| WandSparkles | `MagicWand` | Tour button **16px** |
| X | `X` | getting-started dismiss **16px** · tour close **17px** · prev-clip collapse **13px** |
| **PackageIcon** *(custom)* | in-house SVG | login mock card **20px** · welcome brand circle **30px** |
