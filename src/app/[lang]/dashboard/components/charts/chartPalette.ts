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
  if (typeof value === 'string') return toDark(value) as T
  if (Array.isArray(value)) return value.map((v) => darkenOption(v)) as T
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, darkenOption(v)])) as T
  }
  return value
}
