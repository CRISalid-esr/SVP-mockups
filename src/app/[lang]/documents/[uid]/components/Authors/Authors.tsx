'use client'

import useStore from '@/stores/global_store'
import { Contribution } from '@/types/Contribution'
import { publicPath } from '@/utils/publicPath'
import {
  Add,
  AutoAwesome,
  CheckCircle,
  DeleteOutline,
  DragIndicator,
  KeyboardArrowDown,
  KeyboardArrowUp,
  OpenInNew,
  PersonAdd,
  Search,
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
  Tooltip,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL = '#006A61'
const TEAL_DARK = '#005550'
const TEAL_LIGHT = '#E8F5F4'
const SURFACE = '#F5F7F6'
const BORDER = '#E5E7E6'
const TEXT = '#2D3836'
const MUTED = '#6F7977'
const WARN = '#B45309'
const WARN_BG = '#FEF7E6'
const WARN_BORDER = '#F1D9A0'
const SUCCESS = '#34A853'

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_HAL_STRUCTURES = [
  { id: '102312', name: 'UMR LPED – Laboratoire Population Environnement Développement', shortName: 'UMR LPED', ror: '00znkfx48' },
  { id: '102313', name: 'Laboratoire des sciences du numérique à Nantes', shortName: 'LS2N', ror: '04ezmvf85' },
  { id: '102314', name: 'EHESS - École des hautes études en sciences sociales', shortName: 'EHESS', ror: '011kdr723' },
  { id: '102315', name: 'INRAE Montpellier', shortName: 'INRAE', ror: '003vg9w96' },
]

const MOCK_SUGGESTED_AUTHORS = [
  { id: 1, name: 'Magali Muraro', email: '@univ-reims.fr', idhal: 'magali-muraro', orcid: '0000-0002-1234-5678' },
  { id: 2, name: 'Alrick Dias', email: '@imbe.fr', idhal: 'alrick-dias', orcid: undefined },
  { id: 3, name: 'Tristan Cazenave', email: '@dauphine.fr', idhal: 'tristan-cazenave', orcid: '0000-0003-4669-9374' },
  { id: 4, name: 'Coline Chartier', email: '@example.fr', idhal: undefined, orcid: undefined },
]

const AUTHOR_ROLES = [
  { value: 'author', label: 'Auteur' },
  { value: 'auteur_correspondant', label: 'Auteur correspondant' },
  { value: 'editor', label: 'Directeur de publication' },
  { value: 'translator', label: 'Traducteur' },
  { value: 'compiler', label: 'Compilateur' },
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
  role: string
  rank: number
  external: boolean
  orcid?: string
  idhal?: string
  idhalCandidates?: IdHalCandidate[]
  affiliations: Affiliation[]
}

// ─── Mock alignment initializer ───────────────────────────────────────────────

function initFromContributions(contributions: Contribution[]): AuthorState[] {
  return contributions.map((c, i) => {
    const uid = c.person.uid ?? `author-${i}`
    const displayName = c.person.displayName ?? ''
    const rank = c.rank ?? i + 1
    const role = (c.roles[0] as string) ?? 'author'
    const external = c.person.external ?? false

    // Inject mock alignment data based on rank for demo purposes
    if (rank === 1) {
      return {
        uid, displayName, role, rank, external,
        orcid: '0000-0001-2345-6789',
        idhal: 'jean-dupont',
        affiliations: [
          { halStructureId: '102313', halStructureName: 'Laboratoire des sciences du numérique à Nantes', shortName: 'LS2N', ror: '04ezmvf85' },
        ],
      }
    }
    if (rank === 2) {
      return {
        uid, displayName, role, rank, external,
        idhalCandidates: [
          { idhal: 'sophie-martin', fullName: 'Sophie Martin', affiliations: 'LS2N, Nantes', publications: 12, matchScore: 92, orcid: '0000-0002-9876-5432' },
          { idhal: 'sophie-martin-2', fullName: 'S. Martin', affiliations: 'LIRMM, Montpellier', publications: 3, matchScore: 61 },
        ],
        affiliations: [
          { halStructureId: '', halStructureName: '', importedText: 'Laboratoire LS2N, Université de Nantes', structureCandidates: [
            { halStructureId: '102313', shortName: 'LS2N', fullName: 'Laboratoire des sciences du numérique à Nantes', ror: '04ezmvf85', matchScore: 94 },
            { halStructureId: '102315', shortName: 'INRAE', fullName: 'INRAE Montpellier', matchScore: 38 },
          ]},
        ],
      }
    }
    if (rank === 3) {
      return {
        uid, displayName, role, rank, external,
        affiliations: [],
      }
    }
    // rank 4 — aligned external author
    return {
      uid, displayName, role, rank, external,
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
  if (score >= 65) return '#C58A00'
  return MUTED
}

// ─── Component ────────────────────────────────────────────────────────────────

const Authors = () => {
  const { selectedDocument = null } = useStore((state) => state.document)
  const contributions: Contribution[] = selectedDocument?.contributions ?? []

  const [authors, setAuthors] = useState<AuthorState[]>(() =>
    initFromContributions(contributions),
  )
  const [searchInput, setSearchInput] = useState('')
  const [expandedCandidates, setExpandedCandidates] = useState<Record<string, boolean>>({})

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalAuthors = authors.length
    const aligned = authors.filter((a) => !!a.idhal).length
    const missingIdhal = totalAuthors - aligned
    let totalAff = 0
    let alignedAff = 0
    authors.forEach((a) => {
      a.affiliations.forEach((af) => {
        totalAff++
        if (af.halStructureId && !af.importedText) alignedAff++
      })
    })
    const totalItems = totalAuthors + totalAff
    const alignedItems = aligned + alignedAff
    const pct = totalItems > 0 ? Math.round((alignedItems / totalItems) * 100) : 100
    return { totalAuthors, totalAff, missingIdhal, unalignedAff: totalAff - alignedAff, alignedItems, totalItems, pct }
  }, [authors])

  // ── Handlers ───────────────────────────────────────────────────────────────
  const update = (uid: string, patch: Partial<AuthorState>) =>
    setAuthors((prev) => prev.map((a) => (a.uid === uid ? { ...a, ...patch } : a)))

  const remove = (uid: string) =>
    setAuthors((prev) => prev.filter((a) => a.uid !== uid))

  const move = (uid: string, dir: 'up' | 'down') => {
    setAuthors((prev) => {
      const idx = prev.findIndex((a) => a.uid === uid)
      if (dir === 'up' && idx === 0) return prev
      if (dir === 'down' && idx === prev.length - 1) return prev
      const next = [...prev]
      const target = dir === 'up' ? idx - 1 : idx + 1
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  const confirmIdhal = (uid: string, candidate: IdHalCandidate) =>
    update(uid, { idhal: candidate.idhal, orcid: candidate.orcid, idhalCandidates: undefined })

  const alignAffiliation = (uid: string, affIdx: number, candidate: StructureCandidate) =>
    setAuthors((prev) =>
      prev.map((a) => {
        if (a.uid !== uid) return a
        const affs = [...a.affiliations]
        affs[affIdx] = { halStructureId: candidate.halStructureId, halStructureName: candidate.fullName, shortName: candidate.shortName, ror: candidate.ror }
        return { ...a, affiliations: affs }
      }),
    )

  const addAffiliation = (uid: string, structure: typeof MOCK_HAL_STRUCTURES[0]) =>
    setAuthors((prev) =>
      prev.map((a) =>
        a.uid !== uid
          ? a
          : { ...a, affiliations: [...a.affiliations, { halStructureId: structure.id, halStructureName: structure.name, shortName: structure.shortName, ror: structure.ror }] },
      ),
    )

  const removeAffiliation = (uid: string, affIdx: number) =>
    setAuthors((prev) =>
      prev.map((a) =>
        a.uid !== uid ? a : { ...a, affiliations: a.affiliations.filter((_, i) => i !== affIdx) },
      ),
    )

  const alignAllBest = () => {
    setAuthors((prev) =>
      prev.map((a) => {
        let next = { ...a }
        if (!next.idhal && next.idhalCandidates?.length) {
          const best = [...next.idhalCandidates].sort((x, y) => y.matchScore - x.matchScore)[0]
          if (best.matchScore >= 85) {
            next = { ...next, idhal: best.idhal, orcid: best.orcid ?? next.orcid, idhalCandidates: undefined }
          }
        }
        next.affiliations = next.affiliations.map((af) => {
          if (af.importedText && af.structureCandidates?.length) {
            const best = [...af.structureCandidates].sort((x, y) => y.matchScore - x.matchScore)[0]
            if (best.matchScore >= 85) {
              return { halStructureId: best.halStructureId, halStructureName: best.fullName, shortName: best.shortName, ror: best.ror }
            }
          }
          return af
        })
        return next
      }),
    )
  }

  const addAuthor = (suggested?: typeof MOCK_SUGGESTED_AUTHORS[0]) => {
    const uid = `new-${Date.now()}`
    setAuthors((prev) => [
      ...prev,
      {
        uid,
        displayName: suggested?.name ?? searchInput,
        role: 'author',
        rank: prev.length + 1,
        external: true,
        idhal: suggested?.idhal,
        orcid: suggested?.orcid,
        affiliations: [],
      },
    ])
    setSearchInput('')
  }

  const pending = stats.missingIdhal + stats.unalignedAff

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ maxWidth: 860 }}>

      {/* ── Alignment banner ──────────────────────────────────────────────── */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography sx={{ color: TEXT, fontWeight: 600, fontSize: '1.125rem' }}>
            Auteurs <Box component="span" sx={{ color: '#D32F2F' }}>*</Box>
          </Typography>
          <Typography sx={{ color: MUTED, fontSize: '0.875rem' }}>
            <Box component="span" sx={{ fontWeight: 600, color: TEXT }}>{stats.totalAuthors}</Box> auteur{stats.totalAuthors > 1 ? 's' : ''}
            {' · '}
            <Box component="span" sx={{ fontWeight: 600, color: TEXT }}>{stats.totalAff}</Box> affiliation{stats.totalAff > 1 ? 's' : ''}
          </Typography>
        </Box>

        {pending > 0 ? (
          <Paper elevation={0} sx={{ bgcolor: WARN_BG, border: `1px solid ${WARN_BORDER}`, borderRadius: '12px', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <WarningAmber sx={{ color: WARN, mt: '2px', flexShrink: 0, fontSize: 20 }} />
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ color: WARN, fontWeight: 700, fontSize: '0.9375rem', mb: 0.5 }}>
                  {pending} alignement{pending > 1 ? 's' : ''} AureHAL requis avant le dépôt
                </Typography>
                <Typography sx={{ color: TEXT, fontSize: '0.875rem', mb: 1.5 }}>
                  {stats.missingIdhal > 0 && <><Box component="span" sx={{ fontWeight: 600 }}>{stats.missingIdhal}</Box> auteur{stats.missingIdhal > 1 ? 's' : ''} sans IdHAL</>}
                  {stats.missingIdhal > 0 && stats.unalignedAff > 0 && ' · '}
                  {stats.unalignedAff > 0 && <><Box component="span" sx={{ fontWeight: 600 }}>{stats.unalignedAff}</Box> affiliation{stats.unalignedAff > 1 ? 's' : ''} non alignée{stats.unalignedAff > 1 ? 's' : ''}</>}
                  {'. L\'identification dans AureHAL est indispensable pour le dépôt HAL.'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AutoAwesome sx={{ fontSize: 16 }} />}
                    onClick={alignAllBest}
                    sx={{ bgcolor: TEAL, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: TEAL_DARK } }}
                  >
                    Aligner toutes les meilleures correspondances
                  </Button>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 200 }}>
                    <LinearProgress
                      variant="determinate"
                      value={stats.pct}
                      sx={{ flex: 1, maxWidth: 200, height: 6, borderRadius: 3, bgcolor: '#FFF', '& .MuiLinearProgress-bar': { bgcolor: TEAL } }}
                    />
                    <Typography sx={{ color: MUTED, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                      <Box component="span" sx={{ fontWeight: 700, color: TEXT }}>{stats.alignedItems}/{stats.totalItems}</Box> alignés · {stats.pct}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        ) : (
          <Paper elevation={0} sx={{ bgcolor: TEAL_LIGHT, border: `1px solid ${BORDER}`, borderRadius: '12px', p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CheckCircle sx={{ color: SUCCESS, fontSize: 20 }} />
            <Typography sx={{ color: TEXT, fontSize: '0.9375rem', fontWeight: 600 }}>
              Tous les auteurs et affiliations sont alignés avec AureHAL.
            </Typography>
            <Box sx={{ ml: 'auto' }}>
              <Typography sx={{ color: MUTED, fontSize: '0.8125rem' }}>
                <Box component="span" sx={{ fontWeight: 700, color: TEXT }}>{stats.alignedItems}/{stats.totalItems}</Box> alignés · {stats.pct}%
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>

      {/* ── Registry links ────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Consulter AureHAL (auteurs et structures)', href: 'https://aurehal.archives-ouvertes.fr/' },
          { label: 'ROR (Research Organization Registry)', href: 'https://ror.org/' },
        ].map(({ label, href }) => (
          <Link key={href} href={href} target="_blank" rel="noopener"
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: TEAL, textDecoration: 'none', fontSize: '0.875rem', '&:hover': { textDecoration: 'underline' } }}>
            <OpenInNew sx={{ fontSize: 14 }} />{label}
          </Link>
        ))}
      </Box>

      {/* ── Add author search ─────────────────────────────────────────────── */}
      <Box sx={{ mb: 3 }}>
        <Autocomplete
          inputValue={searchInput}
          onInputChange={(_, v) => setSearchInput(v)}
          options={MOCK_SUGGESTED_AUTHORS}
          getOptionLabel={(o) => (typeof o === 'string' ? o : o.name)}
          onChange={(_, value) => {
            if (value && typeof value === 'object') addAuthor(value)
            else if (typeof value === 'string') addAuthor()
          }}
          renderOption={(props, option) => (
            <Box component="li" {...props} key={option.id}>
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ color: TEXT, fontWeight: 600, fontSize: '0.875rem' }}>{option.name}</Typography>
                  {option.idhal && <Chip size="small" label={`IdHAL: ${option.idhal}`} sx={{ height: 18, fontSize: '0.6875rem', bgcolor: TEAL_LIGHT, color: TEAL }} />}
                  {option.orcid && <Box component="img" src={publicPath('/icons/orcid.png')} alt="ORCID" sx={{ width: 14, height: 14 }} />}
                </Box>
                <Typography sx={{ color: MUTED, fontSize: '0.75rem' }}>{option.email}</Typography>
              </Box>
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Ajouter un auteur — rechercher dans AureHAL (nom, IdHAL, ORCID)"
              fullWidth
              InputProps={{
                ...params.InputProps,
                startAdornment: <><Search sx={{ fontSize: 16, color: MUTED, mr: 1 }} />{params.InputProps.startAdornment}</>,
                endAdornment: <><Chip size="small" label="API AureHAL" sx={{ height: 22, fontSize: '0.6875rem', bgcolor: TEAL_LIGHT, color: TEAL, fontWeight: 600, mr: 0.5 }} />{params.InputProps.endAdornment}</>,
              }}
            />
          )}
          freeSolo
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchInput && !MOCK_SUGGESTED_AUTHORS.some((a) => a.name.toLowerCase() === searchInput.toLowerCase())) {
              e.preventDefault()
              addAuthor()
            }
          }}
          noOptionsText={
            <Button fullWidth startIcon={<Add />} onClick={() => addAuthor()}
              sx={{ color: TEAL, textTransform: 'none', justifyContent: 'flex-start', '&:hover': { bgcolor: TEAL_LIGHT } }}>
              Ajouter un nouvel auteur
            </Button>
          }
        />
      </Box>

      {/* ── Author cards ──────────────────────────────────────────────────── */}
      {authors.map((author) => {
        const needsIdhal = !author.idhal
        const hasCandidates = needsIdhal && (author.idhalCandidates?.length ?? 0) > 0
        const isAligned = !needsIdhal
        const expanded = expandedCandidates[author.uid]

        return (
          <Paper
            key={author.uid}
            elevation={0}
            sx={{ bgcolor: 'white', border: `1px solid ${needsIdhal ? WARN_BORDER : BORDER}`, borderRadius: '12px', p: 2.5, mb: 2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              {/* Reorder controls */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0.25 }}>
                <Tooltip title="Réordonner">
                  <DragIndicator sx={{ color: '#9CA3AF', fontSize: 18, cursor: 'grab' }} />
                </Tooltip>
                <IconButton size="small" onClick={() => move(author.uid, 'up')} sx={{ p: 0.25 }}>
                  <KeyboardArrowUp sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton size="small" onClick={() => move(author.uid, 'down')} sx={{ p: 0.25 }}>
                  <KeyboardArrowDown sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* Name row */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                  <Typography sx={{ color: TEXT, fontWeight: 700, fontSize: '1.0625rem' }}>{author.displayName}</Typography>
                  {author.orcid && (
                    <Tooltip title={`ORCID: ${author.orcid}`}>
                      <Box component="img" src={publicPath('/icons/orcid.png')} alt="ORCID" sx={{ width: 16, height: 16 }} />
                    </Tooltip>
                  )}
                  {isAligned ? (
                    <Chip
                      size="small"
                      icon={<CheckCircle sx={{ fontSize: '12px !important', color: `${TEAL} !important`, ml: '4px !important' }} />}
                      label={`IdHAL · ${author.idhal}`}
                      sx={{ height: 22, bgcolor: TEAL_LIGHT, color: TEAL, fontWeight: 600, fontSize: '0.75rem' }}
                    />
                  ) : (
                    <Chip
                      size="small"
                      icon={<WarningAmber sx={{ fontSize: '12px !important', color: `${WARN} !important`, ml: '4px !important' }} />}
                      label="Sans IdHAL"
                      sx={{ height: 22, bgcolor: WARN_BG, color: WARN, fontWeight: 600, fontSize: '0.75rem', border: `1px solid ${WARN_BORDER}` }}
                    />
                  )}
                  {isAligned && (
                    <Button size="small" onClick={() => update(author.uid, { idhal: undefined })}
                      sx={{ color: TEAL, textTransform: 'none', fontSize: '0.75rem', ml: 'auto', minWidth: 'auto' }}>
                      Changer
                    </Button>
                  )}
                  <IconButton size="small" onClick={() => remove(author.uid)}
                    sx={{ color: '#9CA3AF', ml: isAligned ? 0 : 'auto', '&:hover': { color: '#D32F2F' } }}>
                    <DeleteOutline sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>

                {/* Role selector */}
                <Box sx={{ mb: 1.5 }}>
                  <FormControl size="small" sx={{ minWidth: 240 }}>
                    <InputLabel sx={{ fontSize: '0.8125rem' }}>Fonction</InputLabel>
                    <Select
                      value={author.role}
                      onChange={(e) => update(author.uid, { role: e.target.value })}
                      label="Fonction"
                      sx={{ fontSize: '0.8125rem' }}
                    >
                      {AUTHOR_ROLES.map((r) => (
                        <MenuItem key={r.value} value={r.value} sx={{ fontSize: '0.8125rem' }}>{r.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* IdHAL alignment panel */}
                {needsIdhal && (
                  <Paper elevation={0} sx={{ bgcolor: WARN_BG, border: `1px solid ${WARN_BORDER}`, borderRadius: '8px', p: 1.5, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <WarningAmber sx={{ color: WARN, fontSize: 16 }} />
                      <Typography sx={{ color: WARN, fontWeight: 700, fontSize: '0.8125rem' }}>
                        Identité AureHAL à confirmer
                      </Typography>
                      <Typography sx={{ color: TEXT, fontSize: '0.8125rem' }}>
                        {`— cet auteur n'a pas d'IdHAL.`}
                      </Typography>
                    </Box>

                    {hasCandidates && (
                      <>
                        <Typography sx={{ color: MUTED, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', mb: 1 }}>
                          Candidats AureHAL · {author.idhalCandidates!.length}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {author.idhalCandidates!.slice(0, expanded ? undefined : 3).map((candidate, ci) => (
                            <Paper key={ci} elevation={0}
                              sx={{ bgcolor: 'white', border: `1px solid ${BORDER}`, borderRadius: '8px', p: 1.25, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.25 }}>
                                  <Typography sx={{ color: TEXT, fontWeight: 600, fontSize: '0.875rem' }}>{candidate.fullName}</Typography>
                                  {candidate.orcid && (
                                    <Tooltip title={`ORCID: ${candidate.orcid}`}>
                                      <Box component="img" src={publicPath('/icons/orcid.png')} alt="ORCID" sx={{ width: 12, height: 12 }} />
                                    </Tooltip>
                                  )}
                                  <Chip size="small" label={candidate.idhal} sx={{ height: 18, fontSize: '0.6875rem', bgcolor: TEAL_LIGHT, color: TEAL }} />
                                </Box>
                                <Typography sx={{ color: MUTED, fontSize: '0.75rem' }}>
                                  {candidate.affiliations} · {candidate.publications} publication{candidate.publications > 1 ? 's' : ''} dans HAL
                                </Typography>
                              </Box>
                              <Typography sx={{ color: matchColor(candidate.matchScore), fontWeight: 700, fontSize: '0.875rem', minWidth: 36, textAlign: 'right' }}>
                                {candidate.matchScore}%
                              </Typography>
                              <Button
                                variant={candidate.matchScore >= 85 ? 'contained' : 'outlined'}
                                size="small"
                                onClick={() => confirmIdhal(author.uid, candidate)}
                                sx={{
                                  textTransform: 'none', fontWeight: 600, fontSize: '0.75rem',
                                  bgcolor: candidate.matchScore >= 85 ? TEAL : 'transparent',
                                  color: candidate.matchScore >= 85 ? 'white' : TEAL,
                                  borderColor: TEAL,
                                  '&:hover': { bgcolor: candidate.matchScore >= 85 ? TEAL_DARK : TEAL_LIGHT, borderColor: TEAL },
                                }}
                              >
                                Confirmer
                              </Button>
                            </Paper>
                          ))}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1, flexWrap: 'wrap' }}>
                          {author.idhalCandidates!.length > 3 && (
                            <Button size="small"
                              onClick={() => setExpandedCandidates((prev) => ({ ...prev, [author.uid]: !prev[author.uid] }))}
                              sx={{ color: TEAL, textTransform: 'none', fontSize: '0.75rem', p: 0, minWidth: 'auto' }}>
                              {expanded ? 'Voir moins' : `Voir tous les candidats (${author.idhalCandidates!.length})`}
                            </Button>
                          )}
                          <Typography sx={{ color: MUTED, fontSize: '0.75rem' }}>·</Typography>
                          <Link href="https://aurehal.archives-ouvertes.fr/author/create" target="_blank" rel="noopener"
                            sx={{ color: TEAL, textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
                            Créer un IdHAL pour {author.displayName}
                          </Link>
                          <Typography sx={{ color: MUTED, fontSize: '0.75rem' }}>·</Typography>
                          <Button size="small" onClick={() => update(author.uid, { idhal: `_anon_${author.uid}` })}
                            sx={{ color: MUTED, textTransform: 'none', fontSize: '0.75rem', p: 0, minWidth: 'auto' }}>
                            Déposer sans IdHAL
                          </Button>
                        </Box>
                      </>
                    )}

                    {!hasCandidates && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                        <Link href="https://aurehal.archives-ouvertes.fr/author/create" target="_blank" rel="noopener"
                          sx={{ color: TEAL, textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
                          Créer un IdHAL pour {author.displayName}
                        </Link>
                        <Typography sx={{ color: MUTED, fontSize: '0.75rem' }}>·</Typography>
                        <Button size="small" onClick={() => update(author.uid, { idhal: `_anon_${author.uid}` })}
                          sx={{ color: MUTED, textTransform: 'none', fontSize: '0.75rem', p: 0, minWidth: 'auto' }}>
                          Déposer sans IdHAL
                        </Button>
                      </Box>
                    )}
                  </Paper>
                )}

                {/* Affiliations */}
                <Typography sx={{ color: MUTED, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', mb: 1 }}>
                  Affiliations
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 1 }}>
                  {author.affiliations.map((aff, affIdx) => {
                    const affAligned = aff.halStructureId && !aff.importedText
                    if (affAligned) {
                      return (
                        <Paper key={affIdx} elevation={0}
                          sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', p: 1.25, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.25 }}>
                              <Typography sx={{ color: TEAL, fontWeight: 700, fontSize: '0.875rem' }}>{aff.shortName ?? aff.halStructureName}</Typography>
                              {aff.ror && <Chip size="small" label={`ROR ${aff.ror}`} sx={{ height: 18, fontSize: '0.6875rem', bgcolor: TEAL_LIGHT, color: TEAL }} />}
                            </Box>
                            <Typography sx={{ color: MUTED, fontSize: '0.75rem' }}>{aff.halStructureName}</Typography>
                          </Box>
                          <IconButton size="small" onClick={() => removeAffiliation(author.uid, affIdx)}
                            sx={{ color: '#9CA3AF', '&:hover': { color: '#D32F2F' } }}>
                            <DeleteOutline sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Paper>
                      )
                    }

                    // Unaligned affiliation
                    return (
                      <Paper key={affIdx} elevation={0}
                        sx={{ bgcolor: WARN_BG, border: `1px solid ${WARN_BORDER}`, borderRadius: '8px', p: 1.25 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <WarningAmber sx={{ color: WARN, fontSize: 16 }} />
                          <Typography sx={{ color: WARN, fontWeight: 700, fontSize: '0.8125rem' }}>Structure à aligner avec AureHAL</Typography>
                          <IconButton size="small" onClick={() => removeAffiliation(author.uid, affIdx)}
                            sx={{ ml: 'auto', color: '#9CA3AF', '&:hover': { color: '#D32F2F' } }}>
                            <DeleteOutline sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                        <Typography sx={{ color: TEXT, fontSize: '0.8125rem', mb: 1 }}>
                          Texte importé : <Box component="span" sx={{ fontStyle: 'italic' }}>« {aff.importedText} »</Box>
                        </Typography>
                        {aff.structureCandidates?.map((cand, ci) => (
                          <Paper key={ci} elevation={0}
                            sx={{ bgcolor: 'white', border: `1px solid ${BORDER}`, borderRadius: '6px', p: 1, display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mb: 0.25 }}>
                                <Typography sx={{ color: TEXT, fontWeight: 700, fontSize: '0.8125rem' }}>{cand.shortName}</Typography>
                                {cand.ror && <Chip size="small" label={`ROR ${cand.ror}`} sx={{ height: 16, fontSize: '0.625rem', bgcolor: TEAL_LIGHT, color: TEAL }} />}
                              </Box>
                              <Typography sx={{ color: MUTED, fontSize: '0.75rem' }}>{cand.fullName}</Typography>
                            </Box>
                            <Typography sx={{ color: matchColor(cand.matchScore), fontWeight: 700, fontSize: '0.8125rem', minWidth: 36, textAlign: 'right' }}>
                              {cand.matchScore}%
                            </Typography>
                            <Button
                              variant={cand.matchScore >= 85 ? 'contained' : 'outlined'}
                              size="small"
                              onClick={() => alignAffiliation(author.uid, affIdx, cand)}
                              sx={{
                                textTransform: 'none', fontWeight: 600, fontSize: '0.75rem',
                                bgcolor: cand.matchScore >= 85 ? TEAL : 'transparent',
                                color: cand.matchScore >= 85 ? 'white' : TEAL,
                                borderColor: TEAL,
                                '&:hover': { bgcolor: cand.matchScore >= 85 ? TEAL_DARK : TEAL_LIGHT, borderColor: TEAL },
                              }}
                            >
                              Aligner
                            </Button>
                          </Paper>
                        ))}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                          <Autocomplete
                            size="small"
                            options={MOCK_HAL_STRUCTURES}
                            getOptionLabel={(o) => o.name}
                            onChange={(_, value) => {
                              if (value) alignAffiliation(author.uid, affIdx, { halStructureId: value.id, shortName: value.shortName, fullName: value.name, ror: value.ror, matchScore: 100 })
                            }}
                            sx={{ flex: 1, minWidth: 220 }}
                            renderInput={(params) => <TextField {...params} placeholder="Rechercher dans AureHAL…" />}
                          />
                          <Link href="https://aurehal.archives-ouvertes.fr/structure/create" target="_blank" rel="noopener"
                            sx={{ color: TEAL, textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
                            Demander la création dans AureHAL
                          </Link>
                        </Box>
                      </Paper>
                    )
                  })}
                </Box>

                {/* Add affiliation */}
                <Autocomplete
                  size="small"
                  options={MOCK_HAL_STRUCTURES}
                  getOptionLabel={(o) => o.name}
                  onChange={(_, value) => { if (value) addAffiliation(author.uid, value) }}
                  renderInput={(params) => <TextField {...params} placeholder="Ajouter une affiliation AureHAL" />}
                />
              </Box>
            </Box>
          </Paper>
        )
      })}

      {/* ── Global action bar ─────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<PersonAdd sx={{ fontSize: 16 }} />}
          onClick={() => addAuthor()}
          sx={{ color: TEAL, borderColor: TEAL, textTransform: 'none', fontWeight: 600, '&:hover': { borderColor: TEAL_DARK, bgcolor: TEAL_LIGHT } }}
        >
          Ajouter un auteur
        </Button>
      </Box>
    </Box>
  )
}

export default Authors
