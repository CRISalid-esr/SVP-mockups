import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ACTIVITY_TYPES } from './components/activityTypes'
import ResearchActivitiesPage from './page'

jest.mock('@/stores/global_store', () => ({
  __esModule: true,
  default: (selector: (state: unknown) => unknown) =>
    selector({ user: { currentPerspective: { getDisplayName: () => 'Jean Dupont' }, ownPerspective: true } }),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/fr/research-activities',
  useSearchParams: () => new URLSearchParams(),
}))

const cards = () => screen.getAllByRole('article', { hidden: true })

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a: string, b: string) => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

describe('couleurs des types d’activité', () => {
  it.each(Object.entries(ACTIVITY_TYPES))('%s reste lisible', (_type, style) => {
    expect(contrast('#FFFFFF', style.main)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(style.ink, style.tint)).toBeGreaterThanOrEqual(4.5)
  })
})

describe('ResearchActivitiesPage', () => {
  it('affiche une carte par activité, avec son type et sa période', () => {
    render(<ResearchActivitiesPage />)

    expect(cards()).toHaveLength(8)
    const card = screen.getByRole('heading', { name: 'ANR DeepLearning4Science' }).closest('article') as HTMLElement
    expect(within(card).getByText('Projet')).toBeInTheDocument()
    expect(within(card).getByText(/janv\. 2023/)).toBeInTheDocument()
    expect(within(card).getByText('450 000 €')).toBeInTheDocument()
  })

  it('limite une carte à deux informations propres au type', () => {
    render(<ResearchActivitiesPage />)

    const card = screen.getByRole('heading', { name: /Intelligence Artificielle Avancée/ }).closest('article') as HTMLElement
    expect(within(card).getByText('Université de Nantes')).toBeInTheDocument()
    expect(within(card).queryByText('48')).not.toBeInTheDocument()
  })

  it('n’annonce pas « en cours » pour une activité ponctuelle', () => {
    render(<ResearchActivitiesPage />)

    const prize = screen.getByRole('heading', { name: /Prix jeune chercheur/ }).closest('article') as HTMLElement
    expect(within(prize).getByText('juin 2024')).toBeInTheDocument()
    const editor = screen.getByRole('heading', { name: /Éditeur associé/ }).closest('article') as HTMLElement
    expect(within(editor).getByText(/en cours/)).toBeInTheDocument()
  })

  it('filtre par type et par année, puis réinitialise', () => {
    render(<ResearchActivitiesPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Type' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Brevets' }))
    expect(cards()).toHaveLength(1)
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })

    fireEvent.click(screen.getByRole('button', { name: /documents_page_reset_filters/, hidden: true }))
    expect(cards()).toHaveLength(8)

    fireEvent.click(screen.getByRole('button', { name: 'Année', hidden: true }))
    fireEvent.change(screen.getByLabelText('documents_page_year_from'), { target: { value: '2030' } })
    // L'activité sans date de fin est toujours en cours : elle reste affichée.
    expect(screen.getByRole('heading', { name: /Éditeur associé/, hidden: true })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Stage M2/, hidden: true })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Prix jeune chercheur/, hidden: true })).not.toBeInTheDocument()
  })

  const openForm = (typeName: RegExp) => {
    fireEvent.click(screen.getByRole('button', { name: /Ajouter une activité/ }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: typeName }))
    return screen.getByRole('dialog')
  }

  it('ajoute une activité après avoir expliqué ce qui manque', async () => {
    render(<ResearchActivitiesPage />)
    const dialog = openForm(/^Projet/)

    fireEvent.click(within(dialog).getByRole('button', { name: 'Ajouter l’activité' }))
    expect(within(dialog).getByText('Indiquez un intitulé.')).toBeInTheDocument()
    expect(within(dialog).getByText('Indiquez une date.')).toBeInTheDocument()

    fireEvent.change(within(dialog).getByLabelText(/Intitulé/), { target: { value: 'Projet Horizon' } })
    fireEvent.change(within(dialog).getByLabelText(/Début/), { target: { value: '2024-01-15' } })
    fireEvent.change(within(dialog).getByLabelText(/Fin/), { target: { value: '2023-01-15' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Ajouter l’activité' }))
    expect(within(dialog).getByText('La fin doit suivre le début.')).toBeInTheDocument()

    fireEvent.change(within(dialog).getByLabelText(/Fin/), { target: { value: '' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Ajouter l’activité' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    const card = screen.getByRole('heading', { name: 'Projet Horizon' }).closest('article') as HTMLElement
    expect(within(card).getByText(/en cours/)).toBeInTheDocument()
    // Une activité sans description ne casse pas la recherche.
    fireEvent.change(screen.getByLabelText('documents_page_search_placeholder'), { target: { value: 'horizon' } })
    expect(cards()).toHaveLength(1)
  })

  it('ne demande qu’une date pour une activité ponctuelle', () => {
    render(<ResearchActivitiesPage />)
    const dialog = openForm(/^Distinction/)

    expect(within(dialog).getByLabelText(/^Date/)).toBeInTheDocument()
    expect(within(dialog).queryByLabelText(/^Fin/)).not.toBeInTheDocument()
    expect(within(dialog).getByLabelText('Organisation')).toBeInTheDocument()
  })

  it('refuse une adresse qui n’est pas un lien web', () => {
    render(<ResearchActivitiesPage />)
    const dialog = openForm(/^Projet/)

    fireEvent.change(within(dialog).getByLabelText('Site web'), { target: { value: 'javascript:alert(1)' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Ajouter l’activité' }))
    expect(within(dialog).getByText(/commençant par https/)).toBeInTheDocument()
  })

  it('garde la saisie commune en changeant de type', () => {
    render(<ResearchActivitiesPage />)
    const dialog = openForm(/^Projet/)

    fireEvent.change(within(dialog).getByLabelText(/Intitulé/), { target: { value: 'Mon intitulé' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Changer de type' }))
    fireEvent.click(within(dialog).getByRole('button', { name: /^Brevet/ }))

    expect(within(dialog).getByLabelText(/Intitulé/)).toHaveValue('Mon intitulé')
    expect(within(dialog).getByLabelText('Numéro de dépôt')).toBeInTheDocument()
  })

  it('ouvre une activité existante directement sur son formulaire', () => {
    render(<ResearchActivitiesPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Actions sur ANR DeepLearning4Science' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Modifier' }))

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByLabelText(/Intitulé/)).toHaveValue('ANR DeepLearning4Science')
    expect(within(dialog).queryByRole('button', { name: 'Changer de type' })).not.toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Enregistrer' })).toBeInTheDocument()
  })

  it('demande confirmation avant de supprimer une activité', async () => {
    render(<ResearchActivitiesPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Actions sur ANR DeepLearning4Science' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Supprimer' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/ANR DeepLearning4Science/)).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Supprimer' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(cards()).toHaveLength(7)
  })
})
