import EChart from './EChart'
import type { EChartsOption } from 'echarts'
import { t } from '@lingui/core/macro'
import { ApcYearItem } from './overviewAggregates'

const ApcYearlyChart = ({ data }: { data: ApcYearItem[] }) => {
  const nbLabel = t`dashboard_overview_apc_count_label`

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (v) =>
        `${Math.round(Number(v)).toLocaleString('fr-FR')} EUR`,
    },
    grid: { left: 8, right: 16, bottom: 8, top: 24, containLabel: true },
    xAxis: { type: 'category', data: data.map((d) => String(d.year)) },
    yAxis: { type: 'value', name: 'EUR' },
    series: [
      {
        type: 'bar',
        data: data.map((d) => Math.round(d.total)),
        itemStyle: { color: '#F58518', borderRadius: [3, 3, 0, 0] },
        label: {
          show: true,
          position: 'top',
          fontSize: 10,
          formatter: (p: { dataIndex: number }) =>
            `${data[p.dataIndex].count} ${nbLabel}`,
        },
      },
    ],
  }

  return (
    <EChart exportName="apc-par-annee"
      option={option}
      notMerge
      lazyUpdate
      style={{ height: 320 }}
    />
  )
}

export default ApcYearlyChart
