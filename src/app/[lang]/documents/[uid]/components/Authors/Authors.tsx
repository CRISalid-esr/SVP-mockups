'use client'

import useStore from '@/stores/global_store'
import { BibliographicPlatform } from '@/types/BibliographicPlatform'
import { Contribution } from '@/types/Contribution'
import { publicPath } from '@/utils/publicPath'
import {
  Add,
  CheckCircle,
  Close,
  DeleteOutline,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreHoriz,
  Save,
  Search,
  WarningAmber,
} from '@mui/icons-material'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  ButtonBase,
  Card,
  Chip,
  CircularProgress,
  Collapse,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  Link,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha, Theme } from '@mui/material/styles'
import * as Lingui from '@lingui/core'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

// ─── Constants ────────────────────────────────────────────────────────────────

// Jetons du thème : la page suit le mode clair ou sombre.
const TEAL = 'primary.main'
const TEXT = 'text.primary'
const MUTED = 'text.secondary'
const WARN = 'warning.dark'
const SUCCESS = 'success.main'

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_HAL_STRUCTURES = [
  { id: '102312', name: 'UMR LPED – Laboratoire Population Environnement Développement', shortName: 'UMR LPED', ror: '00znkfx48' },
  { id: '102313', name: 'Laboratoire des sciences du numérique à Nantes', shortName: 'LS2N', ror: '04ezmvf85' },
  { id: '102314', name: 'EHESS - École des hautes études en sciences sociales', shortName: 'EHESS', ror: '011kdr723' },
  { id: '102315', name: 'INRAE Montpellier', shortName: 'INRAE', ror: '003vg9w96' },
]

// Rôles issus du référentiel LocRelator (http://id.loc.gov/vocabulary/relators)
const AUTHOR_ROLES = [
  { value: 'author', label: 'Auteur' },
  { value: 'editor', label: 'Éditeur scientifique' },
  { value: 'translator', label: 'Traducteur' },
  { value: 'compiler', label: 'Compilateur' },
  { value: 'contributor', label: 'Contributeur' },
  { value: 'researcher', label: 'Chercheur' },
  { value: 'illustrator', label: 'Illustrateur' },
  { value: 'thesis advisor', label: 'Directeur de thèse' },
  { value: 'degree supervisor', label: 'Encadrant' },
  { value: 'interviewee', label: 'Interviewé' },
  { value: 'interviewer', label: 'Intervieweur' },
  { value: 'data manager', label: 'Gestionnaire de données' },
  { value: 'other', label: 'Autre' },
]

// ─── Types ────────────────────────────────────────────────────────────────────

type IdHalCandidate = {
  idhal: string
  fullName: string
  affiliations: string
  publications: number
  matchScore: number
  orcid?: string
}

type StructureCandidate = {
  halStructureId: string
  shortName: string
  fullName: string
  tutelles?: string
  researchers?: number
  ror?: string
  matchScore: number
}

type Affiliation = {
  halStructureId: string
  halStructureName: string
  shortName?: string
  ror?: string
  importedText?: string
  structureCandidates?: StructureCandidate[]
}

type AuthorState = {
  uid: string
  displayName: string
  roles: string[]
  rolesAreDefault?: boolean
  rank?: number
  external: boolean
  orcid?: string
  idref?: string
  idhal?: string
  scopus?: string
  idhalCandidates?: IdHalCandidate[]
  affiliations: Affiliation[]
}

// ─── Mock alignment initializer ───────────────────────────────────────────────

