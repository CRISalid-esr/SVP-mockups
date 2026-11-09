'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  ReactNode,
} from 'react'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import GlobalStyles from '@mui/material/GlobalStyles'
import { lightTheme, darkTheme, buildThemes } from '@/app/theme/theme'
import { DEFAULT_BRAND, DEFAULT_BRAND_CSS, generateBrand, isDefaultBrand, isValidHex } from '@/app/theme/brand'

/** Couleur d'établissement choisie dans la page Apparence (maquette : conservée dans le navigateur). */
export const BRAND_STORAGE_KEY = 'svp-brand-color-v1'

// theme enum
export enum ThemeMode {
  light = 'light',
  dark = 'dark',
  system = 'system',
}

export type ThemeModeType = 'light' | 'dark' | 'system'

interface ThemeContextType {
  setTheme: (theme: ThemeModeType) => void
  currentTheme: ThemeModeType
  resolvedTheme: 'light' | 'dark'
  /** Couleur d'établissement (hex). */
  brandColor: string
  setBrandColor: (hex: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useThemeContext = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeModeType>('light')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  const [brandColor, setBrandColorState] = useState<string>(DEFAULT_BRAND)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(BRAND_STORAGE_KEY)
      if (saved && isValidHex(saved)) setBrandColorState(saved)
    } catch {
      // stockage indisponible : couleur par défaut
    }
  }, [])

  const setBrandColor = useCallback((hex: string) => {
    if (!isValidHex(hex)) return
    setBrandColorState(hex)
    try {
      if (isDefaultBrand(hex)) localStorage.removeItem(BRAND_STORAGE_KEY)
      else localStorage.setItem(BRAND_STORAGE_KEY, hex)
    } catch {
      // stockage indisponible : le choix vaut pour la session
    }
  }, [])

  const brand = useMemo(() => (isDefaultBrand(brandColor) ? null : generateBrand(brandColor)), [brandColor])
  const themes = useMemo(() => (brand ? buildThemes(brand) : { lightTheme, darkTheme }), [brand])

  // Update resolved theme based on system preference or user selection
  useEffect(() => {
    const handleSystemThemeChange = () => {
      if (currentTheme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setResolvedTheme(isDark ? 'dark' : 'light')
      }
    }

    handleSystemThemeChange() // Initialize on mount

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', handleSystemThemeChange)

    return () =>
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }, [currentTheme])

  // Persist theme preference in localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-mode') as ThemeMode
    if (savedTheme) {
      setCurrentTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('theme-mode', currentTheme)
    if (currentTheme !== 'system') {
      setResolvedTheme(currentTheme)
    }
  }, [currentTheme])


  const setTheme = (theme: ThemeModeType) => {
    setCurrentTheme(theme)
  }

  const theme = resolvedTheme === ThemeMode.light ? themes.lightTheme : themes.darkTheme
  const brandVars = brand ? brand.css[resolvedTheme] : DEFAULT_BRAND_CSS[resolvedTheme]

  return (
    <ThemeContext.Provider
      value={{
        setTheme,
        currentTheme,
        resolvedTheme,
        brandColor,
        setBrandColor,
      }}
    >
      <MuiThemeProvider theme={theme}>
        <GlobalStyles styles={{ ':root': brandVars }} />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
