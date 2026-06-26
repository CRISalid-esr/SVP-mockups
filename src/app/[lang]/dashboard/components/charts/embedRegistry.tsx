'use client'

import { ReactElement } from 'react'
import { useDashboardData } from '@/app/[lang]/dashboard/components/DashboardViewContext'
import { dashboardMockService } from '@/mocks/dashboardMockService'
import { aggregateOverview, getYearBounds } from './overviewAggregates'
import {
  aggregateInternational,
  aggregateFlows,
  aggregateFlowMap,
} from './internationalAggregates'
import { aggregateImpact } from './impactAggregates'
import { aggregateBooks } from './booksAggregates'
import {
  aggregateTeams,
  aggregateTeamRadar,
  aggregateResearchers,
  aggregatePhd,
} from './structureAggregates'
import { aggregateNetwork } from './networkAggregates'

import YearlyEvolutionChart from './YearlyEvolutionChart'
import LanguagePieChart from './LanguagePieChart'
import PublicationTypesChart from './PublicationTypesChart'
import OpenAccessPieChart from './OpenAccessPieChart'
import ApcYearlyChart from './ApcYearlyChart'
import IntlVsNationalChart from './IntlVsNationalChart'
import IntlPercentChart from './IntlPercentChart'
import WorldChoroplethChart from './WorldChoroplethChart'
import TopCountriesChart from './TopCountriesChart'
import CountryHeatmapChart from './CountryHeatmapChart'
import EuZoneChart from './EuZoneChart'
import EuByYearChart from './EuByYearChart'
import TopPartnersChart from './TopPartnersChart'
import FlowMapChart from './FlowMapChart'
import SankeyChart from './SankeyChart'
import SunburstChart from './SunburstChart'
import QuartileChart from './QuartileChart'
import TopByYearChart from './TopByYearChart'
import FwciHistogramChart from './FwciHistogramChart'
import BooksByYearChart from './BooksByYearChart'
import DonutChart from './DonutChart'
import StackedAreaChart from './StackedAreaChart'
import StackedBarHChart from './StackedBarHChart'
import RadarChart from './RadarChart'
import RankBarChart from './RankBarChart'
import NetworkChart from './NetworkChart'

// ── Hooks de portée : plage d'années pleine, calculée sur le périmètre courant ──
const useScope = () => {
  const d = useDashboardData()
  const { min, max } = getYearBounds(d.publications)
  return { ...d, range: { start: min, end: max } }
}
const useOverview = () => {
  const s = useScope()
  return aggregateOverview(s.publications, s.range)
}
const useIntl = () => {
  const s = useScope()
  return aggregateInternational(
    s.publications,
    s.range,
    dashboardMockService.getCountryNames(),
  )
}
const useFlows = () => {
  const s = useScope()
  return aggregateFlows(
    s.publications,
    s.range,
    dashboardMockService.getCountryNames(),
  )
}
const useImpact = () => {
  const s = useScope()
  return aggregateImpact(s.publications, s.range)
}
const useBooks = () => {
  const s = useScope()
  return aggregateBooks(s.publications, s.range)
}
const useTeams = () => {
  const s = useScope()
  return aggregateTeams(s.publications, s.range)
}

// ── Composants d'intégration (un par graphique partageable) ──────────────────
const ChartPublicationsParAnnee = () => {
  const a = useOverview()
  return <YearlyEvolutionChart data={a.byYear} />
}
const ChartLangues = () => {
  const a = useOverview()
  return <LanguagePieChart data={a.byLanguage} />
}
const ChartTypes = () => {
  const a = useOverview()
  return <PublicationTypesChart data={a.byType} />
}
const ChartAccesOuvert = () => {
  const a = useOverview()
  return <OpenAccessPieChart data={a.byOa} />
}
const ChartApc = () => {
  const a = useOverview()
  return <ApcYearlyChart data={a.apcByYear} />
}

