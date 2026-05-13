'use client'

import React from 'react'
import { Avatar, Box, Grid2 as Grid, Typography } from '@mui/material'
import { EmojiEvents, MenuBook, Psychology, School } from '@mui/icons-material'
import { Expertise } from '@/types/Expertise'

interface ExpertiseStatsProps {
  expertises: Expertise[]
}

const ExpertiseStats: React.FC<ExpertiseStatsProps> = ({ expertises }) => {
  const total = expertises.length
  const expertLevel = expertises.filter(
    (e) => e.level === 'reference' || e.level === 'recherche',
  ).length
  const totalPublications = expertises.reduce((sum, e) => sum + e.publications, 0)
  const totalTheses = expertises.reduce((sum, e) => sum + e.thesesEncadrees, 0)

  const stats = [
    {
      label: 'Expertises déclarées',
      value: total,
      icon: <Psychology />,
      bg: '#f3f4f6',
      border: '#d1d5db',
      avatarBg: '#6b7280',
      textColor: '#374151',
    },
    {
      label: 'Niveau expert+',
      value: expertLevel,
      icon: <EmojiEvents />,
      bg: '#f0fdf4',
      border: '#86efac',
      avatarBg: '#10b981',
      textColor: '#059669',
    },
    {
      label: 'Publications liées',
      value: totalPublications,
      icon: <MenuBook />,
      bg: '#eff6ff',
      border: '#bfdbfe',
      avatarBg: '#3b82f6',
      textColor: '#1e40af',
    },
    {
      label: 'Thèses encadrées',
      value: totalTheses,
      icon: <School />,
      bg: '#fdf4ff',
      border: '#f0abfc',
      avatarBg: '#a855f7',
      textColor: '#7e22ce',
    },
  ]

  return (
    <Grid container spacing={2}>
      {stats.map((s) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={s.label}>
          <Box
            sx={{
              bgcolor: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: 2,
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Avatar sx={{ bgcolor: s.avatarBg, width: 48, height: 48 }}>
              {s.icon}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, color: s.textColor }}>
                {s.value}
              </Typography>
              <Typography variant="body2" sx={{ color: s.textColor }}>
                {s.label}
              </Typography>
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  )
}

export default ExpertiseStats
