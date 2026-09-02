'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import {
  Box, Chip, Tab, Tabs, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material'
import {
  AccountTree, Campaign, ChevronRight, PersonOutline,
  Apartment, TravelExplore, ViewList,
} from '@mui/icons-material'
import DocumentHeader from '@/app/[lang]/documents/components/DocumentHeader'
import useStore from '@/stores/global_store'
import * as Lingui from '@lingui/core'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'
import { dashboardMockService } from '@/mocks/dashboardMockService'
import FlatView from './components/FlatView/FlatView'
import ImpactCardsView from './components/ImpactCards/ImpactCardsView'
import { INITIAL_CARDS } from './components/ImpactCards/impactCardsTypes'
import LabView from './components/Lab/LabView'
import { CARDS_KEY, loadStoredGraph } from './storage'

const MindMapView = dynamic(
  () => import('./components/MindMap/MindMapView'),
  {
    ssr: false,
    loading: () => (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Chargement des thèmes de recherche…</Typography>
      </Box>
    ),
  },
)

const TEAL = '#006A61'

type SujetView = 'liste' | 'carte'
type PageView = 'researcher' | 'lab'

interface CompletionStats {
  sujets: number
  fiches: number
  publiees: number
}

function readCompletionStats(): CompletionStats {
  const graph = loadStoredGraph()
  const sujets = (graph.nodes ?? []).filter((n) => n.data?.nodeType === 'expertise').length
  let fiches = 0
  let publiees = 0
  try {
    const raw = localStorage.getItem(CARDS_KEY)
    // Fiches de démo (INITIAL_CARDS) tant que rien n'est enregistré.
    const cards = raw ? (JSON.parse(raw) as { visibility?: string }[]) : INITIAL_CARDS
    fiches = cards.length
    publiees = cards.filter((c) => c.visibility === 'PUBLIC').length
  } catch (_) { /* ignore localStorage parse errors */ }
  return { sujets, fiches, publiees }
}

function JourneyStep({ index, label, count, done, active, onClick }: {
  index: number
  label: string
  count?: string
  done: boolean
  active: boolean
  onClick: () => void
}) {
  const color = done ? TEAL : 'text.disabled'
  return (
    <Box onClick={onClick}
      sx={{
        display: 'flex', alignItems: 'center', gap: 0.75, cursor: 'pointer',
        px: 1, py: 0.25, borderRadius: 1,
        bgcolor: active ? `${TEAL}10` : 'transparent',
        '&:hover': { bgcolor: `${TEAL}14` },
      }}>
      <Box sx={{
        width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: done ? TEAL : 'transparent',
        border: done ? 'none' : '1.5px solid', borderColor: 'text.disabled',
        color: done ? '#fff' : 'text.disabled',
        fontSize: '0.6rem', fontWeight: 700,
      }}>
        {done ? '✓' : index}
      </Box>
      <Typography variant="caption" sx={{ color, fontWeight: done || active ? 600 : 400 }}>
        {label}{count ? ` — ${count}` : ''}
      </Typography>
    </Box>
  )
}

