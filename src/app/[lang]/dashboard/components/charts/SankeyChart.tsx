import ReactEcharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { FlowNode, FlowLink } from './internationalAggregates'

const SankeyChart = ({
  nodes,
  links,
  height = 520,
}: {
  nodes: FlowNode[]
  links: FlowLink[]
  height?: number
}) => {
  const option: EChartsOption = {
    tooltip: { trigger: 'item', triggerOn: 'mousemove' },
    series: [
      {
        type: 'sankey',
        data: nodes.map((n) => ({ name: n.name, depth: n.depth })),
        links,
        emphasis: { focus: 'adjacency' },
        nodeAlign: 'left',
        lineStyle: { color: 'gradient', opacity: 0.45, curveness: 0.5 },
        label: { fontSize: 10 },
      },
    ],
  }
  return (
    <ReactEcharts option={option} notMerge lazyUpdate style={{ height }} />
  )
}

export default SankeyChart
