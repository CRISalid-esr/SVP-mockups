import { OrgRef, PersonRef, PlaceRef } from './types'

// ─── Référentiels simulés pour les repères structurés ────────────────────────
// Petites bases locales filtrées côté client, en remplacement des appels
// GeoNames (lieux) et IdRef (personnes, organisations). Les identifiants sont
// ceux des référentiels réels quand ils sont connus ; les autres sont des
// valeurs de démonstration.

const PLACES: PlaceRef[] = [
  // Grand Ouest (terrains du profil de démonstration)
  { label: 'Bretagne', geonamesId: 3030293, detail: 'Région' },
  { label: 'Pays de la Loire', geonamesId: 2988430, detail: 'Région' },
  { label: 'Nouvelle-Aquitaine', geonamesId: 11071620, detail: 'Région' },
  { label: 'Normandie', geonamesId: 11071621, detail: 'Région' },
  { label: 'Finistère', geonamesId: 3018471, detail: 'Département' },
  { label: 'Côtes-d’Armor', geonamesId: 3023414, detail: 'Département' },
  { label: 'Morbihan', geonamesId: 2993370, detail: 'Département' },
  { label: 'Ille-et-Vilaine', geonamesId: 3012804, detail: 'Département' },
  { label: 'Loire-Atlantique', geonamesId: 2997861, detail: 'Département' },
  { label: 'Vendée', geonamesId: 2970140, detail: 'Département' },
  { label: 'Charente-Maritime', geonamesId: 3027159, detail: 'Département' },
  { label: 'Maine-et-Loire', geonamesId: 2996268, detail: 'Département' },
  { label: 'Mayenne', geonamesId: 2994111, detail: 'Département' },
  { label: 'Sarthe', geonamesId: 2975517, detail: 'Département' },
  { label: 'Nantes', geonamesId: 2990969, detail: 'Ville' },
  { label: 'Saint-Nazaire', geonamesId: 2980291, detail: 'Ville' },
  { label: 'Rennes', geonamesId: 2983990, detail: 'Ville' },
  { label: 'Brest', geonamesId: 3030300, detail: 'Ville' },
  { label: 'Lorient', geonamesId: 2997577, detail: 'Ville' },
  { label: 'Quimper', geonamesId: 2984701, detail: 'Ville' },
  { label: 'Vannes', geonamesId: 2970777, detail: 'Ville' },
  { label: 'Angers', geonamesId: 3037656, detail: 'Ville' },
  { label: 'Le Mans', geonamesId: 2997581, detail: 'Ville' },
  { label: 'La Rochelle', geonamesId: 3006787, detail: 'Ville' },
  { label: 'La Roche-sur-Yon', geonamesId: 2977963, detail: 'Ville' },
  { label: 'Littoral atlantique', detail: 'Littoral' },
  { label: 'Estuaire de la Loire', detail: 'Espace naturel' },
  { label: 'Centre-Bretagne', detail: 'Espace rural' },
  { label: 'Marais poitevin', detail: 'Espace naturel' },
  { label: 'Île d’Yeu', geonamesId: 3013092, detail: 'Île' },
  { label: 'Belle-Île-en-Mer', geonamesId: 3034720, detail: 'Île' },
  // France et Europe
  { label: 'France', geonamesId: 3017382, detail: 'Pays' },
  { label: 'Paris', geonamesId: 2988507, detail: 'Ville' },
  { label: 'Lyon', geonamesId: 2996944, detail: 'Ville' },
  { label: 'Marseille', geonamesId: 2995469, detail: 'Ville' },
  { label: 'Lille', geonamesId: 2998324, detail: 'Ville' },
  { label: 'Bordeaux', geonamesId: 3031582, detail: 'Ville' },
  { label: 'Toulouse', geonamesId: 2972315, detail: 'Ville' },
  { label: 'Strasbourg', geonamesId: 2973783, detail: 'Ville' },
  { label: 'Massif central', geonamesId: 2994811, detail: 'Massif' },
  { label: 'Alpes', geonamesId: 2661786, detail: 'Massif' },
  { label: 'Pyrénées', geonamesId: 2984927, detail: 'Massif' },
  { label: 'Corse', geonamesId: 3023518, detail: 'Région' },
  { label: 'Outre-mer français', detail: 'Ensemble de territoires' },
  { label: 'La Réunion', geonamesId: 935317, detail: 'Département' },
  { label: 'Guadeloupe', geonamesId: 3579143, detail: 'Département' },
  { label: 'Belgique', geonamesId: 2802361, detail: 'Pays' },
  { label: 'Royaume-Uni', geonamesId: 2635167, detail: 'Pays' },
  { label: 'Espagne', geonamesId: 2510769, detail: 'Pays' },
  { label: 'Portugal', geonamesId: 2264397, detail: 'Pays' },
  { label: 'Italie', geonamesId: 3175395, detail: 'Pays' },
  { label: 'Allemagne', geonamesId: 2921044, detail: 'Pays' },
  { label: 'Pays-Bas', geonamesId: 2750405, detail: 'Pays' },
  { label: 'Suède', geonamesId: 2661886, detail: 'Pays' },
  { label: 'Québec', geonamesId: 6115047, detail: 'Province' },
  { label: 'Union européenne', detail: 'Organisation régionale' },
  { label: 'Europe', geonamesId: 6255148, detail: 'Continent' },
  { label: 'Méditerranée', geonamesId: 363196, detail: 'Mer' },
  // Monde
  { label: 'Maghreb', detail: 'Région du monde' },
  { label: 'Maroc', geonamesId: 2542007, detail: 'Pays' },
  { label: 'Tunisie', geonamesId: 2464461, detail: 'Pays' },
  { label: 'Sénégal', geonamesId: 2245662, detail: 'Pays' },
  { label: 'Afrique de l’Ouest', detail: 'Région du monde' },
  { label: 'Afrique subsaharienne', detail: 'Région du monde' },
  { label: 'Sahel', detail: 'Région du monde' },
  { label: 'Brésil', geonamesId: 3469034, detail: 'Pays' },
  { label: 'Chili', geonamesId: 3895114, detail: 'Pays' },
  { label: 'Mexique', geonamesId: 3996063, detail: 'Pays' },
  { label: 'États-Unis', geonamesId: 6252001, detail: 'Pays' },
  { label: 'Canada', geonamesId: 6251999, detail: 'Pays' },
  { label: 'Japon', geonamesId: 1861060, detail: 'Pays' },
  { label: 'Chine', geonamesId: 1814991, detail: 'Pays' },
  { label: 'Inde', geonamesId: 1269750, detail: 'Pays' },
  { label: 'Viêt Nam', geonamesId: 1562822, detail: 'Pays' },
  { label: 'Liban', geonamesId: 272103, detail: 'Pays' },
  { label: 'Moyen-Orient', detail: 'Région du monde' },
  { label: 'Asie du Sud-Est', detail: 'Région du monde' },
  { label: 'Amérique latine', detail: 'Région du monde' },
]