export default function ExpertisePage() {
  const { currentPerspective } = useStore((state) => state.user)
  const lang = Lingui.i18n.locale as ExtendedLanguageCode
  const researcherName = currentPerspective?.getDisplayName(lang) || 'Jean Dupont'
  const labName = dashboardMockService.getLab().name

  const [view, setView] = useState<PageView>('researcher')
  const [tab, setTab] = useState(0)
  const [sujetView, setSujetView] = useState<SujetView>('liste')
  const [justGenerated, setJustGenerated] = useState(false)
  const [stats, setStats] = useState<CompletionStats>({ sujets: 0, fiches: 0, publiees: 0 })
  const [mounted, setMounted] = useState(false)

  const refreshStats = useCallback(() => setStats(readCompletionStats()), [])

  useEffect(() => {
    refreshStats()
    setMounted(true)
  }, [tab, sujetView, view, refreshStats])

  const hasSujets = stats.sujets > 0

  // Après une génération IA depuis la vue Liste : bannière de revue + stats à jour.
  const handleGenerated = useCallback(() => {
    setJustGenerated(true)
    setSujetView('liste')
    refreshStats()
  }, [refreshStats])

  const goToTab = (value: number) => {
    setJustGenerated(false)
    setTab(value)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <DocumentHeader
        perspectiveName={view === 'researcher' ? researcherName : labName}
        pageName={'Profil recherche'}
      >
        <ToggleButtonGroup
          size="small"
          exclusive
          value={view}
          onChange={(_e, v: PageView | null) => v && setView(v)}
          aria-label="Perspective"
        >
          <ToggleButton value="researcher" sx={{ textTransform: 'none', gap: 0.5 }}>
            <PersonOutline fontSize="small" />
            Chercheur
          </ToggleButton>
          <ToggleButton value="lab" sx={{ textTransform: 'none', gap: 0.5 }}>
            <Apartment fontSize="small" />
            Laboratoire
          </ToggleButton>
        </ToggleButtonGroup>
      </DocumentHeader>

      {view === 'lab' ? (
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <LabView labName={labName} />
        </Box>
      ) : (
        <>
          <Box sx={{
            borderBottom: 1, borderColor: 'divider', px: 3, bgcolor: 'background.paper',
            display: 'flex', alignItems: 'center', gap: 2,
          }}>
            <Tabs
              value={tab}
              onChange={(_, v) => goToTab(v)}
              sx={{
                '& .MuiTab-root': { textTransform: 'none', fontWeight: 500 },
                '& .Mui-selected': { color: TEAL },
                '& .MuiTabs-indicator': { bgcolor: TEAL },
              }}
            >
              <Tab icon={<TravelExplore fontSize="small" />} iconPosition="start"
                label="Thèmes de recherche" value={0} />
              <Tab icon={<Campaign fontSize="small" />} iconPosition="start"
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    Expertises
                    <Chip
                      label="générées depuis vos thèmes"
                      size="small"
                      sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#E8F5E9', color: '#2E7D32', borderRadius: '4px', pointerEvents: 'none' }}
                    />
                  </Box>
                } value={1} />
            </Tabs>

            {/* Liste / Carte : deux rendus des mêmes thèmes, pas deux contenus */}
            {tab === 0 && mounted && hasSujets && (
              <ToggleButtonGroup
                size="small"
                exclusive
                value={sujetView}
                onChange={(_e, v: SujetView | null) => { if (v) { setSujetView(v); setJustGenerated(false) } }}
                sx={{ ml: 'auto' }}
                aria-label="Affichage des thèmes"
              >
                <ToggleButton value="liste" sx={{ textTransform: 'none', gap: 0.5, px: 1.5 }}>
                  <ViewList fontSize="small" />
                  Liste
                </ToggleButton>
                <ToggleButton value="carte" sx={{ textTransform: 'none', gap: 0.5, px: 1.5 }}>
                  <AccountTree fontSize="small" />
                  Relations (avancé)
                </ToggleButton>
              </ToggleButtonGroup>
            )}
          </Box>

          {/* Parcours en 3 étapes */}
          <Box sx={{
            px: 3, py: 0.6, bgcolor: '#f8fafb', borderBottom: '1px solid', borderColor: 'divider',
            display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap',
          }}>
            <JourneyStep index={1} label="Définir mes thèmes"
              count={mounted && hasSujets ? `${stats.sujets} thème${stats.sujets > 1 ? 's' : ''}` : undefined}
              done={mounted && hasSujets} active={tab === 0} onClick={() => goToTab(0)} />
            <ChevronRight sx={{ fontSize: 14, color: 'text.disabled' }} />
            <JourneyStep index={2} label="Générer mes expertises"
              count={mounted && stats.fiches > 0 ? `${stats.fiches} fiche${stats.fiches > 1 ? 's' : ''}` : undefined}
              done={mounted && stats.fiches > 0} active={tab === 1} onClick={() => goToTab(1)} />
            <ChevronRight sx={{ fontSize: 14, color: 'text.disabled' }} />
            <JourneyStep index={3} label="Publier"
              count={mounted && stats.publiees > 0 ? `${stats.publiees} publique${stats.publiees > 1 ? 's' : ''}` : undefined}
              done={mounted && stats.publiees > 0} active={false} onClick={() => goToTab(1)} />
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {tab === 0 && (
              !mounted ? null
                : hasSujets && sujetView === 'carte'
                  ? <MindMapView onBackToList={() => setSujetView('liste')} />
                  : (
                    <FlatView
                      onGoToMindMap={() => { setSujetView('carte'); setJustGenerated(false) }}
                      onGoToExpertises={() => goToTab(1)}
                      justGenerated={justGenerated}
                      onGraphChanged={refreshStats}
                      onThemesGenerated={handleGenerated}
                    />
                  )
            )}
            {tab === 1 && (
              <ImpactCardsView onGoToMindMap={() => { setTab(0); setSujetView('liste') }} />
            )}
          </Box>
        </>
      )}
    </Box>
  )
}
