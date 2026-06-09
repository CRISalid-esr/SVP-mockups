'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { Box, Chip, Tab, Tabs, Typography } from '@mui/material'
import { AccountTree, Campaign, ViewList } from '@mui/icons-material'
import DocumentHeader from '@/app/[lang]/documents/components/DocumentHeader'
import useStore from '@/stores/global_store'
import * as Lingui from '@lingui/core'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'
import FlatView from './components/FlatView/FlatView'
import ImpactCardsView from './components/ImpactCards/ImpactCardsView'

const MindMapView = dynamic(
  () => import('./components/MindMap/MindMapView'),
  {
    ssr: false,
    loading: () => (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Chargement de la carte…</Typography>
      </Box>
    ),
  },
)

const TEAL = '#006A61'

function DerivedTabLabel({ label }: { label: string }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.25, py: 0.25 }}>
      <span>{label}</span>
      <Chip
        label="depuis vos domaines"
        size="small"
        sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#E8F5E9', color: '#2E7D32', borderRadius: '4px', pointerEvents: 'none' }}
      />
    </Box>
  )
}

interface CompletionStats { domains: number; published: number }

function readCompletionStats(): CompletionStats {
  let domains = 0
  let published = 0
  try {
    const graph = JSON.parse(localStorage.getItem('expertise-graph-v2') ?? '{}')
    domains = (graph.nodes ?? []).filter(
      (n: { data?: { nodeType?: string } }) => n.data?.nodeType === 'expertise',
    ).length
  } catch (_) { /* ignore localStorage parse errors */ }
  try {
    const cards = JSON.parse(localStorage.getItem('expertise-cards-v1') ?? '[]')
    published = (cards as { visibility?: string }[]).filter((c) => c.visibility === 'PUBLIC').length
  } catch (_) { /* ignore localStorage parse errors */ }
  return { domains, published }
}

export default function ExpertisePage() {
  const { currentPerspective } = useStore((state) => state.user)
  const lang = Lingui.i18n.locale as ExtendedLanguageCode
  const [tab, setTab] = useState(0)
  const [stats, setStats] = useState<CompletionStats>({ domains: 0, published: 0 })

  useEffect(() => {
    setStats(readCompletionStats())
  }, [tab])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <DocumentHeader
        perspectiveName={currentPerspective?.getDisplayName(lang) || ''}
        pageName={'Expertises'}
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, bgcolor: 'background.paper' }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, alignItems: 'flex-start' },
            '& .Mui-selected': { color: TEAL },
            '& .MuiTabs-indicator': { bgcolor: TEAL },
          }}
        >
          <Tab icon={<AccountTree fontSize="small" />} iconPosition="start" label="Mes domaines" value={0} />
          <Tab icon={<ViewList fontSize="small" />} iconPosition="start" label={<DerivedTabLabel label="Profil structuré" />} value={1} />
          <Tab icon={<Campaign fontSize="small" />} iconPosition="start" label={<DerivedTabLabel label="Fiches publics" />} value={2} />
        </Tabs>
      </Box>

      {/* Indicateur de complétude */}
      <Box sx={{ px: 3, py: 0.6, bgcolor: '#f8fafb', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <AccountTree sx={{ fontSize: 13, color: stats.domains > 0 ? TEAL : 'text.disabled' }} />
          <Typography variant="caption" sx={{ color: stats.domains > 0 ? TEAL : 'text.disabled', fontWeight: stats.domains > 0 ? 600 : 400 }}>
            {stats.domains > 0 ? `${stats.domains} domaine${stats.domains > 1 ? 's' : ''} défini${stats.domains > 1 ? 's' : ''}` : 'Aucun domaine défini'}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.disabled">·</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Campaign sx={{ fontSize: 13, color: stats.published > 0 ? '#7B1FA2' : 'text.disabled' }} />
          <Typography variant="caption" sx={{ color: stats.published > 0 ? '#7B1FA2' : 'text.disabled', fontWeight: stats.published > 0 ? 600 : 400 }}>
            {stats.published > 0 ? `${stats.published} fiche${stats.published > 1 ? 's' : ''} publiée${stats.published > 1 ? 's' : ''}` : '0 fiche publiée'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {tab === 0 && <MindMapView />}
        {tab === 1 && <FlatView onGoToMindMap={() => setTab(0)} />}
        {tab === 2 && <ImpactCardsView onGoToMindMap={() => setTab(0)} />}
      </Box>
    </Box>
  )
}
