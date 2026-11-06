'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import * as Lingui from '@lingui/core'
import {
  Alert, Avatar, Box, Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Link, Snackbar,
  Tooltip, Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Close, MailOutline, PersonOutline, PlaceOutlined } from '@mui/icons-material'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnFiltersState } from 'material-react-table'
import { TabFilter } from '@/components/TabFilter'
import ListFilterBar, { FilterDefinition } from '@/components/ListTable/ListFilterBar'
import { listTableProps, listTitleSx } from '@/components/ListTable/listTableProps'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'
import { Localization } from '@/types/Localization'
import {
  Audience, CURRENT_YEAR, ResearchProfile, ResearchTheme, VISIBILITY_CONFIG, formatPeriod,
} from '../../types'
import { AudienceSwitcher, ThemePublicBlock } from '../ThemeDetail'
import { RefChip } from '../RefsPicker'
import {
  LAB_INFO, LAB_MEMBERS, LabEntry, LabMember, LabTopic, activeByYearAndTeam, aggregateRefs, aggregateTopics,
  initials, isLabVisible, labEntries, teamColor, yearRange,
} from './labMock'
import { PlaceHits, aggregatePlaces } from './labPlaces'

// Leaflet touche `window` à l'import : chargement côté client uniquement.
const LabFieldMap = dynamic(() => import('./LabFieldMap'), {
  ssr: false,
  loading: () => (
    <Box sx={{ height: 440, display: 'grid', placeItems: 'center' }}>
      <Typography color="text.secondary">Chargement de la carte…</Typography>
    </Box>
  ),
})

// ─── Vue laboratoire ─────────────────────────────────────────────────────────
// Lecture seule. Le laboratoire ne saisit rien : il lit les thèmes datés de ses
// membres (diffusion établissement ou public, validés) et les regroupe par
// mot-clé contrôlé. Une question par onglet : de quoi parle-t-on, où, qui peut
// répondre à l'extérieur, et qui a renseigné son profil.

type LabTab = 'topics' | 'places' | 'public' | 'members'

interface Props {
  researcherName: string
  ownProfile: ResearchProfile
  /** La personne connectée est membre de cette structure : ses thèmes remontent dans l'agrégat. */
  includeOwn?: boolean
  /** Équipe présélectionnée quand la perspective est une équipe. */
  initialTeam?: string
  /** Ouvre le profil d'un membre en lecture seule (ou le sien, id « me »). */
  onOpenMember: (member: LabMember) => void
}

const yearOf = (date: unknown) => (typeof date === 'string' ? Number(date.slice(0, 4)) : null)

/** Le thème a-t-il été travaillé pendant cette plage d'années ? */
const overlaps = (theme: ResearchTheme, from: number | null, to: number | null) =>
  (to == null || (theme.yearFrom ?? -Infinity) <= to) && (from == null || (theme.yearTo ?? CURRENT_YEAR) >= from)

const tableProps = {
  ...listTableProps,
  enableSorting: false,
  enablePagination: false,
  enableBottomToolbar: false,
} as const

function Kpi({ value, label }: { value: string | number; label: string }) {
  return (
    <Card sx={{ p: 2.5 }}>
      <Typography variant="h4" component="p">{value}</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>{label}</Typography>
    </Card>
  )
}

function EmptyRows({ children }: { children: React.ReactNode }) {
  return <Typography color="text.secondary" sx={{ p: 4, textAlign: 'center' }}>{children}</Typography>
}

/** Dialogue listant les thèmes d'un sujet ou d'un terrain. */
function EntriesDialog({ title, subtitle, entries, onOpenEntry, onClose }: {
  title: string
  subtitle: string
  entries: LabEntry[]
  onOpenEntry: (entry: LabEntry) => void
  onClose: () => void
}) {
  return (
    <>
      <DialogTitle sx={{ pr: 6 }}>
        <Typography variant="h6" component="span" sx={{ display: 'block' }}>{title}</Typography>
        <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
        <IconButton size="small" onClick={onClose} aria-label="Fermer" sx={{ position: 'absolute', right: 12, top: 12 }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'grid', gap: 1 }}>
          {entries.map((e) => {
            const vis = VISIBILITY_CONFIG[e.theme.visibility]
            return (
              <Box
                key={e.theme.id}
                role="button"
                tabIndex={0}
                onClick={() => onOpenEntry(e)}
                onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); onOpenEntry(e) } }}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, borderRadius: 2, border: '1px solid', borderColor: 'divider',
                  cursor: 'pointer', '&:hover': { bgcolor: 'navHover' },
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body1" fontWeight={600}>{e.member.name}</Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>{e.theme.label} · {formatPeriod(e.theme)}</Typography>
                </Box>
                <Chip size="small" label={vis.short} sx={{ bgcolor: vis.bg, color: vis.color }} />
              </Box>
            )
          })}
        </Box>
      </DialogContent>
    </>
  )
}

