// Line-icon layer — the app's single icon source.
//
// Collection: Phosphor (https://phosphoricons.com) via @phosphor-icons/react,
// rendered at the "light" weight → pure 1.5px line icons matching the brand
// sheet. Each export keeps the name and prop shape the app has always used
// (size / style / aria-*), so call sites read the same.
//
// Brand rules (see docs/icons.md):
//   · featured icons carry the brand red  → color: 'var(--accent)'  (#AA182C)
//   · utility icons follow the text tones → inherit currentColor (default)
//   · status/condition icons take that status' colour (see STATUS_COLORS /
//     timelineTone) — never a fixed neutral
// Pass `tone="brand"` as a shorthand for the brand red.
import {
  Warning, ArrowDown as PArrowDown, ArrowUp as PArrowUp, ArrowsDownUp, ArrowRight as PArrowRight,
  SealCheck, Bell as PBell, Stack, CalendarDots, Camera as PCamera, Check as PCheck,
  CaretDown, CaretLeft, CaretRight, CaretUp, CheckCircle, Compass as PCompass,
  DownloadSimple, FastForward as PFastForward, Rewind as PRewind, FileMagnifyingGlass,
  FileText as PFileText, Flag as PFlag, Gauge as PGauge, Diamond, Gift as PGift,
  ClockCounterClockwise, Tray, Translate, SquaresFour, ListChecks as PListChecks,
  Lock as PLock, SignOut, MapPin as PMapPin, MonitorPlay as PMonitorPlay,
  Package as PPackage, Checks, BoxArrowDown, BoxArrowUp, Pause as PPause, Play as PPlay,
  Plus as PPlus, ArrowsClockwise, ArrowCounterClockwise, Barcode, MagnifyingGlass,
  MagnifyingGlassMinus, PaperPlaneTilt, GearSix, ShieldCheck as PShieldCheck,
  ShoppingCart as PShoppingCart, Sparkle, Stop, PencilSimpleLine, Trash as PTrash,
  Truck as PTruck, ArrowUUpLeft, User as PUser, VideoCamera, MagicWand, X as PX,
} from '@phosphor-icons/react';

// Compat factory: line weight is fixed app-wide; strokeWidth/fill from older
// APIs are accepted and ignored so call sites never break.
const make = (P, name) => {
  function Icon({ size = 24, tone, style, strokeWidth, fill, ...rest }) {
    return <P size={size} weight="light" style={tone === 'brand' ? { color: 'var(--accent)', ...style } : style} {...rest} />;
  }
  Icon.displayName = name;
  return Icon;
};

export const AlertTriangle = make(Warning, 'AlertTriangle');
export const TriangleAlert = make(Warning, 'TriangleAlert');
export const ArrowDown = make(PArrowDown, 'ArrowDown');
export const ArrowUp = make(PArrowUp, 'ArrowUp');
export const ArrowUpDown = make(ArrowsDownUp, 'ArrowUpDown');
export const ArrowRight = make(PArrowRight, 'ArrowRight');
export const BadgeCheck = make(SealCheck, 'BadgeCheck');
export const Bell = make(PBell, 'Bell');
export const Boxes = make(Stack, 'Boxes');
export const CalendarDays = make(CalendarDots, 'CalendarDays');
export const Camera = make(PCamera, 'Camera');
export const Check = make(PCheck, 'Check');
export const ChevronDown = make(CaretDown, 'ChevronDown');
export const ChevronLeft = make(CaretLeft, 'ChevronLeft');
export const ChevronRight = make(CaretRight, 'ChevronRight');
export const ChevronUp = make(CaretUp, 'ChevronUp');
export const CircleCheck = make(CheckCircle, 'CircleCheck');
export const Compass = make(PCompass, 'Compass');
export const Download = make(DownloadSimple, 'Download');
export const FastForward = make(PFastForward, 'FastForward');
export const Rewind = make(PRewind, 'Rewind');
export const FileSearch = make(FileMagnifyingGlass, 'FileSearch');
export const FileText = make(PFileText, 'FileText');
export const Flag = make(PFlag, 'Flag');
export const Gauge = make(PGauge, 'Gauge');
export const Gem = make(Diamond, 'Gem');
export const Gift = make(PGift, 'Gift');
export const History = make(ClockCounterClockwise, 'History');
export const Inbox = make(Tray, 'Inbox');
export const Languages = make(Translate, 'Languages');
export const LayoutGrid = make(SquaresFour, 'LayoutGrid');
export const ListChecks = make(PListChecks, 'ListChecks');
export const Lock = make(PLock, 'Lock');
export const LogOut = make(SignOut, 'LogOut');
export const MapPin = make(PMapPin, 'MapPin');
export const MonitorPlay = make(PMonitorPlay, 'MonitorPlay');
export const Package = make(PPackage, 'Package');
export const PackageCheck = make(Checks, 'PackageCheck');
export const PackageOpen = make(BoxArrowDown, 'PackageOpen');
export const PackagePlus = make(BoxArrowUp, 'PackagePlus');
export const Pause = make(PPause, 'Pause');
export const Play = make(PPlay, 'Play');
export const Plus = make(PPlus, 'Plus');
export const RefreshCw = make(ArrowsClockwise, 'RefreshCw');
export const RotateCcw = make(ArrowCounterClockwise, 'RotateCcw');
export const ScanLine = make(Barcode, 'ScanLine');
export const Search = make(MagnifyingGlass, 'Search');
export const SearchX = make(MagnifyingGlassMinus, 'SearchX');
export const Send = make(PaperPlaneTilt, 'Send');
export const Settings = make(GearSix, 'Settings');
export const ShieldCheck = make(PShieldCheck, 'ShieldCheck');
export const ShoppingCart = make(PShoppingCart, 'ShoppingCart');
export const Sparkles = make(Sparkle, 'Sparkles');
export const Square = make(Stop, 'Square');
export const SquarePen = make(PencilSimpleLine, 'SquarePen');
export const Trash2 = make(PTrash, 'Trash2');
export const Truck = make(PTruck, 'Truck');
export const Undo2 = make(ArrowUUpLeft, 'Undo2');
export const User = make(PUser, 'User');
export const Video = make(VideoCamera, 'Video');
export const WandSparkles = make(MagicWand, 'WandSparkles');
export const X = make(PX, 'X');
