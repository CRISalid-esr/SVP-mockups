import useStore from '@/stores/global_store'
import { BibliographicPlatform } from '@/types/BibliographicPlatform'
import '@testing-library/jest-dom'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import HalUpdate from './HalUpdate'

jest.mock('@/stores/global_store', () => ({
  __esModule: true,
  default: jest.fn(),
}))

const renderFor = (uid: string, halSubmitType: string) => {
  ;(useStore as unknown as jest.Mock).mockImplementation((selector) =>
    selector({
      document: {
        selectedDocument: {
          uid,
          records: [
            {
              platform: BibliographicPlatform.HAL,
              sourceIdentifier: 'hal-01234567',
              url: 'https://hal.science/hal-01234567',
              halSubmitType,
            },
          ],
        },
      },
    }),
  )
  return render(<HalUpdate />)
}

describe('HalUpdate', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => jest.useRealTimers())

  it('coche les ajouts sûrs, mais ni le résumé externe ni les différences', () => {
    renderFor('doc-1', 'file')

    expect(screen.getByRole('checkbox', { name: /Mot-clé : Apprentissage profond/ })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /Résumé en anglais/ })).not.toBeChecked()
    expect(screen.getByText('À vérifier')).toBeInTheDocument()
    const differences = screen.getByRole('table', { name: 'Différences entre HAL et SoVisu+' })
    expect(within(differences).getByText('1er janvier 2023')).toBeInTheDocument()
    expect(within(differences).getByText('15 mai 2023')).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: /Date de publication/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Vérifier et envoyer (5)' })).toBeEnabled()
  })

  it("envoie uniquement la sélection, puis attend la mise à jour de HAL", () => {
    jest.useFakeTimers()
    renderFor('doc-1', 'file')

    fireEvent.click(screen.getByRole('checkbox', { name: /Mot-clé : Changement climatique/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Vérifier et envoyer (4)' }))
    expect(screen.getByText(/Rien d'autre ne sera modifié dans HAL/)).toBeInTheDocument()
    expect(screen.queryByText('Changement climatique')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Envoyer à HAL' }))
    expect(screen.getByText('Envoi vers HAL…')).toBeInTheDocument()

    act(() => {
      jest.runAllTimers()
    })
    expect(screen.getByText('Envoyé, en attente de mise à jour')).toBeInTheDocument()
    expect(screen.getByText(/4 informations envoyées à HAL/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Mise à jour reçue de HAL' }))
    expect(screen.getByText(/HAL a bien pris en compte/)).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: /Mot-clé : Changement climatique/ })).not.toBeChecked()
    expect(screen.queryByRole('checkbox', { name: /Apprentissage profond/ })).not.toBeInTheDocument()
  })

  it("signale un dépôt modifié entre-temps sans rien envoyer, puis met la liste à jour", () => {
    renderFor('doc-1', 'file')

    fireEvent.click(screen.getByRole('button', { name: 'Vérifier et envoyer (5)' }))
    fireEvent.click(screen.getByRole('button', { name: 'Notice modifiée entre-temps' }))
    expect(screen.getByText(/Rien n'a été envoyé/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Comparer à nouveau' }))
    expect(screen.getByText(/une information a déjà été ajoutée/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Vérifier et envoyer (4)' })).toBeInTheDocument()
  })

  it('demande le partage de propriété quand on ne possède pas le dépôt', async () => {
    renderFor('doc-6', 'notice')

    expect(screen.queryByRole('button', { name: /Vérifier et envoyer/ })).not.toBeInTheDocument()
    expect(screen.getByText(/collection LS2N/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Demander le partage de propriété' }))
    fireEvent.click(screen.getByRole('button', { name: 'Envoyer la demande' }))
    // Le reste de la page redevient accessible une fois le dialogue refermé.
    expect(await screen.findByRole('button', { name: 'Demande envoyée' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Demande acceptée' }))
    expect(screen.getByText(/a accepté de partager la propriété/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Vérifier et envoyer (3)' })).toBeEnabled()
  })

  it('indique pour qui agit un·e documentaliste', () => {
    renderFor('doc-1', 'file')

    fireEvent.click(screen.getByRole('button', { name: 'Documentaliste' }))
    expect(screen.getByText(/Vous agissez pour Jean Dupont/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Vérifier et envoyer (5)' }))
    expect(screen.getByText(/Envoi au nom de Jean Dupont/)).toBeInTheDocument()
  })

  it('ne repropose pas une information écartée, même après rechargement', () => {
    const { unmount } = renderFor('doc-1', 'file')

    fireEvent.click(screen.getByRole('button', { name: 'Ne plus proposer : Apprentissage profond' }))
    expect(screen.getByRole('button', { name: 'Vérifier et envoyer (4)' })).toBeInTheDocument()
    unmount()

    renderFor('doc-1', 'file')
    expect(screen.getByText('Écartées (1)')).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: /Apprentissage profond/ })).not.toBeInTheDocument()
  })
})
