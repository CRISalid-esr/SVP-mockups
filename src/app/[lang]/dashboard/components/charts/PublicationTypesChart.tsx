import EChart from './EChart'
import type { EChartsOption } from 'echarts'
import { CountItem } from './overviewAggregates'

const PublicationTypesChart = ({
  data,
  chartId,
}: {
  data: CountItem[]
  chartId?: string
}) => {
  // Barres horizontales : la plus grande valeur en haut.
  const sorted = [...data].sort((a, b) => a.count - b.count)

  const option: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 8, right: 32, bottom: 8, top: 8, containLabel: true },
    xAxis: { type: 'value' },
    yAxis: {
      type: 'category',
      data: sorted.map((d) => d.key),
      axisLabel: { width: 160, overflow: 'truncate' },
    },
    series: [
      {
        type: 'bar',
        data: sorted.map((d) => d.count),
        itemStyle: { color: '#6a9fb5', borderRadius: [0, 3, 3, 0] },
        label: { show: true, position: 'right', fontSize: 10 },
      },
    ],
  }

  return (
    <EChart exportName="types-publications" chartId={chartId}
      option={option}
      notMerge
      lazyUpdate
      style={{ height: 360 }}
    />
  )
}

export default PublicationTypesChart
