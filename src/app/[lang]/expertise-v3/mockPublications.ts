import { CURRENT_YEAR, Keyword, ResearchTheme, StudiedPeriod } from './types'

// ─── Publications du chercheur (corpus simulé) ───────────────────────────────
// En production : les publications de la perspective connectée, telles que la
// liste « Publications » de SoVisu+ les affiche (HAL, Scopus, OpenAlex…). Ici,
// un corpus de 28 publications cohérent avec le profil de démonstration
// (géographie sociale, 2010 →). Chaque publication porte un « cluster » caché
// qui sert au générateur simulé à regrouper les publications en thèmes.

export type PublicationType = 'Article' | 'Chapitre' | 'Communication' | 'Ouvrage' | 'Thèse' | 'Rapport'

export type ClusterKey =
  | 'retraites' | 'vieillissementRural' | 'participatif' | 'habitatInclusif' | 'climat'
  | 'precariteEnergetique' | 'gouvernanceGeronto' | 'accesSoins'

export interface Publication {
  id: string
  title: string
  year: number
  type: PublicationType
  venue: string
  halId: string
  cluster: ClusterKey
  /** Époque sur laquelle porte la publication, quand le titre ou le résumé la donne. */
  studiedPeriod?: StudiedPeriod
}

export function halUrl(halId: string): string {
  return `https://hal.science/${halId}`
}

export const PUBLICATION_TYPES: PublicationType[] = ['Article', 'Chapitre', 'Communication', 'Ouvrage', 'Thèse', 'Rapport']

