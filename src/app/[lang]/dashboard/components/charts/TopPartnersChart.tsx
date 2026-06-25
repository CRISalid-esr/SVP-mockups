import ReactEcharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { PartnerItem } from './internationalAggregates'

const TopPartnersChart = ({ data }: { data: PartnerItem[] }) => {
  const sorted = [...data].sort((a, b) => a.count - b.count)
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (p) => {
        const arr = p as { dataIndex: number; value: number }[]
        const item = sorted[arr[0].dataIndex]
        const cc = item.cc ? ` (${item.cc})` : ''
        return `${item.name}${cc} : ${arr[0].value}`
      },
    },
    grid: { left: 8, right: 40, top: 8, bottom: 8, containLabel: true },
    xAxis: { type: 'value' },
    yAxis: {
      type: 'category',
      data: sorted.map((d) => d.name),
      axisLabel: { width: 220, overflow: 'truncate', fontSize: 11 },
    },
    series: [
      {
        type: 'bar',
        data: sorted.map((d) => d.count),
        itemStyle: { color: '#2a9d8f', borderRadius: [0, 3, 3, 0] },
        label: { show: true, position: 'right', fontSize: 10 },
      },
    ],
  }
  return (
    <ReactEcharts option={option} notMerge lazyUpdate style={{ height: 520 }} />
  )
}

export default TopPartnersChart
