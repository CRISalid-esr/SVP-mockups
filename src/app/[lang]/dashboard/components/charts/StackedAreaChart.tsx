import EChart from './EChart'
import type { EChartsOption } from 'echarts'
import { StackedByYear, TEAM_PALETTE } from './structureAggregates'

const StackedAreaChart = ({
  data,
  chartId,
}: {
  data: StackedByYear
  chartId?: string
}) => {
  const option: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { type: 'scroll', bottom: 0, data: data.series.map((s) => s.name) },
    grid: { left: 8, right: 16, top: 16, bottom: 40, containLabel: true },
    color: TEAM_PALETTE,
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.years.map(String),
    },
    yAxis: { type: 'value' },
    series: data.series.map((s) => ({
      name: s.name,
      type: 'line',
      stack: 'total',
      areaStyle: {},
      emphasis: { focus: 'series' },
      data: s.data,
    })),
  }
  return (
    <EChart exportName="evolution-empilee" chartId={chartId} option={option} notMerge lazyUpdate style={{ height: 320 }} />
  )
}

export default StackedAreaChart
