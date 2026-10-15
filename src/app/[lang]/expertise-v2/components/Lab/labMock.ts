import {
  CURRENT_YEAR, Keyword, OrgRef, PersonRef, PlaceRef, ResearchTheme, Visibility, Vocabulary, blankTheme, isActiveIn,
} from '../../types'

// ─── Vue laboratoire v2 : données de démonstration ───────────────────────────
// Le laboratoire n'a pas d'objet propre : il agrège les thèmes de recherche
// saisis par ses membres dans leur Profil de recherche 2. Deux thèmes se
// regroupent quand ils partagent le même mot-clé contrôlé (RAMEAU / Wikidata /
// MeSH), sinon par libellé normalisé. Seuls les thèmes validés dont la
// diffusion est « établissement » ou « public » remontent au laboratoire.

export const LAB_INFO = {
  name: 'Territoires, Habitat et Sociétés (THS)',
  shortName: 'THS',
  teams: [
    'Vieillissement, santé et solidarités',
    'Habitat, villes et transitions',
    'Littoraux, ruralités et mobilités',
  ],
}

export interface LabMember {
  id: string
  name: string
  team: string
  /** Thèmes tels que saisis par le membre (toutes diffusions, tous statuts). */
  themes: ResearchTheme[]
}

interface TopicSeed {
  label: string
  description: string
  keyword: { label: string; vocabulary: Vocabulary; detail?: string }
  extraKeywords?: Keyword[]
  places?: PlaceRef[]
  organizations?: OrgRef[]
  persons?: PersonRef[]
}

const P = {
  bretagne: { label: 'Bretagne', geonamesId: 3030293, detail: 'Région' },
  paysLoire: { label: 'Pays de la Loire', geonamesId: 2988430, detail: 'Région' },
  finistere: { label: 'Finistère', geonamesId: 3018471, detail: 'Département' },
  morbihan: { label: 'Morbihan', geonamesId: 2993370, detail: 'Département' },
  illeVilaine: { label: 'Ille-et-Vilaine', geonamesId: 3012804, detail: 'Département' },
  loireAtl: { label: 'Loire-Atlantique', geonamesId: 2997861, detail: 'Département' },
  vendee: { label: 'Vendée', geonamesId: 2970140, detail: 'Département' },
  charente: { label: 'Charente-Maritime', geonamesId: 3027159, detail: 'Département' },
  mayenne: { label: 'Mayenne', geonamesId: 2994111, detail: 'Département' },
  sarthe: { label: 'Sarthe', geonamesId: 2975517, detail: 'Département' },
  nantes: { label: 'Nantes', geonamesId: 2990969, detail: 'Ville' },
  saintNazaire: { label: 'Saint-Nazaire', geonamesId: 2980291, detail: 'Ville' },
  rennes: { label: 'Rennes', geonamesId: 2983990, detail: 'Ville' },
  brest: { label: 'Brest', geonamesId: 3030300, detail: 'Ville' },
  lorient: { label: 'Lorient', geonamesId: 2997577, detail: 'Ville' },
  quimper: { label: 'Quimper', geonamesId: 2984701, detail: 'Ville' },
  angers: { label: 'Angers', geonamesId: 3037656, detail: 'Ville' },
  rocheYon: { label: 'La Roche-sur-Yon', geonamesId: 2977963, detail: 'Ville' },
  littoral: { label: 'Littoral atlantique', detail: 'Littoral' },
  centreBretagne: { label: 'Centre-Bretagne', detail: 'Espace rural' },
  yeu: { label: 'Île d’Yeu', geonamesId: 3013092, detail: 'Île' },
  belleIle: { label: 'Belle-Île-en-Mer', geonamesId: 3034720, detail: 'Île' },
  paris: { label: 'Paris', geonamesId: 2988507, detail: 'Ville' },
  senegal: { label: 'Sénégal', geonamesId: 2245662, detail: 'Pays' },
} satisfies Record<string, PlaceRef>

