import EChart from './EChart'
import type { EChartsOption } from 'echarts'
import { t } from '@lingui/core/macro'
import { FWCI_REFERENCE, FWCI_BIN_WIDTH } from './impactAggregates'

const FwciHistogramChart = ({
  data,
}: {
  data: { label: string; count: number }[]
}) => {
  // index du bin contenant la référence FWCI = 1.0 (largeur de bin 0.5)
  const refIndex = FWCI_REFERENCE / FWCI_BIN_WIDTH
  const option: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 8, right: 16, top: 24, bottom: 8, containLabel: true },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.label),
      name: 'FWCI',
      nameLocation: 'middle',
      nameGap: 28,
      axisLabel: { interval: 1 },
    },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'bar',
        data: data.map((d) => d.count),
        itemStyle: { color: '#4C78A8' },
        barCategoryGap: '10%',
        markLine: {
          symbol: 'none',
          lineStyle: { color: '#888', type: 'dashed' },
          label: {
            formatter: t`dashboard_impact_fwci_world_mean`,
            position: 'end',
          },
          data: [{ xAxis: refIndex }],
        },
      },
    ],
  }
  return (
    <EChart exportName="distribution-fwci" option={option} notMerge lazyUpdate style={{ height: 320 }} />
  )
}

export default FwciHistogramChart
