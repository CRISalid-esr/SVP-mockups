import ReactEcharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'

interface Props {
  data: { label: string; count: number; teams?: string[] }[]
  color?: string
  height?: number
}

const RankBarChart = ({ data, color = '#4C78A8', height = 460 }: Props) => {
  const sorted = [...data].sort((a, b) => a.count - b.count)
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (p) => {
        const arr = p as { dataIndex: number; value: number }[]
        const item = sorted[arr[0].dataIndex]
        const tm = item.teams?.length ? ` — ${item.teams.join(', ')}` : ''
        return `${item.label}${tm} : ${arr[0].value}`
      },
    },
    grid: { left: 8, right: 32, top: 8, bottom: 8, containLabel: true },
    xAxis: { type: 'value' },
    yAxis: {
      type: 'category',
      data: sorted.map((d) => d.label),
      axisLabel: { width: 130, overflow: 'truncate', fontSize: 11 },
    },
    series: [
      {
        type: 'bar',
        data: sorted.map((d) => d.count),
        itemStyle: { color, borderRadius: [0, 3, 3, 0] },
        label: { show: true, position: 'right', fontSize: 10 },
      },
    ],
  }
  return (
    <ReactEcharts option={option} notMerge lazyUpdate style={{ height }} />
  )
}

export default RankBarChart