function initFromContributions(contributions: Contribution[]): AuthorState[] {
  return contributions.map((c, i) => {
    const uid = c.person.uid ?? `author-${i}`
    const displayName = c.person.displayName ?? ''
    const rank = c.rank != null ? c.rank : undefined
    const rolesAreDefault = !c.roles || c.roles.length === 0
    const roles = rolesAreDefault ? ['contributor'] : (c.roles as string[])
    const external = c.person.external ?? false
    const pos = rank ?? i + 1

    if (pos === 1) {
      return {
        uid, displayName, roles, rolesAreDefault, rank, external,
        orcid: '0000-0001-2345-6789',
        idhal: 'jean-dupont',
        affiliations: [
          { halStructureId: '102313', halStructureName: 'Laboratoire des sciences du numérique à Nantes', shortName: 'LS2N', ror: '04ezmvf85' },
        ],
      }
    }
    if (pos === 2) {
      return {
        uid, displayName, roles, rolesAreDefault, rank, external,
        orcid: '0000-0002-9876-5432',
        idhalCandidates: [
          { idhal: 'sophie-martin', fullName: 'Sophie Martin', affiliations: 'LS2N, Nantes · IRD', publications: 12, matchScore: 92, orcid: '0000-0002-9876-5432' },
          { idhal: 'sophie-martin-inrae', fullName: 'Sophie Martin', affiliations: 'INRAE Montpellier', publications: 3, matchScore: 71 },
          { idhal: 'sophie-martin-cnrs', fullName: 'Sophie J. Martin', affiliations: 'CNRS · UMR 7194', publications: 8, matchScore: 64 },
        ],
        affiliations: [
          {
            halStructureId: '', halStructureName: '', importedText: 'Laboratoire des sciences du numérique',
            structureCandidates: [
              { halStructureId: '102313', shortName: 'LS2N', fullName: 'Laboratoire des sciences du numérique à Nantes', tutelles: 'Nantes Université · CNRS · École Centrale · IMT Atl.', researchers: 470, ror: '04ezmvf85', matchScore: 92 },
              { halStructureId: '999', shortName: 'LSN', fullName: 'Laboratoire des sciences du numérique', tutelles: 'Université Paris-Saclay', researchers: 64, ror: '0395g4t98', matchScore: 71 },
            ],
          },
        ],
      }
    }
    if (pos === 3) {
      // Pierre Bernard : pas de rôle dans les données source → fonction par défaut
      return { uid, displayName, roles: ['contributor'], rolesAreDefault: true, rank, external, affiliations: [] }
    }
    return {
      uid, displayName, roles, rolesAreDefault, rank, external,
      idhal: 'anne-leclerc',
      affiliations: [
        { halStructureId: '102314', halStructureName: 'EHESS - École des hautes études en sciences sociales', shortName: 'EHESS', ror: '011kdr723' },
      ],
    }
  })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function matchColor(score: number) {
  if (score >= 85) return SUCCESS
  if (score >= 65) return 'warning.dark'
  return MUTED
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function avatarColor(name: string) {
  const colors = ['#4F7942', '#2E6DA4', '#8B5E3C', '#6B4F9E', '#B5451B']
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff
  return colors[hash % colors.length]
}

// ─── HAL Author Search ────────────────────────────────────────────────────────

type HalAuthorOption = {
  form: string
  emailDomain?: string
  idHal?: string
  orcid?: string
  idRef?: string
  isNew?: true
}

type HalApiDoc = {
  fullName_s?: string
  fullName_sci?: string
  emailDomain_s?: string | string[]
  idHal_s?: string
  orcidId_s?: string | string[]
  idref_s?: string | string[]
}

function useHalAuthorSearch(query: string) {
  const [options, setOptions] = useState<HalAuthorOption[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) { setOptions([]); return }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const url = `https://api.archives-ouvertes.fr/ref/author/?q=${encodeURIComponent(q)}&rows=12&fl=fullName_s,fullName_sci,emailDomain_s,idHal_s,orcidId_s,idref_s&wt=json`
        const res = await fetch(url, { signal: controller.signal })
        const json = await res.json()
        const identifierScore = (o: HalAuthorOption) =>
          (o.idHal ? 2 : 0) + (o.orcid ? 2 : 0) + (o.idRef ? 2 : 0) + (o.emailDomain ? 1 : 0)
        const docs: HalAuthorOption[] = (json?.response?.docs ?? [])
          .filter((d: HalApiDoc) => d.fullName_s)
          .map((d: HalApiDoc): HalAuthorOption => {
            const emailDomain = Array.isArray(d.emailDomain_s) ? d.emailDomain_s[0] : d.emailDomain_s
            const orcidRaw = Array.isArray(d.orcidId_s) ? d.orcidId_s[0] : d.orcidId_s
            const orcid = orcidRaw ? orcidRaw.replace('https://orcid.org/', '') : undefined
            const idRef = Array.isArray(d.idref_s) ? d.idref_s[0] : d.idref_s
            return { form: d.fullName_s!, emailDomain, idHal: d.idHal_s, orcid, idRef }
          })
          .sort((a: HalAuthorOption, b: HalAuthorOption) => identifierScore(b) - identifierScore(a))
        setOptions(docs)
      } catch { /* aborted or network error */ }
      finally { setLoading(false) }
    }, 350)

    return () => { clearTimeout(timer); controller.abort() }
  }, [query])

  return { options, loading }
}

function HalAuthorOptionRow({ option }: { option: HalAuthorOption }) {
  const isIdentified = !!(option.idHal || option.orcid || option.idRef)
  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, flexWrap: 'wrap', lineHeight: 1.5 }}>
      <Typography component="span" sx={{ fontWeight: isIdentified ? 700 : 400, color: isIdentified ? TEAL : TEXT, fontSize: '0.875rem' }}>
        {option.form}
      </Typography>
      {option.emailDomain && (
        <Typography component="span" sx={{ color: MUTED, fontSize: '0.75rem' }}>@{option.emailDomain}</Typography>
      )}
      {option.idHal && (
        <Typography component="span" sx={{ color: MUTED, fontSize: '0.75rem' }}>{option.idHal}</Typography>
      )}
      {option.orcid && (
        <Typography component="span" sx={{ color: MUTED, fontSize: '0.75rem' }}>{option.orcid}</Typography>
      )}
      {option.idRef && (
        <Typography component="span" sx={{ color: MUTED, fontSize: '0.75rem' }}>IdRef:{option.idRef}</Typography>
      )}
    </Box>
  )
}

