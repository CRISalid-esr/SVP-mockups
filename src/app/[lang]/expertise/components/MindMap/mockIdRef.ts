export interface IdRefResult {
  ppn: string
  label: string
  dates?: string
  description?: string
}

const PERSONS_DATA: IdRefResult[] = [
  { ppn: '034770313', label: 'Bourdieu, Pierre', dates: '1930-2002', description: 'Sociologue français' },
  { ppn: '026816539', label: 'Foucault, Michel', dates: '1926-1984', description: 'Philosophe français' },
  { ppn: '027029697', label: 'Derrida, Jacques', dates: '1930-2004', description: 'Philosophe algérien naturalisé français' },
  { ppn: '027149781', label: 'Butler, Judith', dates: '1956-', description: 'Philosophe et théoricienne américaine' },
  { ppn: '034883479', label: 'Appadurai, Arjun', dates: '1949-', description: 'Anthropologue américain' },
  { ppn: '028786300', label: 'Latour, Bruno', dates: '1947-2022', description: 'Sociologue et philosophe des sciences français' },
  { ppn: '026885077', label: 'Deleuze, Gilles', dates: '1925-1995', description: 'Philosophe français' },
  { ppn: '027290638', label: 'Morin, Edgar', dates: '1921-', description: 'Sociologue et philosophe français' },
  { ppn: '039148041', label: 'Héritier, Françoise', dates: '1933-2017', description: 'Anthropologue française' },
  { ppn: '033975051', label: 'Sayad, Abdelmalek', dates: '1933-1998', description: 'Sociologue algérien, spécialiste des migrations' },
  { ppn: '040894266', label: 'Agier, Michel', dates: '1953-', description: 'Anthropologue français' },
  { ppn: '077490878', label: 'Mauss, Marcel', dates: '1872-1950', description: 'Sociologue et anthropologue français' },
  { ppn: '026857960', label: 'Lévi-Strauss, Claude', dates: '1908-2009', description: 'Anthropologue et ethnologue français' },
  { ppn: '027124185', label: 'Balibar, Étienne', dates: '1942-', description: 'Philosophe français' },
  { ppn: '034827706', label: 'Wacquant, Loïc', dates: '1960-', description: 'Sociologue franco-américain' },
  { ppn: '041352963', label: 'Lahire, Bernard', dates: '1963-', description: 'Sociologue français' },
  { ppn: '033149372', label: 'Fassin, Didier', dates: '1955-', description: 'Anthropologue et médecin français' },
  { ppn: '028846613', label: 'Boltanski, Luc', dates: '1940-', description: 'Sociologue français' },
  { ppn: '028905628', label: 'Touraine, Alain', dates: '1925-2023', description: 'Sociologue français' },
  { ppn: '026925214', label: 'Parreñas, Rhacel Salazar', dates: '1969-', description: 'Sociologue américaine, spécialiste des migrations' },
  { ppn: '035481773', label: 'Noiriel, Gérard', dates: '1950-', description: 'Historien français, spécialiste de l\'immigration' },
  { ppn: '034119280', label: 'Dewey, John', dates: '1859-1952', description: 'Philosophe et pédagogue américain' },
  { ppn: '026881748', label: 'Habermas, Jürgen', dates: '1929-', description: 'Philosophe et sociologue allemand' },
  { ppn: '027250121', label: 'Rawls, John', dates: '1921-2002', description: 'Philosophe américain' },
  { ppn: '027063631', label: 'Arendt, Hannah', dates: '1906-1975', description: 'Philosophe et politologue américaine' },
]

const ORGANIZATIONS_DATA: IdRefResult[] = [
  { ppn: '026399334', label: 'Centre national de la recherche scientifique (CNRS)', description: 'France' },
  { ppn: '026781778', label: 'École des hautes études en sciences sociales (EHESS)', description: 'Paris, France' },
  { ppn: '032143079', label: 'Institut national de la santé et de la recherche médicale (Inserm)', description: 'France' },
  { ppn: '027248445', label: "Organisation des Nations Unies pour l'éducation, la science et la culture (UNESCO)", description: 'Paris, International' },
  { ppn: '027563499', label: 'Organisation internationale du travail (OIT)', description: 'Genève, International' },
  { ppn: '026403722', label: "Institut national d'études démographiques (INED)", description: 'Aubervilliers, France' },
  { ppn: '040017079', label: 'Institut de recherche pour le développement (IRD)', description: 'Marseille, France' },
  { ppn: '033155291', label: "Institut national de la statistique et des études économiques (INSEE)", description: 'Paris, France' },
  { ppn: '028404033', label: "Haut Commissariat des Nations Unies pour les réfugiés (HCR)", description: 'Genève, International' },
  { ppn: '028025369', label: "Organisation internationale pour les migrations (OIM)", description: 'Genève, International' },
  { ppn: '027261646', label: 'Université Paris 1 Panthéon-Sorbonne', description: 'Paris, France' },
  { ppn: '027362027', label: 'Sciences Po', description: 'Paris, France' },
  { ppn: '026400561', label: 'École normale supérieure (ENS)', description: 'Paris, France' },
  { ppn: '027399249', label: 'Université de Nantes', description: 'Nantes, France' },
  { ppn: '026403269', label: 'Université Lumière Lyon 2', description: 'Lyon, France' },
  { ppn: '026403536', label: 'Banque mondiale', description: 'Washington, International' },
  { ppn: '026781930', label: 'Fonds monétaire international (FMI)', description: 'Washington, International' },
  { ppn: '028404098', label: 'Organisation mondiale de la santé (OMS)', description: 'Genève, International' },
  { ppn: '029057884', label: 'Amnesty International', description: 'Londres, International' },
  { ppn: '033155038', label: "Institut d'études politiques de Paris", description: 'Paris, France' },
]