const O = {
  cnsa: { label: 'Caisse nationale de solidarité pour l’autonomie (CNSA)', ppn: '112263054', detail: 'Paris, France' },
  cnav: { label: 'Caisse nationale d’assurance vieillesse (CNAV)', ppn: '026365278', detail: 'Paris, France' },
  anah: { label: 'Agence nationale de l’habitat (ANAH)', ppn: '026355248', detail: 'Paris, France' },
  ush: { label: 'Union sociale pour l’habitat (USH)', ppn: '034514990', detail: 'Paris, France' },
  ademe: { label: 'Agence de la transition écologique (ADEME)', ppn: '029262895', detail: 'Angers, France' },
  cerema: { label: 'Cerema', ppn: '178196635', detail: 'Bron, France' },
  anct: { label: 'Agence nationale de la cohésion des territoires (ANCT)', ppn: '243040520', detail: 'Paris, France' },
  insee: { label: 'Institut national de la statistique et des études économiques (INSEE)', ppn: '033155291', detail: 'Paris, France' },
  inrae: { label: 'Institut national de recherche pour l’agriculture, l’alimentation et l’environnement (INRAE)', ppn: '243726376', detail: 'France' },
  nantesMetropole: { label: 'Nantes Métropole', ppn: '069514879', detail: 'Nantes, France' },
  rennesMetropole: { label: 'Rennes Métropole', ppn: '059858990', detail: 'Rennes, France' },
  regionBretagne: { label: 'Région Bretagne', ppn: '026393387', detail: 'Rennes, France' },
  conservatoire: { label: 'Conservatoire du littoral', ppn: '026377861', detail: 'Rochefort, France' },
  nantesUniv: { label: 'Nantes Université', ppn: '259608068', detail: 'Nantes, France' },
  hcr: { label: 'Haut Commissariat des Nations Unies pour les réfugiés (HCR)', ppn: '028404033', detail: 'Genève, International' },
  fondationAbbePierre: { label: 'Fondation Abbé Pierre', ppn: '034457666', detail: 'Paris, France' },
} satisfies Record<string, OrgRef>

