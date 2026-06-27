'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { initialState, tourDefs, nowStamp } from './data.js';import Login from './screens/Login.jsx';
import KioskHome from './screens/KioskHome.jsx';
import PackRecord from './screens/PackRecord.jsx';
import Receiving from './screens/Receiving.jsx';
import ReturnInspection from './screens/ReturnInspection.jsx';
import SearchPlayback from './screens/SearchPlayback.jsx';
import Dashboard from './screens/Dashboard.jsx';
import UsersConfig from './screens/UsersConfig.jsx';
import Orders from './screens/Orders.jsx';
import OrderDetails from './screens/OrderDetails.jsx';
import Home from './screens/Home.jsx';
import { emptyCustomOrder } from './data.js';
import TopBar from './components/TopBar.jsx';
import TabBar from './components/TabBar.jsx';
import BackConfirm from './components/BackConfirm.jsx';
import LeaveConfirm from './components/LeaveConfirm.jsx';
import CreateOrderModal from './components/CreateOrderModal.jsx';
import Tour from './components/Tour.jsx';
import Toast from './components/Toast.jsx';

// the heavy side-by-side video player is only needed on demand — keep it out of
// the initial bundle.
const SideBySidePlayer = dynamic(() => import('./components/SideBySidePlayer.jsx'), { ssr: false });

const OPERATOR_SCREENS = ['kiosk', 'pack', 'recv', 'ret'];
const ADMIN_ONLY_SCREENS = ['search', 'dash-coverage', 'dash-consignment', 'dash-returns', 'dash-flagged', 'dash-stations', 'config'];
// available to both roles — rendered under whichever chrome matches the user
const SHARED_SCREENS = ['home', 'orders', 'order'];
const DASH_SCREENS = ['dash-coverage', 'dash-consignment', 'dash-returns', 'dash-flagged', 'dash-stations'];

// ---- URL <-> screen mapping (Next.js built-in routing) ----
// The app is a stateful client experience; we map its `screen` (+ orderId /
// listKind) to real routes so every surface has a shareable, SSR-able URL.
function pathToNav(pathname) {
  if (!pathname || pathname === '/') return { screen: 'login' };
  if (pathname === '/overview') return { screen: 'home' };
  if (pathname === '/packaging') return { screen: 'orders', listKind: 'packaging' };
  if (pathname === '/transfers') return { screen: 'orders', listKind: 'transfer' };
  if (pathname === '/kiosk') return { screen: 'kiosk' };
  if (pathname.startsWith('/session/')) {
    const mode = pathname.slice('/session/'.length);
    return { screen: ['pack', 'recv', 'ret'].includes(mode) ? mode : 'kiosk' };
  }
  if (pathname.startsWith('/orders/')) {
    const id = decodeURIComponent(pathname.slice('/orders/'.length));
    return { screen: 'order', orderId: id === 'new' ? '' : id };
  }
  if (pathname.startsWith('/admin/')) {
    const sec = pathname.slice('/admin/'.length);
    return { screen: sec === 'search' ? 'search' : sec === 'config' ? 'config' : 'dash-' + sec };
  }
  return { screen: 'login' };
}
function navToPath(s) {
  switch (s.screen) {
    case 'home': return '/overview';
    case 'orders': return s.listKind === 'transfer' ? '/transfers' : '/packaging';
    case 'order': return '/orders/' + (s.orderId ? encodeURIComponent(s.orderId) : 'new');
    case 'kiosk': return '/kiosk';
    case 'pack':
    case 'recv':
    case 'ret': return '/session/' + s.screen;
    case 'search': return '/admin/search';
    case 'config': return '/admin/config';
    case 'login': return '/';
    default: return s.screen && s.screen.startsWith('dash-') ? '/admin/' + s.screen.slice(5) : '/';
  }
}

