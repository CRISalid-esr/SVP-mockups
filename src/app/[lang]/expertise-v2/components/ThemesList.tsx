'use client'

import { Alert, Box, Button, Chip, Tooltip, Typography } from '@mui/material'
import {
  Add, BusinessOutlined, CampaignOutlined, CheckCircle, CloudDownloadOutlined, EditOutlined, Groups2Outlined,
  NewspaperOutlined, PersonOutline, PlaceOutlined,
} from '@mui/icons-material'
import {
  AUDIENCES, CURRENT_YEAR, ResearchProfile, ResearchTheme, TEAL, TEAL_DARK, VISIBILITY_CONFIG, VOCAB_CONFIG,
  formatPeriod, variantCount,
} from '../types'

/** Ligne discrète : terrains, personnes, organisations et nombre de déclinaisons par public. */
function ThemeMeta({ theme }: { theme: ResearchTheme }) {
  const parts: { Icon: React.ElementType; text: string; title: string }[] = []
  const names = (items: { label: string }[]) => {
    const shown = items.slice(0, 2).map((i) => i.label.replace(/\s*\([^)]*\)\s*$/, ''))
    return items.length > 2 ? `${shown.join(', ')} +${items.length - 2}` : shown.join(', ')
  }
  if (theme.places.length) parts.push({ Icon: PlaceOutlined, text: names(theme.places), title: 'Terrains' })
  if (theme.persons.length) parts.push({ Icon: PersonOutline, text: names(theme.persons), title: 'Personnes' })
  if (theme.organizations.length) parts.push({ Icon: BusinessOutlined, text: names(theme.organizations), title: 'Organisations' })
  const variants = variantCount(theme)
  if (variants) parts.push({ Icon: Groups2Outlined, text: `${variants}/${AUDIENCES.length} publics`, title: 'Déclinaisons par public' })
  if (parts.length === 0) return null
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 0.75, color: 'text.secondary' }}>
      {parts.map((p) => (
        <Tooltip key={p.title} title={p.title}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, minWidth: 0 }}>
            <p.Icon sx={{ fontSize: 14, color: TEAL }} />
            <Typography variant="caption" noWrap sx={{ maxWidth: 260 }}>{p.text}</Typography>
          </Box>
        </Tooltip>
      ))}
    </Box>
  )
}

interface Props {
  profile: ResearchProfile
  onEdit: (id: string) => void
  onAdd: () => void
  onImport: () => void
}

const GRID_COLUMNS = { xs: '1fr', md: 'minmax(0, 1fr) 230px 190px 120px' }

/** Tri : thèmes validés d'abord (en cours puis par date de début décroissante), brouillons à la fin. */
export function sortThemes(themes: ResearchTheme[]): ResearchTheme[] {
  const rank = (t: ResearchTheme) => (t.status === 'draft' ? 1 : 0)
  return [...themes].sort((a, b) => {
    if (rank(a) !== rank(b)) return rank(a) - rank(b)
    const aOngoing = a.yearTo == null ? 0 : 1
    const bOngoing = b.yearTo == null ? 0 : 1
    if (aOngoing !== bOngoing) return aOngoing - bOngoing
    return (b.yearFrom ?? 0) - (a.yearFrom ?? 0)
  })
}

export function periodBounds(themes: ResearchTheme[]): { min: number; max: number } {
  const starts = themes.map((t) => t.yearFrom).filter((y): y is number => y != null)
  const min = starts.length ? Math.min(...starts) - 1 : CURRENT_YEAR - 10
  return { min, max: CURRENT_YEAR }
}

function PeriodBar({ theme, min, max }: { theme: ResearchTheme; min: number; max: number }) {
  if (theme.yearFrom == null) return null
  const span = Math.max(1, max - min)
  const from = Math.max(0, (theme.yearFrom - min) / span)
  const to = Math.min(1, ((theme.yearTo ?? max) - min) / span)
  const draft = theme.status === 'draft'
  return (
    <Box sx={{ position: 'relative', height: 6, borderRadius: 3, bgcolor: '#ECEFF1', mt: 0.75 }}>
      <Box sx={{
        position: 'absolute', top: 0, bottom: 0,
        left: `${from * 100}%`, width: `${Math.max(2, (to - from) * 100)}%`,
        borderRadius: 3,
        bgcolor: draft ? 'transparent' : TEAL,
        border: draft ? '1.5px dashed #ED6C02' : 'none',
        opacity: theme.yearTo == null ? 1 : 0.6,
      }} />
    </Box>
  )
}

