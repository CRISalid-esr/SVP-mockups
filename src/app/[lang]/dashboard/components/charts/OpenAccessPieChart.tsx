import EChart from './EChart'
import type { EChartsOption } from 'echarts'
import { OaItem } from './overviewAggregates'
import { oaLabel } from './overviewLabels'

const OpenAccessPieChart = ({ data }: { data: OaItem[] }) => {
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
        data: data.map((d) => ({
          name: oaLabel(d.key),
          value: d.count,
          itemStyle: { color: d.color },
        })),
      },
    ],
  }

  return (
    <EChart exportName="acces-ouvert"
      option={option}
      notMerge
      lazyUpdate
      style={{ height: 320 }}
    />
  )
}

export default OpenAccessPieChart
