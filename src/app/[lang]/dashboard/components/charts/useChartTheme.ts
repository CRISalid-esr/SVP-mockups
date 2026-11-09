'use client'

import { useMemo } from 'react'
import { useTheme } from '@mui/material'
import type { EChartsOption } from 'echarts'
import { DEFAULT_BRAND } from '@/app/theme/brand'
import { SERIES, chartColorMap, remapOption } from './chartPalette'

/** Police de l'interface, aussi dans les graphiques. */
export const CHART_FONT = 'Inter, Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif'

/**
 * Applique la palette commune à une option ECharts : couleurs des séries par défaut,
 * police et encre de l'interface, couleur d'établissement et équivalents sombres.
 * Renvoie aussi le thème ECharts à passer au composant.
 */
export function useChartTheme(option: EChartsOption): { option: EChartsOption; theme?: string } {
  const theme = useTheme()
  const dark = theme.palette.mode === 'dark'
  const ink = theme.palette.text.secondary
  const seed = theme.palette.brandSeed ?? DEFAULT_BRAND
  const map = useMemo(() => chartColorMap(seed, dark ? 'dark' : 'light'), [seed, dark])

  return useMemo(() => {
    const base: EChartsOption = {
      color: [...SERIES],
      textStyle: { fontFamily: CHART_FONT, color: ink },
      ...option,
    }
    const themed = map.size ? remapOption(base, map) : base
    if (!dark) return { option: themed }
    return { option: { backgroundColor: 'transparent', ...themed }, theme: 'dark' }
  }, [option, dark, ink, map])
}
