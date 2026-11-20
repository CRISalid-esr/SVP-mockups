import { ResearchTheme } from '../types'

export const NODE_WIDTH = 240
const COLUMN_STEP = 400
const ROW_STEP = 170
const MAX_COLUMNS = 3

/**
 * Place les thèmes du plus ancien au plus récent, ligne après ligne. Les lignes paires sont décalées
 * d'une demi-colonne : une relation entre deux lignes ne passe ainsi jamais derrière un thème.
 * L'ordre ne dépend pas des relations : en ajouter une ne déplace rien.
 */
export function defaultPositions(themes: ResearchTheme[]): Record<string, { x: number; y: number }> {
  const columns = Math.min(MAX_COLUMNS, Math.max(1, Math.ceil(Math.sqrt(themes.length))))
  const chronological = [...themes].sort((a, b) => (a.yearFrom ?? Infinity) - (b.yearFrom ?? Infinity))

  return Object.fromEntries(
    chronological.map((theme, index) => {
      const row = Math.floor(index / columns)
      const column = index % columns
      return [theme.id, { x: column * COLUMN_STEP + (row % 2) * (COLUMN_STEP / 2), y: row * ROW_STEP }]
    }),
  )
}
