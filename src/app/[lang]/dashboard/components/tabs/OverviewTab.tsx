import { t } from '@lingui/core/macro'
import { Box, Typography } from '@mui/material'
import React, { useMemo } from 'react'
import { useDashboardData } from '@/app/[lang]/dashboard/components/DashboardViewContext'
import { useDashboardPeriod } from '@/app/[lang]/dashboard/components/DashboardPeriod'
import PersonIdentityCard from '@/app/[lang]/dashboard/components/PersonIdentityCard'
import useStore from '@/stores/global_store'
import { isPerson } from '@/types/Person'
import { aggregateOverview } from '@/app/[lang]/dashboard/components/charts/overviewAggregates'
import OverviewKpiCards from '@/app/[lang]/dashboard/components/charts/OverviewKpiCards'
import YearlyEvolutionChart from '@/app/[lang]/dashboard/components/charts/YearlyEvolutionChart'
import LanguagePieChart from '@/app/[lang]/dashboard/components/charts/LanguagePieChart'
import PublicationTypesChart from '@/app/[lang]/dashboard/components/charts/PublicationTypesChart'
import OpenAccessPieChart from '@/app/[lang]/dashboard/components/charts/OpenAccessPieChart'
import ApcYearlyChart from '@/app/[lang]/dashboard/components/charts/ApcYearlyChart'
import DashboardSectionCard from '@/app/[lang]/dashboard/components/charts/DashboardSectionCard'
import DashboardDetails from '@/app/[lang]/dashboard/components/charts/DashboardDetails'
import { ChartGrid } from '@/app/[lang]/dashboard/components/charts/ChartGrid'

const OverviewTab = () => {
  const { publications } = useDashboardData()
  const { range } = useDashboardPeriod()
  const currentPerspective = useStore((state) => state.user.currentPerspective)

  const aggregates = useMemo(() => aggregateOverview(publications, range), [publications, range])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {isPerson(currentPerspective) && <PersonIdentityCard person={currentPerspective} />}

      <OverviewKpiCards kpis={aggregates.kpis} />

      <DashboardSectionCard title={t`dashboard_overview_yearly_title`}>
        <YearlyEvolutionChart data={aggregates.byYear} />
      </DashboardSectionCard>

      <ChartGrid>
        <DashboardSectionCard title={t`dashboard_overview_types_title`}>
          <PublicationTypesChart data={aggregates.byType} />
        </DashboardSectionCard>
        <DashboardSectionCard title={t`dashboard_overview_oa_title`}>
          <OpenAccessPieChart data={aggregates.byOa} />
        </DashboardSectionCard>
      </ChartGrid>

      <DashboardDetails summary='Langues, frais de publication (APC)'>
        <ChartGrid>
          <DashboardSectionCard title={t`dashboard_overview_language_title`}>
            <LanguagePieChart data={aggregates.byLanguage} />
          </DashboardSectionCard>
          <DashboardSectionCard title={t`dashboard_overview_apc_title`}>
            {aggregates.apcByYear.length > 0 ? (
              <ApcYearlyChart data={aggregates.apcByYear} />
            ) : (
              <Typography color='text.secondary'>{t`dashboard_overview_apc_empty`}</Typography>
            )}
          </DashboardSectionCard>
        </ChartGrid>
      </DashboardDetails>
    </Box>
  )
}

export default OverviewTab
