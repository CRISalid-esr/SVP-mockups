'use client'

import { Box, Card, CardContent, CardHeader, LinearProgress, Tooltip, Typography } from '@mui/material'
import { Source } from '../types'

type Props = { sources: Source[] }

function coverageColor(pct: number): string {
  if (pct >= 80) return '#3FB97A'
  if (pct >= 50) return '#E8A33D'
  return '#E53E3E'
}

export default function SidebarSources({ sources }: Props) {
  if (sources.length === 0) return null

  return (
    <Card variant='outlined'>
      <CardHeader
        title={<Typography variant='subtitle2' fontWeight='bold'>Couverture des sources</Typography>}
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ pt: 1, pb: '12px !important' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {sources.map((s) => (
            <Box key={s.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant='caption' sx={{ minWidth: 110, color: 'text.secondary' }}>
                {s.name}
              </Typography>
              <Tooltip
                title={`${s.found.toLocaleString('fr-FR')} publications référencées sur ${s.total.toLocaleString('fr-FR')} attendues`}
                placement='top'
              >
                <Box sx={{ flex: 1 }}>
                  <LinearProgress
                    variant='determinate'
                    value={s.coverage}
                    aria-label={`${s.name} : ${s.coverage} %`}
                    aria-valuenow={s.coverage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    role='progressbar'
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'action.disabledBackground',
                      '& .MuiLinearProgress-bar': { bgcolor: coverageColor(s.coverage) },
                    }}
                  />
                </Box>
              </Tooltip>
              <Typography
                variant='caption'
                fontWeight='bold'
                sx={{ minWidth: 38, textAlign: 'right', color: coverageColor(s.coverage) }}
              >
                {s.coverage} %
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}
