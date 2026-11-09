import React from 'react'
import { Box } from '@mui/material'

/** Deux cartes de graphique côte à côte à partir de `md`, l'une sous l'autre avant. */
export const ChartGrid = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' }, gap: 3 }}>
    {children}
  </Box>
)
