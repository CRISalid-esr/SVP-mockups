'use client'

import useStore from '@/stores/global_store'
import { BibliographicPlatform } from '@/types/BibliographicPlatform'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'
import {
  Add,
  AttachFile,
  CheckCircle,
  Close,
  CloudUpload,
  ErrorOutline,
  HourglassEmpty,
  OpenInNew,
  WarningAmber,
} from '@mui/icons-material'
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  Link,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import * as Lingui from '@lingui/core'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getDepositDomains } from '../Domains/domainsMock'
import { HAL_DOMAINS } from '../halDomains'
import DocumentSection from '../DocumentSection'

// ─── Static data ──────────────────────────────────────────────────────────────


const HAL_DOC_TYPES = [
  { value: 'ART', label: 'Article' },
  { value: 'COMM', label: 'Communication' },
  { value: 'THESE', label: 'Thèse' },
  { value: 'HDR', label: 'Habilitation à diriger des recherches' },
  { value: 'OUV', label: 'Ouvrage' },
  { value: 'COUV', label: "Chapitre d'ouvrage" },
  { value: 'REPORT', label: 'Rapport' },
  { value: 'POSTER', label: 'Poster' },
  { value: 'PRESCONF', label: 'Présentation de conférence' },
]

const LICENSES = [
  { value: '', label: '— Choisir une licence —' },
  { value: 'cc-by', label: 'CC BY 4.0 – Attribution' },
  {
    value: 'cc-by-sa',
    label: 'CC BY-SA 4.0 – Attribution, Partage dans les mêmes conditions',
  },
  {
    value: 'cc-by-nc',
    label: "CC BY-NC 4.0 – Attribution, Pas d'utilisation commerciale",
  },
  {
    value: 'cc-by-nc-sa',
    label:
      "CC BY-NC-SA 4.0 – Attribution, Pas d'utilisation commerciale, Partage dans les mêmes conditions",
  },
  { value: 'cc-by-nd', label: "CC BY-ND 4.0 – Attribution, Pas d'œuvre dérivée" },
  {
    value: 'cc-by-nc-nd',
    label:
      "CC BY-NC-ND 4.0 – Attribution, Pas d'utilisation commerciale, Pas d'œuvre dérivée",
  },
  { value: 'etalab', label: 'ETALAB – Licence Ouverte' },
  { value: 'copyright', label: 'Copyright – Tous droits réservés' },
]

// Origine du fichier (cf. formulaire de dépôt HAL)
const FILE_ORIGINS = [
  { value: 'author', label: "Fichier(s) produit(s) par l'(les) auteur(s)" },
  {
    value: 'greenPublisher',
    label: "Éditeur autorisant le dépôt des fichiers éditeurs (vérifié)",
  },
  {
    value: 'publisherAgreement',
    label: "Accord explicite de l'éditeur pour ce dépôt",
  },
  {
    value: 'publisherPaid',
    label: 'Frais de publication financés pour le libre accès',
  },
]

// Type / nature du fichier (cf. formulaire de dépôt HAL)
const FILE_KINDS = [
  { value: 'file', label: 'Document (pdf, jpg, …)' },
  { value: 'src', label: 'Fichier source (word, tex, …)' },
  { value: 'annex', label: 'Données supplémentaires' },
]

// Visibilité / embargo du fichier (cf. formulaire de dépôt HAL)
const VISIBILITY_OPTIONS = [
  { value: 'now', label: 'Immédiatement' },
  { value: '15d', label: 'Dans 15 jours' },
  { value: '1m', label: 'Dans 1 mois' },
  { value: '3m', label: 'Dans 3 mois' },
  { value: '6m', label: 'Dans 6 mois' },
  { value: '1y', label: 'Dans 1 an' },
  { value: '2y', label: 'Dans 2 ans' },
]

const LANGUAGES = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'Anglais' },
  { value: 'es', label: 'Espagnol' },
  { value: 'de', label: 'Allemand' },
  { value: 'it', label: 'Italien' },
  { value: 'pt', label: 'Portugais' },
]

const DOC_TYPE_TO_HAL: Record<string, string> = {
  Article: 'ART',
  Book: 'OUV',
  Thesis: 'THESE',
  Conference: 'COMM',
  Report: 'REPORT',
}

type AttachedFile = {
  name: string
  size: number
  origin: string
  kind: string
  visibility: string
  license: string
}
type Step = 'form' | 'review' | 'uploading'

