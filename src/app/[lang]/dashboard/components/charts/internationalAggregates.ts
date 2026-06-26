import {
  CountryName,
  DashboardPublication,
} from '@/mocks/dashboardMockService'
import { YearRange } from './overviewAggregates'

export interface IntlYearItem {
  year: number
  international: number
  national: number
}

export interface CountryItem {
  iso2: string
  fr: string
  echarts: string
  eu: boolean
  count: number
}

export interface PartnerItem {
  name: string
  cc: string | null
  count: number
}

export interface CountryHeatmap {
  countries: string[] // labels FR, ordre top -> bas
  years: number[]
  /** matrix[countryIndex][yearIndex] = nb publications */
  cells: { x: number; y: number; v: number }[]
}

export interface InternationalAggregates {
  intlByYear: IntlYearItem[]
  intlPctByYear: { year: number; pct: number }[]
  byCountry: CountryItem[] // trié décroissant, FR exclu
  euZone: { ue: number; horsUe: number }
  euByYear: { year: number; ue: number; horsUe: number }[]
  heatmap: CountryHeatmap
  topPartners: PartnerItem[] // organismes étrangers (cc != FR)
}

const HEATMAP_TOP = 15
const PARTNERS_TOP = 20
const FLOW_ORGS_TOP = 15

export interface FlowNode {
  name: string
  depth?: number
}
export interface FlowLink {
  source: string
  target: string
  value: number
}
export interface SunburstNode {
  name: string
  value?: number
  children?: SunburstNode[]
}
export interface FlowAggregates {
  sankey: { nodes: FlowNode[]; links: FlowLink[] }
  sunburst: SunburstNode[]
}

export interface FlowMapPoint {
  name: string
  coord: [number, number] // [lon, lat]
  value: number
}
export interface FlowMapAggregates {
  origin: { name: string; coord: [number, number] }
  points: FlowMapPoint[]
  maxValue: number
}

function inYear(p: DashboardPublication, r: YearRange): boolean {
  return typeof p.year === 'number' && p.year >= r.start && p.year <= r.end
}

/** Pays non-FR distincts d'une publication. */
function foreignCountries(p: DashboardPublication): string[] {
  return Array.from(new Set(p.countries.filter((c) => c && c !== 'FR')))
}

