// Font Awesome icon layer — the app's single icon source.
//
// Collection: Font Awesome 6 Free (solid + regular), rendered through
// @fortawesome/react-fontawesome. Each export keeps the name and prop shape
// the app already uses (size / style / aria-*), so call sites read the same.
//
// Brand rules (see docs/icons.md):
//   · featured icons carry the brand red  → color: 'var(--accent)'  (#AA182C)
//   · utility icons follow the text tones → inherit currentColor (default)
// Pass `tone="brand"` as a shorthand for the brand red.
import { config } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTriangleExclamation, faArrowDown, faArrowUp, faArrowsUpDown, faArrowRight,
  faBoxesStacked, faCamera, faCheck, faChevronDown, faChevronLeft, faChevronRight,
  faChevronUp, faDownload, faForward, faBackward, faMagnifyingGlassChart, faFlag,
  faGaugeHigh, faGift, faClockRotateLeft, faInbox, faLanguage, faTableCellsLarge,
  faListCheck, faLock, faRightFromBracket, faLocationDot, faDesktop, faBox,
  faClipboardCheck, faBoxOpen, faBoxesPacking, faPause, faPlay, faPlus,
  faArrowsRotate, faRotateLeft, faBarcode, faMagnifyingGlass, faMagnifyingGlassMinus,
  faPaperPlane, faGear, faShieldHalved, faCartShopping, faWandSparkles,
  faWandMagicSparkles, faStop, faTruckFast, faReply, faVideo, faXmark,
  faCircleCheck as faCircleCheckSolid,
} from '@fortawesome/free-solid-svg-icons';
import {
  faBell, faCircleCheck, faCompass, faFileLines, faGem, faUser, faPenToSquare,
  faTrashCan, faCalendarDays,
} from '@fortawesome/free-regular-svg-icons';

// the stylesheet is imported once in app/layout.jsx; stop the runtime re-inject
config.autoAddCss = false;

// Compat factory: FA glyphs are filled (no stroke), size follows font-size so
// non-square glyphs keep their aspect ratio. strokeWidth/fill from the old API
// are accepted and ignored.
const make = (icon, name) => {
  function Icon({ size = 24, tone, style, strokeWidth, fill, ...rest }) {
    return <FontAwesomeIcon icon={icon} style={{ fontSize: size * 0.92, ...(tone === 'brand' ? { color: 'var(--accent)' } : null), ...style }} {...rest} />;
  }
  Icon.displayName = name;
  return Icon;
};

// ---- solid (filled) --------------------------------------------------------
export const AlertTriangle = make(faTriangleExclamation, 'AlertTriangle');
export const TriangleAlert = make(faTriangleExclamation, 'TriangleAlert');
export const ArrowDown = make(faArrowDown, 'ArrowDown');
export const ArrowUp = make(faArrowUp, 'ArrowUp');
export const ArrowUpDown = make(faArrowsUpDown, 'ArrowUpDown');
export const ArrowRight = make(faArrowRight, 'ArrowRight');
export const BadgeCheck = make(faCircleCheckSolid, 'BadgeCheck');
export const Boxes = make(faBoxesStacked, 'Boxes');
export const Camera = make(faCamera, 'Camera');
export const Check = make(faCheck, 'Check');
export const ChevronDown = make(faChevronDown, 'ChevronDown');
export const ChevronLeft = make(faChevronLeft, 'ChevronLeft');
export const ChevronRight = make(faChevronRight, 'ChevronRight');
export const ChevronUp = make(faChevronUp, 'ChevronUp');
export const Download = make(faDownload, 'Download');
export const FastForward = make(faForward, 'FastForward');
export const Rewind = make(faBackward, 'Rewind');
export const FileSearch = make(faMagnifyingGlassChart, 'FileSearch');
export const Flag = make(faFlag, 'Flag');
export const Gauge = make(faGaugeHigh, 'Gauge');
export const Gift = make(faGift, 'Gift');
export const History = make(faClockRotateLeft, 'History');
export const Inbox = make(faInbox, 'Inbox');
export const Languages = make(faLanguage, 'Languages');
export const LayoutGrid = make(faTableCellsLarge, 'LayoutGrid');
export const ListChecks = make(faListCheck, 'ListChecks');
export const Lock = make(faLock, 'Lock');
export const LogOut = make(faRightFromBracket, 'LogOut');
export const MapPin = make(faLocationDot, 'MapPin');
export const MonitorPlay = make(faDesktop, 'MonitorPlay');
export const Package = make(faBox, 'Package');
export const PackageCheck = make(faClipboardCheck, 'PackageCheck');
export const PackageOpen = make(faBoxOpen, 'PackageOpen');
export const PackagePlus = make(faBoxesPacking, 'PackagePlus');
export const Pause = make(faPause, 'Pause');
export const Play = make(faPlay, 'Play');
export const Plus = make(faPlus, 'Plus');
export const RefreshCw = make(faArrowsRotate, 'RefreshCw');
export const RotateCcw = make(faRotateLeft, 'RotateCcw');
export const ScanLine = make(faBarcode, 'ScanLine');
export const Search = make(faMagnifyingGlass, 'Search');
export const SearchX = make(faMagnifyingGlassMinus, 'SearchX');
export const Send = make(faPaperPlane, 'Send');
export const Settings = make(faGear, 'Settings');
export const ShieldCheck = make(faShieldHalved, 'ShieldCheck');
export const ShoppingCart = make(faCartShopping, 'ShoppingCart');
export const Sparkles = make(faWandSparkles, 'Sparkles');
export const Square = make(faStop, 'Square');
export const Truck = make(faTruckFast, 'Truck');
export const Undo2 = make(faReply, 'Undo2');
export const Video = make(faVideo, 'Video');
export const WandSparkles = make(faWandMagicSparkles, 'WandSparkles');
export const X = make(faXmark, 'X');

// ---- regular (outline, matching the brand sheet's thin utility icons) ------
export const Bell = make(faBell, 'Bell');
export const CalendarDays = make(faCalendarDays, 'CalendarDays');
export const CircleCheck = make(faCircleCheck, 'CircleCheck');
export const Compass = make(faCompass, 'Compass');
export const FileText = make(faFileLines, 'FileText');
export const Gem = make(faGem, 'Gem');
export const SquarePen = make(faPenToSquare, 'SquarePen');
export const Trash2 = make(faTrashCan, 'Trash2');
export const User = make(faUser, 'User');
