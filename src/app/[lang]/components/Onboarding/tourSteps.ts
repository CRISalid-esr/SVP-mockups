import { t } from '@lingui/core/macro'

export interface TourStep {
  id: string
  /** Page à afficher pour cette étape, sans la langue. Sans page : on reste où l'on est. */
  path?: string
  /** Valeur de l'attribut data-tour de la zone à mettre en avant. Sans cible : carte centrée. */
  target?: string
  title: string
  body: string
}

/** Fonction, car les textes doivent être traduits au moment de l'affichage. */
export const getTourSteps = (): TourStep[] => [
  { id: 'welcome', title: t`onboarding_welcome_title`, body: t`onboarding_welcome_body` },
  { id: 'perspective', path: 'dashboard', target: 'perspective', title: t`onboarding_perspective_title`, body: t`onboarding_perspective_body` },
  { id: 'dashboard', path: 'dashboard', target: 'dashboard-tabs', title: t`onboarding_dashboard_title`, body: t`onboarding_dashboard_body` },
  { id: 'documents', path: 'documents', target: 'documents-table', title: t`onboarding_documents_title`, body: t`onboarding_documents_body` },
  { id: 'document', path: 'documents/doc-1', target: 'document-tabs', title: t`onboarding_document_title`, body: t`onboarding_document_body` },
  { id: 'profile', path: 'expertise-v2', target: 'profile-tabs', title: t`onboarding_profile_title`, body: t`onboarding_profile_body` },
  { id: 'activities', path: 'research-activities', target: 'activities-header', title: t`onboarding_activities_title`, body: t`onboarding_activities_body` },
  { id: 'structures', path: 'research-structures', target: 'structures-tabs', title: t`onboarding_structures_title`, body: t`onboarding_structures_body` },
  { id: 'rights', path: 'rights', target: 'rights-tabs', title: t`onboarding_rights_title`, body: t`onboarding_rights_body` },
  { id: 'assistant', path: 'dashboard', target: 'assistant', title: t`onboarding_assistant_title`, body: t`onboarding_assistant_body` },
  { id: 'help', path: 'dashboard', target: 'help', title: t`onboarding_help_title`, body: t`onboarding_help_body` },
]

export interface Box2D {
  left: number
  top: number
  width: number
  height: number
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, Math.max(min, max)))

/** Place la carte à côté de la zone mise en avant, ou dans un coin si la zone occupe tout l'écran. */
export const placeCard = (
  rect: Box2D | null,
  card: { width: number; height: number },
  viewport: { width: number; height: number },
  margin = 16,
): { left: number; top: number } => {
  const { width: w, height: h } = card
  const { width: vw, height: vh } = viewport
  if (!rect) return { left: Math.max(margin, (vw - w) / 2), top: Math.max(margin, (vh - h) / 2) }

  const right = rect.left + rect.width
  const bottom = rect.top + rect.height
  const alignedTop = clamp(rect.top, margin, vh - h - margin)
  const alignedLeft = clamp(rect.left, margin, vw - w - margin)

  if (right + margin + w <= vw - margin) return { left: right + margin, top: alignedTop }
  if (bottom + margin + h <= vh - margin) return { left: alignedLeft, top: bottom + margin }
  if (rect.top - margin - h >= margin) return { left: alignedLeft, top: rect.top - margin - h }
  if (rect.left - margin - w >= margin) return { left: rect.left - margin - w, top: alignedTop }
  return { left: Math.max(margin, vw - w - margin), top: Math.max(margin, vh - h - margin) }
}
