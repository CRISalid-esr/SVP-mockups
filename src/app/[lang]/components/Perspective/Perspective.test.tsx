import { act, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import DocumentHeader from '@/app/[lang]/documents/components/DocumentHeader'
import PerspectiveBanner from './PerspectiveBanner'
import PerspectiveSwitcher from './PerspectiveSwitcher'
import PerspectivePicker from './PerspectivePicker'
import { usePerspectiveUi } from './perspectiveUiStore'
import { demoIndex, structureLevelOf, usePerspectiveScope } from './usePerspectiveScope'
import { mockService } from '@/mocks/mockService'
import { ResearchStructure } from '@/types/ResearchStructure'

const mockPush = jest.fn()
let mockPathname = '/fr/expertise-v2'
let mockSearch = ''

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams(mockSearch),
}))

const agent = (type: 'person' | 'research_structure', name: string, slug: string, uid = slug) => ({
  type,
  uid,
  slug,
  getDisplayName: () => name,
  membershipAcronyms: type === 'person' ? ['LS2N'] : [name],
})
const JEAN = { ...agent('person', 'Jean Dupont', 'jean-dupont'), memberships: [] }

let mockUser: Record<string, unknown>
const person = { fetchPeopleByName: jest.fn(() => Promise.resolve()), people: [], loading: false }
const researchStructure = { fetchResearchStructuresByName: jest.fn(() => Promise.resolve()), researchStructures: [], loading: false }

jest.mock('@/stores/global_store', () => ({
  __esModule: true,
  default: (selector: (s: unknown) => unknown) => selector({ user: mockUser, person, researchStructure }),
}))

const viewing = (perspective: unknown, own = false) => {
  mockUser = { currentPerspective: perspective, ownPerspective: own, connectedUser: { person: JEAN } }
}

const ScopeProbe = () => <span data-testid='scope'>{usePerspectiveScope()}</span>

