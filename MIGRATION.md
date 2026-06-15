# Migrating this project from Vite + React to Next.js (App Router)

This document records the migration that was applied to this repo and is a
reusable, step‑by‑step recipe for the same kind of app: a **stateful client SPA**
(one shared store, screen switching, overlays) with **no server router and no
real API calls**.

Because several items on a generic "convert to Next.js" checklist don't strictly
apply here (there was no `react-router` to replace, and no `fetch`/API calls to
convert), each step below notes **what was actually needed vs. what is optional /
future work**.

---

## 0. Starting point

```
Vite + React 18, single-page app
  index.html  →  src/main.jsx  →  src/App.jsx (state machine; `s.screen` picks the screen)
  src/screens/*, src/components/*   (framework-agnostic React)
  src/data.js                       (seed data + helpers, no backend)
  src/styles.css                    (one global stylesheet)
  public/assets/*                   (logo, icons)
```

Navigation was **state**, not URLs: `set({ screen: 'orders' })`. There were no
`getServerSideProps`, no router, no API routes.

## Target structure (App Router)

```
app/
  layout.jsx            # <html><body>, global CSS, default SEO metadata, mounts the app
  page.jsx              # "/"            → metadata only (title: Sign in)
  overview/page.jsx     # "/overview"
  packaging/page.jsx    # "/packaging"
  transfers/page.jsx    # "/transfers"
  kiosk/page.jsx        # "/kiosk"
  orders/[id]/page.jsx  # "/orders/:id"  → generateMetadata(id)
  admin/[section]/page.jsx
  session/[mode]/page.jsx
  api/orders/route.js   # Route Handler (mock data source)
src/
  App.jsx               # 'use client' + URL⇄screen sync (the only real code change)
  screens/*, components/*, data.js, styles.css   # unchanged
public/assets/*         # unchanged — Next serves /public at the web root
next.config.mjs
.env.local.example
```

---

## 1. Dependencies & scripts

`package.json` — drop Vite, add Next:

```jsonc
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}
```

> Remove `"type": "module"` — Next decides module format by file extension
> (`next.config.mjs` is ESM; `app/**` is compiled as ESM regardless).

`next.config.mjs`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = { reactStrictMode: true };
export default nextConfig;
```

Update `.gitignore`: add `/.next/`, `/out/`, `next-env.d.ts`, `.env*.local`.

## 2. Static assets, CSS, fonts

- **Assets**: `public/` already maps to the web root, so `/assets/logo.png`
  resolves to `public/assets/logo.png` with **no code changes**. (If you adopt
  `next/image`, declare remote hosts under `images.remotePatterns`.)
- **Global CSS**: in the App Router, a global stylesheet is imported **once in
  `app/layout.jsx`**: `import '../src/styles.css'`. (Component‑scoped styles →
  CSS Modules `*.module.css`.)
- **Fonts**: this app uses system fonts, so nothing to do. For web fonts, prefer
  `next/font` (self‑hosts, zero layout shift) instead of `<link>` tags.

## 3. Routing — replace state‑switching with the file system

The app is one persistent client experience, so the cleanest mapping is:

- Mount the interactive app **once in the layout** so its state survives
  client‑side navigation.
- Make each route a thin **metadata carrier** (`page.jsx` returning `null`).
- Keep the internal `screen` state, but **sync it to the URL** both ways.

`app/layout.jsx` (Server Component):

```jsx
import '../src/styles.css';
import App from '../src/App.jsx';

export const metadata = { /* default SEO — see step 5 */ };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <App />        {/* the app island — persists across routes */}
        {children}     {/* route page.jsx (null) — only carries metadata */}
      </body>
    </html>
  );
}
```

`src/App.jsx` — the **only** real code change. Mark it a client component and add
a two‑way URL⇄screen sync:

```jsx
'use client';
import { usePathname, useRouter } from 'next/navigation';

function pathToNav(pathname) {            // URL → { screen, orderId?, listKind? }
  if (pathname === '/') return { screen: 'login' };
  if (pathname === '/overview') return { screen: 'home' };
  if (pathname === '/packaging') return { screen: 'orders', listKind: 'packaging' };
  if (pathname === '/transfers') return { screen: 'orders', listKind: 'transfer' };
  if (pathname.startsWith('/orders/')) {
    const id = decodeURIComponent(pathname.slice(8));
    return { screen: 'order', orderId: id === 'new' ? '' : id };
  }
  if (pathname.startsWith('/admin/')) {
    const sec = pathname.slice(7);
    return { screen: sec === 'search' ? 'search' : sec === 'config' ? 'config' : 'dash-' + sec };
  }
  /* …/kiosk, /session/[mode]… */ return { screen: 'login' };
}
function navToPath(s) { /* the inverse — must be symmetric to avoid loops */ }

