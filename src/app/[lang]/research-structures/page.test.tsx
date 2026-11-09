import '@testing-library/jest-dom'
import { fireEvent, render, screen, within } from '@testing-library/react'
import ResearchStructuresPage from './page'
import StructureDetailPage from './[uid]/page'

const push = jest.fn()
let params = { uid: 'lab-ls2n' }

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useParams: () => params,
  notFound: () => null,
}))

jest.mock('echarts-for-react', () => {
  const Stub = () => <div data-testid='echarts' />
  Stub.displayName = 'EChartsStub'
  return { __esModule: true, default: Stub }
})

const rowsOf = () => screen.getAllByRole('row').slice(1)

describe('Liste des structures', () => {
  beforeEach(() => push.mockClear())

  it('filtre par type et ouvre une structure au clic sur la ligne', () => {
    render(<ResearchStructuresPage />)

    expect(screen.getByRole('heading', { name: /Structures/ })).toBeInTheDocument()
    const total = rowsOf().length

    fireEvent.click(screen.getByRole('button', { name: /^Type/ }))
    fireEvent.click(screen.getByRole('menuitem', { name: /Équipe/ }))
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })

    const teams = rowsOf()
    expect(teams.length).toBeLessThan(total)
    expect(teams.every((row) => within(row).queryByText(/Équipe/) !== null)).toBe(true)
    expect(screen.getByText(new RegExp(`${teams.length} structures? sur`))).toBeInTheDocument()

    fireEvent.click(teams[0])
    expect(push).toHaveBeenCalledWith(expect.stringContaining('/research-structures/team-'))
  })

  it('garde les parents d’une structure trouvée dans l’arborescence', () => {
    render(<ResearchStructuresPage />)

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'tasc' } })
    fireEvent.click(screen.getByRole('button', { name: 'Arborescence' }))

    const names = rowsOf().map((row) => row.textContent ?? '')
    expect(names.some((text) => text.includes('LS2N'))).toBe(true)
    expect(names.some((text) => text.includes('TASC'))).toBe(true)
  })
})

describe('Fiche d’une structure', () => {
  it('montre les indicateurs, puis les membres en liste filtrable', () => {
    params = { uid: 'lab-ls2n' }
    render(<StructureDetailPage />)

    expect(screen.getByRole('heading', { level: 1, name: 'LS2N' })).toBeInTheDocument()
    expect(screen.getByText('Publications sur 24 mois')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Membres/ })).toHaveAttribute('aria-selected', 'true')

    fireEvent.click(screen.getByRole('tab', { name: /Publications/ }))
    expect(screen.getByRole('link', { name: /Voir les publications/ })).toHaveAttribute(
      'href',
      expect.stringContaining('/documents?perspective='),
    )
  })
})
