import { contrastRatio, generateBrand } from './brand'
import { chartColorsFor, distinct, separation } from '@/app/[lang]/dashboard/components/charts/chartPalette'

describe('Couleur d’établissement', () => {
  it('garde une couleur déjà lisible et ajuste une couleur trop claire', () => {
    const red = generateBrand('#c8102e')
    expect(red.adjusted).toBe(false)
    expect(red.main).toBe('#c8102e')

    const yellow = generateBrand('#f2c500')
    expect(yellow.adjusted).toBe(true)
    expect(contrastRatio(yellow.main, '#ffffff')).toBeGreaterThanOrEqual(4.5)
  })

  it.each(['#006a61', '#c8102e', '#f2c500', '#5b2c83', '#003d7c', '#e2001a', '#00a3e0'])(
    'produit des couleurs d’action lisibles et au moins six séries distinctes pour %s',
    (seed) => {
      const brand = generateBrand(seed)
      expect(brand.contrast).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(brand.light.textSecondary, brand.light.background)).toBeGreaterThanOrEqual(4.5)
      for (const mode of ['light', 'dark'] as const) {
        const { series } = chartColorsFor(seed, mode)
        expect(series.length).toBeGreaterThanOrEqual(6)
        for (let i = 1; i < series.length; i++) expect(distinct(series[i], series[i - 1])).toBe(true)
        for (const other of series.slice(1)) expect(separation(other, series[0]).normal).toBeGreaterThanOrEqual(15)
      }
    },
  )
})
