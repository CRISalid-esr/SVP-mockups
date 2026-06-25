import ReactEcharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { NetworkData } from './networkAggregates'
import { TEAM_PALETTE as PALETTE } from './structureAggregates'

const NetworkChart = ({ data }: { data: NetworkData }) => {
  const maxVal = data.nodes.reduce((m, n) => Math.max(m, n.value), 1)
  const option: EChartsOption = {
    tooltip: {},
    legend: [{ data: data.categories.map((c) => c.name), bottom: 0 }],
    color: PALETTE,
    series: [
      {
        type: 'graph',
        layout: 'force',
        roam: true,
        draggable: true,
        categories: data.categories,
        force: { repulsion: 90, edgeLength: [30, 120], gravity: 0.1 },
        label: {
          show: true,
          position: 'right',
          fontSize: 9,
          formatter: '{b}',
        },
        labelLayout: { hideOverlap: true },
        emphasis: { focus: 'adjacency', label: { show: true } },
        lineStyle: { color: 'source', curveness: 0.1, opacity: 0.5 },
        nodes: data.nodes.map((n) => ({
          id: n.id,
          name: n.name,
          value: n.value,
          category: n.category,
          symbolSize: 8 + (n.value / maxVal) * 32,
        })),
        links: data.links.map((l) => ({
          source: l.source,
          target: l.target,
          value: l.value,
          lineStyle: { width: Math.min(1 + l.value, 6) },
        })),
      },
    ],
  }
  return (
    <ReactEcharts option={option} notMerge lazyUpdate style={{ height: 560 }} />
  )
}

export default NetworkChart
