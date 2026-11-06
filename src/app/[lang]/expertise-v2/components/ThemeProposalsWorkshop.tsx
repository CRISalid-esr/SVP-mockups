'use client'

import { useMemo, useState } from 'react'
import {
  Box, Button, Card, Checkbox, Chip, CircularProgress, Collapse, FormControlLabel, IconButton, Link, Radio, RadioGroup,
  TextField, Tooltip, Typography,
} from '@mui/material'
import { ArrowBack, AutoAwesome, Close, OpenInNew } from '@mui/icons-material'
import {
  CURRENT_YEAR, ResearchProfile, ResearchTheme, StudiedPeriod, blankTheme, formatPeriod,
} from '../types'
import {
  PUBLICATIONS, Publication, ThemeProposal, coverageMap, halUrl, periodFromPublications, proposeThemes,
  publicationById, studiedPeriodsFromPublications,
} from '../mockPublications'
import PublicationPicker from './PublicationPicker'
import { StudiedPeriodChip } from './StudiedPeriodPicker'

// ─── Atelier « Proposer des thèmes d'après mes publications » ────────────────
// Deux étapes dans la rubrique elle-même :
//   1. choisir les publications (celles qui ne sont rattachées à aucun thème
//      sont pré-sélectionnées) ;
//   2. relire les thèmes proposés : une carte courte par proposition, le détail
//      à la demande. Quand un thème existant couvre déjà le sujet, le choix
//      « rattacher ou créer » reste visible : c'est la décision à prendre.

/** Rattachement de publications à un thème déjà décrit. */
export interface ThemeAttachment {
  themeId: string
  publicationIds: string[]
  yearFrom: number | null
  yearTo: number | null
  studiedPeriods: StudiedPeriod[]
}

export interface WorkshopResult {
  newThemes: ResearchTheme[]
  attachments: ThemeAttachment[]
}

interface Props {
  profile: ResearchProfile
  onBack: () => void
  onApply: (result: WorkshopResult) => void
}

interface Decision {
  keep: boolean
  label: string
  /** 'attach' = rattacher au thème existant, 'create' = créer malgré tout un nouveau thème. */
  mode: 'create' | 'attach'
  publicationIds: string[]
}

function PublicationLine({ pub, onRemove }: { pub: Publication; onRemove: () => void }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums', width: 36, flexShrink: 0 }}>
        {pub.year}
      </Typography>
      <Typography variant="body1" sx={{ flex: 1, minWidth: 0 }}>{pub.title}</Typography>
      <Tooltip title="Voir dans HAL">
        <IconButton size="small" component="a" href={halUrl(pub.halId)} target="_blank" rel="noopener" aria-label={`Voir ${pub.halId} dans HAL`}>
          <OpenInNew sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Retirer cette publication de la proposition">
        <IconButton size="small" onClick={onRemove} aria-label={`Retirer ${pub.title}`}>
          <Close sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Box>
  )
}