export default function LabView({ researcherName, ownProfile, includeOwn = true, initialTeam = 'all', onOpenMember }: Props) {
  const muiTheme = useTheme()
  const lang = Lingui.i18n.locale as ExtendedLanguageCode
  const [tab, setTab] = useState<LabTab>('topics')
  const [filters, setFilters] = useState<MRT_ColumnFiltersState>(
    initialTeam === 'all' ? [] : [{ id: 'team', value: [initialTeam] }],
  )
  const [query, setQuery] = useState('')
  const [topic, setTopic] = useState<LabTopic | null>(null)
  const [placeHits, setPlaceHits] = useState<PlaceHits | null>(null)
  const [entry, setEntry] = useState<LabEntry | null>(null)
  const [audience, setAudience] = useState<Audience | null>(null)
  const [snackbar, setSnackbar] = useState('')

  const filterValue = <T,>(id: string) => filters.find((f) => f.id === id)?.value as T | undefined
  const teams = filterValue<string[]>('team') ?? []
  const solicitations = filterValue<string[]>('solicitation') ?? []
  const [dateFrom, dateTo] = filterValue<(string | null)[]>('date') ?? []
  const term = query.trim().toLowerCase()

  // Le profil connecté est un membre comme les autres : ses thèmes validés non privés remontent ici.
  const members: LabMember[] = useMemo(() => [
    ...LAB_MEMBERS,
    ...(includeOwn ? [{ id: 'me', name: `${researcherName} (vous)`, team: LAB_INFO.teams[0], themes: ownProfile.themes }] : []),
  ], [researcherName, ownProfile.themes, includeOwn])

  const teamMembers = useMemo(
    () => (teams.length ? members.filter((m) => teams.includes(m.team)) : members),
    [members, teams],
  )
  const allEntries = useMemo(() => labEntries(teamMembers), [teamMembers])
  const years = useMemo(() => yearRange(labEntries(members)), [members])
  const entries = useMemo(() => {
    const from = yearOf(dateFrom)
    const to = yearOf(dateTo)
    return allEntries.filter((e) => overlaps(e.theme, from, to))
  }, [allEntries, dateFrom, dateTo])

  const topics = useMemo(() => {
    const all = aggregateTopics(entries)
    return term
      ? all.filter((t) => t.label.toLowerCase().includes(term)
        || t.entries.some((e) => e.theme.label.toLowerCase().includes(term) || e.member.name.toLowerCase().includes(term)))
      : all
  }, [entries, term])

  const placeList = useMemo(() => aggregatePlaces(entries), [entries])
  const orgs = useMemo(() => aggregateRefs(entries, (t) => t.organizations), [entries])
  const persons = useMemo(() => aggregateRefs(entries, (t) => t.persons), [entries])

  const filled = teamMembers.filter((m) => m.themes.some(isLabVisible))
  const empty = teamMembers.filter((m) => !m.themes.some(isLabVisible))
  const publicEntries = entries.filter((e) => e.theme.visibility === 'public')
  const pressMembers = new Set(publicEntries.filter((e) => e.theme.acceptsPress).map((e) => e.member.id))
  const ownHidden = includeOwn ? ownProfile.themes.filter((t) => !isLabVisible(t)).length : 0

  const directory = publicEntries
    .filter((e) => !solicitations.length
      || (solicitations.includes('press') && e.theme.acceptsPress)
      || (solicitations.includes('events') && e.theme.acceptsEvents))
    .filter((e) => !term || e.theme.label.toLowerCase().includes(term) || e.member.name.toLowerCase().includes(term))
    .sort((a, b) => a.member.name.localeCompare(b.member.name, 'fr'))

  const shownMembers = teamMembers
    .filter((m) => !term || m.name.toLowerCase().includes(term))

  const chartOption: EChartsOption = useMemo(() => {
    const series = activeByYearAndTeam(allEntries, years)
    return {
      tooltip: { trigger: 'axis' },
      legend: { top: 0, left: 'center', textStyle: { fontSize: 11 }, itemWidth: 14, itemHeight: 10 },
      grid: { left: 36, right: 12, top: 40, bottom: 28 },
      xAxis: { type: 'category', data: years.map(String), axisLabel: { fontSize: 10, interval: Math.ceil(years.length / 10) - 1 } },
      yAxis: { type: 'value', minInterval: 1, axisLabel: { fontSize: 10 } },
      series: LAB_INFO.teams.map((t) => ({
        name: t, type: 'bar', stack: 'total', data: series[t] ?? [], itemStyle: { color: teamColor(t) }, barMaxWidth: 18,
      })),
    }
  }, [allEntries, years])

  const openEntry = (e: LabEntry) => {
    setTopic(null)
    setPlaceHits(null)
    setEntry(e)
    setAudience(null)
  }

  const topicColumns = useMemo<MRT_ColumnDef<LabTopic>[]>(() => [
    {
      id: 'label',
      header: 'Sujet',
      size: 340,
      grow: true,
      Cell: ({ row: { original: t } }) => (
        <Link component="button" underline="hover" aria-label={`Voir les membres travaillant sur ${t.label}`} sx={listTitleSx}>
          {t.label}
        </Link>
      ),
    },
    { id: 'period', header: 'Période', size: 170, Cell: ({ row: { original: t } }) => `${t.yearFrom} → ${t.yearTo ?? 'en cours'}` },
    { id: 'teams', header: 'Équipes', size: 200, Cell: ({ row: { original: t } }) => (t.teams.length > 1 ? `${t.teams.length} équipes` : t.teams[0]) },
    { id: 'members', header: 'Membres', size: 110, Cell: ({ row: { original: t } }) => t.entries.length },
  ], [])

  const directoryColumns = useMemo<MRT_ColumnDef<LabEntry>[]>(() => [
    {
      id: 'theme',
      header: 'Expertise',
      size: 340,
      grow: true,
      Cell: ({ row: { original: e } }) => (
        <Link component="button" underline="hover" aria-label={`Voir l’expertise ${e.theme.label} de ${e.member.name}`} sx={listTitleSx}>
          {e.theme.label}
        </Link>
      ),
    },
    { id: 'member', header: 'Membre', size: 200, Cell: ({ row: { original: e } }) => e.member.name },
    { id: 'period', header: 'Période', size: 150, Cell: ({ row: { original: e } }) => formatPeriod(e.theme) },
    {
      id: 'solicitations',
      header: 'Sollicitations',
      size: 190,
      Cell: ({ row: { original: { theme } } }) =>
        [theme.acceptsPress ? 'Presse' : null, theme.acceptsEvents ? 'Événements' : null].filter(Boolean).join(' · '),
    },
  ], [])

  const memberColumns = useMemo<MRT_ColumnDef<LabMember>[]>(() => [
    {
      id: 'name',
      header: 'Membre',
      size: 300,
      grow: true,
      Cell: ({ row: { original: m } }) => (
        <Link component="button" underline="hover" aria-label={`Voir le profil de recherche de ${m.name}`} sx={listTitleSx}>
          {m.name}
        </Link>
      ),
    },
    { id: 'team', header: 'Équipe', size: 220, Cell: ({ row: { original: m } }) => m.team },
    {
      id: 'profile',
      header: 'Profil',
      size: 200,
      Cell({ row: { original: m } }) {
        const visible = m.themes.filter(isLabVisible).length
        if (visible) return `${visible} thème${visible > 1 ? 's' : ''}`
        return m.themes.some((t) => t.status === 'draft')
          ? <Chip size="small" color="warning" label="Brouillon seulement" />
          : <Chip size="small" label="Profil vide" />
      },
    },
  ], [])

  const filterDefinitions: FilterDefinition[] = [
    {
      id: 'team',
      label: 'Équipe',
      options: LAB_INFO.teams.map((t) => ({ value: t, label: t })),
    },
    ...(tab === 'public'
      ? [{
          id: 'solicitation',
          label: 'Sollicitations',
          options: [
            { value: 'press', label: 'Accepte la presse' },
            { value: 'events', label: 'Événements grand public' },
          ],
        }]
      : []),
  ]

  const filterBar = (
    <ListFilterBar
      filters={filterDefinitions}
      {...(tab === 'members' ? {} : { dateFilterId: 'date', dateFilterLabel: 'Année' })}
      columnFilters={filters}
      onColumnFiltersChange={setFilters}
      globalFilter={query}
      onGlobalFilterChange={setQuery}
      endActions={tab === 'members' && empty.length > 0 ? (
        <Button
          variant="outlined"
          size="small"
          startIcon={<MailOutline />}
          onClick={() => setSnackbar(`Relance envoyée à ${empty.length} membre${empty.length > 1 ? 's' : ''} (simulation)`)}
          sx={{ ml: 1, whiteSpace: 'nowrap' }}
        >
          {`Relancer les ${empty.length} membres sans profil`}
        </Button>
      ) : undefined}
    />
  )

  const localization = Localization[lang]
  const primary = muiTheme.palette.primary.main

  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 2 }}>
        <Kpi value={`${filled.length}/${teamMembers.length}`} label="Profils renseignés" />
        <Kpi value={aggregateTopics(allEntries).length} label="Sujets distincts" />
        <Kpi value={allEntries.filter((e) => e.theme.visibility === 'public').length} label="Thèmes publics" />
        <Kpi value={pressMembers.size} label="Joignables par la presse" />
      </Box>

      {ownHidden > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {ownHidden === 1 ? '1 de vos thèmes n’est pas visible ici' : `${ownHidden} de vos thèmes ne sont pas visibles ici`} (privé ou brouillon).
        </Typography>
      )}

      <Box sx={{ mt: 3 }}>
        <TabFilter
          selectedValue={tab}
          onTabChange={(value) => setTab(value as LabTab)}
          tabsData={[
            { label: 'Sujets', value: 'topics', numberOfItems: topics.length, color: primary },
            { label: 'Terrains', value: 'places', numberOfItems: placeList.length, color: primary },
            { label: 'Expertises publiques', value: 'public', numberOfItems: directory.length, color: primary },
            { label: 'Membres', value: 'members', numberOfItems: shownMembers.length, color: primary },
          ]}
        />
      </Box>

      {tab === 'topics' && (
        <>
          <MaterialReactTable<LabTopic>
            {...tableProps}
            columns={topicColumns}
            data={topics}
            getRowId={(t) => t.key}
            localization={localization}
            muiTableBodyRowProps={({ row }) => ({ onClick: () => setTopic(row.original), sx: { cursor: 'pointer' } })}
            renderEmptyRowsFallback={() => <EmptyRows>Aucun sujet ne correspond à ces filtres.</EmptyRows>}
            renderTopToolbar={() => filterBar}
          />
          <Card sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>Thèmes actifs par année</Typography>
            <ReactECharts option={chartOption} style={{ height: 260 }} notMerge />
          </Card>
        </>
      )}

      {tab === 'places' && (
        <>
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4, overflow: 'hidden', bgcolor: 'background.paper' }}>
            {filterBar}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 2fr) minmax(0, 1fr)' } }}>
              <LabFieldMap entries={entries} teamColor={teamColor} onSelectPlace={setPlaceHits} height={440} />
              <Box sx={{ maxHeight: 520, overflowY: 'auto', borderLeft: { md: '1px solid' }, borderColor: { md: 'divider' } }}>
                {placeList.length === 0 && <EmptyRows>Aucun terrain pour ces filtres.</EmptyRows>}
                {placeList.map((p) => (
                  <Box
                    key={p.place.label}
                    role="button"
                    tabIndex={0}
                    onClick={() => setPlaceHits(p)}
                    onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); setPlaceHits(p) } }}
                    aria-label={`Voir les membres travaillant à ${p.place.label}`}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25, cursor: 'pointer',
                      borderBottom: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'navHover' },
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body1" fontWeight={500} noWrap>{p.place.label}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {p.members.length} membre{p.members.length > 1 ? 's' : ''}{p.coords ? '' : ' · non localisé'}
                      </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>{p.entries.length}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          <Card sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>Organisations et personnes citées</Typography>
            <Box sx={{ display: 'grid', gap: 2 }}>
              {[
                { kind: 'organization' as const, title: 'Organisations', items: orgs },
                { kind: 'person' as const, title: 'Personnes', items: persons },
              ].map((g) => (
                <Box key={g.kind}>
                  <Typography variant="body1" fontWeight={600} sx={{ mb: 1 }}>{g.title}</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {g.items.length === 0 && <Typography variant="body2" color="text.secondary">Aucune</Typography>}
                    {g.items.slice(0, 12).map((it) => (
                      <Tooltip key={it.ref.label} title={it.members.join(', ')}>
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                          <RefChip kind={g.kind} value={{ ...it.ref, detail: undefined, dates: undefined } as typeof it.ref} size="small" />
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>{it.count}</Typography>
                        </Box>
                      </Tooltip>
                    ))}
                    {g.items.length > 12 && <Typography variant="body2" color="text.secondary">+{g.items.length - 12}</Typography>}
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
        </>
      )}

      {tab === 'public' && (
        <MaterialReactTable<LabEntry>
          {...tableProps}
          columns={directoryColumns}
          data={directory}
          getRowId={(e) => e.theme.id}
          localization={localization}
          muiTableBodyRowProps={({ row }) => ({ onClick: () => openEntry(row.original), sx: { cursor: 'pointer' } })}
          renderEmptyRowsFallback={() => <EmptyRows>Aucune expertise publique ne correspond.</EmptyRows>}
          renderTopToolbar={() => filterBar}
        />
      )}

      {tab === 'members' && (
        <MaterialReactTable<LabMember>
          {...tableProps}
          columns={memberColumns}
          data={shownMembers}
          getRowId={(m) => m.id}
          localization={localization}
          muiTableBodyRowProps={({ row }) => ({ onClick: () => onOpenMember(row.original), sx: { cursor: 'pointer' } })}
          renderEmptyRowsFallback={() => <EmptyRows>Aucun membre ne correspond.</EmptyRows>}
          renderTopToolbar={() => filterBar}
        />
      )}

      {/* Dialogue : membres d'un sujet */}
      <Dialog open={Boolean(topic)} onClose={() => setTopic(null)} maxWidth="sm" fullWidth>
        {topic && (
          <EntriesDialog
            title={topic.label}
            subtitle={`${topic.yearFrom} → ${topic.yearTo ?? 'en cours'} · ${topic.entries.length} membre${topic.entries.length > 1 ? 's' : ''}`}
            entries={topic.entries}
            onOpenEntry={openEntry}
            onClose={() => setTopic(null)}
          />
        )}
      </Dialog>

      {/* Dialogue : membres travaillant sur un terrain */}
      <Dialog open={Boolean(placeHits)} onClose={() => setPlaceHits(null)} maxWidth="sm" fullWidth>
        {placeHits && (
          <EntriesDialog
            title={placeHits.place.label}
            subtitle={`${placeHits.entries.length} thème${placeHits.entries.length > 1 ? 's' : ''} · ${placeHits.members.length} membre${placeHits.members.length > 1 ? 's' : ''}`}
            entries={placeHits.entries}
            onOpenEntry={openEntry}
            onClose={() => setPlaceHits(null)}
          />
        )}
      </Dialog>

      {/* Dialogue : détail d'un thème, décliné par public */}
      <Dialog open={Boolean(entry)} onClose={() => setEntry(null)} maxWidth="md" fullWidth>
        {entry && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pr: 6 }}>
              <Avatar sx={{ width: 40, height: 40, bgcolor: teamColor(entry.member.team) }}>{initials(entry.member.name)}</Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" component="span" sx={{ display: 'block' }}>{entry.member.name}</Typography>
                <Typography variant="body2" color="text.secondary">{entry.member.team} · {LAB_INFO.shortName}</Typography>
              </Box>
              <IconButton size="small" onClick={() => setEntry(null)} aria-label="Fermer" sx={{ position: 'absolute', right: 12, top: 12 }}>
                <Close fontSize="small" />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              {entry.theme.visibility === 'public' ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
                  <Typography variant="body1" fontWeight={600}>Voir comme</Typography>
                  <AudienceSwitcher value={audience} onChange={setAudience} />
                </Box>
              ) : (
                <Alert severity="info" variant="outlined" sx={{ mb: 3 }}>
                  Thème limité à l’établissement : il n’est pas publié sur les portails.
                </Alert>
              )}
              <ThemePublicBlock theme={entry.theme} audience={entry.theme.visibility === 'public' ? audience : null} />
            </DialogContent>
            <DialogActions>
              <Button startIcon={<PersonOutline />} onClick={() => { const m = entry.member; setEntry(null); onOpenMember(m) }} sx={{ mr: 'auto' }}>
                {entry.member.id === 'me' ? 'Voir mon profil' : `Voir tous les thèmes de ${entry.member.name}`}
              </Button>
              {(entry.theme.acceptsPress || entry.theme.acceptsEvents) && (
                <Button
                  variant="contained"
                  startIcon={<MailOutline />}
                  onClick={() => { setSnackbar(`Demande de mise en relation avec ${entry.member.name} transmise (simulation)`); setEntry(null) }}
                >
                  Mettre en relation
                </Button>
              )}
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
