'use client'
import { createTheme, Theme } from '@mui/material/styles'
import componentsOverride from './overrides'
import { buildPalettes, colors as defaultColors, DEFAULT_SURFACES } from './palette'
import { BrandPalette, DEFAULT_BRAND } from './brand'
import breakpoints from './breakpoints'
import typography from './typography' // Custom and MUI default
import {
  pxToLineHeight,
  pxToRem,
  pxToThemeSpacing,
  responsiveFontSizes,
} from './utils'

declare module '@mui/material/styles' {
  interface Palette {
    /** Couleur d'établissement d'où découle le thème. */
    brandSeed: string
  }
  interface PaletteOptions {
    brandSeed?: string
  }
}

/**
 * Thèmes clair et sombre. Sans couleur d'établissement, ils reprennent configs/(default|custom)/colors.ts ;
 * avec, les tons et les surfaces viennent de generateBrand().
 */
export function buildThemes(brand?: BrandPalette): { lightTheme: Theme; darkTheme: Theme } {
  const colors = brand ? { ...defaultColors, ...brand.colors } : defaultColors
  const { light, dark } = buildPalettes(colors, brand ? brand.light : DEFAULT_SURFACES)
  const brandSeed = brand?.seed ?? DEFAULT_BRAND

  const lightTheme = createTheme({
    palette: { mode: 'light', ...light, ...colors, brandSeed },
    breakpoints,
    typography,
    utils: { pxToLineHeight, pxToRem, pxToThemeSpacing, responsiveFontSizes },
  })

  const darkTheme = createTheme({
    palette: { mode: 'dark', ...dark, ...colors, brandSeed },
    breakpoints,
    typography,
    utils: { pxToLineHeight, pxToRem, pxToThemeSpacing, responsiveFontSizes },
  })

  darkTheme.components = componentsOverride(darkTheme)
  lightTheme.components = componentsOverride(lightTheme)
  return { lightTheme, darkTheme }
}

const { lightTheme, darkTheme } = buildThemes()

export { lightTheme, darkTheme }