const ChartIntlVsNational = () => {
  const a = useIntl()
  return <IntlVsNationalChart data={a.intlByYear} />
}
const ChartIntlPercent = () => {
  const a = useIntl()
  return <IntlPercentChart data={a.intlPctByYear} />
}
const ChartCarteMonde = () => {
  const a = useIntl()
  return <WorldChoroplethChart data={a.byCountry} />
}
const ChartTopPays = () => {
  const a = useIntl()
  return <TopCountriesChart data={a.byCountry} />
}
const ChartPaysAnnees = () => {
  const a = useIntl()
  return <CountryHeatmapChart data={a.heatmap} />
}
const ChartZoneUe = () => {
  const a = useIntl()
  return <EuZoneChart data={a.euZone} />
}
const ChartUeParAnnee = () => {
  const a = useIntl()
  return <EuByYearChart data={a.euByYear} />
}
const ChartTopPartenaires = () => {
  const a = useIntl()
  return <TopPartnersChart data={a.topPartners} />
}
const ChartCarteFlux = () => {
  const s = useScope()
  const data = aggregateFlowMap(
    s.publications,
    s.range,
    dashboardMockService.getCountryNames(),
  )
  return <FlowMapChart data={data} />
}
const ChartSankey = () => {
  const f = useFlows()
  return <SankeyChart nodes={f.sankey.nodes} links={f.sankey.links} />
}
const ChartSunburst = () => {
  const f = useFlows()
  return <SunburstChart data={f.sunburst} />
}

const ChartQuartiles = () => {
  const a = useImpact()
  return <QuartileChart data={a.quartiles} />
}
const ChartTopParAnnee = () => {
  const a = useImpact()
  return <TopByYearChart data={a.topByYear} />
}
const ChartFwci = () => {
  const a = useImpact()
  return <FwciHistogramChart data={a.fwciHistogram} />
}

const ChartOuvragesTypes = () => {
  const a = useBooks()
  return <PublicationTypesChart data={a.byType} chartId='ouvrages-types' />
}
const ChartOuvragesParAnnee = () => {
  const a = useBooks()
  return <BooksByYearChart years={a.years} series={a.series} />
}

const ChartEquipesRepartition = () => {
  const a = useTeams()
  return (
    <DonutChart
      chartId='equipes-repartition'
      data={a.byTeam.map((tm) => ({ name: tm.key, value: tm.count }))}
    />
  )
}
const ChartEquipesEvolution = () => {
  const a = useTeams()
  return <StackedAreaChart data={a.byYear} chartId='equipes-evolution' />
}
const ChartEquipesTypes = () => {
  const a = useTeams()
  return <StackedBarHChart data={a.byType} />
}
const ChartRadar = () => {
  const s = useScope()
  const radar = aggregateTeamRadar(s.publications, s.range)
  return <RadarChart data={radar} />
}

const ChartTopChercheurs = () => {
  const s = useScope()
  const researchers = aggregateResearchers(
    s.publications,
    s.authors,
    s.range,
    25,
  )
  return (
    <RankBarChart
      data={researchers}
      color='#4C78A8'
      height={560}
      chartId='top-chercheurs'
    />
  )
}

const usePhdAgg = () => {
  const s = useScope()
  return aggregatePhd(s.publications, s.authors, s.range)
}
const ChartDoctorantsRepartition = () => {
  const a = usePhdAgg()
  return (
    <DonutChart
      chartId='doctorants-repartition'
      data={a.byTeam.map((tm) => ({ name: tm.key, value: tm.count }))}
    />
  )
}
const ChartDoctorantsEvolution = () => {
  const a = usePhdAgg()
  return <StackedAreaChart data={a.byYear} chartId='doctorants-evolution' />
}
const ChartDoctorantsClassement = () => {
  const a = usePhdAgg()
  return (
    <RankBarChart
      data={a.byDoctorant}
      color='#B279A2'
      height={Math.max(240, a.byDoctorant.length * 26 + 60)}
      chartId='doctorants-classement'
    />
  )
}

const ChartReseau = () => {
  const d = useDashboardData()
  const { min, max } = getYearBounds(d.publications)
  const data = aggregateNetwork(
    d.publications,
    d.authors,
    { start: min, end: max },
    d.isResearcher ? 1 : 2,
    d.isResearcher ? d.researcherId : null,
  )
  return <NetworkChart data={data} />
}

