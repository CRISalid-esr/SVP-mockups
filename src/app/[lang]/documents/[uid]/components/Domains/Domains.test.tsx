import useStore from '@/stores/global_store'
import { BibliographicPlatform } from '@/types/BibliographicPlatform'
import '@testing-library/jest-dom'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import Domains from './Domains'
import { getDepositDomains } from './domainsMock'

jest.mock('@/stores/global_store', () => ({
  __esModule: true,
  default: jest.fn(),
}))

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(''),
}))

const renderFor = (uid: string, { inHal = false, hasAbstract = true } = {}) => {
  ;(useStore as unknown as jest.Mock).mockImplementation((selector) =>
    selector({
      document: {
        selectedDocument: {
          uid,
          abstracts: hasAbstract ? [{ language: 'fr', value: 'Résumé' }] : [],
          records: inHal ? [{ platform: BibliographicPlatform.HAL }] : [],
        },
      },
    }),
  )
  return render(<Domains />)
}

describe('Domains', () => {
  beforeEach(() => {
    localStorage.clear()
    mockPush.mockClear()
  })
  afterEach(() => jest.useRealTimers())

  it('affiche les 4 niveaux, chaque origine et replie les sujets OpenAlex au-delà de 5', () => {
    renderFor('doc-1', { inHal: true })

    expect(screen.getByText('Sciences physiques › Informatique › Intelligence artificielle')).toBeInTheDocument()
    expect(screen.getByText('Neural Networks and Applications')).toBeInTheDocument()
    expect(screen.getByText('0,98')).toBeInTheDocument()
    expect(screen.getByText('Land Use and Ecosystem Services')).toBeInTheDocument()
    expect(screen.getByText('Proposé')).toBeInTheDocument()
    expect(screen.getByText('Saisi à la main')).toBeInTheDocument()

    expect(screen.queryByText('Precipitation Measurement and Analysis')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Voir 2 autres sujets OpenAlex' }))
    expect(screen.getByText('Precipitation Measurement and Analysis')).toBeInTheDocument()

    expect(screen.getByText('HAL, principal')).toBeInTheDocument()
    expect(screen.getByText('Attribué')).toBeInTheDocument()
    expect(screen.getByText(/ne modifient pas la notice HAL/)).toBeInTheDocument()
  })

  it('ne propose pas de retirer un sujet OpenAlex ni un domaine moissonné', () => {
    renderFor('doc-1', { inHal: true })

    expect(screen.queryByRole('button', { name: 'Retirer Neural Networks and Applications' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Retirer Informatique \/ Apprentissage/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Retirer Sciences de l'environnement/ })).toBeInTheDocument()
  })

  it('valide une proposition, et une proposition écartée ne revient pas à la génération suivante', () => {
    jest.useFakeTimers()
    renderFor('doc-1', { inHal: true })

    fireEvent.click(screen.getByRole('button', { name: 'Écarter Land Use and Ecosystem Services' }))
    expect(screen.getByText(/Écartés \(1\)/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Générer' }))
    act(() => {
      jest.runAllTimers()
    })
    expect(screen.getByRole('button', { name: 'Valider Data Mining Algorithms and Applications' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Valider Land Use and Ecosystem Services' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Valider Data Mining Algorithms and Applications' }))
    expect(screen.getByText('Validé')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retirer Data Mining Algorithms and Applications' })).toBeInTheDocument()
  })

  it('génère depuis un document sans domaine, puis annonce quand il n’y a rien de neuf', () => {
    jest.useFakeTimers()
    renderFor('doc-2')

    expect(screen.getByText('Aucun domaine pour ce document')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Générer des propositions' }))
    expect(screen.getByText(/Recherche de sujets/)).toBeInTheDocument()
    act(() => {
      jest.runAllTimers()
    })
    expect(screen.getByText('Quantum Mechanics and Applications')).toBeInTheDocument()
    expect(screen.queryByText('Aucun domaine pour ce document')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Générer' }))
    act(() => {
      jest.runAllTimers()
    })
    expect(screen.getByText('Pas de nouvelle proposition pour ce document.')).toBeInTheDocument()
  })

  it("prévient avant de générer d'après le titre seul et le signale sur les propositions", () => {
    jest.useFakeTimers()
    renderFor('doc-4', { hasAbstract: false })

    expect(screen.getByText(/d'après le titre seul/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Générer des propositions' }))
    act(() => {
      jest.runAllTimers()
    })
    expect(screen.getAllByText('Proposé, d’après le titre seul')).toHaveLength(2)
  })

  it('garde les domaines existants quand la génération tombe en panne', () => {
    jest.useFakeTimers()
    renderFor('doc-3')

    fireEvent.click(screen.getByRole('button', { name: 'Génération en panne' }))
    fireEvent.click(screen.getByRole('button', { name: 'Générer' }))
    act(() => {
      jest.runAllTimers()
    })
    expect(screen.getByText(/La génération n'a pas abouti/)).toBeInTheDocument()
    expect(screen.getByText('Fluid Dynamics and Turbulent Flows')).toBeInTheDocument()
  })

  it('ajoute un sujet par la recherche, sur les niveaux français comme sur le sujet', async () => {
    renderFor('doc-2')

    fireEvent.click(screen.getByRole('button', { name: 'Ajouter un domaine' }))
    const dialog = screen.getByRole('dialog')
    fireEvent.change(within(dialog).getByLabelText('Rechercher un sujet ou une discipline'), {
      target: { value: 'écologie' },
    })
    fireEvent.click(within(dialog).getByRole('checkbox', { name: /Coastal wetland/ }))
    expect(within(dialog).getByText(/Sélection \(1\)/)).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Ajouter (1)' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByText('Coastal wetland ecosystem dynamics')).toBeInTheDocument()
    expect(screen.getByText('Saisi à la main')).toBeInTheDocument()
  })

  it('reprend les domaines attribués pour le dépôt et mène au formulaire', async () => {
    renderFor('doc-2')

    fireEvent.click(screen.getByRole('button', { name: 'Attribuer' }))
    const dialog = screen.getByRole('dialog')
    fireEvent.change(within(dialog).getByLabelText('Domaines HAL'), { target: { value: 'Physique Quantique' } })
    fireEvent.click(within(document.body).getByRole('option', { name: /Physique Quantique/ }))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Attribuer (1)' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    expect(getDepositDomains('doc-2')).toEqual(['phys.qphy'])
    fireEvent.click(screen.getByRole('button', { name: 'Déposer dans HAL' }))
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('tab=hal_deposit'))
    // La liste complète des domaines HAL rend ce test lent quand toute la suite tourne en parallèle.
  }, 30000)

  it('reprend aussi les domaines moissonnés pour le dépôt', () => {
    expect(getDepositDomains('doc-1')).toEqual(['info.info-lg', 'sdu.ocean', 'sde.mcg'])
  })

  it.each([
    ['Sans droit de modification', false],
    ['Document figé', true],
  ])('reste en lecture seule : %s', (mode, showsFrozenNotice) => {
    renderFor('doc-1', { inHal: true })

    fireEvent.click(screen.getByRole('button', { name: mode as string }))
    ;['Générer', 'Ajouter', 'Attribuer'].forEach((name) =>
      expect(screen.queryByRole('button', { name })).not.toBeInTheDocument(),
    )
    expect(screen.queryByRole('button', { name: /^Valider/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Retirer/ })).not.toBeInTheDocument()
    expect(screen.getByText('Proposé')).toBeInTheDocument()
    expect(screen.queryAllByText(/en cours de mise à jour/).length > 0).toBe(showsFrozenNotice)
  })

  it('conserve les choix après rechargement', () => {
    const { unmount } = renderFor('doc-1', { inHal: true })
    fireEvent.click(screen.getByRole('button', { name: 'Valider Land Use and Ecosystem Services' }))
    unmount()

    renderFor('doc-1', { inHal: true })
    expect(screen.getByText('Validé')).toBeInTheDocument()
    expect(screen.queryByText('Proposé')).not.toBeInTheDocument()
  })
})
