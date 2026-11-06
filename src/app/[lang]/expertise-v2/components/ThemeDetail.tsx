'use client'

import { useState } from 'react'
import { Box, Chip, Collapse, Link, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { CampaignOutlined, NewspaperOutlined } from '@mui/icons-material'
import { AUDIENCES, AUDIENCE_CONFIG, Audience, ResearchTheme, TEAL, descriptionFor, formatPeriod } from '../types'
import { RefChip } from './RefsPicker'
import { StudiedPeriodChip } from './StudiedPeriodPicker'

// ─── Blocs partagés entre l'aperçu public et la vue laboratoire ──────────────

/** Sélecteur « Voir comme : Chercheurs / Partenaires / Presse / Grand public ». */
export function AudienceSwitcher({ value, onChange, size = 'small' }: {
  value: Audience | null
  onChange: (a: Audience | null) => void
  size?: 'small' | 'medium'
}) {
  return (
    <ToggleButtonGroup
      exclusive size={size} value={value ?? 'all'}
      onChange={(_e, v: Audience | 'all' | null) => { if (v) onChange(v === 'all' ? null : v) }}
      aria-label="Voir le portail comme"
      sx={{
        flexWrap: 'wrap',
        '& .MuiToggleButton-root': { px: 1.5, color: 'text.primary' },
        '& .MuiToggleButton-root.Mui-selected, & .MuiToggleButton-root.Mui-selected:hover': {
          bgcolor: 'navActive', color: 'text.primary', fontWeight: 600,
        },
      }}
    >
      <ToggleButton value="all">Tous</ToggleButton>
      {AUDIENCES.map((a) => (
        <ToggleButton key={a} value={a}>{AUDIENCE_CONFIG[a].short}</ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}

/** Lieux, personnes et organisations d'un thème, en chips avec lien vers le référentiel. */
export function RefsSummary({ theme, size = 'small', dense = false }: { theme: ResearchTheme; size?: 'small' | 'medium'; dense?: boolean }) {
  const groups = [
    { kind: 'place' as const, title: 'Terrains', items: theme.places },
    { kind: 'person' as const, title: 'Personnes', items: theme.persons },
    { kind: 'organization' as const, title: 'Organisations', items: theme.organizations },
  ].filter((g) => g.items.length > 0)
  if (groups.length === 0) return null
  return (
    <Box sx={{ display: 'flex', flexDirection: dense ? 'row' : 'column', flexWrap: 'wrap', gap: dense ? 1.5 : 0.75 }}>
      {groups.map((g) => (
        <Box key={g.kind} sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
          {!dense && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, minWidth: 92 }}>{g.title}</Typography>
          )}
          {g.items.map((r) => <RefChip key={r.label} kind={g.kind} value={r} size={size} />)}
        </Box>
      ))}
    </Box>
  )
}

/** Rendu d'un thème tel qu'il apparaît sur le portail, pour le public choisi. */
export function ThemePublicBlock({ theme, audience, showPeriodColumn = true, collapsible = false }: {
  theme: ResearchTheme
  audience: Audience | null
  showPeriodColumn?: boolean
  /** Résume le thème (intitulé, période, description) et replie le reste derrière un lien. */
  collapsible?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const text = descriptionFor(theme, audience)
  const missingVariant = audience != null && !theme.variants[audience]?.trim()
  const sol = [theme.acceptsPress ? 'Presse' : null, theme.acceptsEvents ? 'Événements grand public' : null].filter(Boolean)
  const hasRefs = theme.places.length + theme.persons.length + theme.organizations.length > 0
  const hasDetails = theme.keywords.length > 0 || hasRefs || sol.length > 0
    || (collapsible && theme.studiedPeriods.length > 0)

  const details = (
    <>
      {collapsible && <StudiedPeriodsLine theme={theme} />}
      {theme.keywords.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
          {theme.keywords.map((k) => (
            <Chip key={`${k.vocabulary}-${k.label}`} size="small" label={k.label} variant="outlined" />
          ))}
        </Box>
      )}
      {hasRefs && (
        <Box sx={{ mt: 1.25 }}>
          <RefsSummary theme={theme} dense />
        </Box>
      )}
      {sol.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.25, color: 'text.secondary' }}>
          {theme.acceptsPress && <NewspaperOutlined sx={{ fontSize: 15 }} />}
          {theme.acceptsEvents && <CampaignOutlined sx={{ fontSize: 15 }} />}
          <Typography variant="body2">{sol.join(' · ')}</Typography>
        </Box>
      )}
    </>
  )

  const body = (
    <Box>
      <Typography variant="h6" component="h4">{theme.label}</Typography>
      {collapsible && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          {formatPeriod(theme, 'aujourd’hui')}
        </Typography>
      )}
      {text && (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>{text}</Typography>
      )}
      {missingVariant && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
          Description générale (pas de déclinaison pour ce public)
        </Typography>
      )}
      {collapsible ? (
        hasDetails && (
          <>
            <Link
              component="button"
              underline="hover"
              aria-expanded={expanded}
              onClick={() => setExpanded((open) => !open)}
              sx={{ mt: 1, fontSize: '0.875rem', fontWeight: 500 }}
            >
              {expanded ? 'Masquer le détail' : 'Voir le détail'}
            </Link>
            <Collapse in={expanded} unmountOnExit>{details}</Collapse>
          </>
        )
      ) : details}
    </Box>
  )

  if (collapsible || !showPeriodColumn) return body
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '150px 1fr' }, gap: { xs: 0.5, sm: 3 } }}>
      <Box>
        <Typography variant="body2" sx={{ color: TEAL, fontWeight: 700, fontVariantNumeric: 'tabular-nums', pt: 0.4 }}>
          {formatPeriod(theme, 'aujourd’hui')}
        </Typography>
        <StudiedPeriodsLine theme={theme} />
      </Box>
      {body}
    </Box>
  )
}

/** « Porte sur : Révolution française (1789 – 1799) » — l'époque étudiée, distincte de la période de travail. */
export function StudiedPeriodsLine({ theme, size = 'small' }: { theme: Pick<ResearchTheme, 'studiedPeriods'>; size?: 'small' | 'medium' }) {
  if (theme.studiedPeriods.length === 0) return null
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5, mt: 0.75 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>Porte sur</Typography>
      {theme.studiedPeriods.map((p) => <StudiedPeriodChip key={p.label} value={p} size={size} />)}
    </Box>
  )
}
