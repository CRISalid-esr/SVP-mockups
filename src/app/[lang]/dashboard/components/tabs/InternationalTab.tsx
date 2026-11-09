import React, { useEffect, useMemo, useState } from 'react'
import { Box, Slider, Typography } from '@mui/material'
import { t } from '@lingui/core/macro'
import { dashboardMockService } from '@/mocks/dashboardMockService'
import { useDashboardData } from '@/app/[lang]/dashboard/components/DashboardViewContext'
import { useDashboardPeriod } from '@/app/[lang]/dashboard/components/DashboardPeriod'
import {
  aggregateInternational,
  aggregateFlows,
  aggregateFlowMap,
} from '@/app/[lang]/dashboard/components/charts/internationalAggregates'
import { aggregateNetwork } from '@/app/[lang]/dashboard/components/charts/networkAggregates'
import DashboardSectionCard from '@/app/[lang]/dashboard/components/charts/DashboardSectionCard'
import DashboardDetails from '@/app/[lang]/dashboard/components/charts/DashboardDetails'
import { ChartGrid } from '@/app/[lang]/dashboard/components/charts/ChartGrid'
import NetworkChart from '@/app/[lang]/dashboard/components/charts/NetworkChart'
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

const Empty = ({ children }: { children: React.ReactNode }) => (
  <Typography color='text.secondary'>{children}</Typography>
)

const InternationalTab = () => {
  const { publications, authors, isResearcher, isOwn, researcherId } = useDashboardData()
  const { range } = useDashboardPeriod()
  const countryNames = useMemo(() => dashboardMockService.getCountryNames(), [])

  // Pour une personne, on garde tous ses co-auteurs directs (seuil 1).
  const [minPubs, setMinPubs] = useState(isResearcher ? 1 : 2)
  useEffect(() => {
    setMinPubs(isResearcher ? 1 : 2)
  }, [isResearcher])

  const agg = useMemo(
    () => aggregateInternational(publications, range, countryNames),
    [publications, range, countryNames],
  )
  const flows = useMemo(() => aggregateFlows(publications, range, countryNames), [publications, range, countryNames])
  const flowMap = useMemo(() => aggregateFlowMap(publications, range, countryNames), [publications, range, countryNames])
  const network = useMemo(
    () => aggregateNetwork(publications, authors, range, minPubs, isResearcher ? researcherId : null),
    [publications, authors, range, minPubs, isResearcher, researcherId],
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <DashboardSectionCard
        title={
          !isResearcher
            ? t`dashboard_network_title`
            : isOwn
              ? t`dashboard_network_researcher_title`
              : t`dashboard_network_other_researcher_title`
        }
        subtitle={
          !isResearcher
            ? t`dashboard_network_subtitle`
            : isOwn
              ? t`dashboard_network_researcher_subtitle`
              : t`dashboard_network_other_researcher_subtitle`
        }
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, maxWidth: 360, mb: 1 }}>
          <Typography id='network-threshold' variant='body2' color='text.secondary' sx={{ whiteSpace: 'nowrap' }}>
            {t`dashboard_network_min_pubs`}
          </Typography>
          <Slider
            aria-labelledby='network-threshold'
            value={minPubs}
            onChange={(_event, value) => setMinPubs(value as number)}
            min={1}
            max={6}
            step={1}
            marks
            valueLabelDisplay='auto'
            size='small'
          />
        </Box>
        {network.nodes.length > 0 ? <NetworkChart data={network} /> : <Empty>{t`dashboard_network_empty`}</Empty>}
      </DashboardSectionCard>

      <DashboardSectionCard title={t`dashboard_intl_map_title`} subtitle={t`dashboard_intl_map_subtitle`}>
        <WorldChoroplethChart data={agg.byCountry} />
      </DashboardSectionCard>

      <ChartGrid>
        <DashboardSectionCard title={t`dashboard_intl_vs_national_title`}>
          <IntlVsNationalChart data={agg.intlByYear} />
        </DashboardSectionCard>
        <DashboardSectionCard title={t`dashboard_intl_partners_title`} subtitle={t`dashboard_intl_partners_subtitle`}>
          {agg.topPartners.length > 0 ? (
            <TopPartnersChart data={agg.topPartners} />
          ) : (
            <Empty>{t`dashboard_intl_partners_empty`}</Empty>
          )}
        </DashboardSectionCard>
      </ChartGrid>

      <DashboardDetails
        summary={
          isResearcher
            ? 'Pays, Europe, villes partenaires'
            : 'Pays, Europe, villes partenaires, flux par équipe'
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <ChartGrid>
            <DashboardSectionCard title={t`dashboard_intl_top_countries_title`}>
              <TopCountriesChart data={agg.byCountry} />
            </DashboardSectionCard>
            <DashboardSectionCard title={t`dashboard_intl_pct_title`}>
              <IntlPercentChart data={agg.intlPctByYear} />
            </DashboardSectionCard>
            <DashboardSectionCard title={t`dashboard_intl_eu_zone_title`}>
              <EuZoneChart data={agg.euZone} />
            </DashboardSectionCard>
            <DashboardSectionCard title={t`dashboard_intl_eu_evolution_title`}>
              <EuByYearChart data={agg.euByYear} />
            </DashboardSectionCard>
          </ChartGrid>

          <DashboardSectionCard title={t`dashboard_intl_heatmap_title`}>
            <CountryHeatmapChart data={agg.heatmap} />
          </DashboardSectionCard>

          <DashboardSectionCard title={t`dashboard_intl_flowmap_title`} subtitle={t`dashboard_intl_flowmap_subtitle`}>
            {flowMap.points.length > 0 ? <FlowMapChart data={flowMap} /> : <Empty>{t`dashboard_intl_flow_empty`}</Empty>}
          </DashboardSectionCard>

          {!isResearcher && (
            <>
              <DashboardSectionCard title={t`dashboard_intl_sankey_title`} subtitle={t`dashboard_intl_flow_subtitle`}>
                {flows.sankey.links.length > 0 ? (
                  <SankeyChart nodes={flows.sankey.nodes} links={flows.sankey.links} />
                ) : (
                  <Empty>{t`dashboard_intl_flow_empty`}</Empty>
                )}
              </DashboardSectionCard>
              <DashboardSectionCard title={t`dashboard_intl_sunburst_title`} subtitle={t`dashboard_intl_flow_subtitle`}>
                {flows.sunburst.length > 0 ? <SunburstChart data={flows.sunburst} /> : <Empty>{t`dashboard_intl_flow_empty`}</Empty>}
              </DashboardSectionCard>
            </>
          )}
        </Box>
      </DashboardDetails>
    </Box>
  )
}

export default InternationalTab
