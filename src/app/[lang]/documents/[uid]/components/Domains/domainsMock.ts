// Données de démonstration de l'onglet Domaines.
// Identifiants et libellés anglais : vrais éléments de la classification OpenAlex (feuille liée à
// l'issue SoVisuPlus #373), en échantillon. Traductions françaises et scores : proposés pour la maquette.

export interface TaxonomyTopic {
  id: string
  label: string
}
interface TaxonomySubfield {
  id: string
  label: string
  en: string
  topics: TaxonomyTopic[]
}
interface TaxonomyField {
  id: string
  label: string
  en: string
  subfields: TaxonomySubfield[]
}
interface TaxonomyDomain {
  id: string
  label: string
  en: string
  fields: TaxonomyField[]
}

const topics = (entries: [string, string][]): TaxonomyTopic[] =>
  entries.map(([id, label]) => ({ id, label }))

export const TAXONOMY: TaxonomyDomain[] = [
  {
    id: 'domain-3',
    label: 'Sciences physiques',
    en: 'Physical Sciences',
    fields: [
      {
        id: 'field-17',
        label: 'Informatique',
        en: 'Computer Science',
        subfields: [
          {
            id: 'subfield-1702',
            label: 'Intelligence artificielle',
            en: 'Artificial Intelligence',
            topics: topics([
              ['T10320', 'Neural Networks and Applications'],
              ['T10181', 'Natural Language Processing Techniques'],
              ['T10028', 'Topic Modeling'],
              ['T10215', 'Semantic Web and Ontologies'],
            ]),
          },
          {
            id: 'subfield-1707',
            label: 'Vision par ordinateur et reconnaissance de formes',
            en: 'Computer Vision and Pattern Recognition',
            topics: topics([
              ['T10036', 'Advanced Neural Network Applications'],
              ['T10586', 'Robotic Path Planning Algorithms'],
            ]),
          },
          {
            id: 'subfield-1710',
            label: `Systèmes d'information`,
            en: 'Information Systems',
            topics: topics([
              ['T10203', 'Recommender Systems and Techniques'],
              ['T10286', 'Information Retrieval and Search Behavior'],
              ['T10538', 'Data Mining Algorithms and Applications'],
            ]),
          },
        ],
      },
      {
        id: 'field-19',
        label: 'Sciences de la Terre et des planètes',
        en: 'Earth and Planetary Sciences',
        subfields: [
          {
            id: 'subfield-1902',
            label: `Sciences de l'atmosphère`,
            en: 'Atmospheric Science',
            topics: topics([
              ['T10466', 'Meteorological Phenomena and Simulations'],
              ['T10075', 'Atmospheric chemistry and aerosols'],
              ['T11234', 'Precipitation Measurement and Analysis'],
            ]),
          },
        ],
      },
      {
        id: 'field-23',
        label: `Sciences de l'environnement`,
        en: 'Environmental Science',
        subfields: [
          {
            id: 'subfield-2306',
            label: 'Changement global et planétaire',
            en: 'Global and Planetary Change',
            topics: topics([
              ['T10029', 'Climate variability and models'],
              ['T10226', 'Land Use and Ecosystem Services'],
              ['T10347', 'Atmospheric aerosols and clouds'],
              ['T10319', 'Conservation, Biodiversity, and Resource Management'],
            ]),
          },
          {
            id: 'subfield-2303',
            label: 'Écologie',
            en: 'Ecology',
            topics: topics([
              ['T10111', 'Remote Sensing in Agriculture'],
              ['T10779', 'Coastal wetland ecosystem dynamics'],
            ]),
          },
        ],
      },
      {
        id: 'field-22',
        label: 'Ingénierie',
        en: 'Engineering',
        subfields: [
          {
            id: 'subfield-2206',
            label: 'Mécanique numérique',
            en: 'Computational Mechanics',
            topics: topics([
              ['T10360', 'Fluid Dynamics and Turbulent Flows'],
              ['T10173', 'Computational Fluid Dynamics and Aerodynamics'],
              ['T10339', 'Advanced Numerical Methods in Computational Mathematics'],
            ]),
          },
          {
            id: 'subfield-2212',
            label: 'Ingénierie océanique',
            en: 'Ocean Engineering',
            topics: topics([
              ['T11250', 'Wave and Wind Energy Systems'],
              ['T11604', 'Ship Hydrodynamics and Maneuverability'],
            ]),
          },
        ],
      },
      {
        id: 'field-31',
        label: 'Physique et astronomie',
        en: 'Physics and Astronomy',
        subfields: [
          {
            id: 'subfield-3107',
            label: 'Physique atomique et moléculaire, optique',
            en: 'Atomic and Molecular Physics, and Optics',
            topics: topics([
              ['T10622', 'Quantum Mechanics and Applications'],
              ['T10523', 'Atomic and Molecular Physics'],
              ['T10425', 'Cold Atom Physics and Bose-Einstein Condensates'],
            ]),
          },
          {
            id: 'subfield-3109',
            label: 'Physique statistique et non linéaire',
            en: 'Statistical and Nonlinear Physics',
            topics: topics([
              ['T11261', 'Quantum chaos and dynamical systems'],
              ['T11520', 'Advanced Thermodynamics and Statistical Mechanics'],
            ]),
          },
        ],
      },
    ],
  },
  {
    id: 'domain-1',
    label: 'Sciences de la vie',
    en: 'Life Sciences',
    fields: [
      {
        id: 'field-11',
        label: 'Agronomie et sciences biologiques',
        en: 'Agricultural and Biological Sciences',
        subfields: [
          {
            id: 'subfield-1111',
            label: 'Science du sol',
            en: 'Soil Science',
            topics: topics([
              ['T10004', 'Soil Carbon and Nitrogen Dynamics'],
              ['T12792', 'Soil Management and Crop Yield'],
              ['T12294', 'Agricultural Science and Fertilization'],
              ['T10889', 'Soil erosion and sediment transport'],
            ]),
          },
        ],
      },
    ],
  },
  {
    id: 'domain-2',
    label: 'Sciences sociales',
    en: 'Social Sciences',
    fields: [
      {
        id: 'field-33',
        label: 'Sciences sociales',
        en: 'Social Sciences',
        subfields: [
          {
            id: 'subfield-3304',
            label: 'Éducation',
            en: 'Education',
            topics: topics([
              ['T10267', 'Higher Education Research Studies'],
              ['T10162', 'Online and Blended Learning'],
            ]),
          },
          {
            id: 'subfield-3312',
            label: 'Sociologie et science politique',
            en: 'Sociology and Political Science',
            topics: topics([
              ['T10216', 'Migration, Refugees, and Integration'],
              ['T10349', 'Migration and Labor Dynamics'],
              ['T10070', 'Political Conflict and Governance'],
            ]),
          },
          {
            id: 'subfield-3314',
            label: 'Anthropologie',
            en: 'Anthropology',
            topics: topics([
              ['T12144', 'Colonialism, slavery, and trade'],
              ['T10149', 'Anthropological Studies and Insights'],
            ]),
          },
        ],
      },
    ],
  },
  {
    id: 'domain-4',
    label: 'Sciences de la santé',
    en: 'Health Sciences',
    fields: [
      {
        id: 'field-27',
        label: 'Médecine',
        en: 'Medicine',
        subfields: [
          {
            id: 'subfield-2738',
            label: 'Psychiatrie et santé mentale',
            en: 'Psychiatry and Mental Health',
            topics: topics([['T10009', 'Dementia and Cognitive Impairment Research']]),
          },
        ],
      },
    ],
  },
]

