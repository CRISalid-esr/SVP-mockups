import {
  Apartment, CampaignOutlined, Groups2Outlined, LightbulbOutlined, Lock, NewspaperOutlined, Public,
  ScienceOutlined,
} from '@mui/icons-material'

// ─── Modèle « Profil de recherche 2 » ────────────────────────────────────────
// Un seul objet : le thème de recherche, daté, qualifié par mots-clés et par
// des repères structurés (lieux, personnes, organisations), avec sa propre
// diffusion et ses propres préférences de sollicitation. Plus de séparation
// Thèmes / Expertises : la « fiche expertise » est la projection publique d'un
// thème public (voir PublicPreview), déclinée automatiquement par public.

export type Visibility = 'private' | 'institution' | 'public'
export type ThemeStatus = 'draft' | 'validated'
export type Vocabulary = 'rameau' | 'mesh' | 'wikidata' | 'hal' | 'libre'
export type RelationDirection = 'forward' | 'backward' | 'bidirectional'

export interface Keyword {
  label: string
  vocabulary: Vocabulary
  /** Précision affichée sous le libellé (ex : « Logement », « shs.geo »). */
  detail?: string
  uri?: string
}

// ─── Repères structurés (hérités de la v1, proposés en option normale) ───────

/** Lieu ou terrain, aligné sur GeoNames quand c'est possible. */
export interface PlaceRef {
  label: string
  geonamesId?: number
  /** Nature du lieu (région, département, ville, littoral…). */
  detail?: string
}

/** Personne étudiée ou mobilisée, alignée sur IdRef (PPN). */
export interface PersonRef {
  label: string
  ppn?: string
  dates?: string
}

/** Organisation étudiée ou partenaire, alignée sur IdRef (PPN). */
export interface OrgRef {
  label: string
  ppn?: string
  detail?: string
}

/**
 * Période étudiée : l'époque sur laquelle porte le thème (le Néolithique, la
 * Révolution française, les Trente Glorieuses…). À ne pas confondre avec la
 * période de travail (yearFrom / yearTo), qui date le parcours du chercheur.
 * Années négatives = avant J.-C. Bornes absentes = période nommée sans dates.
 */
export interface StudiedPeriod {
  label: string
  yearFrom?: number
  yearTo?: number
}

// ─── Déclinaison par public ──────────────────────────────────────────────────

export type Audience = 'researchers' | 'industry' | 'media' | 'public'
export const AUDIENCES: Audience[] = ['researchers', 'industry', 'media', 'public']

/** Reformulation de la description pour chaque public. Absente = description générale. */
export type AudienceVariants = Partial<Record<Audience, string>>

export const AUDIENCE_CONFIG: Record<Audience, {
  label: string
  /** Libellé court pour les onglets et chips. */
  short: string
  /** Question à laquelle répond la déclinaison. */
  question: string
  color: string
  bg: string
  Icon: React.ElementType
}> = {
  researchers: {
    label: 'Chercheurs',
    short: 'Chercheurs',
    question: 'Quelle approche, quels objets, quelles méthodes ?',
    color: '#92400E',
    bg: '#FEF3C7',
    Icon: ScienceOutlined,
  },
  industry: {
    label: 'Entreprises et collectivités',
    short: 'Partenaires',
    question: 'À quels besoins concrets cette expertise peut-elle répondre ?',
    color: '#5B21B6',
    bg: '#EDE9FE',
    Icon: LightbulbOutlined,
  },
  media: {
    label: 'Journalistes',
    short: 'Presse',
    question: 'Sur quoi puis-je répondre, en une phrase ?',
    color: '#065F46',
    bg: '#D1FAE5',
    Icon: NewspaperOutlined,
  },
  public: {
    label: 'Grand public',
    short: 'Grand public',
    question: 'Pourquoi est-ce important, sans jargon ?',
    color: '#1E40AF',
    bg: '#DBEAFE',
    Icon: Groups2Outlined,
  },
}

