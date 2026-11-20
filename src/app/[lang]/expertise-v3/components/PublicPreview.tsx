'use client'

import { useState } from 'react'
import { Avatar, Box, Card, Divider, Typography } from '@mui/material'
import { Audience, ResearchProfile, ResearchTheme, relationSentence } from '../types'
import { sortThemes } from './ThemesList'
import { AudienceSwitcher, ThemePublicBlock } from './ThemeDetail'

interface Props {
  profile: ResearchProfile
  researcherName: string
  affiliation: string
}

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('')
}

export function publicThemes(themes: ResearchTheme[]): ResearchTheme[] {
  return sortThemes(themes.filter((t) => t.visibility === 'public' && t.status === 'validated'))
}

export default function PublicPreview({ profile, researcherName, affiliation }: Props) {
  const [audience, setAudience] = useState<Audience | null>(null)

  const shown = publicThemes(profile.themes)
  const shownIds = new Set(shown.map((t) => t.id))
  const hidden = profile.themes.filter((t) => !shownIds.has(t.id))
  const hiddenInstitution = hidden.filter((t) => t.status === 'validated' && t.visibility === 'institution').length
  const hiddenPrivate = hidden.filter((t) => t.status === 'validated' && t.visibility === 'private').length
  const hiddenDraft = hidden.filter((t) => t.status === 'draft').length
  const publicRelations = profile.relations.filter((r) => shownIds.has(r.source) && shownIds.has(r.target))

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

  const solicitations = [
    shown.some((t) => t.acceptsPress) ? 'Accepte les sollicitations presse' : null,
    shown.some((t) => t.acceptsEvents) ? 'Intervient en événements grand public' : null,
  ].filter(Boolean)

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
        <Typography variant="body1" fontWeight={600}>Voir comme</Typography>
        <AudienceSwitcher value={audience} onChange={setAudience} />
        {hidden.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ ml: { md: 'auto' } }}>
            {`${hidden.length} thème${hidden.length > 1 ? 's' : ''} masqué${hidden.length > 1 ? 's' : ''} (${hiddenParts.join(', ')})`}
          </Typography>
        )}
      </Box>

      <Card sx={{ p: { xs: 3, sm: 4 } }}>
        <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.25rem', fontWeight: 700 }}>
            {initials(researcherName)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h4" component="h2">{researcherName}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>{affiliation}</Typography>
            {solicitations.length > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{solicitations.join(' · ')}</Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" component="h3" sx={{ mb: 3 }}>Expertises</Typography>
        {shown.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            Aucun thème public validé : ce profil n’affiche rien sur le portail pour l’instant.
          </Typography>
        ) : (
          <Box sx={{ display: 'grid', gap: 4 }}>
            {ordered.map((t) => <ThemePublicBlock key={t.id} theme={t} audience={audience} collapsible />)}
          </Box>
        )}

        {/* Sur un portail public, une section vide n'a rien à dire au lecteur. */}
        {publicRelations.length > 0 && (
          <>
            <Divider sx={{ my: 4 }} />
            <Typography variant="h5" component="h3" sx={{ mb: 2 }}>Parcours</Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5, display: 'grid', gap: 1 }}>
              {publicRelations.map((r) => (
                <Typography key={r.id} component="li" variant="body1" color="text.secondary">
                  {relationSentence(r, profile.themes)}
                </Typography>
              ))}
            </Box>
          </>
        )}
      </Card>
    </Box>
  )
}
