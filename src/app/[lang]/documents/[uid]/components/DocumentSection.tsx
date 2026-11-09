import { ReactNode } from 'react'
import { Box, Card, Typography } from '@mui/material'

/** Carte d'une section de la fiche publication : titre, sous-titre et actions sur une ligne, contenu dessous. */
const DocumentSection = ({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string
  subtitle?: ReactNode
  actions?: ReactNode
  children: ReactNode
}) => (
  <Card component='section' sx={{ p: 3 }}>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 2 }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant='h6' component='h2'>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant='body2' color='text.secondary' sx={{ mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{actions}</Box>}
    </Box>
    {children}
  </Card>
)

export default DocumentSection
