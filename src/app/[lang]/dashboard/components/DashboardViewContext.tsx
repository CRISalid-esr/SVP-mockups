import { createContext, ReactNode, useContext, useMemo } from 'react'
import {
  AuthorMeta,
  DashboardPublication,
  dashboardMockService,
} from '@/mocks/dashboardMockService'
import { StructureLevel, demoIndex } from '@/app/[lang]/components/Perspective/usePerspectiveScope'

export type DashboardView = 'researcher' | 'lab'

interface DashboardData {
  view: DashboardView
  isResearcher: boolean
  /** Le chercheur affiché est la personne connectée (libellés à la première personne). */
  isOwn: boolean
  /** Niveau de la structure affichée en vue laboratoire. */
  structureLevel: StructureLevel
  /** Publications du périmètre courant (toutes en vue labo, celles du chercheur en vue chercheur). */
  publications: DashboardPublication[]
  authors: AuthorMeta[]
  /** Id de l'auteur central en vue chercheur (null en vue labo). */
  researcherId: number | null
}

const Ctx = createContext<DashboardData | null>(null)

/** Auteurs internes, du plus au moins prolifique. Égalités départagées par id pour rester stable. */
function rankAuthors(pubs: DashboardPublication[]): number[] {
  const count = new Map<number, number>()
  for (const p of pubs) {
    for (const id of p.authorIds) count.set(id, (count.get(id) ?? 0) + 1)
  }
  return [...count.entries()]
    .sort((a, b) => b[1] - a[1] || a[0] - b[0])
    .map(([id]) => id)
}

/**
 * Le jeu de démo est unique (IREENA). `demoKey` identifie une perspective autre que
 * le profil connecté ou sa structure ; on en tire un sous-ensemble stable pour que
 * chaque personne ou structure consultée affiche ses propres chiffres. Le Labo X et
 * l'établissement affichent le jeu complet, l'équipe du Labo X ses vraies publications.
 */
export const DashboardDataProvider = ({
  view,
  demoKey = null,
  isOwn = true,
  structureLevel = 'unit',
  teamFilter = null,
  children,
}: {
  view: DashboardView
  demoKey?: string | null
  isOwn?: boolean
  structureLevel?: StructureLevel
  /** Équipe du jeu de démo à laquelle restreindre les publications. */
  teamFilter?: string | null
  children: ReactNode
}) => {
  const value = useMemo<DashboardData>(() => {
    const allPubs = dashboardMockService.getPublications()
    const authors = dashboardMockService.getAuthors()
    if (view === 'lab') {
      const step = demoKey ? 2 + demoIndex(demoKey, 4) : 1
      return {
        view,
        isResearcher: false,
        isOwn: false,
        structureLevel,
        publications: allPubs.filter(
          (p, i) => i % step === 0 && (!teamFilter || p.teams.includes(teamFilter)),
        ),
        authors,
        researcherId: null,
      }
    }
    const ranked = rankAuthors(allPubs)
    // Le profil connecté garde l'auteur le plus prolifique ; les autres se répartissent la suite du classement.
    const others = ranked.slice(1, 21)
    const id = demoKey && others.length ? others[demoIndex(demoKey, others.length)] : ranked[0]
    const publications = allPubs.filter((p) => p.authorIds.includes(id))
    return { view, isResearcher: true, isOwn, structureLevel, publications, authors, researcherId: id }
  }, [view, demoKey, isOwn, structureLevel, teamFilter])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useDashboardData = (): DashboardData => {
  const ctx = useContext(Ctx)
  if (!ctx) {
    throw new Error('useDashboardData must be used within DashboardDataProvider')
  }
  return ctx
}
