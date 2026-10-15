'use client'

import { useMemo, useState } from 'react'
import {
  Box, Breadcrumbs, Button, Checkbox, Chip, CircularProgress, FormControlLabel, IconButton, Link, Radio, RadioGroup,
  Step, StepLabel, Stepper, TextField, Tooltip, Typography,
} from '@mui/material'
import {
  ArrowBack, AutoAwesome, Close, HistoryEdu, LinkOutlined, OpenInNew, ScheduleOutlined,
} from '@mui/icons-material'
import {
  CURRENT_YEAR, ResearchProfile, ResearchTheme, StudiedPeriod, TEAL, TEAL_DARK, VOCAB_CONFIG, blankTheme, formatPeriod,
} from '../types'
import {
  PUBLICATIONS, Publication, ThemeProposal, coverageMap, halUrl, periodFromPublications, proposeThemes,
  publicationById, studiedPeriodsFromPublications,
} from '../mockPublications'
import PublicationPicker from './PublicationPicker'
import { StudiedPeriodChip } from './StudiedPeriodPicker'

// ─── Atelier « Proposer des thèmes d'après mes publications » ────────────────
// Remplace l'« Import depuis HAL » de la première mouture. Deux étapes dans la
// rubrique elle-même, sans passer par la liste des documents :
//   1. choisir les publications (celles qui ne sont rattachées à aucun thème
//      sont pré-sélectionnées) ;
//   2. relire les thèmes proposés : intitulé retouchable, période de travail
//      déduite des dates, période étudiée détectée, publications à l'appui
//      retirables une à une, et — quand un thème existant couvre déjà le
//      sujet — rattachement à ce thème plutôt que création d'un doublon.

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

const STEPS = ['Choisir les publications', 'Relire les thèmes proposés']