const labelOf = (list: { value: string; label: string }[], value: string) =>
  list.find((o) => o.value === value)?.label ?? value

const makeAttachedFile = (
  name: string,
  size: number,
  kind: string,
): AttachedFile => ({
  name,
  size,
  origin: 'author',
  kind,
  visibility: 'now',
  license: '',
})

type DepositStatusStep = 'moderation' | 'accepted' | 'rejected' | 'changes_requested'
type DepositStatus = {
  step: DepositStatusStep
  submittedAt: string
  halId: string
  hasFile: boolean
}

const MOCK_REJECTION_REASON =
  'Le fichier PDF fourni ne respecte pas les critères de HAL (le document semble être protégé contre la copie). Merci de fournir un PDF non protégé.'

const MOCK_CHANGES_COMMENT =
  'Le résumé en anglais est manquant. Merci d’ajouter un abstract en anglais avant de soumettre à nouveau.'

const depositStorageKey = (uid: string) => `hal-deposit-status-${uid}`

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HalDeposit() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const lang = Lingui.i18n.locale as ExtendedLanguageCode
  const { selectedDocument } = useStore((state) => state.document)

  const [step, setStep] = useState<Step>('form')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [depositStatus, setDepositStatus] = useState<DepositStatus | null>(null)

  const [documentType, setDocumentType] = useState(
    selectedDocument ? (DOC_TYPE_TO_HAL[selectedDocument.documentType] ?? '') : '',
  )
  const [domains, setDomains] = useState<string[]>([])
  const [domainsPrefilled, setDomainsPrefilled] = useState(false)
  const [language, setLanguage] = useState('fr')
  const [productionDate, setProductionDate] = useState(
    selectedDocument?.publicationDate?.substring(0, 10) ??
      new Date().toISOString().substring(0, 10),
  )
  const [journal, setJournal] = useState(selectedDocument?.journal?.title ?? '')
  const [showErrors, setShowErrors] = useState(false)
  const [conferenceTitle, setConferenceTitle] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [institution, setInstitution] = useState('')
  const [director, setDirector] = useState('')
  const [bookTitle, setBookTitle] = useState('')
  const [mainFile, setMainFile] = useState<AttachedFile | null>(null)
  const [annexFiles, setAnnexFiles] = useState<AttachedFile[]>([])

  useEffect(() => {
    if (!selectedDocument) return
    const saved = localStorage.getItem(depositStorageKey(selectedDocument.uid))
    if (saved) setDepositStatus(JSON.parse(saved))
    const prefilled = getDepositDomains(selectedDocument.uid)
    setDomains(prefilled)
    setDomainsPrefilled(prefilled.length > 0)
  }, [selectedDocument?.uid])

  if (!selectedDocument) return null

  const isInHal = selectedDocument.records.some(
    (r) => r.platform === BibliographicPlatform.HAL,
  )
  if (isInHal && !depositStatus) return null

  const title =
    selectedDocument.titles.find((t) => t.language === 'fr')?.value ??
    selectedDocument.titles[0]?.value ??
    ''

  const abstract =
    selectedDocument.abstracts.find((a) => a.language === 'fr')?.value ??
    selectedDocument.abstracts[0]?.value ??
    ''

  const contributions = selectedDocument.contributions ?? []

  const navigateTo = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.push(`/${lang}/documents/${selectedDocument.uid}?${params.toString()}`)
  }

  const saveDepositStatus = (status: DepositStatus) => {
    setDepositStatus(status)
    localStorage.setItem(depositStorageKey(selectedDocument.uid), JSON.stringify(status))
  }

  const clearDepositStatus = () => {
    setDepositStatus(null)
    localStorage.removeItem(depositStorageKey(selectedDocument.uid))
    setStep('form')
  }

  const simulateStatus = (s: DepositStatusStep) => {
    if (!depositStatus) return
    saveDepositStatus({ ...depositStatus, step: s })
  }

  const handleMainFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setMainFile(makeAttachedFile(f.name, f.size, 'file'))
  }

  const handleAnnexFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setAnnexFiles((prev) => [...prev, makeAttachedFile(f.name, f.size, 'annex')])
  }

  const updateMainFile = (patch: Partial<AttachedFile>) =>
    setMainFile((prev) => (prev ? { ...prev, ...patch } : prev))

  const updateAnnexFile = (index: number, patch: Partial<AttachedFile>) =>
    setAnnexFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    )

  const isConference = ['COMM', 'POSTER', 'PRESCONF'].includes(documentType)
  const isThesis = ['THESE', 'HDR'].includes(documentType)

  /** Champs obligatoires encore vides, dans l'ordre du formulaire. */
  const missing: { key: string; label: string }[] = [
    !documentType && { key: 'type', label: 'Type de document' },
    domains.length === 0 && { key: 'domains', label: 'Au moins un domaine HAL' },
    documentType === 'ART' && !journal.trim() && { key: 'journal', label: 'Nom de la revue' },
    isConference && !conferenceTitle.trim() && { key: 'conference', label: 'Titre du congrès' },
    !mainFile && { key: 'file', label: 'Fichier principal (PDF)' },
    mainFile && !mainFile.license && { key: 'license', label: 'Licence du fichier principal' },
  ].filter((item): item is { key: string; label: string } => Boolean(item))
  const isMissing = (key: string) => showErrors && missing.some((item) => item.key === key)

  const handleSubmit = () => {
    if (missing.length > 0) {
      setShowErrors(true)
      return
    }
    setShowErrors(false)
    setStep('review')
  }

  const handleConfirm = () => {
    setStep('uploading')
    setUploadProgress(0)
    const halId = `hal-0485${Math.floor(Math.random() * 9000 + 1000)}`
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            saveDepositStatus({
              step: mainFile ? 'moderation' : 'accepted',
              submittedAt: new Date().toISOString(),
              halId,
              hasFile: !!mainFile,
            })
          }, 400)
          return 100
        }
        return prev + 10
      })
    }, 180)
  }

  const sortedContributions = contributions.slice().sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
  const authorNames = sortedContributions.map((c) => c.person?.displayName ?? '—')
  const authorsSummary =
    authorNames.length === 0
      ? 'Aucun auteur renseigné'
      : authorNames.length <= 3
        ? authorNames.join(', ')
        : `${authorNames.slice(0, 3).join(', ')} et ${authorNames.length - 3} autre${authorNames.length - 3 > 1 ? 's' : ''}`

  // ─── Statut du dépôt ────────────────────────────────────────────────────────

  if (depositStatus) {
    const halUrl = `https://hal.science/${depositStatus.halId}`
    const submittedDate = new Date(depositStatus.submittedAt).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    const view = STATUS_VIEWS[depositStatus.step]
    const Icon = view.icon

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <DocumentSection title="Dépôt dans HAL" subtitle={`Soumis le ${submittedDate}`}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Icon sx={{ color: `${view.color}.main`, fontSize: 28 }} />
            <Typography variant="h6" component="p" sx={{ color: `${view.color}.dark` }}>
              {view.title}
            </Typography>
          </Box>
          <Typography sx={{ mb: 2 }}>{view.message}</Typography>

          <Box component="dl" sx={{ m: 0, mb: 3, border: 1, borderColor: 'divider', borderRadius: 3, px: 2.5, py: 1 }}>
            {view.detail === 'halId' ? (
              <SummaryRow label={depositStatus.step === 'accepted' ? 'Publication dans HAL' : 'Identifiant HAL (temporaire)'}>
                <Link href={halUrl} target="_blank" rel="noopener" underline="hover" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}>
                  {depositStatus.step === 'accepted' ? halUrl : depositStatus.halId}
                  <OpenInNew sx={{ fontSize: 14 }} />
                </Link>
              </SummaryRow>
            ) : (
              <SummaryRow label={depositStatus.step === 'rejected' ? 'Motif du rejet' : 'Commentaire de la modération'}>
                {depositStatus.step === 'rejected' ? MOCK_REJECTION_REASON : MOCK_CHANGES_COMMENT}
              </SummaryRow>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {view.retry && (
              <Button variant="contained" disableElevation onClick={clearDepositStatus}>
                {view.retry}
              </Button>
            )}
            <Button variant={view.retry ? 'text' : 'outlined'} onClick={() => navigateTo('bibliographic_information')}>
              Retour au récapitulatif
            </Button>
          </Box>
        </DocumentSection>

        <DemoBar>
          {(Object.keys(STATUS_VIEWS) as DepositStatusStep[]).map((s) => (
            <Button
              key={s}
              size="small"
              color="inherit"
              variant={depositStatus.step === s ? 'outlined' : 'text'}
              onClick={() => simulateStatus(s)}
              sx={{ fontSize: '0.75rem', color: 'text.secondary', minWidth: 0, py: 0.25, px: 1 }}
            >
              {STATUS_VIEWS[s].demoLabel}
            </Button>
          ))}
          <Button size="small" color="error" onClick={clearDepositStatus} sx={{ fontSize: '0.75rem', ml: 'auto' }}>
            Réinitialiser
          </Button>
        </DemoBar>
      </Box>
    )
  }

  // ─── Envoi ──────────────────────────────────────────────────────────────────

  if (step === 'uploading') {
    return (
      <DocumentSection title="Dépôt en cours" subtitle="Ne fermez pas cette page avant la fin de l’envoi.">
        <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 8, borderRadius: 4 }} aria-label="Avancement du dépôt" />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          {`${uploadProgress} % envoyés`}
        </Typography>
      </DocumentSection>
    )
  }

  // ─── Vérification ───────────────────────────────────────────────────────────

  if (step === 'review') {
    const typeLabel = labelOf(HAL_DOC_TYPES, documentType)
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <StepHeader step={2} title="Vérifier avant de déposer" />

        <DocumentSection title="Ce qui sera déposé dans HAL" subtitle="Le dépôt passera ensuite par la modération de HAL.">
          <Box component="dl" sx={{ m: 0 }}>
            <SummaryRow label="Titre">{title || '—'}</SummaryRow>
            <SummaryRow label="Auteurs">{authorsSummary}</SummaryRow>
            <SummaryRow label="Type">{typeLabel}</SummaryRow>
            <SummaryRow label="Langue">{labelOf(LANGUAGES, language)}</SummaryRow>
            <SummaryRow label={dateLabel(documentType)}>{productionDate}</SummaryRow>
            {documentType === 'ART' && journal && <SummaryRow label="Revue">{journal}</SummaryRow>}
            {isConference && conferenceTitle && (
              <SummaryRow label="Congrès">{city && country ? `${conferenceTitle} (${city}, ${country})` : conferenceTitle}</SummaryRow>
            )}
            {['THESE', 'HDR', 'REPORT'].includes(documentType) && institution && (
              <SummaryRow label={documentType === 'REPORT' ? 'Institution' : 'Organisme de délivrance'}>{institution}</SummaryRow>
            )}
            {isThesis && director && (
              <SummaryRow label={documentType === 'THESE' ? 'Directeur de thèse' : 'Président du jury'}>{director}</SummaryRow>
            )}
            {documentType === 'COUV' && bookTitle && <SummaryRow label="Titre de l’ouvrage">{bookTitle}</SummaryRow>}
            <SummaryRow label="Domaines HAL">
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {domains.map((d) => (
                  <Chip key={d} size="small" variant="outlined" label={HAL_DOMAINS.find((x) => x.value === d)?.label ?? d} />
                ))}
              </Box>
            </SummaryRow>
            <SummaryRow label="Fichiers">
              {mainFile && <ReviewFile file={mainFile} isMain />}
              {annexFiles.map((f, i) => (
                <ReviewFile key={i} file={f} />
              ))}
            </SummaryRow>
          </Box>
        </DocumentSection>

        <ActionBar>
          <Button color="inherit" onClick={() => setStep('form')}>
            Modifier
          </Button>
          <Button variant="contained" disableElevation startIcon={<CloudUpload />} onClick={handleConfirm}>
            Déposer dans HAL
          </Button>
        </ActionBar>
      </Box>
    )
  }

  // ─── Formulaire ─────────────────────────────────────────────────────────────

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <StepHeader step={1} title="Préparer le dépôt" />

      <DocumentSection
        title="Repris de la notice"
        subtitle="Ces informations viennent des autres onglets : modifiez-les là-bas, elles seront reprises ici."
      >
        <Box component="dl" sx={{ m: 0 }}>
          <SummaryRow label="Titre" action={<EditLink onClick={() => navigateTo('bibliographic_information')} label="Modifier le titre" />}>
            {title || 'Aucun titre renseigné'}
          </SummaryRow>
          <SummaryRow label="Résumé" action={<EditLink onClick={() => navigateTo('bibliographic_information')} label="Modifier le résumé" />}>
            <Typography
              variant="body2"
              color={abstract ? 'text.primary' : 'text.secondary'}
              sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {abstract || 'Aucun résumé renseigné'}
            </Typography>
          </SummaryRow>
          <SummaryRow label="Auteurs" action={<EditLink onClick={() => navigateTo('authors')} label="Modifier les auteurs" />}>
            {authorsSummary}
          </SummaryRow>
        </Box>
      </DocumentSection>

      <DocumentSection title="Description" subtitle="Les champs marqués d’un astérisque sont obligatoires pour HAL.">
        <Box sx={{ display: 'grid', gap: 2.5 }}>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(3, minmax(0, 1fr))' } }}>
            <FormControl fullWidth size="small" error={isMissing('type')}>
              <InputLabel id="deposit-type">Type de document *</InputLabel>
              <Select labelId="deposit-type" value={documentType} onChange={(e) => setDocumentType(e.target.value)} label="Type de document *">
                {HAL_DOC_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel id="deposit-language">Langue *</InputLabel>
              <Select labelId="deposit-language" value={language} onChange={(e) => setLanguage(e.target.value)} label="Langue *">
                {LANGUAGES.map((l) => (
                  <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              size="small"
              label={`${dateLabel(documentType)} *`}
              type="date"
              value={productionDate}
              onChange={(e) => setProductionDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Box>

          {documentType === 'ART' && (
            <TextField
              size="small"
              label="Nom de la revue *"
              value={journal}
              onChange={(e) => setJournal(e.target.value)}
              error={isMissing('journal')}
              helperText={selectedDocument.journal?.title && journal === selectedDocument.journal.title ? 'Repris de « Paru dans ».' : undefined}
              fullWidth
            />
          )}

          {isConference && (
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: '2fr 1fr 1fr' } }}>
              <TextField size="small" label="Titre du congrès *" value={conferenceTitle} onChange={(e) => setConferenceTitle(e.target.value)} error={isMissing('conference')} fullWidth />
              <TextField size="small" label="Ville" value={city} onChange={(e) => setCity(e.target.value)} fullWidth />
              <TextField size="small" label="Pays" value={country} onChange={(e) => setCountry(e.target.value)} fullWidth />
            </Box>
          )}

          {['THESE', 'HDR', 'REPORT'].includes(documentType) && (
            <TextField
              size="small"
              label={documentType === 'REPORT' ? 'Institution' : 'Organisme de délivrance'}
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              fullWidth
            />
          )}

          {isThesis && (
            <TextField
              size="small"
              label={documentType === 'THESE' ? 'Directeur de thèse' : 'Président du jury'}
              value={director}
              onChange={(e) => setDirector(e.target.value)}
              fullWidth
            />
          )}

          {documentType === 'COUV' && (
            <TextField size="small" label="Titre de l’ouvrage" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} fullWidth />
          )}

          <Autocomplete
            multiple
            size="small"
            options={HAL_DOMAINS}
            getOptionLabel={(o) => o.label}
            value={HAL_DOMAINS.filter((d) => domains.includes(d.value))}
            onChange={(_, v) => setDomains(v.map((x) => x.value))}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Domaines HAL *"
                placeholder="Choisir des domaines"
                error={isMissing('domains')}
                helperText={domainsPrefilled ? 'Repris de l’onglet Thématiques : vous pouvez les ajuster pour ce dépôt.' : undefined}
              />
            )}
          />
        </Box>
      </DocumentSection>

      <DocumentSection title="Fichiers" subtitle="Le texte intégral en PDF est obligatoire. HAL vérifie les droits de diffusion pendant la modération.">
        <Typography variant="subtitle2" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
          Fichier principal (PDF) *
        </Typography>
        {mainFile ? (
          <FileCard file={mainFile} isMain onRemove={() => setMainFile(null)}>
            <FileMetaControls file={mainFile} requireLicense showErrors={showErrors} onChange={updateMainFile} />
          </FileCard>
        ) : (
          <Box
            sx={{
              border: 1,
              borderStyle: 'dashed',
              borderColor: isMissing('file') ? 'error.main' : 'divider',
              borderRadius: 3,
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              textAlign: 'center',
            }}
          >
            <CloudUpload sx={{ color: 'text.secondary', fontSize: 32 }} />
            <Typography variant="body2" color="text.secondary">Le PDF de la publication, tel que vous souhaitez le diffuser</Typography>
            <Button variant="outlined" component="label">
              Choisir un fichier PDF
              <input type="file" hidden accept="application/pdf" onChange={handleMainFile} />
            </Button>
          </Box>
        )}

        <Typography variant="subtitle2" component="h3" sx={{ fontWeight: 600, mt: 3, mb: 1 }}>
          Fichiers complémentaires
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {annexFiles.map((f, i) => (
            <FileCard key={i} file={f} onRemove={() => setAnnexFiles((prev) => prev.filter((_, j) => j !== i))}>
              <FileMetaControls file={f} onChange={(patch) => updateAnnexFile(i, patch)} />
            </FileCard>
          ))}
          <Button component="label" startIcon={<Add />} sx={{ alignSelf: 'flex-start' }}>
            Ajouter un fichier complémentaire
            <input type="file" hidden onChange={handleAnnexFile} />
          </Button>
        </Box>
      </DocumentSection>

      <ActionBar
        status={
          missing.length === 0 ? (
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
              Prêt à être vérifié
            </Typography>
          ) : (
            <Box>
              <Typography variant="body2" sx={{ color: showErrors ? 'error.main' : 'text.secondary', fontWeight: showErrors ? 600 : 400 }}>
                {`${missing.length} information${missing.length > 1 ? 's' : ''} obligatoire${missing.length > 1 ? 's' : ''} à compléter`}
              </Typography>
              {showErrors && (
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                  {missing.map((item) => item.label).join(' · ')}
                </Typography>
              )}
            </Box>
          )
        }
      >
        <Button variant="contained" disableElevation onClick={handleSubmit}>
          Vérifier le dépôt
        </Button>
      </ActionBar>
    </Box>
  )
}