const PERSONS: PersonRef[] = [
  { label: 'Bourdieu, Pierre', ppn: '034770313', dates: '1930-2002' },
  { label: 'Foucault, Michel', ppn: '026816539', dates: '1926-1984' },
  { label: 'Lefebvre, Henri', ppn: '026981637', dates: '1901-1991' },
  { label: 'Latour, Bruno', ppn: '028786300', dates: '1947-2022' },
  { label: 'Dewey, John', ppn: '034119280', dates: '1859-1952' },
  { label: 'Morin, Edgar', ppn: '027290638', dates: '1921-' },
  { label: 'Sayad, Abdelmalek', ppn: '033975051', dates: '1933-1998' },
  { label: 'Agier, Michel', ppn: '040894266', dates: '1953-' },
  { label: 'Mauss, Marcel', ppn: '077490878', dates: '1872-1950' },
  { label: 'Lévi-Strauss, Claude', ppn: '026857960', dates: '1908-2009' },
  { label: 'Wacquant, Loïc', ppn: '034827706', dates: '1960-' },
  { label: 'Lahire, Bernard', ppn: '041352963', dates: '1963-' },
  { label: 'Fassin, Didier', ppn: '033149372', dates: '1955-' },
  { label: 'Boltanski, Luc', ppn: '028846613', dates: '1940-' },
  { label: 'Touraine, Alain', ppn: '028905628', dates: '1925-2023' },
  { label: 'Noiriel, Gérard', ppn: '035481773', dates: '1950-' },
  { label: 'Habermas, Jürgen', ppn: '026881748', dates: '1929-' },
  { label: 'Arendt, Hannah', ppn: '027063631', dates: '1906-1975' },
  { label: 'Héritier, Françoise', ppn: '039148041', dates: '1933-2017' },
  { label: 'Freire, Paulo', ppn: '026871297', dates: '1921-1997' },
  { label: 'Jacobs, Jane', ppn: '031688012', dates: '1916-2006' },
  { label: 'Harvey, David', ppn: '026917602', dates: '1935-' },
  { label: 'Sassen, Saskia', ppn: '030770149', dates: '1947-' },
  { label: 'Castells, Manuel', ppn: '026773422', dates: '1942-' },
  { label: 'Elias, Norbert', ppn: '026846934', dates: '1897-1990' },
  { label: 'Halbwachs, Maurice', ppn: '026913283', dates: '1877-1945' },
  { label: 'Simmel, Georg', ppn: '027134237', dates: '1858-1918' },
  { label: 'Ostrom, Elinor', ppn: '032040083', dates: '1933-2012' },
  { label: 'Sen, Amartya', ppn: '027128806', dates: '1933-' },
  { label: 'Beck, Ulrich', ppn: '028707532', dates: '1944-2015' },
]

