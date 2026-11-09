import useStore from '@/stores/global_store'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import HalDeposit from './HalDeposit'

jest.mock('@/stores/global_store', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

const renderDeposit = () => {
  ;(useStore as unknown as jest.Mock).mockImplementation((selector) =>
    selector({
      document: {
        selectedDocument: {
          uid: 'doc-test',
          documentType: 'Article',
          publicationDate: '2023-05-15',
          titles: [{ language: 'en', value: 'A deep learning approach' }],
          abstracts: [],
          journal: { title: 'Journal of Climate Research' },
          records: [{ platform: 'scopus' }],
          contributions: [
            { person: { displayName: 'Jean Dupont' }, roles: [], rank: 1 },
            { person: { displayName: 'Sophie Martin' }, roles: [], rank: 2 },
          ],
        },
      },
    }),
  )
  return render(<HalDeposit />)
}

describe('HalDeposit', () => {
  beforeEach(() => localStorage.clear())

  it('reprend la notice et la revue de « Paru dans »', () => {
    renderDeposit()

    expect(screen.getByText('Étape 1 sur 2')).toBeInTheDocument()
    expect(screen.getByText('Jean Dupont, Sophie Martin')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Nom de la revue *' })).toHaveValue('Journal of Climate Research')
    expect(screen.getByText('Repris de « Paru dans ».')).toBeInTheDocument()
  })

  it('dit ce qui manque au lieu de ne rien faire', () => {
    renderDeposit()

    expect(screen.getByText('2 informations obligatoires à compléter')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Vérifier le dépôt' }))
    expect(screen.getByText('Étape 1 sur 2')).toBeInTheDocument()
    expect(screen.getByText('Au moins un domaine HAL · Fichier principal (PDF)')).toBeInTheDocument()
  })

  it('affiche le statut d’un dépôt déjà envoyé, avec la zone de simulation', () => {
    localStorage.setItem(
      'hal-deposit-status-doc-test',
      JSON.stringify({ step: 'moderation', submittedAt: '2026-11-09T10:00:00Z', halId: 'hal-04851234', hasFile: true }),
    )
    renderDeposit()

    expect(screen.getByText('En cours de modération')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /hal-04851234/ })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Refusé' }))
    expect(screen.getByText('Dépôt refusé')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Déposer à nouveau' })).toBeInTheDocument()
  })
})