// ─── Statuts du dépôt ─────────────────────────────────────────────────────────

const STATUS_VIEWS: Record<
  DepositStatusStep,
  {
    icon: typeof CheckCircle
    color: 'warning' | 'success' | 'error'
    title: string
    message: string
    detail: 'halId' | 'comment'
    retry?: string
    demoLabel: string
  }
> = {
  moderation: {
    icon: HourglassEmpty,
    color: 'warning',
    title: 'En cours de modération',
    message: 'Votre dépôt attend la validation de la modération de HAL, en général sous 1 à 5 jours ouvrés.',
    detail: 'halId',
    demoLabel: 'En modération',
  },
  accepted: {
    icon: CheckCircle,
    color: 'success',
    title: 'Dépôt accepté',
    message: 'Votre publication est en ligne dans HAL.',
    detail: 'halId',
    demoLabel: 'Accepté',
  },
  rejected: {
    icon: ErrorOutline,
    color: 'error',
    title: 'Dépôt refusé',
    message: 'La modération de HAL n’a pas accepté ce dépôt.',
    detail: 'comment',
    retry: 'Déposer à nouveau',
    demoLabel: 'Refusé',
  },
  changes_requested: {
    icon: WarningAmber,
    color: 'warning',
    title: 'Modifications demandées',
    message: 'La modération de HAL demande des corrections avant de valider le dépôt.',
    detail: 'comment',
    retry: 'Modifier et déposer à nouveau',
    demoLabel: 'Modifications demandées',
  },
}

