import { Node } from '@xyflow/react'
import { ExpertiseAttributes, ExpertiseNodeData } from '../../types'
import { ImpactCard, ImpactFamily, ProfileType } from './impactCardsTypes'

// Simulation LLM : décline chaque thème de recherche (nœud du graphe) en une
// fiche expertise par public. Ne produit que les fiches manquantes — les
// fiches existantes ne sont jamais écrasées.

const PROFILES: ProfileType[] = ['RECHERCHE', 'INNOVATION', 'MEDIA', 'VULGARISATION']

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function lowerFirst(label: string): string {
  return label.charAt(0).toLowerCase() + label.slice(1)
}

// Les fiches héritent des caractéristiques du thème source (couverture
// temporelle, lieux, personnes, organisations, concepts).
export function pickAttributes(d: ExpertiseNodeData): ExpertiseAttributes | undefined {
  const attrs: ExpertiseAttributes = {}
  if (d.temporal?.length) attrs.temporal = d.temporal
  if (d.geographic?.length) attrs.geographic = d.geographic
  if (d.persons?.length) attrs.persons = d.persons
  if (d.organizations?.length) attrs.organizations = d.organizations
  if (d.concepts?.length) attrs.concepts = d.concepts
  return Object.keys(attrs).length > 0 ? attrs : undefined
}

interface CardDraft {
  title: string
  description: string
  specialization: number
  targetAudiences: string[]
}

const TEMPLATES: Record<ProfileType, (d: ExpertiseNodeData) => CardDraft> = {
  RECHERCHE: (d) => ({
    title: `${d.label} : cadres théoriques, méthodes et terrains`,
    description: `${d.description ? `${d.description}. ` : ''}Présentation académique du thème : état de l'art, approches méthodologiques et résultats récents, en vue de collaborations scientifiques.`,
    specialization: 9,
    targetAudiences: ['Chercheurs', 'Doctorants'],
  }),
  INNOVATION: (d) => ({
    title: `Conseil et expertise — ${lowerFirst(d.label)}`,
    description: `Accompagnement des organisations sur ${lowerFirst(d.label)} : études, audits, formations et appui à la décision, adaptés aux enjeux opérationnels.`,
    specialization: 6,
    targetAudiences: ['Industriels', 'PME / Startups', 'Élus / Décideurs'],
  }),
  MEDIA: (d) => ({
    title: `${d.label} : décryptage et mise en perspective`,
    description: `Interventions presse sur ${lowerFirst(d.label)} : contexte, chiffres clés et enjeux actuels, avec exemples concrets issus de la recherche.`,
    specialization: 4,
    targetAudiences: ['Journalistes', 'Documentaristes'],
  }),
  VULGARISATION: (d) => ({
    title: `Comprendre ${lowerFirst(d.label)}`,
    description: `Présentation accessible de ${lowerFirst(d.label)} : de quoi parle-t-on, pourquoi c'est important et ce que la recherche nous en apprend.`,
    specialization: 2,
    targetAudiences: ['Grand Public', 'Scolaires / Étudiants'],
  }),
}

function nextNumber(ids: string[], prefix: string): number {
  const nums = ids
    .map((id) => parseInt(id.replace(prefix, ''), 10))
    .filter((n) => Number.isFinite(n))
  return Math.max(0, ...nums) + 1
}

export async function generateCardsFromGraph(
  nodes: Node<ExpertiseNodeData>[],
  families: ImpactFamily[],
  cards: ImpactCard[],
): Promise<{ families: ImpactFamily[]; newCards: ImpactCard[] }> {
  await delay(1600)

  const nextFamilies = [...families]
  const newCards: ImpactCard[] = []
  let famNum = nextNumber(families.map((f) => f.id), 'f')
  let cardNum = nextNumber(cards.map((c) => c.id), 'c')
  const today = new Date().toLocaleDateString('fr-FR')

  for (const node of nodes) {
    const d = node.data as ExpertiseNodeData
    if (!d?.label) continue

    let family = nextFamilies.find((f) => f.nodeId === node.id || f.title === d.label)
    if (!family) {
      family = { id: `f${famNum++}`, title: d.label, nodeId: node.id, source: 'Carte mentale' }
      nextFamilies.push(family)
    }

    for (const profile of PROFILES) {
      const familyId = family.id
      const exists = cards.some((c) => c.familyId === familyId && c.profile === profile)
        || newCards.some((c) => c.familyId === familyId && c.profile === profile)
      if (exists) continue

      newCards.push({
        id: `c${cardNum++}`,
        familyId,
        profile,
        status: 'TO_VALIDATE',
        visibility: 'PRIVATE',
        lastUpdate: today,
        source: 'Proposée par IA',
        attributes: pickAttributes(d),
        ...TEMPLATES[profile](d),
      })
    }
  }

  return { families: nextFamilies, newCards }
}