export interface ResearchTheme {
  id: string
  label: string
  description: string
  /** Année où le chercheur a commencé à travailler sur ce thème (période de travail). */
  yearFrom: number | null
  /** Année de fin du travail ; null = thème toujours en cours. */
  yearTo: number | null
  /** Époques étudiées, indépendantes de la période de travail. */
  studiedPeriods: StudiedPeriod[]
  /** Publications à l'appui du thème (thèmes proposés d'après les publications). */
  publicationIds?: string[]
  keywords: Keyword[]
  places: PlaceRef[]
  persons: PersonRef[]
  organizations: OrgRef[]
  /** Reformulations par public, générées depuis la description puis éventuellement retouchées. */
  variants: AudienceVariants
  /** Date ISO de la dernière génération des déclinaisons. */
  variantsGeneratedAt?: string
  visibility: Visibility
  acceptsPress: boolean
  acceptsEvents: boolean
  status: ThemeStatus
  /** Date ISO de la dernière validation. */
  lastValidated?: string
}

export interface ThemeRelation {
  id: string
  source: string
  target: string
  direction: RelationDirection
  label: string
}

export interface ResearchProfile {
  themes: ResearchTheme[]
  relations: ThemeRelation[]
  /** Positions manuelles des nœuds (mode « Libre » du graphe). */
  positions?: Record<string, { x: number; y: number }>
  lastUpdated: string
}

export const TEAL = '#006A61'
export const TEAL_DARK = '#004d46'
export const CURRENT_YEAR = new Date().getFullYear()
export const DESCRIPTION_MAX = 1200

export const VISIBILITY_CONFIG: Record<Visibility, {
  label: string
  short: string
  description: string
  color: string
  bg: string
  Icon: React.ElementType
}> = {
  private: {
    label: 'Privé',
    short: 'Privé',
    description: 'Visible par vous seul·e. Non transmis au graphe de connaissance.',
    color: '#616161',
    bg: '#F5F5F5',
    Icon: Lock,
  },
  institution: {
    label: 'Limité à l’établissement',
    short: 'Établissement',
    description: 'Personnels de l’université connectés, services d’appui à la recherche.',
    color: '#1565C0',
    bg: '#E3F2FD',
    Icon: Apartment,
  },
  public: {
    label: 'Public',
    short: 'Public',
    description: 'Exposé sur les portails publics de recherche d’expertise.',
    color: TEAL,
    bg: '#E8F5F4',
    Icon: Public,
  },
}

export const VOCAB_CONFIG: Record<Vocabulary, { label: string; tag: string; source?: string; color: string }> = {
  rameau: { label: 'RAMEAU', tag: 'RAMEAU', source: 'IdRef', color: '#6D4C41' },
  mesh: { label: 'MeSH', tag: 'MeSH', source: 'NLM', color: '#1565C0' },
  wikidata: { label: 'Wikidata', tag: 'Wikidata', color: '#2E7D32' },
  hal: { label: 'Domaines HAL', tag: 'HAL', source: 'HAL', color: '#C62828' },
  libre: { label: 'Libre', tag: 'libre', color: '#757575' },
}

export const RELATION_SUGGESTIONS = [
  'prolonge', 's’appuie sur', 'nourrit', 'a conduit à', 'croise', 'méthodes partagées', 'applique',
]

export const SOLICITATION_ICONS = { press: NewspaperOutlined, events: CampaignOutlined }

export function formatPeriod(theme: Pick<ResearchTheme, 'yearFrom' | 'yearTo'>, ongoingLabel = 'en cours'): string {
  if (theme.yearFrom == null) return 'Période non renseignée'
  return `${theme.yearFrom} → ${theme.yearTo == null ? ongoingLabel : theme.yearTo}`
}

/** Année lisible, avec « av. J.-C. » pour les années négatives. */
export function formatYear(y: number): string {
  return y < 0 ? `${-y} av. J.-C.` : String(y)
}

/** Bornes d'une période étudiée (« 1945 – 1975 », « 6000 – 2200 av. J.-C. »), vide si non datée. */
export function formatStudiedBounds(p: StudiedPeriod): string {
  if (p.yearFrom == null && p.yearTo == null) return ''
  if (p.yearFrom != null && p.yearTo != null) {
    if (p.yearFrom < 0 && p.yearTo < 0) return `${-p.yearFrom} – ${-p.yearTo} av. J.-C.`
    return `${formatYear(p.yearFrom)} – ${formatYear(p.yearTo)}`
  }
  return p.yearFrom != null ? `depuis ${formatYear(p.yearFrom)}` : `jusqu’à ${formatYear(p.yearTo as number)}`
}