// ─── Mise en page ─────────────────────────────────────────────────────────────

const dateLabel = (documentType: string) =>
  ['THESE', 'HDR'].includes(documentType)
    ? 'Date de soutenance'
    : ['COMM', 'POSTER', 'PRESCONF'].includes(documentType)
      ? 'Date du congrès'
      : 'Date de publication'

function StepHeader({ step, title }: { step: 1 | 2; title: string }) {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary">{`Étape ${step} sur 2`}</Typography>
      <Typography variant="h6" component="h2">{title}</Typography>
    </Box>
  )
}

/** Ligne libellé / valeur des récapitulatifs, comme dans l'onglet Informations bibliographiques. */
function SummaryRow({ label, action, children }: { label: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: '180px minmax(0, 1fr) auto' },
        columnGap: 3,
        rowGap: 0.5,
        py: 1.5,
        borderTop: 1,
        borderColor: 'divider',
        '&:first-of-type': { borderTop: 0 },
      }}
    >
      <Typography component="dt" variant="body2" color="text.secondary" sx={{ fontWeight: 600, pt: 0.25 }}>
        {label}
      </Typography>
      <Box component="dd" sx={{ m: 0, minWidth: 0, fontSize: '0.875rem' }}>
        {children}
      </Box>
      {action && <Box sx={{ alignSelf: 'start' }}>{action}</Box>}
    </Box>
  )
}

