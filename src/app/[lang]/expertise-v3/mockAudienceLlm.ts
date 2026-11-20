import { Audience, AudienceVariants, ResearchTheme } from './types'

// ─── Déclinaison par public (LLM simulé) ─────────────────────────────────────
// En production, un modèle de langage reformulerait la description du thème
// pour chaque public à partir de l'intitulé, de la description, des mots-clés,
// des lieux et de la période. Ici, des gabarits produisent un texte plausible
// sans aucune saisie supplémentaire du chercheur.

const DELAY_MS = 1400

function firstSentence(text: string): string {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  if (!cleaned) return ''
  const m = cleaned.match(/^(.+?[.!?])(\s|$)/)
  return (m ? m[1] : cleaned).trim()
}

function lower(label: string): string {
  return label.charAt(0).toLowerCase() + label.slice(1)
}

function list(items: string[], max = 3): string {
  const shown = items.slice(0, max)
  if (shown.length <= 1) return shown.join('')
  return `${shown.slice(0, -1).join(', ')} et ${shown[shown.length - 1]}`
}

function stripParenthesis(label: string): string {
  return label.replace(/\s*\([^)]*\)\s*$/, '')
}

function sinceClause(theme: ResearchTheme): string {
  if (theme.yearFrom == null) return ''
  if (theme.yearTo == null) return `depuis ${theme.yearFrom}`
  return `entre ${theme.yearFrom} et ${theme.yearTo}`
}

export function buildVariants(theme: ResearchTheme): Record<Audience, string> {
  const label = theme.label.trim() || 'ce thème'
  const desc = theme.description.trim()
  const first = firstSentence(desc)
  const controlled = theme.keywords.filter((k) => k.vocabulary !== 'libre' && k.vocabulary !== 'hal').map((k) => k.label)
  const free = theme.keywords.filter((k) => k.vocabulary === 'libre').map((k) => k.label)
  const places = theme.places.map((p) => p.label)
  const orgs = theme.organizations.map((o) => stripParenthesis(o.label))
  const since = sinceClause(theme)
  const ongoing = theme.yearTo == null

  const researchers = [
    `${label} : ${first || 'objet de recherche en cours de description.'}`,
    controlled.length ? `Notions mobilisées : ${list(controlled, 4)}.` : '',
    places.length ? `Terrains : ${list(places)}.` : '',
    since ? `Travaux conduits ${since}${ongoing ? ', toujours en cours' : ''}.` : '',
  ].filter(Boolean).join(' ')

  const industry = [
    `Expertise mobilisable sur ${lower(label)}${since ? ` (${since})` : ''}.`,
    first ? `En résumé : ${lower(first)}` : '',
    'Formes de collaboration possibles : diagnostic de territoire, évaluation de dispositif, accompagnement de projet, formation.',
    orgs.length ? `Acteurs déjà rencontrés : ${list(orgs)}.` : '',
    places.length ? `Connaissance de terrain : ${list(places)}.` : '',
  ].filter(Boolean).join(' ')

  const media = [
    `Je peux répondre sur ${lower(label)}${places.length ? ` (terrains : ${list(places, 2)})` : ''}.`,
    first ? first : '',
    free.length ? `Mots-clés : ${list(free)}.` : '',
    theme.yearTo != null ? `Travaux menés ${since} : je garde un regard d’expert sur le sujet, sans suivi d’actualité au jour le jour.` : '',
  ].filter(Boolean).join(' ')

  const publicText = [
    `Pourquoi ${lower(label)} ? ${first ? `${first}` : ''}`.trim(),
    places.length ? `J’ai travaillé sur le terrain, notamment : ${list(places, 2)}.` : '',
    ongoing ? 'Ce travail continue aujourd’hui.' : 'Ce travail est terminé, mais ses résultats restent utiles pour comprendre le sujet.',
  ].filter(Boolean).join(' ')

  return { researchers, industry, media, public: publicText }
}

/** Simule l'appel au modèle : renvoie les quatre déclinaisons après un court délai. */
export function generateAudienceVariants(theme: ResearchTheme): Promise<AudienceVariants> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(buildVariants(theme)), DELAY_MS)
  })
}