function ProposalCard({ proposal, decision, existing, onChange }: {
  proposal: ThemeProposal
  decision: Decision
  existing?: ResearchTheme
  onChange: (d: Partial<Decision>) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const pubs = decision.publicationIds
    .map(publicationById)
    .filter((p): p is Publication => Boolean(p))
    .sort((a, b) => a.year - b.year)
  const period = periodFromPublications(pubs)
  const studied = studiedPeriodsFromPublications(pubs)
  const attach = existing && decision.mode === 'attach'
  const empty = pubs.length === 0

  // Ce que le rattachement changerait au thème existant.
  const extension: string[] = []
  if (existing && period.yearFrom != null) {
    const from = existing.yearFrom == null ? period.yearFrom : Math.min(existing.yearFrom, period.yearFrom)
    const to = existing.yearTo == null || period.yearTo == null ? null : Math.max(existing.yearTo, period.yearTo)
    if (from !== existing.yearFrom || to !== existing.yearTo) extension.push(`période étendue à ${formatPeriod({ yearFrom: from, yearTo: to })}`)
    const newStudied = studied.filter((s) => !existing.studiedPeriods.some((e) => e.label === s.label))
    if (newStudied.length) extension.push(`période étudiée ajoutée : ${newStudied.map((s) => s.label).join(', ')}`)
  }

  const summary = empty
    ? 'Aucune publication : cette proposition ne sera pas retenue'
    : `${formatPeriod(period)} · ${pubs.length} publication${pubs.length > 1 ? 's' : ''}`

  return (
    <Card sx={{ p: 2.5, opacity: decision.keep && !empty ? 1 : 0.6, transition: 'opacity 0.15s' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Checkbox
          checked={decision.keep && !empty}
          disabled={empty}
          onChange={(e) => onChange({ keep: e.target.checked })}
          inputProps={{ 'aria-label': `Retenir la proposition ${proposal.label}` }}
          sx={{ p: 0.5 }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {attach ? (
            <Typography variant="h6" component="h2">{existing.label}</Typography>
          ) : (
            <TextField
              variant="standard"
              fullWidth
              value={decision.label}
              disabled={!decision.keep}
              onChange={(e) => onChange({ label: e.target.value })}
              slotProps={{ htmlInput: { 'aria-label': `Intitulé proposé : ${proposal.label}`, style: { fontSize: '1.125rem', fontWeight: 600 } } }}
            />
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{summary}</Typography>

          {existing && (
            <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 2, bgcolor: 'navHover' }}>
              <Typography variant="body1" fontWeight={600}>
                Vous décrivez déjà ce sujet : « {existing.label} » ({formatPeriod(existing)})
              </Typography>
              <RadioGroup value={decision.mode} onChange={(e) => onChange({ mode: e.target.value as Decision['mode'] })}>
                <FormControlLabel
                  value="attach"
                  control={<Radio size="small" />}
                  label={
                    <Typography variant="body1">
                      Rattacher à ce thème
                      {extension.length > 0 && (
                        <Typography component="span" variant="body2" color="text.secondary"> — {extension.join(' · ')}</Typography>
                      )}
                    </Typography>
                  }
                />
                <FormControlLabel value="create" control={<Radio size="small" />} label="Créer un nouveau thème" />
              </RadioGroup>
            </Box>
          )}

          <Link
            component="button"
            underline="hover"
            aria-expanded={expanded}
            onClick={() => setExpanded((open) => !open)}
            sx={{ display: 'block', mt: 1, fontSize: '0.875rem', fontWeight: 500 }}
          >
            {expanded ? 'Masquer le détail' : 'Voir le détail'}
          </Link>

          <Collapse in={expanded} unmountOnExit>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5 }}>{proposal.description}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
              {proposal.keywords.map((k) => (
                <Chip key={`${k.vocabulary}-${k.label}`} size="small" variant="outlined" label={k.label} />
              ))}
            </Box>
            {studied.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75, mt: 1.5 }}>
                <Typography variant="body2" color="text.secondary">Porte sur</Typography>
                {studied.map((s) => <StudiedPeriodChip key={s.label} value={s} size="small" />)}
              </Box>
            )}
            <Typography variant="body1" fontWeight={600} sx={{ mt: 2, mb: 0.5 }}>Publications à l’appui</Typography>
            {pubs.map((p) => (
              <PublicationLine
                key={p.id}
                pub={p}
                onRemove={() => onChange({ publicationIds: decision.publicationIds.filter((id) => id !== p.id) })}
              />
            ))}
          </Collapse>
        </Box>
      </Box>
    </Card>
  )
}

