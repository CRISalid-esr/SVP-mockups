export function generateStaticParams() {
  return [{ uid: 'doc-1' }, { uid: 'doc-2' }, { uid: 'doc-3' }, { uid: 'doc-4' }, { uid: 'doc-5' }, { uid: 'doc-6' }]
}

export default function DocumentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
