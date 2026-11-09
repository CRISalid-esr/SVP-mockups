import { publicPath } from '@/utils/publicPath'

/**
 * Maquette : vocabulaires contrôlés proposés pour les mots-clés et échantillon de leurs concepts.
 * En production, la recherche passe par le service d'autocomplétion CRISalid (/api/vocabs).
 */
export interface MockVocabulary {
  code: string
  short: string
  name: string
  org: string
  url: string
  icon?: string
  /** Couleur de la pastille quand le vocabulaire n'a pas de logo. */
  color: string
}

export interface MockVocabConcept {
  id: string
  vocab: string
  label: string
  /** Code ou chemin dans le vocabulaire (ex. JEL C45). */
  notation?: string
  altLabels?: string[]
}

export const MOCK_VOCABULARIES: MockVocabulary[] = [
  {
    code: 'jel',
    short: 'JEL',
    name: 'Journal of Economic Literature',
    org: 'American Economic Association',
    url: 'https://www.aeaweb.org/jel/guide/jel.php',
    icon: publicPath('/icons/jel-vocab.png'),
    color: '#9B2C2C',
  },
  {
    code: 'aat',
    short: 'AAT',
    name: 'Art & Architecture Thesaurus',
    org: 'Getty Research Institute',
    url: 'https://www.getty.edu/research/tools/vocabularies/aat/',
    icon: publicPath('/icons/aat-vocab.gif'),
    color: '#222222',
  },
  {
    code: 'acm',
    short: 'ACM CCS',
    name: 'Computing Classification System',
    org: 'Association for Computing Machinery',
    url: 'https://dl.acm.org/ccs',
    icon: publicPath('/icons/acm-vocab.svg'),
    color: '#1F6FB2',
  },
  {
    code: 'elsst',
    short: 'ELSST',
    name: 'European Language Social Science Thesaurus',
    org: 'CESSDA ERIC',
    url: 'https://elsst.cessda.eu/',
    color: '#1C64B5',
  },
  {
    code: 'pactols',
    short: 'Pactols',
    name: 'Pactols',
    org: 'Frantiq',
    url: 'https://pactols.frantiq.fr/',
    color: '#8A5A2B',
  },
  {
    code: 'euroscivoc',
    short: 'EuroSciVoc',
    name: 'European Science Vocabulary',
    org: 'Office des publications de l’Union européenne',
    url: 'https://op.europa.eu/en/web/eu-vocabularies/euroscivoc',
    color: '#2F4FA2',
  },
]

const concepts = (vocab: string, entries: [string, string?, string[]?][]): MockVocabConcept[] =>
  entries.map(([label, notation, altLabels], index) => ({
    id: `${vocab}-${index}`,
    vocab,
    label,
    notation,
    altLabels,
  }))

