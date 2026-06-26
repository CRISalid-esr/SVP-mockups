'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Box, Typography } from '@mui/material'
import {
  DashboardDataProvider,
  DashboardView,
} from '@/app/[lang]/dashboard/components/DashboardViewContext'
import { EmbedModeContext } from '@/app/[lang]/dashboard/components/charts/EChart'
import { EMBED_CHARTS } from '@/app/[lang]/dashboard/components/charts/embedRegistry'

const EmbedInner = () => {
  const params = useSearchParams()
  const chartId = params.get('chart') ?? ''
  const perspective: DashboardView =
    params.get('perspective') === 'researcher' ? 'researcher' : 'lab'

  const def = EMBED_CHARTS[chartId]
  if (!def) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color='text.secondary'>
          Graphique introuvable. Vérifiez le lien d&apos;intégration.
        </Typography>
      </Box>
    )
  }

  const { Chart } = def
  return (
    <EmbedModeContext.Provider value={true}>
      <DashboardDataProvider view={perspective}>
        <Box sx={{ p: 1, bgcolor: 'background.paper', position: 'relative' }}>
          <Typography
            variant='subtitle2'
            sx={{ px: 1, pb: 0.5, color: 'primary.main' }}
          >
            {def.label}
          </Typography>
          <Chart />
        </Box>
      </DashboardDataProvider>
    </EmbedModeContext.Provider>
  )
}

const EmbedPage = () => (
  <Suspense fallback={<Box sx={{ p: 3 }}>Chargement…</Box>}>
    <EmbedInner />
  </Suspense>
)

export default EmbedPage