function ThemeRow({ theme, min, max, onEdit }: {
  theme: ResearchTheme; min: number; max: number; onEdit: () => void
}) {
  const vis = VISIBILITY_CONFIG[theme.visibility]
  const draft = theme.status === 'draft'
  const shownKeywords = theme.keywords.slice(0, 3)
  const extra = theme.keywords.length - shownKeywords.length
  const solicitations = theme.visibility === 'public'
    ? [theme.acceptsPress ? 'Presse' : null, theme.acceptsEvents ? 'Événements' : null].filter(Boolean)
    : []

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onEdit() } }}
      aria-label={`Modifier le thème ${theme.label}`}
      sx={{
        display: 'grid', gridTemplateColumns: GRID_COLUMNS, gap: { xs: 1.5, md: 3 }, alignItems: 'center',
        px: 3, py: 2.25, cursor: 'pointer',
        bgcolor: 'background.paper',
        borderLeft: `4px solid ${draft ? '#ED6C02' : TEAL}`,
        borderBottom: '1px solid', borderColor: 'divider',
        transition: 'background-color 0.15s',
        '&:hover': { bgcolor: `${TEAL}06` },
        '&:hover .row-edit': { opacity: 1 },
        '&:focus-visible': { outline: `2px solid ${TEAL}`, outlineOffset: -2 },
      }}
    >
      {/* Thème */}
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.3 }}>
            {theme.label || 'Thème sans titre'}
          </Typography>
          <EditOutlined className="row-edit" sx={{ fontSize: 16, color: 'text.disabled', opacity: 0, transition: 'opacity 0.15s' }} />
        </Box>
        <Typography variant="body2" color={theme.description ? 'text.secondary' : 'text.disabled'}
          sx={{
            mt: 0.25, fontStyle: theme.description ? 'normal' : 'italic',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
          {theme.description || 'Description à compléter'}
        </Typography>
        {theme.keywords.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
            {shownKeywords.map((k) => (
              <Chip key={`${k.vocabulary}-${k.label}`} size="small" label={k.label}
                sx={{
                  height: 22, fontSize: '0.72rem',
                  bgcolor: `${VOCAB_CONFIG[k.vocabulary].color}10`,
                  color: VOCAB_CONFIG[k.vocabulary].color,
                  border: `1px solid ${VOCAB_CONFIG[k.vocabulary].color}30`,
                }} />
            ))}
            {extra > 0 && (
              <Chip size="small" label={`+${extra}`} variant="outlined"
                sx={{ height: 22, fontSize: '0.72rem', color: 'text.secondary' }} />
            )}
          </Box>
        )}
        <ThemeMeta theme={theme} />
      </Box>

      {/* Période */}
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          {formatPeriod(theme)}
        </Typography>
        <PeriodBar theme={theme} min={min} max={max} />
      </Box>

      {/* Diffusion */}
      <Box>
        <Chip size="small" icon={<vis.Icon sx={{ fontSize: 14 }} />} label={vis.short}
          sx={{
            height: 24, fontWeight: 600, fontSize: '0.74rem',
            bgcolor: vis.bg, color: vis.color,
            '& .MuiChip-icon': { color: vis.color },
          }} />
        {solicitations.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.6, color: 'text.secondary' }}>
            {theme.acceptsPress && <NewspaperOutlined sx={{ fontSize: 14 }} />}
            {theme.acceptsEvents && <CampaignOutlined sx={{ fontSize: 14 }} />}
            <Typography variant="caption">{solicitations.join(' · ')}</Typography>
          </Box>
        )}
      </Box>

      {/* Statut */}
      <Box>
        {draft ? (
          <Chip size="small" label="Brouillon"
            sx={{ height: 24, fontWeight: 600, fontSize: '0.74rem', bgcolor: '#FFF3E0', color: '#E65100' }} />
        ) : (
          <Tooltip title={theme.lastValidated ? `Validé le ${theme.lastValidated}` : ''}>
            <Chip size="small" icon={<CheckCircle sx={{ fontSize: 14 }} />} label="Validé"
              sx={{
                height: 24, fontWeight: 600, fontSize: '0.74rem', bgcolor: '#E8F5E9', color: '#2E7D32',
                '& .MuiChip-icon': { color: '#2E7D32' },
              }} />
          </Tooltip>
        )}
      </Box>
    </Box>
  )
}

