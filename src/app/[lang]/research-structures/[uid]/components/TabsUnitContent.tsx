'use client'

import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Avatar, Box, Button, Card, CardContent, Chip, Link, Typography } from '@mui/material'
import NextLink from 'next/link'
import { PersonRaw, StructureRaw } from '../types'

// ── Membres (full list) ───────────────────────────────────────────────────────

const STATUT_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'info'> = {
  'Pr.': 'primary',
  'MCF': 'primary',
  'DR': 'info',
  'CR': 'info',
  'Doctorant': 'secondary',
  'Post-doc': 'secondary',
  'ATER': 'warning',
  'Ingé.': 'default',
}

function initials(name: string) {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
}

type MembresTabProps = { members: PersonRaw[]; lang: string }
export function MembresTab({ members, lang }: MembresTabProps) {
  if (members.length === 0) {
    return (
      <Typography variant='body2' sx={{ color: 'text.secondary', py: 2 }}>
        Données membres non disponibles pour cette structure.
      </Typography>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
        <Link
          component={NextLink}
          href={`/${lang}/researchers`}
          underline='hover'
          variant='body2'
          sx={{ color: 'success.main', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          Voir tous les membres <ArrowForwardIcon sx={{ fontSize: 14 }} />
        </Link>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {members.map((p) => (
          <Card
            key={p.uid}
            variant='outlined'
            component={NextLink as React.ElementType}
            href={`/${lang}/researchers/${p.slug}`}
            sx={{ textDecoration: 'none', '&:hover': { borderColor: 'primary.main' } }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: '10px !important' }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.light', fontSize: 13 }}>
                {initials(p.displayName)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant='body2' fontWeight='medium'>{p.displayName}</Typography>
                {p.statut && (
                  <Chip
                    label={p.statut}
                    size='small'
                    variant='outlined'
                    color={STATUT_COLORS[p.statut] ?? 'default'}
                    sx={{ fontSize: 11, height: 18, mt: 0.25 }}
                  />
                )}
              </Box>
              {p.publis24m != null && (
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>publis 24m</Typography>
                  <Typography variant='body2' fontWeight='bold'>{p.publis24m}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  )
}

// ── Équipes ───────────────────────────────────────────────────────────────────

type EquipesTabProps = { teams: StructureRaw[]; lang: string }
export function EquipesTab({ teams, lang }: EquipesTabProps) {
  if (teams.length === 0) {
    return (
      <Typography variant='body2' sx={{ color: 'text.secondary', py: 2 }}>
        Aucune équipe rattachée à cette unité.
      </Typography>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {teams.map((team) => (
        <Card
          key={team.uid}
          variant='outlined'
          component={NextLink as React.ElementType}
          href={`/${lang}/research-structures/${team.uid}`}
          sx={{ textDecoration: 'none', '&:hover': { borderColor: 'primary.main' } }}
        >
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: '12px !important' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant='body2' fontWeight='bold'>{team.acronym}</Typography>
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                {team.long_labels.find((l) => l.language === lang)?.value ?? team.long_labels[0]?.value}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>membres</Typography>
                <Typography variant='body2' fontWeight='bold'>{team.membersCount}</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>publis 24m</Typography>
                <Typography variant='body2' fontWeight='bold'>{team.publicationsCount}</Typography>
              </Box>
              <ArrowForwardIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}

// ── Publications (summary) ────────────────────────────────────────────────────

type PublicationsTabProps = { structure: StructureRaw; lang: string }
export function PublicationsTab({ structure, lang }: PublicationsTabProps) {
  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
        {[
          { label: 'Publications (24 mois)', value: structure.publicationsCount.toLocaleString('fr-FR') },
          { label: 'Taux accès ouvert', value: structure.oaRate > 0 ? `${structure.oaRate} %` : '—' },
          { label: 'Taux dépôt HAL', value: structure.halRate > 0 ? `${structure.halRate} %` : '—' },
        ].map((kpi) => (
          <Card key={kpi.label} variant='outlined'>
            <CardContent sx={{ pb: '12px !important' }}>
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>{kpi.label}</Typography>
              <Typography variant='h5' fontWeight='bold'>{kpi.value}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
      <Button
        component={NextLink}
        href={`/${lang}/documents`}
        variant='outlined'
        endIcon={<ArrowForwardIcon />}
        size='small'
      >
        Voir les publications
      </Button>
    </Box>
  )
}

// ── À propos ──────────────────────────────────────────────────────────────────

type AProposTabProps = { structure: StructureRaw; lang: string }
export function AProposTab({ structure, lang }: AProposTabProps) {
  const description =
    structure.descriptions.find((d) => d.language === lang)?.value ??
    structure.descriptions[0]?.value ?? null

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {description && (
        <Typography variant='body2' sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
          {description}
        </Typography>
      )}
      <Box>
        <Typography variant='caption' sx={{ color: 'text.disabled', display: 'block', mb: 0.5 }}>Tutelles</Typography>
        <Typography variant='body2'>
          {structure.institutionNames.length > 0 ? structure.institutionNames.join(' · ') : '—'}
        </Typography>
      </Box>
      {structure.rnsr && (
        <Box>
          <Typography variant='caption' sx={{ color: 'text.disabled', display: 'block', mb: 0.5 }}>RNSR</Typography>
          <Typography variant='body2' fontFamily='monospace'>{structure.rnsr}</Typography>
        </Box>
      )}
    </Box>
  )
}
