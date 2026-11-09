'use client'

import { useMemo } from 'react'
import { useTheme } from '@mui/material'
import type { EChartsOption } from 'echarts'
import { SERIES, darkenOption } from './chartPalette'

/** Police de l'interface, aussi dans les graphiques. */
export const CHART_FONT = 'Inter, Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif'

/**
 * Applique la palette commune à une option ECharts : couleurs des séries par défaut,
 * police et encre de l'interface, équivalents sombres en mode sombre.
 * Renvoie aussi le thème ECharts à passer au composant.
 */
export function useChartTheme(option: EChartsOption): { option: EChartsOption; theme?: string } {
  const theme = useTheme()
  const dark = theme.palette.mode === 'dark'
  const ink = theme.palette.text.secondary

  return useMemo(() => {
    const base: EChartsOption = {
      color: [...SERIES],
      textStyle: { fontFamily: CHART_FONT, color: ink },
      ...option,
    }
    if (!dark) return { option: base }
    return { option: { backgroundColor: 'transparent', ...darkenOption(base) }, theme: 'dark' }
  }, [option, dark, ink])
}
