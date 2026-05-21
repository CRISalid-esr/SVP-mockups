'use client'

import { Box, Card, CardContent, CardHeader, LinearProgress, Typography } from '@mui/material'
import { Discipline } from '../types'

type Props = { disciplines: Discipline[] }

export default function SidebarDisciplines({ disciplines }: Props) {
  if (disciplines.length === 0) return null

  const top5 = disciplines.slice(0, 5)

  return (
    <Card variant='outlined'>
      <CardHeader
        title={<Typography variant='subtitle2' fontWeight='bold'>Disciplines</Typography>}
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ pt: 1, pb: '12px !important' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {top5.map((d) => (
            <Box key={d.label}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                <Typography variant='caption'>{d.label}</Typography>
                <Typography variant='caption' fontWeight='bold'>{d.pct} %</Typography>
              </Box>
              <LinearProgress
                variant='determinate'
                value={d.pct}
                aria-label={`${d.label} : ${d.pct} %`}
                aria-valuenow={d.pct}
                aria-valuemin={0}
                aria-valuemax={100}
                role='progressbar'
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: 'action.disabledBackground',
                  '& .MuiLinearProgress-bar': { bgcolor: 'success.main' },
                }}
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}
