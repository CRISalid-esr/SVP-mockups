import {
  CampaignOutlined,
  LightbulbOutlined,
  PublicOutlined,
  ScienceOutlined,
} from '@mui/icons-material'

export type ProfileType = 'RECHERCHE' | 'INNOVATION' | 'MEDIA' | 'VULGARISATION'
export type CardStatus = 'VALIDATED' | 'TO_VALIDATE' | 'CUSTOM'
export type CardVisibility = 'PUBLIC' | 'PRIVATE'

export interface ImpactCard {
  id: string
  title: string
  description: string
  profile: ProfileType
  specialization: number // 1–10
  targetAudiences: string[]
  status: CardStatus
  visibility: CardVisibility
  familyId: string
  lastUpdate: string
  source?: string
  specifics?: Record<string, string>
}

export interface ImpactFamily {
  id: string
  title: string
  nodeId: string // référence au nœud du graphe
  source: string
}

export interface ProfileConfig {
  label: string
  desc: string
  color: string
  bg: string
  border: string
  pattern: string
  Icon: React.ElementType
}

export const PROFILE_CONFIG: Record<ProfileType, ProfileConfig> = {
  RECHERCHE: {
    label: 'Recherche',
    desc: 'Cible : Chercheurs',
    color: '#92400E',
    bg: '#FEF3C7',
    border: '#F59E0B',
    pattern: 'radial-gradient(circle, #F59E0B22 1px, transparent 1px)',
    Icon: ScienceOutlined,
  },
  INNOVATION: {
    label: 'Innovation',
    desc: 'Cible : Industriels',
    color: '#5B21B6',
    bg: '#EDE9FE',
    border: '#8B5CF6',
    pattern: 'repeating-linear-gradient(45deg, #8B5CF615 0, #8B5CF615 2px, transparent 0, transparent 50%)',
    Icon: LightbulbOutlined,
  },
  MEDIA: {
    label: 'Média',
    desc: 'Cible : Journalistes',
    color: '#065F46',
    bg: '#D1FAE5',
    border: '#10B981',
    pattern: 'repeating-linear-gradient(0deg, #10B98120 0, #10B98120 1px, transparent 0, transparent 10px)',
    Icon: CampaignOutlined,
  },
  VULGARISATION: {
    label: 'Vulgarisation',
    desc: 'Cible : Grand Public',
    color: '#1E40AF',
    bg: '#DBEAFE',
    border: '#3B82F6',
    pattern: 'repeating-linear-gradient(-45deg, #3B82F615 0, #3B82F615 2px, transparent 0, transparent 50%)',
    Icon: PublicOutlined,
  },
}

export const TARGET_AUDIENCE_OPTIONS = [
  'Chercheurs', 'Industriels', 'Journalistes', 'Grand Public',
  'Scolaires / Étudiants', 'Élus / Décideurs', 'PME / Startups',
  'DRH', 'Documentaristes', 'Associations',
]

export const SPECIFIC_SUGGESTIONS = [
  'Terrain', 'Langue', 'Zone géographique', 'Période',
  'Méthode', 'Format', 'Molécule', 'Langage informatique', 'Framework',
]

export const INITIAL_FAMILIES: ImpactFamily[] = [
  { id: 'f1', title: 'Migration pour le travail', nodeId: 'n1', source: 'Carte mentale' },
  { id: 'f2', title: 'Politiques migratoires', nodeId: 'n3', source: 'Carte mentale' },
]

export const INITIAL_CARDS: ImpactCard[] = [
  // --- Migration pour le travail ---
  {
    id: 'c1', familyId: 'f1', profile: 'RECHERCHE', status: 'VALIDATED', visibility: 'PUBLIC',
    specialization: 9,
    title: 'Migrations Sri Lanka — Golfe Persique : trajectoires et vulnérabilités',
    description: "Analyse des trajectoires migratoires des travailleurs sri-lankais vers les pays du Golfe, avec focus sur les conditions d'emploi dans le cadre du système kafala et les stratégies d'adaptation.",
    targetAudiences: ['Chercheurs en sociologie', 'Géographes', 'Démographes'],
    lastUpdate: '12/03/2026',
    specifics: { Terrain: 'Sri Lanka, EAU, Qatar', Période: '2005 — aujourd\'hui', Méthode: 'Ethnographie multi-sites' },
  },
  {
    id: 'c2', familyId: 'f1', profile: 'INNOVATION', status: 'VALIDATED', visibility: 'PUBLIC',
    specialization: 6,
    title: 'Mobilité internationale et accompagnement RH',
    description: "Expertise pour les entreprises gérant des équipes mobiles internationales : cadres légaux, risques psychosociaux et bonnes pratiques d'intégration des travailleurs migrants.",
    targetAudiences: ['DRH', 'Cabinets de conseil RH', 'PME exportatrices'],
    lastUpdate: '20/01/2026',
    specifics: { Format: 'Audit + formation', Durée: '2 à 5 jours' },
  },
  {
    id: 'c3', familyId: 'f1', profile: 'MEDIA', status: 'VALIDATED', visibility: 'PUBLIC',
    specialization: 4,
    title: "Ces travailleurs qui font tourner le Golfe",
    description: "De Colombo à Dubaï, des millions de travailleurs construisent des tours qu'ils ne verront jamais de l'intérieur. Récit d'une migration invisible et de ses ressorts économiques et familiaux.",
    targetAudiences: ["Journalistes d'investigation", 'Documentaristes', 'Rédactions spécialisées'],
    lastUpdate: '05/02/2026',
    specifics: { Angle: 'Récit humain', Format: 'Entretiens disponibles', Langues: 'Français, Anglais' },
  },
  {
    id: 'c4', familyId: 'f1', profile: 'VULGARISATION', status: 'TO_VALIDATE', visibility: 'PRIVATE',
    specialization: 2,
    title: "Pourquoi quitte-t-on son pays pour travailler ?",
    description: "Explication accessible des ressorts économiques, familiaux et sociaux qui poussent des millions de personnes à migrer pour le travail chaque année, et de leurs conditions de vie.",
    targetAudiences: ['Lycéens', 'Grand Public', 'Associations'],
    lastUpdate: '10/04/2026',
  },
  // --- Politiques migratoires ---
  {
    id: 'c5', familyId: 'f2', profile: 'RECHERCHE', status: 'VALIDATED', visibility: 'PUBLIC',
    specialization: 10,
    title: "Systèmes de parrainage et droits des travailleurs migrants",
    description: "Étude comparative des régimes juridiques encadrant la migration de travail dans la région MENA : kafala, visa de travail temporaire, zones économiques spéciales.",
    targetAudiences: ['Juristes', 'Chercheurs en droit international', 'ONG'],
    lastUpdate: '18/03/2026',
    specifics: { Pays: 'EAU, Qatar, Oman, Jordanie', Sources: 'Législation + entretiens' },
  },
  {
    id: 'c6', familyId: 'f2', profile: 'INNOVATION', status: 'TO_VALIDATE', visibility: 'PRIVATE',
    specialization: 7,
    title: "Due diligence migratoire pour les entreprises",
    description: "Accompagnement des entreprises dans l'audit de leurs chaînes d'approvisionnement pour détecter et prévenir les risques liés au travail précaire et à la migration forcée.",
    targetAudiences: ['Grands groupes', 'Acheteurs publics', 'Compliance officers'],
    lastUpdate: '02/05/2026',
    specifics: { Format: 'Audit + rapport', Référentiel: 'Loi Devoir de Vigilance' },
  },
]
