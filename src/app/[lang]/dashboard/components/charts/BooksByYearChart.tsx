import EChart from './EChart'
import type { EChartsOption } from 'echarts'

interface Props {
  years: number[]
  series: { name: string; color: string; data: number[] }[]
}

const BooksByYearChart = ({ years, series }: Props) => {
  const option: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { bottom: 0, data: series.map((s) => s.name) },
    grid: { left: 8, right: 16, top: 16, bottom: 40, containLabel: true },
    xAxis: { type: 'category', data: years.map(String) },
    yAxis: { type: 'value' },
    series: series.map((s) => ({
      name: s.name,
      type: 'bar',
      stack: 'total',
      data: s.data,
      itemStyle: { color: s.color },
    })),
  }
  return (
    <EChart exportName="ouvrages-par-annee" option={option} notMerge lazyUpdate style={{ height: 320 }} />
  )
}

export default BooksByYearChart
