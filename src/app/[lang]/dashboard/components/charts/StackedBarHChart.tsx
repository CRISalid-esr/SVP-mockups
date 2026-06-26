import EChart from './EChart'
import type { EChartsOption } from 'echarts'
import { StackedByCategory, TEAM_PALETTE } from './structureAggregates'

const StackedBarHChart = ({
  data,
  height = 320,
}: {
  data: StackedByCategory
  height?: number
}) => {
  const option: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { type: 'scroll', bottom: 0, data: data.series.map((s) => s.name) },
    grid: { left: 8, right: 24, top: 8, bottom: 40, containLabel: true },
    color: TEAM_PALETTE,
    xAxis: { type: 'value' },
    yAxis: {
      type: 'category',
      data: data.categories,
      axisLabel: { width: 120, overflow: 'truncate' },
    },
    series: data.series.map((s) => ({
      name: s.name,
      type: 'bar',
      stack: 'total',
      data: s.data,
    })),
  }
  return (
    <EChart exportName="repartition-empilee" option={option} notMerge lazyUpdate style={{ height }} />
  )
}

export default StackedBarHChart