export const MOCK_VOCAB_CONCEPTS: MockVocabConcept[] = [
  ...concepts('jel', [
    ['Économie de l’environnement', 'Q5', ['environmental economics']],
    ['Changement climatique : modélisation', 'Q54', ['climate', 'climat']],
    ['Réseaux de neurones et méthodes connexes', 'C45', ['neural networks', 'apprentissage']],
    ['Méthodes économétriques : séries temporelles', 'C22', ['time series']],
    ['Économie agricole', 'Q1', ['agriculture']],
    ['Économie de l’énergie', 'Q4', ['énergie', 'energy']],
    ['Innovation et recherche-développement', 'O31', ['innovation']],
    ['Économie urbaine', 'R', ['ville', 'urban']],
  ]),
  ...concepts('aat', [
    ['architecture vernaculaire', 'aat:300008779'],
    ['paysage', 'aat:300008626', ['landscape']],
    ['patrimoine bâti', 'aat:300377757', ['heritage']],
    ['robotique', 'aat:300379573', ['robot']],
    ['cartographie', 'aat:300054229', ['maps', 'carte']],
    ['urbanisme', 'aat:300008603', ['urban planning', 'ville']],
  ]),
  ...concepts('acm', [
    ['Apprentissage automatique', 'Computing methodologies → Machine learning', ['machine learning']],
    ['Réseaux de neurones', 'Computing methodologies → Machine learning approaches', ['neural networks', 'deep learning', 'apprentissage profond']],
    ['Modélisation et simulation', 'Computing methodologies → Modeling and simulation', ['simulation', 'climat']],
    ['Robotique', 'Computer systems organization → Robotics', ['robot']],
    ['Théorie du contrôle', 'Theory of computation → Control theory', ['control theory', 'contrôle']],
    ['Vision par ordinateur', 'Computing methodologies → Computer vision', ['computer vision', 'image']],
    ['Fouille de données', 'Information systems → Data mining', ['data mining', 'données']],
  ]),
  ...concepts('elsst', [
    ['CHANGEMENT CLIMATIQUE', undefined, ['climate change', 'climat']],
    ['POLITIQUE ENVIRONNEMENTALE', undefined, ['environnement']],
    ['MIGRATION', undefined, ['migrations']],
    ['INÉGALITÉS SOCIALES', undefined, ['inequality']],
    ['AGRICULTURE', undefined, ['agricole']],
    ['VILLE', undefined, ['urbain', 'urban']],
    ['ÉNERGIE', undefined, ['energy']],
  ]),
  ...concepts('pactols', [
    ['Âge du Bronze', 'Chronologie'],
    ['Archéologie du paysage', 'Sujets', ['paysage']],
    ['Céramique', 'Sujets'],
    ['Gaule romaine', 'Lieux', ['romain']],
    ['Habitat rural', 'Sujets', ['agricole', 'rural']],
    ['Littoral', 'Lieux', ['côte', 'mer']],
  ]),
  ...concepts('euroscivoc', [
    ['apprentissage profond', 'sciences naturelles › informatique › intelligence artificielle', ['deep learning', 'réseaux de neurones']],
    ['climatologie', 'sciences naturelles › sciences de la terre › climatologie', ['climat', 'climate']],
    ['écologie des sols', 'sciences naturelles › sciences biologiques › écologie', ['sol', 'soil', 'biodiversité']],
    ['robotique', 'ingénierie et technologie › génie électrique › robotique', ['robot']],
    ['agriculture durable', 'sciences agricoles › agriculture', ['agricole']],
    ['énergies renouvelables', 'ingénierie et technologie › énergie', ['energy', 'énergie']],
    ['biodiversité', 'sciences naturelles › sciences biologiques', ['biodiversity']],
  ]),
]

export const vocabularyOf = (code: string) => MOCK_VOCABULARIES.find((vocab) => vocab.code === code)

const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

/** Concepts des vocabulaires choisis (tous si aucun) dont l'intitulé ou un synonyme contient la saisie. */
export const searchMockConcepts = (query: string, vocabs: string[]): MockVocabConcept[] => {
  const q = fold(query.trim())
  if (q.length < 2) return []
  return MOCK_VOCAB_CONCEPTS.filter(
    (concept) =>
      (vocabs.length === 0 || vocabs.includes(concept.vocab)) &&
      [concept.label, ...(concept.altLabels ?? [])].some((label) => fold(label).includes(q)),
  )
}

// ─── Mots-clés ajoutés ou retirés dans la maquette ───────────────────────────

export interface AddedKeyword {
  id: string
  label: string
  /** Code du vocabulaire, ou null pour un mot-clé libre. */
  vocab: string | null
  notation?: string
}

export interface KeywordEdits {
  added: AddedKeyword[]
  /** Mots-clés de la notice retirés (identifiants des groupes). */
  removed: string[]
}

const storageKey = (uid: string) => `document-keywords-v1-${uid}`

export const loadKeywordEdits = (uid: string): KeywordEdits => {
  try {
    const saved = localStorage.getItem(storageKey(uid))
    return saved ? { added: [], removed: [], ...(JSON.parse(saved) as Partial<KeywordEdits>) } : { added: [], removed: [] }
  } catch {
    return { added: [], removed: [] }
  }
}

export const saveKeywordEdits = (uid: string, edits: KeywordEdits) => {
  try {
    localStorage.setItem(storageKey(uid), JSON.stringify(edits))
  } catch {
    // Maquette : sans stockage, les ajouts durent jusqu'au rechargement.
  }
}
