'use client'

import { useState } from 'react'
import { Alert, Avatar, Box, Button, Chip, Tooltip, Typography } from '@mui/material'
import {
  ArrowBack, CampaignOutlined, CheckCircle, ContentCopy, LockOutlined, NewspaperOutlined,
} from '@mui/icons-material'
import { ResearchProfile, ResearchTheme, TEAL, VISIBILITY_CONFIG, VOCAB_CONFIG, formatPeriod } from '../../types'
import { RefsSummary, StudiedPeriodsLine } from '../ThemeDetail'
import { periodBounds, sortThemes } from '../ThemesList'
import { LAB_INFO, LabMember, initials, isLabVisible, teamColor } from '../Lab/labMock'
import CopyThemeDialog from './CopyThemeDialog'

// ─── Profil d'un·e collègue, en lecture seule ────────────────────────────────
// Même lecture que « Mes thèmes », sans rien de modifiable. On ne voit que ce
// que la personne a validé et rendu visible (établissement ou public) : ses
// brouillons et thèmes privés restent chez elle. Seule action : copier un
// thème dans son propre profil pour gagner du temps sur la saisie des mots-clés.

interface Props {
  member: LabMember
  /** Profil connecté : sert à signaler les thèmes déjà copiés. */
  ownProfile: ResearchProfile
  /** Retour vers la vue d'origine ; absent quand le sélecteur d'espace offre déjà le retour. */
  backLabel?: string
  onBack?: () => void
  onCopy: (copy: ResearchTheme) => void
  /** Ligne sous le nom ; par défaut l'équipe et le laboratoire de démonstration. */
  labLine?: string
}

function PeriodBar({ theme, min, max }: { theme: ResearchTheme; min: number; max: number }) {
  if (theme.yearFrom == null) return null
  const span = Math.max(1, max - min)
  const from = Math.max(0, (theme.yearFrom - min) / span)
  const to = Math.min(1, ((theme.yearTo ?? max) - min) / span)
  return (
    <Box sx={{ position: 'relative', height: 6, borderRadius: 3, bgcolor: '#ECEFF1', mt: 0.75 }}>
      <Box sx={{
        position: 'absolute', top: 0, bottom: 0, left: `${from * 100}%`, width: `${Math.max(2, (to - from) * 100)}%`,
        borderRadius: 3, bgcolor: TEAL, opacity: theme.yearTo == null ? 1 : 0.6,
      }} />
    </Box>
  )
}

function ReadOnlyTheme({ theme, min, max, copiedOn, onCopy }: {
  theme: ResearchTheme; min: number; max: number; copiedOn?: string; onCopy: () => void
}) {
  const vis = VISIBILITY_CONFIG[theme.visibility]
  const sol = theme.visibility === 'public'
    ? [theme.acceptsPress ? 'Presse' : null, theme.acceptsEvents ? 'Événements' : null].filter(Boolean)
    : []

  return (
    <Box component="article" aria-label={`Thème ${theme.label}`} sx={{
      display: 'grid', gridTemplateColumns: { xs: '1fr', md: '190px minmax(0, 1fr) 200px' }, gap: { xs: 1.5, md: 3 },
      px: 3, py: 2.5, bgcolor: 'background.paper', borderLeft: `4px solid ${TEAL}`,
      borderBottom: '1px solid', borderColor: 'divider',
    }}>
      {/* Période */}
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatPeriod(theme)}</Typography>
        <PeriodBar theme={theme} min={min} max={max} />
        <StudiedPeriodsLine theme={theme} />
      </Box>

      {/* Contenu */}
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.3 }}>{theme.label}</Typography>
        {theme.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{theme.description}</Typography>
        )}
        {theme.keywords.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1.25 }}>
            {theme.keywords.map((k) => {
              const c = VOCAB_CONFIG[k.vocabulary]
              return (
                <Tooltip key={`${k.vocabulary}-${k.label}`} title={`${c.label}${k.detail ? ` · ${k.detail}` : ''}`}>
                  <Chip size="small" label={k.label}
                    sx={{ height: 22, fontSize: '0.72rem', bgcolor: `${c.color}10`, color: c.color, border: `1px solid ${c.color}30` }} />
                </Tooltip>
              )
            })}
          </Box>
        )}
        <Box sx={{ mt: 1.25 }}>
          <RefsSummary theme={theme} dense />
        </Box>
      </Box>

      {/* Diffusion + copie */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Chip size="small" icon={<vis.Icon sx={{ fontSize: 14 }} />} label={vis.short}
            sx={{ height: 24, fontWeight: 600, fontSize: '0.74rem', bgcolor: vis.bg, color: vis.color, '& .MuiChip-icon': { color: vis.color } }} />
        </Box>
        {sol.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
            {theme.acceptsPress && <NewspaperOutlined sx={{ fontSize: 14 }} />}
            {theme.acceptsEvents && <CampaignOutlined sx={{ fontSize: 14 }} />}
            <Typography variant="caption">{sol.join(' · ')}</Typography>
          </Box>
        )}
        <Box sx={{ flex: 1 }} />
        {copiedOn && (
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#2E7D32' }}>
            <CheckCircle sx={{ fontSize: 14 }} /> Copié le {copiedOn}
          </Typography>
        )}
        <Button size="small" variant="outlined" startIcon={<ContentCopy fontSize="small" />} onClick={onCopy}
          aria-label={`Copier le thème ${theme.label} dans mon profil`}
          sx={{ textTransform: 'none', borderColor: TEAL, color: TEAL, whiteSpace: 'nowrap' }}>
          {copiedOn ? 'Copier à nouveau' : 'Copier dans mon profil'}
        </Button>
      </Box>
    </Box>
  )
}