function EditLink({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <Link component="button" underline="hover" onClick={onClick} aria-label={label} sx={{ fontSize: '0.875rem' }}>
      Modifier
    </Link>
  )
}

/** Barre d'actions collée en bas de l'écran. */
function ActionBar({ status, children }: { status?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Paper
      elevation={4}
      sx={{
        position: 'sticky',
        bottom: 16,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 1.5,
        flexWrap: 'wrap',
        px: 2.5,
        py: 1.5,
        borderRadius: 3,
        border: 1,
        borderColor: 'divider',
      }}
    >
      {status && <Box sx={{ flex: 1, minWidth: 200 }}>{status}</Box>}
      {children}
    </Paper>
  )
}

function DemoBar({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ pt: 1.5, pr: 9, borderTop: 1, borderColor: 'divider', borderTopStyle: 'dashed', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75 }}>
      <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', mr: 0.5 }}>Simuler :</Typography>
      {children}
    </Box>
  )
}

function FileCard({ file, isMain, onRemove, children }: { file: AttachedFile; isMain?: boolean; onRemove: () => void; children: React.ReactNode }) {
  return (
    <Box sx={{ border: 1, borderColor: isMain ? 'primary.main' : 'divider', borderRadius: 3, p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AttachFile sx={{ color: isMain ? 'primary.main' : 'text.secondary' }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{file.name}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>{formatFileSize(file.size)}</Typography>
        </Box>
        <IconButton onClick={onRemove} size="small" aria-label={`Retirer ${file.name}`}>
          <Close fontSize="small" />
        </IconButton>
      </Box>
      {children}
    </Box>
  )
}

function ReviewFile({ file, isMain }: { file: AttachedFile; isMain?: boolean }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1, '&:last-of-type': { mb: 0 } }}>
      <AttachFile sx={{ fontSize: 16, color: isMain ? 'primary.main' : 'text.secondary', mt: 0.25 }} />
      <Box>
        <Typography variant="body2">
          {`${file.name} (${formatFileSize(file.size)})`}
          {isMain && <strong>{' — principal'}</strong>}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
          {[
            labelOf(FILE_KINDS, file.kind),
            labelOf(VISIBILITY_OPTIONS, file.visibility),
            file.license ? labelOf(LICENSES, file.license) : 'Sans licence',
          ].join(' · ')}
        </Typography>
      </Box>
    </Box>
  )
}

