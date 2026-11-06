import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { PersonIdentifier, PersonIdentifierType } from '@/types/PersonIdentifier'
import IdentifiersSection from './IdentifiersSection'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <span>{alt}</span>,
}))

const person = {
  uid: 'p1',
  slug: 'person:marie-curie',
  getIdentifiers: () => [
    new PersonIdentifier(PersonIdentifierType.ID_HAL_S, 'marie-curie'),
    new PersonIdentifier(PersonIdentifierType.EPPN, 'marie@univ.fr'),
  ],
}

const renderSection = (isOwn = true) =>
  render(
    <I18nProvider i18n={i18n}>
      <IdentifiersSection person={person} displayName='Marie Curie' isOwn={isOwn} />
    </I18nProvider>,
  )

describe('IdentifiersSection', () => {
  beforeEach(() => {
    localStorage.clear()
    i18n.loadAndActivate({ locale: 'fr', messages: {} })
  })

  it('affiche IdRef, HAL et ORCID, renseignés ou non, sans les identifiants techniques', () => {
    renderSection()

    expect(screen.getByRole('link', { name: 'marie-curie' })).toHaveAttribute('href', expect.stringContaining('marie-curie'))
    expect(screen.getAllByText('Non renseigné')).toHaveLength(2)
    expect(screen.queryByText('marie@univ.fr')).not.toBeInTheDocument()
  })

  it('refuse un format invalide, puis enregistre et conserve l’identifiant', () => {
    const { unmount } = renderSection()

    fireEvent.click(screen.getByRole('button', { name: 'Ajouter l’identifiant ORCID' }))
    const input = screen.getByLabelText('Identifiant ORCID')
    fireEvent.change(input, { target: { value: '1234' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))
    expect(screen.getByText(/Format attendu/)).toBeInTheDocument()

    fireEvent.change(input, { target: { value: '0000-0002-1825-0097' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))
    expect(screen.getByRole('link', { name: '0000-0002-1825-0097' })).toBeInTheDocument()

    unmount()
    renderSection()
    expect(screen.getByRole('link', { name: '0000-0002-1825-0097' })).toBeInTheDocument()
  })

  it('demande confirmation avant de supprimer un identifiant', async () => {
    renderSection()

    fireEvent.click(screen.getByRole('button', { name: 'Supprimer l’identifiant HAL' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Annuler' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(screen.getByRole('link', { name: 'marie-curie' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Supprimer l’identifiant HAL' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Supprimer' }))
    await waitFor(() => expect(screen.queryByRole('link', { name: 'marie-curie' })).not.toBeInTheDocument())
    expect(screen.getAllByText('Non renseigné')).toHaveLength(3)
  })

  it('réserve la liaison de compte à la personne elle-même', () => {
    const { unmount } = renderSection(true)
    fireEvent.click(screen.getByRole('button', { name: 'Lier mon compte HAL' }))
    expect(screen.getByText('Compte lié')).toBeInTheDocument()
    unmount()

    localStorage.clear()
    renderSection(false)
    expect(screen.getByText('Identifiants de Marie Curie')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Lier mon compte/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Modifier l’identifiant HAL' })).toBeInTheDocument()
  })
})
