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
} from '@mui/icons-material'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import * as Lingui from '@lingui/core'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL = '#006A61'
const TEAL_DARK = '#005550'
const TEAL_LIGHT = '#E8F5F4'
const SURFACE = '#F5F7F6'
const BORDER = '#E5E7E6'
const TEXT = '#2D3836'
const MUTED = '#6F7977'

// ─── Static data ──────────────────────────────────────────────────────────────

const HAL_DOMAINS = [
  { value: 'cs.AI', label: 'Intelligence Artificielle' },
  { value: 'cs.SE', label: 'Génie logiciel' },
  { value: 'math.PR', label: 'Probabilités' },
  { value: 'math.ST', label: 'Statistiques' },
  { value: 'shs.eco', label: 'Économie' },
  { value: 'shs.socio', label: 'Sociologie' },
  { value: 'shs.geo', label: 'Géographie' },
  { value: 'sde.es', label: 'Environnement' },
  { value: 'sdv.ee', label: 'Écologie' },
]

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
  { value: 'cc-by', label: 'CC BY – Attribution' },
  { value: 'cc-by-sa', label: 'CC BY-SA – Partage dans les mêmes conditions' },
  { value: 'cc-by-nd', label: 'CC BY-ND – Pas de modification' },
  { value: 'cc-by-nc', label: "CC BY-NC – Pas d'utilisation commerciale" },
  {
    value: 'cc-by-nc-nd',
    label: "CC BY-NC-ND – Pas d'utilisation commerciale, pas de modification",
  },
  { value: 'cc0', label: 'CC0 – Domaine public' },
]

const LANGUAGES = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'Anglais' },
  { value: 'es', label: 'Espagnol' },
  { value: 'de', label: 'Allemand' },
  { value: 'it', label: 'Italien' },
  { value: 'pt', label: 'Portugais' },
]

const AUTHOR_FUNCTIONS: Record<string, string> = {
  author: 'Auteur',
  auteur: 'Auteur',
  auteur_correspondant: 'Auteur correspondant',
  editor: 'Éditeur',
}

const DOC_TYPE_TO_HAL: Record<string, string> = {
  Article: 'ART',
  Book: 'OUV',
  Thesis: 'THESE',
  Conference: 'COMM',
  Report: 'REPORT',
}

