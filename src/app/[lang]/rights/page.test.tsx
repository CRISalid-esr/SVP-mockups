import { fireEvent, render, screen, within } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import RightsPage from './page'

const renderPage = () =>
  render(
    <SnackbarProvider>
      <RightsPage />
    </SnackbarProvider>,
  )

describe('RightsPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('affiche la liste des utilisateurs avec leurs droits', () => {
    renderPage()

    expect(screen.getByText('Gestion des droits')).toBeInTheDocument()
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
    // Jean Dupont est admin global de Nantes Université
    expect(
      screen.getByText('Administrateur · Global établissement'),
    ).toBeInTheDocument()
  })

  it('ouvre la fiche des droits d’un utilisateur avec le JWT décodé', () => {
    renderPage()

    const row = screen.getByText('Sophie Martin').closest('tr') as HTMLElement
    fireEvent.click(within(row).getByRole('button', { name: /Gérer/i }))

    expect(screen.getByText('Droits de Sophie Martin')).toBeInTheDocument()
    // Chemin complet du groupe affiché en monospace
    expect(
      screen.getAllByText('/NantesUniversite/UFR-Sciences/document_editor')
        .length,
    ).toBeGreaterThan(0)
    // Accordéon JWT
    fireEvent.click(
      screen.getByText(/JWT résultant \(ce que voient les applications\)/i),
    )
    expect(screen.getByText(/"groups":/)).toBeInTheDocument()
  })

  it('affiche l’arborescence des groupes Keycloak et le dialogue des membres', () => {
    renderPage()

    fireEvent.click(screen.getByRole('tab', { name: /Groupes Keycloak/i }))

    expect(screen.getByText('Nantes Université')).toBeInTheDocument()
    expect(
      screen.getByText(/générée automatiquement dans Keycloak/i),
    ).toBeInTheDocument()

    // Les feuilles-rôles du LS2N sont visibles (nœud déplié par défaut)
    const leaves = screen.getAllByText('account_editor')
    expect(leaves.length).toBeGreaterThan(0)
    fireEvent.click(leaves[leaves.length - 1])
    expect(
      screen.getByText(/Attribuer ce droit = ajouter l'utilisateur à ce groupe/i),
    ).toBeInTheDocument()
  })

  it('affiche le vocabulaire de rôles transverse', () => {
    renderPage()

    fireEvent.click(
      screen.getByRole('tab', { name: /Rôles \(vocabulaire transverse\)/i }),
    )

    expect(screen.getByText('Éditeur de documents')).toBeInTheDocument()
    expect(screen.getByText('project_editor')).toBeInTheDocument()
    // Chaque rôle affiche les applications qui l'interprètent
    expect(screen.getAllByText('Couche MCP').length).toBeGreaterThan(0)
  })
})
