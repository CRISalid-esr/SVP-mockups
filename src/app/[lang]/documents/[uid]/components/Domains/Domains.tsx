'use client'

import useStore from '@/stores/global_store'
import { BibliographicPlatform } from '@/types/BibliographicPlatform'
import { Add, AutoAwesome, Close, ExpandLess, ExpandMore, RestoreFromTrash, WarningAmber } from '@mui/icons-material'
import * as Lingui from '@lingui/core'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import { HAL_DOMAINS, halDomainLabel } from '../halDomains'
import {
  clearDomainsState,
  DomainsState,
  getDomainsScenario,
  getTopic,
  initialDomainsState,
  loadDomainsState,
  saveDomainsState,
  ScoredTopic,
  topicPath,
} from './domainsMock'
import TopicPickerDialog from './TopicPickerDialog'

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL = '#006A61'
const TEAL_DARK = '#005550'
const TEAL_LIGHT = '#E8F5F4'
const BORDER = '#E5E7E6'
const SURFACE = '#F5F7F6'
const TEXT = '#2D3836'
const MUTED = '#6F7977'
const WARN = '#B45309'
const WARN_BORDER = '#F1D9A0'

type DemoAccess = 'edit' | 'read_only' | 'frozen'
type RowStatus = 'openalex' | 'proposed' | 'validated' | 'typed'

interface TopicRow {
  topicId: string
  status: RowStatus
  score?: number
  titleOnly?: boolean
}

const STATUS_ORDER: Record<RowStatus, number> = { openalex: 0, proposed: 1, validated: 2, typed: 3 }

const formatScore = (score: number) => score.toFixed(2).replace('.', ',')

// ─── Sub-components ───────────────────────────────────────────────────────────

const smallButtonSx = { textTransform: 'none', fontSize: '0.8125rem', py: 0.25, whiteSpace: 'nowrap' }
const primaryButtonSx = {
  bgcolor: TEAL,
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': { bgcolor: TEAL_DARK },
}
const outlinedButtonSx = {
  color: TEAL,
  borderColor: TEAL,
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': { borderColor: TEAL_DARK, bgcolor: TEAL_LIGHT },
}

const Section = ({
  title,
  actions,
  children,
}: {
  title: string
  actions?: ReactNode
  children: ReactNode
}) => (
  <Paper variant="outlined" sx={{ borderColor: BORDER, mb: 3 }}>
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 1.5,
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <Typography component="h2" sx={{ color: TEAL, fontSize: '1.125rem' }}>
        {title}
      </Typography>
      {actions && <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{actions}</Box>}
    </Box>
    <Box sx={{ p: 2 }}>{children}</Box>
  </Paper>
)

