import '@testing-library/jest-dom'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { ThemeProvider, BRAND_STORAGE_KEY } from '@/app/[lang]/context/ThemeContext'
import AppearancePage from './page'

jest.mock('echarts-for-react', () => {
  const Stub = () => <div data-testid='echarts' />
  Stub.displayName = 'EChartsStub'
  return { __esModule: true, default: Stub }
})

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
  })
})

const renderPage = () =>
  render(
    <ThemeProvider>
      <AppearancePage />
    </ThemeProvider>,
  )

const brandVar = () => {
  // Emotion écrit ses règles par insertRule : on lit les feuilles, la plus récente l'emporte.
  const rules = Array.from(document.styleSheets)
    .flatMap((sheet) => Array.from(sheet.cssRules).map((rule) => rule.cssText))
    .concat(Array.from(document.querySelectorAll('style')).map((s) => s.textContent ?? ''))
    .filter((text) => text.includes('--svp-brand:'))
  return /--svp-brand:\s*(#[0-9a-f]{6})/i.exec(rules[rules.length - 1] ?? '')?.[1]?.toLowerCase()
}

describe('Apparence de l’établissement', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    localStorage.clear()
  })
  afterEach(() => jest.useRealTimers())

  it('applique une couleur saisie à toute l’interface et la garde', () => {
    renderPage()
    expect(screen.getByText(/Lisible/)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Code couleur'), { target: { value: '#c8102e' } })
    act(() => jest.advanceTimersByTime(200))

    expect(localStorage.getItem(BRAND_STORAGE_KEY)).toBe('#C8102E')
    expect(brandVar()).toBe('#c8102e')
    expect(screen.getByText(/utilisée telle quelle/)).toBeInTheDocument()
  })

  it('signale une couleur trop claire, ajustée pour rester lisible', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /Orange/ }))
    fireEvent.change(screen.getByLabelText('Code couleur'), { target: { value: '#F2C500' } })
    act(() => jest.advanceTimersByTime(200))

    expect(screen.getByText('Ajustée pour rester lisible')).toBeInTheDocument()
    expect(brandVar()).not.toBe('#f2c500')
  })

  it('refuse un code mal formé et revient aux couleurs SoVisu+', () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /Bleu marine/ }))
    expect(localStorage.getItem(BRAND_STORAGE_KEY)).toBe('#003d7c')

    fireEvent.change(screen.getByLabelText('Code couleur'), { target: { value: '#12' } })
    expect(screen.getByText(/Format attendu/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Revenir aux couleurs SoVisu+' }))
    expect(localStorage.getItem(BRAND_STORAGE_KEY)).toBeNull()
    expect(brandVar()).toBe('#006a61')
  })
})
