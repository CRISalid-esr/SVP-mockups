import { StudiedPeriod } from './types'

// ─── Périodes nommées (référentiel simulé) ───────────────────────────────────
// En production : PeriodO (https://perio.do) ou les autorités chronologiques
// RAMEAU. Ici, une liste locale reprise de la v1, complétée de bornes datées
// pour pouvoir situer et comparer les périodes. Années négatives = av. J.-C.

export const NAMED_PERIODS: StudiedPeriod[] = [
  { label: 'Préhistoire', yearFrom: -3000000, yearTo: -3300 },
  { label: 'Paléolithique', yearFrom: -3000000, yearTo: -12000 },
  { label: 'Mésolithique', yearFrom: -12000, yearTo: -6000 },
  { label: 'Néolithique', yearFrom: -6000, yearTo: -2200 },
  { label: 'Âge du bronze', yearFrom: -2200, yearTo: -800 },
  { label: 'Âge du fer', yearFrom: -800, yearTo: -50 },
  { label: 'Antiquité', yearFrom: -3300, yearTo: 476 },
  { label: 'Grèce classique', yearFrom: -510, yearTo: -323 },
  { label: 'Rome républicaine', yearFrom: -509, yearTo: -27 },
  { label: 'Empire romain', yearFrom: -27, yearTo: 476 },
  { label: 'Antiquité tardive', yearFrom: 284, yearTo: 641 },
  { label: 'Moyen Âge', yearFrom: 476, yearTo: 1492 },
  { label: 'Haut Moyen Âge', yearFrom: 476, yearTo: 1000 },
  { label: 'Bas Moyen Âge', yearFrom: 1000, yearTo: 1492 },
  { label: 'Renaissance', yearFrom: 1400, yearTo: 1600 },
  { label: 'Époque moderne', yearFrom: 1492, yearTo: 1789 },
  { label: 'Lumières', yearFrom: 1715, yearTo: 1789 },
  { label: 'XVIe siècle', yearFrom: 1501, yearTo: 1600 },
  { label: 'XVIIe siècle', yearFrom: 1601, yearTo: 1700 },
  { label: 'XVIIIe siècle', yearFrom: 1701, yearTo: 1800 },
  { label: 'Révolution française', yearFrom: 1789, yearTo: 1799 },
  { label: 'XIXe siècle', yearFrom: 1801, yearTo: 1900 },
  { label: 'Révolution industrielle', yearFrom: 1780, yearTo: 1880 },
  { label: 'Belle Époque', yearFrom: 1871, yearTo: 1914 },
  { label: 'XXe siècle', yearFrom: 1901, yearTo: 2000 },
  { label: 'Première Guerre mondiale', yearFrom: 1914, yearTo: 1918 },
  { label: 'Entre-deux-guerres', yearFrom: 1918, yearTo: 1939 },
  { label: 'Seconde Guerre mondiale', yearFrom: 1939, yearTo: 1945 },
  { label: 'Régime de Vichy', yearFrom: 1940, yearTo: 1944 },
  { label: 'Trente Glorieuses', yearFrom: 1945, yearTo: 1975 },
  { label: 'Reconstruction', yearFrom: 1944, yearTo: 1958 },
  { label: 'Décolonisation', yearFrom: 1945, yearTo: 1975 },
  { label: 'Guerre d’Algérie', yearFrom: 1954, yearTo: 1962 },
  { label: 'Guerre froide', yearFrom: 1947, yearTo: 1991 },
  { label: 'Mai 1968', yearFrom: 1968, yearTo: 1968 },
  { label: 'Années 1970', yearFrom: 1970, yearTo: 1979 },
  { label: 'Années 1980', yearFrom: 1980, yearTo: 1989 },
  { label: 'Années 1990', yearFrom: 1990, yearTo: 1999 },
  { label: 'XXIe siècle', yearFrom: 2001 },
  { label: 'Crise financière de 2008', yearFrom: 2007, yearTo: 2009 },
  { label: 'Pandémie de Covid-19', yearFrom: 2020, yearTo: 2022 },
  { label: 'Période contemporaine', yearFrom: 1789 },
]

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

export function searchPeriods(query: string, exclude: StudiedPeriod[] = []): StudiedPeriod[] {
  const q = normalize(query)
  const taken = new Set(exclude.map((p) => normalize(p.label)))
  return NAMED_PERIODS
    .filter((p) => !taken.has(normalize(p.label)))
    .filter((p) => !q || normalize(p.label).includes(q))
    .slice(0, 10)
}
