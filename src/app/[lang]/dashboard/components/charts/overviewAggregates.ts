import { DashboardPublication } from '@/mocks/dashboardMockService'

export interface YearRange {
  start: number
  end: number
}

export interface OverviewKpis {
  total: number
  intl: number
  intlKnown: number
  intlUnknown: number
  intlPct: number | null
  foreign: number
  foreignPct: number | null
  french: number
  frenchPct: number | null
  apcCount: number
  apcTotalEur: number
}

export interface CountItem {
  key: string
  count: number
}

export interface OaItem extends CountItem {
  color: string
}

export interface ApcYearItem {
  year: number
  total: number
  count: number
}

export interface OverviewAggregates {
  kpis: OverviewKpis
  byYear: { year: number; count: number }[]
  byLanguage: CountItem[]
  byType: CountItem[]
  byOa: OaItem[]
  apcByYear: ApcYearItem[]
}

/** Couleurs des statuts Open Access, alignées sur OAStatusProperties. */
export const OA_COLORS: Record<string, string> = {
  diamond: '#5595d9',
  gold: '#f5b01b',
  green: '#2fb028',
  hybrid: '#7b28bf',
  bronze: '#eb8036',
  closed: '#f23427',
  unknown: '#81888f',
}

/** Ordre d'affichage stable des statuts OA (du plus ouvert au fermé). */
const OA_ORDER = [
  'diamond',
  'gold',
  'green',
  'hybrid',
  'bronze',
  'closed',
  'unknown',
]

export function getYearBounds(pubs: DashboardPublication[]): {
  min: number
  max: number
} {
  const years = pubs
    .map((p) => p.year)
    .filter((y): y is number => typeof y === 'number')
  if (years.length === 0) {
    const now = new Date().getUTCFullYear()
    return { min: now, max: now }
  }
  return { min: Math.min(...years), max: Math.max(...years) }
}

function pct(part: number, whole: number): number | null {
  return whole > 0 ? Math.round((part / whole) * 100) : null
}

function tally(values: (string | null | undefined)[]): CountItem[] {
  const map = new Map<string, number>()
  for (const v of values) {
    const key = v && v.trim() ? v : 'unknown'
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  return Array.from(map.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
}

export function aggregateOverview(
  pubs: DashboardPublication[],
  range: YearRange,
): OverviewAggregates {
  const inRange = pubs.filter(
    (p) =>
      typeof p.year === 'number' &&
      p.year >= range.start &&
      p.year <= range.end,
  )

  const total = inRange.length
  const intl = inRange.filter((p) => p.isInternational === true).length
  const intlUnknown = inRange.filter(
    (p) => p.isInternational === null || p.isInternational === undefined,
  ).length
  const intlKnown = total - intlUnknown
  const foreign = inRange.filter((p) => p.isForeignLanguage).length
  const french = inRange.filter((p) => p.language === 'fr').length
  const apcPubs = inRange.filter((p) => p.hasApc)
  const apcTotalEur = apcPubs.reduce((sum, p) => sum + (p.apcAmount ?? 0), 0)

  const kpis: OverviewKpis = {
    total,
    intl,
    intlKnown,
    intlUnknown,
    intlPct: pct(intl, intlKnown),
    foreign,
    foreignPct: pct(foreign, total),
    french,
    frenchPct: pct(french, total),
    apcCount: apcPubs.length,
    apcTotalEur,
  }

  // Publications par année
  const yearMap = new Map<number, number>()
  for (const p of inRange) {
    if (typeof p.year === 'number') {
      yearMap.set(p.year, (yearMap.get(p.year) ?? 0) + 1)
    }
  }
  const byYear = Array.from(yearMap.entries())
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year - b.year)

  // Langues / types
  const byLanguage = tally(inRange.map((p) => p.language))
  const byType = tally(inRange.map((p) => p.pubType))

  // Open Access (ordre stable)
  const oaCounts = tally(inRange.map((p) => p.oaStatus))
  const byOa: OaItem[] = oaCounts
    .map((it) => ({ ...it, color: OA_COLORS[it.key] ?? OA_COLORS.unknown }))
    .sort((a, b) => OA_ORDER.indexOf(a.key) - OA_ORDER.indexOf(b.key))

  // APC par année
  const apcYearMap = new Map<number, { total: number; count: number }>()
  for (const p of apcPubs) {
    if (typeof p.year !== 'number') continue
    const cur = apcYearMap.get(p.year) ?? { total: 0, count: 0 }
    cur.total += p.apcAmount ?? 0
    cur.count += 1
    apcYearMap.set(p.year, cur)
  }
  const apcByYear = Array.from(apcYearMap.entries())
    .map(([year, v]) => ({ year, total: v.total, count: v.count }))
    .sort((a, b) => a.year - b.year)

  return { kpis, byYear, byLanguage, byType, byOa, apcByYear }
}
