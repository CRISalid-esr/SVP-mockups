import React from 'react'
import { Box, Card, Typography } from '@mui/material'

interface Props {
  title: string
  subtitle?: string
  children: React.ReactNode
}

/**
 * Carte d'un graphique : titre et sous-titre sobres, le graphique dessous.
 * Elle est en `position: relative` pour accueillir le menu ⋯ du graphique (EChart).
 */
const DashboardSectionCard = ({ title, subtitle, children }: Props) => (
  <Card component='section' sx={{ position: 'relative', height: '100%', p: 3, boxSizing: 'border-box' }}>
    <Box sx={{ pr: 5, mb: 2 }}>
      <Typography variant='h6' component='h2'>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
    {children}
  </Card>
)

export default DashboardSectionCard
