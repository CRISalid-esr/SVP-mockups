import EChart from './EChart'
import type { EChartsOption } from 'echarts'
import { RadarAggregates, TEAM_PALETTE } from './structureAggregates'

const RadarChart = ({ data }: { data: RadarAggregates }) => {
  const option: EChartsOption = {
    tooltip: { trigger: 'item' },
    legend: { type: 'scroll', bottom: 0, data: data.series.map((s) => s.name) },
    color: TEAM_PALETTE,
    radar: {
      indicator: data.indicators.map((i) => ({
        name: i.name,
        max: i.max,
      })),
      radius: '62%',
      axisName: { fontSize: 10, color: '#555' },
    },
    series: [
      {
        type: 'radar',
        tooltip: { valueFormatter: (v) => `${v} %` },
        data: data.series.map((s) => ({
          name: s.name,
          value: s.data,
          areaStyle: { opacity: 0.1 },
        })),
      },
    ],
  }
  return (
    <EChart exportName="radar-disciplinaire" option={option} notMerge lazyUpdate style={{ height: 420 }} />
  )
}

export default RadarChart