export const PUBLICATIONS: Publication[] = [
  // ── Mobilités résidentielles des retraités (thèse) ──
  { id: 'p01', year: 2010, type: 'Communication', cluster: 'retraites', halId: 'hal-00512043',
    title: 'Partir à la retraite sur la côte : premiers résultats d’enquête en Vendée',
    venue: 'Colloque « Vieillir et habiter », Nantes' },
  { id: 'p02', year: 2012, type: 'Article', cluster: 'retraites', halId: 'hal-00734118',
    title: 'Les migrations de retraite vers le littoral atlantique : un desserrement des grandes villes ?',
    venue: 'Norois, 223' },
  { id: 'p03', year: 2013, type: 'Chapitre', cluster: 'retraites', halId: 'hal-00891207',
    title: 'Choisir où vieillir : les retraités et le littoral charentais',
    venue: 'in Habiter les littoraux, PUR' },
  { id: 'p04', year: 2014, type: 'Thèse', cluster: 'retraites', halId: 'tel-01087342',
    title: 'Mobilités résidentielles des retraités vers le littoral atlantique (1975-2006)',
    venue: 'Thèse de doctorat, Université de Nantes',
    studiedPeriod: { label: 'Recensements 1975 – 2006', yearFrom: 1975, yearTo: 2006 } },
  { id: 'p05', year: 2015, type: 'Article', cluster: 'retraites', halId: 'hal-01201556',
    title: 'Héritages des Trente Glorieuses sur le littoral : du tourisme social aux résidences de retraite',
    venue: 'Annales de géographie, 704',
    studiedPeriod: { label: 'Trente Glorieuses', yearFrom: 1945, yearTo: 1975 } },

  // ── Vieillissement et territoires ruraux ──
  { id: 'p06', year: 2013, type: 'Article', cluster: 'vieillissementRural', halId: 'hal-00867211',
    title: 'Vieillir dans les campagnes bretonnes : services et solidarités',
    venue: 'Espace populations sociétés, 2013/1' },
  { id: 'p07', year: 2015, type: 'Communication', cluster: 'vieillissementRural', halId: 'hal-01223870',
    title: 'Quand la poste ferme : recompositions des services en Centre-Bretagne',
    venue: 'Congrès de l’UGI, Moscou' },
  { id: 'p08', year: 2017, type: 'Chapitre', cluster: 'vieillissementRural', halId: 'hal-01590433',
    title: 'Entraide de voisinage et vieillissement rural dans le Finistère',
    venue: 'in Solidarités de proximité, Érès' },
  { id: 'p09', year: 2019, type: 'Rapport', cluster: 'vieillissementRural', halId: 'hal-02314877',
    title: 'Vieillissement et territoires ruraux : synthèse pour le Conseil départemental des Côtes-d’Armor',
    venue: 'Rapport de recherche' },

  // ── Méthodes participatives ──
  { id: 'p10', year: 2016, type: 'Article', cluster: 'participatif', halId: 'hal-01389024',
    title: 'La cartographie sensible comme méthode d’enquête en géographie sociale',
    venue: 'Carnets de géographes, 9' },
  { id: 'p11', year: 2018, type: 'Communication', cluster: 'participatif', halId: 'hal-01877615',
    title: 'Ateliers d’habitants à Saint-Nazaire : produire des savoirs situés',
    venue: 'Journées de la recherche participative, Paris' },
  { id: 'p12', year: 2021, type: 'Article', cluster: 'participatif', halId: 'hal-03245190',
    title: 'Recherche-action et géographie sociale : retours sur six ans de terrain nantais',
    venue: 'Géocarrefour, 95/2' },
  { id: 'p13', year: 2024, type: 'Chapitre', cluster: 'participatif', halId: 'hal-04512889',
    title: 'Marches commentées et cartes sensibles : une boîte à outils participative',
    venue: 'in Méthodes de la géographie sociale, Armand Colin' },

  // ── Habitat inclusif ──
  { id: 'p14', year: 2018, type: 'Article', cluster: 'habitatInclusif', halId: 'hal-01932710',
    title: 'L’habitat inclusif, nouvelle frontière des politiques du vieillissement ?',
    venue: 'Gérontologie et société, 157' },
  { id: 'p15', year: 2020, type: 'Communication', cluster: 'habitatInclusif', halId: 'hal-02965402',
    title: 'Colocations seniors en Bretagne : acteurs, financements, usages',
    venue: 'Rencontres de l’habitat participatif, Rennes' },
  { id: 'p16', year: 2022, type: 'Article', cluster: 'habitatInclusif', halId: 'hal-03788341',
    title: 'Habitat intergénérationnel et action publique locale à Rennes',
    venue: 'Métropoles, 30' },
  { id: 'p17', year: 2025, type: 'Article', cluster: 'habitatInclusif', halId: 'hal-04901277',
    title: 'Ce que l’habitat partagé change au quotidien des habitants âgés',
    venue: 'Retraite et société, 93' },

  // ── Précarité énergétique (thème non encore décrit) ──
  { id: 'p18', year: 2020, type: 'Communication', cluster: 'precariteEnergetique', halId: 'hal-03012655',
    title: 'Factures d’énergie et retraités modestes : premiers résultats d’enquête',
    venue: 'Colloque « Vulnérabilités énergétiques », Grenoble' },
  { id: 'p19', year: 2022, type: 'Article', cluster: 'precariteEnergetique', halId: 'hal-03690128',
    title: 'Précarité énergétique des ménages âgés dans le parc social breton',
    venue: 'Flux, 128' },
  { id: 'p20', year: 2023, type: 'Rapport', cluster: 'precariteEnergetique', halId: 'hal-04135520',
    title: 'Adapter le logement des seniors face au coût de l’énergie',
    venue: 'Rapport pour l’ADEME' },
  { id: 'p21', year: 2025, type: 'Article', cluster: 'precariteEnergetique', halId: 'hal-04877013',
    title: 'Stratégies d’adaptation des ménages âgés à la hausse des prix de l’énergie',
    venue: 'Espaces et sociétés, 191' },

  // ── Gouvernance gérontologique (thème non encore décrit) ──
  { id: 'p22', year: 2016, type: 'Article', cluster: 'gouvernanceGeronto', halId: 'hal-01402238',
    title: 'Les départements face à la coordination gérontologique',
    venue: 'Revue française des affaires sociales, 2016/4' },
  { id: 'p23', year: 2018, type: 'Chapitre', cluster: 'gouvernanceGeronto', halId: 'hal-01911556',
    title: 'Intercommunalités et action gérontologique : un échelon émergent ?',
    venue: 'in Gouverner le vieillissement, Presses de Sciences Po' },
  { id: 'p24', year: 2021, type: 'Article', cluster: 'gouvernanceGeronto', halId: 'hal-03311870',
    title: 'Gouverner le vieillissement à l’échelle locale : départements, intercommunalités, communes',
    venue: 'Pôle Sud, 54' },

  // ── Accès aux soins (thème non encore décrit) ──
  { id: 'p25', year: 2013, type: 'Communication', cluster: 'accesSoins', halId: 'hal-00901734',
    title: 'Déserts médicaux et mobilité des patients âgés en Bretagne intérieure',
    venue: 'Colloque de géographie de la santé, Montpellier' },
  { id: 'p26', year: 2016, type: 'Article', cluster: 'accesSoins', halId: 'hal-01377093',
    title: 'L’accès aux soins dans les campagnes vieillissantes',
    venue: 'Revue d’économie régionale et urbaine, 2016/3' },
  { id: 'p27', year: 2018, type: 'Article', cluster: 'accesSoins', halId: 'hal-01865530',
    title: 'Organisation territoriale de l’offre de soins et vieillissement rural',
    venue: 'Santé publique, 30/5' },

  // ── Adaptation des logements au changement climatique (brouillon) ──
  { id: 'p28', year: 2023, type: 'Communication', cluster: 'climat', halId: 'hal-04210348',
    title: 'Confort thermique des logements de seniors : une enquête exploratoire',
    venue: 'Rencontres Climat & Habitat, Lyon' },
]

