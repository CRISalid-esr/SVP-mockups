import { useMemo, useState } from 'react'
import { Box, Grid2 as Grid, Typography } from '@mui/material'
import { t } from '@lingui/core/macro'
import { useDashboardData } from '@/app/[lang]/dashboard/components/DashboardViewContext'
import { getYearBounds } from '@/app/[lang]/dashboard/components/charts/overviewAggregates'
import { aggregatePhd } from '@/app/[lang]/dashboard/components/charts/structureAggregates'
import LabTabHeader from '@/app/[lang]/dashboard/components/charts/LabTabHeader'
import DashboardSectionCard from '@/app/[lang]/dashboard/components/charts/DashboardSectionCard'
import DonutChart from '@/app/[lang]/dashboard/components/charts/DonutChart'
import StackedAreaChart from '@/app/[lang]/dashboard/components/charts/StackedAreaChart'
import RankBarChart from '@/app/[lang]/dashboard/components/charts/RankBarChart'

const PhdTab = () => {
  const { publications, authors } = useDashboardData()
  const bounds = useMemo(() => getYearBounds(publications), [publications])
  const [range, setRange] = useState({ start: bounds.min, end: bounds.max })

  const agg = useMemo(
    () => aggregatePhd(publications, authors, range),
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
        title={t`dashboard_tab_phd`}
        range={range}
        yearOptions={yearOptions}
        onRangeChange={setRange}
      />
      {agg.totalPhdPubs === 0 ? (
        <Typography color='text.secondary'>
          {t`dashboard_phd_empty`}
        </Typography>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 5 }}>
            <DashboardSectionCard
              title={t`dashboard_phd_by_team_title`}
              subtitle={t`dashboard_phd_by_team_subtitle`}
            >
              <DonutChart
                chartId='doctorants-repartition'
                data={agg.byTeam.map((tm) => ({
                  name: tm.key,
                  value: tm.count,
                }))}
              />
            </DashboardSectionCard>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <DashboardSectionCard title={t`dashboard_phd_evolution_title`}>
              <StackedAreaChart data={agg.byYear} chartId='doctorants-evolution' />
            </DashboardSectionCard>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <DashboardSectionCard title={t`dashboard_phd_by_doctorant_title`}>
              <RankBarChart
                chartId='doctorants-classement'
                data={agg.byDoctorant}
                color='#B279A2'
                height={Math.max(240, agg.byDoctorant.length * 26 + 60)}
              />
            </DashboardSectionCard>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

export default PhdTab
