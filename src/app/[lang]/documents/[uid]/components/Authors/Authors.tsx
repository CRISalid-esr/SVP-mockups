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
  Edit,
  ExpandMore,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreHoriz,
  Search,
  WarningAmber,
} from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
    if (rank === 3) {
      return { uid, displayName, role, rank, external, affiliations: [] }
    }
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

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function avatarColor(name: string) {
  const colors = ['#4F7942', '#2E6DA4', '#8B5E3C', '#6B4F9E', '#B5451B']
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff
  return colors[hash % colors.length]
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

const Authors = () => {
  const { selectedDocument = null } = useStore((state) => state.document)
  const contributions: Contribution[] = selectedDocument?.contributions ?? []

  const [authors, setAuthors] = useState<AuthorState[]>(() =>
    initFromContributions(contributions),
  )
  const [expandedCandidates, setExpandedCandidates] = useState<Record<string, boolean>>({})
  const [candidateSearch, setCandidateSearch] = useState<Record<string, string>>({})
  const [showIdhalCandidates, setShowIdhalCandidates] = useState<Record<string, boolean>>({})
  const [showAffCandidates, setShowAffCandidates] = useState<Record<string, Record<number, boolean>>>({})

  const stats = useMemo(() => {
    const totalAuthors = authors.length
    const aligned = authors.filter((a) => !!a.idhal).length
    const missingIdhal = totalAuthors - aligned
    let totalAff = 0, alignedAff = 0
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
        a.uid !== uid ? a
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
          if (best.matchScore >= 85) next = { ...next, idhal: best.idhal, orcid: best.orcid ?? next.orcid, idhalCandidates: undefined }
        }
        next.affiliations = next.affiliations.map((af) => {
          if (af.importedText && af.structureCandidates?.length) {
            const best = [...af.structureCandidates].sort((x, y) => y.matchScore - x.matchScore)[0]
            if (best.matchScore >= 85) return { halStructureId: best.halStructureId, halStructureName: best.fullName, shortName: best.shortName, ror: best.ror }
          }
          return af
        })
        return next
      }),
    )
  }

  const addAuthor = () => {
    const uid = `new-${Date.now()}`
    setAuthors((prev) => [...prev, { uid, displayName: 'Nouvel auteur', role: 'author', rank: prev.length + 1, external: true, affiliations: [] }])
  }

  const toggleIdhalCandidates = (uid: string) =>
    setShowIdhalCandidates((prev) => ({ ...prev, [uid]: !prev[uid] }))

  const toggleAffCandidates = (uid: string, affIdx: number) =>
    setShowAffCandidates((prev) => ({
      ...prev,
      [uid]: { ...(prev[uid] ?? {}), [affIdx]: !(prev[uid]?.[affIdx]) },
    }))

  const pending = stats.missingIdhal + stats.unalignedAff

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ maxWidth: 960 }}>

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
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <WarningAmber sx={{ color: WARN, mt: '2px', flexShrink: 0, fontSize: 20 }} />
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ color: WARN, fontWeight: 700, fontSize: '0.9375rem', mb: 0.25 }}>
                  Retrouvez les auteurs et les affiliations HAL manquants
                </Typography>
                <Typography sx={{ color: TEXT, fontSize: '0.8125rem' }}>
                  {stats.missingIdhal > 0 && <><Box component="span" sx={{ fontWeight: 600 }}>{stats.missingIdhal}</Box> auteur{stats.missingIdhal > 1 ? 's' : ''} non trouvé{stats.missingIdhal > 1 ? 's' : ''} dans HAL</>}
                  {stats.missingIdhal > 0 && stats.unalignedAff > 0 && ' · '}
                  {stats.unalignedAff > 0 && <><Box component="span" sx={{ fontWeight: 600 }}>{stats.unalignedAff}</Box> affiliation{stats.unalignedAff > 1 ? 's' : ''} HAL manquante{stats.unalignedAff > 1 ? 's' : ''}</>}
                  {'. Identifier les personnes et les structures dans HAL est nécessaire avant le dépôt.'}
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="small"
                startIcon={<AutoAwesome sx={{ fontSize: 16 }} />}
                onClick={alignAllBest}
                sx={{ bgcolor: TEAL, textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, '&:hover': { bgcolor: TEAL_DARK } }}
              >
                Aligner toutes les meilleures correspondances
              </Button>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1.5 }}>
              <LinearProgress
                variant="determinate"
                value={stats.pct}
                sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: '#FFF', '& .MuiLinearProgress-bar': { bgcolor: TEAL } }}
              />
              <Typography sx={{ color: MUTED, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                <Box component="span" sx={{ fontWeight: 700, color: TEXT }}>{stats.alignedItems} / {stats.totalItems}</Box> alignés · {stats.pct} %
              </Typography>
            </Box>
          </Paper>
        ) : (
          <Paper elevation={0} sx={{ bgcolor: TEAL_LIGHT, border: `1px solid ${BORDER}`, borderRadius: '12px', p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CheckCircle sx={{ color: SUCCESS, fontSize: 20 }} />
            <Typography sx={{ color: TEXT, fontSize: '0.9375rem', fontWeight: 600 }}>
              Tous les auteurs et leurs affiliations HAL ont été trouvés.
            </Typography>
            <Typography sx={{ color: MUTED, fontSize: '0.8125rem', ml: 'auto' }}>
              <Box component="span" sx={{ fontWeight: 700, color: TEXT }}>{stats.alignedItems} / {stats.totalItems}</Box> alignés · {stats.pct} %
            </Typography>
          </Paper>
        )}
      </Box>

      {/* ── Author cards ──────────────────────────────────────────────────── */}
      {authors.map((author) => {
        const needsIdhal = !author.idhal
        const hasCandidates = needsIdhal && (author.idhalCandidates?.length ?? 0) > 0
        const candidatesVisible = showIdhalCandidates[author.uid]
        const expanded = expandedCandidates[author.uid]
        const search = candidateSearch[author.uid] ?? ''

        return (
          <Paper key={author.uid} elevation={0}
            sx={{ border: `1px solid ${BORDER}`, borderRadius: '12px', mb: 2, overflow: 'hidden' }}>
            <Box sx={{ display: 'flex' }}>

              {/* ── Left column: author info ─────────────────────────────── */}
              <Box sx={{ flex: '0 0 42%', p: 2.5, borderRight: `1px solid ${BORDER}` }}>

                {/* Name row */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', mr: 0.5 }}>
                    <DragIndicator sx={{ color: '#C0C8C7', fontSize: 18, cursor: 'grab' }} />
                    <IconButton size="small" onClick={() => move(author.uid, 'up')} sx={{ p: 0.25 }}>
                      <KeyboardArrowUp sx={{ fontSize: 14, color: MUTED }} />
                    </IconButton>
                    <IconButton size="small" onClick={() => move(author.uid, 'down')} sx={{ p: 0.25 }}>
                      <KeyboardArrowDown sx={{ fontSize: 14, color: MUTED }} />
                    </IconButton>
                  </Box>
                  <Typography sx={{ color: TEXT, fontWeight: 700, fontSize: '1.0625rem', flex: 1 }}>
                    {author.displayName}
                  </Typography>
                  {author.orcid && (
                    <Tooltip title={`ORCID: ${author.orcid}`}>
                      <Box component="img" src={publicPath('/icons/orcid.png')} alt="ORCID" sx={{ width: 16, height: 16 }} />
                    </Tooltip>
                  )}
                  <IconButton size="small" sx={{ color: MUTED, p: 0.5 }}>
                    <Edit sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>

                {/* HAL status */}
                {author.idhal ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <CheckCircle sx={{ color: SUCCESS, fontSize: 16 }} />
                    <Typography sx={{ fontSize: '0.8125rem', color: TEXT, fontWeight: 600 }}>Trouvé dans HAL</Typography>
                    {!author.idhal.startsWith('_anon_') && (
                      <Typography sx={{ fontSize: '0.8125rem', color: TEAL }}>{author.idhal}</Typography>
                    )}
                    <Button size="small" onClick={() => update(author.uid, { idhal: undefined })}
                      sx={{ color: MUTED, textTransform: 'none', fontSize: '0.75rem', p: 0, minWidth: 'auto', '&:hover': { color: TEAL } }}>
                      Changer
                    </Button>
                  </Box>
                ) : (
                  <Chip
                    size="small"
                    icon={<WarningAmber sx={{ fontSize: '14px !important', color: `${WARN} !important`, ml: '4px !important' }} />}
                    label="Non trouvé dans HAL"
                    sx={{ height: 24, bgcolor: WARN_BG, color: WARN, fontWeight: 600, fontSize: '0.75rem', border: `1px solid ${WARN_BORDER}`, mb: 1.5 }}
                  />
                )}

                {/* HAL identity panel */}
                {needsIdhal && (
                  <Paper elevation={0} sx={{ bgcolor: WARN_BG, border: `1px solid ${WARN_BORDER}`, borderRadius: '8px', p: 1.5, mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'flex-start' }}>
                      <Typography sx={{ color: WARN, fontWeight: 700, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                        Auteur non trouvé dans HAL
                      </Typography>
                      <Typography sx={{ color: TEXT, fontSize: '0.8125rem' }}>
                        {`— sélectionnez cet auteur dans HAL pour permettre le dépôt.`}
                      </Typography>
                    </Box>

                    {/* Candidate search */}
                    <TextField
                      size="small"
                      fullWidth
                      placeholder={author.displayName}
                      value={search}
                      onChange={(e) => setCandidateSearch((prev) => ({ ...prev, [author.uid]: e.target.value }))}
                      InputProps={{ startAdornment: <Search sx={{ fontSize: 16, color: MUTED, mr: 1 }} /> }}
                      sx={{ mb: 1.5, bgcolor: 'white', borderRadius: 1 }}
                    />

                    {/* Candidates — hidden until user clicks "Suggérer" */}
                    {hasCandidates && !candidatesVisible && (
                      <Button
                        size="small"
                        onClick={() => toggleIdhalCandidates(author.uid)}
                        sx={{ color: TEAL, textTransform: 'none', fontSize: '0.8125rem', fontWeight: 600, p: 0, minWidth: 'auto' }}
                      >
                        {`Suggérer (${author.idhalCandidates!.length} correspondance${author.idhalCandidates!.length > 1 ? 's' : ''} HAL trouvée${author.idhalCandidates!.length > 1 ? 's' : ''}) →`}
                      </Button>
                    )}

                    {hasCandidates && candidatesVisible && (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography sx={{ color: MUTED, fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Candidats HAL · {author.idhalCandidates!.length}
                          </Typography>
                          <Button size="small" onClick={() => toggleIdhalCandidates(author.uid)}
                            sx={{ color: MUTED, textTransform: 'none', fontSize: '0.75rem', p: 0, minWidth: 'auto' }}>
                            Masquer
                          </Button>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                          {author.idhalCandidates!.slice(0, expanded ? undefined : 3).map((candidate, ci) => (
                            <Paper key={ci} elevation={0}
                              sx={{
                                bgcolor: 'white',
                                border: `1.5px solid ${ci === 0 ? TEAL : BORDER}`,
                                borderRadius: '8px', p: 1.25,
                                display: 'flex', alignItems: 'center', gap: 1.5,
                              }}>
                              <Avatar name={candidate.fullName} size={32} />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                                  <Typography sx={{ color: TEXT, fontWeight: 700, fontSize: '0.875rem' }}>{candidate.fullName}</Typography>
                                  <Typography sx={{ color: TEAL, fontSize: '0.75rem' }}>{candidate.idhal}</Typography>
                                  {candidate.orcid && (
                                    <Box component="img" src={publicPath('/icons/orcid.png')} alt="ORCID" sx={{ width: 12, height: 12 }} />
                                  )}
                                </Box>
                                <Typography sx={{ color: MUTED, fontSize: '0.75rem' }}>
                                  {candidate.affiliations} · {candidate.publications} publications dans HAL
                                </Typography>
                              </Box>
                              <Chip
                                size="small"
                                label={`• ${candidate.matchScore} %`}
                                sx={{ height: 20, bgcolor: 'transparent', color: matchColor(candidate.matchScore), fontWeight: 700, fontSize: '0.75rem', border: 'none' }}
                              />
                              <Button
                                variant={candidate.matchScore >= 85 ? 'contained' : 'outlined'}
                                size="small"
                                onClick={() => confirmIdhal(author.uid, candidate)}
                                sx={{
                                  textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', flexShrink: 0,
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
                              {expanded ? 'Voir moins' : 'Voir tous les candidats'}
                            </Button>
                          )}
                          <Typography sx={{ color: MUTED, fontSize: '0.75rem' }}>·</Typography>
                          <Button size="small" onClick={() => update(author.uid, { idhal: `_anon_${author.uid}` })}
                            sx={{ color: MUTED, textTransform: 'none', fontSize: '0.75rem', p: 0, minWidth: 'auto' }}>
                            Déposer quand même
                          </Button>
                        </Box>
                      </>
                    )}

                    {!hasCandidates && (
                      <Button size="small" onClick={() => update(author.uid, { idhal: `_anon_${author.uid}` })}
                        sx={{ color: MUTED, textTransform: 'none', fontSize: '0.75rem', p: 0, minWidth: 'auto' }}>
                        Déposer quand même
                      </Button>
                    )}
                  </Paper>
                )}

                {/* Role selector */}
                <FormControl size="small" fullWidth>
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

              {/* ── Right column: affiliations ───────────────────────────── */}
              <Box sx={{ flex: 1, p: 2.5, display: 'flex', flexDirection: 'column', gap: 1, position: 'relative' }}>
                <IconButton size="small" onClick={() => remove(author.uid)}
                  sx={{ position: 'absolute', top: 12, right: 12, color: '#C0C8C7', '&:hover': { color: '#D32F2F' } }}>
                  <DeleteOutline sx={{ fontSize: 18 }} />
                </IconButton>

                {author.affiliations.map((aff, affIdx) => {
                  const affAligned = aff.halStructureId && !aff.importedText
                  const affCandidatesVisible = showAffCandidates[author.uid]?.[affIdx]

                  if (affAligned) {
                    return (
                      <Paper key={affIdx} elevation={0}
                        sx={{ bgcolor: SURFACE, border: `1px solid ${BORDER}`, borderRadius: '8px', p: 1.25 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <CheckCircle sx={{ color: SUCCESS, fontSize: 16, mt: '2px', flexShrink: 0 }} />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography sx={{ color: TEAL, fontWeight: 700, fontSize: '0.875rem' }}>
                                {aff.shortName ?? aff.halStructureName}
                              </Typography>
                              {aff.ror && (
                                <Chip size="small" label={`ROR ${aff.ror}`}
                                  sx={{ height: 18, fontSize: '0.6875rem', bgcolor: TEAL_LIGHT, color: TEAL }} />
                              )}
                            </Box>
                            <Typography sx={{ color: MUTED, fontSize: '0.75rem' }}>{aff.halStructureName}</Typography>
                          </Box>
                          <IconButton size="small" onClick={() => removeAffiliation(author.uid, affIdx)}
                            sx={{ color: '#C0C8C7', '&:hover': { color: '#D32F2F' }, p: 0.5 }}>
                            <DeleteOutline sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton size="small" sx={{ color: MUTED, p: 0.5 }}>
                            <MoreHoriz sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </Paper>
                    )
                  }

                  // Unaligned affiliation
                  return (
                    <Paper key={affIdx} elevation={0}
                      sx={{ bgcolor: WARN_BG, border: `1px solid ${WARN_BORDER}`, borderRadius: '8px', p: 1.25 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <WarningAmber sx={{ color: WARN, fontSize: 15 }} />
                        <Typography sx={{ color: WARN, fontWeight: 700, fontSize: '0.8125rem', flex: 1 }}>
                          Affiliation HAL manquante
                        </Typography>
                        <IconButton size="small" onClick={() => removeAffiliation(author.uid, affIdx)}
                          sx={{ color: '#C0C8C7', '&:hover': { color: '#D32F2F' }, p: 0.5 }}>
                          <DeleteOutline sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                      <Typography sx={{ color: TEAL, fontSize: '0.8125rem', mb: 1 }}>
                        Texte importé : <Box component="span" sx={{ fontStyle: 'italic', color: TEXT }}>« {aff.importedText} »</Box>
                      </Typography>

                      {/* Structure candidates — hidden until user clicks "Suggérer" */}
                      {aff.structureCandidates?.length ? (
                        !affCandidatesVisible ? (
                          <Button
                            size="small"
                            onClick={() => toggleAffCandidates(author.uid, affIdx)}
                            sx={{ color: TEAL, textTransform: 'none', fontSize: '0.8125rem', fontWeight: 600, p: 0, minWidth: 'auto', mb: 1 }}
                          >
                            {`Suggérer (${aff.structureCandidates.length} correspondance${aff.structureCandidates.length > 1 ? 's' : ''} HAL trouvée${aff.structureCandidates.length > 1 ? 's' : ''}) →`}
                          </Button>
                        ) : (
                          <>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                              <Typography sx={{ color: MUTED, fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Candidats HAL
                              </Typography>
                              <Button size="small" onClick={() => toggleAffCandidates(author.uid, affIdx)}
                                sx={{ color: MUTED, textTransform: 'none', fontSize: '0.75rem', p: 0, minWidth: 'auto' }}>
                                Masquer
                              </Button>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 1 }}>
                              {aff.structureCandidates.map((cand, ci) => (
                                <Paper key={ci} elevation={0}
                                  sx={{ bgcolor: 'white', border: `1.5px solid ${ci === 0 ? TEAL : BORDER}`, borderRadius: '8px', p: 1, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mb: 0.25 }}>
                                      <Chip size="small" label={cand.shortName}
                                        sx={{ height: 20, bgcolor: TEAL_LIGHT, color: TEAL, fontWeight: 700, fontSize: '0.6875rem' }} />
                                      {cand.ror && <Chip size="small" label={`ROR ${cand.ror}`}
                                        sx={{ height: 18, fontSize: '0.6875rem', bgcolor: TEAL_LIGHT, color: TEAL }} />}
                                    </Box>
                                    <Typography sx={{ color: TEXT, fontWeight: 600, fontSize: '0.8125rem' }}>{cand.fullName}</Typography>
                                    {(cand.tutelles || cand.researchers) && (
                                      <Typography sx={{ color: MUTED, fontSize: '0.6875rem', mt: 0.25 }}>
                                        {cand.tutelles && <>Tutelles : {cand.tutelles}</>}
                                        {cand.tutelles && cand.researchers && ' · '}
                                        {cand.researchers && <>{cand.researchers} chercheurs</>}
                                      </Typography>
                                    )}
                                  </Box>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, flexShrink: 0 }}>
                                    <Typography sx={{ color: matchColor(cand.matchScore), fontWeight: 700, fontSize: '0.8125rem' }}>
                                      • {cand.matchScore} %
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
                                  </Box>
                                </Paper>
                              ))}
                            </Box>
                          </>
                        )
                      ) : null}

                      {/* Manual structure search */}
                      <Autocomplete
                        size="small"
                        options={MOCK_HAL_STRUCTURES}
                        getOptionLabel={(o) => o.name}
                        onChange={(_, value) => {
                          if (value) alignAffiliation(author.uid, affIdx, { halStructureId: value.id, shortName: value.shortName, fullName: value.name, ror: value.ror, matchScore: 100 })
                        }}
                        renderInput={(params) => <TextField {...params} placeholder="Rechercher dans HAL…" />}
                      />
                    </Paper>
                  )
                })}

                {/* Add affiliation accordion */}
                <Accordion elevation={0} disableGutters
                  sx={{ border: `1px dashed ${BORDER}`, borderRadius: '8px !important', '&:before': { display: 'none' }, bgcolor: 'transparent' }}>
                  <AccordionSummary expandIcon={<ExpandMore sx={{ fontSize: 18, color: TEAL }} />}
                    sx={{ minHeight: 36, '& .MuiAccordionSummary-content': { my: 0 }, px: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Add sx={{ fontSize: 16, color: TEAL }} />
                      <Typography sx={{ color: TEAL, fontSize: '0.8125rem', fontWeight: 600 }}>
                        Ajouter une affiliation HAL
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 1.5, pb: 1.5 }}>
                    <Autocomplete
                      size="small"
                      options={MOCK_HAL_STRUCTURES}
                      getOptionLabel={(o) => o.name}
                      onChange={(_, value) => { if (value) addAffiliation(author.uid, value) }}
                      renderInput={(params) => <TextField {...params} placeholder="Rechercher une structure dans HAL" />}
                    />
                  </AccordionDetails>
                </Accordion>
              </Box>
            </Box>
          </Paper>
        )
      })}

      {/* ── Bottom action bar ─────────────────────────────────────────────── */}
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Button
          variant="text"
          startIcon={<Add sx={{ fontSize: 18 }} />}
          onClick={addAuthor}
          sx={{ color: TEAL, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: TEAL_LIGHT } }}
        >
          Ajouter un auteur
        </Button>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="text"
            sx={{ color: MUTED, textTransform: 'none', '&:hover': { bgcolor: SURFACE } }}>
            Annuler les modifications
          </Button>
          <Button variant="contained"
            sx={{ bgcolor: TEAL, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: TEAL_DARK } }}>
            Enregistrer
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default Authors
