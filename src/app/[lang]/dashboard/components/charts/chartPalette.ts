/**
 * Palette des graphiques (tableau de bord, fiche structure).
 *
 * Une couleur fait un seul travail :
 * - catégorielle (identité d'une série) : SERIES, dans l'ordre, sans jamais boucler ;
 *   au-delà de 7 séries, regrouper en « Autres ». Le sarcelle de l'interface ouvre la liste.
 * - ordinale (rang : quartiles…) : ORDINAL, une seule teinte, du clair au foncé ;
 * - séquentielle (intensité : cartes, heatmaps) : SEQUENTIAL ;
 * - neutre (inconnu, sans objet, fond de carte) : NEUTRAL, MAP_AREA, MAP_BORDER.
 *
 * Validée avec le script du skill dataviz (daltonisme protan/deutan, écart en vision
 * normale, bande de clarté, chroma, contraste) sur fond blanc et sur le fond sombre
 * #1A1C1B. Jaune et rose sont sous 3:1 sur fond blanc : les graphiques qui les
 * emploient gardent une légende et des étiquettes.
 *
 * Les graphiques écrivent les valeurs claires ; EChart (et useChartTheme) les remplace
 * par leurs équivalents sombres en mode sombre.
 */

import { brandTones, isDefaultBrand } from '@/app/theme/brand'

export const SERIES = [
  '#008a7c', // sarcelle
  '#eb6834', // orange
  '#2a78d6', // bleu
  '#eda100', // jaune
  '#e87ba4', // rose
  '#6250d6', // violet
  '#e34948', // rouge
] as const

const SERIES_DARK = ['#1a9e8f', '#d95926', '#3987e5', '#c98500', '#d55181', '#9085e9', '#e66767']

/** Une seule série : toujours la première couleur. */
export const PRIMARY_SERIES = SERIES[0]

/** Rang, du plus fort (foncé) au plus faible (clair) : Q1 → Q4… */
export const ORDINAL = ['#004a42', '#006b60', '#3fa596', '#7cc4b8'] as const
// En sombre, le rang le plus fort est le plus clair (le plus contrasté).
const ORDINAL_DARK = ['#a6e2d8', '#5cc2b3', '#1a9e8f', '#1f6e64']

/** Intensité, de presque rien à beaucoup. */
export const SEQUENTIAL = ['#e6f2f0', '#9fd3ca', '#3fa596', '#006b60', '#003a34'] as const
const SEQUENTIAL_DARK = ['#203230', '#1f5c53', '#1a9e8f', '#5cc2b3', '#b5ebe2']

export const NEUTRAL = '#9aa3a0'
const NEUTRAL_DARK = '#6b7471'

/** Fond et contours des cartes géographiques. */
export const MAP_AREA = '#f1f4f3'
export const MAP_AREA_HOVER = '#e6f2f0'
export const MAP_BORDER = '#d5dcd9'
const MAP_DARK = ['#262a28', '#203230', '#3a403d']

/** Grille et axes discrets. */
export const AXIS_LINE = '#dde4e1'
export const SPLIT_LINE = '#eef2f0'
const AXIS_DARK = ['#3a403d', '#2a2e2c']

const pairs = (light: readonly string[], dark: readonly string[]) => light.map((l, i) => [l, dark[i]] as const)

/** Liseré entre deux parts (camemberts) : la couleur du fond. */
export const SURFACE = '#ffffff'

const LIGHT_TO_DARK = new Map<string, string>([
  [SURFACE, '#1a1c1b'],
  ['#fff', '#1a1c1b'],
  ...pairs(SERIES, SERIES_DARK),
  ...pairs(ORDINAL, ORDINAL_DARK),
  ...pairs(SEQUENTIAL, SEQUENTIAL_DARK),
  [NEUTRAL, NEUTRAL_DARK],
  ...pairs([MAP_AREA, MAP_AREA_HOVER, MAP_BORDER], MAP_DARK),
  ...pairs([AXIS_LINE, SPLIT_LINE], AXIS_DARK),
])

/** Équivalent sombre d'une couleur de la palette (les autres valeurs sont rendues telles quelles). */
export const toDark = (color: string): string => LIGHT_TO_DARK.get(color.toLowerCase()) ?? color

/** Parcourt une option ECharts et passe ses couleurs en mode sombre ; les fonctions sont conservées. */
export function darkenOption<T>(value: T): T {
  return remapOption(value, LIGHT_TO_DARK)
}

// ─── Couleur d'établissement ─────────────────────────────────────────────────
// La première série, le rang et l'intensité prennent la teinte de l'établissement.
// Les six autres séries sont reprises de la palette validée, dans son ordre, en
// écartant celles trop proches de la nouvelle première couleur ou de leur voisine,
// en vision normale comme pour un daltonisme rouge-vert (mêmes seuils que le
// script de validation : écart ≥ 15 en vision normale, ≥ 8 simulé).

