import EChart from './EChart'
import type { EChartsOption } from 'echarts'
import { t } from '@lingui/core/macro'

const EuByYearChart = ({
  data,
}: {
  data: { year: number; ue: number; horsUe: number }[]
}) => {
  const ue = t`dashboard_intl_zone_eu`
  const hors = t`dashboard_intl_zone_non_eu`
  const option: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { bottom: 0, data: [ue, hors] },
    grid: { left: 8, right: 16, top: 16, bottom: 36, containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map((d) => String(d.year)),
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: ue,
        type: 'line',
        stack: 'total',
        areaStyle: { color: 'rgba(76,120,168,0.5)' },
        lineStyle: { color: '#4C78A8' },
        itemStyle: { color: '#4C78A8' },
        data: data.map((d) => d.ue),
      },
      {
        name: hors,
        type: 'line',
        stack: 'total',
        areaStyle: { color: 'rgba(245,133,24,0.5)' },
        lineStyle: { color: '#F58518' },
        itemStyle: { color: '#F58518' },
        data: data.map((d) => d.horsUe),
      },
    ],
  }
  return (
    <EChart exportName="ue-par-annee" option={option} notMerge lazyUpdate style={{ height: 300 }} />
  )
}

export default EuByYearChart
