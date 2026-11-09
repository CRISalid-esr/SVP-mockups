import { useMemo } from 'react'
import { Box, Grid2 as Grid, Typography } from '@mui/material'
import { t } from '@lingui/core/macro'
import { useDashboardData } from '@/app/[lang]/dashboard/components/DashboardViewContext'
import { useDashboardPeriod } from '@/app/[lang]/dashboard/components/DashboardPeriod'
import { aggregateImpact } from '@/app/[lang]/dashboard/components/charts/impactAggregates'
import DashboardSectionCard from '@/app/[lang]/dashboard/components/charts/DashboardSectionCard'
import ImpactKpiCards from '@/app/[lang]/dashboard/components/charts/ImpactKpiCards'
import QuartileChart from '@/app/[lang]/dashboard/components/charts/QuartileChart'
import TopByYearChart from '@/app/[lang]/dashboard/components/charts/TopByYearChart'
import FwciHistogramChart from '@/app/[lang]/dashboard/components/charts/FwciHistogramChart'

const ImpactTab = () => {
  const { publications } = useDashboardData()
  const { range } = useDashboardPeriod()

  const agg = useMemo(
    () => aggregateImpact(publications, range),
    [publications, range],
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <ImpactKpiCards kpis={agg.kpis} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <DashboardSectionCard
            title={t`dashboard_impact_quartiles_title`}
            subtitle={t`dashboard_impact_quartiles_subtitle`}
          >
            {agg.quartileKnown > 0 ? (
              <QuartileChart data={agg.quartiles} />
            ) : (
              <Typography color='text.secondary'>
                {t`dashboard_impact_quartiles_empty`}
              </Typography>
            )}
          </DashboardSectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DashboardSectionCard title={t`dashboard_impact_top_by_year_title`}>
            <TopByYearChart data={agg.topByYear} />
          </DashboardSectionCard>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <DashboardSectionCard
            title={t`dashboard_impact_fwci_dist_title`}
            subtitle={t`dashboard_impact_fwci_dist_subtitle`}
          >
            <FwciHistogramChart data={agg.fwciHistogram} />
          </DashboardSectionCard>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ImpactTab
