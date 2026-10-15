'use client'

import { Box, Chip, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { CampaignOutlined, NewspaperOutlined } from '@mui/icons-material'
import { AUDIENCES, AUDIENCE_CONFIG, Audience, ResearchTheme, TEAL, descriptionFor, formatPeriod } from '../types'
import { RefChip } from './RefsPicker'

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
      sx={{ flexWrap: 'wrap', '& .MuiToggleButton-root': { textTransform: 'none', px: 1.5, gap: 0.5 } }}
    >
      <ToggleButton value="all" sx={{ '&.Mui-selected': { bgcolor: `${TEAL}14`, color: TEAL, fontWeight: 700 } }}>
        Description générale
      </ToggleButton>
      {AUDIENCES.map((a) => {
        const c = AUDIENCE_CONFIG[a]
        return (
          <ToggleButton key={a} value={a}
            sx={{ '&.Mui-selected': { bgcolor: c.bg, color: c.color, fontWeight: 700 } }}>
            <c.Icon sx={{ fontSize: 16 }} />
            {c.short}
          </ToggleButton>
        )
      })}
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
export function ThemePublicBlock({ theme, audience, showPeriodColumn = true }: {
  theme: ResearchTheme
  audience: Audience | null
  showPeriodColumn?: boolean
}) {
  const text = descriptionFor(theme, audience)
  const adapted = audience != null && Boolean(theme.variants[audience]?.trim())
  const cfg = audience ? AUDIENCE_CONFIG[audience] : null
  const sol = [theme.acceptsPress ? 'Presse' : null, theme.acceptsEvents ? 'Événements grand public' : null].filter(Boolean)

  const body = (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>{theme.label}</Typography>
      {text && (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>{text}</Typography>
      )}
      {cfg && (
        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: adapted ? cfg.color : 'text.disabled', fontStyle: adapted ? 'normal' : 'italic' }}>
          {adapted ? `Version adaptée aux ${cfg.label.toLowerCase()}` : 'Description générale (pas de déclinaison pour ce public)'}
        </Typography>
      )}
      {theme.keywords.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
          {theme.keywords.map((k) => (
            <Chip key={`${k.vocabulary}-${k.label}`} size="small" label={k.label} variant="outlined" />
          ))}
        </Box>
      )}
      <Box sx={{ mt: 1.25 }}>
        <RefsSummary theme={theme} dense />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.25, color: sol.length ? '#2E7D32' : 'text.disabled' }}>
        {theme.acceptsPress && <NewspaperOutlined sx={{ fontSize: 15 }} />}
        {theme.acceptsEvents && <CampaignOutlined sx={{ fontSize: 15 }} />}
        <Typography variant="caption">{sol.length ? sol.join(' · ') : 'Pas de sollicitation'}</Typography>
      </Box>
    </Box>
  )

  if (!showPeriodColumn) return body
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '150px 1fr' }, gap: { xs: 0.5, sm: 3 } }}>
      <Typography variant="body2" sx={{ color: TEAL, fontWeight: 700, fontVariantNumeric: 'tabular-nums', pt: 0.4 }}>
        {formatPeriod(theme, 'aujourd’hui')}
      </Typography>
      {body}
    </Box>
  )
}
