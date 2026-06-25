import { t } from '@lingui/core/macro'
import { OverviewKpis } from './overviewAggregates'
import { KpiCardData, KpiCardGrid } from './KpiCard'

const OverviewKpiCards = ({ kpis }: { kpis: OverviewKpis }) => {
  const intlHint =
    kpis.intlPct != null
      ? `${kpis.intlPct}%` +
        (kpis.intlUnknown > 0
          ? ' ' + t`dashboard_overview_kpi_intl_unknown_suffix`
          : '')
      : undefined

  const cards: KpiCardData[] = [
    {
      label: t`dashboard_overview_kpi_total`,
      value: kpis.total.toLocaleString('fr-FR'),
    },
    {
      label: t`dashboard_overview_kpi_international`,
      value: kpis.intl.toLocaleString('fr-FR'),
      hint: intlHint,
    },
    {
      label: t`dashboard_overview_kpi_foreign_language`,
      value: kpis.foreign.toLocaleString('fr-FR'),
      hint: kpis.foreignPct != null ? `${kpis.foreignPct}%` : undefined,
    },
    {
      label: t`dashboard_overview_kpi_apc`,
      value: kpis.apcCount.toLocaleString('fr-FR'),
      hint:
        kpis.apcTotalEur > 0
          ? `${Math.round(kpis.apcTotalEur).toLocaleString('fr-FR')} EUR`
          : undefined,
    },
    {
      label: t`dashboard_overview_kpi_french`,
      value: kpis.french.toLocaleString('fr-FR'),
      hint: kpis.frenchPct != null ? `${kpis.frenchPct}%` : undefined,
    },
  ]

  return <KpiCardGrid cards={cards} />
}

export default OverviewKpiCards
