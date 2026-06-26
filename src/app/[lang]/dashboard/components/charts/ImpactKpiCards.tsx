import { t } from '@lingui/core/macro'
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined'
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined'
import { ImpactKpis } from './impactAggregates'
import { KpiCardData, KpiCardGrid } from './KpiCard'

const ImpactKpiCards = ({ kpis }: { kpis: ImpactKpis }) => {
  const cards: KpiCardData[] = [
    {
      label: t`dashboard_impact_kpi_fwci_known`,
      value: kpis.nbFwci.toLocaleString('fr-FR'),
      hint: kpis.pctFwci != null ? `${kpis.pctFwci}%` : undefined,
      icon: <InsightsOutlinedIcon />,
      color: '#4C78A8',
    },
    {
      label: t`dashboard_impact_kpi_top10`,
      value: kpis.nbTop10.toLocaleString('fr-FR'),
      hint: kpis.pctTop10 != null ? `${kpis.pctTop10}%` : undefined,
      icon: <WorkspacePremiumOutlinedIcon />,
      color: '#2A9D8F',
    },
    {
      label: t`dashboard_impact_kpi_top1`,
      value: kpis.nbTop1.toLocaleString('fr-FR'),
      hint: kpis.pctTop1 != null ? `${kpis.pctTop1}%` : undefined,
      icon: <EmojiEventsOutlinedIcon />,
      color: '#E9A23B',
    },
    {
      label: t`dashboard_impact_kpi_fwci_mean`,
      value: kpis.fwciMean != null ? kpis.fwciMean.toFixed(2) : '—',
      hint: t`dashboard_impact_kpi_fwci_ref`,
      icon: <SpeedOutlinedIcon />,
      color: '#B279A2',
    },
  ]
  return <KpiCardGrid cards={cards} />
}

export default ImpactKpiCards
