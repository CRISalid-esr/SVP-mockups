/**
 * Test de régression : le rendu des réponses de l'assistant (appels d'outils
 * + markdown streamé) ne doit pas crasher avec le thème MUI v6 du projet.
 * @mui/x-chat attend `theme.alpha()` (MUI v7) — voir withChatThemeCompat.
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import ChatWidget from './ChatWidget'

if (typeof global.ReadableStream === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ReadableStream } = require('stream/web')
  ;(global as unknown as { ReadableStream: unknown }).ReadableStream =
    ReadableStream
}

describe('ChatWidget', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('affiche le bouton flottant puis le panneau avec les suggestions', async () => {
    render(<ChatWidget />)

    fireEvent.click(
      screen.getByRole('button', {
        name: /Ouvrir l'assistant de recherche CRISalid/i,
      }),
    )

    expect(
      screen.getByText('Assistant de Recherche CRISalid'),
    ).toBeInTheDocument()
    expect(
      await screen.findByText(/domaines de recherche du LPPL/i),
    ).toBeInTheDocument()
  })

  it('répond à la question LPPL (appels d’outils + streaming) sans crasher', async () => {
    render(<ChatWidget />)

    fireEvent.click(
      screen.getByRole('button', {
        name: /Ouvrir l'assistant de recherche CRISalid/i,
      }),
    )

    // Clique la suggestion LPPL (auto-submit)
    fireEvent.click(await screen.findByText(/domaines de recherche du LPPL/i))

    // Attend la fin du streaming : le texte final contient "bi-site"
    await waitFor(
      () => {
        expect(screen.getByText(/bi-site/i)).toBeInTheDocument()
      },
      { timeout: 15000 },
    )
  }, 20000)
})
