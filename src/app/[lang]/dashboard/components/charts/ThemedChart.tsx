'use client'

import type { CSSProperties } from 'react'
import ReactEcharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { useChartTheme } from './useChartTheme'

/** Graphique sans le menu d'actions d'EChart, avec la même palette et le mode sombre. */
export default function ThemedChart({ option, style }: { option: EChartsOption; style?: CSSProperties }) {
  const themed = useChartTheme(option)
  return <ReactEcharts option={themed.option} theme={themed.theme} notMerge lazyUpdate style={style} />
}
