import { createContext, ReactNode, useContext, useMemo } from 'react'
import {
  AuthorMeta,
  DashboardPublication,
  dashboardMockService,
} from '@/mocks/dashboardMockService'

export type DashboardView = 'researcher' | 'lab'

interface DashboardData {
  view: DashboardView
  isResearcher: boolean
  /** Publications du périmètre courant (toutes en vue labo, celles du chercheur en vue chercheur). */
  publications: DashboardPublication[]
  authors: AuthorMeta[]
  /** Id de l'auteur central en vue chercheur (null en vue labo). */
  researcherId: number | null
}

const Ctx = createContext<DashboardData | null>(null)

/** En vue chercheur, on prend l'auteur interne le plus prolifique comme profil de démo. */
function pickResearcherId(pubs: DashboardPublication[]): number {
  const count = new Map<number, number>()
  for (const p of pubs) {
    for (const id of p.authorIds) count.set(id, (count.get(id) ?? 0) + 1)
  }
  let bestId = -1
  let best = -1
  for (const [id, c] of count.entries()) {
    if (c > best) {
      best = c
      bestId = id
    }
  }
  return bestId
}

export const DashboardDataProvider = ({
  view,
  children,
}: {
  view: DashboardView
  children: ReactNode
}) => {
  const value = useMemo<DashboardData>(() => {
    const allPubs = dashboardMockService.getPublications()
    const authors = dashboardMockService.getAuthors()
    if (view === 'lab') {
      return {
        view,
        isResearcher: false,
        publications: allPubs,
        authors,
        researcherId: null,
      }
    }
    const id = pickResearcherId(allPubs)
    const publications = allPubs.filter((p) => p.authorIds.includes(id))
    return { view, isResearcher: true, publications, authors, researcherId: id }
  }, [view])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useDashboardData = (): DashboardData => {
  const ctx = useContext(Ctx)
  if (!ctx) {
    throw new Error('useDashboardData must be used within DashboardDataProvider')
  }
  return ctx
}
