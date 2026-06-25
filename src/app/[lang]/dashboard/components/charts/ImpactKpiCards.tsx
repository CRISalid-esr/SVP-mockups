import { t } from '@lingui/core/macro'
import { ImpactKpis } from './impactAggregates'
import { KpiCardData, KpiCardGrid } from './KpiCard'

const ImpactKpiCards = ({ kpis }: { kpis: ImpactKpis }) => {
  const cards: KpiCardData[] = [
    {
      label: t`dashboard_impact_kpi_fwci_known`,
      value: kpis.nbFwci.toLocaleString('fr-FR'),
      hint: kpis.pctFwci != null ? `${kpis.pctFwci}%` : undefined,
    },
    {
      label: t`dashboard_impact_kpi_top10`,
      value: kpis.nbTop10.toLocaleString('fr-FR'),
      hint: kpis.pctTop10 != null ? `${kpis.pctTop10}%` : undefined,
    },
    {
      label: t`dashboard_impact_kpi_top1`,
      value: kpis.nbTop1.toLocaleString('fr-FR'),
      hint: kpis.pctTop1 != null ? `${kpis.pctTop1}%` : undefined,
    },
    {
      label: t`dashboard_impact_kpi_fwci_mean`,
      value: kpis.fwciMean != null ? kpis.fwciMean.toFixed(2) : '—',
      hint: t`dashboard_impact_kpi_fwci_ref`,
    },
  ]
  return <KpiCardGrid cards={cards} />
}

export default ImpactKpiCards