export function publicationById(id: string): Publication | undefined {
  return PUBLICATIONS.find((p) => p.id === id)
}

/** Pour chaque publication déjà rattachée à un thème : l'identifiant du thème. */
export function coverageMap(themes: ResearchTheme[], exceptThemeId?: string): Record<string, string> {
  const map: Record<string, string> = {}
  for (const t of themes) {
    if (t.id === exceptThemeId) continue
    for (const id of t.publicationIds ?? []) map[id] = t.id
  }
  return map
}

/** Période de travail déduite des dates : du premier au dernier article, « en cours » si récent. */
export function periodFromPublications(pubs: Publication[]): { yearFrom: number | null; yearTo: number | null } {
  if (pubs.length === 0) return { yearFrom: null, yearTo: null }
  const years = pubs.map((p) => p.year)
  const max = Math.max(...years)
  return { yearFrom: Math.min(...years), yearTo: max >= CURRENT_YEAR - 2 ? null : max }
}

export function studiedPeriodsFromPublications(pubs: Publication[]): StudiedPeriod[] {
  const out: StudiedPeriod[] = []
  for (const p of pubs) {
    const sp = p.studiedPeriod
    if (sp && !out.some((s) => s.label === sp.label)) out.push(sp)
  }
  return out
}

// ─── Générateur simulé : regroupe les publications en thèmes proposés ────────

interface ClusterTemplate {
  label: string
  description: string
  keywords: Keyword[]
}

const CLUSTER_TEMPLATES: Record<ClusterKey, ClusterTemplate> = {
  retraites: {
    label: 'Mobilités résidentielles des retraités',
    description: 'Migrations de retraite vers le littoral atlantique et choix résidentiels au moment de la cessation d’activité.',
    keywords: [
      { label: 'Retraités', vocabulary: 'rameau' },
      { label: 'Littoraux', vocabulary: 'rameau' },
      { label: 'Retirement migration', vocabulary: 'wikidata' },
    ],
  },
  vieillissementRural: {
    label: 'Vieillissement et territoires ruraux',
    description: 'Recompositions des services et des solidarités locales dans les campagnes vieillissantes.',
    keywords: [
      { label: 'Vieillissement', vocabulary: 'rameau' },
      { label: 'Espace rural', vocabulary: 'rameau' },
    ],
  },
  participatif: {
    label: 'Méthodes participatives en géographie sociale',
    description: 'Recherche-action, cartographie sensible et ateliers avec les habitants comme outils de production de savoirs.',
    keywords: [
      { label: 'Recherche participative', vocabulary: 'rameau' },
      { label: 'Cartographie', vocabulary: 'rameau' },
    ],
  },
  habitatInclusif: {
    label: 'Habitat inclusif et politiques publiques',
    description: 'Formes d’habitat partagé destinées aux personnes âgées et manière dont les collectivités s’en saisissent.',
    keywords: [
      { label: 'Habitat inclusif', vocabulary: 'rameau', detail: 'Logement' },
      { label: 'Personnes âgées', vocabulary: 'rameau' },
    ],
  },
  climat: {
    label: 'Adaptation des logements au changement climatique',
    description: 'Confort thermique et adaptation des logements des personnes âgées aux épisodes de chaleur.',
    keywords: [{ label: 'Confort thermique', vocabulary: 'rameau' }],
  },
  precariteEnergetique: {
    label: 'Précarité énergétique des ménages âgés',
    description: 'Exposition des retraités modestes aux coûts de l’énergie et stratégies d’adaptation dans le logement.',
    keywords: [
      { label: 'Précarité énergétique', vocabulary: 'rameau' },
      { label: 'Personnes âgées', vocabulary: 'rameau' },
      { label: 'Transition énergétique', vocabulary: 'wikidata', detail: 'Q1785580' },
    ],
  },
  gouvernanceGeronto: {
    label: 'Gouvernance locale des politiques gérontologiques',
    description: 'Rôle des départements et des intercommunalités dans la coordination de l’action gérontologique.',
    keywords: [
      { label: 'Collectivités locales', vocabulary: 'rameau' },
      { label: 'Gérontologie', vocabulary: 'wikidata', detail: 'Q188826' },
      { label: 'Science politique', vocabulary: 'hal', detail: 'shs.scipo' },
    ],
  },
  accesSoins: {
    label: 'Accès aux soins dans les campagnes vieillissantes',
    description: 'Déserts médicaux, mobilité des patients âgés et organisation territoriale de l’offre de soins.',
    keywords: [
      { label: 'Désert médical', vocabulary: 'wikidata', detail: 'Q3023612' },
      { label: 'Health Services Accessibility', vocabulary: 'mesh', detail: 'D006297' },
      { label: 'Espace rural', vocabulary: 'rameau' },
    ],
  },
}

