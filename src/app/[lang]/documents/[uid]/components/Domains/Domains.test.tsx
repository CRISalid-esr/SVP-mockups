import useStore from '@/stores/global_store'
import { BibliographicPlatform } from '@/types/BibliographicPlatform'
import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
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

  it('met en avant le sujet principal OpenAlex et range les autres sujets par branche', () => {
    renderFor('doc-1', { inHal: true })

    expect(screen.getByText('Sujet principal')).toBeInTheDocument()
    expect(screen.getByText('Neural Networks and Applications')).toBeInTheDocument()
    expect(screen.getByText('OpenAlex, principal')).toBeInTheDocument()
    expect(screen.getByText('0,98')).toBeInTheDocument()
    expect(screen.getByText('Sciences physiques › Informatique › Intelligence artificielle')).toBeInTheDocument()

    expect(screen.getByText('Autres sujets')).toBeInTheDocument()
    expect(screen.getByText('Climate variability and models')).toBeInTheDocument()
    expect(screen.getAllByText('OpenAlex')).toHaveLength(2)
    expect(screen.getByText('Saisi à la main')).toBeInTheDocument()

    expect(screen.getByText('HAL, principal')).toBeInTheDocument()
    expect(screen.getByText('Attribué')).toBeInTheDocument()
    expect(screen.getByText(/ne modifient pas la notice HAL/)).toBeInTheDocument()
  })

  it("n'offre plus de bouton de génération", () => {
    renderFor('doc-1', { inHal: true })
    expect(screen.queryByRole('button', { name: /Générer/ })).not.toBeInTheDocument()

    renderFor('doc-2')
    expect(screen.queryByRole('button', { name: /Générer/ })).not.toBeInTheDocument()
  })

  it('replie les propositions automatiques quand OpenAlex a déjà classé la publication', () => {
    renderFor('doc-1', { inHal: true })

    expect(screen.queryByText('Land Use and Ecosystem Services')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Voir 2 propositions automatiques en complément' }))
    expect(screen.getByText('Land Use and Ecosystem Services')).toBeInTheDocument()
    expect(screen.getAllByText('Proposé')).toHaveLength(2)

    fireEvent.click(screen.getByRole('button', { name: 'Masquer les propositions automatiques' }))
    expect(screen.queryByText('Land Use and Ecosystem Services')).not.toBeInTheDocument()
  })

  it('ne propose pas de retirer un sujet OpenAlex ni un domaine moissonné', () => {
    renderFor('doc-1', { inHal: true })

    expect(screen.queryByRole('button', { name: 'Retirer Neural Networks and Applications' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Retirer Climate variability and models' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Retirer Informatique \/ Apprentissage/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Retirer Sciences de l'environnement/ })).toBeInTheDocument()
  })

  it('montre d’emblée les propositions d’un document sans notice OpenAlex, à valider ou écarter', () => {
    renderFor('doc-2')

    expect(screen.queryByText('Sujet principal')).not.toBeInTheDocument()
    expect(screen.queryByText('Aucun domaine pour ce document')).not.toBeInTheDocument()
    expect(screen.getAllByText('Proposé')).toHaveLength(3)

    fireEvent.click(screen.getByRole('button', { name: 'Écarter Atomic and Molecular Physics' }))
    expect(screen.getByText(/Écartés \(1\)/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Valider Atomic and Molecular Physics' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Rétablir' }))
    expect(screen.getByRole('button', { name: 'Valider Atomic and Molecular Physics' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Valider Quantum Mechanics and Applications' }))
    expect(screen.getByText('Validé')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retirer Quantum Mechanics and Applications' })).toBeInTheDocument()
  })

  it("signale les propositions faites d'après le titre seul", () => {
    renderFor('doc-4', { hasAbstract: false })

    expect(screen.getByText(/d'après le titre seul, elles sont moins fiables/)).toBeInTheDocument()
    expect(screen.getAllByText('Proposé, d’après le titre seul')).toHaveLength(2)
  })

  it('affiche un état vide avec l’ajout à la main quand rien n’a pu être proposé', () => {
    renderFor('doc-5')

    fireEvent.click(screen.getByRole('button', { name: 'Sans proposition automatique' }))
    expect(screen.getByText('Aucun domaine pour ce document')).toBeInTheDocument()
    expect(screen.getByText(/Aucun sujet n'a pu être proposé automatiquement/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ajouter un domaine' })).toBeInTheDocument()
  })

  it('ajoute un sujet par la recherche, sur les niveaux français comme sur le sujet', async () => {
    renderFor('doc-2')

    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }))
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
    fireEvent.click(screen.getByRole('button', { name: /propositions automatiques en complément/ }))
    ;['Ajouter', 'Attribuer'].forEach((name) =>
      expect(screen.queryByRole('button', { name })).not.toBeInTheDocument(),
    )
    expect(screen.queryByRole('button', { name: /^Valider/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Retirer/ })).not.toBeInTheDocument()
    expect(screen.getAllByText('Proposé')).toHaveLength(2)
    expect(screen.queryAllByText(/en cours de mise à jour/).length > 0).toBe(showsFrozenNotice)
  })

  it('conserve les choix après rechargement', () => {
    const { unmount } = renderFor('doc-1', { inHal: true })
    fireEvent.click(screen.getByRole('button', { name: /propositions automatiques en complément/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Valider Land Use and Ecosystem Services' }))
    unmount()

    renderFor('doc-1', { inHal: true })
    expect(screen.getByText('Validé')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Voir 1 proposition automatique en complément' })).toBeInTheDocument()
  })
})
