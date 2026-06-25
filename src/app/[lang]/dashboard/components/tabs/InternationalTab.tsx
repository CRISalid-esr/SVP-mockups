import { useEffect, useMemo, useState } from 'react'
import { Box, Grid2 as Grid, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { t } from '@lingui/core/macro'
import { dashboardMockService } from '@/mocks/dashboardMockService'
import { useDashboardData } from '@/app/[lang]/dashboard/components/DashboardViewContext'
import { getYearBounds } from '@/app/[lang]/dashboard/components/charts/overviewAggregates'
import {
  aggregateInternational,
  aggregateFlows,
  aggregateFlowMap,
} from '@/app/[lang]/dashboard/components/charts/internationalAggregates'
import YearRangeSelector from '@/app/[lang]/dashboard/components/charts/YearRangeSelector'
import DashboardSectionCard from '@/app/[lang]/dashboard/components/charts/DashboardSectionCard'
import IntlVsNationalChart from '@/app/[lang]/dashboard/components/charts/IntlVsNationalChart'
import IntlPercentChart from '@/app/[lang]/dashboard/components/charts/IntlPercentChart'
import WorldChoroplethChart from '@/app/[lang]/dashboard/components/charts/WorldChoroplethChart'
import TopCountriesChart from '@/app/[lang]/dashboard/components/charts/TopCountriesChart'
import EuZoneChart from '@/app/[lang]/dashboard/components/charts/EuZoneChart'
import EuByYearChart from '@/app/[lang]/dashboard/components/charts/EuByYearChart'
import CountryHeatmapChart from '@/app/[lang]/dashboard/components/charts/CountryHeatmapChart'
import TopPartnersChart from '@/app/[lang]/dashboard/components/charts/TopPartnersChart'
import SankeyChart from '@/app/[lang]/dashboard/components/charts/SankeyChart'
import SunburstChart from '@/app/[lang]/dashboard/components/charts/SunburstChart'
import FlowMapChart from '@/app/[lang]/dashboard/components/charts/FlowMapChart'

const InternationalTab = () => {
  const theme = useTheme()
  const { publications, isResearcher } = useDashboardData()
  const countryNames = useMemo(
    () => dashboardMockService.getCountryNames(),
    [],
  )
  const bounds = useMemo(() => getYearBounds(publications), [publications])
  const [range, setRange] = useState({ start: bounds.min, end: bounds.max })

  useEffect(() => {
    setRange({ start: bounds.min, end: bounds.max })
  }, [bounds.min, bounds.max])

  const agg = useMemo(
    () => aggregateInternational(publications, range, countryNames),
    [publications, range, countryNames],
  )
  const flows = useMemo(
    () => aggregateFlows(publications, range, countryNames),
    [publications, range, countryNames],
  )
  const flowMap = useMemo(
    () => aggregateFlowMap(publications, range, countryNames),
    [publications, range, countryNames],
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
            {t`dashboard_tab_international`}
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

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <DashboardSectionCard title={t`dashboard_intl_vs_national_title`}>
            <IntlVsNationalChart data={agg.intlByYear} />
          </DashboardSectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DashboardSectionCard title={t`dashboard_intl_pct_title`}>
            <IntlPercentChart data={agg.intlPctByYear} />
          </DashboardSectionCard>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <DashboardSectionCard
            title={t`dashboard_intl_map_title`}
            subtitle={t`dashboard_intl_map_subtitle`}
          >
            <WorldChoroplethChart data={agg.byCountry} />
          </DashboardSectionCard>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <DashboardSectionCard
            title={t`dashboard_intl_flowmap_title`}
            subtitle={t`dashboard_intl_flowmap_subtitle`}
          >
            {flowMap.points.length > 0 ? (
              <FlowMapChart data={flowMap} />
            ) : (
              <Typography color='text.secondary'>
                {t`dashboard_intl_flow_empty`}
              </Typography>
            )}
          </DashboardSectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <DashboardSectionCard title={t`dashboard_intl_top_countries_title`}>
            <TopCountriesChart data={agg.byCountry} />
          </DashboardSectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DashboardSectionCard title={t`dashboard_intl_heatmap_title`}>
            <CountryHeatmapChart data={agg.heatmap} />
          </DashboardSectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <DashboardSectionCard title={t`dashboard_intl_eu_zone_title`}>
            <EuZoneChart data={agg.euZone} />
          </DashboardSectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <DashboardSectionCard title={t`dashboard_intl_eu_evolution_title`}>
            <EuByYearChart data={agg.euByYear} />
          </DashboardSectionCard>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <DashboardSectionCard
            title={t`dashboard_intl_partners_title`}
            subtitle={t`dashboard_intl_partners_subtitle`}
          >
            {agg.topPartners.length > 0 ? (
              <TopPartnersChart data={agg.topPartners} />
            ) : (
              <Typography color='text.secondary'>
                {t`dashboard_intl_partners_empty`}
              </Typography>
            )}
          </DashboardSectionCard>
        </Grid>

        {!isResearcher && (
          <>
            <Grid size={{ xs: 12 }}>
              <DashboardSectionCard
                title={t`dashboard_intl_sankey_title`}
                subtitle={t`dashboard_intl_flow_subtitle`}
              >
                {flows.sankey.links.length > 0 ? (
                  <SankeyChart
                    nodes={flows.sankey.nodes}
                    links={flows.sankey.links}
                  />
                ) : (
                  <Typography color='text.secondary'>
                    {t`dashboard_intl_flow_empty`}
                  </Typography>
                )}
              </DashboardSectionCard>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <DashboardSectionCard
                title={t`dashboard_intl_sunburst_title`}
                subtitle={t`dashboard_intl_flow_subtitle`}
              >
                {flows.sunburst.length > 0 ? (
                  <SunburstChart data={flows.sunburst} />
                ) : (
                  <Typography color='text.secondary'>
                    {t`dashboard_intl_flow_empty`}
                  </Typography>
                )}
              </DashboardSectionCard>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  )
}

export default InternationalTab
