import { DEMO_PROFILE, ResearchProfile, normalizeProfile } from './types'

// Persistance localStorage du « Profil de recherche 2 ». On n'y écrit que le profil
// de la personne connectée : les autres perspectives sont en lecture seule et ne
// passent jamais par ce stockage. L'indépendance vis-à-vis de l'URL garantit qu'un
// enregistrement ne peut pas atterrir dans le profil de quelqu'un d'autre.
export const PROFILE_KEY_PREFIX = 'research-profile-v2'

export function profileStorageKey(): string {
  return `${PROFILE_KEY_PREFIX}-default`
}

export function loadProfile(): ResearchProfile {
  if (typeof window === 'undefined') return DEMO_PROFILE
  try {
    const raw = localStorage.getItem(profileStorageKey())
    // Les profils enregistrés avant l'ajout des repères structurés et des
    // déclinaisons par public sont complétés à la lecture.
    if (raw) return normalizeProfile(JSON.parse(raw) as ResearchProfile)
  } catch (_e) { /* ignore */ }
  return DEMO_PROFILE
}

export function saveProfile(profile: ResearchProfile): ResearchProfile {
  const next = { ...profile, lastUpdated: new Date().toISOString().split('T')[0] }
  localStorage.setItem(profileStorageKey(), JSON.stringify(next))
  return next
}

export function resetProfile() {
  localStorage.removeItem(profileStorageKey())
}