type AttachedFile = { name: string; size: number }
type Step = 'form' | 'review' | 'uploading' | 'success'

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

  const [documentType, setDocumentType] = useState(
    selectedDocument ? (DOC_TYPE_TO_HAL[selectedDocument.documentType] ?? '') : '',
  )
  const [domains, setDomains] = useState<string[]>([])
  const [language, setLanguage] = useState('fr')
  const [productionDate, setProductionDate] = useState(
    selectedDocument?.publicationDate?.substring(0, 10) ??
      new Date().toISOString().substring(0, 10),
  )
  const [license, setLicense] = useState('cc-by')
  const [journal, setJournal] = useState('')
  const [conferenceTitle, setConferenceTitle] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [institution, setInstitution] = useState('')
  const [director, setDirector] = useState('')
  const [bookTitle, setBookTitle] = useState('')
  const [mainFile, setMainFile] = useState<AttachedFile | null>(null)
  const [annexFiles, setAnnexFiles] = useState<AttachedFile[]>([])

  if (!selectedDocument) return null

  const isInHal = selectedDocument.records.some(
    (r) => r.platform === BibliographicPlatform.HAL,
  )
  if (isInHal) return null

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

  const handleMainFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setMainFile({ name: f.name, size: f.size })
  }

  const handleAnnexFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setAnnexFiles((prev) => [...prev, { name: f.name, size: f.size }])
  }

  const validate = () => {
    if (!documentType) return 'Le type de document est obligatoire'
    if (domains.length === 0) return 'Au moins un domaine HAL est requis'
    if (!mainFile) return 'Le fichier PDF principal est obligatoire'
    if (documentType === 'ART' && !journal.trim()) return 'Le nom de la revue est obligatoire'
    if (['COMM', 'POSTER', 'PRESCONF'].includes(documentType) && !conferenceTitle.trim())
      return 'Le titre du congrès est obligatoire'
    return null
  }

  const handleSubmit = () => {
    if (!validate()) setStep('review')
  }

  const handleConfirm = () => {
    setStep('uploading')
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setStep('success'), 400)
          return 100
        }
        return prev + 10
      })
    }, 180)
  }

  // ─── Success ────────────────────────────────────────────────────────────────

  if (step === 'success') {
    return (
      <Box sx={{ p: 6, textAlign: 'center' }}>
        <CheckCircle sx={{ fontSize: 64, color: '#34A853', mb: 2 }} />
        <Typography variant="h6" sx={{ color: TEAL, fontWeight: 600, mb: 1 }}>
          {'Dépôt réussi !'}
        </Typography>
        <Typography sx={{ color: MUTED, mb: 4 }}>
          {'Votre publication a été déposée avec succès sur HAL.'}
        </Typography>
        <Button
          variant="contained"
          sx={{ bgcolor: TEAL, '&:hover': { bgcolor: TEAL_DARK }, textTransform: 'none' }}
          onClick={() => navigateTo('bibliographic_information')}
        >
          {'Retour aux informations bibliographiques'}
        </Button>
      </Box>
    )
  }

  // ─── Uploading ──────────────────────────────────────────────────────────────

  if (step === 'uploading') {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ color: TEAL, fontWeight: 600, mb: 3 }}>
          {'Dépôt en cours…'}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={uploadProgress}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: TEAL_LIGHT,
            '& .MuiLinearProgress-bar': { bgcolor: TEAL },
          }}
        />
        <Typography sx={{ color: MUTED, mt: 2, textAlign: 'center' }}>
          {`${uploadProgress}% — Envoi en cours…`}
        </Typography>
      </Box>
    )
  }

  // ─── Review ─────────────────────────────────────────────────────────────────

  if (step === 'review') {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ color: TEAL, fontWeight: 600, mb: 3 }}>
          {'Récapitulatif du dépôt'}
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          {'Vérifiez attentivement les informations avant de confirmer le dépôt sur HAL.'}
        </Alert>

        <Paper elevation={0} sx={{ bgcolor: SURFACE, p: 3, mb: 3, borderRadius: 2 }}>
          <ReviewField label="Titre" value={title} />
          <ReviewField
            label="Type de document"
            value={HAL_DOC_TYPES.find((t) => t.value === documentType)?.label ?? documentType}
          />

          {documentType === 'ART' && journal && (
            <ReviewField label="Revue" value={journal} />
          )}
          {['COMM', 'POSTER', 'PRESCONF'].includes(documentType) && conferenceTitle && (
            <ReviewField
              label="Congrès"
              value={
                city && country
                  ? `${conferenceTitle} (${city}, ${country})`
                  : conferenceTitle
              }
            />
          )}
          {['THESE', 'HDR', 'REPORT'].includes(documentType) && institution && (
            <ReviewField
              label={documentType === 'REPORT' ? 'Institution' : 'Organisme de délivrance'}
              value={institution}
            />
          )}
          {['THESE', 'HDR'].includes(documentType) && director && (
            <ReviewField
              label={documentType === 'THESE' ? 'Directeur de thèse' : 'Président du jury'}
              value={director}
            />
          )}
          {documentType === 'COUV' && bookTitle && (
            <ReviewField label="Titre de l'ouvrage" value={bookTitle} />
          )}

          <Box sx={{ mb: 2 }}>
            <ReviewLabel>{'Domaines HAL'}</ReviewLabel>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {domains.map((d) => (
                <Chip
                  key={d}
                  label={HAL_DOMAINS.find((x) => x.value === d)?.label}
                  size="small"
                  sx={{ bgcolor: TEAL_LIGHT, color: TEAL }}
                />
              ))}
            </Box>
          </Box>

          <Box>
            <ReviewLabel>{'Fichiers'}</ReviewLabel>
            {mainFile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <AttachFile sx={{ fontSize: 16, color: TEAL }} />
                <Typography sx={{ color: TEXT, fontSize: '0.875rem' }}>
                  {mainFile.name} ({formatFileSize(mainFile.size)}) —{' '}
                  <strong>{'Principal'}</strong>
                </Typography>
              </Box>
            )}
            {annexFiles.map((f, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <AttachFile sx={{ fontSize: 16, color: MUTED }} />
                <Typography sx={{ color: TEXT, fontSize: '0.875rem' }}>
                  {f.name} ({formatFileSize(f.size)})
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => setStep('form')}
            sx={{
              color: TEAL,
              borderColor: TEAL,
              textTransform: 'none',
              '&:hover': { borderColor: TEAL_DARK },
            }}
          >
            {'Modifier'}
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            sx={{ bgcolor: TEAL, textTransform: 'none', '&:hover': { bgcolor: TEAL_DARK } }}
          >
            {'Confirmer le dépôt'}
          </Button>
        </Box>
      </Box>
    )
  }

  // ─── Form ───────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h6" sx={{ color: TEAL, fontWeight: 600, mb: 0.5 }}>
        {'Déposer dans HAL'}
      </Typography>
      <Typography sx={{ color: MUTED, fontSize: '0.875rem', mb: 3 }}>
        {'Remplissez les métadonnées obligatoires pour déposer votre publication sur HAL.'}
      </Typography>

      <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
        {
          'Les informations de titre, résumé et auteurs sont récupérées depuis les onglets correspondants.'
        }
      </Alert>

      {/* Titre & Résumé — lecture seule */}
      <Section
        title="TITRE ET RÉSUMÉ"
        action={
          <Button
            size="small"
            onClick={() => navigateTo('bibliographic_information')}
            sx={{ color: TEAL, textTransform: 'none', fontWeight: 600 }}
          >
            {'Modifier dans Infos bibliographiques'}
          </Button>
        }
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: SURFACE,
            borderRadius: 2,
            border: `1px solid ${BORDER}`,
          }}
        >
          <Typography sx={{ color: TEXT, fontWeight: 600, mb: 1, fontSize: '0.9375rem' }}>
            {title || 'Aucun titre renseigné'}
          </Typography>
          <Typography
            sx={{
              color: MUTED,
              fontSize: '0.875rem',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {abstract || 'Aucun résumé renseigné'}
          </Typography>
        </Paper>
      </Section>

      {/* Auteurs — lecture seule */}
      <Section
        title="AUTEURS ET AFFILIATIONS"
        action={
          <Button
            size="small"
            onClick={() => navigateTo('authors')}
            sx={{ color: TEAL, textTransform: 'none', fontWeight: 600 }}
          >
            {"Modifier dans l'onglet Auteurs"}
          </Button>
        }
      >
        <Paper
          elevation={0}
          sx={{ p: 2, bgcolor: SURFACE, borderRadius: 2, border: `1px solid ${BORDER}` }}
        >
          {contributions.length === 0 ? (
            <Typography sx={{ color: MUTED, fontSize: '0.875rem' }}>
              {'Aucun auteur renseigné'}
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {contributions
                .slice()
                .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
                .map((c, i) => (
                  <Box key={i}>
                    <Typography sx={{ color: TEXT, fontWeight: 600, fontSize: '0.875rem' }}>
                      {c.person?.displayName ?? '—'}
                      <Typography
                        component="span"
                        sx={{ color: MUTED, fontSize: '0.75rem', ml: 1, fontWeight: 400, fontStyle: 'italic' }}
                      >
                        {`(${c.roles?.map((r) => AUTHOR_FUNCTIONS[r] ?? r).join(', ') || 'Auteur'})`}
                      </Typography>
                    </Typography>
                  </Box>
                ))}
            </Box>
          )}
        </Paper>
      </Section>

      <Typography
        variant="subtitle2"
        sx={{ color: MUTED, fontWeight: 600, mb: 2, letterSpacing: '0.05em' }}
      >
        {'MÉTADONNÉES DE DÉPÔT'}
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>{'Type de document *'}</InputLabel>
        <Select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          label="Type de document *"
        >
          {HAL_DOC_TYPES.map((t) => (
            <MenuItem key={t.value} value={t.value}>
              {t.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Autocomplete
        multiple
        options={HAL_DOMAINS}
        getOptionLabel={(o) => o.label}
        value={HAL_DOMAINS.filter((d) => domains.includes(d.value))}
        onChange={(_, v) => setDomains(v.map((x) => x.value))}
        renderInput={(params) => (
          <TextField {...params} label="Domaines HAL *" placeholder="Sélectionnez les domaines" />
        )}
        sx={{ mb: 3 }}
      />

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>{'Langue *'}</InputLabel>
        <Select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          label="Langue *"
        >
          {LANGUAGES.map((l) => (
            <MenuItem key={l.value} value={l.value}>
              {l.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label={
          ['THESE', 'HDR'].includes(documentType)
            ? 'Date de soutenance *'
            : ['COMM', 'POSTER', 'PRESCONF'].includes(documentType)
              ? 'Date de début du congrès *'
              : 'Date de publication *'
        }
        type="date"
        value={productionDate}
        onChange={(e) => setProductionDate(e.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
        fullWidth
        sx={{ mb: 3 }}
      />

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>{'Licence de diffusion *'}</InputLabel>
        <Select
          value={license}
          onChange={(e) => setLicense(e.target.value)}
          label="Licence de diffusion *"
        >
          {LICENSES.map((l) => (
            <MenuItem key={l.value} value={l.value}>
              {l.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {documentType === 'ART' && (
        <TextField
          label="Nom de la revue *"
          value={journal}
          onChange={(e) => setJournal(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
        />
      )}

      {['COMM', 'POSTER', 'PRESCONF'].includes(documentType) && (
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Titre du congrès *"
            value={conferenceTitle}
            onChange={(e) => setConferenceTitle(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Ville *"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              fullWidth
            />
            <TextField
              label="Pays *"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              fullWidth
            />
          </Box>
        </Box>
      )}

      {['THESE', 'HDR', 'REPORT'].includes(documentType) && (
        <TextField
          label={documentType === 'REPORT' ? 'Institution *' : 'Organisme de délivrance *'}
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
        />
      )}

      {['THESE', 'HDR'].includes(documentType) && (
        <TextField
          label={documentType === 'THESE' ? 'Directeur de thèse *' : 'Président du jury *'}
          value={director}
          onChange={(e) => setDirector(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
        />
      )}

      {documentType === 'COUV' && (
        <TextField
          label="Titre de l'ouvrage *"
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
        />
      )}

      <Divider sx={{ my: 3 }} />

      {/* Fichier principal */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ color: TEXT, fontWeight: 500, mb: 1.5 }}>
          {'Fichier principal (PDF) *'}
        </Typography>
        {mainFile ? (
          <Paper
            elevation={0}
            sx={{
              bgcolor: TEAL_LIGHT,
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachFile sx={{ color: TEAL }} />
              <Box>
                <Typography sx={{ color: TEAL, fontWeight: 500 }}>{mainFile.name}</Typography>
                <Typography sx={{ color: MUTED, fontSize: '0.75rem' }}>
                  {formatFileSize(mainFile.size)}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setMainFile(null)} size="small">
              <Close sx={{ fontSize: 18 }} />
            </IconButton>
          </Paper>
        ) : (
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUpload />}
            sx={{
              color: TEAL,
              borderColor: TEAL,
              textTransform: 'none',
              '&:hover': { borderColor: TEAL_DARK },
            }}
          >
            {'Choisir un fichier PDF'}
            <input type="file" hidden accept="application/pdf" onChange={handleMainFile} />
          </Button>
        )}
      </Box>

      {/* Fichiers complémentaires */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ color: TEXT, fontWeight: 500, mb: 1.5 }}>
          {'Fichiers complémentaires (optionnel)'}
        </Typography>
        {annexFiles.map((f, i) => (
          <Paper
            key={i}
            elevation={0}
            sx={{
              bgcolor: SURFACE,
              p: 2,
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachFile sx={{ color: MUTED }} />
              <Box>
                <Typography sx={{ color: TEXT, fontWeight: 500, fontSize: '0.875rem' }}>
                  {f.name}
                </Typography>
                <Typography sx={{ color: MUTED, fontSize: '0.75rem' }}>
                  {formatFileSize(f.size)}
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setAnnexFiles((prev) => prev.filter((_, j) => j !== i))}
              size="small"
            >
              <Close sx={{ fontSize: 18 }} />
            </IconButton>
          </Paper>
        ))}
        <Button
          variant="text"
          component="label"
          startIcon={<Add />}
          sx={{ color: TEAL, textTransform: 'none', '&:hover': { bgcolor: TEAL_LIGHT } }}
        >
          {'Ajouter un fichier complémentaire'}
          <input type="file" hidden onChange={handleAnnexFile} />
        </Button>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            bgcolor: TEAL,
            textTransform: 'none',
            px: 4,
            '&:hover': { bgcolor: TEAL_DARK },
          }}
        >
          {'Passer à la validation'}
        </Button>
      </Box>
    </Box>
  )
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

function Section({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1.5,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ color: MUTED, fontWeight: 600, letterSpacing: '0.05em' }}
        >
          {title}
        </Typography>
        {action}
      </Box>
      {children}
    </Box>
  )
}

function ReviewLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="subtitle2"
      sx={{
        color: MUTED,
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        fontWeight: 500,
        mb: 0.5,
      }}
    >
      {children}
    </Typography>
  )
}

function ReviewField({
  label,
  value,
}: {
  label: React.ReactNode
  value: React.ReactNode
}) {
  return (
    <Box sx={{ mb: 2 }}>
      <ReviewLabel>{label}</ReviewLabel>
      <Typography sx={{ color: TEXT }}>{value}</Typography>
    </Box>
  )
}
