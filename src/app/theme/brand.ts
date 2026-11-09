import { argbFromHex, CorePalette, Hct, hexFromArgb, TonalPalette } from '@material/material-color-utilities'

/**
 * Couleur d'établissement : une seule couleur choisie, toutes les autres en découlent.
 *
 * La génération repose sur la bibliothèque de Material Design (espace HCT, où la clarté
 * « tone » est fiable quelle que soit la teinte) : c'est elle qui produit le fichier
 * configs/default/colors.ts à partir du sarcelle de SoVisu+. On garde la couleur choisie
 * telle quelle quand elle reste lisible sur fond blanc ; sinon on l'assombrit ou on
 * l'éclaircit jusqu'à la clarté la plus proche qui l'est, et on le signale.
 */

export const DEFAULT_BRAND = '#006a61'

/** Variables CSS posées sur :root par ThemeProvider, pour les écrans qui n'utilisent pas le thème MUI. */
export const BRAND = 'var(--svp-brand)'
/** Fond pâle de la couleur d'établissement (puces, sélection). */
export const BRAND_TINT = 'var(--svp-brand-tint)'
/** Variante plus foncée, pour le survol d'un bouton plein. */
export const BRAND_STRONG = 'var(--svp-brand-strong)'
/** La couleur d'établissement à une opacité donnée (0-100). */
export const brandMix = (percent: number) => `color-mix(in srgb, ${BRAND} ${Math.round(percent)}%, transparent)`

const normalize = (hex: string) => {
  const h = hex.trim().toLowerCase()
  if (/^#[0-9a-f]{3}$/.test(h)) return `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`
  return h
}

export const isValidHex = (hex: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex.trim())
export const isDefaultBrand = (hex: string) => normalize(hex) === DEFAULT_BRAND

// ─── Contraste (WCAG 2) ─────────────────────────────────────────────────────

const channel = (c: number) => {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
const luminance = (hex: string) => {
  const n = parseInt(normalize(hex).slice(1), 16)
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
}
export const contrastRatio = (a: string, b: string) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

// ─── Génération ─────────────────────────────────────────────────────────────

/** Les clés de configs/default/colors.ts, avec la clarté (tone) que porte leur suffixe. */
const TONAL_KEYS: Record<string, number[]> = {
  primary: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100],
  secondary: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100],
  tertiary: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100],
  neutral: [0, 4, 6, 10, 12, 17, 20, 22, 24, 30, 40, 50, 60, 70, 80, 87, 90, 92, 94, 95, 96, 98, 99, 100],
  neutralVariant: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100],
}

export interface BrandPalette {
  /** Couleur saisie. */
  seed: string
  /** Couleur d'action en mode clair : la couleur saisie, ou sa version lisible. */
  main: string
  /** Couleur d'action en mode sombre. */
  mainDark: string
  /** Vrai quand la couleur saisie a dû être ajustée pour rester lisible. */
  adjusted: boolean
  /** Contraste de `main` sur blanc. */
  contrast: number
  /** Valeurs à substituer dans configs/default/colors.ts. */
  colors: Record<string, string>
  /** Surfaces et encres du mode clair, légèrement teintées par la couleur. */
  light: { background: string; paper: string; text: string; textSecondary: string; divider: string; navHover: string; navActive: string }
  /** Variables CSS --svp-brand*, par mode. */
  css: { light: Record<string, string>; dark: Record<string, string> }
}

/** Clarté la plus proche qui garde 4,5:1 sur blanc pour un texte ou un bouton. */
const READABLE_TONES = { min: 25, max: 48 }

