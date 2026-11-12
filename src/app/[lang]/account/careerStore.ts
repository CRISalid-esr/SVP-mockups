/**
 * Affiliations passées proposées par le graphe : confirmées ou écartées dans
 * Mon compte, par personne (maquette, localStorage). Le CV reprend les confirmées.
 */
const keyOf = (slug: string) => `career-decisions-v1-${slug}`

export interface CareerDecisions {
  confirmed: string[]
  dismissed: string[]
}

const EMPTY: CareerDecisions = { confirmed: [], dismissed: [] }

export const loadCareerDecisions = (slug: string | null | undefined): CareerDecisions => {
  if (!slug || typeof window === 'undefined') return EMPTY
  try {
    const raw = localStorage.getItem(keyOf(slug))
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as CareerDecisions) } : EMPTY
  } catch {
    return EMPTY
  }
}

export const saveCareerDecisions = (slug: string, decisions: CareerDecisions) => {
  try {
    localStorage.setItem(keyOf(slug), JSON.stringify(decisions))
  } catch {
    /* stockage indisponible : la décision reste en mémoire */
  }
}