function PublicationLine({ pub, onRemove }: { pub: Publication; onRemove?: () => void }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
      <Typography variant="caption" sx={{ fontVariantNumeric: 'tabular-nums', color: 'text.secondary', width: 36, flexShrink: 0 }}>
        {pub.year}
      </Typography>
      <Typography variant="body2" sx={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>{pub.title}</Typography>
      <Link href={halUrl(pub.halId)} target="_blank" rel="noopener" aria-label={`Voir ${pub.halId} dans HAL`}
        sx={{ display: 'inline-flex', color: 'text.disabled', '&:hover': { color: TEAL } }}>
        <OpenInNew sx={{ fontSize: 14 }} />
      </Link>
      {onRemove && (
        <Tooltip title="Retirer cette publication de la proposition">
          <IconButton size="small" onClick={onRemove} aria-label={`Retirer ${pub.title}`} sx={{ p: 0.25 }}>
            <Close sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  )
}

function ProposalCard({ proposal, decision, existing, onChange }: {
  proposal: ThemeProposal
  decision: Decision
  existing?: ResearchTheme
  onChange: (d: Partial<Decision>) => void
}) {
  const pubs = decision.publicationIds.map(publicationById).filter((p): p is Publication => Boolean(p))
  const period = periodFromPublications(pubs)
  const studied = studiedPeriodsFromPublications(pubs)
  const attach = existing && decision.mode === 'attach'
  const empty = pubs.length === 0
  const disabled = !decision.keep || empty

  // Ce que le rattachement changerait au thème existant.
  const extension: string[] = []
  if (existing && period.yearFrom != null) {
    const from = existing.yearFrom == null ? period.yearFrom : Math.min(existing.yearFrom, period.yearFrom)
    const to = existing.yearTo == null || period.yearTo == null ? null : Math.max(existing.yearTo, period.yearTo)
    if (from !== existing.yearFrom || to !== existing.yearTo) extension.push(`période étendue à ${formatPeriod({ yearFrom: from, yearTo: to })}`)
    const newStudied = studied.filter((s) => !existing.studiedPeriods.some((e) => e.label === s.label))
    if (newStudied.length) extension.push(`période étudiée ajoutée : ${newStudied.map((s) => s.label).join(', ')}`)
  }

  return (
    <Box sx={{
      border: '1px solid', borderColor: disabled ? 'divider' : attach ? '#90CAF9' : TEAL,
      borderLeft: `4px solid ${disabled ? '#CFD8DC' : attach ? '#1565C0' : TEAL}`,
      borderRadius: 2, bgcolor: 'background.paper', opacity: disabled ? 0.6 : 1, transition: 'opacity 0.15s',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, p: 2, pb: 1.5 }}>
        <Checkbox checked={decision.keep && !empty} disabled={empty} onChange={(e) => onChange({ keep: e.target.checked })}
          inputProps={{ 'aria-label': `Retenir la proposition ${proposal.label}` }}
          sx={{ p: 0.5, mt: 0.25, '&.Mui-checked': { color: TEAL } }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {attach ? (
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.3 }}>{existing.label}</Typography>
          ) : (
            <TextField
              variant="standard" fullWidth value={decision.label} disabled={!decision.keep}
              onChange={(e) => onChange({ label: e.target.value })}
              inputProps={{ 'aria-label': `Intitulé proposé : ${proposal.label}`, style: { fontSize: '1.05rem', fontWeight: 700 } }}
            />
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{proposal.description}</Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
            {proposal.keywords.map((k) => (
              <Chip key={`${k.vocabulary}-${k.label}`} size="small" label={k.label}
                sx={{
                  height: 22, fontSize: '0.72rem',
                  bgcolor: `${VOCAB_CONFIG[k.vocabulary].color}10`, color: VOCAB_CONFIG[k.vocabulary].color,
                  border: `1px solid ${VOCAB_CONFIG[k.vocabulary].color}30`,
                }} />
            ))}
          </Box>

          {/* Périodes */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mt: 1.5 }}>
            <Tooltip title="Déduite des dates des publications retenues : du premier au dernier article, « en cours » si une publication a moins de deux ans">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ScheduleOutlined sx={{ fontSize: 16, color: TEAL }} />
                <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                  {empty ? 'Période de travail : —' : `Période de travail : ${formatPeriod(period)}`}
                </Typography>
                {!empty && (
                  <Typography variant="caption" color="text.secondary">
                    (d’après {pubs.length} publication{pubs.length > 1 ? 's' : ''})
                  </Typography>
                )}
              </Box>
            </Tooltip>
            {studied.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                <HistoryEdu sx={{ fontSize: 16, color: '#7B5E2A' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Porte sur :</Typography>
                {studied.map((s) => <StudiedPeriodChip key={s.label} value={s} size="small" />)}
              </Box>
            )}
          </Box>

          {/* Rattachement à un thème existant */}
          {existing && (
            <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 1.5, bgcolor: '#E3F2FD', border: '1px solid #90CAF9' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                <LinkOutlined sx={{ fontSize: 16, color: '#1565C0' }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0D47A1' }}>
                  Vous décrivez déjà ce sujet : « {existing.label} » ({formatPeriod(existing)})
                </Typography>
              </Box>
              <RadioGroup value={decision.mode} onChange={(e) => onChange({ mode: e.target.value as Decision['mode'] })}>
                <FormControlLabel value="attach" control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#1565C0' } }} />}
                  label={
                    <Typography variant="body2">
                      Rattacher ces publications au thème existant
                      {extension.length > 0 && <Typography component="span" variant="caption" color="text.secondary"> — {extension.join(' · ')}</Typography>}
                    </Typography>
                  } />
                <FormControlLabel value="create" control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#1565C0' } }} />}
                  label={<Typography variant="body2">Créer tout de même un nouveau thème</Typography>} />
              </RadioGroup>
            </Box>
          )}
        </Box>
      </Box>

      {/* Publications à l'appui */}
      <Box sx={{ px: 2, pb: 1.5, pl: 6.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Publications à l’appui
        </Typography>
        {empty ? (
          <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic', mt: 0.5 }}>
            Toutes les publications ont été retirées : cette proposition ne sera pas retenue.
          </Typography>
        ) : (
          pubs.sort((a, b) => a.year - b.year).map((p) => (
            <PublicationLine key={p.id} pub={p}
              onRemove={() => onChange({ publicationIds: decision.publicationIds.filter((id) => id !== p.id) })} />
          ))
        )}
      </Box>
    </Box>
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
      <Box sx={{ p: 3, pb: 12, maxWidth: 1100, mx: 'auto', width: '100%' }}>
        {/* Fil d'Ariane */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <IconButton size="small" onClick={onBack} aria-label="Retour à la liste des thèmes">
            <ArrowBack fontSize="small" />
          </IconButton>
          <Breadcrumbs separator="/" sx={{ '& .MuiBreadcrumbs-separator': { mx: 1 } }}>
            <Link component="button" underline="hover" color="inherit" onClick={onBack} sx={{ font: 'inherit' }}>Profil de recherche 2</Link>
            <Link component="button" underline="hover" color="inherit" onClick={onBack} sx={{ font: 'inherit' }}>Thèmes</Link>
            <Typography color="text.primary" sx={{ fontWeight: 600 }}>Proposer des thèmes d’après mes publications</Typography>
          </Breadcrumbs>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 3, flexWrap: 'wrap', mb: 3 }}>
          <Box sx={{ maxWidth: 620 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Proposer des thèmes d’après mes publications</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {step === 0
                ? 'Choisissez les publications à analyser. Les publications déjà rattachées à un thème sont signalées : par défaut, seules celles qui ne le sont pas encore sont sélectionnées.'
                : 'L’IA a regroupé vos publications en thèmes. Retouchez les intitulés, retirez les publications hors sujet, puis ajoutez les thèmes retenus en brouillon : vous les compléterez et les validerez ensuite.'}
            </Typography>
          </Box>
          <Stepper activeStep={step} sx={{ minWidth: 320, '& .MuiStepIcon-root.Mui-active, & .MuiStepIcon-root.Mui-completed': { color: TEAL } }}>
            {STEPS.map((s) => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
          </Stepper>
        </Box>

        {step === 0 && (
          <PublicationPicker publications={PUBLICATIONS} selected={selected} onChange={setSelected} coveredBy={coveredBy} themes={profile.themes} />
        )}

        {step === 1 && loading && (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <CircularProgress sx={{ color: TEAL }} />
            <Typography variant="body1" sx={{ mt: 2, fontWeight: 600 }}>Analyse de {selected.length} publications…</Typography>
            <Typography variant="body2" color="text.secondary">Regroupement par sujet, lecture des dates et des périodes étudiées.</Typography>
          </Box>
        )}

        {step === 1 && !loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {proposals.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Aucun thème n’a pu être proposé à partir de cette sélection.
              </Typography>
            )}
            {proposals.map((p) => (
              <ProposalCard key={p.id} proposal={p} decision={decisions[p.id]} existing={themeById(p.existingThemeId)}
                onChange={(d) => setDecisions((prev) => ({ ...prev, [p.id]: { ...prev[p.id], ...d } }))} />
            ))}
          </Box>
        )}
      </Box>

      {/* Barre d'actions */}
      <Box sx={{
        position: 'sticky', bottom: 0, mt: 'auto', px: 3, py: 1.5, bgcolor: 'background.paper',
        borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.05)', zIndex: 2,
      }}>
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1, minWidth: 200 }}>
          {step === 0
            ? `${selected.length} publication${selected.length > 1 ? 's' : ''} sélectionnée${selected.length > 1 ? 's' : ''}`
            : loading ? '' : summary.length ? summary.join(' · ') : 'Aucune proposition retenue'}
        </Typography>
        {step === 0 ? (
          <>
            <Button onClick={onBack} sx={{ textTransform: 'none' }}>Annuler</Button>
            <Button variant="contained" startIcon={<AutoAwesome />} disabled={selected.length === 0} onClick={generate}
              sx={{ textTransform: 'none', bgcolor: TEAL, '&:hover': { bgcolor: TEAL_DARK } }}>
              Proposer des thèmes d’après {selected.length} publication{selected.length > 1 ? 's' : ''}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setStep(0)} disabled={loading} sx={{ textTransform: 'none' }}>Modifier la sélection</Button>
            <Button variant="contained" disabled={loading || retained.length === 0} onClick={apply}
              sx={{ textTransform: 'none', bgcolor: TEAL, '&:hover': { bgcolor: TEAL_DARK } }}>
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
