import ReactEcharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { CountryHeatmap } from './internationalAggregates'

const CountryHeatmapChart = ({ data }: { data: CountryHeatmap }) => {
  const max = data.cells.reduce((m, c) => Math.max(m, c.v), 0)
  const option: EChartsOption = {
    tooltip: {
      position: 'top',
      formatter: (p) => {
        const param = p as unknown as { value: [number, number, number] }
        const [x, y, v] = param.value
        return `${data.countries[y]} — ${data.years[x]} : ${v}`
      },
    },
    grid: { left: 8, right: 16, top: 8, bottom: 24, containLabel: true },
    xAxis: {
      type: 'category',
      data: data.years.map(String),
      splitArea: { show: true },
    },
    yAxis: {
      type: 'category',
      data: data.countries,
      splitArea: { show: true },
      axisLabel: { width: 120, overflow: 'truncate' },
    },
    visualMap: {
      min: 0,
      max: max || 1,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      inRange: { color: ['#f2f7fc', '#9ec1e3', '#4C78A8', '#1b3a5c'] },
    },
    series: [
      {
        type: 'heatmap',
        data: data.cells.map((c) => [c.x, c.y, c.v]),
        label: { show: false },
        emphasis: {
          itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.3)' },
        },
      },
    ],
  }
  return (
    <ReactEcharts option={option} notMerge lazyUpdate style={{ height: 420 }} />
  )
}

export default CountryHeatmapChart
