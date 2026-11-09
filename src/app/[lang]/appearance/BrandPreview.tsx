'use client'

import { Box, Button, Card, Chip, Link, Tab, Tabs, Typography, useTheme } from '@mui/material'
import type { EChartsOption } from 'echarts'
import { useMemo, useState } from 'react'
import ThemedChart from '@/app/[lang]/dashboard/components/charts/ThemedChart'
import { NEUTRAL, SERIES, chartColorsFor } from '@/app/[lang]/dashboard/components/charts/chartPalette'
import { KpiCard } from '@/app/[lang]/dashboard/components/charts/KpiCard'

const NAV = ['Tableau de bord', 'Publications', 'Profil recherche']

/** Échantillon d'écrans : il suit le thème courant, donc la couleur choisie. */
export default function BrandPreview() {
  const theme = useTheme()
  const [tab, setTab] = useState(0)

  const option = useMemo<EChartsOption>(
    () => ({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { bottom: 0, itemWidth: 10, itemHeight: 10 },
      grid: { left: 32, right: 8, top: 12, bottom: 36 },
      xAxis: { type: 'category', data: ['2021', '2022', '2023', '2024', '2025'], axisTick: { show: false } },
      yAxis: { type: 'value' },
      series: [
        { name: 'Accès ouvert', type: 'bar', stack: 'a', data: [20, 26, 31, 36, 30], itemStyle: { color: SERIES[0] } },
        { name: 'Accès fermé', type: 'bar', stack: 'a', data: [15, 12, 10, 8, 6], itemStyle: { color: SERIES[1] } },
        { name: 'Inconnu', type: 'bar', stack: 'a', data: [6, 5, 5, 4, 3], itemStyle: { color: NEUTRAL, borderRadius: [4, 4, 0, 0] } },
      ],
    }),
    [],
  )

  return (
    <Card component='section' aria-label='Aperçu' sx={{ p: 0, overflow: 'hidden' }}>
      <Box sx={{ px: 3, pt: 3, pb: 2 }}>
        <Typography variant='h6' component='h2'>Aperçu</Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mt: 0.25 }}>
          Toutes les pages changent en même temps. Passez en mode sombre depuis la barre du haut pour le vérifier aussi.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: '190px minmax(0, 1fr)' },
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.default',
        }}
      >
        <Box component='nav' aria-label='Menu (aperçu)' sx={{ p: 1.5, bgcolor: 'background.paper', borderRight: { sm: 1 }, borderColor: 'divider' }}>
          {NAV.map((label, i) => (
            <Box
              key={label}
              sx={{
                px: 1.5,
                py: 1.25,
                mb: 0.5,
                borderRadius: 2,
                fontSize: '0.875rem',
                bgcolor: i === 1 ? 'navActive' : 'transparent',
                fontWeight: i === 1 ? 700 : 400,
              }}
            >
              {label}
            </Box>
          ))}
        </Box>

        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <Box>
            <Typography variant='h5' component='p' sx={{ fontWeight: 700 }}>Mes publications</Typography>
            <Typography variant='body2' color='text.secondary'>
              128 publications · <Link href='#' onClick={(e) => e.preventDefault()}>Voir celles hors HAL</Link>
            </Typography>
          </Box>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 40 }}>
            {['Informations', 'Auteurs', 'Thématiques'].map((label) => (
              <Tab key={label} label={label} sx={{ minHeight: 40, textTransform: 'none' }} />
            ))}
          </Tabs>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            <Button variant='contained' disableElevation>Enregistrer</Button>
            <Button variant='outlined'>Déposer dans HAL</Button>
            <Button>Annuler</Button>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip size='small' label='Validé' color='success' variant='outlined' />
            <Chip size='small' label='Brouillon' color='warning' variant='outlined' />
            <Chip size='small' label='Dans HAL' color='info' variant='outlined' />
            <Chip size='small' label='Robotique' sx={{ bgcolor: 'navActive', color: 'primary.main', fontWeight: 500 }} />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '180px minmax(0, 1fr)' }, gap: 2 }}>
            <KpiCard value='62 %' label='En accès ouvert' hint='205 publications' />
            <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 4, bgcolor: 'background.paper', p: 1.5, minWidth: 0 }}>
              <ThemedChart option={option} style={{ height: 190 }} />
            </Box>
          </Box>
        </Box>
      </Box>

      <GeneratedSwatches seed={theme.palette.brandSeed} mode={theme.palette.mode} />
    </Card>
  )
}

function Swatches({ label, colors }: { label: string; colors: string[] }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: '150px minmax(0, 1fr)' }, gap: 1, alignItems: 'center' }}>
      <Typography variant='body2' color='text.secondary'>{label}</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${colors.length}, minmax(0, 1fr))`, gap: 0.5 }}>
        {colors.map((c, i) => (
          <Box key={`${c}-${i}`} title={c} aria-label={c} role='img' sx={{ height: 28, borderRadius: 1.5, bgcolor: c, border: 1, borderColor: 'divider' }} />
        ))}
      </Box>
    </Box>
  )
}

function GeneratedSwatches({ seed, mode }: { seed: string; mode: 'light' | 'dark' }) {
  const theme = useTheme()
  const palette = theme.palette as unknown as Record<string, string>
  const tones = [10, 20, 30, 40, 50, 60, 70, 80, 90, 95].map((t) => palette[`primary${t}`])
  const charts = chartColorsFor(seed, mode)

  return (
    <Box sx={{ px: 3, py: 2.5, borderTop: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <Typography variant='subtitle2' component='h3' sx={{ fontWeight: 700 }}>Couleurs générées</Typography>
      <Swatches label='Tons de la couleur' colors={tones} />
      <Swatches label='Séries des graphiques' colors={charts.series} />
      <Swatches label='Rang (Q1 → Q4)' colors={charts.ordinal} />
      <Swatches label='Intensité (cartes)' colors={charts.sequential} />
    </Box>
  )
}
