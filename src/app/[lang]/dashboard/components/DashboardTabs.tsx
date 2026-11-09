import { useEffect, useState } from 'react'
import { Box } from '@mui/material'
import TabFilter from '@/app/[lang]/components/TabFilter/TabFilter'
import { useDashboardData } from '@/app/[lang]/dashboard/components/DashboardViewContext'
import { DashboardPeriodFilter, DashboardPeriodProvider } from '@/app/[lang]/dashboard/components/DashboardPeriod'
import OverviewTab from '@/app/[lang]/dashboard/components/tabs/OverviewTab'
import InternationalTab from '@/app/[lang]/dashboard/components/tabs/InternationalTab'
import ImpactTab from '@/app/[lang]/dashboard/components/tabs/ImpactTab'
import BooksTab from '@/app/[lang]/dashboard/components/tabs/BooksTab'
import TeamsTab from '@/app/[lang]/dashboard/components/tabs/TeamsTab'
import ResearchersTab from '@/app/[lang]/dashboard/components/tabs/ResearchersTab'
import PhdTab from '@/app/[lang]/dashboard/components/tabs/PhdTab'

type DashboardTabKey = 'overview' | 'collaborations' | 'impact' | 'teams' | 'researchers' | 'phd' | 'books'

const TABS: { value: DashboardTabKey; label: string }[] = [
  { value: 'overview', label: 'Vue d’ensemble' },
  { value: 'collaborations', label: 'Collaborations' },
  { value: 'impact', label: 'Impact' },
  { value: 'teams', label: 'Équipes' },
  { value: 'researchers', label: 'Chercheurs' },
  { value: 'phd', label: 'Doctorants' },
  { value: 'books', label: 'Ouvrages' },
]

/** Onglets d'une personne : les autres décrivent une structure. */
const RESEARCHER_TABS = new Set<DashboardTabKey>(['overview', 'collaborations', 'impact', 'books'])

const TAB_CONTENT: Record<DashboardTabKey, () => JSX.Element> = {
  overview: OverviewTab,
  collaborations: InternationalTab,
  impact: ImpactTab,
  teams: TeamsTab,
  researchers: ResearchersTab,
  phd: PhdTab,
  books: BooksTab,
}

const DashboardTabs = () => {
  const { isResearcher, structureLevel } = useDashboardData()
  const [selected, setSelected] = useState<DashboardTabKey>('overview')

  const tabs = TABS.filter(({ value }) =>
    isResearcher ? RESEARCHER_TABS.has(value) : !(structureLevel === 'team' && value === 'teams'),
  )

  // Un onglet qui n'existe pas dans la nouvelle perspective ramène à la vue d'ensemble.
  useEffect(() => {
    if (!tabs.some(({ value }) => value === selected)) setSelected('overview')
  }, [tabs, selected])

  const Content = TAB_CONTENT[selected]

  return (
    <DashboardPeriodProvider>
      <Box>
        <TabFilter
          tabsData={tabs}
          selectedValue={selected}
          onTabChange={(value) => setSelected(value as DashboardTabKey)}
          action={<DashboardPeriodFilter />}
          tourId='dashboard-tabs'
        />
        <Content />
      </Box>
    </DashboardPeriodProvider>
  )
}

export default DashboardTabs
