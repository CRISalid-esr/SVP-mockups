'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { IAgent } from '@/types/IAgent'
import { StructureLevel, structureLevelOf } from './usePerspectiveScope'
import * as Lingui from '@lingui/core'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'

const RECENTS_KEY = 'svp-recent-perspectives'
const MAX_RECENTS = 5

/** Pages qui savent afficher une autre perspective que la sienne. */
const PERSPECTIVE_AWARE = /^\/[a-z]{2}\/(documents|dashboard|expertise|expertise-v2|research-activities)(\/|$)/

export type PerspectiveKind = 'person' | 'structure'

/** Forme minimale d'une perspective, suffisante pour l'afficher et y naviguer. */
export interface PerspectiveEntry {
  slug: string
  kind: PerspectiveKind
  label: string
  sublabel?: string
  /** Structures seulement : section du moteur de recherche. */
  level?: StructureLevel
}

export const toEntry = (agent: IAgent): PerspectiveEntry | null => {
  if (!agent.slug) return null
  const name = agent.getDisplayName(Lingui.i18n.locale as ExtendedLanguageCode)
  if (agent.type === 'person') {
    return {
      slug: agent.slug,
      kind: 'person',
      label: name,
      sublabel: agent.membershipAcronyms.join(', ') || undefined,
    }
  }
  // Structure : le sigle est plus court et plus parlant ; le nom complet passe en second.
  const acronym = agent.membershipAcronyms[0]
  return {
    slug: agent.slug,
    kind: 'structure',
    level: structureLevelOf(agent.uid),
    label: acronym ?? name,
    sublabel: acronym && acronym !== name ? name : undefined,
  }
}

const readRecents = (): PerspectiveEntry[] => {
  try {
    const raw = localStorage.getItem(RECENTS_KEY)
    return raw ? (JSON.parse(raw) as PerspectiveEntry[]) : []
  } catch {
    return []
  }
}

/**
 * Navigation entre perspectives : change le paramètre `perspective` de l'URL,
 * mémorise les perspectives récentes et, sur une page qui ne gère pas
 * les perspectives, emmène vers le tableau de bord au lieu de bloquer.
 */
export const usePerspectiveNavigation = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [recents, setRecents] = useState<PerspectiveEntry[]>([])

  useEffect(() => setRecents(readRecents()), [])

  const targetPath = useCallback(() => {
    const lang = pathname.split('/')[1] || 'fr'
    // Fiche document : on revient à la liste, la fiche appartient à l'ancienne perspective.
    const detail = pathname.match(/^\/([a-z]{2})\/documents\/[^/]+\/?$/)
    if (detail) return `/${detail[1]}/documents`
    if (!PERSPECTIVE_AWARE.test(pathname)) return `/${lang}/dashboard`
    return pathname
  }, [pathname])

  const remember = useCallback((entry: PerspectiveEntry) => {
    const next = [entry, ...readRecents().filter((r) => r.slug !== entry.slug)].slice(0, MAX_RECENTS)
    try {
      localStorage.setItem(RECENTS_KEY, JSON.stringify(next))
    } catch {
      /* stockage indisponible : on se passe des récents */
    }
    setRecents(next)
  }, [])

  const goTo = useCallback(
    (entry: PerspectiveEntry) => {
      remember(entry)
      const params = new URLSearchParams(searchParams.toString())
      params.set('perspective', entry.slug)
      params.delete('tab')
      router.push(`${targetPath()}?${params.toString()}`, { scroll: false })
    },
    [remember, router, searchParams, targetPath],
  )

  const goHome = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('perspective')
    params.delete('tab')
    const qs = params.toString()
    router.push(`${targetPath()}${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [router, searchParams, targetPath])

  return { goTo, goHome, recents }
}
