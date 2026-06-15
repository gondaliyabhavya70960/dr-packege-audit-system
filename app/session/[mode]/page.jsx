const TITLES = { pack: 'Pack & record', recv: 'Store receiving', ret: 'Return inspection' };

export function generateMetadata({ params }) {
  return { title: TITLES[params.mode] || 'Session' };
}

export default function Page() {
  return null;
}
