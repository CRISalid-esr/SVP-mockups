import { AuthorMeta, DashboardPublication } from '@/mocks/dashboardMockService'
import { YearRange } from './overviewAggregates'

export interface NetworkNode {
  id: string
  name: string
  value: number // nombre de publications
  category: number
  isCenter?: boolean // auteur central (ego-réseau en vue chercheur)
}

export interface NetworkLink {
  source: string
  target: string
  value: number // co-publications
}

export interface NetworkData {
  nodes: NetworkNode[]
  links: NetworkLink[]
  categories: { name: string }[]
}

/**
 * Réseau de co-signatures internes : nœuds = auteurs (pseudonymisés),
 * arêtes = co-publications. Les auteurs sous le seuil `minPubs` sont écartés
 * pour la lisibilité.
 */
export function aggregateNetwork(
  pubs: DashboardPublication[],
  authors: AuthorMeta[],
  range: YearRange,
  minPubs = 2,
  centerId: number | null = null,
): NetworkData {
  const inRange = pubs.filter(
    (p) =>
      typeof p.year === 'number' &&
      p.year >= range.start &&
      p.year <= range.end,
  )
  const meta = new Map(authors.map((a) => [a.id, a]))

  const pubCount = new Map<number, number>()
  for (const p of inRange) {
    for (const id of new Set(p.authorIds)) {
      pubCount.set(id, (pubCount.get(id) ?? 0) + 1)
    }
  }
  const kept = new Set(
    Array.from(pubCount.entries())
      .filter(([, c]) => c >= minPubs)
      .map(([id]) => id),
  )
  // L'auteur central de l'ego-réseau est toujours conservé.
  if (centerId != null && pubCount.has(centerId)) kept.add(centerId)

  const edge = new Map<string, number>()
  for (const p of inRange) {
    const ids = Array.from(new Set(p.authorIds)).filter((id) => kept.has(id))
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = Math.min(ids[i], ids[j])
        const b = Math.max(ids[i], ids[j])
        const key = `${a}|${b}`
        edge.set(key, (edge.get(key) ?? 0) + 1)
      }
    }
  }

  const teamOf = (id: number) => {
    const tms = meta.get(id)?.teams ?? []
    return tms.length ? tms[0] : 'Non identifié'
  }
  const catNames = Array.from(new Set(Array.from(kept).map(teamOf))).sort()
  const catIndex = new Map(catNames.map((c, i) => [c, i]))

  const nodes: NetworkNode[] = Array.from(kept).map((id) => ({
    id: String(id),
    name: meta.get(id)?.label ?? `#${id}`,
    value: pubCount.get(id) ?? 0,
    category: catIndex.get(teamOf(id)) ?? 0,
    isCenter: centerId != null && id === centerId,
  }))

  const links: NetworkLink[] = Array.from(edge.entries()).map(([k, v]) => {
    const [a, b] = k.split('|')
    return { source: a, target: b, value: v }
  })

  return { nodes, links, categories: catNames.map((name) => ({ name })) }
}
