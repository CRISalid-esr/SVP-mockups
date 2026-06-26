import { t } from '@lingui/core/macro'
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined'
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined'
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined'
import EuroOutlinedIcon from '@mui/icons-material/EuroOutlined'
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined'
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
      icon: <ArticleOutlinedIcon />,
      color: '#4C78A8',
    },
    {
      label: t`dashboard_overview_kpi_international`,
      value: kpis.intl.toLocaleString('fr-FR'),
      hint: intlHint,
      icon: <PublicOutlinedIcon />,
      color: '#2A9D8F',
    },
    {
      label: t`dashboard_overview_kpi_foreign_language`,
      value: kpis.foreign.toLocaleString('fr-FR'),
      hint: kpis.foreignPct != null ? `${kpis.foreignPct}%` : undefined,
      icon: <TranslateOutlinedIcon />,
      color: '#B279A2',
    },
    {
      label: t`dashboard_overview_kpi_apc`,
      value: kpis.apcCount.toLocaleString('fr-FR'),
      hint:
        kpis.apcTotalEur > 0
          ? `${Math.round(kpis.apcTotalEur).toLocaleString('fr-FR')} EUR`
          : undefined,
      icon: <EuroOutlinedIcon />,
      color: '#E9A23B',
    },
    {
      label: t`dashboard_overview_kpi_french`,
      value: kpis.french.toLocaleString('fr-FR'),
      hint: kpis.frenchPct != null ? `${kpis.frenchPct}%` : undefined,
      icon: <MenuBookOutlinedIcon />,
      color: '#59A14F',
    },
  ]

  return <KpiCardGrid cards={cards} />
}

export default OverviewKpiCards
