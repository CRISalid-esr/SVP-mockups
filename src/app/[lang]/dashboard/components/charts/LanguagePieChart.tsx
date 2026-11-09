import EChart from './EChart'
import type { EChartsOption } from 'echarts'
import { CountItem } from './overviewAggregates'
import { languageLabel } from './overviewLabels'
import { NEUTRAL, SERIES } from './chartPalette'

/** Au-delà de cinq langues, les autres sont regroupées : la palette ne boucle jamais (six couleurs au moins, quelle que soit la couleur d’établissement). */
const MAX_SLICES = 5

const LanguagePieChart = ({ data }: { data: CountItem[] }) => {
  const sorted = [...data].sort((a, b) => b.count - a.count)
  const head = sorted.length > MAX_SLICES + 1 ? sorted.slice(0, MAX_SLICES) : sorted
  const rest = sorted.slice(head.length).reduce((sum, d) => sum + d.count, 0)
  const slices = [
    ...head.map((d, i) => ({ name: languageLabel(d.key), value: d.count, itemStyle: { color: SERIES[i] } })),
    ...(rest > 0 ? [{ name: 'Autres langues', value: rest, itemStyle: { color: NEUTRAL } }] : []),
  ]

  const option: EChartsOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { type: 'scroll', bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: '#fff', borderWidth: 1 },
        label: { formatter: '{b}\n{d}%' },
        data: slices,
      },
    ],
  }

  return (
    <EChart exportName="langues"
      option={option}
      notMerge
      lazyUpdate
      style={{ height: 320 }}
    />
  )
}

export default LanguagePieChart