describe('sélecteur de perspective', () => {
  beforeEach(() => {
    localStorage.clear()
    mockPush.mockClear()
    mockPathname = '/fr/expertise-v2'
    mockSearch = ''
    act(() => usePerspectiveUi.setState({ variant: 'sidebar', anchorEl: null }))
  })

  it('option A : le bouton de la barre latérale et le bandeau apparaissent, pas le titre-sélecteur', () => {
    viewing(agent('person', 'Marie Curie', 'marie-curie'))
    render(<><PerspectiveSwitcher /><PerspectiveBanner /><DocumentHeader perspectiveName='Marie Curie' pageName='Page' /></>)

    expect(screen.getByRole('region')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Marie Curie/ })).toHaveLength(1)
    expect(screen.getByRole('heading', { name: /Page : Marie Curie/ })).toBeInTheDocument()
  })

  it('option B : le nom du titre devient le sélecteur, sans bandeau ni bouton latéral', () => {
    viewing(agent('person', 'Marie Curie', 'marie-curie'))
    act(() => usePerspectiveUi.getState().setVariant('title'))
    render(<><PerspectiveSwitcher /><PerspectiveBanner /><DocumentHeader perspectiveName='Marie Curie' pageName='Page' /></>)

    expect(screen.queryByRole('region')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Marie Curie/ }))
    expect(usePerspectiveUi.getState().anchorEl).not.toBeNull()
  })

  it('option B : propose le retour à son espace seulement quand on consulte un autre espace', () => {
    act(() => usePerspectiveUi.getState().setVariant('title'))
    viewing(JEAN, true)
    const { unmount } = render(<DocumentHeader perspectiveName='Jean Dupont' pageName='Page' />)
    expect(screen.getAllByRole('button')).toHaveLength(1)
    unmount()

    viewing(agent('person', 'Marie Curie', 'marie-curie'))
    mockSearch = 'perspective=marie-curie'
    render(<DocumentHeader perspectiveName='Marie Curie' pageName='Page' />)
    fireEvent.click(screen.getAllByRole('button')[1])
    expect(mockPush).toHaveBeenCalledWith('/fr/expertise-v2', { scroll: false })
  })

  it('mémorise la variante choisie', () => {
    act(() => usePerspectiveUi.getState().setVariant('title'))
    act(() => usePerspectiveUi.setState({ variant: 'sidebar' }))
    act(() => usePerspectiveUi.getState().restoreVariant())
    expect(usePerspectiveUi.getState().variant).toBe('title')
  })

  it('à l’ouverture, présente tous les chercheurs et les structures par niveau, sans « Mes structures »', () => {
    viewing(JEAN, true)
    person.people = [JEAN, agent('person', 'Marie Curie', 'marie-curie'), agent('person', 'Thomas Renaud', 'thomas-renaud')] as never[]
    researchStructure.researchStructures = [
      agent('research_structure', 'NU', 'nantes-universite', 'inst-nu'),
      agent('research_structure', 'Labo X', 'labo-x', 'lab-x'),
      agent('research_structure', 'UFR Sciences', 'ufr-sciences', 'comp-ufr-st'),
      agent('research_structure', 'Équipe 2', 'labo-x-equipe-2', 'team-labo-x-2'),
    ] as never[]
    render(<PerspectivePicker />)
    act(() => usePerspectiveUi.getState().openPicker(document.body))

    expect(screen.getByRole('menuitem', { name: /Marie Curie/ })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Thomas Renaud/ })).toBeInTheDocument()
    expect(screen.getAllByRole('menuitem', { name: /Jean Dupont/ })).toHaveLength(1)
    const headings = screen.getAllByRole('menu')[0].querySelectorAll('.MuiListSubheader-root')
    expect([...headings].map((h) => h.textContent)).toEqual([
      'perspective_switcher_own',
      'perspective_picker_people',
      'perspective_picker_institutions',
      'perspective_picker_units',
      'perspective_picker_other_structures',
      'perspective_picker_teams',
    ])
  })

  it('choisir une structure depuis une page non compatible mène au tableau de bord', () => {
    mockPathname = '/fr/rights'
    viewing(JEAN, true)
    person.people = []
    researchStructure.researchStructures = [agent('research_structure', 'LS2N', 'ls2n', 'lab-ls2n')] as never[]
    render(<PerspectivePicker />)
    act(() => usePerspectiveUi.getState().openPicker(document.body))

    fireEvent.click(screen.getByRole('menuitem', { name: /LS2N/ }))
    expect(mockPush).toHaveBeenCalledWith('/fr/dashboard?perspective=ls2n', { scroll: false })
  })

  it('le moteur trouve une structure par son sigle et connaît les niveaux demandés', () => {
    const slugs = (q: string) => mockService.getResearchStructures(q).researchStructures.map((s) => s.slug)
    // Toutes les structures simulées doivent pouvoir être chargées par le modèle.
    expect(() => mockService.getResearchStructures().researchStructures.map((s) => ResearchStructure.fromJson(s as never))).not.toThrow()
    expect(slugs('LS2N')).toContain('ls2n')
    expect(slugs('Labo X')).toEqual(expect.arrayContaining(['labo-x', 'labo-x-equipe-2']))
    expect(structureLevelOf('inst-nu')).toBe('institution')
    expect(structureLevelOf('lab-x')).toBe('unit')
    expect(structureLevelOf('team-labo-x-2')).toBe('team')
    expect(structureLevelOf('unit-bu')).toBe('other')
  })

  it.each([
    [JEAN, true, 'own'],
    [agent('person', 'Marie Curie', 'marie-curie'), false, 'person'],
    [agent('research_structure', 'LS2N', 'ls2n'), false, 'structure'],
    [null, false, 'own'],
  ])('déduit la portée de la perspective (%#)', (perspective, own, expected) => {
    viewing(perspective, own)
    render(<ScopeProbe />)
    expect(screen.getByTestId('scope')).toHaveTextContent(expected)
  })

  it('attribue des données de démo stables à une perspective', () => {
    expect(demoIndex('marie-curie', 10)).toBe(demoIndex('marie-curie', 10))
    expect(demoIndex('marie-curie', 10)).toBeLessThan(10)
    expect(demoIndex(null, 10)).toBe(0)
  })
})
