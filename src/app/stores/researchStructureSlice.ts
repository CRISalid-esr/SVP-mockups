import { StateCreator } from 'zustand'
import {
  ResearchStructure,
  ResearchStructureJson,
} from '@/types/ResearchStructure'
import { i18n } from '@lingui/core'
import { BaseQuery } from '@/types/BaseQuery'
import { toQueryString } from '@/utils/query'
import { mockService } from '../../mocks/mockService'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export interface ResearchStructuresByNameQuery extends BaseQuery {
  searchTerm: string
  includeExternal?: boolean
}

const defaultResearchStructuresByNameQuery: ResearchStructuresByNameQuery = {
  searchTerm: '',
  page: 1,
  includeExternal: false,
}

export interface ResearchStructureSlice {
  researchStructure: {
    researchStructures: ResearchStructure[]
    loading: boolean
    total: number
    error: string | null | unknown
    fetchResearchStructuresByName: (
      obj: ResearchStructuresByNameQuery,
    ) => Promise<void>
    hasMore: boolean
  }
}

export const addResearchStructureSlice: StateCreator<
  ResearchStructureSlice, // The type of the state
  [], // Middlewares (if any)
  [], // Additional options (if any)
  ResearchStructureSlice // The slice being created
> = (set) => ({
  researchStructure: {
    researchStructures: [],
    loading: false,
    error: null,
    total: 0,
    hasMore: true,
    fetchResearchStructuresByName: async (
      queryObject: ResearchStructuresByNameQuery,
    ) => {
      const mergedQueryObject = {
        ...defaultResearchStructuresByNameQuery,
        ...queryObject,
      }
      const queryString = toQueryString(mergedQueryObject)

      set((state) => ({
        researchStructure: { ...state.researchStructure, loading: true },
      }))

      try {
        let hasMore = false
        let researchStructures: ResearchStructureJson[] = []
        let total = 0

        if (USE_MOCK) {
          const mockData = mockService.getResearchStructures(queryObject.searchTerm)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          researchStructures = mockData.researchStructures as any[]
          hasMore = mockData.hasMore
          total = mockData.total
        } else {
          const response = await fetch(`/api/researchStructures?${queryString}`, {
            headers: { 'accept-language': i18n.locale },
          })
          if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`)
          const jsonData = (await response.json()) as { hasMore?: boolean; researchStructures?: ResearchStructureJson[]; total?: number }
          hasMore = jsonData.hasMore ?? false
          researchStructures = jsonData.researchStructures ?? []
          total = jsonData.total ?? 0
        }

        set((state) => {
          const reinit = Number(queryObject.page) === 1
          let updatedResearchStructures = researchStructures.map(
            ResearchStructure.fromJson,
          )

          if (!reinit) {
            // Push data to a transient map to avoid duplicates
            const combinedResearchStructureMap = new Map<
              string,
              ResearchStructure
            >([
              ...state.researchStructure.researchStructures.map(
                (rs): [string, ResearchStructure] => [rs.uid, rs],
              ),
              ...researchStructures.map((rs): [string, ResearchStructure] => [
                rs.uid,
                ResearchStructure.fromJson(rs),
              ]),
            ])
            updatedResearchStructures = Array.from(
              combinedResearchStructureMap.values(),
            )
          }

          return {
            researchStructure: {
              ...state.researchStructure,
              researchStructures: updatedResearchStructures,
              hasMore,
              total,
              error: null,
            },
          }
        })
      } catch (error) {
        set((state) => ({
          researchStructure: {
            ...state.researchStructure,
            error: error instanceof Error ? error.message : 'Unknown error',
            researchStructures: [],
          },
        }))
      } finally {
        set((state) => ({
          researchStructure: { ...state.researchStructure, loading: false },
        }))
      }
    },
  },
})