/** Couleurs de remplacement quand une couleur de la palette est écartée. */
const SPARE = [
  ['#008a7c', '#1a9e8f'], // sarcelle (couleur par défaut de SoVisu+)
  ['#008300', '#2e9b2e'], // vert
  ['#1baf7a', '#199e70'], // aqua
  ['#1c5cab', '#5598e7'], // bleu profond
  ['#b5357e', '#e06aa6'], // magenta
  ['#9a5b2a', '#c07a45'], // brun
  ['#6f7a00', '#97a31c'], // olive
] as const

export interface ChartColors {
  series: string[]
  ordinal: string[]
  sequential: string[]
}

const lin = (c: number) => {
  const s = c / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
const rgbLinear = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16)
  return [lin((n >> 16) & 255), lin((n >> 8) & 255), lin(n & 255)]
}
const oklab = ([r, g, b]: [number, number, number]): [number, number, number] => {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}
// Machado, Oliveira & Fernandes 2009, sévérité 1.
const PROTAN = [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]]
const DEUTAN = [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]]
const simulate = (rgb: [number, number, number], m: number[][]): [number, number, number] =>
  m.map((row) => Math.min(1, Math.max(0, row[0] * rgb[0] + row[1] * rgb[1] + row[2] * rgb[2]))) as [number, number, number]
const distance = (a: [number, number, number], b: [number, number, number]) =>
  100 * Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])

/** Écarts entre deux couleurs : vision normale, et pire des daltonismes rouge-vert. */
export function separation(a: string, b: string): { normal: number; cvd: number } {
  const ra = rgbLinear(a)
  const rb = rgbLinear(b)
  return {
    normal: distance(oklab(ra), oklab(rb)),
    cvd: Math.min(...[PROTAN, DEUTAN].map((m) => distance(oklab(simulate(ra, m)), oklab(simulate(rb, m))))),
  }
}

/** Deux voisines se distinguent-elles (seuils du script de validation) ? */
export function distinct(a: string, b: string): boolean {
  const { normal, cvd } = separation(a, b)
  return normal >= 15 && cvd >= 8
}

/** Palette des graphiques pour une couleur d'établissement et un mode. */
export function chartColorsFor(seed: string, mode: 'light' | 'dark'): ChartColors {
  const dark = mode === 'dark'
  if (isDefaultBrand(seed)) {
    return dark
      ? { series: SERIES_DARK, ordinal: ORDINAL_DARK, sequential: SEQUENTIAL_DARK }
      : { series: [...SERIES], ordinal: [...ORDINAL], sequential: [...SEQUENTIAL] }
  }
  const [first] = brandTones(seed, [dark ? 60 : 52])
  // Candidates dans l'ordre de préférence ; on écarte celles qui ressemblent à la première.
  const pool = [
    ...SERIES.slice(1).map((light, i) => (dark ? SERIES_DARK[i + 1] : light)),
    ...SPARE.map(([light, darkHex]) => (dark ? darkHex : light)),
  ].filter((c) => separation(c, first).normal >= 15)

  // Premier ordre, au sens de la préférence, où chaque voisine se distingue de la précédente.
  // À défaut de sept couleurs, la plus longue suite possible : le reste se regroupe en « Autres ».
  const search = (order: string[], left: string[], size: number): string[] | null => {
    if (order.length === size) return order
    for (const c of left) {
      if (!distinct(c, order[order.length - 1])) continue
      const found = search([...order, c], left.filter((x) => x !== c), size)
      if (found) return found
    }
    return null
  }
  let series: string[] | null = null
  for (let size = 7; !series && size > 1; size--) series = search([first], pool, size)
  return {
    series: series ?? [first],
    ordinal: brandTones(seed, dark ? [88, 74, 58, 42] : [27, 40, 61, 75]),
    sequential: brandTones(seed, dark ? [19, 34, 58, 74, 90] : [95, 81, 61, 40, 21], 24),
  }
}

/** Remplace dans une option ECharts les couleurs de la palette par défaut par celles demandées. */
export function remapOption<T>(value: T, map: Map<string, string>): T {
  if (typeof value === 'string') return (map.get(value.toLowerCase()) ?? value) as T
  if (Array.isArray(value)) return value.map((v) => remapOption(v, map)) as T
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, remapOption(v, map)])) as T
  }
  return value
}

/** Table de correspondance : couleurs écrites par les graphiques → couleurs à afficher. */
export function chartColorMap(seed: string, mode: 'light' | 'dark'): Map<string, string> {
  const map = new Map<string, string>(mode === 'dark' ? LIGHT_TO_DARK : [])
  if (mode === 'light' && isDefaultBrand(seed)) return map
  const colors = chartColorsFor(seed, mode)
  SERIES.forEach((c, i) => map.set(c, colors.series[i] ?? NEUTRAL))
  ORDINAL.forEach((c, i) => map.set(c, colors.ordinal[i]))
  SEQUENTIAL.forEach((c, i) => map.set(c, colors.sequential[i]))
  map.set(MAP_AREA_HOVER, colors.sequential[0])
  return map
}
