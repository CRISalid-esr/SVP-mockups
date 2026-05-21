'use client'

import { Box, Card, CardContent, CardHeader, Typography } from '@mui/material'
import { StructureRaw } from '../types'

type Props = {
  structure: StructureRaw
  lang: string
}

export default function SidebarAbout({ structure, lang }: Props) {
  const description =
    structure.descriptions.find((d) => d.language === lang)?.value ??
    structure.descriptions[0]?.value ??
    null

  if (!description) return null

  return (
    <Card variant='outlined'>
      <CardHeader
        title={<Typography variant='subtitle2' fontWeight='bold'>À propos</Typography>}
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ pt: 1, pb: '12px !important' }}>
        <Typography variant='body2' sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
          {description}
        </Typography>
        {structure.institutionNames.length > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <Typography variant='caption' sx={{ color: 'text.disabled', display: 'block' }}>
              Tutelles
            </Typography>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              {structure.institutionNames.join(' · ')}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
