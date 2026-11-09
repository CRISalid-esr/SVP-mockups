import EChart from './EChart'
import type { EChartsOption } from 'echarts'
import { t } from '@lingui/core/macro'
import { SERIES } from './chartPalette'

const EuZoneChart = ({ data }: { data: { ue: number; horsUe: number } }) => {
  const ue = t`dashboard_intl_zone_eu`
  const hors = t`dashboard_intl_zone_non_eu`
  const option: EChartsOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '45%'],
        itemStyle: { borderColor: '#fff', borderWidth: 1 },
        label: { formatter: '{b}\n{d}%' },
        data: [
          { name: ue, value: data.ue, itemStyle: { color: SERIES[0] } },
          { name: hors, value: data.horsUe, itemStyle: { color: SERIES[1] } },
        ],
      },
    ],
  }
  return (
    <EChart exportName="zone-ue" option={option} notMerge lazyUpdate style={{ height: 300 }} />
  )
}

export default EuZoneChart