const TOPICS = {
  habitatInclusif: {
    label: 'Habitat inclusif et politiques publiques',
    description: 'Formes d’habitat partagé pour les personnes âgées et appropriation par les collectivités.',
    keyword: { label: 'Habitat inclusif', vocabulary: 'rameau', detail: 'Logement' },
    extraKeywords: [{ label: 'Personnes âgées', vocabulary: 'rameau' }],
    places: [P.bretagne, P.rennes],
    organizations: [O.cnsa],
  },
  vieillissementRural: {
    label: 'Vieillissement et territoires ruraux',
    description: 'Recompositions des services et des solidarités locales dans les campagnes vieillissantes.',
    keyword: { label: 'Vieillissement', vocabulary: 'rameau' },
    extraKeywords: [{ label: 'Espace rural', vocabulary: 'rameau' }],
    places: [P.centreBretagne, P.finistere],
    organizations: [O.insee],
  },
  aideDomicile: {
    label: 'Aide à domicile et travail du care',
    description: 'Conditions de travail des aides à domicile et organisation territoriale du maintien à domicile.',
    keyword: { label: 'Aide à domicile', vocabulary: 'rameau' },
    extraKeywords: [{ label: 'Home Care Services', vocabulary: 'mesh', detail: 'D006699' }],
    places: [P.bretagne, P.illeVilaine],
    organizations: [O.cnsa, O.cnav],
  },
  accesSoins: {
    label: 'Accès aux soins et déserts médicaux',
    description: 'Organisation territoriale de l’offre de soins et mobilités des patients dans les espaces peu denses.',
    keyword: { label: 'Désert médical', vocabulary: 'wikidata', detail: 'Q3023612' },
    extraKeywords: [{ label: 'Health Services Accessibility', vocabulary: 'mesh', detail: 'D006297' }],
    places: [P.mayenne, P.sarthe],
    organizations: [O.insee],
  },
  mobilitesRetraites: {
    label: 'Mobilités résidentielles des retraités',
    description: 'Migrations de retraite vers le littoral et choix résidentiels à la cessation d’activité.',
    keyword: { label: 'Retraités', vocabulary: 'rameau' },
    places: [P.littoral, P.vendee, P.charente],
    organizations: [O.insee],
  },
  participatif: {
    label: 'Méthodes participatives en géographie sociale',
    description: 'Recherche-action, cartographie sensible et ateliers d’habitants comme outils de production de savoirs.',
    keyword: { label: 'Recherche participative', vocabulary: 'rameau' },
    places: [P.nantes, P.saintNazaire],
    organizations: [O.nantesMetropole],
    persons: [{ label: 'Dewey, John', ppn: '034119280', dates: '1859-1952' }],
  },
  precariteEnergetique: {
    label: 'Précarité énergétique des ménages',
    description: 'Exposition des ménages modestes aux coûts de l’énergie et politiques de rénovation du parc privé.',
    keyword: { label: 'Précarité énergétique', vocabulary: 'rameau' },
    places: [P.loireAtl, P.nantes],
    organizations: [O.anah, O.ademe, O.fondationAbbePierre],
  },
  renouvellementUrbain: {
    label: 'Renouvellement urbain et quartiers populaires',
    description: 'Effets des programmes de rénovation urbaine sur les trajectoires résidentielles des habitants.',
    keyword: { label: 'Rénovation urbaine', vocabulary: 'rameau' },
    places: [P.nantes, P.saintNazaire],
    organizations: [O.ush, O.nantesMetropole],
    persons: [{ label: 'Wacquant, Loïc', ppn: '034827706', dates: '1960-' }],
  },
  littoralRisques: {
    label: 'Littoraux et risques côtiers',
    description: 'Recul du trait de côte, submersion et stratégies d’adaptation des communes littorales.',
    keyword: { label: 'Littoraux', vocabulary: 'rameau' },
    extraKeywords: [{ label: 'Coastal erosion', vocabulary: 'wikidata', detail: 'Q1142160' }],
    places: [P.littoral, P.vendee, P.charente],
    organizations: [O.conservatoire, O.cerema],
  },
  tourismeResidences: {
    label: 'Tourisme et résidences secondaires',
    description: 'Pression des résidences secondaires sur le logement permanent dans les communes touristiques.',
    keyword: { label: 'Résidences secondaires', vocabulary: 'rameau' },
    places: [P.belleIle, P.morbihan, P.finistere],
    organizations: [O.regionBretagne],
  },
  insularite: {
    label: 'Insularité et services publics',
    description: 'Maintien des services (école, soins, transports) dans les îles du Ponant.',
    keyword: { label: 'Îles', vocabulary: 'rameau' },
    places: [P.yeu, P.belleIle],
    organizations: [O.regionBretagne],
  },
  mobilitesQuotidiennes: {
    label: 'Mobilités quotidiennes et périurbain',
    description: 'Dépendance automobile, pratiques de déplacement et inégalités d’accès dans les couronnes périurbaines.',
    keyword: { label: 'Périurbanisation', vocabulary: 'rameau' },
    places: [P.rennes, P.angers],
    organizations: [O.rennesMetropole, O.cerema],
  },
  logementEtudiant: {
    label: 'Logement étudiant et métropolisation',
    description: 'Marchés du logement étudiant et recompositions des quartiers universitaires.',
    keyword: { label: 'Logement étudiant', vocabulary: 'rameau' },
    places: [P.nantes, P.rennes],
    organizations: [O.nantesUniv],
  },
  foncierAgricole: {
    label: 'Foncier agricole et transitions',
    description: 'Transmission des exploitations, artificialisation et installation hors cadre familial.',
    keyword: { label: 'Foncier agricole', vocabulary: 'rameau' },
    places: [P.illeVilaine, P.mayenne],
    organizations: [O.inrae],
  },
  migrationsAccueil: {
    label: 'Migrations internationales et accueil local',
    description: 'Dispositifs d’accueil des exilés dans les villes moyennes et les campagnes de l’Ouest.',
    keyword: { label: 'Immigrés', vocabulary: 'rameau' },
    places: [P.nantes, P.brest, P.senegal],
    organizations: [O.hcr],
    persons: [{ label: 'Sayad, Abdelmalek', ppn: '033975051', dates: '1933-1998' }],
  },
  genreEspaces: {
    label: 'Genre et espaces publics',
    description: 'Usages genrés de l’espace public et politiques d’aménagement inclusif.',
    keyword: { label: 'Études sur le genre', vocabulary: 'rameau' },
    places: [P.nantes, P.paris],
    organizations: [O.nantesMetropole],
    persons: [{ label: 'Héritier, Françoise', ppn: '039148041', dates: '1933-2017' }],
  },
  habitatLeger: {
    label: 'Habitat léger et alternatives résidentielles',
    description: 'Yourtes, tiny houses, habitat réversible : trajectoires des habitants et réponses des communes.',
    keyword: { label: 'Habitat alternatif', vocabulary: 'wikidata', detail: 'Q1198404' },
    places: [P.morbihan, P.finistere],
  },
  donneesUrbaines: {
    label: 'Données urbaines et gouvernance numérique',
    description: 'Production et usages des données urbaines par les métropoles et leurs partenaires privés.',
    keyword: { label: 'Ville intelligente', vocabulary: 'wikidata', detail: 'Q1070551' },
    places: [P.nantes, P.rennes],
    organizations: [O.nantesMetropole],
    persons: [{ label: 'Castells, Manuel', ppn: '026773422', dates: '1942-' }],
  },
  patrimoineIndustriel: {
    label: 'Patrimoine industriel et reconversions',
    description: 'Devenir des friches portuaires et industrielles, mémoire ouvrière et projets urbains.',
    keyword: { label: 'Patrimoine industriel', vocabulary: 'rameau' },
    places: [P.saintNazaire, P.lorient],
  },
  adaptationClimat: {
    label: 'Adaptation des villes au changement climatique',
    description: 'Îlots de chaleur, végétalisation et justice environnementale dans les métropoles de l’Ouest.',
    keyword: { label: 'Adaptation au changement climatique', vocabulary: 'wikidata', detail: 'Q1138855' },
    places: [P.nantes, P.angers],
    organizations: [O.ademe, O.cerema],
  },
  jeunessesRurales: {
    label: 'Jeunesses rurales et parcours',
    description: 'Orientation, mobilité et ancrage des jeunes des espaces ruraux.',
    keyword: { label: 'Jeunes ruraux', vocabulary: 'rameau' },
    places: [P.mayenne, P.centreBretagne],
  },
  commerceCentres: {
    label: 'Commerce et centralités des petites villes',
    description: 'Vacance commerciale, programmes de revitalisation et nouveaux usages des centres-villes.',
    keyword: { label: 'Centres-villes', vocabulary: 'rameau' },
    places: [P.quimper, P.rocheYon],
    organizations: [O.anct],
  },
} satisfies Record<string, TopicSeed>

