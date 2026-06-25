import { AuthorMeta, DashboardPublication } from '@/mocks/dashboardMockService'
import { CountItem, YearRange } from './overviewAggregates'

export const TEAM_PALETTE = [
  '#4C78A8',
  '#F58518',
  '#54A24B',
  '#E45756',
  '#72B7B2',
  '#B279A2',
  '#EECA3B',
  '#9D755D',
]

export interface StackedByYear {
  keys: string[]
  years: number[]
  series: { name: string; data: number[] }[]
}

export interface StackedByCategory {
  categories: string[] // ex. équipes
  series: { name: string; data: number[] }[] // ex. types
}

function inRangePubs(
  pubs: DashboardPublication[],
  range: YearRange,
): DashboardPublication[] {
  return pubs.filter(
    (p) =>
      typeof p.year === 'number' &&
      p.year >= range.start &&
      p.year <= range.end,
  )
}

function teamYears(pubs: DashboardPublication[]): number[] {
  return Array.from(
    new Set(pubs.map((p) => p.year).filter((y): y is number => y != null)),
  ).sort((a, b) => a - b)
}

/** Comptage par équipe : une publication compte dans chacune de ses équipes. */
function tallyTeams(pubs: DashboardPublication[]): CountItem[] {
  const m = new Map<string, number>()
  for (const p of pubs) {
    for (const tm of p.teams) m.set(tm, (m.get(tm) ?? 0) + 1)
  }
  return Array.from(m.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
}

export interface TeamsAggregates {
  byTeam: CountItem[]
  byYear: StackedByYear
  byType: StackedByCategory
}

export function aggregateTeams(
  pubs: DashboardPublication[],
  range: YearRange,
): TeamsAggregates {
  const inRange = inRangePubs(pubs, range)
  const byTeam = tallyTeams(inRange)
  const teams = byTeam.map((t) => t.key)
  const years = teamYears(inRange)

  // évolution par équipe
  const byYearSeries = teams.map((tm) => {
    const counts = new Map<number, number>()
    for (const p of inRange) {
      if (p.teams.includes(tm) && typeof p.year === 'number') {
        counts.set(p.year, (counts.get(p.year) ?? 0) + 1)
      }
    }
    return { name: tm, data: years.map((y) => counts.get(y) ?? 0) }
  })

  // types par équipe
  const typeSet = Array.from(
    new Set(inRange.map((p) => p.pubType).filter((t): t is string => !!t)),
  )
  const byTypeSeries = typeSet.map((type) => ({
    name: type,
    data: teams.map(
      (tm) =>
        inRange.filter((p) => p.pubType === type && p.teams.includes(tm))
          .length,
    ),
  }))

  return {
    byTeam,
    byYear: { keys: teams, years, series: byYearSeries },
    byType: { categories: teams, series: byTypeSeries },
  }
}

export interface RadarAggregates {
  indicators: { name: string; max: number }[]
  series: { name: string; data: number[] }[]
}

/**
 * Profil disciplinaire par équipe : part (%) des publications de chaque équipe
 * dans les principaux sous-domaines OpenAlex. N'inclut que les vraies équipes.
 */
export function aggregateTeamRadar(
  pubs: DashboardPublication[],
  range: YearRange,
  topSubfields = 8,
): RadarAggregates {
  const inRange = inRangePubs(pubs, range).filter((p) => p.subfields.length)
  const teams = tallyTeams(inRange)
    .map((t) => t.key)
    .filter((tm) => tm.startsWith('Équipe'))

  // sous-domaines les plus fréquents (toutes équipes confondues)
  const sfCount = new Map<string, number>()
  for (const p of inRange) {
    for (const sf of new Set(p.subfields)) {
      sfCount.set(sf, (sfCount.get(sf) ?? 0) + 1)
    }
  }
  const subfields = Array.from(sfCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topSubfields)
    .map(([name]) => name)

  const series = teams.map((tm) => {
    const teamPubs = inRange.filter((p) => p.teams.includes(tm))
    const data = subfields.map((sf) => {
      const n = teamPubs.filter((p) => p.subfields.includes(sf)).length
      return teamPubs.length
        ? Math.round((n / teamPubs.length) * 1000) / 10
        : 0
    })
    return { name: tm, data }
  })

  // max par axe (arrondi à la dizaine supérieure, plancher à 10)
  const indicators = subfields.map((name, i) => {
    const maxShare = Math.max(0, ...series.map((s) => s.data[i]))
    return { name, max: Math.max(10, Math.ceil(maxShare / 10) * 10) }
  })

  return { indicators, series }
}

export interface ResearcherItem {
  label: string
  count: number
  teams: string[]
}

export function aggregateResearchers(
  pubs: DashboardPublication[],
  authors: AuthorMeta[],
  range: YearRange,
  top = 20,
): ResearcherItem[] {
  const inRange = inRangePubs(pubs, range)
  const byId = new Map<number, number>()
  for (const p of inRange) {
    for (const id of p.authorIds) byId.set(id, (byId.get(id) ?? 0) + 1)
  }
  const meta = new Map(authors.map((a) => [a.id, a]))
  return Array.from(byId.entries())
    .map(([id, count]) => ({
      label: meta.get(id)?.label ?? `#${id}`,
      teams: meta.get(id)?.teams ?? [],
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, top)
}

export interface PhdAggregates {
  byTeam: CountItem[]
  byYear: StackedByYear
  byDoctorant: ResearcherItem[]
  totalPhdPubs: number
}

export function aggregatePhd(
  pubs: DashboardPublication[],
  authors: AuthorMeta[],
  range: YearRange,
): PhdAggregates {
  const inRange = inRangePubs(pubs, range)
  const phdPubs = inRange.filter((p) => p.hasPhd)
  const byTeam = tallyTeams(phdPubs)
  const teams = byTeam.map((t) => t.key)
  const years = teamYears(phdPubs)

  const series = teams.map((tm) => {
    const counts = new Map<number, number>()
    for (const p of phdPubs) {
      if (p.teams.includes(tm) && typeof p.year === 'number') {
        counts.set(p.year, (counts.get(p.year) ?? 0) + 1)
      }
    }
    return { name: tm, data: years.map((y) => counts.get(y) ?? 0) }
  })

  const phdIds = new Set(authors.filter((a) => a.isPhd).map((a) => a.id))
  const meta = new Map(authors.map((a) => [a.id, a]))
  const byId = new Map<number, number>()
  for (const p of inRange) {
    for (const id of p.authorIds) {
      if (phdIds.has(id)) byId.set(id, (byId.get(id) ?? 0) + 1)
    }
  }
  const byDoctorant = Array.from(byId.entries())
    .map(([id, count]) => ({
      label: meta.get(id)?.label ?? `#${id}`,
      teams: meta.get(id)?.teams ?? [],
      count,
    }))
    .sort((a, b) => b.count - a.count)

  return {
    byTeam,
    byYear: { keys: teams, years, series },
    byDoctorant,
    totalPhdPubs: phdPubs.length,
  }
}
