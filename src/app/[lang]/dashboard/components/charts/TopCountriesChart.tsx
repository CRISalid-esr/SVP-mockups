import EChart from './EChart'
import type { EChartsOption } from 'echarts'
import { CountryItem } from './internationalAggregates'

const TopCountriesChart = ({
  data,
  top = 20,
}: {
  data: CountryItem[]
  top?: number
}) => {
  const sorted = data.slice(0, top).sort((a, b) => a.count - b.count)
  const max = sorted.length ? sorted[sorted.length - 1].count : 1
  const option: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 8, right: 36, top: 8, bottom: 8, containLabel: true },
    xAxis: { type: 'value' },
    yAxis: {
      type: 'category',
      data: sorted.map((d) => d.fr),
      axisLabel: { width: 140, overflow: 'truncate' },
    },
    visualMap: {
      show: false,
      min: 0,
      max,
      inRange: { color: ['#cfe0f3', '#4C78A8', '#1b3a5c'] },
    },
    series: [
      {
        type: 'bar',
        data: sorted.map((d) => d.count),
        itemStyle: { borderRadius: [0, 3, 3, 0] },
        label: { show: true, position: 'right', fontSize: 10 },
      },
    ],
  }
  return (
    <EChart exportName="top-pays" option={option} notMerge lazyUpdate style={{ height: 460 }} />
  )
}

export default TopCountriesChart
