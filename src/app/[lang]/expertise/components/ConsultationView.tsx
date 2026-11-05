'use client'

import { Box, Chip, Typography } from '@mui/material'
import { LockOutlined } from '@mui/icons-material'
import { demoIndex } from '@/app/[lang]/components/Perspective/usePerspectiveScope'
import { LAB_FICHES, LAB_MEMBERS } from './Lab/labMock'

// Profil d'une autre personne, en lecture seule. Les fiches et le graphe de la
// maquette appartiennent au profil connecté : on affiche ici un membre du jeu de
// démonstration, choisi de façon stable à partir de la perspective.
export default function ConsultationView({ name, slug }: { name: string; slug: string }) {
  const candidates = LAB_MEMBERS.filter((m) => m.sujets.length > 0 && m.name !== 'Jean Dupont')
  const member = candidates[demoIndex(slug, candidates.length)]
  const fiches = LAB_FICHES.filter((f) => f.memberName === member.name)

  return (
    <Box sx={{ p: 3, maxWidth: 960, mx: 'auto', display: 'grid', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Thèmes de recherche de {name}</Typography>
        <Chip icon={<LockOutlined sx={{ fontSize: 16 }} />} label="Lecture seule" variant="outlined"
          sx={{ fontWeight: 600, color: 'text.secondary' }} />
      </Box>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {member.sujets.map((sujet) => <Chip key={sujet} label={sujet} />)}
      </Box>
      <Box sx={{ display: 'grid', gap: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Expertises</Typography>
        {fiches.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Aucune expertise publiée pour l’instant.</Typography>
        ) : fiches.map((fiche) => (
          <Box key={fiche.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{fiche.title}</Typography>
            <Typography variant="body2" color="text.secondary">{fiche.description}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