export function aggregateInternational(
  pubs: DashboardPublication[],
  range: YearRange,
  countryNames: Record<string, CountryName>,
): InternationalAggregates {
  const inRange = pubs.filter((p) => inYear(p, range))
  const label = (iso2: string) => countryNames[iso2]?.fr ?? iso2

  // ── Intl vs national par année (is_international connu uniquement)
  const yMap = new Map<number, { intl: number; total: number }>()
  for (const p of inRange) {
    if (p.isInternational == null || typeof p.year !== 'number') continue
    const cur = yMap.get(p.year) ?? { intl: 0, total: 0 }
    cur.total += 1
    if (p.isInternational) cur.intl += 1
    yMap.set(p.year, cur)
  }
  const intlByYear: IntlYearItem[] = Array.from(yMap.entries())
    .map(([year, v]) => ({
      year,
      international: v.intl,
      national: v.total - v.intl,
    }))
    .sort((a, b) => a.year - b.year)
  const intlPctByYear = Array.from(yMap.entries())
    .map(([year, v]) => ({
      year,
      pct: v.total > 0 ? Math.round((v.intl / v.total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => a.year - b.year)

  // ── Comptage par pays (FR exclu) + zone UE
  const countryCount = new Map<string, number>()
  let ue = 0
  let horsUe = 0
  const euYearMap = new Map<number, { ue: number; horsUe: number }>()
  for (const p of inRange) {
    const fc = foreignCountries(p)
    let hasUe = false
    let hasHors = false
    for (const iso2 of fc) {
      countryCount.set(iso2, (countryCount.get(iso2) ?? 0) + 1)
      if (countryNames[iso2]?.eu) hasUe = true
      else hasHors = true
    }
    if (hasUe) ue += 1
    if (hasHors) horsUe += 1
    if (typeof p.year === 'number' && (hasUe || hasHors)) {
      const cur = euYearMap.get(p.year) ?? { ue: 0, horsUe: 0 }
      if (hasUe) cur.ue += 1
      if (hasHors) cur.horsUe += 1
      euYearMap.set(p.year, cur)
    }
  }

  const byCountry: CountryItem[] = Array.from(countryCount.entries())
    .map(([iso2, count]) => ({
      iso2,
      fr: label(iso2),
      echarts: countryNames[iso2]?.echarts ?? '',
      eu: countryNames[iso2]?.eu ?? false,
      count,
    }))
    .sort((a, b) => b.count - a.count)

  const euByYear = Array.from(euYearMap.entries())
    .map(([year, v]) => ({ year, ue: v.ue, horsUe: v.horsUe }))
    .sort((a, b) => a.year - b.year)

  // ── Heatmap top N pays × années
  const topCountries = byCountry.slice(0, HEATMAP_TOP)
  const years = Array.from(
    new Set(inRange.map((p) => p.year).filter((y): y is number => y != null)),
  ).sort((a, b) => a - b)
  const cells: { x: number; y: number; v: number }[] = []
  topCountries.forEach((c, ci) => {
    const counts = new Map<number, number>()
    for (const p of inRange) {
      if (typeof p.year !== 'number') continue
      if (foreignCountries(p).includes(c.iso2)) {
        counts.set(p.year, (counts.get(p.year) ?? 0) + 1)
      }
    }
    years.forEach((y, yi) => {
      cells.push({ x: yi, y: ci, v: counts.get(y) ?? 0 })
    })
  })
  const heatmap: CountryHeatmap = {
    countries: topCountries.map((c) => c.fr),
    years,
    cells,
  }

  // ── Top organismes partenaires étrangers
  const partnerCount = new Map<string, { cc: string | null; count: number }>()
  for (const p of inRange) {
    const seen = new Set<string>()
    for (const org of p.partnerInstitutions) {
      if (!org.name || org.cc === 'FR' || seen.has(org.name)) continue
      seen.add(org.name)
      const cur = partnerCount.get(org.name) ?? { cc: org.cc, count: 0 }
      cur.count += 1
      partnerCount.set(org.name, cur)
    }
  }
  const topPartners: PartnerItem[] = Array.from(partnerCount.entries())
    .map(([name, v]) => ({ name, cc: v.cc, count: v.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, PARTNERS_TOP)

  return {
    intlByYear,
    intlPctByYear,
    byCountry,
    euZone: { ue, horsUe },
    euByYear,
    heatmap,
    topPartners,
  }
}

/**
 * Flux équipe → pays → organisme (Sankey + Sunburst). Une publication relie
 * chacune de ses équipes à chaque organisme partenaire étranger (et au pays de
 * cet organisme). Seules les vraies équipes (« Équipe … ») sont retenues.
 */
export function aggregateFlows(
  pubs: DashboardPublication[],
  range: YearRange,
  countryNames: Record<string, CountryName>,
  topOrgs = FLOW_ORGS_TOP,
): FlowAggregates {
  const inRange = pubs.filter((p) => inYear(p, range))
  const isRealTeam = (tm: string) => tm.startsWith('Équipe')
  const countryLabel = (cc: string) => countryNames[cc]?.fr ?? cc

  // 1. organismes étrangers les plus fréquents (par publication distincte)
  const orgPub = new Map<string, number>()
  for (const p of inRange) {
    const seen = new Set<string>()
    for (const o of p.partnerInstitutions) {
      if (!o.name || !o.cc || o.cc === 'FR' || seen.has(o.name)) continue
      seen.add(o.name)
      orgPub.set(o.name, (orgPub.get(o.name) ?? 0) + 1)
    }
  }
  const topOrgSet = new Set(
    Array.from(orgPub.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topOrgs)
      .map(([name]) => name),
  )

  // 2. comptage des triplets (équipe, pays, organisme)
  const triple = new Map<string, number>() // "team|||country|||org"
  for (const p of inRange) {
    const teams = p.teams.filter(isRealTeam)
    if (!teams.length) continue
    const orgs = p.partnerInstitutions.filter(
      (o) => o.name && o.cc && o.cc !== 'FR' && topOrgSet.has(o.name),
    )
    if (!orgs.length) continue
    const seen = new Set<string>()
    for (const team of teams) {
      for (const o of orgs) {
        const key = `${team}|||${countryLabel(o.cc as string)}|||${o.name}`
        if (seen.has(key)) continue
        seen.add(key)
        triple.set(key, (triple.get(key) ?? 0) + 1)
      }
    }
  }

  // 3. agrégations dérivées
  const teamCountry = new Map<string, number>()
  const countryOrg = new Map<string, number>()
  const teamSet = new Set<string>()
  const countrySet = new Set<string>()
  const orgSet = new Set<string>()
  const tree = new Map<string, Map<string, Map<string, number>>>()

  for (const [key, v] of triple.entries()) {
    const [team, country, org] = key.split('|||')
    teamSet.add(team)
    countrySet.add(country)
    orgSet.add(org)
    teamCountry.set(`${team}|||${country}`, (teamCountry.get(`${team}|||${country}`) ?? 0) + v)
    countryOrg.set(`${country}|||${org}`, (countryOrg.get(`${country}|||${org}`) ?? 0) + v)
    if (!tree.has(team)) tree.set(team, new Map())
    const ct = tree.get(team)!
    if (!ct.has(country)) ct.set(country, new Map())
    ct.get(country)!.set(org, v)
  }

  const nodes: FlowNode[] = [
    ...Array.from(teamSet).map((name) => ({ name, depth: 0 })),
    ...Array.from(countrySet).map((name) => ({ name, depth: 1 })),
    ...Array.from(orgSet).map((name) => ({ name, depth: 2 })),
  ]
  const links: FlowLink[] = [
    ...Array.from(teamCountry.entries()).map(([k, value]) => {
      const [source, target] = k.split('|||')
      return { source, target, value }
    }),
    ...Array.from(countryOrg.entries()).map(([k, value]) => {
      const [source, target] = k.split('|||')
      return { source, target, value }
    }),
  ]

  const sunburst: SunburstNode[] = Array.from(tree.entries()).map(
    ([team, countries]) => ({
      name: team,
      children: Array.from(countries.entries()).map(([country, orgs]) => ({
        name: country,
        children: Array.from(orgs.entries()).map(([org, value]) => ({
          name: org,
          value,
        })),
      })),
    }),
  )

  return { sankey: { nodes, links }, sunburst }
}

/**
 * Carte de flux : arcs depuis le laboratoire (Labo X, Nantes) vers les villes
 * des organismes partenaires étrangers géolocalisés. Valeur = nb de publications
 * distinctes co-signées avec un organisme de cette ville.
 */
export function aggregateFlowMap(
  pubs: DashboardPublication[],
  range: YearRange,
  countryNames: Record<string, CountryName>,
): FlowMapAggregates {
  const inRange = pubs.filter((p) => inYear(p, range))
  const countryLabel = (cc: string) => countryNames[cc]?.fr ?? cc

  const acc = new Map<
    string,
    { name: string; lon: number; lat: number; value: number }
  >()
  for (const p of inRange) {
    const seen = new Set<string>()
    for (const o of p.partnerInstitutions) {
      if (
        !o.cc ||
        o.cc === 'FR' ||
        o.lat == null ||
        o.lon == null ||
        !o.city
      )
        continue
      const key = `${o.city}|${o.cc}`
      if (seen.has(key)) continue // une fois par publication
      seen.add(key)
      const cur =
        acc.get(key) ??
        {
          name: `${o.city} (${countryLabel(o.cc)})`,
          lon: o.lon,
          lat: o.lat,
          value: 0,
        }
      cur.value += 1
      acc.set(key, cur)
    }
  }

  const points: FlowMapPoint[] = Array.from(acc.values())
    .map((p) => ({ name: p.name, coord: [p.lon, p.lat] as [number, number], value: p.value }))
    .sort((a, b) => b.value - a.value)

  return {
    origin: { name: 'Labo X (Nantes)', coord: [-1.5536, 47.2184] },
    points,
    maxValue: points.reduce((m, p) => Math.max(m, p.value), 0),
  }
}