/** Le thème était-il travaillé pendant l'année donnée ? */
export function isActiveIn(theme: Pick<ResearchTheme, 'yearFrom' | 'yearTo'>, year: number): boolean {
  if (theme.yearFrom == null) return false
  return theme.yearFrom <= year && (theme.yearTo ?? CURRENT_YEAR) >= year
}

/** Phrase lisible décrivant une relation, utilisée dans le panneau et l'aperçu. */
export function relationSentence(rel: ThemeRelation, themes: ResearchTheme[]): string {
  const a = themes.find((t) => t.id === rel.source)?.label ?? '…'
  const b = themes.find((t) => t.id === rel.target)?.label ?? '…'
  const label = rel.label.trim() || 'est lié à'
  if (rel.direction === 'bidirectional') return `« ${a} » et « ${b} » : ${label}`
  if (rel.direction === 'backward') return `« ${b} » ${label} « ${a} »`
  return `« ${a} » ${label} « ${b} »`
}

export function idrefUrl(ppn: string): string {
  return `https://www.idref.fr/${ppn}`
}

export function geonamesUrl(id: number): string {
  return `https://www.geonames.org/${id}`
}

/** Texte montré à un public donné : la déclinaison si elle existe, sinon la description générale. */
export function descriptionFor(theme: ResearchTheme, audience: Audience | null): string {
  if (!audience) return theme.description
  return theme.variants[audience]?.trim() || theme.description
}

export function variantCount(theme: Pick<ResearchTheme, 'variants'>): number {
  return AUDIENCES.filter((a) => theme.variants[a]?.trim()).length
}

export function newThemeId(): string {
  return `t${Date.now()}${Math.floor(Math.random() * 1000)}`
}

export function blankTheme(): ResearchTheme {
  return {
    id: newThemeId(),
    label: '',
    description: '',
    yearFrom: CURRENT_YEAR,
    yearTo: null,
    studiedPeriods: [],
    keywords: [],
    places: [],
    persons: [],
    organizations: [],
    variants: {},
    visibility: 'institution',
    acceptsPress: false,
    acceptsEvents: false,
    status: 'draft',
  }
}

/** Complète un thème lu depuis le stockage avec les champs ajoutés depuis sa création. */
export function normalizeTheme(raw: Partial<ResearchTheme> & Pick<ResearchTheme, 'id' | 'label'>): ResearchTheme {
  return {
    ...blankTheme(),
    ...raw,
    studiedPeriods: raw.studiedPeriods ?? [],
    keywords: raw.keywords ?? [],
    places: raw.places ?? [],
    persons: raw.persons ?? [],
    organizations: raw.organizations ?? [],
    variants: raw.variants ?? {},
  }
}

export function normalizeProfile(raw: ResearchProfile): ResearchProfile {
  return { ...raw, themes: (raw.themes ?? []).map(normalizeTheme), relations: raw.relations ?? [] }
}

// ─── Profil de démonstration ─────────────────────────────────────────────────
// Chercheur·e fictif·ve en géographie sociale, 5 thèmes datés, 4 relations.
// Les repères structurés et les déclinaisons par public sont volontairement
// inégaux d'un thème à l'autre pour montrer les différents états de l'interface.

