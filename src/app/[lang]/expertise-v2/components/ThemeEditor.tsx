'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Box, Breadcrumbs, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, FormControlLabel, Grid2 as Grid, IconButton, Link, Switch, TextField, Typography,
} from '@mui/material'
import {
  AccountTree, ArrowBack, ArticleOutlined, CampaignOutlined, CheckCircleOutline, Close, DeleteOutline, NewspaperOutlined,
  SaveOutlined,
} from '@mui/icons-material'
import {
  CURRENT_YEAR, DESCRIPTION_MAX, ResearchTheme, TEAL, TEAL_DARK, ThemeRelation, VISIBILITY_CONFIG,
  Visibility, formatPeriod, relationSentence,
} from '../types'
import KeywordPicker from './KeywordPicker'
import RefsPicker from './RefsPicker'
import AudienceVariantsEditor from './AudienceVariantsEditor'
import StudiedPeriodPicker from './StudiedPeriodPicker'
import PublicationPicker from './PublicationPicker'
import { PUBLICATIONS, coverageMap, halUrl, periodFromPublications, publicationById } from '../mockPublications'

interface Props {
  theme: ResearchTheme
  isNew: boolean
  allThemes: ResearchTheme[]
  relations: ThemeRelation[]
  onBack: () => void
  onSaveDraft: (theme: ResearchTheme) => void
  onValidate: (theme: ResearchTheme) => void
  onDelete: (id: string) => void
  onOpenGraph: () => void
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.08em', display: 'block', lineHeight: 1.6 }}>
        {title}
      </Typography>
      {hint && <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{hint}</Typography>}
      {children}
    </Box>
  )
}

function SideCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper', mb: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>{title}</Typography>
      {children}
    </Box>
  )
}

const VISIBILITIES: Visibility[] = ['private', 'institution', 'public']

