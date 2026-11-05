import { create } from 'zustand'

/** À changer pour reproposer la visite à tout le monde après une refonte de son contenu. */
export const ONBOARDING_KEY = 'svp-onboarding-v1'

interface OnboardingState {
  active: boolean
  index: number
  /**
   * Visite déjà fermée dans ce chargement. Chaque rubrique remonte MainLayout : ce drapeau évite
   * de relancer la visite à chaque page si le stockage du navigateur est indisponible.
   */
  closed: boolean
  autoStart: () => void
  start: () => void
  goTo: (index: number) => void
  close: () => void
}

export const useOnboarding = create<OnboardingState>((set, get) => ({
  active: false,
  index: 0,
  closed: false,
  autoStart: () => {
    if (get().active || get().closed) return
    let seen = false
    try {
      seen = localStorage.getItem(ONBOARDING_KEY) !== null
    } catch {
      /* stockage indisponible : la visite sera proposée une fois par chargement */
    }
    if (seen) set({ closed: true })
    else set({ active: true, index: 0 })
  },
  start: () => set({ active: true, index: 0 }),
  goTo: (index) => set({ index }),
  close: () => {
    try {
      localStorage.setItem(ONBOARDING_KEY, 'done')
    } catch {
      /* stockage indisponible : le choix vaut pour ce chargement */
    }
    set({ active: false, closed: true })
  },
}))
