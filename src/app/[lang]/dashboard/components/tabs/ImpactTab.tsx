import { useEffect, useMemo, useState } from 'react'
import { Box, Grid2 as Grid, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { t } from '@lingui/core/macro'
import { useDashboardData } from '@/app/[lang]/dashboard/components/DashboardViewContext'
import { getYearBounds } from '@/app/[lang]/dashboard/components/charts/overviewAggregates'
import { aggregateImpact } from '@/app/[lang]/dashboard/components/charts/impactAggregates'
import YearRangeSelector from '@/app/[lang]/dashboard/components/charts/YearRangeSelector'
import DashboardSectionCard from '@/app/[lang]/dashboard/components/charts/DashboardSectionCard'
import ImpactKpiCards from '@/app/[lang]/dashboard/components/charts/ImpactKpiCards'
import QuartileChart from '@/app/[lang]/dashboard/components/charts/QuartileChart'
import TopByYearChart from '@/app/[lang]/dashboard/components/charts/TopByYearChart'
import FwciHistogramChart from '@/app/[lang]/dashboard/components/charts/FwciHistogramChart'

const ImpactTab = () => {
  const theme = useTheme()
  const { publications } = useDashboardData()
  const bounds = useMemo(() => getYearBounds(publications), [publications])
  const [range, setRange] = useState({ start: bounds.min, end: bounds.max })

  useEffect(() => {
    setRange({ start: bounds.min, end: bounds.max })
  }, [bounds.min, bounds.max])

  const agg = useMemo(
    () => aggregateImpact(publications, range),
    [publications, range],
  )

  const yearOptions = useMemo(
    () =>
      Array.from(
        { length: bounds.max - bounds.min + 1 },
        (_, i) => bounds.min + i,
      ),
    [bounds],
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1.5,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: theme.utils.pxToRem(18),
              color: theme.palette.primary.main,
            }}
          >
            {t`dashboard_tab_impact`}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {t`dashboard_overview_lab_demo_caption`}
          </Typography>
        </Box>
        <YearRangeSelector
          value={range}
          options={yearOptions}
          onChange={setRange}
        />
      </Box>

      <ImpactKpiCards kpis={agg.kpis} />

      <Grid container spacing={2}>
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
