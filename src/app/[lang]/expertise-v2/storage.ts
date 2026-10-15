import { DEMO_PROFILE, EMPTY_PROFILE, ResearchProfile, normalizeProfile } from './types'

// Persistance localStorage du « Profil de recherche 2 », isolée par perspective
// (?perspective=…) comme la rubrique v1. Le profil de démo n'est servi qu'à la
// perspective « default » ; tout autre profil démarre vide.
export const PROFILE_KEY_PREFIX = 'research-profile-v2'

export function getPerspective(): string {
  if (typeof window === 'undefined') return 'default'
  return new URLSearchParams(window.location.search).get('perspective') || 'default'
}

export function profileStorageKey(): string {
  return `${PROFILE_KEY_PREFIX}-${getPerspective()}`
}

export function loadProfile(): ResearchProfile {
  if (typeof window === 'undefined') return DEMO_PROFILE
  try {
    const raw = localStorage.getItem(profileStorageKey())
    // Les profils enregistrés avant l'ajout des repères structurés et des
    // déclinaisons par public sont complétés à la lecture.
    if (raw) return normalizeProfile(JSON.parse(raw) as ResearchProfile)
  } catch (_e) { /* ignore */ }
  return getPerspective() === 'default' ? DEMO_PROFILE : EMPTY_PROFILE
}

export function saveProfile(profile: ResearchProfile): ResearchProfile {
  const next = { ...profile, lastUpdated: new Date().toISOString().split('T')[0] }
  localStorage.setItem(profileStorageKey(), JSON.stringify(next))
  return next
}

export function resetProfile() {
  localStorage.removeItem(profileStorageKey())
}
