const TITLES = {
  search: 'Search & playback',
  config: 'Users & config',
  coverage: 'Coverage',
  consignment: 'Consignment',
  returns: 'Returns summary',
  flagged: 'Flagged queue',
  stations: 'Station health',
};

export function generateMetadata({ params }) {
  return { title: TITLES[params.section] || 'Admin' };
}

export default function Page() {
  return null;
}
