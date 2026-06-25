import { DashboardPublication } from '@/mocks/dashboardMockService'
import { CountItem, YearRange } from './overviewAggregates'

/** Types de publication considérés comme « ouvrages » + couleur (PUB_TYPE_COLORS Nantilux). */
export const BOOK_TYPES: { key: string; color: string }[] = [
  { key: 'Chapitre de livre', color: '#F58518' },
  { key: 'Monographie', color: '#72B7B2' },
  { key: "Direction/coordination d'ouvrage", color: '#E45756' },
  { key: 'Coordination', color: '#B279A2' },
]

export interface BooksAggregates {
  byType: CountItem[]
  years: number[]
  series: { name: string; color: string; data: number[] }[]
  total: number
}

export function aggregateBooks(
  pubs: DashboardPublication[],
  range: YearRange,
): BooksAggregates {
  const bookKeys = new Set(BOOK_TYPES.map((b) => b.key))
  const inRange = pubs.filter(
    (p) =>
      typeof p.year === 'number' &&
      p.year >= range.start &&
      p.year <= range.end &&
      p.pubType != null &&
      bookKeys.has(p.pubType),
  )

  const typeCount = new Map<string, number>()
  const years = Array.from(
    new Set(inRange.map((p) => p.year as number)),
  ).sort((a, b) => a - b)
  const yearTypeCount = new Map<string, Map<number, number>>()

  for (const p of inRange) {
    const type = p.pubType as string
    typeCount.set(type, (typeCount.get(type) ?? 0) + 1)
    if (!yearTypeCount.has(type)) yearTypeCount.set(type, new Map())
    const ym = yearTypeCount.get(type)!
    ym.set(p.year as number, (ym.get(p.year as number) ?? 0) + 1)
  }

  const byType: CountItem[] = BOOK_TYPES.filter((b) => typeCount.has(b.key))
    .map((b) => ({ key: b.key, count: typeCount.get(b.key) ?? 0 }))
    .sort((a, b) => b.count - a.count)

  const series = BOOK_TYPES.filter((b) => typeCount.has(b.key)).map((b) => ({
    name: b.key,
    color: b.color,
    data: years.map((y) => yearTypeCount.get(b.key)?.get(y) ?? 0),
  }))

  return { byType, years, series, total: inRange.length }
}