function HalAuthorSearchField({ onSelect }: { onSelect: (opt: HalAuthorOption) => void }) {
  const [inputValue, setInputValue] = useState('')
  const { options, loading } = useHalAuthorSearch(inputValue)

  const allOptions: HalAuthorOption[] = inputValue.trim().length >= 2
    ? [{ form: inputValue, isNew: true }, ...options]
    : []

  return (
    <Autocomplete<HalAuthorOption>
      options={allOptions}
      loading={loading}
      inputValue={inputValue}
      onInputChange={(_, val, reason) => { if (reason !== 'reset') setInputValue(val) }}
      getOptionLabel={(opt) => opt.form}
      filterOptions={(x) => x}
      isOptionEqualToValue={(a, b) => a.isNew === b.isNew && a.form === b.form && a.idHal === b.idHal}
      noOptionsText={inputValue.trim().length >= 2 ? 'Aucun résultat dans HAL' : 'Tapez pour rechercher…'}
      onChange={(_, value) => {
        if (!value) return
        onSelect(value)
        setInputValue('')
      }}
      renderOption={(props, option) => {
        const { key, ...rest } = props as { key: React.Key } & React.HTMLAttributes<HTMLLIElement>
        return (
          <Box component="li" key={key} {...rest}>
            {option.isNew
              ? <Typography sx={{ color: TEAL, fontSize: '0.875rem', fontStyle: 'italic' }}>Ajouter un nouvel auteur</Typography>
              : <HalAuthorOptionRow option={option} />
            }
          </Box>
        )
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          fullWidth
          placeholder="Rechercher dans HAL"
          sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <Search sx={{ fontSize: 16, color: MUTED, mr: 0.5, flexShrink: 0 }} />
                {params.InputProps.startAdornment}
              </>
            ),
            endAdornment: (
              <>
                {loading && <CircularProgress size={14} sx={{ color: TEAL, mr: 0.5 }} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  )
}

// ─── HAL Structure Search ─────────────────────────────────────────────────────

type HalStructureValidity = 'VALID' | 'INCOMING' | 'OLD'

type HalStructureOption = {
  id: string
  name: string
  shortName?: string
  ror?: string
  type?: string
  valid?: HalStructureValidity
}

type HalStructureApiDoc = {
  docid?: number | string
  name_s?: string
  acronym_s?: string | string[]
  ror_s?: string | string[]
  type_s?: string | string[]
  valid_s?: string
}

function useHalStructureSearch(query: string) {
  const [options, setOptions] = useState<HalStructureOption[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) { setOptions([]); return }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const url = `https://api.archives-ouvertes.fr/ref/structure/?q=${encodeURIComponent(q)}&rows=12&fl=docid,name_s,acronym_s,ror_s,type_s,valid_s&wt=json`
        const res = await fetch(url, { signal: controller.signal })
        const json = await res.json()
        const validityScore = (v?: HalStructureValidity) => v === 'VALID' ? 100 : v === 'INCOMING' ? 50 : 0
        const identifierScore = (o: HalStructureOption) =>
          validityScore(o.valid) + (o.ror ? 2 : 0) + (o.shortName ? 1 : 0)
        const docs: HalStructureOption[] = (json?.response?.docs ?? [])
          .filter((d: HalStructureApiDoc) => d.name_s)
          .map((d: HalStructureApiDoc): HalStructureOption => {
            const shortName = Array.isArray(d.acronym_s) ? d.acronym_s[0] : d.acronym_s
            const ror = Array.isArray(d.ror_s) ? d.ror_s[0] : d.ror_s
            const type = Array.isArray(d.type_s) ? d.type_s[0] : d.type_s
            const valid = d.valid_s as HalStructureValidity | undefined
            return { id: String(d.docid ?? ''), name: d.name_s!, shortName, ror, type, valid }
          })
          .sort((a: HalStructureOption, b: HalStructureOption) => identifierScore(b) - identifierScore(a))
        setOptions(docs)
      } catch { /* aborted or network error */ }
      finally { setLoading(false) }
    }, 350)

    return () => { clearTimeout(timer); controller.abort() }
  }, [query])

  return { options, loading }
}

function HalStructureOptionRow({ option }: { option: HalStructureOption }) {
  const nameColor = option.valid === 'VALID' ? SUCCESS : option.valid === 'INCOMING' ? WARN : MUTED
  const isBold = option.valid === 'VALID' || option.valid === 'INCOMING'
  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, flexWrap: 'wrap', lineHeight: 1.5 }}>
      <Typography component="span" sx={{ fontWeight: isBold ? 700 : 400, color: nameColor, fontSize: '0.875rem' }}>
        {option.name}
      </Typography>
      {option.shortName && (
        <Typography component="span" sx={{ color: MUTED, fontSize: '0.75rem' }}>{option.shortName}</Typography>
      )}
      {option.ror && (
        <Typography component="span" sx={{ color: MUTED, fontSize: '0.75rem' }}>ROR {option.ror}</Typography>
      )}
    </Box>
  )
}

