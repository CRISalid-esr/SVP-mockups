'use client'

import { useCallback, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import {
  Alert, Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid2 as Grid,
  IconButton, InputAdornment, Slider, Snackbar, Switch, FormControlLabel, TextField, ToggleButton, ToggleButtonGroup,
  Tooltip, Typography,
} from '@mui/material'
import {
  BusinessOutlined, CampaignOutlined, Close, Groups2Outlined, MailOutline, NewspaperOutlined, PersonOutline,
  PlaceOutlined, Search, TopicOutlined, VerifiedOutlined,
} from '@mui/icons-material'
import {
  AUDIENCE_CONFIG, Audience, CURRENT_YEAR, ResearchProfile, TEAL, TEAL_DARK, VISIBILITY_CONFIG, VOCAB_CONFIG,
  formatPeriod, isActiveIn,
} from '../../types'
import { AudienceSwitcher, RefsSummary, ThemePublicBlock } from '../ThemeDetail'
import { RefChip } from '../RefsPicker'
import {
  LAB_INFO, LAB_MEMBERS, LabEntry, LabMember, LabTopic, activeByYearAndTeam, aggregateRefs, aggregateTopics,
  isLabVisible, labEntries, yearRange,
} from './labMock'
import { PlaceHits, aggregatePlaces } from './labPlaces'

// Leaflet touche `window` à l'import : chargement côté client uniquement.
const LabFieldMap = dynamic(() => import('./LabFieldMap'), {
  ssr: false,
  loading: () => (
    <Box sx={{ height: 480, display: 'grid', placeItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Typography color="text.secondary">Chargement de la carte…</Typography>
    </Box>
  ),
})

// ─── Vue laboratoire v2 ──────────────────────────────────────────────────────
// Lecture seule. Le laboratoire ne saisit rien : il lit les thèmes datés de ses
// membres (diffusion établissement ou public, validés) et les regroupe par
// mot-clé contrôlé. La frise collective montre quand chaque sujet a été
// travaillé et par combien de personnes ; le curseur d'année permet de voir le
// laboratoire « tel qu'il était » une année donnée.

const TEAM_COLORS = ['#006A61', '#1565C0', '#8E24AA']

function teamColor(team: string): string {
  const i = LAB_INFO.teams.indexOf(team)
  return TEAM_COLORS[i >= 0 ? i : TEAM_COLORS.length - 1]
}

function initials(name: string): string {
  return name.replace(/\s*\(.*\)$/, '').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('')
}

function KpiTile({ icon, value, label, hint }: { icon: React.ReactNode; value: string | number; label: string; hint?: string }) {
  return (
    <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper', display: 'flex', gap: 1.5, alignItems: 'center' }}>
      <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#E8F5F4', color: TEAL, display: 'grid', placeItems: 'center' }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.1 }}>{value}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.3 }}>{label}</Typography>
        {hint && <Typography variant="caption" color="text.disabled" sx={{ display: 'block', lineHeight: 1.3 }}>{hint}</Typography>}
      </Box>
    </Box>
  )
}

function SectionTitle({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
        {hint && <Typography variant="body2" color="text.secondary">{hint}</Typography>}
      </Box>
      {action}
    </Box>
  )
}

/** Frise collective : une ligne par sujet, un trait par membre, sur l'axe commun des années. */
function TopicTimeline({ topics, years, onSelect }: { topics: LabTopic[]; years: number[]; onSelect: (t: LabTopic) => void }) {
  const min = years[0]
  const max = CURRENT_YEAR
  const span = Math.max(1, max - min)
  const ticks = years.filter((y) => (y - min) % Math.max(1, Math.ceil(span / 8)) === 0 || y === max)
  const pct = (y: number) => `${((y - min) / span) * 100}%`

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '300px 1fr 72px' }, gap: 2, px: 2, py: 1, bgcolor: '#F8FAFB', borderBottom: '1px solid', borderColor: 'divider', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sujet</Typography>
        <Box sx={{ position: 'relative', height: 16, display: { xs: 'none', md: 'block' } }}>
          {ticks.map((y) => (
            <Typography key={y} variant="caption" sx={{ position: 'absolute', left: pct(y), transform: 'translateX(-50%)', color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
              {y}
            </Typography>
          ))}
        </Box>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Membres</Typography>
      </Box>
      {topics.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ p: 3, fontStyle: 'italic', textAlign: 'center' }}>
          Aucun sujet ne correspond aux filtres.
        </Typography>
      )}
      {topics.map((t) => {
        const ongoing = t.yearTo == null
        return (
          <Box key={t.key} role="button" tabIndex={0} onClick={() => onSelect(t)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(t) } }}
            aria-label={`Voir les membres travaillant sur ${t.label}`}
            sx={{
              display: 'grid', gridTemplateColumns: { xs: '1fr', md: '300px 1fr 72px' }, gap: 2, px: 2, py: 1.25, alignItems: 'center',
              borderBottom: '1px solid', borderColor: 'divider', cursor: 'pointer',
              '&:hover': { bgcolor: `${TEAL}06` }, '&:focus-visible': { outline: `2px solid ${TEAL}`, outlineOffset: -2 },
            }}>
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{t.label}</Typography>
                {t.vocabulary && (
                  <Typography variant="caption" sx={{ color: VOCAB_CONFIG[t.vocabulary].color, fontWeight: 700, fontSize: '0.62rem', flexShrink: 0 }}>
                    {VOCAB_CONFIG[t.vocabulary].tag}
                  </Typography>
                )}
              </Box>
              <Typography variant="caption" color="text.secondary">
                {t.yearFrom} → {ongoing ? 'en cours' : t.yearTo} · {t.teams.length > 1 ? `${t.teams.length} équipes` : t.teams[0]}
                {t.acceptsPress ? ' · presse' : ''}
              </Typography>
            </Box>
            <Box sx={{ position: 'relative', minHeight: 14, py: 0.5 }}>
              {ticks.map((y) => (
                <Box key={y} sx={{ position: 'absolute', top: 0, bottom: 0, left: pct(y), borderLeft: '1px dashed', borderColor: 'divider' }} />
              ))}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', position: 'relative' }}>
                {t.entries.slice(0, 6).map((e) => {
                  const from = e.theme.yearFrom ?? min
                  const to = e.theme.yearTo ?? max
                  return (
                    <Tooltip key={e.theme.id} title={`${e.member.name} · ${formatPeriod(e.theme)}`}>
                      <Box sx={{
                        position: 'relative', height: 5, borderRadius: 3,
                        ml: pct(from), width: `max(4px, ${((Math.max(to, from + 0.3) - from) / span) * 100}%)`,
                        bgcolor: teamColor(e.member.team), opacity: e.theme.yearTo == null ? 1 : 0.45,
                      }} />
                    </Tooltip>
                  )
                })}
                {t.entries.length > 6 && (
                  <Typography variant="caption" color="text.disabled">+{t.entries.length - 6}</Typography>
                )}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5 }}>
              {t.entries.slice(0, 3).map((e) => (
                <Avatar key={e.member.id} sx={{ width: 22, height: 22, fontSize: '0.6rem', bgcolor: teamColor(e.member.team), ml: -0.75 }}>{initials(e.member.name)}</Avatar>
              ))}
              <Typography variant="body2" sx={{ fontWeight: 700, ml: 0.5 }}>{t.entries.length}</Typography>
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}

interface Props {
  researcherName: string
  ownProfile: ResearchProfile
}

export default function LabView({ researcherName, ownProfile }: Props) {
  const [team, setTeam] = useState<string>('all')
  const [yearMode, setYearMode] = useState<'all' | 'year'>('all')
  const [year, setYear] = useState<number>(CURRENT_YEAR)
  const [query, setQuery] = useState('')
  const [pressOnly, setPressOnly] = useState(false)
  const [eventsOnly, setEventsOnly] = useState(false)
  const [topic, setTopic] = useState<LabTopic | null>(null)
  const [placeHits, setPlaceHits] = useState<PlaceHits | null>(null)
  const [entry, setEntry] = useState<LabEntry | null>(null)
  const [audience, setAudience] = useState<Audience | null>(null)
  const [snackbar, setSnackbar] = useState('')

  // Le profil connecté est un membre comme les autres : ses thèmes validés non privés remontent ici.
  const members: LabMember[] = useMemo(() => [
    ...LAB_MEMBERS,
    { id: 'me', name: `${researcherName} (vous)`, team: LAB_INFO.teams[0], themes: ownProfile.themes },
  ], [researcherName, ownProfile.themes])

  const teamMembers = useMemo(() => (team === 'all' ? members : members.filter((m) => m.team === team)), [members, team])
  const allEntries = useMemo(() => labEntries(teamMembers), [teamMembers])
  const years = useMemo(() => yearRange(labEntries(members)), [members])
  const entries = useMemo(() => (yearMode === 'year' ? allEntries.filter((e) => isActiveIn(e.theme, year)) : allEntries), [allEntries, yearMode, year])
  const topics = useMemo(() => {
    const q = query.trim().toLowerCase()
    const all = aggregateTopics(entries)
    return q ? all.filter((t) => t.label.toLowerCase().includes(q) || t.entries.some((e) => e.theme.label.toLowerCase().includes(q) || e.member.name.toLowerCase().includes(q))) : all
  }, [entries, query])

  const places = useMemo(() => aggregateRefs(entries, (t) => t.places), [entries])
  const placeList = useMemo(() => aggregatePlaces(entries), [entries])
  const selectPlace = useCallback((hits: PlaceHits) => setPlaceHits(hits), [])
  const orgs = useMemo(() => aggregateRefs(entries, (t) => t.organizations), [entries])
  const persons = useMemo(() => aggregateRefs(entries, (t) => t.persons), [entries])

  const filled = teamMembers.filter((m) => m.themes.some(isLabVisible))
  const empty = teamMembers.filter((m) => !m.themes.some(isLabVisible))
  const publicEntries = entries.filter((e) => e.theme.visibility === 'public')
  const pressMembers = new Set(publicEntries.filter((e) => e.theme.acceptsPress).map((e) => e.member.id))
  const ownHidden = ownProfile.themes.filter((t) => !isLabVisible(t)).length

  const directory = publicEntries
    .filter((e) => (!pressOnly || e.theme.acceptsPress) && (!eventsOnly || e.theme.acceptsEvents))
    .filter((e) => {
      const q = query.trim().toLowerCase()
      return !q || e.theme.label.toLowerCase().includes(q) || e.member.name.toLowerCase().includes(q)
    })
    .sort((a, b) => a.member.name.localeCompare(b.member.name, 'fr'))

  const chartOption: EChartsOption = useMemo(() => {
    const series = activeByYearAndTeam(allEntries, years)
    return {
      tooltip: { trigger: 'axis' },
      legend: { top: 0, left: 'center', textStyle: { fontSize: 11 }, itemWidth: 14, itemHeight: 10 },
      grid: { left: 36, right: 12, top: 52, bottom: 28 },
      xAxis: { type: 'category', data: years.map(String), axisLabel: { fontSize: 10, interval: Math.ceil(years.length / 10) - 1 } },
      yAxis: { type: 'value', minInterval: 1, axisLabel: { fontSize: 10 } },
      series: LAB_INFO.teams.map((t) => ({
        name: t, type: 'bar', stack: 'total', data: series[t] ?? [], itemStyle: { color: teamColor(t) }, barMaxWidth: 18,
        markLine: yearMode === 'year' && t === LAB_INFO.teams[0]
          ? { symbol: 'none', lineStyle: { color: '#E65100' }, label: { show: false }, data: [{ xAxis: String(year) }] }
          : undefined,
      })),
    }
  }, [allEntries, years, yearMode, year])

  const openEntry = (e: LabEntry) => { setEntry(e); setAudience(null) }

  return (
    <Box sx={{ p: 3, maxWidth: 1360, mx: 'auto' }}>
      {/* En-tête */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>{LAB_INFO.name}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 720 }}>
            Le laboratoire ne saisit rien : cette vue agrège les thèmes de recherche datés déclarés par ses membres
            (diffusion établissement ou public, validés), regroupés par mot-clé contrôlé. Les thèmes privés et les
            brouillons n’apparaissent pas.
          </Typography>
        </Box>
        <ToggleButtonGroup size="small" exclusive value={team} onChange={(_e, v: string | null) => v && setTeam(v)} aria-label="Équipe"
          sx={{ flexWrap: 'wrap', '& .MuiToggleButton-root': { textTransform: 'none', px: 1.5 } }}>
          <ToggleButton value="all" sx={{ '&.Mui-selected': { bgcolor: `${TEAL}14`, color: TEAL, fontWeight: 700 } }}>Tout le laboratoire</ToggleButton>
          {LAB_INFO.teams.map((t) => (
            <ToggleButton key={t} value={t} sx={{ gap: 0.75, '&.Mui-selected': { bgcolor: `${teamColor(t)}14`, color: teamColor(t), fontWeight: 700 } }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: teamColor(t) }} />
              {t}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {ownHidden > 0 && (
        <Alert severity="info" variant="outlined" sx={{ mb: 2.5 }}>
          {ownHidden === 1 ? '1 de vos thèmes n’est pas visible ici' : `${ownHidden} de vos thèmes ne sont pas visibles ici`} (privé ou brouillon).
          Le laboratoire voit uniquement ce que vous avez validé en diffusion « établissement » ou « public ».
        </Alert>
      )}

      {/* KPI */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}><KpiTile icon={<Groups2Outlined />} value={teamMembers.length} label="Membres" hint={team === 'all' ? `${LAB_INFO.teams.length} équipes` : undefined} /></Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}><KpiTile icon={<VerifiedOutlined />} value={`${filled.length}/${teamMembers.length}`} label="Profils renseignés" hint={empty.length ? `${empty.length} sans thème visible` : 'Tous renseignés'} /></Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}><KpiTile icon={<TopicOutlined />} value={aggregateTopics(allEntries).length} label="Sujets distincts" hint={`${allEntries.length} thèmes déclarés`} /></Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}><KpiTile icon={<VISIBILITY_CONFIG.public.Icon />} value={publicEntries.length} label="Thèmes publics" hint={`${allEntries.length - publicEntries.length} limités à l’établissement`} /></Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}><KpiTile icon={<NewspaperOutlined />} value={pressMembers.size} label="Joignables par la presse" hint="au moins un thème public" /></Grid>
        <Grid size={{ xs: 6, sm: 4, md: 2 }}><KpiTile icon={<PlaceOutlined />} value={places.length} label="Terrains distincts" hint={places[0] ? `1er : ${places[0].ref.label}` : undefined} /></Grid>
      </Grid>

      {/* Filtres */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap', p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper' }}>
        <TextField size="small" placeholder="Rechercher un sujet, un membre…" value={query} onChange={(e) => setQuery(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
          inputProps={{ 'aria-label': 'Rechercher un sujet ou un membre' }} sx={{ minWidth: 260 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 320 }}>
          <FormControlLabel
            control={<Switch size="small" checked={yearMode === 'year'} onChange={(e) => setYearMode(e.target.checked ? 'year' : 'all')}
              sx={{ '& .Mui-checked': { color: TEAL }, '& .Mui-checked + .MuiSwitch-track': { bgcolor: `${TEAL} !important` } }} />}
            label={<Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>{yearMode === 'year' ? `Le laboratoire en ${year}` : 'Toute la période'}</Typography>}
            sx={{ ml: 0, mr: 0 }}
          />
          <Slider
            size="small" disabled={yearMode !== 'year'} value={year} min={years[0]} max={CURRENT_YEAR} step={1}
            marks={[{ value: years[0], label: String(years[0]) }, { value: CURRENT_YEAR, label: String(CURRENT_YEAR) }]}
            valueLabelDisplay="auto" onChange={(_e, v) => setYear(v as number)}
            aria-label="Année"
            sx={{ color: TEAL, maxWidth: 420, '& .MuiSlider-markLabel': { fontSize: '0.7rem' } }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
          {yearMode === 'year' ? `${entries.length} thème${entries.length > 1 ? 's' : ''} actif${entries.length > 1 ? 's' : ''} en ${year}` : `${entries.length} thème${entries.length > 1 ? 's' : ''} déclaré${entries.length > 1 ? 's' : ''}`}
        </Typography>
      </Box>

      {/* Frise collective */}
      <Box sx={{ mb: 4 }}>
        <SectionTitle title="Frise des sujets du laboratoire"
          hint="Un trait par membre : quand le sujet a été travaillé, par qui, et s’il l’est encore. Les sujets se regroupent par mot-clé contrôlé (RAMEAU, Wikidata, MeSH)." />
        <TopicTimeline topics={topics} years={years} onSelect={setTopic} />
      </Box>

      {/* Carte des terrains */}
      <Box sx={{ mb: 4 }}>
        <SectionTitle title="Carte des terrains"
          hint="Lieux cités dans les thèmes visibles du laboratoire (repères GeoNames). Un cercle par terrain, taille proportionnelle au nombre de thèmes ; les filtres d’équipe et d’année s’appliquent." />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <LabFieldMap entries={entries} teamColor={teamColor} onSelectPlace={selectPlace} height={440} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper', overflow: 'hidden' }}>
              <Box sx={{ px: 2, py: 1, bgcolor: '#F8FAFB', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Terrains les plus cités
                </Typography>
              </Box>
              <Box sx={{ maxHeight: 440, overflowY: 'auto' }}>
                {placeList.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, fontStyle: 'italic' }}>Aucun terrain pour ces filtres.</Typography>
                )}
                {placeList.map((p) => (
                  <Box key={p.place.label} role="button" tabIndex={0} onClick={() => selectPlace(p)}
                    onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); selectPlace(p) } }}
                    aria-label={`Voir les membres travaillant à ${p.place.label}`}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 0.9, cursor: 'pointer',
                      borderBottom: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: `${TEAL}06` },
                      '&:focus-visible': { outline: `2px solid ${TEAL}`, outlineOffset: -2 },
                    }}>
                    <PlaceOutlined sx={{ fontSize: 16, color: p.coords ? TEAL : 'text.disabled' }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{p.place.label}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                        {p.place.detail ?? 'Lieu'}{p.coords ? '' : ' · non localisé'} · {p.members.length} membre{p.members.length > 1 ? 's' : ''}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: TEAL, fontVariantNumeric: 'tabular-nums' }}>{p.entries.length}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionTitle title="Thèmes actifs par année" hint="Nombre de thèmes travaillés chaque année, par équipe." />
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper', p: 1 }}>
            <ReactECharts option={chartOption} style={{ height: 280 }} notMerge />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionTitle title="Organisations et personnes" hint="Repères structurés cités dans les thèmes, avec le nombre de thèmes qui les mentionnent." />
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[
              { kind: 'organization' as const, Icon: BusinessOutlined, title: 'Organisations', items: orgs },
              { kind: 'person' as const, Icon: PersonOutline, title: 'Personnes', items: persons },
            ].map((g) => (
              <Box key={g.kind}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
                  <g.Icon sx={{ fontSize: 16, color: TEAL }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{g.title}</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {g.items.length === 0 && <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>Aucun</Typography>}
                  {g.items.slice(0, 12).map((it) => (
                    <Tooltip key={it.ref.label} title={it.members.join(', ')}>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                        <RefChip kind={g.kind} value={{ ...it.ref, detail: undefined, dates: undefined } as typeof it.ref} size="small" />
                        <Typography variant="caption" sx={{ ml: 0.25, mr: 0.5, fontWeight: 700, color: TEAL }}>×{it.count}</Typography>
                      </Box>
                    </Tooltip>
                  ))}
                  {g.items.length > 12 && <Typography variant="caption" color="text.disabled">+{g.items.length - 12}</Typography>}
                </Box>
              </Box>
            ))}
          </Box>
        </Grid>
      </Grid>

      {/* Annuaire des expertises publiques */}
      <Box sx={{ mb: 4 }}>
        <SectionTitle title="Expertises publiques"
          hint="Thèmes publics des membres, tels que les voient les portails. Filtrez pour trouver qui répond à la presse ou intervient en événements."
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip icon={<NewspaperOutlined sx={{ fontSize: 16 }} />} label="Accepte la presse" clickable variant={pressOnly ? 'filled' : 'outlined'}
                onClick={() => setPressOnly((v) => !v)} sx={pressOnly ? { bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 700, '& .MuiChip-icon': { color: '#2E7D32' } } : {}} />
              <Chip icon={<CampaignOutlined sx={{ fontSize: 16 }} />} label="Événements grand public" clickable variant={eventsOnly ? 'filled' : 'outlined'}
                onClick={() => setEventsOnly((v) => !v)} sx={eventsOnly ? { bgcolor: '#E3F2FD', color: '#1565C0', fontWeight: 700, '& .MuiChip-icon': { color: '#1565C0' } } : {}} />
            </Box>
          } />
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper' }}>
          {directory.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ p: 3, fontStyle: 'italic', textAlign: 'center' }}>Aucune expertise publique ne correspond.</Typography>
          )}
          {directory.map((e) => (
            <Box key={e.theme.id} role="button" tabIndex={0} onClick={() => openEntry(e)}
              onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openEntry(e) } }}
              aria-label={`Voir l’expertise ${e.theme.label} de ${e.member.name}`}
              sx={{
                display: 'grid', gridTemplateColumns: { xs: '1fr', md: '240px 1fr 150px 170px' }, gap: 2, alignItems: 'center', px: 2, py: 1.25,
                borderBottom: '1px solid', borderColor: 'divider', cursor: 'pointer', '&:hover': { bgcolor: `${TEAL}06` },
                '&:focus-visible': { outline: `2px solid ${TEAL}`, outlineOffset: -2 },
              }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                <Avatar sx={{ width: 30, height: 30, fontSize: '0.75rem', bgcolor: teamColor(e.member.team) }}>{initials(e.member.name)}</Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{e.member.name}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{e.member.team}</Typography>
                </Box>
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{e.theme.label}</Typography>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                  {e.theme.places.map((p) => p.label).join(', ') || e.theme.keywords.slice(0, 3).map((k) => k.label).join(', ')}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums', color: e.theme.yearTo == null ? 'text.primary' : 'text.secondary' }}>
                {formatPeriod(e.theme)}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {e.theme.acceptsPress && <Chip size="small" icon={<NewspaperOutlined sx={{ fontSize: 13 }} />} label="Presse" sx={{ height: 22, fontSize: '0.7rem', bgcolor: '#E8F5E9', color: '#2E7D32', '& .MuiChip-icon': { color: '#2E7D32' } }} />}
                {e.theme.acceptsEvents && <Chip size="small" icon={<CampaignOutlined sx={{ fontSize: 13 }} />} label="Événements" sx={{ height: 22, fontSize: '0.7rem', bgcolor: '#E3F2FD', color: '#1565C0', '& .MuiChip-icon': { color: '#1565C0' } }} />}
                {!e.theme.acceptsPress && !e.theme.acceptsEvents && <Typography variant="caption" color="text.disabled">Pas de sollicitation</Typography>}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Complétude */}
      <Box sx={{ mb: 4 }}>
        <SectionTitle title="Complétude des profils"
          hint="Qui a déclaré au moins un thème visible par le laboratoire. Les thèmes privés d’un membre comptent pour lui, pas pour le laboratoire."
          action={
            <Button size="small" variant="outlined" startIcon={<MailOutline />} disabled={empty.length === 0}
              onClick={() => setSnackbar(`Relance envoyée à ${empty.length} membre${empty.length > 1 ? 's' : ''} (simulation)`)}
              sx={{ textTransform: 'none', borderColor: TEAL, color: TEAL }}>
              Relancer les {empty.length} membres sans profil
            </Button>
          } />
        <Grid container spacing={2}>
          {(team === 'all' ? LAB_INFO.teams : [team]).map((t) => {
            const ms = members.filter((m) => m.team === t)
            return (
              <Grid key={t} size={{ xs: 12, md: 4 }}>
                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper', p: 2, borderTop: `3px solid ${teamColor(t)}` }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>{t}</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    {ms.map((m) => {
                      const visible = m.themes.filter(isLabVisible)
                      const drafts = m.themes.filter((th) => th.status === 'draft').length
                      return (
                        <Box key={m.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 26, height: 26, fontSize: '0.65rem', bgcolor: visible.length ? teamColor(t) : '#BDBDBD' }}>{initials(m.name)}</Avatar>
                          <Typography variant="body2" sx={{ flex: 1, color: visible.length ? 'text.primary' : 'text.secondary' }} noWrap>{m.name}</Typography>
                          {visible.length ? (
                            <Chip size="small" label={`${visible.length} thème${visible.length > 1 ? 's' : ''}`} sx={{ height: 20, fontSize: '0.68rem', bgcolor: '#E8F5F4', color: TEAL, fontWeight: 600 }} />
                          ) : drafts ? (
                            <Chip size="small" label="Brouillon seulement" sx={{ height: 20, fontSize: '0.68rem', bgcolor: '#FFF3E0', color: '#E65100', fontWeight: 600 }} />
                          ) : (
                            <Chip size="small" label="Profil vide" variant="outlined" sx={{ height: 20, fontSize: '0.68rem', color: 'text.disabled' }} />
                          )}
                        </Box>
                      )
                    })}
                  </Box>
                </Box>
              </Grid>
            )
          })}
        </Grid>
      </Box>

      {/* Dialogue : membres d'un sujet */}
      <Dialog open={Boolean(topic)} onClose={() => setTopic(null)} maxWidth="sm" fullWidth>
        {topic && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, pr: 6 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" component="span" sx={{ fontWeight: 700, display: 'block' }}>{topic.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {topic.vocabulary ? `${VOCAB_CONFIG[topic.vocabulary].label} · ` : ''}{topic.yearFrom} → {topic.yearTo ?? 'en cours'} · {topic.entries.length} membre{topic.entries.length > 1 ? 's' : ''}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setTopic(null)} aria-label="Fermer" sx={{ position: 'absolute', right: 12, top: 12 }}><Close fontSize="small" /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {topic.entries.map((e) => {
                  const vis = VISIBILITY_CONFIG[e.theme.visibility]
                  return (
                    <Box key={e.theme.id} role="button" tabIndex={0} onClick={() => { setTopic(null); openEntry(e) }}
                      onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); setTopic(null); openEntry(e) } }}
                      sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, borderRadius: 2, border: '1px solid', borderColor: 'divider', cursor: 'pointer', '&:hover': { bgcolor: `${TEAL}06` } }}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', bgcolor: teamColor(e.member.team) }}>{initials(e.member.name)}</Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{e.member.name}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{e.theme.label} · {formatPeriod(e.theme)}</Typography>
                      </Box>
                      <Chip size="small" icon={<vis.Icon sx={{ fontSize: 13 }} />} label={vis.short} sx={{ height: 22, fontSize: '0.7rem', bgcolor: vis.bg, color: vis.color, '& .MuiChip-icon': { color: vis.color } }} />
                    </Box>
                  )
                })}
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Dialogue : membres travaillant sur un terrain */}
      <Dialog open={Boolean(placeHits)} onClose={() => setPlaceHits(null)} maxWidth="sm" fullWidth>
        {placeHits && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, pr: 6 }}>
              <PlaceOutlined sx={{ color: TEAL, mt: 0.5 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" component="span" sx={{ fontWeight: 700, display: 'block' }}>{placeHits.place.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {placeHits.place.detail ?? 'Lieu'}{placeHits.place.geonamesId ? ` · GeoNames ${placeHits.place.geonamesId}` : ' · non aligné'}
                  {' · '}{placeHits.entries.length} thème{placeHits.entries.length > 1 ? 's' : ''} · {placeHits.members.length} membre{placeHits.members.length > 1 ? 's' : ''}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setPlaceHits(null)} aria-label="Fermer" sx={{ position: 'absolute', right: 12, top: 12 }}><Close fontSize="small" /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {placeHits.entries.map((e) => {
                  const vis = VISIBILITY_CONFIG[e.theme.visibility]
                  return (
                    <Box key={e.theme.id} role="button" tabIndex={0} onClick={() => { setPlaceHits(null); openEntry(e) }}
                      onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); setPlaceHits(null); openEntry(e) } }}
                      sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, borderRadius: 2, border: '1px solid', borderColor: 'divider', cursor: 'pointer', '&:hover': { bgcolor: `${TEAL}06` } }}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', bgcolor: teamColor(e.member.team) }}>{initials(e.member.name)}</Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{e.member.name}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{e.theme.label} · {formatPeriod(e.theme)}</Typography>
                      </Box>
                      <Chip size="small" icon={<vis.Icon sx={{ fontSize: 13 }} />} label={vis.short} sx={{ height: 22, fontSize: '0.7rem', bgcolor: vis.bg, color: vis.color, '& .MuiChip-icon': { color: vis.color } }} />
                    </Box>
                  )
                })}
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Dialogue : détail d'un thème, décliné par public */}
      <Dialog open={Boolean(entry)} onClose={() => setEntry(null)} maxWidth="md" fullWidth>
        {entry && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pr: 6 }}>
              <Avatar sx={{ width: 40, height: 40, bgcolor: teamColor(entry.member.team) }}>{initials(entry.member.name)}</Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" component="span" sx={{ fontWeight: 700, display: 'block', lineHeight: 1.2 }}>{entry.member.name}</Typography>
                <Typography variant="caption" color="text.secondary">{entry.member.team} · {LAB_INFO.shortName}</Typography>
              </Box>
              <IconButton size="small" onClick={() => setEntry(null)} aria-label="Fermer" sx={{ position: 'absolute', right: 12, top: 12 }}><Close fontSize="small" /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
              {entry.theme.visibility === 'public' ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 2.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Voir comme :</Typography>
                  <AudienceSwitcher value={audience} onChange={setAudience} />
                </Box>
              ) : (
                <Alert severity="info" variant="outlined" sx={{ mb: 2.5 }}>
                  Thème limité à l’établissement : il n’est pas publié sur les portails et n’a pas de déclinaison par public.
                </Alert>
              )}
              <ThemePublicBlock theme={entry.theme} audience={entry.theme.visibility === 'public' ? audience : null} />
              {audience && (
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 2 }}>
                  {AUDIENCE_CONFIG[audience].label} — {AUDIENCE_CONFIG[audience].question}
                </Typography>
              )}
              <Divider sx={{ my: 2.5 }} />
              <RefsSummary theme={entry.theme} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEntry(null)} sx={{ textTransform: 'none' }}>Fermer</Button>
              <Button variant="contained" startIcon={<MailOutline />} disabled={!entry.theme.acceptsPress && !entry.theme.acceptsEvents}
                onClick={() => { setSnackbar(`Demande de mise en relation avec ${entry.member.name} transmise (simulation)`); setEntry(null) }}
                sx={{ textTransform: 'none', bgcolor: TEAL, '&:hover': { bgcolor: TEAL_DARK } }}>
                Mettre en relation
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3500} onClose={() => setSnackbar('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackbar('')}>{snackbar}</Alert>
      </Snackbar>
    </Box>
  )
}
