'use client'

import { useState } from 'react'
import { t } from '@lingui/core/macro'
import * as Lingui from '@lingui/core'
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import ApartmentIcon from '@mui/icons-material/Apartment'
import useStore from '@/stores/global_store'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'
import DocumentHeader from '@/app/[lang]/documents/components/DocumentHeader'
import DashboardTabs from '@/app/[lang]/dashboard/components/DashboardTabs'
import {
  DashboardDataProvider,
  DashboardView,
} from '@/app/[lang]/dashboard/components/DashboardViewContext'
import { dashboardMockService } from '@/mocks/dashboardMockService'

const DashboardPage = () => {
  const { currentPerspective } = useStore((state) => state.user)
  const lang = (Lingui.i18n.locale || 'ul') as ExtendedLanguageCode
  const researcherName =
    currentPerspective?.getDisplayName(lang) || 'Jean Dupont'
  const labName = dashboardMockService.getLab().name

  const [view, setView] = useState<DashboardView>('researcher')
  const displayName = view === 'researcher' ? researcherName : labName

  return (
    <Box>
      <DocumentHeader
        perspectiveName={displayName}
        pageName={t`dashboard_page_main_title`}
      >
        <ToggleButtonGroup
          size='small'
          exclusive
          value={view}
          onChange={(_e, v: DashboardView | null) => v && setView(v)}
          aria-label={t`dashboard_view_switch_aria`}
        >
          <ToggleButton value='researcher' sx={{ textTransform: 'none', gap: 0.5 }}>
            <PersonOutlineIcon fontSize='small' />
            {t`dashboard_view_researcher`}
          </ToggleButton>
          <ToggleButton value='lab' sx={{ textTransform: 'none', gap: 0.5 }}>
            <ApartmentIcon fontSize='small' />
            {t`dashboard_view_lab`}
          </ToggleButton>
        </ToggleButtonGroup>
      </DocumentHeader>

      <DashboardDataProvider view={view}>
        <Box sx={{ mt: 1 }}>
          <DashboardTabs />
        </Box>
      </DashboardDataProvider>
    </Box>
  )
}

export default DashboardPage
