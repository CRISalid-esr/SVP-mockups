export type GeographicZone = {
  type: 'country' | 'geopolitical' | 'physical'
  name: string
  code?: string
}

export type TemporalPeriod = {
  type: 'standard' | 'custom'
  label?: string
  startYear?: number
  endYear?: number
}

export type Availability = {
  pressWritten: boolean
  pressTvRadio: boolean
  publicConferences: boolean
  hotTopics: boolean
  academicConferences: boolean
  businessPartnerships: boolean
  publicExpertise: boolean
  schoolInterventions: boolean
  mediaTraining: boolean
}

export type ExpertiseLevel = 'veille' | 'enseignement' | 'recherche' | 'reference'

export type Expertise = {
  id: string
  name: string
  category: string
  level: ExpertiseLevel
  description: string
  geographicZones: GeographicZone[]
  temporalPeriod: TemporalPeriod
  availability: Availability
  publications: number
  thesesEncadrees: number
  brevets: number
  projects: number
  lastUpdate: string
  keywords: string[]
}

export type ExpertiseFormData = {
  name: string
  category: string
  description: string
  keywords: string
  geographicZones: GeographicZone[]
  temporalPeriodType: 'standard' | 'custom'
  temporalPeriodStandard: string
  temporalStartYear: string
  temporalEndYear: string
  level: ExpertiseLevel
  availability: Availability
}