export default function ThemeProposalsWorkshop({ profile, onBack, onApply }: Props) {
  const coveredBy = useMemo(() => coverageMap(profile.themes), [profile.themes])
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState<string[]>(() => PUBLICATIONS.filter((p) => !coveredBy[p.id]).map((p) => p.id))
  const [loading, setLoading] = useState(false)
  const [proposals, setProposals] = useState<ThemeProposal[]>([])
  const [decisions, setDecisions] = useState<Record<string, Decision>>({})

  const themeById = (id?: string) => (id ? profile.themes.find((t) => t.id === id) : undefined)

  const generate = async () => {
    setLoading(true)
    setStep(1)
    try {
      const result = await proposeThemes(selected, profile.themes)
      setProposals(result)
      setDecisions(Object.fromEntries(result.map((p) => [p.id, {
        keep: true, label: p.label, mode: p.existingThemeId ? 'attach' : 'create', publicationIds: p.publicationIds,
      } as Decision])))
    } finally {
      setLoading(false)
    }
  }

  const retained = proposals.filter((p) => decisions[p.id]?.keep && decisions[p.id].publicationIds.length > 0)
  const toCreate = retained.filter((p) => !(p.existingThemeId && decisions[p.id].mode === 'attach'))
  const toAttach = retained.filter((p) => p.existingThemeId && decisions[p.id].mode === 'attach')
  const attachedPubs = toAttach.reduce((n, p) => n + decisions[p.id].publicationIds.length, 0)

  const apply = () => {
    const build = (p: ThemeProposal) => {
      const d = decisions[p.id]
      const pubs = d.publicationIds.map(publicationById).filter((x): x is Publication => Boolean(x))
      return { pubs, period: periodFromPublications(pubs), studied: studiedPeriodsFromPublications(pubs) }
    }
    onApply({
      newThemes: toCreate.map((p) => {
        const { period, studied } = build(p)
        return {
          ...blankTheme(),
          label: decisions[p.id].label.trim() || p.label,
          description: p.description,
          keywords: p.keywords,
          yearFrom: period.yearFrom ?? CURRENT_YEAR,
          yearTo: period.yearTo,
          studiedPeriods: studied,
          publicationIds: decisions[p.id].publicationIds,
        }
      }),
      attachments: toAttach.map((p) => {
        const { period, studied } = build(p)
        return { themeId: p.existingThemeId as string, publicationIds: decisions[p.id].publicationIds, ...period, studiedPeriods: studied }
      }),
    })
  }

  const summary = [
    toCreate.length ? `${toCreate.length} nouveau${toCreate.length > 1 ? 'x' : ''} thème${toCreate.length > 1 ? 's' : ''} en brouillon` : null,
    toAttach.length ? `${attachedPubs} publication${attachedPubs > 1 ? 's' : ''} rattachée${attachedPubs > 1 ? 's' : ''} à ${toAttach.length} thème${toAttach.length > 1 ? 's' : ''} existant${toAttach.length > 1 ? 's' : ''}` : null,
  ].filter(Boolean)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Box sx={{ pb: 4, maxWidth: 1000, mx: 'auto', width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 4 }}>
          <Tooltip title="Retour à la liste des thèmes">
            <IconButton onClick={onBack} aria-label="Retour à la liste des thèmes" sx={{ color: 'text.primary', mt: -0.5 }}>
              <ArrowBack />
            </IconButton>
          </Tooltip>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h4" component="h1">Proposer des thèmes d’après mes publications</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              {step === 0
                ? 'Étape 1 sur 2 · Choisir les publications'
                : 'Étape 2 sur 2 · Relire les thèmes proposés, qui seront ajoutés en brouillon'}
            </Typography>
          </Box>
        </Box>

        {step === 0 && (
          <PublicationPicker publications={PUBLICATIONS} selected={selected} onChange={setSelected} coveredBy={coveredBy} themes={profile.themes} />
        )}

        {step === 1 && loading && (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ mt: 2 }}>Analyse de {selected.length} publications…</Typography>
          </Box>
        )}

        {step === 1 && !loading && (
          <Box sx={{ display: 'grid', gap: 2 }}>
            {proposals.length === 0 && (
              <Typography variant="body1" color="text.secondary">
                Aucun thème n’a pu être proposé à partir de cette sélection.
              </Typography>
            )}
            {proposals.map((p) => (
              <ProposalCard
                key={p.id}
                proposal={p}
                decision={decisions[p.id]}
                existing={themeById(p.existingThemeId)}
                onChange={(d) => setDecisions((prev) => ({ ...prev, [p.id]: { ...prev[p.id], ...d } }))}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Barre d'actions, comme la fiche d'un thème */}
      <Box sx={{
        position: 'sticky', bottom: 16, zIndex: 2, mt: 'auto', width: '100%', maxWidth: 1000, mx: 'auto', boxSizing: 'border-box',
        // À droite, on laisse la place au bouton de l'assistant.
        pl: 3, pr: { xs: 3, sm: 11 }, py: 1.5,
        bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3,
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1.5, flexWrap: 'wrap',
      }}>
        {step === 1 && !loading && (
          <Typography variant="body2" color="text.secondary" sx={{ mr: 'auto' }}>
            {summary.length ? summary.join(' · ') : 'Aucune proposition retenue'}
          </Typography>
        )}
        {step === 0 ? (
          <>
            <Button onClick={onBack}>Annuler</Button>
            <Button variant="contained" startIcon={<AutoAwesome />} disabled={selected.length === 0} onClick={generate}>
              {`Proposer des thèmes d’après ${selected.length} publication${selected.length > 1 ? 's' : ''}`}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setStep(0)} disabled={loading}>Modifier la sélection</Button>
            <Button variant="contained" disabled={loading || retained.length === 0} onClick={apply}>
              {toCreate.length > 0
                ? `Ajouter ${toCreate.length} thème${toCreate.length > 1 ? 's' : ''} en brouillon${toAttach.length ? ' et rattacher' : ''}`
                : toAttach.length > 0 ? 'Rattacher les publications' : 'Appliquer'}
            </Button>
          </>
        )}
      </Box>
    </Box>
  )
}
