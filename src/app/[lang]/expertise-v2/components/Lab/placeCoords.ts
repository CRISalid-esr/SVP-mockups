import { PlaceRef } from '../../types'

// ─── Coordonnées des terrains (carte du laboratoire) ─────────────────────────
// En production, GeoNames fournit latitude/longitude avec la notice ; ici une
// table locale, indexée par identifiant GeoNames puis par libellé pour les
// espaces sans notice (littoral, pays intérieur…). [latitude, longitude].

export type LatLon = [number, number]

const BY_GEONAMES: Record<number, LatLon> = {
  3030293: [48.2, -2.9],      // Bretagne
  2988430: [47.5, -0.8],      // Pays de la Loire
  11071620: [45.2, 0.2],      // Nouvelle-Aquitaine
  11071621: [49.1, 0.3],      // Normandie
  3018471: [48.3, -4.1],      // Finistère
  3023414: [48.4, -2.9],      // Côtes-d'Armor
  2993370: [47.8, -2.8],      // Morbihan
  3012804: [48.2, -1.6],      // Ille-et-Vilaine
  2997861: [47.3, -1.7],      // Loire-Atlantique
  2970140: [46.7, -1.4],      // Vendée
  3027159: [45.8, -0.8],      // Charente-Maritime
  2996268: [47.4, -0.5],      // Maine-et-Loire
  2994111: [48.1, -0.7],      // Mayenne
  2975517: [47.9, 0.2],       // Sarthe
  2990969: [47.218, -1.553],  // Nantes
  2980291: [47.273, -2.213],  // Saint-Nazaire
  2983990: [48.117, -1.678],  // Rennes
  3030300: [48.39, -4.49],    // Brest
  2997577: [47.748, -3.37],   // Lorient
  2984701: [47.996, -4.098],  // Quimper
  2970777: [47.658, -2.76],   // Vannes
  3037656: [47.474, -0.554],  // Angers
  2997581: [48.0, 0.2],       // Le Mans
  3006787: [46.16, -1.15],    // La Rochelle
  2977963: [46.67, -1.43],    // La Roche-sur-Yon
  3013092: [46.72, -2.35],    // Île d'Yeu
  3034720: [47.33, -3.17],    // Belle-Île-en-Mer
  3017382: [46.6, 2.3],       // France
  2988507: [48.857, 2.352],   // Paris
  2996944: [45.76, 4.84],     // Lyon
  2995469: [43.3, 5.37],      // Marseille
  2998324: [50.63, 3.06],     // Lille
  3031582: [44.84, -0.58],    // Bordeaux
  2972315: [43.6, 1.44],      // Toulouse
  2973783: [48.58, 7.75],     // Strasbourg
  2994811: [45.3, 3.0],       // Massif central
  2661786: [45.9, 7.0],       // Alpes
  2984927: [42.7, 0.5],       // Pyrénées
  3023518: [42.1, 9.1],       // Corse
  935317: [-21.1, 55.5],      // La Réunion
  3579143: [16.25, -61.58],   // Guadeloupe
  2802361: [50.8, 4.4],       // Belgique
  2635167: [52.5, -1.5],      // Royaume-Uni
  2510769: [40.4, -3.7],      // Espagne
  2264397: [39.5, -8.0],      // Portugal
  3175395: [42.5, 12.5],      // Italie
  2921044: [51.2, 10.4],      // Allemagne
  2750405: [52.2, 5.3],       // Pays-Bas
  2661886: [60.1, 18.6],      // Suède
  6115047: [52.0, -72.0],     // Québec
  6255148: [50.0, 10.0],      // Europe
  363196: [36.0, 18.0],       // Méditerranée
  2542007: [31.8, -7.1],      // Maroc
  2464461: [34.0, 9.5],       // Tunisie
  2245662: [14.5, -14.5],     // Sénégal
  3469034: [-10.0, -55.0],    // Brésil
  3895114: [-35.7, -71.5],    // Chili
  3996063: [23.6, -102.5],    // Mexique
  6252001: [39.8, -98.6],     // États-Unis
  6251999: [56.1, -106.3],    // Canada
  1861060: [36.2, 138.3],     // Japon
  1814991: [35.9, 104.2],     // Chine
  1269750: [20.6, 79.0],      // Inde
  1562822: [14.1, 108.3],     // Viêt Nam
  272103: [33.9, 35.9],       // Liban
}

const BY_LABEL: Record<string, LatLon> = {
  'littoral atlantique': [46.9, -2.0],
  'estuaire de la loire': [47.28, -1.95],
  'centre-bretagne': [48.2, -3.2],
  'marais poitevin': [46.35, -0.85],
  'outre-mer francais': [5.0, -53.0],
  'maghreb': [31.0, 2.0],
  'afrique de l’ouest': [12.0, -5.0],
  'afrique subsaharienne': [5.0, 20.0],
  'sahel': [15.0, 5.0],
  'moyen-orient': [29.0, 42.0],
  'asie du sud-est': [10.0, 106.0],
  'amerique latine': [-15.0, -60.0],
  'union europeenne': [50.0, 10.0],
}

function norm(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

export function coordsOf(place: PlaceRef): LatLon | undefined {
  if (place.geonamesId && BY_GEONAMES[place.geonamesId]) return BY_GEONAMES[place.geonamesId]
  return BY_LABEL[norm(place.label)]
}

/** Les régions, départements et pays sont dessinés plus larges et plus clairs que les villes. */
export function isArea(place: PlaceRef): boolean {
  return /^(r[ée]gion|d[ée]partement|pays|massif|continent|mer|province|espace|littoral|r[ée]gion du monde|ensemble)/i.test(place.detail ?? '')
}
