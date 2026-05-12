import { notFound } from 'next/navigation'

export function generateStaticParams() {
  return []
}

const CatchAllPage = () => {
  notFound()
}
export default CatchAllPage