type TopicKey = keyof typeof TOPICS

interface Seed {
  topic: TopicKey
  from: number
  to?: number | null
  visibility?: Visibility
  press?: boolean
  events?: boolean
  draft?: boolean
  /** Intitulé personnalisé par le membre (le regroupement se fait sur le mot-clé). */
  label?: string
}

function makeTheme(memberId: string, index: number, s: Seed): ResearchTheme {
  const t = TOPICS[s.topic] as TopicSeed
  const visibility = s.visibility ?? 'public'
  return {
    ...blankTheme(),
    id: `${memberId}-${index}`,
    label: s.label ?? t.label,
    description: t.description,
    yearFrom: s.from,
    yearTo: s.to === undefined ? null : s.to,
    keywords: [t.keyword as Keyword, ...(t.extraKeywords ?? []), { label: 'Géographie', vocabulary: 'hal', detail: 'shs.geo' }],
    places: t.places ?? [],
    persons: t.persons ?? [],
    organizations: t.organizations ?? [],
    visibility,
    acceptsPress: visibility === 'public' && Boolean(s.press),
    acceptsEvents: visibility === 'public' && Boolean(s.events),
    status: s.draft ? 'draft' : 'validated',
    lastValidated: s.draft ? undefined : `${2024 + (index % 3)}-0${1 + (index % 9)}-1${index % 10}`,
  }
}

function member(id: string, name: string, team: number, seeds: Seed[]): LabMember {
  return { id, name, team: LAB_INFO.teams[team], themes: seeds.map((s, i) => makeTheme(id, i + 1, s)) }
}

