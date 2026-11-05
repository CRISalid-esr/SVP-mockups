import { act, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import OnboardingTour from './OnboardingTour'
import { ONBOARDING_KEY, useOnboarding } from './onboardingStore'
import { getTourSteps, placeCard } from './tourSteps'
import { HELP_PAGES, helpUrl, HelpLink } from '../HelpLink'

const mockPush = jest.fn()
let mockPathname = '/fr/dashboard'
let mockSearch = ''

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams(mockSearch),
}))

jest.mock('@/stores/global_store', () => ({
  __esModule: true,
  default: (selector: (s: unknown) => unknown) => selector({ user: { connectedUser: { person: {} } } }),
}))

let mockMobile = false
jest.mock('@mui/system', () => ({
  ...jest.requireActual('@mui/system'),
  useMediaQuery: () => mockMobile,
}))

const next = () => fireEvent.click(screen.getByRole('button', { name: 'onboarding_next' }))

describe('visite guidée', () => {
  beforeEach(() => {
    localStorage.clear()
    mockPush.mockClear()
    mockPathname = '/fr/dashboard'
    mockSearch = ''
    mockMobile = false
    act(() => useOnboarding.setState({ active: false, index: 0, closed: false }))
  })

  it('se lance à la première visite', () => {
    render(<OnboardingTour />)
    expect(screen.getByRole('heading', { name: 'onboarding_welcome_title' })).toBeInTheDocument()
  })

  it('ne se relance pas si elle a déjà été vue', () => {
    localStorage.setItem(ONBOARDING_KEY, 'done')
    render(<OnboardingTour />)
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('Passer la ferme et la mémorise, sans la relancer au changement de page', () => {
    const { unmount } = render(<OnboardingTour />)
    fireEvent.click(screen.getByRole('button', { name: 'onboarding_skip' }))
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(localStorage.getItem(ONBOARDING_KEY)).toBe('done')
    unmount()
    render(<OnboardingTour />)
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('Suivant change de page quand l’étape l’exige, et une zone absente ne bloque pas', () => {
    render(<OnboardingTour />)
    next() // perspective
    next() // tableau de bord
    expect(mockPush).not.toHaveBeenCalled()
    next() // publications
    expect(mockPush).toHaveBeenCalledWith('/fr/documents', { scroll: false })
    expect(screen.getByRole('heading', { name: 'onboarding_documents_title' })).toBeInTheDocument()
  })

  it('quitte une autre perspective pour présenter son propre espace', () => {
    mockSearch = 'perspective=marie-curie'
    render(<OnboardingTour />)
    next()
    expect(mockPush).toHaveBeenCalledWith('/fr/dashboard', { scroll: false })
  })

  it('va jusqu’au bout, puis se relance à la demande', () => {
    render(<OnboardingTour />)
    getTourSteps().slice(1).forEach(next)
    expect(screen.queryByRole('button', { name: 'onboarding_skip' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'onboarding_finish' }))
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    act(() => useOnboarding.getState().start())
    expect(screen.getByRole('heading', { name: 'onboarding_welcome_title' })).toBeInTheDocument()
  })

  it('sur mobile, se limite à une carte d’accueil avec un lien vers l’aide', () => {
    mockMobile = true
    render(<OnboardingTour />)
    expect(screen.getByRole('link', { name: 'side_bar_help' })).toHaveAttribute('href', helpUrl())
    fireEvent.click(screen.getByRole('button', { name: 'onboarding_finish' }))
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('ne présente que le Profil de recherche 2', () => {
    const paths = getTourSteps().map((s) => s.path)
    expect(paths).toContain('expertise-v2')
    expect(paths).not.toContain('expertise')
  })

  it('place la carte à côté de la zone, sans jamais sortir de l’écran', () => {
    const card = { width: 380, height: 240 }
    const screenSize = { width: 1360, height: 820 }
    expect(placeCard(null, card, screenSize)).toEqual({ left: 490, top: 290 })
    // Barre latérale : à droite.
    expect(placeCard({ left: 16, top: 100, width: 248, height: 60 }, card, screenSize).left).toBe(280)
    // Ligne d'onglets pleine largeur : dessous.
    expect(placeCard({ left: 312, top: 100, width: 1016, height: 50 }, card, screenSize).top).toBe(166)
    // Bouton en bas à droite : au-dessus.
    expect(placeCard({ left: 1280, top: 740, width: 56, height: 56 }, card, screenSize).top).toBe(484)
    // Zone qui remplit l'écran : dans le coin.
    expect(placeCard({ left: 0, top: 0, width: 1360, height: 820 }, card, screenSize)).toEqual({ left: 964, top: 564 })
  })
})

describe('liens d’aide', () => {
  it('suit la langue de l’interface', () => {
    expect(helpUrl('assistant', 'fr')).toMatch(/\/guides\/assistant\/$/)
    expect(helpUrl('assistant', 'en')).toMatch(/\/en\/guides\/assistant\/$/)
    expect(helpUrl(undefined, 'en')).toMatch(/\/en\/$/)
  })

  it('ouvre la page dans un nouvel onglet', () => {
    render(<HelpLink topic='merge' />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', expect.stringContaining(HELP_PAGES.merge))
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('n’existe pas pour les rubriques sans page d’aide', () => {
    expect(Object.values(HELP_PAGES).join(' ')).not.toMatch(/expertise|activit|rights|droits|researchers|chercheurs/i)
  })
})
