import { fireEvent, render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { dashboardMockService } from '@/mocks/dashboardMockService'
import DashboardTabs from './DashboardTabs'
import { DashboardDataProvider } from './DashboardViewContext'

jest.mock('echarts-for-react', () => {
  const Stub = () => <div data-testid='echarts' />
  Stub.displayName = 'EChartsStub'
  return { __esModule: true, default: Stub }
})

jest.mock('@/stores/global_store', () => ({
  __esModule: true,
  default: (selector: (state: unknown) => unknown) => selector({ user: { currentPerspective: null } }),
}))

const renderDashboard = (view: 'lab' | 'researcher') =>
  render(
    <DashboardDataProvider view={view}>
      <DashboardTabs />
    </DashboardDataProvider>,
  )

const years = dashboardMockService.getPublications().map((p) => p.year).filter((y): y is number => typeof y === 'number')
const first = Math.min(...years)
const last = Math.max(...years)

describe('DashboardTabs', () => {
  it('montre les onglets d’une structure, sans onglet vide', () => {
    renderDashboard('lab')

    const names = screen.getAllByRole('tab').map((tab) => tab.textContent)
    expect(names).toEqual(['Vue d’ensemble', 'Collaborations', 'Impact', 'Équipes', 'Chercheurs', 'Doctorants', 'Ouvrages'])
  })

  it('limite une personne à ses quatre onglets', () => {
    renderDashboard('researcher')

    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Vue d’ensemble',
      'Collaborations',
      'Impact',
      'Ouvrages',
    ])
  })

  it('garde la même période d’un onglet à l’autre', () => {
    renderDashboard('lab')
    expect(screen.getByRole('button', { name: `Années : ${first} – ${last}` })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /^Années/ }))
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Depuis' }))
    fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: String(last - 1) }))

    fireEvent.click(screen.getByRole('tab', { name: 'Impact', hidden: true }))
    expect(screen.getByRole('button', { name: `Années : ${last - 1} – ${last}`, hidden: true })).toBeInTheDocument()
  })

  it('replie les analyses détaillées', () => {
    renderDashboard('lab')

    const details = screen.getByRole('button', { name: /Analyses détaillées/ })
    expect(details).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('dashboard_overview_language_title')).not.toBeInTheDocument()

    fireEvent.click(details)
    expect(screen.getByText('dashboard_overview_language_title')).toBeInTheDocument()
  })

  it('range les actions d’un graphique dans un menu', () => {
    renderDashboard('lab')

    fireEvent.click(screen.getAllByRole('button', { name: 'Actions sur le graphique' })[0])
    expect(screen.getByRole('menuitem', { name: 'Télécharger l’image' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Plein écran' })).toBeInTheDocument()
  })
})
