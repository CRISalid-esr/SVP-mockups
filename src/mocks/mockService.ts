import documentsData from './data/documents.json'
import personsData from './data/persons.json'
import structuresData from './data/structures.json'

export const mockService = {
  getDocuments: (searchTerm = '') => {
    const filtered = searchTerm
      ? documentsData.filter((d) =>
          d.titles.some((t) =>
            t.value.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
        )
      : documentsData
    return { documents: filtered, totalItems: filtered.length }
  },

  getDocumentById: (uid: string) =>
    documentsData.find((d) => d.uid === uid) ?? null,

  countDocuments: () => ({
    allItems: documentsData.length,
    incompleteHalRepositoryItems: 0,
  }),

  getPeople: (searchTerm = '') => {
    const filtered = searchTerm
      ? personsData.filter((p) =>
          p.displayName.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : personsData
    return { people: filtered, hasMore: false, total: filtered.length }
  },

  getResearchStructures: (searchTerm = '') => {
    const filtered = searchTerm
      ? structuresData.filter((s) =>
          s.long_labels.some((n) =>
            n.value.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
        )
      : structuresData
    return {
      researchStructures: filtered,
      hasMore: false,
      total: filtered.length,
    }
  },

  getConnectedUser: () => ({
    id: 'mock-user-id',
    username: 'mock-user',
    person: personsData[0],
  }),

  getPersonBySlug: (slug: string) => {
    const personSlug = slug.replace('person:', '')
    return personsData.find((p) => p.slug === personSlug) ?? null
  },

  getResearchStructureBySlug: (slug: string) => {
    const structureSlug = slug.replace('research-structure:', '')
    return structuresData.find((s) => s.slug === structureSlug) ?? null
  },

  getResearchStructureByUid: (uid: string) =>
    structuresData.find((s) => s.uid === uid) ?? null,

  getStructureMembers: (structureUid: string) => {
    const structure = structuresData.find((s) => s.uid === structureUid)
    if (!structure || !('members' in structure) || !Array.isArray(structure.members)) return []
    const memberUids = structure.members as string[]
    return personsData.filter((p) => memberUids.includes(p.uid))
  },

  getLaboratories: (searchTerm = '') => {
    const labs = structuresData.filter((s) => s.generic_type === 'unit')
    const filtered = searchTerm
      ? labs.filter(
          (s) =>
            s.acronym.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.long_labels.some((n) =>
              n.value.toLowerCase().includes(searchTerm.toLowerCase()),
            ),
        )
      : labs
    return { laboratories: filtered, total: filtered.length }
  },
}