export function searchIdRefPersons(query: string): IdRefResult[] {
  if (!query.trim() || query.length < 2) return []
  const lower = query.toLowerCase()
  return PERSONS_DATA.filter(
    (r) => r.label.toLowerCase().includes(lower) || r.description?.toLowerCase().includes(lower),
  ).slice(0, 6)
}

export function searchIdRefOrganizations(query: string): IdRefResult[] {
  if (!query.trim() || query.length < 2) return []
  const lower = query.toLowerCase()
  return ORGANIZATIONS_DATA.filter(
    (r) => r.label.toLowerCase().includes(lower) || r.description?.toLowerCase().includes(lower),
  ).slice(0, 6)
}

export const GEONAMES_MOCK: string[] = [
  'Afrique', 'Afrique du Nord', 'Afrique subsaharienne', 'Afrique centrale', 'Afrique de l\'Ouest', 'Afrique orientale', 'Afrique australe',
  'Algérie', 'Allemagne', 'Argentine', 'Asie', 'Asie centrale', 'Asie du Sud', 'Asie du Sud-Est', 'Asie orientale',
  'Australie', 'Autriche', 'Bangladesh', 'Belgique', 'Bénin', 'Brésil', 'Burkina Faso',
  'Cameroun', 'Canada', 'Chili', 'Chine', 'Colombie', 'Corée du Sud', "Côte d'Ivoire",
  'Dakar', 'Delhi', 'Espagne', 'États-Unis', 'Éthiopie', 'Europe', 'Europe centrale', 'Europe de l\'Est', 'Europe de l\'Ouest', 'Europe du Nord',
  'France', 'Genève', 'Ghana', 'Golfe Persique', 'Grèce', 'Inde', 'Indonésie',
  'Iran', 'Irak', 'Irlande', 'Israël', 'Italie', 'Japon', 'Jordanie',
  'Lagos', 'Liban', 'Londres', 'Madrid', 'Maghreb', 'Mali', 'Maroc',
  'Méditerranée', 'Mexique', 'Moyen-Orient', 'Mozambique', 'Mumbai', 'Nairobi', 'New York',
  'Niger', 'Nigéria', 'Océanie', 'Pacifique', 'Pakistan', 'Paris', 'Pays-Bas',
  'Pérou', 'Philippines', 'Proche-Orient', 'Québec', 'République démocratique du Congo', 'Rome',
  'Royaume-Uni', 'Russie', 'Sahel', 'Sahara', 'Sénégal', 'Sri Lanka', 'Suède', 'Suisse',
  'Syrie', 'Tokyo', 'Tunisie', 'Turquie', 'Ukraine', 'Union européenne',
  'Venezuela', 'Viêt Nam', 'Washington',
]

export const NAMED_PERIODS: string[] = [
  'Antiquité', 'Antiquité tardive', 'Préhistoire', 'Néolithique', 'Âge du bronze', 'Âge du fer',
  'Haut Moyen Âge (Ve-Xe s.)', 'Moyen Âge', 'Bas Moyen Âge (XIe-XVe s.)',
  'Renaissance (XVe-XVIe s.)', 'Époque moderne (XVIe-XVIIIe s.)', 'Baroque (XVIIe s.)',
  'Lumières (XVIIIe s.)', 'XVIe siècle', 'XVIIe siècle', 'XVIIIe siècle', 'XIXe siècle', 'XXe siècle', 'XXIe siècle',
  'Révolution française (1789-1799)', 'Révolution industrielle (XIXe s.)',
  'Belle Époque (1871-1914)', 'Première Guerre mondiale (1914-1918)',
  'Entre-deux-guerres (1918-1939)', 'Seconde Guerre mondiale (1939-1945)',
  'Régime de Vichy (1940-1944)', 'Décolonisation (1945-1975)', 'Trente Glorieuses (1945-1975)',
  'Guerre froide (1947-1991)', 'Mai 1968', 'Années 1970', 'Années 1980', 'Années 1990',
  'Guerre d\'Algérie (1954-1962)', 'Indépendances africaines (années 1960)',
  'Chute du mur de Berlin (1989)', 'Post-Guerre froide', 'Ère numérique (depuis 1990)',
  'Début XXIe siècle', 'Crise financière (2008)', 'Pandémie Covid-19 (2020-2022)',
]
