export function generateMetadata({ params }) {
  const id = decodeURIComponent(params.id);
  return { title: id === 'new' ? 'New custom order' : `Order ${id}` };
}

export default function Page() {
  return null;
}