export interface EmbedChartDef {
  /** Libellé affiché en titre de la page d'intégration. */
  label: string
  Chart: () => ReactElement
}

/**
 * Registre des graphiques partageables : clé = identifiant `chartId`/`exportName`
 * de l'instance (cf. EChart). La page /{lang}/embed/ rend `Chart` dans un
 * DashboardDataProvider correspondant à la perspective demandée.
 */
export const EMBED_CHARTS: Record<string, EmbedChartDef> = {
  // Vue d'ensemble
  'publications-par-annee': {
    label: 'Publications par année',
    Chart: ChartPublicationsParAnnee,
  },
  langues: { label: 'Langues de publication', Chart: ChartLangues },
  'types-publications': { label: 'Types de publications', Chart: ChartTypes },
  'acces-ouvert': { label: 'Accès ouvert', Chart: ChartAccesOuvert },
  'apc-par-annee': { label: 'Frais de publication (APC)', Chart: ChartApc },
  // Collaborations internationales
  'international-vs-national': {
    label: 'International vs national',
    Chart: ChartIntlVsNational,
  },
  'pourcentage-international': {
    label: 'Part de publications internationales',
    Chart: ChartIntlPercent,
  },
  'carte-monde': { label: 'Carte des pays partenaires', Chart: ChartCarteMonde },
  'top-pays': { label: 'Top des pays partenaires', Chart: ChartTopPays },
  'pays-annees': {
    label: 'Pays partenaires par année',
    Chart: ChartPaysAnnees,
  },
  'zone-ue': { label: 'Union européenne / hors UE', Chart: ChartZoneUe },
  'ue-par-annee': { label: 'UE / hors UE par année', Chart: ChartUeParAnnee },
  'top-partenaires': {
    label: 'Top des organismes partenaires',
    Chart: ChartTopPartenaires,
  },
  'carte-flux': { label: 'Carte de flux des partenariats', Chart: ChartCarteFlux },
  'flux-sankey': { label: 'Flux équipe → pays → organisme', Chart: ChartSankey },
  sunburst: { label: 'Répartition des partenariats', Chart: ChartSunburst },
  // Impact & citations
  'quartiles-scimago': { label: 'Quartiles Scimago', Chart: ChartQuartiles },
  'top-par-annee': { label: 'Publications Top 1 % / 10 %', Chart: ChartTopParAnnee },
  'distribution-fwci': { label: 'Distribution du FWCI', Chart: ChartFwci },
  // Ouvrages
  'ouvrages-types': { label: "Types d'ouvrages", Chart: ChartOuvragesTypes },
  'ouvrages-par-annee': { label: 'Ouvrages par année', Chart: ChartOuvragesParAnnee },
  // Équipes
  'equipes-repartition': {
    label: 'Répartition par équipe',
    Chart: ChartEquipesRepartition,
  },
  'equipes-evolution': {
    label: 'Évolution par équipe',
    Chart: ChartEquipesEvolution,
  },
  'repartition-empilee': { label: 'Types par équipe', Chart: ChartEquipesTypes },
  'radar-disciplinaire': {
    label: 'Profil disciplinaire des équipes',
    Chart: ChartRadar,
  },
  // Par chercheur
  'top-chercheurs': { label: 'Chercheurs les plus prolifiques', Chart: ChartTopChercheurs },
  // Doctorants
  'doctorants-repartition': {
    label: 'Doctorants par équipe',
    Chart: ChartDoctorantsRepartition,
  },
  'doctorants-evolution': {
    label: 'Évolution des publications de doctorants',
    Chart: ChartDoctorantsEvolution,
  },
  'doctorants-classement': {
    label: 'Publications par doctorant',
    Chart: ChartDoctorantsClassement,
  },
  // Réseau
  'reseau-cosignatures': {
    label: 'Réseau de co-signatures',
    Chart: ChartReseau,
  },
}
