import { useMemo } from 'react'
import { Box, Grid2 as Grid, Typography } from '@mui/material'
import { t } from '@lingui/core/macro'
import { useDashboardData } from '@/app/[lang]/dashboard/components/DashboardViewContext'
import { useDashboardPeriod } from '@/app/[lang]/dashboard/components/DashboardPeriod'
import {
  aggregateTeams,
  aggregateTeamRadar,
} from '@/app/[lang]/dashboard/components/charts/structureAggregates'
import DashboardSectionCard from '@/app/[lang]/dashboard/components/charts/DashboardSectionCard'
import DonutChart from '@/app/[lang]/dashboard/components/charts/DonutChart'
import StackedAreaChart from '@/app/[lang]/dashboard/components/charts/StackedAreaChart'
import StackedBarHChart from '@/app/[lang]/dashboard/components/charts/StackedBarHChart'
import RadarChart from '@/app/[lang]/dashboard/components/charts/RadarChart'

const TeamsTab = () => {
  const { publications } = useDashboardData()
  const { range } = useDashboardPeriod()

  const agg = useMemo(
    () => aggregateTeams(publications, range),
    [publications, range],
  )
  const radar = useMemo(
    () => aggregateTeamRadar(publications, range),
    [publications, range],
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <DashboardSectionCard
            title={t`dashboard_teams_distribution_title`}
            subtitle={t`dashboard_teams_distribution_subtitle`}
          >
            <DonutChart
              chartId='equipes-repartition'
              data={agg.byTeam.map((tm) => ({
                name: tm.key,
                value: tm.count,
              }))}
            />
          </DashboardSectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <DashboardSectionCard title={t`dashboard_teams_evolution_title`}>
            <StackedAreaChart data={agg.byYear} chartId='equipes-evolution' />
          </DashboardSectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <DashboardSectionCard title={t`dashboard_teams_types_title`}>
            <StackedBarHChart data={agg.byType} />
          </DashboardSectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <DashboardSectionCard
            title={t`dashboard_teams_radar_title`}
            subtitle={t`dashboard_teams_radar_subtitle`}
          >
            {radar.series.length > 0 ? (
              <RadarChart data={radar} />
            ) : (
              <Typography color='text.secondary'>
                {t`dashboard_teams_radar_empty`}
              </Typography>
            )}
          </DashboardSectionCard>
        </Grid>
      </Grid>
    </Box>
  )
}

export default TeamsTab
