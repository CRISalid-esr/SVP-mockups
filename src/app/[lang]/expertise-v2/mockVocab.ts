import { Keyword, ResearchTheme, Vocabulary } from './types'

// ─── Référentiels simulés ────────────────────────────────────────────────────
// En production : IdRef (RAMEAU), NLM (MeSH), Wikidata, référentiel des
// domaines HAL. Ici, une petite base locale filtrée côté client.

const TERMS: Keyword[] = [
  // RAMEAU
  { label: 'Habitat partagé', vocabulary: 'rameau', detail: 'Logement', uri: 'https://www.idref.fr/19893420X' },
  { label: 'Habitat participatif', vocabulary: 'rameau', uri: 'https://www.idref.fr/178066575' },
  { label: 'Habitat inclusif', vocabulary: 'rameau', detail: 'Logement' },
  { label: 'Politique du logement', vocabulary: 'rameau' },
  { label: 'Personnes âgées', vocabulary: 'rameau' },
  { label: 'Personnes âgées — Logement', vocabulary: 'rameau' },
  { label: 'Vieillissement', vocabulary: 'rameau' },
  { label: 'Vieillissement de la population', vocabulary: 'rameau' },
  { label: 'Espace rural', vocabulary: 'rameau' },
  { label: 'Bretagne (France)', vocabulary: 'rameau' },
  { label: 'Littoraux', vocabulary: 'rameau' },
  { label: 'Retraités', vocabulary: 'rameau' },
  { label: 'Recherche participative', vocabulary: 'rameau' },
  { label: 'Cartographie', vocabulary: 'rameau' },
  { label: 'Collectivités locales', vocabulary: 'rameau' },
  { label: 'Relations entre générations', vocabulary: 'rameau' },
  { label: 'Confort thermique', vocabulary: 'rameau' },
  { label: 'Changements climatiques — Adaptation', vocabulary: 'rameau' },
  { label: 'Précarité énergétique', vocabulary: 'rameau' },
  { label: 'Migrations intérieures', vocabulary: 'rameau' },
  { label: 'Mobilité résidentielle', vocabulary: 'rameau' },
  { label: 'Géographie sociale', vocabulary: 'rameau' },
  { label: 'Santé publique', vocabulary: 'rameau' },
  { label: 'Services publics — Zones rurales', vocabulary: 'rameau' },
  { label: 'Solidarité', vocabulary: 'rameau' },
  // MeSH
  { label: 'Aged', vocabulary: 'mesh', detail: 'D000368' },
  { label: 'Housing for the Elderly', vocabulary: 'mesh', detail: 'D006797' },
  { label: 'Rural Population', vocabulary: 'mesh', detail: 'D012424' },
  { label: 'Community-Based Participatory Research', vocabulary: 'mesh', detail: 'D057253' },
  { label: 'Climate Change', vocabulary: 'mesh', detail: 'D057231' },
  { label: 'Retirement', vocabulary: 'mesh', detail: 'D012184' },
  { label: 'Social Isolation', vocabulary: 'mesh', detail: 'D012934' },
  { label: 'Health Services Accessibility', vocabulary: 'mesh', detail: 'D006297' },
  // Wikidata
  { label: 'Senior cohousing', vocabulary: 'wikidata', detail: 'Q7450688' },
  { label: 'Recherche-action', vocabulary: 'wikidata', detail: 'Q379690' },
  { label: 'Retirement migration', vocabulary: 'wikidata', detail: 'Q7316471' },
  { label: 'Îlot de chaleur urbain', vocabulary: 'wikidata', detail: 'Q845115' },
  { label: 'Transition énergétique', vocabulary: 'wikidata', detail: 'Q1785580' },
  { label: 'Gérontologie', vocabulary: 'wikidata', detail: 'Q188826' },
  { label: 'Cartographie participative', vocabulary: 'wikidata', detail: 'Q6072730' },
  { label: 'Désert médical', vocabulary: 'wikidata', detail: 'Q3023612' },
  // Domaines HAL
  { label: 'Géographie', vocabulary: 'hal', detail: 'shs.geo' },
  { label: 'Sociologie', vocabulary: 'hal', detail: 'shs.socio' },
  { label: 'Architecture, aménagement de l’espace', vocabulary: 'hal', detail: 'shs.archi' },
  { label: 'Science politique', vocabulary: 'hal', detail: 'shs.scipo' },
  { label: 'Démographie', vocabulary: 'hal', detail: 'shs.demo' },
  { label: 'Environnement et Société', vocabulary: 'hal', detail: 'shs.envir' },
  { label: 'Santé publique et épidémiologie', vocabulary: 'hal', detail: 'sdv.spee' },
]

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export function searchVocab(query: string, vocabulary: Vocabulary): Keyword[] {
  if (vocabulary === 'libre') return []
  const q = normalize(query.trim())
  const pool = TERMS.filter((t) => t.vocabulary === vocabulary)
  if (!q) return pool.slice(0, 8)
  return pool.filter((t) => normalize(t.label).includes(q) || normalize(t.detail ?? '').includes(q)).slice(0, 8)
}

