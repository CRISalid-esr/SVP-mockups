'use client'

import { useState } from 'react'
import { Box, Button, Card, Chip, IconButton, Tooltip, Typography } from '@mui/material'
import { ArrowBack, CampaignOutlined, CheckCircle, ContentCopy, LockOutlined, NewspaperOutlined } from '@mui/icons-material'
import { ResearchProfile, ResearchTheme, VISIBILITY_CONFIG } from '../../types'
import { ThemePublicBlock } from '../ThemeDetail'
import { sortThemes } from '../ThemesList'
import { LAB_INFO, LabMember, initials, isLabVisible } from '../Lab/labMock'
import CopyThemeDialog from './CopyThemeDialog'

// ─── Profil d'un·e collègue, en lecture seule ────────────────────────────────
// On ne voit que ce que la personne a validé et rendu visible (établissement ou
// public) : ses brouillons et thèmes privés restent chez elle. Chaque thème est
// résumé, le détail s'ouvre au clic, comme dans l'aperçu public. Seule action :
// copier un thème dans son propre profil pour gagner du temps sur la saisie.

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

function ThemeRow({ theme, copiedOn, onCopy }: { theme: ResearchTheme; copiedOn?: string; onCopy: () => void }) {
  const visibility = VISIBILITY_CONFIG[theme.visibility]
  const isPublic = theme.visibility === 'public'

  return (
    <Box
      component='article'
      aria-label={`Thème ${theme.label}`}
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 210px' },
        gap: { xs: 2, md: 3 },
        px: 3,
        py: 2.5,
        '&:not(:first-of-type)': { borderTop: 1, borderColor: 'divider' },
      }}
    >
      <ThemePublicBlock theme={theme} audience={null} collapsible />

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Chip
            size='small'
            icon={<visibility.Icon sx={{ fontSize: 14 }} />}
            label={visibility.short}
            sx={{ bgcolor: visibility.bg, color: visibility.color, '& .MuiChip-icon': { color: 'inherit' } }}
          />
          {isPublic && theme.acceptsPress && (
            <Tooltip title='Accepte les sollicitations de la presse'>
              <NewspaperOutlined fontSize='small' sx={{ color: 'text.secondary' }} aria-label='Accepte la presse' />
            </Tooltip>
          )}
          {isPublic && theme.acceptsEvents && (
            <Tooltip title='Accepte les événements grand public'>
              <CampaignOutlined fontSize='small' sx={{ color: 'text.secondary' }} aria-label='Accepte les événements' />
            </Tooltip>
          )}
        </Box>
        <Button
          size='small'
          variant='outlined'
          startIcon={<ContentCopy fontSize='small' />}
          onClick={onCopy}
          aria-label={`Copier le thème ${theme.label} dans mon profil`}
          sx={{ whiteSpace: 'nowrap' }}
        >
          {copiedOn ? 'Copier à nouveau' : 'Copier dans mon profil'}
        </Button>
        {copiedOn && (
          <Typography variant='body2' sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'success.dark', fontSize: '0.8125rem' }}>
            <CheckCircle sx={{ fontSize: 15 }} /> Copié le {copiedOn}
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export default function MemberProfileView({ member, ownProfile, backLabel, onBack, onCopy, labLine }: Props) {
  const [copying, setCopying] = useState<ResearchTheme | null>(null)

  const visible = sortThemes(member.themes.filter(isLabVisible))
  const hidden = member.themes.length - visible.length
  const copies = new Map(
    ownProfile.themes.filter((t) => t.copiedFrom?.memberId === member.id).map((t) => [t.copiedFrom!.themeId, t.copiedFrom!.date]),
  )
  const firstName = member.name.split(' ')[0]

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* En-tête, comme les fiches publication et structure */}
      <Box component='header' sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        {onBack && (
          <Tooltip title={backLabel ?? 'Retour'}>
            <IconButton onClick={onBack} aria-label={backLabel ?? 'Retour'} sx={{ mt: 0.5 }}>
              <ArrowBack />
            </IconButton>
          </Tooltip>
        )}
        <Box
          aria-hidden
          sx={{
            width: 48, height: 48, borderRadius: 3, flexShrink: 0,
            bgcolor: 'navActive', color: 'primary.main',
            display: 'grid', placeItems: 'center', fontWeight: 600,
          }}
        >
          {initials(member.name)}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant='h4' component='h1'>{member.name}</Typography>
          <Typography color='text.secondary' sx={{ mt: 0.25 }}>{labLine ?? `${member.team} · ${LAB_INFO.name}`}</Typography>
        </Box>
        <Chip icon={<LockOutlined sx={{ fontSize: 16 }} />} label='Lecture seule' variant='outlined' sx={{ mt: 0.5 }} />
      </Box>

      <Card component='section' aria-label='Thèmes de recherche' sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ px: 3, pt: 3, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant='h6' component='h2'>
            Thèmes de recherche{visible.length ? ` (${visible.length})` : ''}
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 0.25 }}>
            Un thème proche du vôtre ? Copiez-le dans votre profil : l’intitulé et ses mots-clés sont repris, vous l’adaptez ensuite.
          </Typography>
        </Box>

        {visible.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Aucun thème visible pour l’instant</Typography>
            <Typography variant='body2' color='text.secondary'>
              {firstName} n’a pas encore validé de thème visible par l’établissement.
            </Typography>
          </Box>
        ) : (
          visible.map((t) => (
            <ThemeRow key={t.id} theme={t} copiedOn={copies.get(t.id)} onCopy={() => setCopying(t)} />
          ))
        )}
      </Card>

      {hidden > 0 && (
        <Typography variant='body2' color='text.secondary'>
          {hidden} thème{hidden > 1 ? 's' : ''} non affiché{hidden > 1 ? 's' : ''} (brouillon ou privé).
        </Typography>
      )}

      <CopyThemeDialog
        open={Boolean(copying)}
        theme={copying}
        member={member}
        onClose={() => setCopying(null)}
        onConfirm={(copy) => {
          setCopying(null)
          onCopy(copy)
        }}
      />
    </Box>
  )
}