export const TAXONOMY_TOTAL_TOPICS = 4515

export interface TopicEntry extends TaxonomyTopic {
  domain: string
  field: string
  subfield: string
  subfieldId: string
  /** Texte de recherche : le sujet et ses niveaux, en français et en anglais. */
  searchText: string
}

export const ALL_TOPICS: TopicEntry[] = TAXONOMY.flatMap((domain) =>
  domain.fields.flatMap((field) =>
    field.subfields.flatMap((subfield) =>
      subfield.topics.map((topic) => ({
        ...topic,
        domain: domain.label,
        field: field.label,
        subfield: subfield.label,
        subfieldId: subfield.id,
        searchText: [
          topic.label,
          domain.label,
          domain.en,
          field.label,
          field.en,
          subfield.label,
          subfield.en,
        ]
          .join(' ')
          .toLowerCase(),
      })),
    ),
  ),
)

export const getTopic = (id: string) => ALL_TOPICS.find((topic) => topic.id === id)

export const topicPath = (topic: Pick<TopicEntry, 'domain' | 'field' | 'subfield'>) =>
  `${topic.domain} › ${topic.field} › ${topic.subfield}`

// ─── Scénarios par document ───────────────────────────────────────────────────

export interface ScoredTopic {
  topicId: string
  score: number
  titleOnly?: boolean
}

export interface ManualTopic {
  topicId: string
  origin: 'typed' | 'validated'
  score?: number
}

interface DomainsScenario {
  openalex: ScoredTopic[]
  /** Domaines moissonnés depuis HAL. */
  halHarvested: { code: string; primary: boolean }[]
  /** Ce que renverrait une génération. */
  generated: ScoredTopic[]
  initialProposals: ScoredTopic[]
  initialManual: ManualTopic[]
  initialAttributedHal: string[]
}

