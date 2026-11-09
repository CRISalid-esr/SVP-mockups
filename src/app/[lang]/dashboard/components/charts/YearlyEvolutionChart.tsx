import EChart from './EChart'
import type { EChartsOption } from 'echarts'
import { t } from '@lingui/core/macro'
import { PRIMARY_SERIES } from './chartPalette'

interface Props {
  data: { year: number; count: number }[]
}

const YearlyEvolutionChart = ({ data }: Props) => {
  const option: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 8, right: 16, bottom: 8, top: 16, containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map((d) => String(d.year)),
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: t`dashboard_overview_yearly_series`,
        type: 'bar',
        data: data.map((d) => d.count),
        itemStyle: { color: PRIMARY_SERIES, borderRadius: [3, 3, 0, 0] },
        label: { show: true, position: 'top', fontSize: 10 },
      },
    ],
  }

  return (
    <EChart exportName="publications-par-annee"
      option={option}
      notMerge
      lazyUpdate
      style={{ height: 320 }}
    />
  )
}

export default YearlyEvolutionChart
