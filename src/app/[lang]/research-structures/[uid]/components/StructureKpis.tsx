'use client'

import { Box, Card, CardContent, Typography } from '@mui/material'
import { StructureRaw } from '../types'

type KpiCardProps = {
  label: string
  value: string
  delta: string
  deltaColor?: 'success.main' | 'error.main' | 'text.secondary'
}

function KpiCard({ label, value, delta, deltaColor = 'text.secondary' }: KpiCardProps) {
  return (
    <Card variant='outlined' sx={{ height: '100%' }}>
      <CardContent sx={{ pb: '12px !important' }}>
        <Typography variant='caption' sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </Typography>
        <Typography variant='h4' fontWeight='bold' sx={{ my: 0.5, lineHeight: 1 }}>
          {value}
        </Typography>
        <Typography variant='caption' sx={{ color: deltaColor }}>
          {delta}
        </Typography>
      </CardContent>
    </Card>
  )
}

type Props = { structure: StructureRaw }

export default function StructureKpis({ structure }: Props) {
  const { membersCount, publicationsCount, oaRate, halRate, halDelta, publicationsDelta } = structure

  const publisDeltaColor =
    publicationsDelta == null ? 'text.secondary'
    : publicationsDelta > 0 ? 'success.main'
    : publicationsDelta < 0 ? 'error.main'
    : 'text.secondary'

  const publisDeltaText =
    publicationsDelta == null ? '—'
    : publicationsDelta > 0 ? `+${publicationsDelta} % vs année précédente`
    : publicationsDelta < 0 ? `${publicationsDelta} % vs année précédente`
    : 'Stable vs année précédente'

  const halDeltaText =
    halDelta == null ? '—'
    : halDelta > 0 ? `+${halDelta} pts sur 12 mois`
    : halDelta < 0 ? `${halDelta} pts sur 12 mois`
    : 'Stable sur 12 mois'

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
        gap: 1.5,
      }}
      role='region'
      aria-label='Indicateurs clés'
    >
      <KpiCard
        label='Membres'
        value={membersCount.toLocaleString('fr-FR')}
        delta='permanents et contractuels'
      />
      <KpiCard
        label='Publications 24 mois'
        value={publicationsCount.toLocaleString('fr-FR')}
        delta={publisDeltaText}
        deltaColor={publisDeltaColor}
      />
      <KpiCard
        label='Accès ouvert'
        value={oaRate > 0 ? `${oaRate} %` : '—'}
        delta='cible 60 %'
      />
      <KpiCard
        label='Dépôt HAL'
        value={halRate > 0 ? `${halRate} %` : '—'}
        delta={halDeltaText}
        deltaColor={halDelta != null && halDelta > 0 ? 'success.main' : halDelta != null && halDelta < 0 ? 'error.main' : 'text.secondary'}
      />
    </Box>
  )
}
