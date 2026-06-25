import { useEffect, useState } from 'react'
import { Box, Chip, Typography } from '@mui/material'
import ConstructionIcon from '@mui/icons-material/Construction'
import { t } from '@lingui/core/macro'
import TabFilter from '@/app/[lang]/components/TabFilter/TabFilter'
import { useDashboardData } from '@/app/[lang]/dashboard/components/DashboardViewContext'
import OverviewTab from '@/app/[lang]/dashboard/components/tabs/OverviewTab'
import InternationalTab from '@/app/[lang]/dashboard/components/tabs/InternationalTab'
import ImpactTab from '@/app/[lang]/dashboard/components/tabs/ImpactTab'
import BooksTab from '@/app/[lang]/dashboard/components/tabs/BooksTab'
import TeamsTab from '@/app/[lang]/dashboard/components/tabs/TeamsTab'
import ResearchersTab from '@/app/[lang]/dashboard/components/tabs/ResearchersTab'
import PhdTab from '@/app/[lang]/dashboard/components/tabs/PhdTab'
import NetworkTab from '@/app/[lang]/dashboard/components/tabs/NetworkTab'

type DashboardTabKey =
  | 'overview'
  | 'teams'
  | 'axes'
  | 'international'
  | 'impact'
  | 'researchers'
  | 'network'
  | 'phd'
  | 'books'

interface TabDef {
  value: DashboardTabKey
  label: string
  /** Phase de la feuille de route (les onglets non livrés sont en placeholder). */
  phase: 1 | 2 | 3
}

const ComingSoon = ({ label, phase }: { label: string; phase: number }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1.5,
      py: 10,
      color: 'text.secondary',
    }}
  >
    <ConstructionIcon sx={{ fontSize: 48, opacity: 0.5 }} />
    <Typography variant='h6'>{label}</Typography>
    <Typography variant='body2'>{t`dashboard_tabs_coming_soon`}</Typography>
    <Chip
      size='small'
      variant='outlined'
      label={t`dashboard_tabs_phase` + ` ${phase}`}
    />
  </Box>
)

/** Onglets pertinents pour un chercheur (les autres sont propres au laboratoire). */
const RESEARCHER_TABS = new Set<DashboardTabKey>([
  'overview',
  'international',
  'impact',
  'network',
  'books',
])

const DashboardTabs = () => {
  const { isResearcher } = useDashboardData()
  const [selected, setSelected] = useState<DashboardTabKey>('overview')

  const allTabs: TabDef[] = [
    { value: 'overview', label: t`dashboard_tab_overview`, phase: 1 },
    { value: 'international', label: t`dashboard_tab_international`, phase: 2 },
    { value: 'impact', label: t`dashboard_tab_impact`, phase: 2 },
    { value: 'teams', label: t`dashboard_tab_teams`, phase: 3 },
    { value: 'researchers', label: t`dashboard_tab_researchers`, phase: 3 },
    { value: 'phd', label: t`dashboard_tab_phd`, phase: 3 },
    { value: 'network', label: t`dashboard_tab_network`, phase: 3 },
    { value: 'books', label: t`dashboard_tab_books`, phase: 3 },
    { value: 'axes', label: t`dashboard_tab_axes`, phase: 3 },
  ]
  const tabs = isResearcher
    ? allTabs.filter((tb) => RESEARCHER_TABS.has(tb.value))
    : allTabs

  // Si l'onglet courant n'est plus visible (changement de perspective), revenir à la vue d'ensemble.
  useEffect(() => {
    if (!tabs.some((tb) => tb.value === selected)) setSelected('overview')
  }, [tabs, selected])

  const active = tabs.find((tb) => tb.value === selected)

  const renderTab = () => {
    switch (selected) {
      case 'overview':
        return <OverviewTab />
      case 'international':
        return <InternationalTab />
      case 'impact':
        return <ImpactTab />
      case 'books':
        return <BooksTab />
      case 'teams':
        return <TeamsTab />
      case 'researchers':
        return <ResearchersTab />
      case 'phd':
        return <PhdTab />
      case 'network':
        return <NetworkTab />
      default:
        return (
          <ComingSoon label={active?.label ?? ''} phase={active?.phase ?? 3} />
        )
    }
  }

  return (
    <Box>
      <TabFilter
        tabsData={tabs.map((tb) => ({ label: tb.label, value: tb.value }))}
        selectedValue={selected}
        onTabChange={(v) => setSelected(v as DashboardTabKey)}
      />

      {renderTab()}
    </Box>
  )
}

export default DashboardTabs