const ORGANIZATIONS: OrgRef[] = [
  { label: 'Centre national de la recherche scientifique (CNRS)', ppn: '026399334', detail: 'France' },
  { label: 'École des hautes études en sciences sociales (EHESS)', ppn: '026781778', detail: 'Paris, France' },
  { label: 'Institut national de la santé et de la recherche médicale (Inserm)', ppn: '032143079', detail: 'France' },
  { label: 'Institut national d’études démographiques (INED)', ppn: '026403722', detail: 'Aubervilliers, France' },
  { label: 'Institut de recherche pour le développement (IRD)', ppn: '040017079', detail: 'Marseille, France' },
  { label: 'Institut national de la statistique et des études économiques (INSEE)', ppn: '033155291', detail: 'Paris, France' },
  { label: 'Institut national de recherche pour l’agriculture, l’alimentation et l’environnement (INRAE)', ppn: '243726376', detail: 'France' },
  { label: 'Caisse nationale de solidarité pour l’autonomie (CNSA)', ppn: '112263054', detail: 'Paris, France' },
  { label: 'Caisse nationale d’assurance vieillesse (CNAV)', ppn: '026365278', detail: 'Paris, France' },
  { label: 'Agence nationale de l’habitat (ANAH)', ppn: '026355248', detail: 'Paris, France' },
  { label: 'Union sociale pour l’habitat (USH)', ppn: '034514990', detail: 'Paris, France' },
  { label: 'Agence de la transition écologique (ADEME)', ppn: '029262895', detail: 'Angers, France' },
  { label: 'Cerema', ppn: '178196635', detail: 'Bron, France' },
  { label: 'Agence nationale de la cohésion des territoires (ANCT)', ppn: '243040520', detail: 'Paris, France' },
  { label: 'Fondation de France', ppn: '026373475', detail: 'Paris, France' },
  { label: 'Fondation Abbé Pierre', ppn: '034457666', detail: 'Paris, France' },
  { label: 'Nantes Métropole', ppn: '069514879', detail: 'Nantes, France' },
  { label: 'Rennes Métropole', ppn: '059858990', detail: 'Rennes, France' },
  { label: 'Région Bretagne', ppn: '026393387', detail: 'Rennes, France' },
  { label: 'Région Pays de la Loire', ppn: '026394014', detail: 'Nantes, France' },
  { label: 'Conservatoire du littoral', ppn: '026377861', detail: 'Rochefort, France' },
  { label: 'Nantes Université', ppn: '259608068', detail: 'Nantes, France' },
  { label: 'Université Rennes 2', ppn: '026404001', detail: 'Rennes, France' },
  { label: 'Université Paris 1 Panthéon-Sorbonne', ppn: '027261646', detail: 'Paris, France' },
  { label: 'Sciences Po', ppn: '027362027', detail: 'Paris, France' },
  { label: 'Organisation mondiale de la santé (OMS)', ppn: '028404098', detail: 'Genève, International' },
  { label: 'Organisation des Nations Unies pour l’éducation, la science et la culture (UNESCO)', ppn: '027248445', detail: 'Paris, International' },
  { label: 'Banque mondiale', ppn: '026403536', detail: 'Washington, International' },
  { label: 'Commission européenne', ppn: '026375176', detail: 'Bruxelles, International' },
  { label: 'Haut Commissariat des Nations Unies pour les réfugiés (HCR)', ppn: '028404033', detail: 'Genève, International' },
]

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

function matches(query: string, ...fields: (string | undefined)[]): boolean {
  const q = normalize(query)
  return fields.some((f) => f && normalize(f).includes(q))
}

export function searchPlaces(query: string): PlaceRef[] {
  if (query.trim().length < 2) return []
  return PLACES.filter((p) => matches(query, p.label, p.detail)).slice(0, 8)
}

export function searchPersons(query: string): PersonRef[] {
  if (query.trim().length < 2) return []
  return PERSONS.filter((p) => matches(query, p.label)).slice(0, 8)
}

export function searchOrganizations(query: string): OrgRef[] {
  if (query.trim().length < 2) return []
  return ORGANIZATIONS.filter((o) => matches(query, o.label, o.detail)).slice(0, 8)
}

/** Lieux proposés d'après les mots-clés et la description (suggestion simulée). */
export function suggestedPlaces(text: string, current: PlaceRef[]): PlaceRef[] {
  const present = new Set(current.map((p) => normalize(p.label)))
  const t = normalize(text)
  return PLACES.filter((p) => !present.has(normalize(p.label)) && t.includes(normalize(p.label))).slice(0, 4)
}
