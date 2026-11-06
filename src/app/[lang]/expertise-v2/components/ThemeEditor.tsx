'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Card, Checkbox, Chip, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, FormControlLabel, IconButton, Link, ListItemIcon, Menu, MenuItem,
  Switch, TextField, Tooltip, Typography,
} from '@mui/material'
import {
  AccountTree, ArrowBack, ArticleOutlined, CheckCircle, CheckCircleOutline, Close, ContentCopy, DeleteOutline,
  ExpandMore, MoreHoriz, SaveOutlined,
} from '@mui/icons-material'
import {
  AUDIENCES, CURRENT_YEAR, DESCRIPTION_MAX, ResearchTheme, ThemeRelation, VISIBILITY_CONFIG, Visibility,
  formatPeriod, relationSentence, variantCount,
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

const count = (n: number, one: string, many: string) => (n ? `${n} ${n > 1 ? many : one}` : null)

/** Trois libellés au plus, puis le nombre de ceux qui restent. */
const preview = (labels: string[]) =>
  labels.length > 3 ? `${labels.slice(0, 3).join(', ')} +${labels.length - 3}` : labels.join(', ')

/** Section repliée de l'enrichissement : son résumé dit ce qu'elle contient sans l'ouvrir. */
function EnrichSection({ title, summary, hint, children }: {
  title: string
  summary: string | null
  hint?: string
  children: React.ReactNode
}) {
  return (
    <Accordion
      disableGutters
      elevation={0}
      square
      slotProps={{ transition: { unmountOnExit: true } }}
      sx={{ border: 0, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'transparent' }}
    >
      <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 0, minHeight: 56 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 2, minWidth: 0 }}>
          <Typography variant='body1' fontWeight={600}>{title}</Typography>
          <Typography variant='body1' color='text.secondary' sx={{ minWidth: 0 }}>
            {summary ?? 'Facultatif'}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0, pt: 0, pb: 3 }}>
        {hint && <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>{hint}</Typography>}
        {children}
      </AccordionDetails>
    </Accordion>
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
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)

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
  const periodDiffersFromPublications =
    draft.yearFrom !== suggestedPeriod.yearFrom || (ongoing ? null : draft.yearTo) !== suggestedPeriod.yearTo

  const finalize = (): ResearchTheme => ({
    ...draft,
    label: draft.label.trim(),
    description: draft.description.trim(),
    yearTo: ongoing ? null : draft.yearTo,
    acceptsPress: isPublic ? draft.acceptsPress : false,
    acceptsEvents: isPublic ? draft.acceptsEvents : false,
  })

  const refsSummary = [
    count(draft.places.length, 'lieu', 'lieux'),
    count(draft.persons.length, 'personne', 'personnes'),
    count(draft.organizations.length, 'organisation', 'organisations'),
  ].filter(Boolean).join(' · ')
  const variants = variantCount(draft)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Box sx={{ pb: 4, maxWidth: 1200, mx: 'auto', width: '100%' }}>
        {/* En-tête, comme la fiche d'une publication */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 4 }}>
          <Tooltip title='Retour à la liste des thèmes'>
            <IconButton onClick={onBack} aria-label='Retour à la liste des thèmes' sx={{ color: 'text.primary', mt: -0.5 }}>
              <ArrowBack />
            </IconButton>
          </Tooltip>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant='h4' component='h1'>
              {draft.label.trim() || (isNew ? 'Nouveau thème' : 'Thème sans titre')}
            </Typography>
            <Box sx={{ mt: 1.5 }}>
              {theme.status === 'validated' ? (
                <Tooltip title={theme.lastValidated ? `Validé le ${theme.lastValidated}` : ''}>
                  <Chip size='small' color='success' icon={<CheckCircle sx={{ fontSize: 14 }} />} label='Validé' />
                </Tooltip>
              ) : (
                <Chip size='small' color='warning' label='Brouillon' />
              )}
            </Box>
          </Box>
          {!isNew && (
            <>
              <IconButton aria-label='Plus d’actions sur ce thème' onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ color: 'text.primary', mt: -0.5 }}>
                <MoreHoriz />
              </IconButton>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={() => { setMenuAnchor(null); setConfirmDelete(true) }} sx={{ color: 'error.main' }}>
                  <ListItemIcon sx={{ color: 'inherit' }}><DeleteOutline fontSize='small' /></ListItemIcon>
                  Supprimer ce thème
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>

        {draft.copiedFrom && (
          <Alert severity='info' variant='outlined' icon={<ContentCopy fontSize='small' />} sx={{ mb: 3 }}>
            Copié le {draft.copiedFrom.date} depuis le thème « {draft.copiedFrom.themeLabel} » de {draft.copiedFrom.memberName}.
            {' '}Adaptez-le, puis renseignez votre période de travail et la diffusion.
          </Alert>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) 320px' }, gap: 4, alignItems: 'start' }}>
          {/* ── L'essentiel ── */}
          <Box sx={{ minWidth: 0 }}>
            <Card sx={{ p: 3, display: 'grid', gap: 3 }}>
              <TextField
                fullWidth autoFocus={isNew} required
                label='Intitulé du thème'
                placeholder='Ex : Habitat inclusif et politiques publiques'
                value={draft.label}
                onChange={(e) => patch({ label: e.target.value })}
              />
              <TextField
                fullWidth multiline minRows={4}
                label='Description'
                placeholder='De quoi s’agit-il, et pourquoi est-ce important ? Pour un public non spécialiste.'
                value={draft.description}
                onChange={(e) => patch({ description: e.target.value.slice(0, DESCRIPTION_MAX) })}
                slotProps={{ htmlInput: { maxLength: DESCRIPTION_MAX } }}
                helperText={`${draft.description.length} / ${DESCRIPTION_MAX}`}
                FormHelperTextProps={{ sx: { textAlign: 'right', mr: 0 } }}
              />
              <Box>
                <Typography variant='body1' fontWeight={600} sx={{ mb: 1.5 }}>Période de travail sur ce thème</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    label='Début' type='number' size='small' sx={{ width: 120 }}
                    value={draft.yearFrom ?? ''}
                    onChange={(e) => patch({ yearFrom: parseYear(e.target.value) })}
                    slotProps={{ htmlInput: { min: 1950, max: CURRENT_YEAR } }}
                  />
                  <TextField
                    label='Fin' type='number' size='small' sx={{ width: 120 }}
                    value={ongoing ? '' : (draft.yearTo ?? '')}
                    disabled={ongoing}
                    onChange={(e) => patch({ yearTo: parseYear(e.target.value) })}
                    slotProps={{ htmlInput: { min: 1950, max: CURRENT_YEAR } }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={ongoing}
                        size='small'
                        onChange={(e) => {
                          setOngoing(e.target.checked)
                          patch({ yearTo: e.target.checked ? null : (draft.yearTo ?? CURRENT_YEAR) })
                        }}
                      />
                    }
                    label='Toujours en cours'
                  />
                  {attachedPubs.length > 0 && periodDiffersFromPublications && (
                    <Button size='small' onClick={applySuggestedPeriod}>
                      {`Reprendre les dates des publications (${formatPeriod(suggestedPeriod)})`}
                    </Button>
                  )}
                </Box>
              </Box>
            </Card>

            {/* ── L'enrichissement, à la demande ── */}
            <Box sx={{ mt: 4 }}>
              <Typography variant='h6' component='h2' sx={{ mb: 1.5 }}>Enrichir ce thème</Typography>
              <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                <EnrichSection
                  title='Publications à l’appui'
                  summary={count(attachedPubs.length, 'publication', 'publications')}
                >
                  {attachedPubs.map((p) => (
                    <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant='body2' color='text.secondary' sx={{ fontVariantNumeric: 'tabular-nums', width: 36, flexShrink: 0 }}>{p.year}</Typography>
                      <Typography variant='body1' sx={{ flex: 1, minWidth: 0 }}>{p.title}</Typography>
                      <Link href={halUrl(p.halId)} target='_blank' rel='noopener' variant='body2' underline='hover' sx={{ whiteSpace: 'nowrap' }}>{p.halId}</Link>
                      <IconButton
                        size='small'
                        aria-label={`Retirer ${p.title}`}
                        onClick={() => patch({ publicationIds: (draft.publicationIds ?? []).filter((id) => id !== p.id) })}
                      >
                        <Close sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  ))}
                  <Button size='small' variant='outlined' startIcon={<ArticleOutlined />} onClick={() => setPubsOpen(true)} sx={{ mt: 2 }}>
                    Choisir des publications
                  </Button>
                </EnrichSection>

                <EnrichSection title='Mots-clés' summary={draft.keywords.length ? preview(draft.keywords.map((k) => k.label)) : null}>
                  <KeywordPicker value={draft.keywords} onChange={(keywords) => patch({ keywords })} />
                </EnrichSection>

                <EnrichSection
                  title='Période étudiée'
                  summary={draft.studiedPeriods.length ? preview(draft.studiedPeriods.map((s) => s.label)) : null}
                  hint='L’époque sur laquelle porte ce thème, si elle compte : le Néolithique, la Révolution française, les Trente Glorieuses…'
                >
                  <StudiedPeriodPicker value={draft.studiedPeriods} onChange={(studiedPeriods) => patch({ studiedPeriods })} />
                </EnrichSection>

                <EnrichSection title='Lieux, personnes et organisations' summary={refsSummary || null}>
                  <RefsPicker
                    places={draft.places}
                    persons={draft.persons}
                    organizations={draft.organizations}
                    contextText={`${draft.label} ${draft.description} ${draft.keywords.map((k) => k.label).join(' ')}`}
                    onChange={(p) => patch(p)}
                  />
                </EnrichSection>

                <EnrichSection title='Déclinaison par public' summary={variants ? `${variants} / ${AUDIENCES.length} publics` : null}>
                  <AudienceVariantsEditor theme={draft} onChange={(p) => patch(p)} />
                </EnrichSection>

                <EnrichSection title='Relations dans le parcours' summary={count(myRelations.length, 'relation', 'relations')}>
                  {myRelations.length > 0 && (
                    <Box component='ul' sx={{ m: 0, mb: 1.5, pl: 2, '& li': { mb: 0.5 } }}>
                      {myRelations.map((r) => (
                        <Typography key={r.id} component='li' variant='body1' color='text.secondary'>
                          {relationSentence(r, [...allThemes.filter((t) => t.id !== draft.id), draft])}
                        </Typography>
                      ))}
                    </Box>
                  )}
                  {isNew ? (
                    <Typography variant='body1' color='text.secondary'>
                      Enregistrez d’abord ce thème pour le relier aux autres.
                    </Typography>
                  ) : (
                    <Button size='small' startIcon={<AccountTree />} onClick={onOpenGraph}>
                      Ouvrir le graphe de parcours
                    </Button>
                  )}
                </EnrichSection>
              </Box>
            </Box>
          </Box>

          {/* ── Diffusion ── */}
          <Card sx={{ p: 3 }}>
            <Typography variant='h6' component='h2' sx={{ mb: 1.5 }}>Diffusion de ce thème</Typography>
            <Box role='radiogroup' aria-label='Diffusion' sx={{ display: 'grid', gap: 0.5 }}>
              {VISIBILITIES.map((v) => {
                const cfg = VISIBILITY_CONFIG[v]
                const selected = draft.visibility === v
                return (
                  <Box
                    key={v}
                    role='radio'
                    aria-checked={selected}
                    tabIndex={0}
                    onClick={() => patch({ visibility: v })}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); patch({ visibility: v }) } }}
                    sx={{
                      display: 'flex', gap: 1.5, p: 1.25, borderRadius: 2, cursor: 'pointer',
                      bgcolor: selected ? 'navActive' : 'transparent',
                      '&:hover': { bgcolor: selected ? 'navActive' : 'navHover' },
                      '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -2 },
                    }}
                  >
                    <cfg.Icon fontSize='small' sx={{ color: selected ? 'primary.main' : 'text.secondary', mt: 0.1 }} />
                    <Box>
                      <Typography variant='body1' fontWeight={selected ? 600 : 400}>{cfg.label}</Typography>
                      {selected && <Typography variant='body2' color='text.secondary'>{cfg.description}</Typography>}
                    </Box>
                  </Box>
                )
              })}
            </Box>

            {/* Les sollicitations n'existent que pour un thème public. */}
            {isPublic && (
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider', display: 'grid', gap: 1 }}>
                <FormControlLabel
                  control={<Switch checked={draft.acceptsPress} onChange={(e) => patch({ acceptsPress: e.target.checked })} />}
                  label='J’accepte d’être contacté·e par des journalistes'
                  sx={{ ml: 0, alignItems: 'flex-start', '& .MuiFormControlLabel-label': { mt: 1 } }}
                />
                <FormControlLabel
                  control={<Switch checked={draft.acceptsEvents} onChange={(e) => patch({ acceptsEvents: e.target.checked })} />}
                  label='J’accepte d’intervenir lors d’événements grand public'
                  sx={{ ml: 0, alignItems: 'flex-start', '& .MuiFormControlLabel-label': { mt: 1 } }}
                />
              </Box>
            )}
          </Card>
        </Box>
      </Box>

      {/* Barre d'actions fixe */}
      <Box sx={{
        position: 'sticky', bottom: 16, zIndex: 2, mt: 'auto',
        // À droite, on laisse la place au bouton de l'assistant.
        pl: 3, pr: { xs: 3, sm: 11 }, py: 1.5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 3,
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1.5, flexWrap: 'wrap',
      }}>
        {dirty && (
          <Typography variant='body2' color='text.secondary' sx={{ mr: 'auto' }}>
            Modifications non enregistrées
          </Typography>
        )}
        <Button onClick={onBack}>Annuler</Button>
        <Button
          variant='outlined'
          startIcon={<SaveOutlined />}
          disabled={!canSubmit}
          onClick={() => onSaveDraft({ ...finalize(), status: 'draft' })}
        >
          Enregistrer le brouillon
        </Button>
        <Button
          variant='contained'
          startIcon={<CheckCircleOutline />}
          disabled={!canSubmit}
          onClick={() => onValidate({ ...finalize(), status: 'validated', lastValidated: new Date().toISOString().split('T')[0] })}
        >
          Valider ce thème
        </Button>
      </Box>

      <Dialog open={pubsOpen} onClose={() => setPubsOpen(false)} maxWidth='md' fullWidth>
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
          <Button variant='contained' onClick={() => setPubsOpen(false)}>Terminer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} maxWidth='xs' fullWidth>
        <DialogTitle>Supprimer ce thème ?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Le thème <strong>« {theme.label} »</strong> sera retiré de votre profil, ainsi que ses relations
            avec les autres thèmes.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Annuler</Button>
          <Button
            variant='contained'
            color='error'
            startIcon={<DeleteOutline />}
            onClick={() => { setConfirmDelete(false); onDelete(theme.id) }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