export default function App() {
  const pathname = usePathname();
  const router = useRouter();
  // initialise the screen from the URL so SSR + first client render match (no hydration flash)
  const [s, setS] = useState(() => ({ ...initialState, ...pathToNav(pathname) }));
  const set = useCallback((patch) => setS((cur) => ({ ...cur, ...patch })), []);

  // latest state for timer/measure callbacks
  const sRef = useRef(s);
  sRef.current = s;

  // state -> URL: reflect the active screen in the address bar
  useEffect(() => {
    const path = navToPath(sRef.current);
    if (path !== pathname) router.push(path);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.screen, s.orderId, s.listKind]);

  // URL -> state: handle deep links and browser back/forward
  useEffect(() => {
    const nav = pathToNav(pathname);
    const cur = sRef.current;
    if (
      nav.screen !== cur.screen ||
      (nav.orderId !== undefined && nav.orderId !== cur.orderId) ||
      (nav.listKind !== undefined && nav.listKind !== cur.listKind)
    ) {
      set(nav);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toastT = useRef();
  const tourMeasureT = useRef();
  const tourAutoT = useRef();

  // 1s heartbeat: session recording timer + player sync-play progress
  useEffect(() => {
    const iv = setInterval(() => {
      setS((cur) => {
        const upd = {};
        const inSession = cur.screen === 'pack' || cur.screen === 'recv' || cur.screen === 'ret';
        const inOrderSession = cur.screen === 'order' && (cur.orderTab === 'pack' || cur.orderTab === 'recv' || cur.orderTab === 'ret');
        // only advance the session clock while recording is live (Start/Stop)
        if ((inSession || inOrderSession) && cur.recActive) upd.recSec = cur.recSec + 1;
        if (cur.playerOpen && cur.playing) upd.t = cur.t >= 100 ? 0 : Math.min(100, cur.t + 2);
        return Object.keys(upd).length ? { ...cur, ...upd } : cur;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const showToast = useCallback(
    (msg) => {
      clearTimeout(toastT.current);
      set({ toast: msg });
      toastT.current = setTimeout(() => set({ toast: '' }), 3200);
    },
    [set]
  );

  // Open a Pack / Receive / Return session for an id. `returnTo` decides where it
  // lives and where it returns: 'kiosk' (default — standalone full-screen session)
  // or 'order' (rendered inline as a tab on the single-order page).
  const openSession = useCallback(
    (kind, id, returnTo) => {
      if (!id) return;
      const nav =
        returnTo === 'order'
          ? { screen: 'order', orderTab: kind, sessionReturn: 'order', orderEditing: false, orderDraft: null, recActive: true }
          : { screen: kind, sessionReturn: 'kiosk', recActive: true };
      if (kind === 'pack') {
        set({
          ...nav,
          packId: id,
          recSec: 0,
          packStills: 0,
          packUnknown: false,
          packCond: 'pending',
          packItems: [
            { name: 'RING', sku: 'SKU 4471', need: 1, got: 0 },
            { name: 'PENDANT', sku: 'SKU 4472', need: 1, got: 0 },
            { name: 'BANGLE', sku: 'SKU 4480', need: 1, got: 0 },
          ],
          scanInput: '',
        });
      } else if (kind === 'recv') {
        set({
          ...nav,
          recvChallan: id,
          recSec: 0,
          recvRows: [
            { rfid: 'RFID-1021', name: 'ring · SKU 4471', state: 'awaiting' },
            { rfid: 'RFID-1022', name: 'pendant · SKU 4472', state: 'awaiting' },
            { rfid: 'RFID-1044', name: 'bangle · SKU 4480', state: 'awaiting' },
          ],
          scanInput: '',
        });
      } else {
        set({ ...nav, retId: id, recSec: 0, retStills: 0, retReason: null, retNeedReason: false, scanInput: '' });
      }
    },
    [set]
  );

  // When a session is run from inside an order (sessionReturn === 'order'), append the
  // outcome to that order's timeline so the Detail tab reflects what just happened.
  const logOrderEvent = useCallback((id, label) => {
    const st = sRef.current;
    if (st.sessionReturn !== 'order' || !id) return st.orders;
    return st.orders.map((o) =>
      o.id === id ? { ...o, timeline: [...o.timeline, { label, time: 'today', who: st.userLabel || 'station', clip: true }] } : o
    );
  }, []);

  const openPlayer = useCallback(
    (id, flagIdx, backTo) => {
      set({
        playerOpen: true,
        playerId: id,
        playerFlagIdx: flagIdx == null ? -1 : flagIdx,
        playing: false,
        t: 22,
        still: -1,
        playerBackTo: backTo || null,
      });
    },
    [set]
  );

  const measureTour = useCallback(() => {
    const d = tourDefs[sRef.current.tourStep];
    let el = document.querySelector('[data-tour="' + d.k + '"]');
    for (let i = 0; el && i < (d.up || 0); i++) el = el.parentElement;
    if (!el) {
      set({ tourRect: null });
      return;
    }
    const r = el.getBoundingClientRect();
    set({ tourRect: { t: r.top, l: r.left, w: r.width, h: r.height } });
  }, [set]);

  const endTour = useCallback(() => {
    try {
      localStorage.setItem('pa_tour_seen', '1');
    } catch (e) {
      /* storage unavailable */
    }
    set({ tourOpen: false, tourStep: 0, tourRect: null, screen: sRef.current.tourReturn || 'login' });
  }, [set]);

  const tourGo = useCallback(
    (i) => {
      if (i < 0) i = 0;
      if (i >= tourDefs.length) {
        endTour();
        return;
      }
      const d = tourDefs[i];
      if (d.s === 'pack') {
        if (sRef.current.screen !== 'pack') openSession('pack', 'ORD-10293');
      } else if (sRef.current.screen !== d.s) {
        set({ screen: d.s });
      }
      set({ tourOpen: true, tourStep: i, tourRect: null });
      clearTimeout(tourMeasureT.current);
      tourMeasureT.current = setTimeout(measureTour, 420);
    },
    [set, endTour, openSession, measureTour]
  );

  const openTour = useCallback(() => {
    set({ tourReturn: sRef.current.screen });
    tourGo(0);
  }, [set, tourGo]);

  // auto-start the tour on first visit
  useEffect(() => {
    try {
      if (!localStorage.getItem('pa_tour_seen')) tourAutoT.current = setTimeout(() => tourGo(0), 700);
    } catch (e) {
      /* storage unavailable */
    }
    return () => {
      clearTimeout(tourAutoT.current);
      clearTimeout(toastT.current);
      clearTimeout(tourMeasureT.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = useCallback(() => set({ screen: 'login', password: '', profileMenuOpen: false, adminMenuOpen: false }), [set]);

  const openOrder = useCallback((id) => set({ screen: 'order', orderId: id, orderTab: 'detail', orderEditing: false, orderDraft: null, adminMenuOpen: false }), [set]);
  const newCustomOrder = useCallback(() => set({ createOpen: true, orderDraft: emptyCustomOrder(), adminMenuOpen: false }), [set]);

  // append a remark (comment) to an order — username + timestamp + text,
  // surfaced on the order's Detail/overview thread.
  const addRemark = useCallback((id, text) => {
    const t = (text || '').trim();
    if (!t || !id) return;
    setS((cur) => ({
      ...cur,
      orders: cur.orders.map((o) =>
        o.id === id ? { ...o, remarks: [...(o.remarks || []), { text: t, who: cur.userLabel || 'operator', time: nowStamp() }] } : o
      ),
    }));
  }, []);

  // open one of the two working lists, clearing filters so the switch is predictable
  const openList = useCallback(
    (kind, status) => set({ screen: 'orders', listKind: kind, oStatus: status || 'all', oChannel: 'all', oDate: 'all', oq: '', oSel: [], adminMenuOpen: false }),
    [set]
  );

  const ctx = { s, set, showToast, openSession, logOrderEvent, openPlayer, openList, addRemark, tourGo, openTour, endTour, signOut, openOrder, newCustomOrder };

  const screen = s.screen;
  const isShared = SHARED_SCREENS.includes(screen);
  // shared screens follow the signed-in role's chrome; operators never see admin chrome
  const isOpSurface = OPERATOR_SCREENS.includes(screen) || (isShared && s.role !== 'admin');
  const isAdminSurface = ADMIN_ONLY_SCREENS.includes(screen) || (isShared && s.role === 'admin');

  const sharedScreens = (
    <>
      {screen === 'home' && <Home ctx={ctx} />}
      {screen === 'orders' && <Orders ctx={ctx} />}
      {screen === 'order' && <OrderDetails ctx={ctx} />}
    </>
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'transparent',
        color: '#1B1D21',
        fontFamily: "-apple-system,BlinkMacSystemFont,'Figtree','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif",
        position: 'relative',
      }}
    >
      {screen === 'login' && <Login ctx={ctx} />}

      {isOpSurface && (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <TopBar ctx={ctx} variant="operator" />
          <div style={{ flex: 1, minHeight: 0, position: 'relative', paddingBottom: 74, overflow: 'auto' }}>
            {screen === 'kiosk' && <KioskHome ctx={ctx} />}
            {screen === 'pack' && <PackRecord ctx={ctx} />}
            {screen === 'recv' && <Receiving ctx={ctx} />}
            {screen === 'ret' && <ReturnInspection ctx={ctx} />}
            {sharedScreens}
          </div>
        </div>
      )}

      {isAdminSurface && (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <TopBar ctx={ctx} variant="admin" />
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto', paddingBottom: 120 }}>
            {screen === 'search' && <SearchPlayback ctx={ctx} />}
            {DASH_SCREENS.includes(screen) && <Dashboard ctx={ctx} />}
            {screen === 'config' && <UsersConfig ctx={ctx} />}
            {sharedScreens}
          </div>
        </div>
      )}

      {screen !== 'login' && <TabBar ctx={ctx} />}
      {s.playerOpen && <SideBySidePlayer ctx={ctx} />}
      {s.backConfirm && <BackConfirm ctx={ctx} />}
      {s.leaveConfirm && <LeaveConfirm ctx={ctx} />}
      {s.createOpen && <CreateOrderModal ctx={ctx} />}
      {s.tourOpen && <Tour ctx={ctx} />}
      {s.toast && <Toast msg={s.toast} />}
    </div>
  );
}
