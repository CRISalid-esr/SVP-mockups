'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Alert, Avatar, Box, Chip, Dialog, DialogContent, DialogTitle,
  IconButton, InputAdornment, LinearProgress, List, ListItem, ListItemAvatar,
  ListItemText, Paper, Tab, Tabs, TextField, ToggleButton, ToggleButtonGroup,
  Tooltip, Typography,
} from '@mui/material'
import {
  Campaign, Close, GroupsOutlined, HubOutlined, InfoOutlined,
  SearchOutlined, TravelExploreOutlined, VerifiedOutlined,
} from '@mui/icons-material'
import { PROFILE_CONFIG, ProfileType } from '../ImpactCards/impactCardsTypes'
import {
  AggregatedSujet, LAB_FICHES, LAB_MEMBERS, LAB_TEAMS, LabFiche, aggregateSujets,
} from './labMock'

const ReactEcharts = dynamic(() => import('echarts-for-react'), { ssr: false })

const TEAL = '#006A61'

// Dégradé teal clair → foncé selon le nombre de membres partageant le thème.
function tealShade(t: number): string {
  const from = [0xcf, 0xe8, 0xe6]
  const to = [0x00, 0x56, 0x4e]
  const mix = from.map((f, i) => Math.round(f + (to[i] - f) * t))
  return `#${mix.map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

// Couleur de libellé lisible sur la teinte de fond : texte sombre sur les
// cases claires, blanc sur les cases foncées (contraste AA).
function labelColorFor(bg: string): string {
  const r = parseInt(bg.slice(1, 3), 16)
  const g = parseInt(bg.slice(3, 5), 16)
  const b = parseInt(bg.slice(5, 7), 16)
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b
  return luminance > 140 ? '#0F3B36' : '#FFFFFF'
}

function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = ['#00695C', '#5B21B6', '#92400E', '#1E40AF', '#065F46', '#9D174D']
function avatarColor(name: string): string {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 997
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

function KpiCard({ icon, value, label, extra }: {
  icon: React.ReactNode
  value: string
  label: string
  extra?: React.ReactNode
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, flex: 1, minWidth: 180, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        {icon}
        <Typography variant="h5" sx={{ fontWeight: 700 }}>{value}</Typography>
      </Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      {extra}
    </Paper>
  )
}

export default function LabView({ labName }: { labName: string }) {
  const [tab, setTab] = useState<'sujets' | 'annuaire'>('sujets')
  const [teamFilter, setTeamFilter] = useState<string>('all')
  const [selectedSujet, setSelectedSujet] = useState<AggregatedSujet | null>(null)
  const [profileFilter, setProfileFilter] = useState<ProfileType | 'all'>('all')
  const [search, setSearch] = useState('')
  const [selectedFiche, setSelectedFiche] = useState<LabFiche | null>(null)

  const filteredMembers = useMemo(
    () => (teamFilter === 'all' ? LAB_MEMBERS : LAB_MEMBERS.filter((m) => m.team === teamFilter)),
    [teamFilter],
  )
  const sujets = useMemo(() => aggregateSujets(filteredMembers), [filteredMembers])
  const allSujets = useMemo(() => aggregateSujets(LAB_MEMBERS), [])

  const withSujets = LAB_MEMBERS.filter((m) => m.sujets.length > 0).length
  const completion = Math.round((withSujets / LAB_MEMBERS.length) * 100)

  const maxCount = Math.max(1, ...sujets.map((s) => s.members.length))
  const treemapOption = useMemo(() => ({
    tooltip: {
      formatter: (p: { name: string; value: number }) =>
        `<b>${p.name}</b><br/>${p.value} membre${p.value > 1 ? 's' : ''} — cliquer pour voir qui`,
    },
    series: [{
      type: 'treemap',
      roam: false,
      nodeClick: false,
      breadcrumb: { show: false },
      top: 0, left: 0, right: 0, bottom: 0,
      label: {
        show: true,
        formatter: (p: { name: string; value: number }) => `${p.name}\n${p.value} membre${p.value > 1 ? 's' : ''}`,
        fontSize: 12,
        lineHeight: 16,
      },
      itemStyle: { borderColor: '#fff', borderWidth: 2, gapWidth: 2, borderRadius: 4 },
      data: sujets.map((s) => {
        const t = maxCount === 1 ? 0.5 : (s.members.length - 1) / (maxCount - 1)
        const bg = tealShade(t)
        return {
          name: s.label,
          value: s.members.length,
          itemStyle: { color: bg },
          label: { color: labelColorFor(bg) },
        }
      }),
    }],
  }), [sujets, maxCount])

  const treemapEvents = useMemo(() => ({
    click: (p: { name: string }) => {
      const sujet = sujets.find((s) => s.label === p.name)
      if (sujet) setSelectedSujet(sujet)
    },
  }), [sujets])

  const visibleFiches = LAB_FICHES.filter((f) => {
    if (profileFilter !== 'all' && f.profile !== profileFilter) return false
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      return [f.title, f.description, f.memberName].some((s) => s.toLowerCase().includes(q))
    }
    return true
  })

  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="info" icon={<InfoOutlined fontSize="small" />} sx={{ mb: 3 }}>
        Vue agrégée en lecture seule : les thèmes de recherche et les fiches expertises sont
        renseignés par chaque membre depuis son propre profil recherche. Les thèmes alignés sur un
        vocabulaire contrôlé (RAMEAU, Wikidata) sont regroupés automatiquement entre membres.
      </Alert>

      {/* Bandeau KPI */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        <KpiCard
          icon={<GroupsOutlined sx={{ color: TEAL }} />}
          value={`${LAB_MEMBERS.length}`}
          label="membres du laboratoire"
        />
        <KpiCard
          icon={<TravelExploreOutlined sx={{ color: TEAL }} />}
          value={`${withSujets}/${LAB_MEMBERS.length}`}
          label="membres ayant renseigné leurs thèmes"
          extra={
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <LinearProgress variant="determinate" value={completion}
                sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: '#E0F2F1', '& .MuiLinearProgress-bar': { bgcolor: TEAL } }} />
              <Typography variant="caption" sx={{ color: TEAL, fontWeight: 700 }}>{completion}%</Typography>
            </Box>
          }
        />
        <KpiCard
          icon={<HubOutlined sx={{ color: TEAL }} />}
          value={`${allSujets.length}`}
          label="thèmes de recherche distincts"
        />
        <KpiCard
          icon={<Campaign sx={{ color: '#7B1FA2' }} />}
          value={`${LAB_FICHES.length}`}
          label="fiches expertises publiées"
        />
      </Box>

      {/* Sous-onglets */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}
          sx={{
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 500 },
            '& .Mui-selected': { color: TEAL },
            '& .MuiTabs-indicator': { bgcolor: TEAL },
          }}>
          <Tab value="sujets" label="Thèmes de recherche du labo" />
          <Tab value="annuaire" label={`Annuaire des expertises (${LAB_FICHES.length})`} />
        </Tabs>
      </Box>

      {tab === 'sujets' && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Taille et couleur selon le nombre de membres travaillant sur le thème —
              cliquez sur un thème pour voir les membres concernés.
            </Typography>
            <ToggleButtonGroup size="small" exclusive value={teamFilter}
              onChange={(_, v) => v && setTeamFilter(v)}>
              <ToggleButton value="all" sx={{ textTransform: 'none' }}>Toutes les équipes</ToggleButton>
              {LAB_TEAMS.map((t) => (
                <ToggleButton key={t} value={t} sx={{ textTransform: 'none' }}>{t}</ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <Paper variant="outlined" sx={{ borderRadius: 2, p: 1.5 }}>
            <ReactEcharts option={treemapOption} onEvents={treemapEvents} style={{ height: 460, width: '100%' }} notMerge />
          </Paper>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary">Thèmes alignés sur un vocabulaire contrôlé :</Typography>
            {sujets.filter((s) => s.vocabulary).map((s) => (
              <Chip key={s.label} size="small" variant="outlined" onClick={() => setSelectedSujet(s)}
                label={`${s.label} · ${s.vocabulary}`}
                sx={{ fontSize: '0.65rem', height: 20, borderColor: `${TEAL}60`, color: TEAL }} />
            ))}
          </Box>
        </Box>
      )}

      {tab === 'annuaire' && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 2.5 }}>
            <TextField
              size="small"
              placeholder="Rechercher un thème, un nom…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 260 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment>
                ),
              }}
            />
            <Chip label="Tous les publics" size="small" onClick={() => setProfileFilter('all')}
              sx={{
                fontWeight: profileFilter === 'all' ? 700 : 400,
                bgcolor: profileFilter === 'all' ? TEAL : undefined,
                color: profileFilter === 'all' ? '#fff' : undefined,
              }} />
            {(Object.keys(PROFILE_CONFIG) as ProfileType[]).map((p) => {
              const cfg = PROFILE_CONFIG[p]
              const active = profileFilter === p
              return (
                <Chip key={p} size="small" icon={<cfg.Icon sx={{ fontSize: 14 }} />}
                  label={`${cfg.label} (${LAB_FICHES.filter((f) => f.profile === p).length})`}
                  onClick={() => setProfileFilter(active ? 'all' : p)}
                  sx={{
                    fontWeight: active ? 700 : 400,
                    bgcolor: active ? cfg.border : cfg.bg,
                    color: active ? '#fff' : cfg.color,
                    '& .MuiChip-icon': { color: active ? '#fff' : cfg.border },
                  }} />
              )
            })}
          </Box>

          {visibleFiches.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="body2" color="text.secondary">
                Aucune expertise ne correspond à cette recherche.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 2 }}>
              {visibleFiches.map((fiche) => {
                const cfg = PROFILE_CONFIG[fiche.profile]
                return (
                  <Paper key={fiche.id} variant="outlined" onClick={() => setSelectedFiche(fiche)}
                    sx={{
                      p: 2, borderRadius: 2, borderTop: `3px solid ${cfg.border}`, cursor: 'pointer',
                      transition: 'box-shadow 0.2s, transform 0.15s',
                      '&:hover': { boxShadow: '0 4px 14px rgba(0,0,0,0.10)', transform: 'translateY(-2px)' },
                    }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip size="small" icon={<cfg.Icon sx={{ fontSize: 13 }} />} label={cfg.label}
                        sx={{ height: 20, fontSize: '0.65rem', bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, '& .MuiChip-icon': { color: cfg.border } }} />
                      <Typography variant="caption" color="text.disabled" sx={{ ml: 'auto' }}>{fiche.lastUpdate}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.75, lineHeight: 1.3 }}>
                      {fiche.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary"
                      sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1.25 }}>
                      {fiche.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
                      <Avatar sx={{ width: 22, height: 22, fontSize: '0.6rem', bgcolor: avatarColor(fiche.memberName) }}>
                        {initials(fiche.memberName)}
                      </Avatar>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>{fiche.memberName}</Typography>
                      <Tooltip title="Fiche validée et publique">
                        <VerifiedOutlined sx={{ fontSize: 14, color: '#065F46', ml: 'auto' }} />
                      </Tooltip>
                    </Box>
                  </Paper>
                )
              })}
            </Box>
          )}
        </Box>
      )}

      {/* Dialog — membres partageant un thème */}
      <Dialog open={Boolean(selectedSujet)} onClose={() => setSelectedSujet(null)} maxWidth="xs" fullWidth>
        {selectedSujet && (
          <>
            <DialogTitle component="div" sx={{ pr: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                {selectedSujet.label}
                {selectedSujet.vocabulary && (
                  <Chip size="small" variant="outlined" label={selectedSujet.vocabulary}
                    sx={{ height: 20, fontSize: '0.65rem', borderColor: `${TEAL}60`, color: TEAL }} />
                )}
              </Box>
              <Typography variant="caption" color="text.secondary">
                {selectedSujet.members.length} membre{selectedSujet.members.length > 1 ? 's' : ''} du laboratoire
              </Typography>
              <IconButton onClick={() => setSelectedSujet(null)} sx={{ position: 'absolute', right: 8, top: 8 }}>
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <List dense disablePadding>
                {selectedSujet.members.map((m) => (
                  <ListItem key={m.id} disableGutters>
                    <ListItemAvatar>
                      <Avatar sx={{ width: 34, height: 34, fontSize: '0.75rem', bgcolor: avatarColor(m.name) }}>
                        {initials(m.name)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={m.name} secondary={m.team}
                      primaryTypographyProps={{ fontWeight: 600, fontSize: '0.85rem' }}
                      secondaryTypographyProps={{ fontSize: '0.72rem' }} />
                  </ListItem>
                ))}
              </List>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Dialog — détail d'une fiche de l'annuaire */}
      <Dialog open={Boolean(selectedFiche)} onClose={() => setSelectedFiche(null)} maxWidth="sm" fullWidth>
        {selectedFiche && (() => {
          const cfg = PROFILE_CONFIG[selectedFiche.profile]
          return (
            <>
              <DialogTitle component="div" sx={{ pr: 6 }}>
                <Chip size="small" icon={<cfg.Icon sx={{ fontSize: 13 }} />} label={`${cfg.label} — ${cfg.desc}`}
                  sx={{ mb: 1, height: 22, fontSize: '0.68rem', bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, '& .MuiChip-icon': { color: cfg.border } }} />
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>{selectedFiche.title}</Typography>
                <IconButton onClick={() => setSelectedFiche(null)} sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <Close />
                </IconButton>
              </DialogTitle>
              <DialogContent dividers>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar sx={{ width: 30, height: 30, fontSize: '0.7rem', bgcolor: avatarColor(selectedFiche.memberName) }}>
                    {initials(selectedFiche.memberName)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedFiche.memberName}</Typography>
                    <Typography variant="caption" color="text.secondary">{labName}</Typography>
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ mb: 2 }}>{selectedFiche.description}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>Spécialisation</Typography>
                  <Box sx={{ flex: 1, height: 5, bgcolor: '#E5E7EB', borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: `${selectedFiche.specialization * 10}%`, bgcolor: cfg.border }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">{selectedFiche.specialization}/10</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selectedFiche.targetAudiences.map((a) => (
                    <Chip key={a} label={a} size="small"
                      sx={{ fontSize: '0.65rem', height: 20, bgcolor: cfg.bg, color: cfg.color }} />
                  ))}
                </Box>
              </DialogContent>
            </>
          )
        })()}
      </Dialog>
    </Box>
  )
}
