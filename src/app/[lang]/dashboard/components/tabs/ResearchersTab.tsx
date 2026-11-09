import { useMemo } from 'react'
import { Box } from '@mui/material'
import { t } from '@lingui/core/macro'
import { useDashboardData } from '@/app/[lang]/dashboard/components/DashboardViewContext'
import { useDashboardPeriod } from '@/app/[lang]/dashboard/components/DashboardPeriod'
import { aggregateResearchers } from '@/app/[lang]/dashboard/components/charts/structureAggregates'
import DashboardSectionCard from '@/app/[lang]/dashboard/components/charts/DashboardSectionCard'
import RankBarChart from '@/app/[lang]/dashboard/components/charts/RankBarChart'

const ResearchersTab = () => {
  const { publications, authors } = useDashboardData()
  const { range } = useDashboardPeriod()

  const researchers = useMemo(
    () => aggregateResearchers(publications, authors, range, 25),
    [publications, authors, range],
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <DashboardSectionCard
        title={t`dashboard_researchers_top_title`}
        subtitle={t`dashboard_researchers_top_subtitle`}
      >
        <RankBarChart data={researchers} height={560} chartId='top-chercheurs' />
      </DashboardSectionCard>
    </Box>
  )
}

export default ResearchersTab
