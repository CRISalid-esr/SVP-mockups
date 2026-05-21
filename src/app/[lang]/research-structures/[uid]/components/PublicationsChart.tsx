'use client'

import { Box, Card, CardContent, CardHeader, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import ReactECharts from 'echarts-for-react'
import { useState } from 'react'
import { PublicationYear } from '../types'

type Props = {
  publicationsByYear: PublicationYear[]
}

export default function PublicationsChart({ publicationsByYear }: Props) {
  const [mode, setMode] = useState<'value' | 'pct'>('value')

  if (publicationsByYear.length === 0) {
    return (
      <Card variant='outlined'>
        <CardContent>
          <Typography variant='body2' sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
            Aucune publication sur la période
          </Typography>
        </CardContent>
      </Card>
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

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: { seriesName: string; value: number; dataIndex: number }[]) => {
        const idx = params[0]?.dataIndex ?? 0
        const year = years[idx]
        const total = publicationsByYear[idx].open + publicationsByYear[idx].closed + publicationsByYear[idx].unknown
        const oaPct = total > 0 ? Math.round((publicationsByYear[idx].open / total) * 100) : 0
        let html = `<b>${year}</b> — ${total} publication${total > 1 ? 's' : ''}<br/>`
        html += `Taux OA : <b>${oaPct} %</b><br/>`
        for (const p of params) {
          html += `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${
            p.seriesName === 'Accès ouvert' ? '#3FB97A' : p.seriesName === 'Accès fermé' ? '#3B79D8' : '#9AA39E'
          };margin-right:6px"></span>${p.seriesName} : ${isPct ? p.value + ' %' : p.value}<br/>`
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
      axisLine: { lineStyle: { color: '#DDE4E1' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      max: isPct ? 100 : undefined,
      axisLabel: { formatter: isPct ? '{value} %' : '{value}' },
      splitLine: { lineStyle: { color: '#F0F4F2' } },
    },
    series: [
      {
        name: 'Accès ouvert',
        type: 'bar',
        stack: 'total',
        data: isPct ? openPct : openData,
        itemStyle: { color: '#3FB97A', borderRadius: [0, 0, 0, 0] },
      },
      {
        name: 'Accès fermé',
        type: 'bar',
        stack: 'total',
        data: isPct ? closedPct : closedData,
        itemStyle: { color: '#3B79D8' },
      },
      {
        name: 'Type inconnu',
        type: 'bar',
        stack: 'total',
        data: isPct ? unknownPct : unknownData,
        itemStyle: { color: '#9AA39E', borderRadius: [4, 4, 0, 0] },
      },
    ],
  }

  return (
    <Card variant='outlined'>
      <CardHeader
        title={
          <Typography variant='subtitle1' fontWeight='bold'>
            Publications par année
          </Typography>
        }
        action={
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
        }
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ pt: 1, pb: '12px !important' }}>
        <Box
          role='img'
          aria-label={`Graphique des publications par année pour les ${years.length} dernières années. Taux d'accès ouvert moyen : ${Math.round(openData.reduce((a, b) => a + b, 0) / publicationsByYear.reduce((acc, d) => acc + d.open + d.closed + d.unknown, 0) * 100)} %.`}
        >
          <ReactECharts option={option} style={{ height: 240 }} />
        </Box>
      </CardContent>
    </Card>
  )
}