// ─── Métadonnées par fichier (origine, type, visibilité, licence) ───────────────

function FileMetaControls({
  file,
  requireLicense,
  showErrors,
  onChange,
}: {
  file: AttachedFile
  requireLicense?: boolean
  showErrors?: boolean
  onChange: (patch: Partial<AttachedFile>) => void
}) {
  return (
    <Box
      sx={{
        mt: 2,
        pt: 2,
        borderTop: 1,
        borderColor: 'divider',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        gap: 2,
      }}
    >
      <FormControl size="small" fullWidth>
        <InputLabel>{'Origine du fichier'}</InputLabel>
        <Select
          value={file.origin}
          label="Origine du fichier"
          onChange={(e) => onChange({ origin: e.target.value })}
        >
          {FILE_ORIGINS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <InputLabel>{'Type de fichier'}</InputLabel>
        <Select
          value={file.kind}
          label="Type de fichier"
          onChange={(e) => onChange({ kind: e.target.value })}
        >
          {FILE_KINDS.map((k) => (
            <MenuItem key={k.value} value={k.value}>
              {k.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth>
        <InputLabel>{'Visibilité du fichier'}</InputLabel>
        <Select
          value={file.visibility}
          label="Visibilité du fichier"
          onChange={(e) => onChange({ visibility: e.target.value })}
        >
          {VISIBILITY_OPTIONS.map((v) => (
            <MenuItem key={v.value} value={v.value}>
              {v.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" fullWidth error={requireLicense && showErrors && !file.license}>
        <InputLabel>{requireLicense ? 'Licence *' : 'Licence'}</InputLabel>
        <Select
          value={file.license}
          label={requireLicense ? 'Licence *' : 'Licence'}
          onChange={(e) => onChange({ license: e.target.value })}
        >
          {LICENSES.map((l) => (
            <MenuItem key={l.value} value={l.value}>
              {l.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
}
