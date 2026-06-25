/**
 * Libellés des valeurs de données (langues, statuts OA). Affichés en français —
 * ce sont des valeurs issues du jeu de données de démo (déjà en français pour
 * les types de publication), pas des chaînes d'interface. L'habillage de la
 * page (titres, axes, KPI) reste internationalisé via Lingui.
 */

export const LANGUAGE_LABELS: Record<string, string> = {
  fr: 'Français',
  en: 'Anglais',
  es: 'Espagnol',
  it: 'Italien',
  de: 'Allemand',
  pl: 'Polonais',
  lv: 'Letton',
  pt: 'Portugais',
  unknown: 'Indéterminée',
}

export function languageLabel(code: string): string {
  return LANGUAGE_LABELS[code] ?? code.toUpperCase()
}

export const OA_LABELS: Record<string, string> = {
  diamond: 'Diamant',
  gold: 'Or (Gold)',
  green: 'Vert (Green)',
  hybrid: 'Hybride',
  bronze: 'Bronze',
  closed: 'Accès fermé',
  unknown: 'Indéterminé',
}

export function oaLabel(status: string): string {
  return OA_LABELS[status] ?? status
}