export interface ThemeProposal {
  id: string
  cluster: ClusterKey
  label: string
  description: string
  keywords: Keyword[]
  publicationIds: string[]
  yearFrom: number | null
  yearTo: number | null
  studiedPeriods: StudiedPeriod[]
  /** Thème déjà décrit qui couvre le même sujet : rattacher plutôt que dupliquer. */
  existingThemeId?: string
}

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

/** Thème existant portant sur le même sujet : même intitulé, ou publications déjà rattachées du même cluster. */
function findExistingTheme(cluster: ClusterKey, themes: ResearchTheme[]): ResearchTheme | undefined {
  const clusterIds = new Set(PUBLICATIONS.filter((p) => p.cluster === cluster).map((p) => p.id))
  const label = normalize(CLUSTER_TEMPLATES[cluster].label)
  return themes.find((t) => normalize(t.label) === label || (t.publicationIds ?? []).some((id) => clusterIds.has(id)))
}

/** Regroupe les publications sélectionnées en propositions de thèmes (synchrone, déterministe). */
export function buildProposals(selectedIds: string[], themes: ResearchTheme[]): ThemeProposal[] {
  const selected = PUBLICATIONS.filter((p) => selectedIds.includes(p.id))
  const byCluster = new Map<ClusterKey, Publication[]>()
  for (const p of selected) byCluster.set(p.cluster, [...(byCluster.get(p.cluster) ?? []), p])

  const proposals: ThemeProposal[] = []
  for (const [cluster, pubs] of byCluster) {
    const tpl = CLUSTER_TEMPLATES[cluster]
    const existing = findExistingTheme(cluster, themes)
    proposals.push({
      id: `prop-${cluster}`,
      cluster,
      label: tpl.label,
      description: tpl.description,
      keywords: tpl.keywords,
      publicationIds: pubs.map((p) => p.id).sort(),
      ...periodFromPublications(pubs),
      studiedPeriods: studiedPeriodsFromPublications(pubs),
      existingThemeId: existing?.id,
    })
  }
  // Nouveaux thèmes d'abord, rattachements ensuite ; à égalité, les plus fournis en tête.
  return proposals.sort((a, b) => {
    if (Boolean(a.existingThemeId) !== Boolean(b.existingThemeId)) return a.existingThemeId ? 1 : -1
    return b.publicationIds.length - a.publicationIds.length
  })
}

/** Version « IA » : même résultat, avec le délai d'un appel à un modèle. */
export function proposeThemes(selectedIds: string[], themes: ResearchTheme[]): Promise<ThemeProposal[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(buildProposals(selectedIds, themes)), 1400)
  })
}