const scored = (entries: [string, number][]): ScoredTopic[] =>
  entries.map(([topicId, score]) => ({ topicId, score }))

const SCENARIOS: Record<string, DomainsScenario> = {
  // Tout l'écran d'un coup : OpenAlex replié, proposition, saisie, HAL moissonné et attribué.
  'doc-1': {
    openalex: scored([
      ['T10320', 0.98],
      ['T10029', 0.96],
      ['T10036', 0.91],
      ['T10466', 0.87],
      ['T10347', 0.74],
      ['T10075', 0.62],
      ['T11234', 0.55],
    ]),
    halHarvested: [
      { code: 'info.info-lg', primary: true },
      { code: 'sdu.ocean', primary: false },
    ],
    generated: scored([
      ['T10226', 0.61],
      ['T10538', 0.57],
    ]),
    initialProposals: scored([['T10226', 0.61]]),
    initialManual: [{ topicId: 'T10339', origin: 'typed' }],
    initialAttributedHal: ['sde.mcg'],
  },
  // Sans notice OpenAlex ni HAL, avec résumé : état vide, puis génération et dépôt pré-rempli.
  'doc-2': {
    openalex: [],
    halHarvested: [],
    generated: scored([
      ['T10622', 0.78],
      ['T10523', 0.66],
      ['T11261', 0.57],
    ]),
    initialProposals: [],
    initialManual: [],
    initialAttributedHal: [],
  },
  'doc-3': {
    openalex: scored([
      ['T10360', 0.97],
      ['T10173', 0.88],
      ['T11250', 0.59],
    ]),
    halHarvested: [],
    generated: scored([['T10779', 0.56]]),
    initialProposals: [],
    initialManual: [],
    initialAttributedHal: [],
  },
  // Sans résumé : génération d'après le titre seul, moins fiable.
  'doc-4': {
    openalex: [],
    halHarvested: [],
    generated: scored([
      ['T10216', 0.58],
      ['T12144', 0.54],
    ]),
    initialProposals: [],
    initialManual: [],
    initialAttributedHal: [],
  },
  'doc-5': {
    openalex: [],
    halHarvested: [],
    generated: scored([
      ['T10203', 0.81],
      ['T10267', 0.76],
    ]),
    initialProposals: [],
    initialManual: [],
    initialAttributedHal: [],
  },
  'doc-6': {
    openalex: scored([
      ['T10004', 0.95],
      ['T12792', 0.82],
    ]),
    halHarvested: [
      { code: 'sdv.sa.sds', primary: true },
      { code: 'sdv.ee', primary: false },
    ],
    generated: scored([['T10319', 0.63]]),
    initialProposals: [],
    initialManual: [],
    initialAttributedHal: [],
  },
}

const EMPTY_SCENARIO: DomainsScenario = {
  openalex: [],
  halHarvested: [],
  generated: [],
  initialProposals: [],
  initialManual: [],
  initialAttributedHal: [],
}

export const getDomainsScenario = (uid: string): DomainsScenario =>
  SCENARIOS[uid] ?? EMPTY_SCENARIO

// ─── État conservé ────────────────────────────────────────────────────────────

export interface DomainsState {
  proposals: ScoredTopic[]
  manual: ManualTopic[]
  rejected: ScoredTopic[]
  attributedHal: string[]
}

const storageKey = (uid: string) => `document-domains-v1-${uid}`

export const initialDomainsState = (uid: string): DomainsState => {
  const scenario = getDomainsScenario(uid)
  return {
    proposals: scenario.initialProposals,
    manual: scenario.initialManual,
    rejected: [],
    attributedHal: scenario.initialAttributedHal,
  }
}

export const loadDomainsState = (uid: string): DomainsState => {
  const fallback = initialDomainsState(uid)
  try {
    const saved = localStorage.getItem(storageKey(uid))
    return saved ? { ...fallback, ...(JSON.parse(saved) as Partial<DomainsState>) } : fallback
  } catch {
    return fallback
  }
}

export const saveDomainsState = (uid: string, state: DomainsState) => {
  try {
    localStorage.setItem(storageKey(uid), JSON.stringify(state))
  } catch {
    // Maquette : sans stockage, l'état reste valable jusqu'au rechargement.
  }
}

export const clearDomainsState = (uid: string) => {
  try {
    localStorage.removeItem(storageKey(uid))
  } catch {
    // Rien à effacer si le stockage est indisponible.
  }
}

/** Domaines qui pré-remplissent le formulaire de dépôt HAL : moissonnés, puis attribués. */
export const getDepositDomains = (uid: string): string[] => {
  const harvested = getDomainsScenario(uid).halHarvested.map((domain) => domain.code)
  return [...new Set([...harvested, ...loadDomainsState(uid).attributedHal])]
}