export default function MemberProfileView({ member, ownProfile, backLabel, onBack, onCopy, labLine }: Props) {
  const [copying, setCopying] = useState<ResearchTheme | null>(null)

  const visible = sortThemes(member.themes.filter(isLabVisible))
  const hidden = member.themes.length - visible.length
  const { min, max } = periodBounds(visible)
  const copies = new Map(
    ownProfile.themes.filter((t) => t.copiedFrom?.memberId === member.id).map((t) => [t.copiedFrom!.themeId, t.copiedFrom!.date]),
  )
  const firstName = member.name.split(' ')[0]

  return (
    <Box sx={{ p: 3, maxWidth: 1280, mx: 'auto' }}>
      {onBack && (
        <Button size="small" startIcon={<ArrowBack />} onClick={onBack} sx={{ textTransform: 'none', color: 'text.secondary', mb: 2 }}>
          {backLabel}
        </Button>
      )}

      {/* En-tête de la personne */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2.5 }}>
        <Avatar sx={{ width: 56, height: 56, fontSize: '1.2rem', bgcolor: teamColor(member.team) }}>{initials(member.name)}</Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{member.name}</Typography>
          <Typography variant="body2" color="text.secondary">{labLine ?? `${member.team} · ${LAB_INFO.name}`}</Typography>
        </Box>
        <Chip icon={<LockOutlined sx={{ fontSize: 16 }} />} label="Lecture seule" variant="outlined"
          sx={{ fontWeight: 600, color: 'text.secondary' }} />
      </Box>

      <Alert severity="info" variant="outlined" icon={<ContentCopy fontSize="small" />} sx={{ mb: 3 }}>
        Vous consultez les thèmes de recherche de {member.name} sans pouvoir les modifier.
        Pour démarrer plus vite un thème proche du vôtre, <strong>copiez-le dans votre profil</strong> :
        l’intitulé et tous ses mots-clés sont repris, vous les adaptez ensuite.
      </Alert>

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
        Thèmes de recherche{visible.length ? ` (${visible.length})` : ''}
      </Typography>

      {visible.length === 0 ? (
        <Box sx={{ p: 5, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>Aucun thème visible pour l’instant</Typography>
          <Typography variant="body2" color="text.secondary">
            {firstName} n’a pas encore validé de thème visible par l’établissement.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          {visible.map((t) => (
            <ReadOnlyTheme key={t.id} theme={t} min={min} max={max} copiedOn={copies.get(t.id)} onCopy={() => setCopying(t)} />
          ))}
        </Box>
      )}

      {hidden > 0 && (
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1.5 }}>
          {hidden} thème{hidden > 1 ? 's' : ''} non affiché{hidden > 1 ? 's' : ''} (brouillon ou privé).
        </Typography>
      )}

      <CopyThemeDialog
        open={Boolean(copying)}
        theme={copying}
        member={member}
        onClose={() => setCopying(null)}
        onConfirm={(copy) => { setCopying(null); onCopy(copy) }}
      />
    </Box>
  )
}
