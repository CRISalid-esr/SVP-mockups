import structuresData from '@/mocks/data/structures.json'

export function generateStaticParams() {
  return structuresData.map((s) => ({ uid: s.uid }))
}

export default function StructureDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
