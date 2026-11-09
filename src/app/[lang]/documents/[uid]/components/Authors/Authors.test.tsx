import useStore from '@/stores/global_store'
import '@testing-library/jest-dom'
import { fireEvent, render, screen, within } from '@testing-library/react'
import Authors from './Authors'

jest.mock('@/stores/global_store', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

const contribution = (uid: string, displayName: string, rank: number, roles: string[] = ['author']) => ({
  person: { uid, displayName, external: false },
  roles,
  rank,
})

beforeEach(() => {
  ;(useStore as unknown as jest.Mock).mockImplementation((selector) =>
    selector({
      document: {
        selectedDocument: {
          uid: 'doc-1',
          records: [{ platform: 'hal' }],
          contributions: [
            contribution('p1', 'Jean Dupont', 1, ['author', 'editor']),
            contribution('p2', 'Sophie Martin', 2),
            contribution('p3', 'Pierre Bernard', 3, []),
            contribution('p4', 'Anne Leclerc', 4),
          ],
        },
      },
    }),
  )
})

/** Ligne d'un auteur (le bouton ⋯ porte aussi son nom). */
const row = (name: string) =>
  screen.getAllByRole('button', { name: new RegExp(name) }).find((button) => button.hasAttribute('aria-expanded'))!

describe('Authors', () => {
  it('résume l’état des auteurs et replie le détail', () => {
    render(<Authors />)

    expect(screen.getByText('4 auteurs · 3 identifiés · 3 affiliations')).toBeInTheDocument()
    expect(screen.getByText('2 à compléter')).toBeInTheDocument()

    const pierre = row('Pierre Bernard')
    expect(pierre).toHaveAttribute('aria-expanded', 'false')
    expect(within(pierre).getByText('Non identifié')).toBeInTheDocument()
    expect(screen.queryByText(/retrouvez-le dans HAL/)).not.toBeInTheDocument()

    fireEvent.click(pierre)
    expect(pierre).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(/retrouvez-le dans HAL/)).toBeInTheDocument()
    expect(screen.getByText(/Fonction par défaut/)).toBeInTheDocument()
  })

  it('ouvre d’un coup les auteurs à compléter', () => {
    render(<Authors />)

    fireEvent.click(screen.getByRole('button', { name: 'Les afficher' }))
    expect(row('Sophie Martin')).toHaveAttribute('aria-expanded', 'true')
    expect(row('Pierre Bernard')).toHaveAttribute('aria-expanded', 'true')
    expect(row('Jean Dupont')).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByText('Structure à retrouver dans HAL')).toBeInTheDocument()
  })

  it('range les actions dans un menu et propose d’enregistrer après une modification', () => {
    render(<Authors />)

    expect(screen.queryByRole('region', { name: 'Modifications non enregistrées' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Actions sur Jean Dupont' }))
    expect(screen.getByRole('menuitem', { name: 'Monter' })).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(screen.getByRole('menuitem', { name: 'Descendre' }))

    const names = screen.getAllByRole('button').filter((b) => b.hasAttribute('aria-expanded')).map((b) => b.textContent)
    expect(names[0]).toContain('Sophie Martin')
    expect(names[1]).toContain('Jean Dupont')
    expect(screen.getByRole('region', { name: 'Modifications non enregistrées' })).toBeInTheDocument()
  })
})
