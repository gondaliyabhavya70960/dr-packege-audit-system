import '../src/styles.css';
import App from '../src/App.jsx';

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Mayavé Packaging Audit';

export const metadata = {
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description:
    'Video proof at the three moments that matter — packing, store receiving and returns — all linked to one ID (order / RFID / challan).',
  applicationName: APP_NAME,
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: APP_NAME,
    description: 'Packing · Receiving · Returns — one ID, every checkpoint, video proof in seconds.',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: '#8E0E22',
  width: 'device-width',
  initialScale: 1,
};

// The interactive app lives in the root layout so its state survives client-side
// route changes; each route's page.jsx is a thin metadata carrier (see app/*/page.jsx).
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <App />
        {children}
      </body>
    </html>
  );
}
