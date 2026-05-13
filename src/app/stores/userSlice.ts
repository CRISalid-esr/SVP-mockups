import { StateCreator } from 'zustand'
import { User } from '@/types/User'
import { IAgent, IAgentClass } from '@/types/IAgent'
import { Person } from '@/types/Person'
import { ResearchStructure } from '@/types/ResearchStructure'
import { mockService } from '../../mocks/mockService'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export interface UserSlice {
  user: {
    connectedUser: User | null // The authenticated user
    currentPerspective: IAgent | null
    ownPerspective: boolean // Whether the current perspective is the connected user
    loading: boolean
    error: string | null | unknown
    fetchConnectedUser: () => Promise<void>
    setPerspective: (perspective: IAgent) => void
    setPerspectiveBySlug: (uid: string) => void
  }
}

export const addUserSlice: StateCreator<UserSlice, [], [], UserSlice> = (
  set,
) => ({
  user: {
    connectedUser: null,
    loading: true,
    error: null,
    currentPerspective: null,
    ownPerspective: false,
    fetchConnectedUser: async () => {
      set((state) => ({ user: { ...state.user, loading: true } }))
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const jsonUser = USE_MOCK ? mockService.getConnectedUser() as any : await (await fetch('/api/users/me')).json()
        const user = User.fromJsonUser(jsonUser)

        set((state) => ({
          user: {
            ...state.user,
            connectedUser: user,
            ownPerspective:
              state.user.currentPerspective?.uid === user.person?.uid,
          },
        }))
      } catch (error) {
        console.error('Failed to fetch connected user', error)
        set((state) => ({
          user: { ...state.user, error, connectedUser: null },
        }))
      } finally {
        set((state) => ({ user: { ...state.user, loading: false } }))
      }
    },
    setPerspective: (perspective: IAgent) => {
      set((state) => ({
        user: {
          ...state.user,
          currentPerspective: perspective,
          ownPerspective:
            state.user.connectedUser?.person?.uid === perspective?.uid,
        },
      }))
    },
    setPerspectiveBySlug: async (slug: string) => {
      set((state) => ({ user: { ...state.user, loading: true } }))

      try {
        let entity: IAgent

        if (USE_MOCK) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let entityJson: any
          let EntityClass: IAgentClass
          if (slug.startsWith('research-structure:')) {
            entityJson = mockService.getResearchStructureBySlug(slug)
            EntityClass = ResearchStructure
          } else if (slug.startsWith('person:')) {
            entityJson = mockService.getPersonBySlug(slug)
            EntityClass = Person
          } else {
            // Bare slug: try person first, then research structure
            entityJson = mockService.getPersonBySlug(slug)
            if (entityJson) {
              EntityClass = Person
            } else {
              entityJson = mockService.getResearchStructureBySlug(slug)
              EntityClass = ResearchStructure
            }
          }
          if (!entityJson) throw new Error(`Entity not found: ${slug}`)
          entity = EntityClass.fromJson(entityJson)
        } else {
          let endpoint = ''
          let EntityClass: IAgentClass
          if (slug.startsWith('person:')) {
            endpoint = `/api/person/slug/${slug}`
            EntityClass = Person
          } else if (slug.startsWith('research-structure:')) {
            endpoint = `/api/researchStructures/slug/${slug}`
            EntityClass = ResearchStructure
          } else {
            throw new Error(`Unknown slug type: ${slug}`)
          }
          const response = await fetch(endpoint)
          if (!response.ok) throw new Error(`Failed to fetch entity with slug: ${slug}`)
          const entityJson = await response.json()
          entity = EntityClass.fromJson(entityJson)
        }

        set((state) => ({
          user: {
            ...state.user,
            currentPerspective: entity,
            ownPerspective:
              state.user.connectedUser?.person?.uid === entity.uid,
          },
        }))
      } catch (error) {
        console.error('Failed to fetch entity by slug', error)
        set((state) => ({
          user: {
            ...state.user,
            error,
          },
        }))
      } finally {
        set((state) => ({ user: { ...state.user, loading: false } }))
      }
    },
  },
})