function HalStructureSearchField({ placeholder = 'Rechercher dans HAL…', onSelect }: {
  placeholder?: string
  onSelect: (opt: HalStructureOption) => void
}) {
  const [inputValue, setInputValue] = useState('')
  const { options, loading } = useHalStructureSearch(inputValue)

  return (
    <Autocomplete<HalStructureOption>
      size="small"
      options={inputValue.trim().length >= 2 ? options : []}
      loading={loading}
      inputValue={inputValue}
      onInputChange={(_, val, reason) => { if (reason !== 'reset') setInputValue(val) }}
      getOptionLabel={(opt) => opt.name}
      filterOptions={(x) => x}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      noOptionsText={inputValue.trim().length >= 2 ? 'Aucun résultat dans HAL' : 'Tapez pour rechercher…'}
      onChange={(_, value) => {
        if (!value) return
        onSelect(value)
        setInputValue('')
      }}
      renderOption={(props, option) => {
        const { key, ...rest } = props as { key: React.Key } & React.HTMLAttributes<HTMLLIElement>
        return (
          <Box component="li" key={key} {...rest}>
            <HalStructureOptionRow option={option} />
          </Box>
        )
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          fullWidth
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <Search sx={{ fontSize: 16, color: MUTED, mr: 0.5, flexShrink: 0 }} />
                {params.InputProps.startAdornment}
              </>
            ),
            endAdornment: (
              <>
                {loading && <CircularProgress size={14} sx={{ color: TEAL, mr: 0.5 }} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const warnTint = (theme: Theme) => alpha(theme.palette.warning.main, 0.08)
const warnBorder = (theme: Theme) => alpha(theme.palette.warning.main, 0.45)

function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  return (
    <Box sx={{
      width: size, height: size, borderRadius: '50%',
      bgcolor: avatarColor(name), color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
    }}>
      {initials(name)}
    </Box>
  )
}

/** Initiales de l'auteur dans la liste, aux couleurs de la marque. */
function AuthorBadge({ name }: { name: string }) {
  return (
    <Box
      aria-hidden
      sx={{
        width: 36, height: 36, borderRadius: 2, flexShrink: 0,
        bgcolor: 'navActive', color: 'primary.main',
        display: 'grid', placeItems: 'center',
        fontSize: '0.8125rem', fontWeight: 600,
      }}
    >
      {initials(name)}
    </Box>
  )
}

const IDENTIFIER_ICONS = [
  { key: 'orcid', label: 'ORCID', icon: '/icons/orcid.png' },
  { key: 'idref', label: 'IdRef', icon: '/icons/idref.png' },
  { key: 'idhal', label: 'IdHAL', icon: '/icons/hal.png' },
  { key: 'scopus', label: 'Scopus', icon: '/icons/scopus.png' },
] as const

function IdentifierIcons({ author, size = 16 }: { author: AuthorState; size?: number }) {
  return (
    <>
      {IDENTIFIER_ICONS.map(({ key, label, icon }) => {
        const value = author[key]
        if (!value || value.startsWith('_')) return null
        return (
          <Tooltip key={key} title={`${label} : ${value}`}>
            <Box component="img" src={publicPath(icon)} alt={label} sx={{ width: size, height: size }} />
          </Tooltip>
        )
      })}
    </>
  )
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="subtitle2" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
      {children}
    </Typography>
  )
}

const isAffiliationMissing = (aff: Affiliation) => !aff.halStructureId || !!aff.importedText

// ─── Component ────────────────────────────────────────────────────────────────

const Authors = () => {
  const { selectedDocument = null } = useStore((state) => state.document)
  const contributions: Contribution[] = selectedDocument?.contributions ?? []

  const [authors, setAuthors] = useState<AuthorState[]>(() =>
    initFromContributions(contributions),
  )
  const [isDirty, setIsDirty] = useState(false)
  const [showHalReminder, setShowHalReminder] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const isInHal = !!selectedDocument?.records.some(
    (record) => record.platform === BibliographicPlatform.HAL,
  )

  const handleSave = () => {
    if (!ranksFromSource) {
      setAuthors((prev) => prev.map((a) => ({ ...a, rank: undefined })))
    }
    // « Enregistrer » ne modifie que SoVisu+ : on le dit, et on mène vers HAL.
    if (isDirty && isInHal) setShowHalReminder(true)
    setIsDirty(false)
  }

  const goToHalUpdate = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', 'hal_update')
    router.push(`/${Lingui.i18n.locale}/documents/${selectedDocument?.uid}?${params.toString()}`)
  }
  const [ranksFromSource, setRanksFromSource] = useState(() =>
    contributions.some((c) => c.rank != null),
  )
  const [expandedCandidates, setExpandedCandidates] = useState<Record<string, boolean>>({})
  const [showIdhalCandidates, setShowIdhalCandidates] = useState<Record<string, boolean>>({})
  const [showAffCandidates, setShowAffCandidates] = useState<Record<string, Record<number, boolean>>>({})

  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const { totalAuthors, totalAff } = useMemo(() => {
    let totalAff = 0
    authors.forEach((a) => { totalAff += a.affiliations.length })
    return { totalAuthors: authors.length, totalAff }
  }, [authors])

  // ── Helpers ────────────────────────────────────────────────────────────────

  const setAuthorsDirty = (fn: (prev: AuthorState[]) => AuthorState[]) => {
    setAuthors(fn)
    setIsDirty(true)
  }

  const resetAuthors = () => {
    setAuthors(initFromContributions(contributions))
    setIsDirty(false)
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  const update = (uid: string, patch: Partial<AuthorState>) =>
    setAuthorsDirty((prev) => prev.map((a) => (a.uid === uid ? { ...a, ...patch } : a)))

  const remove = (uid: string) =>
    setAuthorsDirty((prev) => prev.filter((a) => a.uid !== uid))

  const move = (uid: string, dir: 'up' | 'down') => {
    setAuthorsDirty((prev) => {
      const idx = prev.findIndex((a) => a.uid === uid)
      if (dir === 'up' && idx === 0) return prev
      if (dir === 'down' && idx === prev.length - 1) return prev
      const next = [...prev]
      const target = dir === 'up' ? idx - 1 : idx + 1
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next.map((a, i) => ({ ...a, rank: i + 1 }))
    })
  }

  const confirmIdhal = (uid: string, candidate: IdHalCandidate) =>
    update(uid, { idhal: candidate.idhal, orcid: candidate.orcid, idhalCandidates: undefined })

  const handleHalSelect = (uid: string, opt: HalAuthorOption) => {
    if (opt.isNew) {
      update(uid, { displayName: opt.form, idhalCandidates: undefined })
    } else {
      confirmIdhal(uid, {
        idhal: opt.idHal ?? `_ext_${uid}`,
        fullName: opt.form,
        affiliations: opt.emailDomain ? `@${opt.emailDomain}` : '',
        publications: 0,
        matchScore: 100,
        orcid: opt.orcid,
      })
    }
  }

  const alignAffiliation = (uid: string, affIdx: number, candidate: StructureCandidate) =>
    setAuthorsDirty((prev) =>
      prev.map((a) => {
        if (a.uid !== uid) return a
        const affs = [...a.affiliations]
        affs[affIdx] = { halStructureId: candidate.halStructureId, halStructureName: candidate.fullName, shortName: candidate.shortName, ror: candidate.ror }
        return { ...a, affiliations: affs }
      }),
    )

  const addAffiliation = (uid: string, structure: typeof MOCK_HAL_STRUCTURES[0]) =>
    setAuthorsDirty((prev) =>
      prev.map((a) =>
        a.uid !== uid ? a
          : { ...a, affiliations: [...a.affiliations, { halStructureId: structure.id, halStructureName: structure.name, shortName: structure.shortName, ror: structure.ror }] },
      ),
    )

  const removeAffiliation = (uid: string, affIdx: number) =>
    setAuthorsDirty((prev) =>
      prev.map((a) =>
        a.uid !== uid ? a : { ...a, affiliations: a.affiliations.filter((_, i) => i !== affIdx) },
      ),
    )

  const addAuthor = (atIndex?: number) => {
    const uid = `new-${Date.now()}`
    setAuthorsDirty((prev) => {
      const newEntry: AuthorState = { uid, displayName: 'Nouvel auteur', roles: ['contributor'], rolesAreDefault: true, external: true, affiliations: [] }
      if (ranksFromSource && atIndex !== undefined) {
        const next = [...prev]
        next.splice(atIndex, 0, newEntry)
        return next.map((a, i) => ({ ...a, rank: i + 1 }))
      }
      return [...prev, { ...newEntry, rank: ranksFromSource ? prev.length + 1 : undefined }]
    })
  }

  const toggleIdhalCandidates = (uid: string) =>
    setShowIdhalCandidates((prev) => ({ ...prev, [uid]: !prev[uid] }))

  const toggleAffCandidates = (uid: string, affIdx: number) =>
    setShowAffCandidates((prev) => ({
      ...prev,
      [uid]: { ...(prev[uid] ?? {}), [affIdx]: !(prev[uid]?.[affIdx]) },
    }))

  // ── Affichage : une ligne par auteur, le détail s'ouvre au clic ───────────
  const [open, setOpen] = useState<Record<string, boolean>>({})
  const [addingAff, setAddingAff] = useState<Record<string, boolean>>({})
  const [menu, setMenu] = useState<{ anchor: HTMLElement; uid: string; index: number } | null>(null)

  const toggleOpen = (uid: string) => setOpen((prev) => ({ ...prev, [uid]: !prev[uid] }))

  const statusOf = (author: AuthorState) => {
    const identified = !!(author.orcid || author.idref || author.idhal)
    const missingAff = author.affiliations.filter(isAffiliationMissing).length
    return { identified, missingAff, toComplete: !identified || missingAff > 0 || !!author.rolesAreDefault }
  }
  const identifiedCount = authors.filter((a) => statusOf(a).identified).length
  const toCompleteCount = authors.filter((a) => statusOf(a).toComplete).length

  const roleLabels = (author: AuthorState) =>
    author.roles.map((role) => AUTHOR_ROLES.find((r) => r.value === role)?.label ?? role).join(', ')

  const menuAuthor = menu ? authors.find((a) => a.uid === menu.uid) : undefined

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* ── En-tête : où en est-on ? ──────────────────────────────────────── */}
      <Card component="section" sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" component="h2">Auteurs</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {`${totalAuthors} auteur${totalAuthors > 1 ? 's' : ''} · ${identifiedCount} identifié${identifiedCount > 1 ? 's' : ''} · ${totalAff} affiliation${totalAff > 1 ? 's' : ''}`}
            </Typography>
            {toCompleteCount > 0 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                <Chip size="small" color="warning" variant="outlined" icon={<WarningAmber />} label={`${toCompleteCount} à compléter`} />
                <Link
                  component="button"
                  underline="hover"
                  onClick={() => setOpen(Object.fromEntries(authors.filter((a) => statusOf(a).toComplete).map((a) => [a.uid, true])))}
                  sx={{ fontSize: '0.875rem' }}
                >
                  Les afficher
                </Link>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.5 }}>
                <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
                <Typography variant="body2">Tous les auteurs sont identifiés et rattachés à leurs structures.</Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <FormControlLabel
              control={<Switch size="small" checked={ranksFromSource} onChange={(e) => setRanksFromSource(e.target.checked)} />}
              label={<Typography variant="body2">Ordre des auteurs défini</Typography>}
            />
            <Button variant="outlined" startIcon={<Add />} onClick={() => addAuthor()}>
              Ajouter un auteur
            </Button>
          </Box>
        </Box>
      </Card>

      {/* ── Liste des auteurs ─────────────────────────────────────────────── */}
      <Card component="section" aria-label="Liste des auteurs" sx={{ p: 0, overflow: 'hidden' }}>
        {authors.map((author, index) => {
          const { identified, missingAff } = statusOf(author)
          const isOpen = !!open[author.uid]
          const needsHalId = !author.idhal
          const hasCandidates = needsHalId && (author.idhalCandidates?.length ?? 0) > 0
          const candidatesVisible = showIdhalCandidates[author.uid]
          const expanded = expandedCandidates[author.uid]
          const detailId = `author-detail-${author.uid}`
          const affSummary = author.affiliations
            .filter((aff) => !isAffiliationMissing(aff))
            .map((aff) => aff.shortName ?? aff.halStructureName)
            .join(', ')

          return (
            <Box key={author.uid} sx={{ borderTop: index === 0 ? 0 : 1, borderColor: 'divider' }}>
              {/* Ligne résumée */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 1.5, '&:hover': { bgcolor: 'navHover' } }}>
                <ButtonBase
                  onClick={() => toggleOpen(author.uid)}
                  aria-expanded={isOpen}
                  aria-controls={detailId}
                  sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 2, textAlign: 'left', px: 3, py: 2 }}
                >
                  {ranksFromSource && (
                    <Typography variant="body2" color="text.secondary" sx={{ width: 20, textAlign: 'right', fontWeight: 600, flexShrink: 0 }}>
                      {index + 1}
                    </Typography>
                  )}
                  <AuthorBadge name={author.displayName} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                      <Typography sx={{ fontWeight: 600 }}>{author.displayName}</Typography>
                      <IdentifierIcons author={author} size={14} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {roleLabels(author)}
                      {affSummary && ` · ${affSummary}`}
                      {missingAff > 0 && (
                        <Box component="span" sx={{ color: 'warning.dark' }}>
                          {` · ${missingAff} affiliation${missingAff > 1 ? 's' : ''} à retrouver`}
                        </Box>
                      )}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    variant="outlined"
                    color={identified ? 'success' : 'warning'}
                    label={identified ? 'Identifié' : 'Non identifié'}
                    sx={{ flexShrink: 0, display: { xs: 'none', sm: 'inline-flex' } }}
                  />
                  <KeyboardArrowDown
                    aria-hidden
                    sx={{ color: 'text.secondary', flexShrink: 0, transition: 'transform 150ms', transform: isOpen ? 'rotate(180deg)' : 'none' }}
                  />
                </ButtonBase>
                <IconButton
                  size="small"
                  aria-label={`Actions sur ${author.displayName}`}
                  onClick={(event) => setMenu({ anchor: event.currentTarget, uid: author.uid, index })}
                >
                  <MoreHoriz fontSize="small" />
                </IconButton>
              </Box>

              {/* Détail */}
              <Collapse in={isOpen} unmountOnExit>
                <Box
                  id={detailId}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
                    gap: 3,
                    px: 3,
                    pb: 3,
                    pt: 1,
                  }}
                >
                  {/* Identité */}
                  <Box>
                    <SubTitle>Identité</SubTitle>
                    {identified ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5, flexWrap: 'wrap' }}>
                        <CheckCircle sx={{ color: 'success.main', fontSize: 18 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Auteur identifié</Typography>
                        <IdentifierIcons author={author} />
                        <Link
                          component="button"
                          underline="hover"
                          onClick={() => update(author.uid, { idhal: undefined, orcid: undefined, idref: undefined })}
                          sx={{ ml: 1, fontSize: '0.8125rem' }}
                        >
                          Changer d’auteur associé
                        </Link>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                        <WarningAmber sx={{ color: 'warning.dark', fontSize: 18 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.dark' }}>
                          Auteur non identifié : retrouvez-le dans HAL
                        </Typography>
                      </Box>
                    )}

                    {needsHalId && (
                      <Box
                        sx={{
                          p: 2, mb: 2, borderRadius: 3, border: 1,
                          borderColor: identified ? 'divider' : warnBorder,
                          bgcolor: identified ? 'transparent' : warnTint,
                        }}
                      >
                        {identified && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Pas encore d’IdHAL : associez-le à son compte HAL.
                          </Typography>
                        )}
                        <HalAuthorSearchField onSelect={(opt) => handleHalSelect(author.uid, opt)} />

                        {hasCandidates && !candidatesVisible && (
                          <Link
                            component="button"
                            underline="hover"
                            onClick={() => toggleIdhalCandidates(author.uid)}
                            sx={{ mt: 1.5, fontSize: '0.875rem', fontWeight: 600 }}
                          >
                            {`Voir ${author.idhalCandidates!.length} correspondance${author.idhalCandidates!.length > 1 ? 's' : ''} trouvée${author.idhalCandidates!.length > 1 ? 's' : ''} dans HAL`}
                          </Link>
                        )}

                        {hasCandidates && candidatesVisible && (
                          <Box sx={{ mt: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                {`Correspondances dans HAL (${author.idhalCandidates!.length})`}
                              </Typography>
                              <Link component="button" underline="hover" onClick={() => toggleIdhalCandidates(author.uid)} sx={{ fontSize: '0.8125rem' }}>
                                Masquer
                              </Link>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {author.idhalCandidates!.slice(0, expanded ? undefined : 3).map((candidate, ci) => (
                                <Box
                                  key={ci}
                                  sx={{
                                    bgcolor: 'background.paper', border: 1, borderColor: ci === 0 ? 'primary.main' : 'divider',
                                    borderRadius: 2, p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5,
                                  }}
                                >
                                  <Avatar name={candidate.fullName} size={32} />
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{candidate.fullName}</Typography>
                                      <Typography variant="body2" color="primary" sx={{ fontSize: '0.75rem' }}>{candidate.idhal}</Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                      {`${candidate.affiliations} · ${candidate.publications} publications dans HAL`}
                                    </Typography>
                                  </Box>
                                  <Tooltip title="Correspondance estimée">
                                    <Typography variant="body2" sx={{ color: matchColor(candidate.matchScore), fontWeight: 600, flexShrink: 0 }}>
                                      {`${candidate.matchScore} %`}
                                    </Typography>
                                  </Tooltip>
                                  <Button
                                    variant={candidate.matchScore >= 85 ? 'contained' : 'outlined'}
                                    disableElevation
                                    size="small"
                                    onClick={() => confirmIdhal(author.uid, candidate)}
                                    aria-label={`Confirmer ${candidate.idhal}`}
                                    sx={{ flexShrink: 0 }}
                                  >
                                    Confirmer
                                  </Button>
                                </Box>
                              ))}
                            </Box>
                            {author.idhalCandidates!.length > 3 && (
                              <Link
                                component="button"
                                underline="hover"
                                onClick={() => setExpandedCandidates((prev) => ({ ...prev, [author.uid]: !prev[author.uid] }))}
                                sx={{ mt: 1, fontSize: '0.8125rem' }}
                              >
                                {expanded ? 'Voir moins' : 'Voir toutes les correspondances'}
                              </Link>
                            )}
                          </Box>
                        )}
                      </Box>
                    )}

                    <FormControl size="small" fullWidth>
                      <InputLabel id={`roles-${author.uid}`}>Fonctions</InputLabel>
                      <Select
                        multiple
                        labelId={`roles-${author.uid}`}
                        value={author.roles}
                        onChange={(e) => {
                          const value = e.target.value as string[]
                          update(author.uid, { roles: value.length ? value : ['contributor'], rolesAreDefault: false })
                        }}
                        label="Fonctions"
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(selected as string[]).map((val) => (
                              <Chip key={val} size="small" label={AUTHOR_ROLES.find((r) => r.value === val)?.label ?? val} />
                            ))}
                          </Box>
                        )}
                        sx={author.rolesAreDefault ? { '& .MuiOutlinedInput-notchedOutline': { borderColor: 'warning.main' } } : undefined}
                      >
                        {AUTHOR_ROLES.map((r) => (
                          <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {author.rolesAreDefault && (
                      <Typography variant="body2" sx={{ mt: 0.75, color: 'warning.dark', fontSize: '0.8125rem' }}>
                        Fonction par défaut, absente des sources : à vérifier.
                      </Typography>
                    )}
                  </Box>

                  {/* Affiliations */}
                  <Box>
                    <SubTitle>Affiliations</SubTitle>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {author.affiliations.length === 0 && (
                        <Typography variant="body2" color="text.secondary">Aucune affiliation dans les sources.</Typography>
                      )}

                      {author.affiliations.map((aff, affIdx) => {
                        if (!isAffiliationMissing(aff)) {
                          return (
                            <Box key={affIdx} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <CheckCircle sx={{ color: 'success.main', fontSize: 18, mt: '1px', flexShrink: 0 }} />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{aff.shortName ?? aff.halStructureName}</Typography>
                                  {aff.ror && <Chip size="small" variant="outlined" label={`ROR ${aff.ror}`} sx={{ height: 20, fontSize: '0.6875rem' }} />}
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>{aff.halStructureName}</Typography>
                              </Box>
                              <Tooltip title="Retirer cette affiliation">
                                <IconButton size="small" aria-label={`Retirer ${aff.shortName ?? aff.halStructureName}`} onClick={() => removeAffiliation(author.uid, affIdx)}>
                                  <DeleteOutline fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          )
                        }

                        const affCandidatesVisible = showAffCandidates[author.uid]?.[affIdx]
                        return (
                          <Box key={affIdx} sx={{ border: 1, borderColor: warnBorder, bgcolor: warnTint, borderRadius: 2, p: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <WarningAmber sx={{ color: 'warning.dark', fontSize: 18 }} />
                              <Typography variant="body2" sx={{ color: 'warning.dark', fontWeight: 600, flex: 1 }}>
                                Structure à retrouver dans HAL
                              </Typography>
                              <Tooltip title="Retirer cette affiliation">
                                <IconButton size="small" aria-label="Retirer cette affiliation" onClick={() => removeAffiliation(author.uid, affIdx)}>
                                  <DeleteOutline fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {`Dans la source : « ${aff.importedText} »`}
                            </Typography>

                            {aff.structureCandidates?.length ? (
                              !affCandidatesVisible ? (
                                <Link component="button" underline="hover" onClick={() => toggleAffCandidates(author.uid, affIdx)} sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 1 }}>
                                  {`Voir ${aff.structureCandidates.length} structure${aff.structureCandidates.length > 1 ? 's' : ''} proche${aff.structureCandidates.length > 1 ? 's' : ''}`}
                                </Link>
                              ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
                                  {aff.structureCandidates.map((cand, ci) => (
                                    <Box
                                      key={ci}
                                      sx={{ bgcolor: 'background.paper', border: 1, borderColor: ci === 0 ? 'primary.main' : 'divider', borderRadius: 2, p: 1.5, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}
                                    >
                                      <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{`${cand.shortName} · ${cand.fullName}`}</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                          {[cand.tutelles && `Tutelles : ${cand.tutelles}`, cand.researchers && `${cand.researchers} chercheurs`, cand.ror && `ROR ${cand.ror}`]
                                            .filter(Boolean)
                                            .join(' · ')}
                                        </Typography>
                                      </Box>
                                      <Typography variant="body2" sx={{ color: matchColor(cand.matchScore), fontWeight: 600, flexShrink: 0 }}>
                                        {`${cand.matchScore} %`}
                                      </Typography>
                                      <Button
                                        variant={cand.matchScore >= 85 ? 'contained' : 'outlined'}
                                        disableElevation
                                        size="small"
                                        onClick={() => alignAffiliation(author.uid, affIdx, cand)}
                                        sx={{ flexShrink: 0 }}
                                      >
                                        Choisir
                                      </Button>
                                    </Box>
                                  ))}
                                  <Link component="button" underline="hover" onClick={() => toggleAffCandidates(author.uid, affIdx)} sx={{ fontSize: '0.8125rem', alignSelf: 'flex-start' }}>
                                    Masquer
                                  </Link>
                                </Box>
                              )
                            ) : null}

                            <HalStructureSearchField
                              placeholder="Chercher la structure dans HAL"
                              onSelect={(value) => alignAffiliation(author.uid, affIdx, { halStructureId: value.id, shortName: value.shortName ?? '', fullName: value.name, ror: value.ror, matchScore: 100 })}
                            />
                          </Box>
                        )
                      })}

                      {addingAff[author.uid] ? (
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <Box sx={{ flex: 1 }}>
                            <HalStructureSearchField
                              placeholder="Chercher une structure dans HAL"
                              onSelect={(value) => {
                                addAffiliation(author.uid, { id: value.id, name: value.name, shortName: value.shortName ?? '', ror: value.ror ?? '' })
                                setAddingAff((prev) => ({ ...prev, [author.uid]: false }))
                              }}
                            />
                          </Box>
                          <Button size="small" color="inherit" onClick={() => setAddingAff((prev) => ({ ...prev, [author.uid]: false }))}>
                            Annuler
                          </Button>
                        </Box>
                      ) : (
                        <Button
                          size="small"
                          startIcon={<Add />}
                          onClick={() => setAddingAff((prev) => ({ ...prev, [author.uid]: true }))}
                          sx={{ alignSelf: 'flex-start' }}
                        >
                          Ajouter une affiliation
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Collapse>
            </Box>
          )
        })}
      </Card>

      {/* ── Actions d'un auteur ───────────────────────────────────────────── */}
      <Menu anchorEl={menu?.anchor} open={Boolean(menu)} onClose={() => setMenu(null)}>
        {ranksFromSource && (
          <MenuItem disabled={menu?.index === 0} onClick={() => { if (menu) move(menu.uid, 'up'); setMenu(null) }}>
            <ListItemIcon><KeyboardArrowUp fontSize="small" /></ListItemIcon>
            <ListItemText>Monter</ListItemText>
          </MenuItem>
        )}
        {ranksFromSource && (
          <MenuItem disabled={menu?.index === authors.length - 1} onClick={() => { if (menu) move(menu.uid, 'down'); setMenu(null) }}>
            <ListItemIcon><KeyboardArrowDown fontSize="small" /></ListItemIcon>
            <ListItemText>Descendre</ListItemText>
          </MenuItem>
        )}
        {ranksFromSource && (
          <MenuItem onClick={() => { if (menu) addAuthor(menu.index + 1); setMenu(null) }}>
            <ListItemIcon><Add fontSize="small" /></ListItemIcon>
            <ListItemText>Insérer un auteur après</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => { if (menu) remove(menu.uid); setMenu(null) }} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteOutline fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>{menuAuthor ? `Retirer ${menuAuthor.displayName}` : 'Retirer'}</ListItemText>
        </MenuItem>
      </Menu>

      {/* ── Barre d'enregistrement, seulement s'il y a des modifications ──── */}
      {isDirty && (
        <Paper
          elevation={4}
          role="region"
          aria-label="Modifications non enregistrées"
          sx={{
            position: 'sticky', bottom: 16, zIndex: 10,
            display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap',
            px: 2.5, py: 1.5, borderRadius: 3, border: 1, borderColor: 'divider',
          }}
        >
          <Typography variant="body2" sx={{ flex: 1, minWidth: 180 }}>
            Modifications non enregistrées
          </Typography>
          <Button color="inherit" onClick={resetAuthors}>Annuler</Button>
          <Button variant="contained" disableElevation startIcon={<Save />} onClick={handleSave}>
            Enregistrer
          </Button>
        </Paper>
      )}

      <Snackbar
        open={showHalReminder}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="info"
          action={
            <>
              <Button color="inherit" size="small" onClick={goToHalUpdate} sx={{ whiteSpace: 'nowrap' }}>
                Compléter dans HAL
              </Button>
              <IconButton color="inherit" size="small" aria-label="Fermer" onClick={() => setShowHalReminder(false)}>
                <Close fontSize="small" />
              </IconButton>
            </>
          }
        >
          {`Enregistré dans SoVisu+. HAL n'a pas encore été modifié.`}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Authors