export const LAB_MEMBERS: LabMember[] = [
  // ── Vieillissement, santé et solidarités ──
  member('m01', 'Yann Le Goff', 0, [
    { topic: 'vieillissementRural', from: 2010, press: true, events: true },
    { topic: 'aideDomicile', from: 2016, press: true },
    { topic: 'accesSoins', from: 2008, to: 2015 },
  ]),
  member('m02', 'Aurélie Tanguy', 0, [
    { topic: 'aideDomicile', from: 2019, press: true },
    { topic: 'habitatInclusif', from: 2021, visibility: 'institution' },
  ]),
  member('m03', 'Mehdi Rahmani', 0, [
    { topic: 'accesSoins', from: 2014, press: true, events: true },
    { topic: 'mobilitesQuotidiennes', from: 2011, to: 2016 },
  ]),
  member('m04', 'Léa Guillou', 0, [
    { topic: 'habitatInclusif', from: 2018, events: true, label: 'Habitats partagés pour les aînés' },
    { topic: 'vieillissementRural', from: 2013, to: 2020 },
  ]),
  member('m05', 'Pascal Hervé', 0, []),
  // ── Habitat, villes et transitions ──
  member('m06', 'Nolwenn Bihan', 1, [
    { topic: 'precariteEnergetique', from: 2015, press: true, events: true },
    { topic: 'adaptationClimat', from: 2022, press: true },
    { topic: 'renouvellementUrbain', from: 2009, to: 2014 },
  ]),
  member('m07', 'Thomas Caradec', 1, [
    { topic: 'renouvellementUrbain', from: 2012, press: true },
    { topic: 'participatif', from: 2017, events: true },
    { topic: 'patrimoineIndustriel', from: 2006, to: 2011, visibility: 'institution' },
  ]),
  member('m08', 'Inès Benkirane', 1, [
    { topic: 'genreEspaces', from: 2016, press: true, events: true },
    { topic: 'donneesUrbaines', from: 2020 },
  ]),
  member('m09', 'Julien Rouxel', 1, [
    { topic: 'logementEtudiant', from: 2013, to: 2019 },
    { topic: 'habitatLeger', from: 2019, press: true },
    { topic: 'precariteEnergetique', from: 2021, visibility: 'institution' },
  ]),
  member('m10', 'Sarah Lemoine', 1, [
    { topic: 'adaptationClimat', from: 2024, draft: true },
  ]),
  member('m11', 'Antoine Priol', 1, []),
  // ── Littoraux, ruralités et mobilités ──
  member('m12', 'Maëlle Jaouen', 2, [
    { topic: 'littoralRisques', from: 2014, press: true, events: true },
    { topic: 'tourismeResidences', from: 2019, press: true },
    { topic: 'mobilitesRetraites', from: 2007, to: 2013 },
  ]),
  member('m13', 'Romain Guéguen', 2, [
    { topic: 'insularite', from: 2017, press: true },
    { topic: 'tourismeResidences', from: 2021 },
    { topic: 'commerceCentres', from: 2010, to: 2016, visibility: 'institution' },
  ]),
  member('m14', 'Fatou Ndiaye', 2, [
    { topic: 'migrationsAccueil', from: 2015, press: true, events: true },
    { topic: 'jeunessesRurales', from: 2020 },
  ]),
  member('m15', 'Hugo Lefort', 2, [
    { topic: 'foncierAgricole', from: 2012, press: true },
    { topic: 'mobilitesQuotidiennes', from: 2018, events: true },
    { topic: 'commerceCentres', from: 2022 },
  ]),
  member('m16', 'Camille Riou', 2, [
    { topic: 'littoralRisques', from: 2020, visibility: 'institution' },
    { topic: 'patrimoineIndustriel', from: 2015, to: 2021 },
  ]),
]

// ─── Agrégation ──────────────────────────────────────────────────────────────

/** Un thème remonte au laboratoire s'il est validé et non privé. */
export function isLabVisible(theme: ResearchTheme): boolean {
  return theme.status === 'validated' && theme.visibility !== 'private'
}

