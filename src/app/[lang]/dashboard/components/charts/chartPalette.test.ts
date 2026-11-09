import { NEUTRAL, SERIES, darkenOption, toDark } from './chartPalette'

describe('Palette des graphiques', () => {
  it('ouvre sur le sarcelle de l’interface et ne répète aucune couleur', () => {
    expect(SERIES[0]).toBe('#008a7c')
    expect(new Set(SERIES).size).toBe(SERIES.length)
  })

  it('passe les couleurs en mode sombre sans toucher aux fonctions', () => {
    const formatter = () => 'x'
    const dark = darkenOption({
      color: [...SERIES],
      series: [{ itemStyle: { color: NEUTRAL }, label: { formatter } }],
      title: '#008a7c n’est pas une couleur seule',
    })
    expect(dark.color[0]).toBe('#1a9e8f')
    expect(dark.series[0].itemStyle.color).toBe(toDark(NEUTRAL))
    expect(dark.series[0].label.formatter).toBe(formatter)
    expect(dark.title).toBe('#008a7c n’est pas une couleur seule')
  })
})
