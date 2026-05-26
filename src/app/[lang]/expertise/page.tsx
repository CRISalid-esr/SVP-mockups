'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Box, Tab, Tabs, Typography } from '@mui/material'
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


export default function ExpertisePage() {
  const { currentPerspective } = useStore((state) => state.user)
  const lang = Lingui.i18n.locale as ExtendedLanguageCode
  const [tab, setTab] = useState(1)

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
          sx={{
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 500 },
            '& .Mui-selected': { color: TEAL },
            '& .MuiTabs-indicator': { bgcolor: TEAL },
          }}
        >
          <Tab icon={<ViewList fontSize="small" />} iconPosition="start" label="Vue des expertises" value={0} />
          <Tab icon={<AccountTree fontSize="small" />} iconPosition="start" label="Carte mentale" value={1} />
          <Tab icon={<Campaign fontSize="small" />} iconPosition="start" label="Cartes impact" value={2} />
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {tab === 0 && <FlatView onGoToMindMap={() => setTab(1)} />}
        {tab === 1 && <MindMapView />}
        {tab === 2 && <ImpactCardsView onGoToMindMap={() => setTab(1)} />}
      </Box>
    </Box>
  )
}
