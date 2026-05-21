import personsData from '@/mocks/data/persons.json'
import DefaultLayout from '../../layouts/MainLayout'

export function generateStaticParams() {
  return (personsData as { uid: string }[]).map((p) => ({ uid: p.uid }))
}

export default function ResearcherDetailLayout({ children }: { children: React.ReactNode }) {
  return <DefaultLayout>{children}</DefaultLayout>
}
