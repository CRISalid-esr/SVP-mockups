import { BibliographicPlatform } from '../app/types/BibliographicPlatform'
import { Document } from '../app/types/Document'

interface MockDocumentQuery {
  columnFilters?: string
  sorting?: string
  halCollectionCodes?: string
}

const halStatusOf = (document: Document, collectionCodes: string[]) => {
  const record = document.records.find(({ platform }) => platform === BibliographicPlatform.HAL)
  if (!record) {
    // Dépôt simulé : son état est conservé dans le navigateur.
    const deposit = typeof localStorage === 'undefined' ? null : localStorage.getItem(`hal-deposit-status-${document.uid}`)
    return deposit && JSON.parse(deposit).step === 'moderation' ? 'pending_moderation' : 'outside_hal'
  }
  return record.halCollectionCodes?.some((code) => collectionCodes.includes(code))
    ? 'in_collection'
    : 'out_of_collection'
}

const matchesFilter = (
  document: Document,
  { id, value }: { id: string; value: unknown },
  collectionCodes: string[],
) => {
  const values = Array.isArray(value) ? (value as unknown[]) : []
  switch (id) {
    case 'type':
      return !values.length || values.includes(document.documentType)
    case 'halStatus':
      return !values.length || values.includes(halStatusOf(document, collectionCodes))
    case 'oaStatus':
      return !values.length || values.includes(document.upwOAStatus ?? document.oaStatus ?? 'UNKNOWN')
    case 'source':
      return !values.length || document.records.some(({ platform }) => values.includes(platform))
    case 'date': {
      const [from, to] = values as (string | null)[]
      const date = document.publicationDate
      if (!date) return !from && !to
      return (!from || date >= from.slice(0, 10)) && (!to || date <= to.slice(0, 10))
    }
    default:
      return true
  }
}

/** La maquette n'a pas d'API : applique ici les filtres et le tri que le serveur appliquerait. */
export const queryMockDocuments = (documents: Document[], query: MockDocumentQuery) => {
  const filters: { id: string; value: unknown }[] = JSON.parse(query.columnFilters || '[]')
  const collectionCodes: string[] = JSON.parse(query.halCollectionCodes || '[]')
  const [sort]: { id: string; desc: boolean }[] = JSON.parse(query.sorting || '[]')

  const filtered = documents.filter((document) =>
    filters.every((filter) => matchesFilter(document, filter, collectionCodes)),
  )
  if (sort?.id !== 'date') return filtered

  return [...filtered].sort((a, b) => {
    const order = (a.publicationDate ?? '').localeCompare(b.publicationDate ?? '')
    return sort.desc ? -order : order
  })
}