export default function App() {
  const pathname = usePathname();
  const router = useRouter();
  // init from the URL so SSR and the first client render match (no hydration flash)
  const [s, setS] = useState(() => ({ ...initialState, ...pathToNav(pathname) }));

  // state → URL
  useEffect(() => {
    const path = navToPath(sRef.current);
    if (path !== pathname) router.push(path);
  }, [s.screen, s.orderId, s.listKind]);

  // URL → state (deep links + browser back/forward)
  useEffect(() => {
    const nav = pathToNav(pathname);
    const cur = sRef.current;
    if (nav.screen !== cur.screen || nav.orderId !== cur.orderId || nav.listKind !== cur.listKind) setS((c) => ({ ...c, ...nav }));
  }, [pathname]);
  …
}
```

The win: **none of the existing `set({ screen })` call sites change** — they keep
working, and the URL follows automatically.

> **Alternative (greenfield) approach:** if you were starting fresh, lift global
> state into a Context provider in the layout, render each screen from its own
> `page.jsx`, and navigate with `useRouter().push()` / `<Link>`. That's more
> idiomatic but a much larger rewrite for an app whose screens share this much
> ephemeral state (recording timers, side‑by‑side player overlay, guided tour).

## 4. Data fetching (`getServerSideProps` / `getStaticProps` / `fetch`)

This app has **no API calls** — all data is local seed in `src/data.js`, which a
client app can keep importing directly. To show the Next.js pattern we added a
**Route Handler** as a mock data source:

```js
// app/api/orders/route.js
import { NextResponse } from 'next/server';
import { seedOrders } from '../../../src/data.js';
export const dynamic = 'force-static';        // seed = static; use 'force-dynamic' for live data
export async function GET() {
  return NextResponse.json({ count: seedOrders.length, orders: seedOrders });
}
```

How you'd consume it, by router style:

```jsx
// App Router — Server Component (preferred): fetch on the server, stream HTML
async function OrdersPage() {
  const res = await fetch(`${process.env.API_BASE_URL}/api/orders`, { next: { revalidate: 60 } });
  const { orders } = await res.json();
  return <OrdersTable orders={orders} />;   // SEO-friendly, no client JS to load data
}
```

```jsx
// Pages Router equivalents
export async function getServerSideProps() {  // per-request (SSR)
  const orders = await getOrders();
  return { props: { orders } };
}
export async function getStaticProps() {      // build-time (SSG) + optional ISR
  return { props: { orders: await getOrders() }, revalidate: 60 };
}
```

Caching cheat‑sheet (App Router `fetch`): `{ cache: 'force-cache' }` = static,
`{ cache: 'no-store' }` = SSR every request, `{ next: { revalidate: N } }` = ISR.

## 5. SEO

- **Default metadata** in `app/layout.jsx` via the `metadata` export (title
  template, description, `openGraph`, `icons`, `robots`).
- **Per‑route metadata** in each `page.jsx` (`export const metadata` or
  `export function generateMetadata({ params })` for dynamic routes). e.g.
  `/orders/ORD‑10293` → `<title>Order ORD‑10293 · Mayavé Packaging Audit</title>`,
  rendered server‑side.
- Use the `viewport` export for `themeColor` / viewport (Next 14 split these out
  of `metadata`).

## 6. Env vars

- Next auto‑loads `.env.local` (git‑ignored). Commit a `.env.local.example`.
- **Browser‑exposed** vars must be prefixed `NEXT_PUBLIC_`
  (e.g. `NEXT_PUBLIC_APP_NAME`, read at build/runtime via `process.env`).
- **Secrets** (no prefix) are only readable in Server Components / Route Handlers
  / server actions — never shipped to the client.

## 7. SSR / hydration gotchas (what to watch for)

- Wrap any browser‑only component tree with `'use client'`. Here, marking
  `App.jsx` client makes its whole import subtree client, so individual
  screens/components didn't each need the directive.
- **Never touch `window` / `document` / `localStorage` during render** — only in
  effects/handlers. This app already did (timers, the `localStorage` tour flag,
  `getBoundingClientRect`), so it was hydration‑safe.
- **Deterministic first render**: derive route‑dependent state from `usePathname()`
  in the `useState` initializer (same on server and client) instead of in an
  effect, to avoid a login→target flash and any mismatch.
- `useSearchParams()` opts a route into client rendering and needs a `<Suspense>`
  boundary for static export — we avoided it by encoding state in **path
  segments** (`/packaging`, `/transfers`) instead of `?query`.
- Keep `navToPath`/`pathToNav` **symmetric** or the two sync effects can ping‑pong.

## 8. Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm run start   # production
```

Verified after migration: deep‑linking `/overview` and `/orders/ORD‑10293` SSRs the
right screen; login pushes `/overview`; the bottom bar drives `/packaging` ·
`/transfers`; opening a row pushes `/orders/:id`; **browser back/forward works**;
per‑route `<title>`s are correct; **no hydration errors**.

---

## Best practices going forward

**Folder structure**
- `app/` for routes; colocate route‑only UI in the route folder, shared UI in
  `components/`, shared logic in `lib/`. (This repo keeps screens/components under
  `src/` to minimise churn; moving them to top‑level `components/`/`screens/` or
  behind a `@/*` path alias in `jsconfig.json` is a fine follow‑up.)
- Use `loading.jsx` (Suspense fallback), `error.jsx` (error boundary), and
  `not-found.jsx` per segment.

**Performance**
- Prefer **Server Components**; add `'use client'` only at the leaves that need
  interactivity. (This app is the opposite — a big client island — which is the
  pragmatic choice for a heavily stateful SPA, but new features should lean
  server‑first.)
- Data: cache with `fetch` `revalidate` (ISR) where possible; reach for
  `force-dynamic` only when truly per‑request.
- `next/image` for raster images (lazy load, responsive `sizes`, AVIF/WebP);
  `next/font` for fonts; `next/dynamic` to code‑split heavy client‑only widgets
  (e.g. the side‑by‑side video player).
- Keep client bundles lean: this app's shared client JS is ~87 kB first load —
  watch it with `@next/bundle-analyzer`.
- Auth/route protection belongs in **middleware** (`middleware.js`) rather than
  client redirects, for real deployments.
