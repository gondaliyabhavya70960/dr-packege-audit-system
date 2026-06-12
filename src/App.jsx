import { useCallback, useEffect, useRef, useState } from 'react';
import { initialState, tourDefs } from './data.js';
import Login from './screens/Login.jsx';
import KioskHome from './screens/KioskHome.jsx';
import PackRecord from './screens/PackRecord.jsx';
import Receiving from './screens/Receiving.jsx';
import ReturnInspection from './screens/ReturnInspection.jsx';
import SearchPlayback from './screens/SearchPlayback.jsx';
import Dashboard from './screens/Dashboard.jsx';
import UsersConfig from './screens/UsersConfig.jsx';
import TopBar from './components/TopBar.jsx';
import TabBar from './components/TabBar.jsx';
import SideBySidePlayer from './components/SideBySidePlayer.jsx';
import BackConfirm from './components/BackConfirm.jsx';
import Tour from './components/Tour.jsx';
import Toast from './components/Toast.jsx';

const OPERATOR_SCREENS = ['kiosk', 'pack', 'recv', 'ret'];
const ADMIN_SCREENS = ['search', 'dash-coverage', 'dash-consignment', 'dash-returns', 'dash-flagged', 'dash-stations', 'config'];
const DASH_SCREENS = ['dash-coverage', 'dash-consignment', 'dash-returns', 'dash-flagged', 'dash-stations'];

export default function App() {
  const [s, setS] = useState(initialState);
  const set = useCallback((patch) => setS((cur) => ({ ...cur, ...patch })), []);

  // latest state for timer/measure callbacks
  const sRef = useRef(s);
  sRef.current = s;

  const toastT = useRef();
  const tourMeasureT = useRef();
  const tourAutoT = useRef();

  // 1s heartbeat: session recording timer + player sync-play progress
  useEffect(() => {
    const iv = setInterval(() => {
      setS((cur) => {
        const upd = {};
        if (cur.screen === 'pack' || cur.screen === 'recv' || cur.screen === 'ret') upd.recSec = cur.recSec + 1;
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

  const openSession = useCallback(
    (kind, id) => {
      if (!id) return;
      if (kind === 'pack') {
        set({
          screen: 'pack',
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
          screen: 'recv',
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
        set({ screen: 'ret', retId: id, recSec: 0, retStills: 0, retReason: null, retNeedReason: false, scanInput: '' });
      }
    },
    [set]
  );

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

  const ctx = { s, set, showToast, openSession, openPlayer, tourGo, openTour, endTour, signOut };

  const screen = s.screen;
  const isOpSurface = OPERATOR_SCREENS.includes(screen);
  const isAdminSurface = ADMIN_SCREENS.includes(screen);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'transparent',
        color: '#1B1D21',
        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif",
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
          </div>
        </div>
      )}

      {screen !== 'login' && <TabBar ctx={ctx} />}
      {s.playerOpen && <SideBySidePlayer ctx={ctx} />}
      {s.backConfirm && <BackConfirm ctx={ctx} />}
      {s.tourOpen && <Tour ctx={ctx} />}
      {s.toast && <Toast msg={s.toast} />}
    </div>
  );
}
