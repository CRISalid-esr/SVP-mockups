import { create } from 'zustand'

/** Maquette : deux emplacements du sélecteur à comparer (A = barre latérale, B = titre de page). */
export type PerspectiveVariant = 'sidebar' | 'title'

const VARIANT_KEY = 'svp-perspective-variant'

/**
 * État d'interface partagé du sélecteur de perspective.
 * Le sélecteur peut être ouvert depuis la barre latérale, le bandeau ou le titre :
 * on retient l'élément d'ancrage pour que le menu s'ouvre là où l'on a cliqué.
 */
interface PerspectiveUiState {
  anchorEl: HTMLElement | null
  openPicker: (anchor: HTMLElement) => void
  closePicker: () => void
  variant: PerspectiveVariant
  setVariant: (variant: PerspectiveVariant) => void
  /** Relit le choix mémorisé, après le montage pour éviter un écart d'hydratation. */
  restoreVariant: () => void
}

export const usePerspectiveUi = create<PerspectiveUiState>((set) => ({
  anchorEl: null,
  openPicker: (anchor) => set({ anchorEl: anchor }),
  closePicker: () => set({ anchorEl: null }),
  variant: 'sidebar',
  setVariant: (variant) => {
    try {
      localStorage.setItem(VARIANT_KEY, variant)
    } catch {
      /* stockage indisponible : le choix vaut pour cette visite */
    }
    set({ variant, anchorEl: null })
  },
  restoreVariant: () => {
    try {
      if (localStorage.getItem(VARIANT_KEY) === 'title') set({ variant: 'title' })
    } catch {
      /* stockage indisponible : on garde la variante par défaut */
    }
  },
}))
