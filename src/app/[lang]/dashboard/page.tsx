'use client'

import { t } from '@lingui/core/macro'
import * as Lingui from '@lingui/core'
import { Box } from '@mui/material'
import useStore from '@/stores/global_store'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'
import DocumentHeader from '@/app/[lang]/documents/components/DocumentHeader'
import DashboardTabs from '@/app/[lang]/dashboard/components/DashboardTabs'
import { DashboardDataProvider } from '@/app/[lang]/dashboard/components/DashboardViewContext'
import { structureLevelOf, usePerspectiveScope } from '@/app/[lang]/components/Perspective/usePerspectiveScope'
import { mockService } from '@/mocks/mockService'

const DashboardPage = () => {
  const { currentPerspective } = useStore((state) => state.user)
  const lang = (Lingui.i18n.locale || 'ul') as ExtendedLanguageCode
  const scope = usePerspectiveScope()
  const displayName = currentPerspective?.getDisplayName(lang) || 'Jean Dupont'

  const uid = currentPerspective?.uid
  const structureLevel = structureLevelOf(uid)
  const teamFilter = scope === 'structure' && uid
    ? ((mockService.getResearchStructureByUid(uid) as { dashboardTeam?: string } | null)?.dashboardTeam ?? null)
    : null
  // Le Labo X, l'équipe qui en dépend et l'établissement s'appuient sur les vraies données du jeu de démo.
  const usesRealData =
    scope === 'own' ||
    currentPerspective?.slug === 'labo-x' ||
    Boolean(teamFilter) ||
    (scope === 'structure' && structureLevel === 'institution')
  const demoKey = usesRealData ? null : currentPerspective?.slug

  return (
    <Box>
      <DocumentHeader
        perspectiveName={displayName}
        pageName={t`dashboard_page_main_title`}
        helpTopic='dashboard'
      />

      <DashboardDataProvider
        view={scope === 'structure' ? 'lab' : 'researcher'}
        demoKey={demoKey}
        isOwn={scope === 'own'}
        structureLevel={structureLevel}
        teamFilter={teamFilter}
      >
        <Box sx={{ mt: 1 }}>
          <DashboardTabs />
        </Box>
      </DashboardDataProvider>
    </Box>
  )
}

export default DashboardPage
