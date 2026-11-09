'use client'

import useStore from '@/stores/global_store'
import { BibliographicPlatform } from '@/types/BibliographicPlatform'
import {
  CheckCircle,
  CloudUpload,
  CompareArrows,
  HourglassEmpty,
  OpenInNew,
  RestoreFromTrash,
  VisibilityOff,
  WarningAmber,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Link,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import {
  getHalUpdateScenario,
  HalAccess,
  HalUpdateProposal,
  HalUpdateScenario,
} from './halUpdateMock'
import { visuallyHidden } from '@mui/utils'
import DocumentSection from '../DocumentSection'
import CompareTable, { CompareColumn, CompareRow, CompareStatus } from '../CompareTable'

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL = '#006A61'
const TEAL_DARK = '#005550'
const TEAL_LIGHT = '#E8F5F4'
const SURFACE = '#F5F7F6'
const BORDER = '#E5E7E6'
const TEXT = '#2D3836'
const MUTED = '#6F7977'
const WARN = '#B45309'

const SEND_DELAY_MS = 1200

const storageKey = (uid: string) => `hal-update-state-${uid}`

// ─── State ────────────────────────────────────────────────────────────────────

type Step = 'compare' | 'review' | 'sending' | 'sent' | 'conflict'
type OwnershipRequest = 'none' | 'pending' | 'granted' | 'refused'
type LastEvent = 'none' | 'synced' | 'refreshed'

interface HalUpdateState {
  step: Step
  access: HalAccess
  request: OwnershipRequest
  selected: string[]
  dismissed: string[]
  /** Informations désormais présentes dans HAL. */
  applied: string[]
  /** Informations du dernier envoi. */
  sentIds: string[]
  sentAt: string | null
  lastEvent: LastEvent
}

const initialState = (scenario: HalUpdateScenario): HalUpdateState => ({
  step: 'compare',
  access: scenario.defaultAccess,
  request: 'none',
  selected: scenario.proposals
    .filter((p) => p.kind === 'add' && p.defaultSelected)
    .map((p) => p.id),
  dismissed: [],
  applied: [],
  sentIds: [],
  sentAt: null,
  lastEvent: 'none',
})

const loadState = (uid: string, scenario: HalUpdateScenario): HalUpdateState => {
  const fallback = initialState(scenario)
  try {
    const saved = localStorage.getItem(storageKey(uid))
    if (!saved) return fallback
    const parsed = { ...fallback, ...(JSON.parse(saved) as Partial<HalUpdateState>) }
    // Un envoi ou une relecture interrompus repartent de la comparaison.
    return parsed.step === 'review' || parsed.step === 'sending'
      ? { ...parsed, step: 'compare' }
      : parsed
  } catch {
    return fallback
  }
}

const saveState = (uid: string, state: HalUpdateState) => {
  try {
    localStorage.setItem(storageKey(uid), JSON.stringify(state))
  } catch {
    // Maquette : sans stockage, l'état reste valable jusqu'au rechargement.
  }
}

const clearState = (uid: string) => {
  try {
    localStorage.removeItem(storageKey(uid))
  } catch {
    // Rien à effacer si le stockage est indisponible.
  }
}

const formatCount = (count: number) =>
  `${count} information${count > 1 ? 's' : ''}`

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionTitle = ({ title, hint }: { title: string; hint: string }) => (
  <Box sx={{ mb: 1 }}>
    <Typography sx={{ color: TEXT, fontWeight: 700, fontSize: '0.875rem' }}>{title}</Typography>
    <Typography sx={{ color: MUTED, fontSize: '0.8125rem' }}>{hint}</Typography>
  </Box>
)

const SourceChip = ({ source }: { source: string }) => (
  <Chip
    label={source}
    size="small"
    variant="outlined"
    sx={{ color: MUTED, borderColor: BORDER, fontSize: '0.75rem', flexShrink: 0 }}
  />
)

const DismissButton = ({ label, onDismiss }: { label: string; onDismiss: () => void }) => (
  <Tooltip title="Ne plus proposer">
    <IconButton size="small" onClick={onDismiss} aria-label={`Ne plus proposer : ${label}`}>
      <VisibilityOff sx={{ fontSize: 17 }} />
    </IconButton>
  </Tooltip>
)

/** Les informations absentes de HAL, à cocher pour les envoyer. */
const additionRows = (
  proposals: HalUpdateProposal[],
  selected: string[],
  onToggle: (id: string) => void,
  onDismiss: (id: string) => void,
): CompareRow[] =>
  proposals.map((proposal) => ({
    key: proposal.id,
    cells: {
      select: (
        <Checkbox
          checked={selected.includes(proposal.id)}
          onChange={() => onToggle(proposal.id)}
          size="small"
          inputProps={{ 'aria-label': `${proposal.category} : ${proposal.value}` }}
          sx={{ p: 0.25 }}
        />
      ),
      category: <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{proposal.category}</Typography>,
      value: (
        <Box>
          <Typography sx={{ fontSize: '0.875rem' }}>{proposal.value}</Typography>
          {proposal.warning && (
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-start', mt: 0.5 }}>
              <WarningAmber sx={{ color: WARN, fontSize: 15, mt: '2px' }} />
              <Typography sx={{ color: WARN, fontSize: '0.8125rem' }}>{proposal.warning}</Typography>
            </Box>
          )}
          {proposal.benefit && (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem', mt: 0.5 }}>
              {proposal.benefit}
            </Typography>
          )}
        </Box>
      ),
      source: <SourceChip source={proposal.source} />,
      dismiss: <DismissButton label={proposal.value} onDismiss={() => onDismiss(proposal.id)} />,
    },
  }))

/** Les informations sur lesquelles HAL et SoVisu+ ne s'accordent pas : affichées, jamais envoyées. */
const replacementRows = (proposals: HalUpdateProposal[], onDismiss: (id: string) => void): CompareRow[] =>
  proposals.map((proposal) => ({
    key: proposal.id,
    cells: {
      category: <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{proposal.category}</Typography>,
      hal: proposal.halValue,
      sovisu: proposal.value,
      source: <SourceChip source={proposal.source} />,
      status: <CompareStatus status="differs" />,
      dismiss: <DismissButton label={proposal.category} onDismiss={() => onDismiss(proposal.id)} />,
    },
  }))

const hiddenHeader = (label: string) => (
  <Box component="span" sx={visuallyHidden}>
    {label}
  </Box>
)

const ADDITION_COLUMNS: CompareColumn[] = [
  { key: 'select', header: hiddenHeader('Ajouter'), width: 48 },
  { key: 'category', header: 'Information', width: 200 },
  { key: 'value', header: 'À ajouter dans HAL' },
  { key: 'source', header: 'Provenance', width: 150 },
  { key: 'dismiss', header: hiddenHeader('Ne plus proposer'), width: 48, align: 'right' },
]

const REPLACEMENT_COLUMNS: CompareColumn[] = [
  { key: 'category', header: 'Information', width: 200 },
  { key: 'hal', header: 'Dans HAL' },
  { key: 'sovisu', header: 'Dans SoVisu+' },
  { key: 'source', header: 'Provenance', width: 150 },
  { key: 'status', header: 'État', width: 120 },
  { key: 'dismiss', header: hiddenHeader('Ne plus proposer'), width: 48, align: 'right' },
]

const AccessBanner = ({
  state,
  scenario,
  onRequest,
}: {
  state: HalUpdateState
  scenario: HalUpdateScenario
  onRequest: () => void
}) => {
  const { access, request } = state
  const { ownerName, delegateStructure } = scenario

  if (access === 'delegate') {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        {`Vous agissez pour ${ownerName}, propriétaire de ce dépôt, avec vos droits de documentaliste sur ${delegateStructure}.`}
      </Alert>
    )
  }
  if (access === 'owner') {
    return (
      <Alert severity={request === 'granted' ? 'success' : 'info'} sx={{ mb: 2 }}>
        {request === 'granted'
          ? `${ownerName} a accepté de partager la propriété de ce dépôt : vous pouvez maintenant y envoyer vos ajouts.`
          : `Vous êtes propriétaire de ce dépôt dans HAL : vous pouvez y envoyer vos ajouts.`}
      </Alert>
    )
  }
  if (request === 'pending') {
    return (
      <Alert severity="info" icon={<HourglassEmpty />} sx={{ mb: 2 }}>
        {`Votre demande a été transmise à ${ownerName}. Votre sélection est conservée en attendant sa réponse.`}
      </Alert>
    )
  }
  if (request === 'refused') {
    return (
      <Alert
        severity="error"
        sx={{ mb: 2 }}
        action={
          <Button color="inherit" size="small" onClick={onRequest} sx={{ textTransform: 'none' }}>
            Demander à nouveau
          </Button>
        }
      >
        {`${ownerName} n'a pas accepté votre demande. Rien n'a été modifié dans HAL.`}
      </Alert>
    )
  }
  return (
    <Alert severity="warning" sx={{ mb: 2 }}>
      {`Ce dépôt appartient à ${ownerName}. Pour y ajouter ces informations, vous devez d'abord lui demander de partager sa propriété.`}
    </Alert>
  )
}

