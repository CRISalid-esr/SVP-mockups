import { DashboardPublication } from '@/mocks/dashboardMockService'
import { YearRange } from './overviewAggregates'

export const QUARTILE_COLORS: Record<string, string> = {
  Q1: '#2166ac',
  Q2: '#4dac26',
  Q3: '#d8b365',
  Q4: '#d7191c',
}

export const FWCI_REFERENCE = 1.0
/** Borne d'affichage de l'histogramme FWCI (la longue traîne est repliée). */
export const FWCI_CAP = 8
export const FWCI_BIN_WIDTH = 0.5

export interface ImpactKpis {
  total: number
  nbFwci: number
  pctFwci: number | null
  nbTop10: number
  pctTop10: number | null
  nbTop1: number
  pctTop1: number | null
  fwciMean: number | null
}

export interface ImpactAggregates {
  kpis: ImpactKpis
  quartiles: { key: string; count: number; color: string }[]
  quartileKnown: number
  topByYear: { year: number; top1: number; top10Only: number }[]
  fwciHistogram: { label: string; count: number }[]
}

function inYear(p: DashboardPublication, r: YearRange): boolean {
  return typeof p.year === 'number' && p.year >= r.start && p.year <= r.end
}

export function aggregateImpact(
  pubs: DashboardPublication[],
  range: YearRange,
): ImpactAggregates {
  const inRange = pubs.filter((p) => inYear(p, range))
  const total = inRange.length

  const fwciVals = inRange
    .map((p) => p.fwci)
    .filter((v): v is number => typeof v === 'number')
  const nbFwci = fwciVals.length
  const nbTop10 = inRange.filter((p) => p.isTop10Percent === true).length
  const nbTop1 = inRange.filter((p) => p.isTop1Percent === true).length
  const fwciMean =
    nbFwci > 0 ? fwciVals.reduce((s, v) => s + v, 0) / nbFwci : null

  const kpis: ImpactKpis = {
    total,
    nbFwci,
    pctFwci: total > 0 ? Math.round((nbFwci / total) * 100) : null,
    nbTop10,
    pctTop10: nbFwci > 0 ? Math.round((nbTop10 / nbFwci) * 100) : null,
    nbTop1,
    pctTop1: nbFwci > 0 ? Math.round((nbTop1 / nbFwci) * 100) : null,
    fwciMean,
  }

  // ── Quartiles Scimago (hors inconnu)
  const qMap = new Map<string, number>()
  for (const p of inRange) {
    if (p.sjrQuartile && QUARTILE_COLORS[p.sjrQuartile]) {
      qMap.set(p.sjrQuartile, (qMap.get(p.sjrQuartile) ?? 0) + 1)
    }
  }
  const quartiles = ['Q1', 'Q2', 'Q3', 'Q4'].map((q) => ({
    key: q,
    count: qMap.get(q) ?? 0,
    color: QUARTILE_COLORS[q],
  }))
  const quartileKnown = quartiles.reduce((s, q) => s + q.count, 0)

  // ── Top 1% / Top 10% (hors top 1%) par année
  const tyMap = new Map<number, { top1: number; top10: number }>()
  for (const p of inRange) {
    if (typeof p.year !== 'number') continue
    const cur = tyMap.get(p.year) ?? { top1: 0, top10: 0 }
    if (p.isTop10Percent === true) cur.top10 += 1
    if (p.isTop1Percent === true) cur.top1 += 1
    tyMap.set(p.year, cur)
  }
  const topByYear = Array.from(tyMap.entries())
    .map(([year, v]) => ({
      year,
      top1: v.top1,
      top10Only: Math.max(0, v.top10 - v.top1),
    }))
    .sort((a, b) => a.year - b.year)

  // ── Histogramme FWCI (replié à FWCI_CAP)
  const nBins = Math.round(FWCI_CAP / FWCI_BIN_WIDTH)
  const bins = new Array(nBins + 1).fill(0) // dernier bin = ">= cap"
  for (const v of fwciVals) {
    if (v >= FWCI_CAP) {
      bins[nBins] += 1
    } else {
      bins[Math.floor(v / FWCI_BIN_WIDTH)] += 1
    }
  }
  const fwciHistogram = bins.map((count, i) => {
    if (i === nBins) return { label: `≥ ${FWCI_CAP}`, count }
    const lo = i * FWCI_BIN_WIDTH
    return { label: lo.toFixed(1), count }
  })

  return { kpis, quartiles, quartileKnown, topByYear, fwciHistogram }
}
