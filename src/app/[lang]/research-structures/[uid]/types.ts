export type MemberScope = {
  structureUid: string
  filter?:
    | { type: 'employer'; institutionUid: string }
    | { type: 'campus'; campus: string }
}

export type PerimeterConfig = {
  scopes: MemberScope[]
}

export type StructureIdentifiers = {
  ror?: string
  halCollection?: string
  idref?: string
  wikidata?: string
  scopusId?: string
}

export type PublicationYear = {
  year: number
  open: number
  closed: number
  unknown: number
}

export type Discipline = {
  label: string
  pct: number
}

export type Source = {
  name: string
  coverage: number
  found: number
  total: number
}

export type StructureRaw = {
  uid: string
  generic_type: 'institution' | 'institution_subdivision' | 'unit' | 'team'
  national_type: string | null
  main_mission: string
  acronym: string
  parent_uid: string | null
  secondary_parent_uids?: string[]
  short_labels: { language: string; value: string }[]
  long_labels: { language: string; value: string }[]
  institutionNames: string[]
  membersCount: number
  publicationsCount: number
  oaRate: number
  halRate: number
  halDelta?: number
  publicationsDelta?: number
  rnsr?: string | null
  descriptions: { language: string; value: string }[]
  slug: string
  identifiers?: StructureIdentifiers
  members?: string[]
  publicationsByYear?: PublicationYear[]
  disciplines?: Discipline[]
  sources?: Source[]
  childUids?: string[]
  member_of_uids?: string[]   // structures intermédiaires (pôles, regroupements) dont cette entité est membre
  perimeterConfig?: PerimeterConfig
}

export type PersonRaw = {
  uid: string
  displayName: string
  firstName: string
  lastName: string
  slug: string
  statut?: string
  publis24m?: number
  oaRate?: number
  halRate?: number
  memberships: {
    researchStructure: {
      uid: string
      acronym: string
      names: { language: string; value: string }[]
    }
  }[]
}
