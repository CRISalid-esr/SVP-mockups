import ReactEcharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { CountItem } from './overviewAggregates'
import { languageLabel } from './overviewLabels'

const PALETTE = [
  '#5470c6',
  '#91cc75',
  '#fac858',
  '#ee6666',
  '#73c0de',
  '#3ba272',
  '#fc8452',
  '#9a60b4',
  '#ea7ccc',
]

const LanguagePieChart = ({ data }: { data: CountItem[] }) => {
  const option: EChartsOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { type: 'scroll', bottom: 0 },
    color: PALETTE,
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: '#fff', borderWidth: 1 },
        label: { formatter: '{b}\n{d}%' },
        data: data.map((d) => ({
          name: languageLabel(d.key),
          value: d.count,
        })),
      },
    ],
  }

  return (
    <ReactEcharts
      option={option}
      notMerge
      lazyUpdate
      style={{ height: 320 }}
    />
  )
}

export default LanguagePieChart
