'use client'

import useStore from '@/stores/global_store'
import { mockService } from '@/mocks/mockService'

export type PerspectiveScope = 'own' | 'person' | 'structure'

/** Niveaux proposés par le moteur de recherche. */
export type StructureLevel = 'institution' | 'unit' | 'other' | 'team'

/** Niveau d'une structure, d'après les données de la maquette (le modèle ResearchStructure ne le porte pas). */
export const structureLevelOf = (uid: string | null | undefined): StructureLevel => {
  const data = uid ? mockService.getResearchStructureByUid(uid) : null
  if (data?.generic_type === 'institution') return 'institution'
  if (data?.generic_type === 'team') return 'team'
  if (data?.generic_type === 'unit' && data.main_mission === 'research' && data.national_type !== 'Pôle') return 'unit'
  return 'other'
}

/**
 * Ce que la perspective courante impose aux pages : son propre profil (édition),
 * celui d'une autre personne (lecture seule) ou celui d'une structure (vue agrégée).
 * Tant que la perspective n'est pas résolue, on reste sur son propre profil.
 */
export const usePerspectiveScope = (): PerspectiveScope => {
  const { currentPerspective, ownPerspective } = useStore((state) => state.user)
  if (!currentPerspective || ownPerspective) return 'own'
  return currentPerspective.type === 'research_structure' ? 'structure' : 'person'
}

/** Répartit un slug sur n entrées de démo : même perspective, mêmes données à chaque visite. */
export const demoIndex = (slug: string | null | undefined, n: number): number => {
  if (!slug || n <= 0) return 0
  let hash = 0
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return hash % n
}
