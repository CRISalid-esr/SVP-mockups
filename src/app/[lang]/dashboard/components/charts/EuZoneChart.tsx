import ReactEcharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { t } from '@lingui/core/macro'

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
          { name: ue, value: data.ue, itemStyle: { color: '#4C78A8' } },
          { name: hors, value: data.horsUe, itemStyle: { color: '#F58518' } },
        ],
      },
    ],
  }
  return (
    <ReactEcharts option={option} notMerge lazyUpdate style={{ height: 300 }} />
  )
}

export default EuZoneChart