const StatusChip = ({ row }: { row: TopicRow }) => {
  if (row.status === 'proposed') {
    return (
      <Tooltip title="Proposition automatique : à valider ou à écarter">
        <Chip
          label={row.titleOnly ? 'Proposé, d’après le titre seul' : 'Proposé'}
          size="small"
          variant="outlined"
          sx={{ color: WARN, borderColor: WARN_BORDER, fontSize: '0.75rem' }}
        />
      </Tooltip>
    )
  }
  const labels: Record<Exclude<RowStatus, 'proposed'>, string> = {
    openalex: 'OpenAlex',
    validated: 'Validé',
    typed: 'Saisi à la main',
  }
  return (
    <Chip
      label={labels[row.status]}
      size="small"
      variant="outlined"
      sx={{ color: MUTED, borderColor: BORDER, fontSize: '0.75rem' }}
    />
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Domains() {
  const { selectedDocument } = useStore((state) => state.document)
  const router = useRouter()
  const searchParams = useSearchParams()
  const uid = selectedDocument?.uid ?? ''
  const scenario = getDomainsScenario(uid)

  const [state, setState] = useState<DomainsState>(() => initialDomainsState(uid))
  const [showProposals, setShowProposals] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [halDialogOpen, setHalDialogOpen] = useState(false)
  const [halSelection, setHalSelection] = useState<string[]>([])
  const [demoAccess, setDemoAccess] = useState<DemoAccess>('edit')
  const [simulateNoProposals, setSimulateNoProposals] = useState(false)

  useEffect(() => {
    if (uid) setState(loadDomainsState(uid))
  }, [uid])

  if (!selectedDocument) return null

  const update = (patch: Partial<DomainsState>) => {
    const next = { ...state, ...patch }
    setState(next)
    saveDomainsState(uid, next)
  }

  const isInHal = selectedDocument.records.some(
    (record) => record.platform === BibliographicPlatform.HAL,
  )
  const hasAbstract = selectedDocument.abstracts.length > 0
  const canEdit = demoAccess === 'edit'

  // Le sujet principal est celui qu'OpenAlex classe en premier : il est sorti de la liste et mis en avant.
  const [primary, ...otherOpenalex] = [...scenario.openalex].sort((a, b) => b.score - a.score)
  const hasOpenalex = primary !== undefined
  // Les propositions automatiques sont calculées pour tous les documents. Quand OpenAlex a déjà
  // classé la publication, elles ne sont qu'un complément : repliées, pour ne pas noyer ses sujets.
  const proposals = simulateNoProposals ? [] : state.proposals
  const proposalsFolded = hasOpenalex && !showProposals
  const visibleProposals = proposalsFolded ? [] : proposals

  const rows: TopicRow[] = [
    ...otherOpenalex.map((t): TopicRow => ({ ...t, status: 'openalex' })),
    ...visibleProposals.map((t): TopicRow => ({ ...t, status: 'proposed', titleOnly: !hasAbstract })),
    ...state.manual.map(
      (t): TopicRow => ({
        topicId: t.topicId,
        score: t.score,
        status: t.origin === 'validated' ? 'validated' : 'typed',
      }),
    ),
  ].sort(
    (a, b) =>
      STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || (b.score ?? 0) - (a.score ?? 0),
  )

  const groups: { subfieldId: string; path: string; rows: TopicRow[] }[] = []
  rows.forEach((row) => {
    const topic = getTopic(row.topicId)
    if (!topic) return
    const group = groups.find((g) => g.subfieldId === topic.subfieldId)
    if (group) group.rows.push(row)
    else groups.push({ subfieldId: topic.subfieldId, path: topicPath(topic), rows: [row] })
  })

  const linkedIds = [
    ...scenario.openalex.map((t) => t.topicId),
    ...proposals.map((t) => t.topicId),
    ...state.manual.map((t) => t.topicId),
  ]
  const isEmpty = !hasOpenalex && rows.length === 0
  const primaryTopic = primary ? getTopic(primary.topicId) : undefined

  const validate = (topicId: string, score?: number) =>
    update({
      proposals: state.proposals.filter((t) => t.topicId !== topicId),
      manual: [...state.manual, { topicId, score, origin: 'validated' }],
    })

  const reject = (proposal: ScoredTopic) =>
    update({
      proposals: state.proposals.filter((t) => t.topicId !== proposal.topicId),
      rejected: [...state.rejected, proposal],
    })

  const restoreRejected = (proposal: ScoredTopic) =>
    update({
      rejected: state.rejected.filter((t) => t.topicId !== proposal.topicId),
      proposals: [...state.proposals, proposal],
    })

  const removeManual = (topicId: string) =>
    update({ manual: state.manual.filter((t) => t.topicId !== topicId) })

  const addTopics = (topicIds: string[]) => {
    setPickerOpen(false)
    update({
      manual: [...state.manual, ...topicIds.map((topicId) => ({ topicId, origin: 'typed' as const }))],
      // Choisir soi-même un sujet écarté annule son rejet.
      rejected: state.rejected.filter((t) => !topicIds.includes(t.topicId)),
    })
  }

  const openHalDialog = () => {
    setHalSelection([])
    setHalDialogOpen(true)
  }

  const attributeHal = () => {
    setHalDialogOpen(false)
    update({ attributedHal: [...state.attributedHal, ...halSelection] })
  }

  const goToDeposit = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', 'hal_deposit')
    router.push(`/${Lingui.i18n.locale}/documents/${uid}?${params.toString()}`)
  }

  const resetDemo = () => {
    clearDomainsState(uid)
    setState(initialDomainsState(uid))
    setShowProposals(false)
    setDemoAccess('edit')
    setSimulateNoProposals(false)
  }

  const presentHalCodes = [
    ...scenario.halHarvested.map((domain) => domain.code),
    ...state.attributedHal,
  ]
  const halOptions = HAL_DOMAINS.filter((domain) => !presentHalCodes.includes(domain.value))

  const titleOnlyNotice = !hasAbstract && visibleProposals.length > 0 && (
    <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'flex-start', mb: 2 }}>
      <WarningAmber sx={{ color: WARN, fontSize: 17, mt: '2px' }} />
      <Typography sx={{ color: WARN, fontSize: '0.8125rem' }}>
        {`Ce document n'a pas de résumé : les propositions ont été faites d'après le titre seul, elles sont moins fiables.`}
      </Typography>
    </Box>
  )

  const proposalsCount = proposals.length
  const proposalsToggleLabel = showProposals
    ? 'Masquer les propositions automatiques'
    : `Voir ${proposalsCount} proposition${proposalsCount > 1 ? 's' : ''} automatique${proposalsCount > 1 ? 's' : ''} en complément`

  const demoButtonSx = { textTransform: 'none', fontSize: '0.75rem', color: MUTED, borderColor: BORDER, py: 0.25 }
  const demoOptions: { value: DemoAccess; label: string }[] = [
    { value: 'edit', label: 'Modification autorisée' },
    { value: 'read_only', label: 'Sans droit de modification' },
    { value: 'frozen', label: 'Document figé' },
  ]

  return (
    <Box>
      {demoAccess === 'frozen' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {`Ce document est en cours de mise à jour : ses domaines ne peuvent pas être modifiés pour le moment.`}
        </Alert>
      )}

      {/* ── Classification OpenAlex ───────────────────────────────────────── */}
      <Section
        title="Classification OpenAlex"
        actions={
          // À vide, l'ajout est déjà mis en avant dans le corps de la section.
          !isEmpty && canEdit ? (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Add sx={{ fontSize: 16 }} />}
              onClick={() => setPickerOpen(true)}
              sx={outlinedButtonSx}
            >
              Ajouter
            </Button>
          ) : undefined
        }
      >
        {primary && (
          <Box
            sx={{
              border: `1px solid ${BORDER}`,
              borderLeft: `3px solid ${TEAL}`,
              borderRadius: 1,
              px: 1.5,
              py: 1.25,
              mb: 2,
            }}
          >
            <Typography sx={{ color: TEAL, fontSize: '0.75rem', fontWeight: 600, mb: 0.5 }}>
              Sujet principal
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ color: TEXT, fontWeight: 600, fontSize: '0.9375rem', flex: '1 1 240px', minWidth: 0 }}>
                {primaryTopic?.label}
              </Typography>
              <Tooltip title="Le sujet le plus pertinent selon OpenAlex pour cette publication">
                <Chip
                  label="OpenAlex, principal"
                  size="small"
                  sx={{ bgcolor: TEAL_LIGHT, color: TEAL, fontSize: '0.75rem' }}
                />
              </Tooltip>
              <Tooltip title="Score de correspondance, de 0 à 1">
                <Typography sx={{ color: MUTED, fontSize: '0.8125rem', minWidth: 32, textAlign: 'right' }}>
                  {formatScore(primary.score)}
                </Typography>
              </Tooltip>
            </Box>
            {primaryTopic && (
              <Typography sx={{ color: MUTED, fontSize: '0.8125rem', mt: 0.25 }}>
                {topicPath(primaryTopic)}
              </Typography>
            )}
          </Box>
        )}

        {titleOnlyNotice}

        {isEmpty && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography sx={{ color: TEXT, fontWeight: 600, mb: 0.5 }}>
              {`Aucun domaine pour ce document`}
            </Typography>
            {canEdit ? (
              <>
                <Typography sx={{ color: MUTED, fontSize: '0.875rem', mb: 2 }}>
                  {`Aucun sujet n'a pu être proposé automatiquement. Vous pouvez choisir vous-même des domaines.`}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setPickerOpen(true)}
                  sx={primaryButtonSx}
                >
                  Ajouter un domaine
                </Button>
              </>
            ) : (
              <Typography sx={{ color: MUTED, fontSize: '0.875rem' }}>
                {`Aucun domaine n'a encore été renseigné.`}
              </Typography>
            )}
          </Box>
        )}

        {primary && groups.length > 0 && (
          <Typography sx={{ color: MUTED, fontSize: '0.8125rem', mb: 1 }}>Autres sujets</Typography>
        )}

        {groups.map((group) => (
          <Box key={group.subfieldId} sx={{ mb: 2, '&:last-of-type': { mb: 0 } }}>
            <Typography sx={{ color: TEXT, fontWeight: 600, fontSize: '0.875rem', mb: 0.5 }}>
              {group.path}
            </Typography>
            {group.rows.map((row) => {
              const topic = getTopic(row.topicId)
              return (
                <Box
                  key={row.topicId}
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 1,
                    ml: { xs: 0, sm: 2 },
                    py: 0.5,
                    borderBottom: `1px solid ${SURFACE}`,
                  }}
                >
                  <Typography sx={{ color: TEXT, fontSize: '0.875rem', flex: '1 1 240px', minWidth: 0 }}>
                    {topic?.label}
                  </Typography>
                  <StatusChip row={row} />
                  {row.score != null && (
                    <Tooltip title="Score de correspondance, de 0 à 1">
                      <Typography sx={{ color: MUTED, fontSize: '0.8125rem', minWidth: 32, textAlign: 'right' }}>
                        {formatScore(row.score)}
                      </Typography>
                    </Tooltip>
                  )}
                  {canEdit && row.status === 'proposed' && (
                    <>
                      <Button
                        size="small"
                        onClick={() => validate(row.topicId, row.score)}
                        aria-label={`Valider ${topic?.label}`}
                        sx={{ ...smallButtonSx, color: TEAL, fontWeight: 600 }}
                      >
                        Valider
                      </Button>
                      <Button
                        size="small"
                        onClick={() => reject({ topicId: row.topicId, score: row.score ?? 0, titleOnly: row.titleOnly })}
                        aria-label={`Écarter ${topic?.label}`}
                        sx={{ ...smallButtonSx, color: MUTED }}
                      >
                        Écarter
                      </Button>
                    </>
                  )}
                  {canEdit && (row.status === 'typed' || row.status === 'validated') && (
                    <Button
                      size="small"
                      onClick={() => removeManual(row.topicId)}
                      aria-label={`Retirer ${topic?.label}`}
                      sx={{ ...smallButtonSx, color: MUTED }}
                    >
                      Retirer
                    </Button>
                  )}
                </Box>
              )
            })}
          </Box>
        ))}

        {hasOpenalex && proposalsCount > 0 && (
          <Button
            size="small"
            startIcon={<AutoAwesome sx={{ fontSize: 15 }} />}
            endIcon={showProposals ? <ExpandLess /> : <ExpandMore />}
            onClick={() => setShowProposals(!showProposals)}
            sx={{ ...smallButtonSx, color: TEAL, mt: 1 }}
          >
            {proposalsToggleLabel}
          </Button>
        )}

        {state.rejected.length > 0 && (
          <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${BORDER}` }}>
            <Typography sx={{ color: MUTED, fontSize: '0.8125rem', mb: 0.5 }}>
              {`Écartés (${state.rejected.length}) : ils ne seront plus proposés.`}
            </Typography>
            {state.rejected.map((proposal) => (
              <Box key={proposal.topicId} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ color: MUTED, fontSize: '0.8125rem', flex: 1, minWidth: 0 }}>
                  {getTopic(proposal.topicId)?.label}
                </Typography>
                {canEdit && (
                  <Button
                    size="small"
                    startIcon={<RestoreFromTrash sx={{ fontSize: 15 }} />}
                    onClick={() => restoreRejected(proposal)}
                    sx={{ ...smallButtonSx, color: TEAL }}
                  >
                    Rétablir
                  </Button>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Section>

      {/* ── Domaines HAL ──────────────────────────────────────────────────── */}
      <Section
        title="Domaines HAL"
        actions={
          canEdit ? (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Add sx={{ fontSize: 16 }} />}
              onClick={openHalDialog}
              sx={outlinedButtonSx}
            >
              Attribuer
            </Button>
          ) : undefined
        }
      >
        {presentHalCodes.length === 0 && (
          <Typography sx={{ color: MUTED, fontSize: '0.875rem', mb: canEdit ? 1 : 0 }}>
            {isInHal
              ? `HAL n'indique aucun domaine pour cette publication.`
              : `Aucun domaine HAL : cette publication n'est pas dans HAL.`}
          </Typography>
        )}

        {scenario.halHarvested.map((domain) => (
          <Box key={domain.code} sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, py: 0.5 }}>
            <Typography sx={{ color: TEXT, fontSize: '0.875rem', flex: '1 1 240px', minWidth: 0 }}>
              {`${halDomainLabel(domain.code)} (${domain.code})`}
            </Typography>
            <Chip
              label={domain.primary ? 'HAL, principal' : 'HAL'}
              size="small"
              variant={domain.primary ? 'filled' : 'outlined'}
              sx={
                domain.primary
                  ? { bgcolor: TEAL_LIGHT, color: TEAL, fontSize: '0.75rem' }
                  : { color: MUTED, borderColor: BORDER, fontSize: '0.75rem' }
              }
            />
          </Box>
        ))}

        {state.attributedHal.map((code) => (
          <Box key={code} sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, py: 0.5 }}>
            <Typography sx={{ color: TEXT, fontSize: '0.875rem', flex: '1 1 240px', minWidth: 0 }}>
              {`${halDomainLabel(code)} (${code})`}
            </Typography>
            <Chip label="Attribué" size="small" variant="outlined" sx={{ color: MUTED, borderColor: BORDER, fontSize: '0.75rem' }} />
            {canEdit && (
              <Button
                size="small"
                onClick={() => update({ attributedHal: state.attributedHal.filter((c) => c !== code) })}
                aria-label={`Retirer ${halDomainLabel(code)}`}
                sx={{ ...smallButtonSx, color: MUTED }}
              >
                Retirer
              </Button>
            )}
          </Box>
        ))}

        {isInHal && state.attributedHal.length > 0 && (
          <Typography sx={{ color: MUTED, fontSize: '0.8125rem', mt: 1 }}>
            {`Les domaines attribués restent dans SoVisu+ : ils ne modifient pas la notice HAL.`}
          </Typography>
        )}
        {!isInHal && (canEdit || state.attributedHal.length > 0) && (
          <Typography sx={{ color: MUTED, fontSize: '0.8125rem', mt: 1 }}>
            {`Les domaines attribués sont repris dans le formulaire de dépôt. `}
            {state.attributedHal.length > 0 && (
              <Link component="button" onClick={goToDeposit} sx={{ color: TEAL, fontSize: '0.8125rem', verticalAlign: 'baseline' }}>
                Déposer dans HAL
              </Link>
            )}
          </Typography>
        )}
      </Section>

      {/* ── Zone de démonstration ─────────────────────────────────────────── */}
      {/* Marge à droite : le bouton flottant de l'assistant recouvre ce coin de l'écran. */}
      <Box sx={{ pt: 1.5, pr: 9, borderTop: `1px dashed ${BORDER}`, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75 }}>
        <Typography sx={{ color: MUTED, fontSize: '0.75rem', mr: 0.5 }}>Simuler :</Typography>
        {demoOptions.map(({ value, label }) => (
          <Button
            key={value}
            size="small"
            variant={demoAccess === value ? 'outlined' : 'text'}
            onClick={() => setDemoAccess(value)}
            sx={demoButtonSx}
          >
            {label}
          </Button>
        ))}
        <Button
          size="small"
          variant={simulateNoProposals ? 'outlined' : 'text'}
          onClick={() => setSimulateNoProposals(!simulateNoProposals)}
          sx={demoButtonSx}
        >
          Sans proposition automatique
        </Button>
        <Button
          size="small"
          startIcon={<Close sx={{ fontSize: 14 }} />}
          onClick={resetDemo}
          sx={{ ...demoButtonSx, color: '#B3261E', ml: 'auto' }}
        >
          Réinitialiser
        </Button>
      </Box>

      <TopicPickerDialog
        open={pickerOpen}
        linkedIds={linkedIds}
        onClose={() => setPickerOpen(false)}
        onConfirm={addTopics}
      />

      <Dialog open={halDialogOpen} onClose={() => setHalDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Attribuer un domaine HAL</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: MUTED, fontSize: '0.875rem', mb: 2 }}>
            {isInHal
              ? `Le domaine restera dans SoVisu+ : la notice HAL ne sera pas modifiée.`
              : `Le domaine sera repris dans le formulaire de dépôt HAL.`}
          </Typography>
          <Autocomplete
            multiple
            options={halOptions}
            getOptionLabel={(option) => option.label}
            value={HAL_DOMAINS.filter((domain) => halSelection.includes(domain.value))}
            onChange={(_, value) => setHalSelection(value.map((domain) => domain.value))}
            renderInput={(params) => (
              <TextField {...params} label="Domaines HAL" placeholder="Rechercher un domaine" />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHalDialogOpen(false)} sx={{ color: MUTED, textTransform: 'none' }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            disabled={halSelection.length === 0}
            onClick={attributeHal}
            sx={primaryButtonSx}
          >
            {`Attribuer (${halSelection.length})`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
