import ReactEcharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'

const QuartileChart = ({
  data,
}: {
  data: { key: string; count: number; color: string }[]
}) => {
  const option: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 8, right: 16, top: 24, bottom: 8, containLabel: true },
    xAxis: { type: 'category', data: data.map((d) => d.key) },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'bar',
        data: data.map((d) => ({
          value: d.count,
          itemStyle: { color: d.color, borderRadius: [3, 3, 0, 0] },
        })),
        label: { show: true, position: 'top', fontSize: 11 },
        barWidth: '55%',
      },
    ],
  }
  return (
    <ReactEcharts option={option} notMerge lazyUpdate style={{ height: 300 }} />
  )
}

export default QuartileChart