// Suggestions « d'après vos publications HAL » : termes génériques, moins ceux
// déjà présents sur le thème.
const HAL_SUGGESTED: Keyword[] = [
  { label: 'Relations entre générations', vocabulary: 'rameau' },
  { label: 'Collectivités locales', vocabulary: 'rameau' },
  { label: 'Housing for the Elderly', vocabulary: 'mesh', detail: 'D006797' },
  { label: 'Transition énergétique', vocabulary: 'wikidata', detail: 'Q1785580' },
  { label: 'Précarité énergétique', vocabulary: 'rameau' },
  { label: 'Géographie', vocabulary: 'hal', detail: 'shs.geo' },
]

export function suggestedKeywords(current: Keyword[]): Keyword[] {
  const present = new Set(current.map((k) => normalize(k.label)))
  return HAL_SUGGESTED.filter((k) => !present.has(normalize(k.label))).slice(0, 3)
}

// ─── Import depuis HAL : thèmes proposés à partir des publications ───────────

export interface HalThemeSuggestion {
  label: string
  description: string
  yearFrom: number
  yearTo: number | null
  publicationCount: number
  keywords: Keyword[]
}

export const HAL_THEME_SUGGESTIONS: HalThemeSuggestion[] = [
  {
    label: 'Précarité énergétique des ménages âgés',
    description: 'Exposition des retraités modestes aux coûts de l’énergie et stratégies d’adaptation dans le logement.',
    yearFrom: 2020,
    yearTo: null,
    publicationCount: 4,
    keywords: [
      { label: 'Précarité énergétique', vocabulary: 'rameau' },
      { label: 'Personnes âgées', vocabulary: 'rameau' },
      { label: 'Transition énergétique', vocabulary: 'wikidata', detail: 'Q1785580' },
    ],
  },
  {
    label: 'Gouvernance locale des politiques gérontologiques',
    description: 'Rôle des départements et des intercommunalités dans la coordination de l’action gérontologique.',
    yearFrom: 2016,
    yearTo: 2021,
    publicationCount: 6,
    keywords: [
      { label: 'Collectivités locales', vocabulary: 'rameau' },
      { label: 'Gérontologie', vocabulary: 'wikidata', detail: 'Q188826' },
      { label: 'Science politique', vocabulary: 'hal', detail: 'shs.scipo' },
    ],
  },
  {
    label: 'Accès aux soins dans les campagnes vieillissantes',
    description: 'Déserts médicaux, mobilité des patients âgés et organisation territoriale de l’offre de soins.',
    yearFrom: 2013,
    yearTo: 2018,
    publicationCount: 3,
    keywords: [
      { label: 'Désert médical', vocabulary: 'wikidata', detail: 'Q3023612' },
      { label: 'Health Services Accessibility', vocabulary: 'mesh', detail: 'D006297' },
      { label: 'Espace rural', vocabulary: 'rameau' },
    ],
  },
]

export function suggestionAlreadyPresent(s: HalThemeSuggestion, themes: ResearchTheme[]): boolean {
  return themes.some((t) => normalize(t.label) === normalize(s.label))
}