export default function ThemesList({ profile, onEdit, onAdd, onImport }: Props) {
  const themes = sortThemes(profile.themes)
  const drafts = themes.filter((t) => t.status === 'draft')
  const { min, max } = periodBounds(profile.themes)

  return (
    <Box sx={{ p: 3, maxWidth: 1280, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Mes thèmes de recherche</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 640 }}>
            Décrivez vos thèmes et validez-les : ils alimentent le graphe de connaissance et les portails
            d’expertise. Chaque thème est daté, pour raconter votre parcours plutôt qu’une liste figée.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
          <Button variant="outlined" startIcon={<CloudDownloadOutlined />} onClick={onImport}
            sx={{ textTransform: 'none', borderColor: TEAL, color: TEAL }}>
            Importer depuis HAL
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={onAdd}
            sx={{ textTransform: 'none', bgcolor: TEAL, '&:hover': { bgcolor: TEAL_DARK } }}>
            Ajouter un thème
          </Button>
        </Box>
      </Box>

      {drafts.length > 0 && (
        <Alert severity="warning" variant="outlined"
          action={
            <Button size="small" color="inherit" onClick={() => onEdit(drafts[0].id)} sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}>
              Reprendre la saisie
            </Button>
          }
          sx={{ mb: 2.5, '& .MuiAlert-message': { flex: 1 } }}>
          {drafts.length === 1
            ? '1 thème en brouillon. Tant qu’il n’est pas validé, il n’apparaît ni dans le graphe de connaissance ni sur les portails.'
            : `${drafts.length} thèmes en brouillon. Tant qu’ils ne sont pas validés, ils n’apparaissent ni dans le graphe de connaissance ni sur les portails.`}
        </Alert>
      )}

      {themes.length === 0 ? (
        <Box sx={{
          p: 6, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2,
          bgcolor: 'background.paper',
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Aucun thème pour l’instant</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 480, mx: 'auto' }}>
            Commencez par importer des thèmes proposés d’après vos publications HAL, ou décrivez
            directement un premier thème de recherche.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            <Button variant="outlined" startIcon={<CloudDownloadOutlined />} onClick={onImport}
              sx={{ textTransform: 'none', borderColor: TEAL, color: TEAL }}>
              Importer depuis HAL
            </Button>
            <Button variant="contained" startIcon={<Add />} onClick={onAdd}
              sx={{ textTransform: 'none', bgcolor: TEAL, '&:hover': { bgcolor: TEAL_DARK } }}>
              Ajouter un thème
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          {/* En-tête de colonnes */}
          <Box sx={{
            display: { xs: 'none', md: 'grid' }, gridTemplateColumns: GRID_COLUMNS, gap: 3,
            px: 3, py: 1, bgcolor: '#F8FAFB', borderBottom: '1px solid', borderColor: 'divider',
            borderLeft: '4px solid transparent',
          }}>
            {['Thème', `Période · ${min + 1} — ${max}`, 'Diffusion', 'Statut'].map((h) => (
              <Typography key={h} variant="caption"
                sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {h}
              </Typography>
            ))}
          </Box>
          {themes.map((t) => (
            <ThemeRow key={t.id} theme={t} min={min} max={max} onEdit={() => onEdit(t.id)} />
          ))}
        </Box>
      )}
    </Box>
  )
}
