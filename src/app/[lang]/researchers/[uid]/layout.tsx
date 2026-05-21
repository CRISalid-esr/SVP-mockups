import personsData from '@/mocks/data/persons.json'

export function generateStaticParams() {
  return (personsData as { uid: string }[]).map((p) => ({ uid: p.uid }))
}

export default function ResearcherDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
