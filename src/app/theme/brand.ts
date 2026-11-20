/**
 * Couleur d'établissement — version réduite de theme/brand.ts de la branche refonte-design.
 *
 * Les écrans repris de la refonte (Profil recherche v3, Activités de recherche) écrivent la
 * couleur sous forme de variables CSS. Ici, aucune n'est posée sur :root : chaque variable
 * porte donc sa valeur par défaut (le sarcelle de SoVisu+).
 */

export const DEFAULT_BRAND = '#006a61'

export const BRAND = `var(--svp-brand, ${DEFAULT_BRAND})`
/** Fond pâle de la couleur d'établissement (puces, sélection). */
export const BRAND_TINT = 'var(--svp-brand-tint, #e8f5f4)'
/** Variante plus foncée, pour le survol d'un bouton plein. */
export const BRAND_STRONG = 'var(--svp-brand-strong, #004d46)'
/** La couleur d'établissement à une opacité donnée (0-100). */
export const brandMix = (percent: number) => `color-mix(in srgb, ${BRAND} ${Math.round(percent)}%, transparent)`

/**
 * Une couleur à une opacité donnée en deux chiffres hexadécimaux (`'1a'` ≈ 10 %), qu'elle
 * soit écrite en hex (#rrggbb) ou sous forme de variable CSS.
 */
export function withAlpha(color: string, alphaHex: string): string {
  if (color.startsWith('#') && color.length === 7) return `${color}${alphaHex}`
  return `color-mix(in srgb, ${color} ${Math.round(parseInt(alphaHex, 16) / 2.55)}%, transparent)`
}

/** Valeur effective d'une variable CSS de couleur, pour les bibliothèques qui l'écrivent en attribut (Leaflet). */
export function resolveColor(color: string): string {
  const m = /^var\((--[\w-]+)(?:,\s*([^)]+))?\)$/.exec(color)
  if (!m) return color
  const fallback = m[2]?.trim() || DEFAULT_BRAND
  if (typeof window === 'undefined') return fallback
  return getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim() || fallback
}
