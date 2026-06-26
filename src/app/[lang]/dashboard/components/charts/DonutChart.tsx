import EChart from './EChart'
import type { EChartsOption } from 'echarts'
import { TEAM_PALETTE } from './structureAggregates'

interface Props {
  data: { name: string; value: number; color?: string }[]
  height?: number
  chartId?: string
}

const DonutChart = ({ data, height = 300, chartId }: Props) => {
  const option: EChartsOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { type: 'scroll', bottom: 0 },
    color: TEAM_PALETTE,
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: '#fff', borderWidth: 1 },
        label: { formatter: '{b}\n{d}%' },
        data: data.map((d) => ({
          name: d.name,
          value: d.value,
          ...(d.color ? { itemStyle: { color: d.color } } : {}),
        })),
      },
    ],
  }
  return (
    <EChart exportName="repartition" chartId={chartId}
      option={option}
      notMerge
      lazyUpdate
      style={{ height }}
    />
  )
}

export default DonutChart
