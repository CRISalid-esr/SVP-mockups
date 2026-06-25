import dashboardData from './data/dashboard-publications.json'
import countryNamesData from './data/countryNames.json'

/**
 * Une publication agrégée du jeu de démo (laboratoire LS2N, export Nantilux
 * anonymisé — aucun nom d'auteur). Superset couvrant la « Vue d'ensemble »
 * (Phase 1) ainsi que les onglets International et Impact (Phase 2).
 */
export interface DashboardPublication {
  year: number | null
  language: string | null
  isForeignLanguage: boolean
  pubType: string | null
  oaStatus: string | null
  oaColor: string | null
  isInternational: boolean | null
  hasApc: boolean
  apcAmount: number | null
  apcCurrency: string | null
  journal: string | null
  // International (phase 2)
  countries: string[]
  subfields: string[]
  partnerInstitutions: {
    name: string
    cc: string | null
    city: string | null
    lat: number | null
    lon: number | null
  }[]
  // Impact (phase 2)
  sjrQuartile: string | null
  fwci: number | null
  citedByCount: number
  isTop10Percent: boolean | null
  isTop1Percent: boolean | null
  // Structure (phase 3) — dérivés de l'appariement auteurs ↔ effectifs
  teams: string[]
  authorIds: number[]
  hasPhd: boolean
}

export interface CountryName {
  fr: string
  echarts: string
  eu: boolean
}

/** Auteur interne pseudonymisé (réseau de co-signatures, phase 3). */
export interface AuthorMeta {
  id: number
  label: string
  teams: string[]
  isPhd: boolean
}

interface DashboardDataset {
  lab: string
  slug: string
  publications: DashboardPublication[]
  authors: AuthorMeta[]
}

const dataset = dashboardData as DashboardDataset

/**
 * Données du tableau de bord. Pour la maquette, le jeu de démo (LS2N) est
 * renvoyé quelle que soit la perspective sélectionnée.
 */
const countryNames = countryNamesData as Record<string, CountryName>

export const dashboardMockService = {
  getLab: () => ({ name: dataset.lab, slug: dataset.slug }),
  getPublications: (): DashboardPublication[] => dataset.publications,
  getAuthors: (): AuthorMeta[] => dataset.authors,
  getCountryNames: (): Record<string, CountryName> => countryNames,
}
