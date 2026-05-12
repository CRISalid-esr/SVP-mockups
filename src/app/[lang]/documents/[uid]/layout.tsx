export function generateStaticParams() {
  return [{ uid: 'doc-1' }, { uid: 'doc-2' }]
}

export default function DocumentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
