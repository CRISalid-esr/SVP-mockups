import EChart from './EChart'
import type { EChartsOption } from 'echarts'
import { t } from '@lingui/core/macro'

const IntlPercentChart = ({
  data,
}: {
  data: { year: number; pct: number }[]
}) => {
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      valueFormatter: (v) => `${v} %`,
    },
    grid: { left: 8, right: 16, top: 16, bottom: 8, containLabel: true },
    xAxis: { type: 'category', data: data.map((d) => String(d.year)) },
    yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value} %' } },
    series: [
      {
        name: t`dashboard_intl_pct_series`,
        type: 'line',
        smooth: true,
        showSymbol: true,
        data: data.map((d) => d.pct),
        itemStyle: { color: '#F58518' },
        areaStyle: { color: 'rgba(245,133,24,0.12)' },
      },
    ],
  }
  return (
    <EChart exportName="pourcentage-international" option={option} notMerge lazyUpdate style={{ height: 300 }} />
  )
}

export default IntlPercentChart
