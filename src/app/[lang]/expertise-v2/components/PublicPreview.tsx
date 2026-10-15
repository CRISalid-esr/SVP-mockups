'use client'

import { useState } from 'react'
import { Avatar, Box, Button, Chip, Divider, Typography } from '@mui/material'
import { CampaignOutlined, EditOutlined, NewspaperOutlined, VisibilityOutlined } from '@mui/icons-material'
import { AUDIENCE_CONFIG, Audience, ResearchProfile, ResearchTheme, TEAL, relationSentence, variantCount } from '../types'
import { sortThemes } from './ThemesList'
import { AudienceSwitcher, ThemePublicBlock } from './ThemeDetail'

interface Props {
  profile: ResearchProfile
  researcherName: string
  affiliation: string
  onBack: () => void
}

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('')
}

export function publicThemes(themes: ResearchTheme[]): ResearchTheme[] {
  return sortThemes(themes.filter((t) => t.visibility === 'public' && t.status === 'validated'))
}

export default function PublicPreview({ profile, researcherName, affiliation, onBack }: Props) {
  const [audience, setAudience] = useState<Audience | null>(null)

  const shown = publicThemes(profile.themes)
  const shownIds = new Set(shown.map((t) => t.id))
  const hidden = profile.themes.filter((t) => !shownIds.has(t.id))
  const hiddenInstitution = hidden.filter((t) => t.status === 'validated' && t.visibility === 'institution').length
  const hiddenPrivate = hidden.filter((t) => t.status === 'validated' && t.visibility === 'private').length
  const hiddenDraft = hidden.filter((t) => t.status === 'draft').length
  const acceptsPress = shown.some((t) => t.acceptsPress)
  const acceptsEvents = shown.some((t) => t.acceptsEvents)
  const publicRelations = profile.relations.filter((r) => shownIds.has(r.source) && shownIds.has(r.target))
  const withoutVariant = audience ? shown.filter((t) => !t.variants[audience]?.trim()).length : 0
  const anyVariant = shown.some((t) => variantCount(t) > 0)

  // Pour la presse et les événements, les thèmes qui acceptent la sollicitation remontent en tête.
  const ordered = audience === 'media'
    ? [...shown].sort((a, b) => Number(b.acceptsPress) - Number(a.acceptsPress))
    : audience === 'public'
      ? [...shown].sort((a, b) => Number(b.acceptsEvents) - Number(a.acceptsEvents))
      : shown

  const hiddenParts = [
    hiddenInstitution ? `${hiddenInstitution} établissement` : null,
    hiddenPrivate ? `${hiddenPrivate} privé${hiddenPrivate > 1 ? 's' : ''}` : null,
    hiddenDraft ? `${hiddenDraft} brouillon${hiddenDraft > 1 ? 's' : ''}` : null,
  ].filter(Boolean)

  const audienceCfg = audience ? AUDIENCE_CONFIG[audience] : null

  return (
    <Box sx={{ p: 3, maxWidth: 960, mx: 'auto' }}>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 2,
        px: 2, py: 1.25, borderRadius: 2, bgcolor: '#FFF8E1', border: '1px solid #FFE082',
      }}>
        <VisibilityOutlined sx={{ color: '#8D6E00' }} />
        <Typography variant="body2" sx={{ flex: 1, minWidth: 240, color: '#5D4300' }}>
          <strong>Aperçu</strong> — affiché tel quel sur le portail public
          {hidden.length > 0 && ` · ${hidden.length} thème${hidden.length > 1 ? 's' : ''} masqué${hidden.length > 1 ? 's' : ''} (${hiddenParts.join(', ')})`}
        </Typography>
        <Button size="small" startIcon={<EditOutlined />} onClick={onBack} sx={{ textTransform: 'none', color: '#5D4300' }}>
          Revenir à l’édition
        </Button>
      </Box>

      {/* Déclinaison par public */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>Voir le portail comme :</Typography>
        <AudienceSwitcher value={audience} onChange={setAudience} />
      </Box>
      {audienceCfg && (
        <Typography variant="caption" sx={{ display: 'block', mb: 2, mt: -2, color: 'text.secondary' }}>
          {audienceCfg.label} — {audienceCfg.question}
          {withoutVariant > 0 && ` · ${withoutVariant} thème${withoutVariant > 1 ? 's' : ''} sans déclinaison pour ce public (description générale affichée)`}
        </Typography>
      )}
      {!audience && !anyVariant && shown.length > 0 && (
        <Typography variant="caption" sx={{ display: 'block', mb: 2, mt: -2, color: 'text.secondary' }}>
          Aucun thème public n’a encore de déclinaison : tous les publics voient la description générale.
        </Typography>
      )}

      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden', bgcolor: 'background.paper' }}>
        {/* En-tête du portail */}
        <Box sx={{ p: 4, display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap', bgcolor: `${TEAL}08` }}>
          <Avatar sx={{ width: 88, height: 88, bgcolor: TEAL, fontSize: '1.75rem', fontWeight: 700 }}>
            {initials(researcherName)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 240 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{researcherName}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>{affiliation}</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
              {acceptsPress && (
                <Chip size="small" icon={<NewspaperOutlined sx={{ fontSize: 14 }} />} label="Accepte les sollicitations presse"
                  sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 600, '& .MuiChip-icon': { color: '#2E7D32' } }} />
              )}
              {acceptsEvents && (
                <Chip size="small" icon={<CampaignOutlined sx={{ fontSize: 14 }} />} label="Intervient en événements grand public"
                  sx={{ bgcolor: '#E3F2FD', color: '#1565C0', fontWeight: 600, '& .MuiChip-icon': { color: '#1565C0' } }} />
              )}
              <Chip size="small" variant="outlined" label="ORCID · IdRef · HAL" sx={{ color: 'text.secondary' }} />
            </Box>
          </Box>
          {audienceCfg && (
            <Chip icon={<audienceCfg.Icon sx={{ fontSize: 16 }} />} label={`Vue ${audienceCfg.label.toLowerCase()}`}
              sx={{ bgcolor: audienceCfg.bg, color: audienceCfg.color, fontWeight: 700, '& .MuiChip-icon': { color: audienceCfg.color } }} />
          )}
        </Box>

        <Box sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Expertises</Typography>

          {shown.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Aucun thème public validé : ce profil n’affiche rien sur le portail pour l’instant.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              {ordered.map((t) => <ThemePublicBlock key={t.id} theme={t} audience={audience} />)}
            </Box>
          )}

          <Divider sx={{ my: 4 }} />

          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>Parcours</Typography>
          {publicRelations.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Aucune relation entre thèmes publics.
            </Typography>
          ) : (
            <Typography variant="body1" color="text.secondary">
              {publicRelations.map((r) => relationSentence(r, profile.themes)).join(' · ')}.
            </Typography>
          )}
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>
            Seules les relations entre thèmes publics sont affichées.
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
