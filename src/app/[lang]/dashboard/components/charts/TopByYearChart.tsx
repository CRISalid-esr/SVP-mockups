import ReactEcharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { t } from '@lingui/core/macro'

const TopByYearChart = ({
  data,
}: {
  data: { year: number; top1: number; top10Only: number }[]
}) => {
  const top1 = t`dashboard_impact_top1`
  const top10 = t`dashboard_impact_top10_excl`
  const option: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { bottom: 0, data: [top10, top1] },
    grid: { left: 8, right: 16, top: 16, bottom: 36, containLabel: true },
    xAxis: { type: 'category', data: data.map((d) => String(d.year)) },
    yAxis: { type: 'value' },
    series: [
      {
        name: top10,
        type: 'bar',
        stack: 'total',
        data: data.map((d) => d.top10Only),
        itemStyle: { color: '#F58518' },
      },
      {
        name: top1,
        type: 'bar',
        stack: 'total',
        data: data.map((d) => d.top1),
        itemStyle: { color: '#E45756' },
      },
    ],
  }
  return (
    <ReactEcharts option={option} notMerge lazyUpdate style={{ height: 300 }} />
  )
}

export default TopByYearChart