const DemoBar = ({
  state,
  onAccess,
  onSimulateRequest,
  onSimulateConflict,
  onSimulateSync,
  onReset,
}: {
  state: HalUpdateState
  onAccess: (access: HalAccess) => void
  onSimulateRequest: (answer: 'granted' | 'refused') => void
  onSimulateConflict: () => void
  onSimulateSync: () => void
  onReset: () => void
}) => {
  const demoButton = {
    textTransform: 'none',
    fontSize: '0.75rem',
    color: MUTED,
    borderColor: BORDER,
    py: 0.25,
  }
  const accessOptions: { value: HalAccess; label: string }[] = [
    { value: 'owner', label: 'Propriétaire' },
    { value: 'delegate', label: 'Documentaliste' },
    { value: 'not_owner', label: 'Non propriétaire' },
  ]
  return (
    <Box
      sx={{
        mt: 3,
        pt: 1.5,
        borderTop: `1px dashed ${BORDER}`,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 0.75,
      }}
    >
      <Typography sx={{ color: MUTED, fontSize: '0.75rem', mr: 0.5 }}>Simuler :</Typography>
      {accessOptions.map(({ value, label }) => (
        <Button
          key={value}
          size="small"
          variant={state.access === value ? 'outlined' : 'text'}
          onClick={() => onAccess(value)}
          sx={demoButton}
        >
          {label}
        </Button>
      ))}
      {state.access === 'not_owner' && state.request === 'pending' && (
        <>
          <Button size="small" onClick={() => onSimulateRequest('granted')} sx={demoButton}>
            Demande acceptée
          </Button>
          <Button size="small" onClick={() => onSimulateRequest('refused')} sx={demoButton}>
            Demande refusée
          </Button>
        </>
      )}
      {state.step === 'review' && (
        <Button size="small" onClick={onSimulateConflict} sx={demoButton}>
          Notice modifiée entre-temps
        </Button>
      )}
      {state.step === 'sent' && (
        <Button size="small" onClick={onSimulateSync} sx={demoButton}>
          Mise à jour reçue de HAL
        </Button>
      )}
      <Button
        size="small"
        onClick={onReset}
        sx={{ ...demoButton, color: '#B3261E', ml: 'auto' }}
      >
        Réinitialiser
      </Button>
    </Box>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HalUpdate() {
  const { selectedDocument } = useStore((state) => state.document)
  const uid = selectedDocument?.uid ?? ''
  const scenario = getHalUpdateScenario(uid)

  const [state, setState] = useState<HalUpdateState>(() => initialState(scenario))
  const [requestOpen, setRequestOpen] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')
  const sendTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (uid) setState(loadState(uid, getHalUpdateScenario(uid)))
  }, [uid])

  useEffect(
    () => () => {
      if (sendTimer.current) clearTimeout(sendTimer.current)
    },
    [],
  )

  const halRecord = selectedDocument?.records.find(
    (record) => record.platform === BibliographicPlatform.HAL,
  )
  if (!selectedDocument || !halRecord) return null

  const update = (patch: Partial<HalUpdateState>) => {
    const next = { ...state, ...patch }
    setState(next)
    saveState(uid, next)
  }

  const remaining = scenario.proposals.filter(
    (p) => !state.applied.includes(p.id) && !state.dismissed.includes(p.id),
  )
  const additions = remaining.filter((p) => p.kind === 'add')
  const replacements = remaining.filter((p) => p.kind === 'replace')
  const dismissed = scenario.proposals.filter((p) => state.dismissed.includes(p.id))
  const selectedAdditions = additions.filter((p) => state.selected.includes(p.id))
  const sent = scenario.proposals.filter((p) => state.sentIds.includes(p.id))
  const canSend = state.access !== 'not_owner'

  const halId = halRecord.sourceIdentifier
  const halUrl = halRecord.url ?? `https://hal.science/${halId}`
  const isFileDeposit = halRecord.halSubmitType === 'file' || halRecord.halSubmitType === 'annex'

  const halLink = (
    <Link
      href={halUrl}
      target="_blank"
      rel="noopener noreferrer"
      sx={{ color: TEAL, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
    >
      {halId}
      <OpenInNew sx={{ fontSize: 14 }} />
    </Link>
  )

  const toggle = (id: string) =>
    update({
      selected: state.selected.includes(id)
        ? state.selected.filter((s) => s !== id)
        : [...state.selected, id],
    })

  const dismiss = (id: string) =>
    update({
      dismissed: [...state.dismissed, id],
      selected: state.selected.filter((s) => s !== id),
    })

  const restore = (proposal: HalUpdateProposal) =>
    update({
      dismissed: state.dismissed.filter((d) => d !== proposal.id),
      selected:
        proposal.kind === 'add' && proposal.defaultSelected
          ? [...state.selected, proposal.id]
          : state.selected,
    })

  const send = () => {
    const sentIds = selectedAdditions.map((p) => p.id)
    const base = { ...state, step: 'sending' as Step }
    setState(base)
    sendTimer.current = setTimeout(() => {
      const next: HalUpdateState = {
        ...base,
        step: 'sent',
        sentIds,
        sentAt: new Date().toISOString(),
        lastEvent: 'none',
      }
      setState(next)
      saveState(uid, next)
    }, SEND_DELAY_MS)
  }

  const openRequest = () => {
    setRequestMessage(
      `Bonjour,\n\nPourriez-vous partager avec moi la propriété du dépôt ${halId} ? Je souhaite y ajouter ${formatCount(selectedAdditions.length)} issue${selectedAdditions.length > 1 ? 's' : ''} de SoVisu+.\n\nMerci.`,
    )
    setRequestOpen(true)
  }

  const sendRequest = () => {
    setRequestOpen(false)
    update({ request: 'pending' })
  }

  const changeAccess = (access: HalAccess) =>
    update({ access, request: 'none', step: state.step === 'review' ? 'compare' : state.step })

  const simulateRequest = (answer: 'granted' | 'refused') =>
    answer === 'granted'
      ? update({ access: 'owner', request: 'granted' })
      : update({ request: 'refused' })

  // Quelqu'un a déjà ajouté une des informations dans HAL pendant la relecture.
  const refreshAfterConflict = () => {
    const alreadyAdded = selectedAdditions[0]?.id
    update({
      step: 'compare',
      applied: alreadyAdded ? [...state.applied, alreadyAdded] : state.applied,
      selected: state.selected.filter((id) => id !== alreadyAdded),
      lastEvent: 'refreshed',
    })
  }

  const simulateSync = () =>
    update({
      step: 'compare',
      applied: [...state.applied, ...state.sentIds],
      selected: state.selected.filter((id) => !state.sentIds.includes(id)),
      lastEvent: 'synced',
    })

  const reset = () => {
    if (sendTimer.current) clearTimeout(sendTimer.current)
    clearState(uid)
    setState(initialState(scenario))
  }

  const demoBar = (
    <DemoBar
      state={state}
      onAccess={changeAccess}
      onSimulateRequest={simulateRequest}
      onSimulateConflict={() => update({ step: 'conflict' })}
      onSimulateSync={simulateSync}
      onReset={reset}
    />
  )

  const containerSx = { p: 3, border: 1, borderColor: 'divider', borderRadius: 4, bgcolor: 'background.paper' }
  const primaryButtonSx = {
    bgcolor: TEAL,
    textTransform: 'none',
    fontWeight: 600,
    '&:hover': { bgcolor: TEAL_DARK },
  }

  // ─── Envoi en cours ─────────────────────────────────────────────────────────

  if (state.step === 'sending') {
    return (
      <Box sx={containerSx}>
        <Typography sx={{ color: TEXT, fontWeight: 600, mb: 1 }}>{`Envoi vers HAL…`}</Typography>
        <LinearProgress sx={{ '& .MuiLinearProgress-bar': { bgcolor: TEAL }, bgcolor: TEAL_LIGHT }} />
      </Box>
    )
  }

  // ─── Envoyé, en attente de mise à jour ──────────────────────────────────────

  if (state.step === 'sent') {
    return (
      <Box sx={containerSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <HourglassEmpty sx={{ color: WARN }} />
          <Typography variant="h6" sx={{ color: TEXT, fontWeight: 700 }}>
            {`Envoyé, en attente de mise à jour`}
          </Typography>
        </Box>
        <Alert severity="info" sx={{ mb: 2 }}>
          {`${formatCount(sent.length)} envoyée${sent.length > 1 ? 's' : ''} à HAL. Elle${sent.length > 1 ? 's' : ''} apparaîtr${sent.length > 1 ? 'ont' : 'a'} ici après la prochaine mise à jour depuis HAL.`}
        </Alert>
        <Paper variant="outlined" sx={{ p: 2, bgcolor: SURFACE, borderColor: BORDER }}>
          <Typography sx={{ color: MUTED, fontSize: '0.8125rem', mb: 1 }}>
            {`Dépôt `}{halLink}
            {state.sentAt &&
              ` · envoyé le ${new Date(state.sentAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`}
          </Typography>
          {sent.map((p) => (
            <Typography key={p.id} sx={{ color: TEXT, fontSize: '0.875rem', mb: 0.5 }}>
              {`${p.category} : ${p.value}`}
            </Typography>
          ))}
        </Paper>
        {demoBar}
      </Box>
    )
  }

  // ─── Notice modifiée entre-temps ────────────────────────────────────────────

  if (state.step === 'conflict') {
    return (
      <Box sx={containerSx}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {`Ce dépôt a changé dans HAL depuis votre comparaison. Rien n'a été envoyé, pour éviter d'écraser ces changements.`}
        </Alert>
        <Button
          variant="contained"
          startIcon={<CompareArrows />}
          onClick={refreshAfterConflict}
          sx={primaryButtonSx}
        >
          Comparer à nouveau
        </Button>
        {demoBar}
      </Box>
    )
  }

  // ─── Relecture avant envoi ──────────────────────────────────────────────────

  if (state.step === 'review') {
    return (
      <Box sx={containerSx}>
        <Typography variant="h6" sx={{ color: TEXT, fontWeight: 700, mb: 2 }}>
          {`Vérifier avant d'envoyer à HAL`}
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, bgcolor: SURFACE, borderColor: BORDER, mb: 2 }}>
          <Typography sx={{ color: MUTED, fontSize: '0.8125rem', mb: 1 }}>
            {`Sera ajouté au dépôt `}{halLink}
          </Typography>
          {selectedAdditions.map((p) => (
            <Box key={p.id} sx={{ mb: 1 }}>
              <Typography sx={{ color: MUTED, fontSize: '0.75rem' }}>{p.category}</Typography>
              <Typography sx={{ color: TEXT, fontSize: '0.875rem' }}>{p.value}</Typography>
            </Box>
          ))}
        </Paper>
        <Typography sx={{ color: MUTED, fontSize: '0.875rem', mb: 2 }}>
          {state.access === 'delegate'
            ? `Envoi au nom de ${scenario.ownerName}, par vous en tant que documentaliste. `
            : ''}
          {`Rien d'autre ne sera modifié dans HAL.`}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button
            variant="text"
            onClick={() => update({ step: 'compare' })}
            sx={{ color: MUTED, textTransform: 'none' }}
          >
            Modifier
          </Button>
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={send}
            sx={primaryButtonSx}
          >
            Envoyer à HAL
          </Button>
        </Box>
        {demoBar}
      </Box>
    )
  }

  // ─── Comparaison ────────────────────────────────────────────────────────────

  return (
    <Box>
      <DocumentSection
        title={
          additions.length > 0
            ? `${formatCount(additions.length)} absente${additions.length > 1 ? 's' : ''} de HAL`
            : `Rien à ajouter dans HAL`
        }
        subtitle={`Choisissez ce que vous voulez ajouter à ce dépôt : le reste ne bouge pas.`}
        actions={<Typography sx={{ fontSize: '0.875rem' }}>{halLink}</Typography>}
      >
      {state.lastEvent === 'synced' && (
        <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2 }}>
          {`HAL a bien pris en compte vos derniers ajouts.`}
        </Alert>
      )}
      {state.lastEvent === 'refreshed' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {`Comparaison mise à jour : une information a déjà été ajoutée dans HAL et a été retirée de la liste.`}
        </Alert>
      )}

      {remaining.length > 0 && (
        <AccessBanner state={state} scenario={scenario} onRequest={openRequest} />
      )}

      {additions.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <SectionTitle
            title="À ajouter"
            hint="Ces informations existent dans SoVisu+ mais pas encore dans HAL."
          />
          <CompareTable
            ariaLabel="Informations à ajouter dans HAL"
            columns={ADDITION_COLUMNS}
            rows={additionRows(additions, state.selected, toggle, dismiss)}
          />
        </Box>
      )}

      {replacements.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <SectionTitle
            title="À vérifier"
            hint="HAL et SoVisu+ ne disent pas la même chose. Ces différences ne sont pas envoyées : si HAL doit changer, corrigez-le directement dans HAL."
          />
          <CompareTable
            ariaLabel="Différences entre HAL et SoVisu+"
            columns={REPLACEMENT_COLUMNS}
            rows={replacementRows(replacements, dismiss)}
          />
        </Box>
      )}

      {additions.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          {canSend ? (
            <Button
              variant="contained"
              disabled={selectedAdditions.length === 0}
              onClick={() => update({ step: 'review', lastEvent: 'none' })}
              sx={primaryButtonSx}
            >
              {`Vérifier et envoyer (${selectedAdditions.length})`}
            </Button>
          ) : (
            <Button
              variant="contained"
              disabled={state.request === 'pending'}
              onClick={openRequest}
              sx={primaryButtonSx}
            >
              {state.request === 'pending'
                ? `Demande envoyée`
                : `Demander le partage de propriété`}
            </Button>
          )}
        </Box>
      )}

      {remaining.length === 0 && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {`Plus aucune différence à traiter entre SoVisu+ et HAL pour cette publication.`}
        </Alert>
      )}

      {dismissed.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <SectionTitle
            title={`Écartées (${dismissed.length})`}
            hint="Elles ne seront plus proposées."
          />
          {dismissed.map((p) => (
            <Box key={p.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.25 }}>
              <Typography sx={{ color: MUTED, fontSize: '0.8125rem', flex: 1, minWidth: 0 }} noWrap>
                {`${p.category} : ${p.value}`}
              </Typography>
              <Button
                size="small"
                startIcon={<RestoreFromTrash sx={{ fontSize: 15 }} />}
                onClick={() => restore(p)}
                sx={{ color: TEAL, textTransform: 'none', flexShrink: 0 }}
              >
                Rétablir
              </Button>
            </Box>
          ))}
        </Box>
      )}

      <Typography sx={{ color: MUTED, fontSize: '0.8125rem' }}>
        {isFileDeposit
          ? `Pour déposer une nouvelle version du fichier, passez par HAL : `
          : `Pour ajouter un fichier à ce dépôt, passez par HAL : `}
        {halLink}
      </Typography>
      </DocumentSection>

      {demoBar}

      <Dialog open={requestOpen} onClose={() => setRequestOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{`Demander le partage de propriété à ${scenario.ownerName}`}</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: MUTED, fontSize: '0.875rem', mb: 2 }}>
            {`Si cette personne accepte, vous pourrez ajouter des informations à ce dépôt.`}
          </Typography>
          <TextField
            label="Votre message"
            value={requestMessage}
            onChange={(event) => setRequestMessage(event.target.value)}
            multiline
            minRows={6}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestOpen(false)} sx={{ color: MUTED, textTransform: 'none' }}>
            Annuler
          </Button>
          <Button variant="contained" onClick={sendRequest} sx={primaryButtonSx}>
            Envoyer la demande
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