export default function ThemeEditor({
  theme, isNew, allThemes, relations, onBack, onSaveDraft, onValidate, onDelete, onOpenGraph,
}: Props) {
  const [draft, setDraft] = useState<ResearchTheme>(theme)
  const [ongoing, setOngoing] = useState(theme.yearTo == null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [pubsOpen, setPubsOpen] = useState(false)

  const attachedPubs = useMemo(
    () => (draft.publicationIds ?? []).map(publicationById).filter((p): p is NonNullable<typeof p> => Boolean(p)).sort((a, b) => a.year - b.year),
    [draft.publicationIds],
  )
  const suggestedPeriod = useMemo(() => periodFromPublications(attachedPubs), [attachedPubs])
  const applySuggestedPeriod = () => {
    setDraft((d) => ({ ...d, yearFrom: suggestedPeriod.yearFrom, yearTo: suggestedPeriod.yearTo }))
    setOngoing(suggestedPeriod.yearTo == null)
  }
  const coveredByOthers = useMemo(() => coverageMap(allThemes, draft.id), [allThemes, draft.id])

  useEffect(() => { setDraft(theme); setOngoing(theme.yearTo == null) }, [theme])

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(theme), [draft, theme])
  const canSubmit = draft.label.trim().length > 0

  const patch = (p: Partial<ResearchTheme>) => setDraft((d) => ({ ...d, ...p }))

  const parseYear = (v: string): number | null => {
    if (!v.trim()) return null
    const n = parseInt(v, 10)
    return Number.isNaN(n) ? null : n
  }

  const myRelations = relations.filter((r) => r.source === draft.id || r.target === draft.id)
  const isPublic = draft.visibility === 'public'

  const finalize = (): ResearchTheme => ({
    ...draft,
    label: draft.label.trim(),
    description: draft.description.trim(),
    yearTo: ongoing ? null : draft.yearTo,
    acceptsPress: isPublic ? draft.acceptsPress : false,
    acceptsEvents: isPublic ? draft.acceptsEvents : false,
  })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Box sx={{ p: 3, pb: 12, maxWidth: 1280, mx: 'auto', width: '100%' }}>
        {/* Fil d'Ariane */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <IconButton size="small" onClick={onBack} aria-label="Retour à la liste des thèmes">
            <ArrowBack fontSize="small" />
          </IconButton>
          <Breadcrumbs separator="/" sx={{ '& .MuiBreadcrumbs-separator': { mx: 1 } }}>
            <Link component="button" underline="hover" color="inherit" onClick={onBack} sx={{ font: 'inherit' }}>
              Profil de recherche 2
            </Link>
            <Link component="button" underline="hover" color="inherit" onClick={onBack} sx={{ font: 'inherit' }}>
              Thèmes
            </Link>
            <Typography color="text.primary" sx={{ fontWeight: 600 }}>
              {draft.label.trim() || (isNew ? 'Nouveau thème' : 'Thème sans titre')}
            </Typography>
          </Breadcrumbs>
        </Box>

        <Grid container spacing={4}>
          {/* ── Colonne principale ── */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Section title="Intitulé du thème">
              <TextField
                fullWidth autoFocus={isNew} required
                placeholder="Ex : Habitat inclusif et politiques publiques"
                value={draft.label}
                onChange={(e) => patch({ label: e.target.value })}
                inputProps={{ 'aria-label': 'Intitulé du thème', style: { fontSize: '1.25rem', fontWeight: 600 } }}
              />
            </Section>

            <Section title="Description" hint="Rédigée pour un public non spécialiste : de quoi s’agit-il, et pourquoi est-ce important ?">
              <TextField
                fullWidth multiline minRows={5}
                placeholder="J’étudie… Je m’intéresse à…"
                value={draft.description}
                onChange={(e) => patch({ description: e.target.value.slice(0, DESCRIPTION_MAX) })}
                inputProps={{ 'aria-label': 'Description', maxLength: DESCRIPTION_MAX }}
                helperText={`${draft.description.length} / ${DESCRIPTION_MAX}`}
                FormHelperTextProps={{ sx: { textAlign: 'right', mr: 0 } }}
              />
            </Section>

            <Section title="Période de travail sur ce thème" hint="Quand avez-vous travaillé sur ce sujet ? Votre profil raconte un parcours : un sujet abandonné il y a dix ans reste une expertise, mais ne s’affiche pas comme un travail en cours.">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  label="Début" type="number" size="small" sx={{ width: 130 }}
                  value={draft.yearFrom ?? ''}
                  onChange={(e) => patch({ yearFrom: parseYear(e.target.value) })}
                  inputProps={{ min: 1950, max: CURRENT_YEAR, 'aria-label': 'Année de début' }}
                />
                <Typography color="text.disabled">→</Typography>
                <TextField
                  label="Fin" type="number" size="small" sx={{ width: 130 }}
                  value={ongoing ? '' : (draft.yearTo ?? '')}
                  disabled={ongoing}
                  placeholder={ongoing ? '—' : undefined}
                  onChange={(e) => patch({ yearTo: parseYear(e.target.value) })}
                  inputProps={{ min: 1950, max: CURRENT_YEAR, 'aria-label': 'Année de fin' }}
                />
                <FormControlLabel
                  control={
                    <Checkbox checked={ongoing} size="small" sx={{ color: TEAL, '&.Mui-checked': { color: TEAL } }}
                      onChange={(e) => {
                        setOngoing(e.target.checked)
                        patch({ yearTo: e.target.checked ? null : (draft.yearTo ?? CURRENT_YEAR) })
                      }} />
                  }
                  label="Thème toujours en cours"
                />
              </Box>
              {attachedPubs.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {`Vos ${attachedPubs.length} publication${attachedPubs.length > 1 ? 's' : ''} sur ce thème vont de ${formatPeriod(suggestedPeriod)}. Ajustez si vous avez commencé avant de publier.`}
                  </Typography>
                  {(draft.yearFrom !== suggestedPeriod.yearFrom || (ongoing ? null : draft.yearTo) !== suggestedPeriod.yearTo) && (
                    <Button size="small" onClick={applySuggestedPeriod} sx={{ textTransform: 'none', color: TEAL, py: 0 }}>
                      Reprendre les dates des publications
                    </Button>
                  )}
                </Box>
              )}
            </Section>

            <Section title="Publications à l’appui" hint="Les publications qui fondent ce thème. Elles servent à proposer la période de travail et, demain, à relier le thème aux publications sur les portails.">
              {attachedPubs.length === 0 ? (
                <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic', mb: 1 }}>
                  Aucune publication rattachée pour l’instant.
                </Typography>
              ) : (
                <Box sx={{ mb: 1 }}>
                  {attachedPubs.map((p) => (
                    <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="caption" sx={{ fontVariantNumeric: 'tabular-nums', color: 'text.secondary', width: 36, flexShrink: 0 }}>{p.year}</Typography>
                      <Typography variant="body2" sx={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>{p.title}</Typography>
                      <Link href={halUrl(p.halId)} target="_blank" rel="noopener" variant="caption" underline="hover"
                        sx={{ color: TEAL, whiteSpace: 'nowrap' }}>{p.halId}</Link>
                      <IconButton size="small" aria-label={`Retirer ${p.title}`} sx={{ p: 0.25 }}
                        onClick={() => patch({ publicationIds: (draft.publicationIds ?? []).filter((id) => id !== p.id) })}>
                        <Close sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
              <Button size="small" variant="outlined" startIcon={<ArticleOutlined />} onClick={() => setPubsOpen(true)}
                sx={{ textTransform: 'none', borderColor: TEAL, color: TEAL }}>
                Choisir des publications
              </Button>
            </Section>

            <Section title="Période étudiée" hint="L’époque sur laquelle porte ce thème, si elle compte : le Néolithique pour un préhistorien, la Révolution française, les Trente Glorieuses… Elle est indépendante de la période où vous avez travaillé sur le sujet. Facultatif.">
              <StudiedPeriodPicker value={draft.studiedPeriods} onChange={(studiedPeriods) => patch({ studiedPeriods })} />
            </Section>

            <Section title="Mots-clés">
              <KeywordPicker value={draft.keywords} onChange={(keywords) => patch({ keywords })} />
            </Section>

            <Section title="Lieux, personnes et organisations">
              <RefsPicker
                places={draft.places}
                persons={draft.persons}
                organizations={draft.organizations}
                contextText={`${draft.label} ${draft.description} ${draft.keywords.map((k) => k.label).join(' ')}`}
                onChange={(p) => patch(p)}
              />
            </Section>

            <Section title="Déclinaison par public">
              <AudienceVariantsEditor theme={draft} onChange={(p) => patch(p)} />
            </Section>
          </Grid>

          {/* ── Colonne latérale ── */}
          <Grid size={{ xs: 12, md: 5 }}>
            <SideCard title="Diffusion de ce thème">
              <Box role="radiogroup" aria-label="Diffusion" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {VISIBILITIES.map((v) => {
                  const cfg = VISIBILITY_CONFIG[v]
                  const selected = draft.visibility === v
                  return (
                    <Box key={v} role="radio" aria-checked={selected} tabIndex={0}
                      onClick={() => patch({ visibility: v })}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); patch({ visibility: v }) } }}
                      sx={{
                        display: 'flex', gap: 1.5, p: 1.5, borderRadius: 2, cursor: 'pointer',
                        border: '2px solid', borderColor: selected ? cfg.color : 'divider',
                        bgcolor: selected ? cfg.bg : 'transparent',
                        '&:hover': { borderColor: selected ? cfg.color : 'text.disabled' },
                        '&:focus-visible': { outline: `2px solid ${TEAL}`, outlineOffset: 2 },
                      }}>
                      <cfg.Icon sx={{ color: selected ? cfg.color : 'text.disabled', mt: 0.25 }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: selected ? cfg.color : 'text.primary' }}>
                          {cfg.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{cfg.description}</Typography>
                      </Box>
                    </Box>
                  )
                })}
              </Box>
            </SideCard>

            <SideCard title="Sollicitations sur ce thème">
              {!isPublic && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Les sollicitations ne concernent que les thèmes publics : rendez ce thème public pour les activer.
                </Typography>
              )}
              <FormControlLabel
                disabled={!isPublic}
                control={<Switch checked={isPublic && draft.acceptsPress} onChange={(e) => patch({ acceptsPress: e.target.checked })}
                  sx={{ '& .Mui-checked': { color: TEAL }, '& .Mui-checked + .MuiSwitch-track': { bgcolor: `${TEAL} !important` } }} />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NewspaperOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2">J’accepte d’être contacté·e par des journalistes</Typography>
                  </Box>
                }
                sx={{ display: 'flex', ml: 0, mb: 0.5 }}
              />
              <FormControlLabel
                disabled={!isPublic}
                control={<Switch checked={isPublic && draft.acceptsEvents} onChange={(e) => patch({ acceptsEvents: e.target.checked })}
                  sx={{ '& .Mui-checked': { color: TEAL }, '& .Mui-checked + .MuiSwitch-track': { bgcolor: `${TEAL} !important` } }} />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CampaignOutlined sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2">J’accepte d’intervenir lors d’événements grand public</Typography>
                  </Box>
                }
                sx={{ display: 'flex', ml: 0 }}
              />
            </SideCard>

            <SideCard title="Relié dans votre parcours">
              {myRelations.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Aucune relation pour l’instant. Le graphe de parcours permet de raconter comment ce thème s’articule aux autres.
                </Typography>
              ) : (
                <Box component="ul" sx={{ m: 0, pl: 2, '& li': { mb: 0.5 } }}>
                  {myRelations.map((r) => (
                    <Typography key={r.id} component="li" variant="body2" color="text.secondary">
                      {relationSentence(r, [...allThemes.filter((t) => t.id !== draft.id), draft])}
                    </Typography>
                  ))}
                </Box>
              )}
              <Button size="small" startIcon={<AccountTree />} onClick={onOpenGraph} disabled={isNew}
                sx={{ textTransform: 'none', mt: 1.5, color: TEAL }}>
                Ouvrir le graphe de parcours
              </Button>
              {isNew && (
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
                  Enregistrez d’abord ce thème pour le relier aux autres.
                </Typography>
              )}
            </SideCard>

            {!isNew && (
              <Button size="small" color="error" startIcon={<DeleteOutline />} onClick={() => setConfirmDelete(true)}
                sx={{ textTransform: 'none' }}>
                Supprimer ce thème
              </Button>
            )}
          </Grid>
        </Grid>
      </Box>

      {/* Barre d'actions fixe */}
      <Box sx={{
        position: 'sticky', bottom: 0, zIndex: 2,
        px: 3, py: 1.5, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider',
        display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap',
      }}>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1, minWidth: 200 }}>
          {theme.status === 'validated' && theme.lastValidated
            ? `Dernière validation le ${theme.lastValidated}`
            : 'Brouillon, jamais validé'}
          {dirty ? ' · modifications non enregistrées' : ''}
        </Typography>
        <Button onClick={onBack} sx={{ textTransform: 'none' }}>Annuler</Button>
        <Button variant="outlined" startIcon={<SaveOutlined />} disabled={!canSubmit}
          onClick={() => onSaveDraft({ ...finalize(), status: 'draft' })}
          sx={{ textTransform: 'none', borderColor: TEAL, color: TEAL }}>
          Enregistrer le brouillon
        </Button>
        <Button variant="contained" startIcon={<CheckCircleOutline />} disabled={!canSubmit}
          onClick={() => onValidate({ ...finalize(), status: 'validated', lastValidated: new Date().toISOString().split('T')[0] })}
          sx={{ textTransform: 'none', bgcolor: TEAL, '&:hover': { bgcolor: TEAL_DARK } }}>
          Valider ce thème
        </Button>
      </Box>

      <Dialog open={pubsOpen} onClose={() => setPubsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Publications à l’appui de « {draft.label.trim() || 'ce thème'} »</DialogTitle>
        <DialogContent dividers>
          <PublicationPicker
            publications={PUBLICATIONS}
            selected={draft.publicationIds ?? []}
            onChange={(publicationIds) => patch({ publicationIds })}
            coveredBy={coveredByOthers}
            themes={allThemes}
            maxHeight={380}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPubsOpen(false)} sx={{ textTransform: 'none', bgcolor: TEAL, color: '#fff', '&:hover': { bgcolor: TEAL_DARK } }}>
            Terminer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Supprimer ce thème ?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Le thème <strong>« {theme.label} »</strong> sera retiré de votre profil, ainsi que ses relations
            avec les autres thèmes.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)} sx={{ textTransform: 'none' }}>Annuler</Button>
          <Button variant="contained" color="error" startIcon={<DeleteOutline />}
            onClick={() => { setConfirmDelete(false); onDelete(theme.id) }} sx={{ textTransform: 'none' }}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
