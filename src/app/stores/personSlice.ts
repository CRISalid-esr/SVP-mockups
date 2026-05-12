import { StateCreator } from 'zustand'
import { Person, PersonJson } from '@/types/Person'
import { i18n } from '@lingui/core'
import { toQueryString } from '@/utils/query'
import { BaseQuery } from '@/types/BaseQuery'
import { mockService } from '../../mocks/mockService'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export interface PeopleByNameQuery extends BaseQuery {
  searchTerm: string
  page: number
  includeExternal?: boolean
}

const defaultPeopleByNameQuery: PeopleByNameQuery = {
  searchTerm: '',
  page: 1,
  includeExternal: false,
}

export interface PersonSlice {
  person: {
    people: Person[]
    loading: boolean
    total: number
    error: string | null | unknown
    fetchPeopleByName: (obj: PeopleByNameQuery) => Promise<void>
    hasMore: boolean
  }
}

interface FindPeopleResponse {
  hasMore: boolean
  people: PersonJson[]
  total: number
}

export const addPersonSlice: StateCreator<PersonSlice, [], [], PersonSlice> = (
  set,
) => ({
  person: {
    people: [],
    loading: true,
    hasMore: true,
    total: 0,
    error: null,
    fetchPeopleByName: async (queryObject: PeopleByNameQuery) => {
      const mergedQueryObject = { ...defaultPeopleByNameQuery, ...queryObject }
      const queryString = toQueryString(mergedQueryObject)
      set((state) => ({ person: { ...state.person, loading: true } }))
      try {
        let hasMore = false
        let people: PersonJson[] = []
        let total = 0

        if (USE_MOCK) {
          const mockData = mockService.getPeople(queryObject.searchTerm)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          people = mockData.people as any[]
          hasMore = mockData.hasMore
          total = mockData.total
        } else {
          const response = await fetch(`/api/people?${queryString}`, {
            headers: { 'accept-language': i18n.locale },
          })
          if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`)
          const data = (await response.json()) as { hasMore?: boolean; people?: PersonJson[]; total?: number }
          hasMore = data.hasMore ?? false
          people = data.people ?? []
          total = data.total ?? 0
        }

        set((state) => {
          const reinit = Number(queryObject.page) === 1

          let updatedPeople: Person[] = people.map(Person.fromJson)

          if (!reinit) {
            // Push data to a transient map to avoid duplicates
            const combinedPeopleMap = new Map<string, Person>([
              ...state.person.people.map((person): [string, Person] => [
                person.uid,
                person,
              ]),
              ...people.map((person): [string, Person] => [
                person.uid,
                Person.fromJson(person),
              ]),
            ])
            updatedPeople = Array.from(combinedPeopleMap.values())
          }

          return {
            person: {
              ...state.person,
              people: updatedPeople,
              hasMore,
              total,
              error: null,
            },
          }
        })
      } catch (error) {
        console.error('Failed to fetch people', error)
        set((state) => ({
          person: {
            ...state.person,
            error,
            people: [],
          },
        }))
      } finally {
        set((state) => ({ person: { ...state.person, loading: false } }))
      }
    },
  },
})
