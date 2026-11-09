'use client'

import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import type { EChartsOption } from 'echarts'
import { useState } from 'react'
import ThemedChart from '@/app/[lang]/dashboard/components/charts/ThemedChart'
import { AXIS_LINE, NEUTRAL, SERIES, SPLIT_LINE } from '@/app/[lang]/dashboard/components/charts/chartPalette'
import { PublicationYear } from '../types'

type Props = {
  publicationsByYear: PublicationYear[]
}

export default function PublicationsChart({ publicationsByYear }: Props) {
  const [mode, setMode] = useState<'value' | 'pct'>('value')

  if (publicationsByYear.length === 0) {
    return (
      <Typography variant='body2' sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
        Aucune publication sur la période
      </Typography>
    )
  }

  const years = publicationsByYear.map((d) => String(d.year))

  const openData = publicationsByYear.map((d) => d.open)
  const closedData = publicationsByYear.map((d) => d.closed)
  const unknownData = publicationsByYear.map((d) => d.unknown)

  const openPct = publicationsByYear.map((d) => {
    const total = d.open + d.closed + d.unknown
    return total > 0 ? Math.round((d.open / total) * 100) : 0
  })
  const closedPct = publicationsByYear.map((d) => {
    const total = d.open + d.closed + d.unknown
    return total > 0 ? Math.round((d.closed / total) * 100) : 0
  })
  const unknownPct = publicationsByYear.map((d) => {
    const total = d.open + d.closed + d.unknown
    return total > 0 ? Math.round(100 - (d.open / total) * 100 - (d.closed / total) * 100) : 0
  })

  const isPct = mode === 'pct'

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (raw: unknown) => {
        const params = raw as { seriesName: string; value: number; dataIndex: number; color: string }[]
        const idx = params[0]?.dataIndex ?? 0
        const year = years[idx]
        const total = publicationsByYear[idx].open + publicationsByYear[idx].closed + publicationsByYear[idx].unknown
        const oaPct = total > 0 ? Math.round((publicationsByYear[idx].open / total) * 100) : 0
        let html = `<b>${year}</b> — ${total} publication${total > 1 ? 's' : ''}<br/>`
        html += `Taux OA : <b>${oaPct} %</b><br/>`
        for (const p of params) {
          html += `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};margin-right:6px"></span>${p.seriesName} : ${isPct ? p.value + ' %' : p.value}<br/>`
        }
        return html
      },
    },
    legend: {
      data: ['Accès ouvert', 'Accès fermé', 'Type inconnu'],
      bottom: 0,
      textStyle: { fontSize: 12 },
    },
    grid: { left: 40, right: 16, top: 16, bottom: 40 },
    xAxis: {
      type: 'category',
      data: years,
      axisLine: { lineStyle: { color: AXIS_LINE } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      max: isPct ? 100 : undefined,
      axisLabel: { formatter: isPct ? '{value} %' : '{value}' },
      splitLine: { lineStyle: { color: SPLIT_LINE } },
    },
    series: [
      {
        name: 'Accès ouvert',
        type: 'bar',
        stack: 'total',
        data: isPct ? openPct : openData,
        itemStyle: { color: SERIES[0] },
      },
      {
        name: 'Accès fermé',
        type: 'bar',
        stack: 'total',
        data: isPct ? closedPct : closedData,
        itemStyle: { color: SERIES[1] },
      },
      {
        name: 'Type inconnu',
        type: 'bar',
        stack: 'total',
        data: isPct ? unknownPct : unknownData,
        itemStyle: { color: NEUTRAL, borderRadius: [4, 4, 0, 0] },
      },
    ],
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, v) => v && setMode(v)}
            size='small'
            aria-label="Mode d'affichage"
          >
            <ToggleButton value='value' sx={{ textTransform: 'none', fontSize: 12 }}>
              Valeur
            </ToggleButton>
            <ToggleButton value='pct' sx={{ textTransform: 'none', fontSize: 12 }}>
              %
            </ToggleButton>
          </ToggleButtonGroup>
      </Box>
      <Box
          role='img'
          aria-label={`Graphique des publications par année pour les ${years.length} dernières années. Taux d'accès ouvert moyen : ${Math.round(openData.reduce((a, b) => a + b, 0) / publicationsByYear.reduce((acc, d) => acc + d.open + d.closed + d.unknown, 0) * 100)} %.`}
        >
          <ThemedChart option={option} style={{ height: 240 }} />
        </Box>
    </Box>
  )
}
