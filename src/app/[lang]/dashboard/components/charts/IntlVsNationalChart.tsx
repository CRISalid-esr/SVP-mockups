import EChart from './EChart'
import type { EChartsOption } from 'echarts'
import { t } from '@lingui/core/macro'
import { IntlYearItem } from './internationalAggregates'

const IntlVsNationalChart = ({ data }: { data: IntlYearItem[] }) => {
  const intl = t`dashboard_intl_series_international`
  const nat = t`dashboard_intl_series_national`
  const option: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { bottom: 0, data: [nat, intl] },
    grid: { left: 8, right: 16, top: 16, bottom: 36, containLabel: true },
    xAxis: { type: 'category', data: data.map((d) => String(d.year)) },
    yAxis: { type: 'value' },
    series: [
      {
        name: nat,
        type: 'bar',
        stack: 'total',
        data: data.map((d) => d.national),
        itemStyle: { color: '#4C78A8' },
      },
      {
        name: intl,
        type: 'bar',
        stack: 'total',
        data: data.map((d) => d.international),
        itemStyle: { color: '#F58518' },
      },
    ],
  }
  return (
    <EChart exportName="international-vs-national" option={option} notMerge lazyUpdate style={{ height: 320 }} />
  )
}

export default IntlVsNationalChart