export function generateBrand(input: string): BrandPalette {
  const seed = isValidHex(input) ? normalize(input) : DEFAULT_BRAND
  const argb = argbFromHex(seed)
  const hct = Hct.fromInt(argb)
  const core = CorePalette.of(argb)
  // La teinte et la saturation choisies, sans la saturation minimale que CorePalette impose.
  const own = TonalPalette.fromHueAndChroma(hct.hue, Math.max(hct.chroma, 16))
  const tone = (p: TonalPalette, t: number) => hexFromArgb(p.tone(t))

  const fitsTone = hct.tone >= READABLE_TONES.min && hct.tone <= READABLE_TONES.max
  let main = fitsTone ? seed : tone(own, hct.tone > READABLE_TONES.max ? 40 : 30)
  if (contrastRatio(main, '#ffffff') < 4.5) main = tone(own, 38)
  const adjusted = main !== seed

  const palettes: Record<string, TonalPalette> = {
    primary: own,
    secondary: core.a2,
    tertiary: core.a3,
    neutral: TonalPalette.fromHueAndChroma(hct.hue, 4),
    neutralVariant: TonalPalette.fromHueAndChroma(hct.hue, 8),
  }
  const colors: Record<string, string> = {}
  for (const [name, tones] of Object.entries(TONAL_KEYS)) {
    for (const t of tones) colors[`${name}${t}`] = tone(palettes[name], t)
  }
  colors.primary40 = main
  const ink = TonalPalette.fromHueAndChroma(hct.hue, 6)
  const tint = TonalPalette.fromHueAndChroma(hct.hue, 10)
  colors.cardBorder = tone(ink, 92)
  colors.lightSecondaryContainer = tone(core.a2, 90)
  colors.sidebarItemHover = tone(own, 50)

  const mainDark = tone(own, 80)
  return {
    seed,
    main,
    mainDark,
    adjusted,
    contrast: contrastRatio(main, '#ffffff'),
    colors,
    light: {
      background: tone(TonalPalette.fromHueAndChroma(hct.hue, 2), 99),
      paper: '#ffffff',
      text: tone(ink, 18),
      textSecondary: tone(ink, 42),
      divider: tone(ink, 92),
      navHover: tone(ink, 97),
      navActive: tone(tint, 94),
    },
    css: {
      light: { '--svp-brand': main, '--svp-brand-tint': tone(tint, 95), '--svp-brand-strong': tone(own, 30) },
      dark: { '--svp-brand': mainDark, '--svp-brand-tint': tone(own, 20), '--svp-brand-strong': tone(own, 90) },
    },
  }
}

/** Variables CSS du sarcelle par défaut (identiques aux valeurs écrites jusqu'ici). */
export const DEFAULT_BRAND_CSS = {
  light: { '--svp-brand': '#006a61', '--svp-brand-tint': '#e8f5f4', '--svp-brand-strong': '#004d46' },
  dark: { '--svp-brand': '#84d5ca', '--svp-brand-tint': '#003732', '--svp-brand-strong': '#b3fff3' },
}

/** Tons d'une teinte, pour les graphiques (palettes ordinale et séquentielle). */
export function brandTones(input: string, tones: number[], minChroma = 40): string[] {
  const hct = Hct.fromInt(argbFromHex(isValidHex(input) ? normalize(input) : DEFAULT_BRAND))
  const palette = TonalPalette.fromHueAndChroma(hct.hue, Math.max(hct.chroma, minChroma))
  return tones.map((t) => hexFromArgb(palette.tone(t)))
}

/** Couleurs dominantes d'une image (logo), dans l'ordre de pertinence de Material. */
export { QuantizerCelebi, Score, argbFromHex, hexFromArgb } from '@material/material-color-utilities'

/**
 * Une couleur à une opacité donnée en deux chiffres hexadécimaux (`'1a'` ≈ 10 %), qu'elle
 * soit écrite en hex (#rrggbb) ou sous forme de variable CSS (var(--svp-brand)).
 */
export function withAlpha(color: string, alphaHex: string): string {
  if (color.startsWith('#') && color.length === 7) return `${color}${alphaHex}`
  return `color-mix(in srgb, ${color} ${Math.round(parseInt(alphaHex, 16) / 2.55)}%, transparent)`
}

/** Valeur effective d'une variable CSS de couleur, pour les bibliothèques qui l'écrivent en attribut (Leaflet). */
export function resolveColor(color: string): string {
  const m = /^var\((--[\w-]+)\)$/.exec(color)
  if (!m || typeof window === 'undefined') return color
  return getComputedStyle(document.documentElement).getPropertyValue(m[1]).trim() || DEFAULT_BRAND
}