export function normalizeLabel(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

/** Clé de regroupement : premier mot-clé contrôlé, sinon l'intitulé normalisé. */
export function topicKeyOf(theme: ResearchTheme): { key: string; label: string; vocabulary?: Vocabulary } {
  const controlled = theme.keywords.find((k) => k.vocabulary === 'rameau' || k.vocabulary === 'wikidata' || k.vocabulary === 'mesh')
  if (controlled) return { key: `${controlled.vocabulary}:${normalizeLabel(controlled.label)}`, label: controlled.label, vocabulary: controlled.vocabulary }
  return { key: `label:${normalizeLabel(theme.label)}`, label: theme.label }
}

export interface LabEntry {
  member: LabMember
  theme: ResearchTheme
}

export interface LabTopic {
  key: string
  label: string
  vocabulary?: Vocabulary
  entries: LabEntry[]
  yearFrom: number
  /** null = au moins un membre travaille encore le thème. */
  yearTo: number | null
  teams: string[]
  acceptsPress: boolean
  acceptsEvents: boolean
}

export function labEntries(members: LabMember[]): LabEntry[] {
  return members.flatMap((m) => m.themes.filter(isLabVisible).map((theme) => ({ member: m, theme })))
}

export function aggregateTopics(entries: LabEntry[]): LabTopic[] {
  const map = new Map<string, LabTopic>()
  for (const e of entries) {
    const { key, label, vocabulary } = topicKeyOf(e.theme)
    const from = e.theme.yearFrom ?? CURRENT_YEAR
    const to = e.theme.yearTo
    const existing = map.get(key)
    if (!existing) {
      map.set(key, {
        key, label, vocabulary, entries: [e], yearFrom: from, yearTo: to,
        teams: [e.member.team], acceptsPress: e.theme.acceptsPress, acceptsEvents: e.theme.acceptsEvents,
      })
    } else {
      existing.entries.push(e)
      existing.yearFrom = Math.min(existing.yearFrom, from)
      existing.yearTo = existing.yearTo == null || to == null ? null : Math.max(existing.yearTo, to)
      if (!existing.teams.includes(e.member.team)) existing.teams.push(e.member.team)
      existing.acceptsPress = existing.acceptsPress || e.theme.acceptsPress
      existing.acceptsEvents = existing.acceptsEvents || e.theme.acceptsEvents
    }
  }
  return [...map.values()].sort((a, b) => {
    if (b.entries.length !== a.entries.length) return b.entries.length - a.entries.length
    const aOngoing = a.yearTo == null ? 0 : 1
    const bOngoing = b.yearTo == null ? 0 : 1
    if (aOngoing !== bOngoing) return aOngoing - bOngoing
    return a.label.localeCompare(b.label, 'fr')
  })
}

export interface RefCount<T> { ref: T; count: number; members: string[] }

export function aggregateRefs<T extends { label: string }>(entries: LabEntry[], pick: (t: ResearchTheme) => T[]): RefCount<T>[] {
  const map = new Map<string, RefCount<T>>()
  for (const e of entries) {
    for (const ref of pick(e.theme)) {
      const key = normalizeLabel(ref.label)
      const cur = map.get(key)
      if (!cur) map.set(key, { ref, count: 1, members: [e.member.name] })
      else {
        cur.count += 1
        if (!cur.members.includes(e.member.name)) cur.members.push(e.member.name)
      }
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.ref.label.localeCompare(b.ref.label, 'fr'))
}

/** Nombre de thèmes actifs par année et par équipe, pour la frise agrégée. */
export function activeByYearAndTeam(entries: LabEntry[], years: number[]): Record<string, number[]> {
  const out: Record<string, number[]> = {}
  for (const team of LAB_INFO.teams) out[team] = years.map(() => 0)
  for (const e of entries) {
    const row = out[e.member.team] ?? (out[e.member.team] = years.map(() => 0))
    years.forEach((y, i) => { if (isActiveIn(e.theme, y)) row[i] += 1 })
  }
  return out
}

export function yearRange(entries: LabEntry[]): number[] {
  const starts = entries.map((e) => e.theme.yearFrom).filter((y): y is number => y != null)
  const min = starts.length ? Math.min(...starts) : CURRENT_YEAR - 10
  return Array.from({ length: CURRENT_YEAR - min + 1 }, (_v, i) => min + i)
}