export const DEMO_PROFILE: ResearchProfile = {
  lastUpdated: '2026-03-12',
  themes: [
    {
      id: 't1',
      label: 'Habitat inclusif et politiques publiques',
      description:
        'J’étudie les formes d’habitat partagé destinées aux personnes âgées (colocations, habitats accompagnés, '
        + 'résidences intergénérationnelles) et la manière dont les collectivités locales et l’État s’en saisissent. '
        + 'Je m’intéresse aux acteurs qui portent ces projets, aux financements et à ce qu’ils changent dans la vie '
        + 'quotidienne des habitants.',
      yearFrom: 2017,
      yearTo: null,
      studiedPeriods: [],
      publicationIds: ['p14', 'p15', 'p16'],
      keywords: [
        { label: 'Habitat inclusif', vocabulary: 'rameau', detail: 'Logement' },
        { label: 'Politique du logement', vocabulary: 'rameau' },
        { label: 'Personnes âgées', vocabulary: 'rameau' },
        { label: 'Aged', vocabulary: 'mesh' },
        { label: 'Senior cohousing', vocabulary: 'wikidata' },
        { label: 'Géographie', vocabulary: 'hal', detail: 'shs.geo' },
        { label: 'action publique locale', vocabulary: 'libre' },
      ],
      places: [
        { label: 'Bretagne', geonamesId: 3030293, detail: 'Région' },
        { label: 'Pays de la Loire', geonamesId: 2988430, detail: 'Région' },
        { label: 'Rennes', geonamesId: 2983990, detail: 'Ville' },
      ],
      persons: [],
      organizations: [
        { label: 'Caisse nationale de solidarité pour l’autonomie (CNSA)', ppn: '112263054', detail: 'Paris, France' },
        { label: 'Union sociale pour l’habitat (USH)', ppn: '034514990', detail: 'Paris, France' },
      ],
      variants: {},
      visibility: 'institution',
      acceptsPress: false,
      acceptsEvents: false,
      status: 'validated',
      lastValidated: '2026-03-12',
    },
    {
      id: 't2',
      label: 'Méthodes participatives en géographie sociale',
      description:
        'Recherche-action, cartographie sensible et ateliers avec les habitants comme outils de production de savoirs.',
      yearFrom: 2015,
      yearTo: null,
      studiedPeriods: [],
      publicationIds: ['p10', 'p11', 'p12', 'p13'],
      keywords: [
        { label: 'Recherche participative', vocabulary: 'rameau' },
        { label: 'Cartographie', vocabulary: 'rameau' },
        { label: 'Recherche-action', vocabulary: 'wikidata' },
        { label: 'Géographie', vocabulary: 'hal', detail: 'shs.geo' },
        { label: 'cartographie sensible', vocabulary: 'libre' },
        { label: 'ateliers d’habitants', vocabulary: 'libre' },
      ],
      places: [
        { label: 'Nantes', geonamesId: 2990969, detail: 'Ville' },
        { label: 'Saint-Nazaire', geonamesId: 2980291, detail: 'Ville' },
      ],
      persons: [
        { label: 'Dewey, John', ppn: '034119280', dates: '1859-1952' },
      ],
      organizations: [
        { label: 'Nantes Métropole', ppn: '069514879', detail: 'Nantes, France' },
      ],
      variants: {
        researchers:
          'Approche de recherche-action en géographie sociale : dispositifs participatifs (ateliers d’habitants, '
          + 'cartographie sensible, marches commentées) considérés à la fois comme méthode d’enquête et comme objet '
          + 'd’analyse. Travaux conduits à Nantes et Saint-Nazaire depuis 2015, en dialogue avec la tradition pragmatiste.',
        industry:
          'Conception et animation de démarches participatives avec les habitants pour des projets urbains, de '
          + 'renouvellement de quartier ou d’aménagement : diagnostics partagés, cartes sensibles, restitutions publiques. '
          + 'Expérience avec des collectivités et des bailleurs de l’agglomération nantaise.',
        media:
          'Comment associer vraiment les habitants aux décisions qui concernent leur quartier ? J’analyse les démarches '
          + 'participatives, ce qu’elles produisent et leurs angles morts.',
        public:
          'Je travaille avec des habitants pour dessiner ensemble la carte de leur quartier : ce qu’ils aiment, ce qui '
          + 'manque, ce qui change. Ces cartes servent ensuite à discuter avec les élus et les aménageurs.',
      },
      variantsGeneratedAt: '2025-11-04',
      visibility: 'public',
      acceptsPress: true,
      acceptsEvents: true,
      status: 'validated',
      lastValidated: '2025-11-04',
    },
    {
      id: 't3',
      label: 'Vieillissement et territoires ruraux',
      description:
        'Recompositions des services et des solidarités locales dans les campagnes bretonnes vieillissantes.',
      yearFrom: 2012,
      yearTo: 2019,
      studiedPeriods: [{ label: 'Années 1990 – 2010', yearFrom: 1990, yearTo: 2010 }],
      publicationIds: ['p06', 'p07', 'p08', 'p09'],
      keywords: [
        { label: 'Vieillissement', vocabulary: 'rameau' },
        { label: 'Espace rural', vocabulary: 'rameau' },
        { label: 'Bretagne (France)', vocabulary: 'rameau' },
        { label: 'services de proximité', vocabulary: 'libre' },
      ],
      places: [
        { label: 'Bretagne', geonamesId: 3030293, detail: 'Région' },
        { label: 'Finistère', geonamesId: 3018471, detail: 'Département' },
        { label: 'Côtes-d’Armor', geonamesId: 3023414, detail: 'Département' },
      ],
      persons: [],
      organizations: [
        { label: 'Institut national de la statistique et des études économiques (INSEE)', ppn: '033155291', detail: 'Paris, France' },
      ],
      variants: {
        media:
          'Dans les campagnes qui vieillissent, qui s’occupe des anciens quand les services ferment ? J’ai suivi pendant '
          + 'sept ans des communes du Finistère et des Côtes-d’Armor.',
        public:
          'Quand la poste, le médecin et l’épicerie ferment, comment les habitants âgés des campagnes s’organisent-ils ? '
          + 'J’ai étudié les entraides de voisinage et les solutions inventées par les communes bretonnes.',
      },
      variantsGeneratedAt: '2025-11-04',
      visibility: 'public',
      acceptsPress: true,
      acceptsEvents: false,
      status: 'validated',
      lastValidated: '2025-11-04',
    },
    {
      id: 't4',
      label: 'Mobilités résidentielles des retraités',
      description:
        'Thèse : migrations de retraite vers le littoral atlantique et choix résidentiels au moment de la cessation d’activité.',
      yearFrom: 2009,
      yearTo: 2014,
      studiedPeriods: [{ label: 'Recensements 1975 – 2006', yearFrom: 1975, yearTo: 2006 }],
      publicationIds: ['p01', 'p02', 'p03', 'p04'],
      keywords: [
        { label: 'Retraités', vocabulary: 'rameau' },
        { label: 'Littoraux', vocabulary: 'rameau' },
        { label: 'Retirement migration', vocabulary: 'wikidata' },
        { label: 'migrations de retraite', vocabulary: 'libre' },
      ],
      places: [
        { label: 'Littoral atlantique', detail: 'Littoral' },
        { label: 'Vendée', geonamesId: 2970140, detail: 'Département' },
        { label: 'Charente-Maritime', geonamesId: 3027159, detail: 'Département' },
      ],
      persons: [],
      organizations: [
        { label: 'Institut national de la statistique et des études économiques (INSEE)', ppn: '033155291', detail: 'Paris, France' },
      ],
      variants: {},
      visibility: 'public',
      acceptsPress: false,
      acceptsEvents: false,
      status: 'validated',
      lastValidated: '2025-11-04',
    },
    {
      id: 't5',
      label: 'Adaptation des logements au changement climatique',
      description: '',
      yearFrom: 2021,
      yearTo: null,
      studiedPeriods: [],
      publicationIds: ['p28'],
      keywords: [{ label: 'Confort thermique', vocabulary: 'rameau' }],
      places: [],
      persons: [],
      organizations: [],
      variants: {},
      visibility: 'private',
      acceptsPress: false,
      acceptsEvents: false,
      status: 'draft',
    },
  ],
  relations: [
    { id: 'r1', source: 't3', target: 't4', direction: 'forward', label: 'prolonge' },
    { id: 'r2', source: 't1', target: 't3', direction: 'forward', label: 's’appuie sur' },
    { id: 'r3', source: 't2', target: 't3', direction: 'bidirectional', label: 'méthodes partagées' },
    { id: 'r4', source: 't2', target: 't1', direction: 'forward', label: 'nourrit' },
  ],
}

export const EMPTY_PROFILE: ResearchProfile = {
  themes: [],
  relations: [],
  lastUpdated: new Date().toISOString().split('T')[0],
}
