import { blankTheme, ResearchTheme } from '../types'
import { defaultPositions, NODE_WIDTH } from './journeyLayout'

const theme = (id: string, yearFrom: number | null): ResearchTheme => ({ ...blankTheme(), id, yearFrom })

describe('defaultPositions', () => {
  it('place les thèmes du plus ancien au plus récent', () => {
    const positions = defaultPositions([theme('recent', 2020), theme('ancien', 2009), theme('moyen', 2015)])

    // Ordre de lecture : de gauche à droite, puis à la ligne.
    expect(positions.ancien).toEqual({ x: 0, y: 0 })
    expect(positions.moyen.y).toBe(0)
    expect(positions.moyen.x).toBeGreaterThan(0)
    expect(positions.recent.y).toBeGreaterThan(0)
  })

  it('met les thèmes sans date à la fin', () => {
    const positions = defaultPositions([theme('sans-date', null), theme('date', 2015)])

    expect(positions.date.x).toBeLessThan(positions['sans-date'].x)
  })

  it('ne superpose jamais deux thèmes', () => {
    const themes = Array.from({ length: 12 }, (_, i) => theme(`t${i}`, 2000 + i))
    const positions = Object.values(defaultPositions(themes))

    positions.forEach((a, i) => {
      positions.slice(i + 1).forEach((b) => {
        const sameRow = a.y === b.y
        expect(sameRow ? Math.abs(a.x - b.x) > NODE_WIDTH : true).toBe(true)
      })
    })
    expect(new Set(positions.map(({ x, y }) => `${x},${y}`)).size).toBe(12)
  })
})
