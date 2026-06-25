import ReactEcharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { SunburstNode } from './internationalAggregates'
import { TEAM_PALETTE } from './structureAggregates'

const SunburstChart = ({
  data,
  height = 520,
}: {
  data: SunburstNode[]
  height?: number
}) => {
  const option: EChartsOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c}' },
    color: TEAM_PALETTE,
    series: [
      {
        type: 'sunburst',
        data,
        radius: [0, '95%'],
        sort: undefined,
        emphasis: { focus: 'ancestor' },
        levels: [
          {},
          { r0: '0%', r: '38%', label: { rotate: 'tangential', fontSize: 11 } },
          { r0: '38%', r: '68%', label: { fontSize: 10 } },
          {
            r0: '68%',
            r: '72%',
            label: { position: 'outside', fontSize: 9, silent: false },
            itemStyle: { borderWidth: 2 },
          },
        ],
      },
    ],
  }
  return (
    <ReactEcharts option={option} notMerge lazyUpdate style={{ height }} />
  )
}

export default SunburstChart
