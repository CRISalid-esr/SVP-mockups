import { useMemo, useState } from 'react'
import { Box } from '@mui/material'
import { t } from '@lingui/core/macro'
import { useDashboardData } from '@/app/[lang]/dashboard/components/DashboardViewContext'
import { getYearBounds } from '@/app/[lang]/dashboard/components/charts/overviewAggregates'
import { aggregateResearchers } from '@/app/[lang]/dashboard/components/charts/structureAggregates'
import LabTabHeader from '@/app/[lang]/dashboard/components/charts/LabTabHeader'
import DashboardSectionCard from '@/app/[lang]/dashboard/components/charts/DashboardSectionCard'
import RankBarChart from '@/app/[lang]/dashboard/components/charts/RankBarChart'

const ResearchersTab = () => {
  const { publications, authors } = useDashboardData()
  const bounds = useMemo(() => getYearBounds(publications), [publications])
  const [range, setRange] = useState({ start: bounds.min, end: bounds.max })

  const researchers = useMemo(
    () => aggregateResearchers(publications, authors, range, 25),
    [publications, authors, range],
  )
  const yearOptions = useMemo(
    () =>
      Array.from({ length: bounds.max - bounds.min + 1 }, (_, i) => bounds.min + i),
    [bounds],
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <LabTabHeader
        title={t`dashboard_tab_researchers`}
        range={range}
        yearOptions={yearOptions}
        onRangeChange={setRange}
      />
      <DashboardSectionCard
        title={t`dashboard_researchers_top_title`}
        subtitle={t`dashboard_researchers_top_subtitle`}
      >
        <RankBarChart data={researchers} color='#4C78A8' height={560} />
      </DashboardSectionCard>
    </Box>
  )
}

export default ResearchersTab
