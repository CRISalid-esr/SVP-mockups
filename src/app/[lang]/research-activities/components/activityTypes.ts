import React from 'react'
import {
  Announcement01,
  Award01,
  BookOpen01,
  Briefcase01,
  Building07,
  File02,
  GraduationHat01,
  Lightbulb01,
  Users01,
} from '@untitled-ui/icons-react'
import { ActivityType } from '@/types/Activity'

type UntitledIcon = React.ComponentType<{
  size?: number
  style?: React.CSSProperties
  className?: string
  color?: string
}>

export interface ActivityTypeStyle {
  label: string
  /** Libellé au pluriel, pour le filtre. */
  plural: string
  /** Titre du formulaire d'ajout. */
  addTitle: string
  /** Exemples, pour aider à choisir le type. */
  hint: string
  /** Exemple d'intitulé. */
  titleExample: string
  icon: UntitledIcon
  /** Fond de l'icône, sous une icône blanche. */
  main: string
  /** Fond du bandeau de la carte. */
  tint: string
  /** Texte posé sur le bandeau. */
  ink: string
}

/** Ces activités ont lieu à une date : sans date de fin, elles ne sont pas « en cours ». */
export const isPunctual = (type: ActivityType) => ['brevet', 'conference', 'distinction'].includes(type)

/** Une teinte par type : chacune reste lisible (contrastes vérifiés dans page.test.tsx). */
export const ACTIVITY_TYPES: Record<ActivityType, ActivityTypeStyle> = {
  projet: { label: 'Projet', plural: 'Projets', addTitle: 'Ajouter un projet', hint: 'ANR, Europe, contrat', titleExample: 'ANR DeepLearning4Science', icon: Briefcase01 as UntitledIcon, main: '#006A61', tint: '#E3F4F1', ink: '#00504A' },
  encadrement: { label: 'Encadrement', plural: 'Encadrement', addTitle: 'Ajouter un encadrement', hint: 'Thèse, stage, post-doc', titleExample: 'Thèse de Marie Dupont', icon: Users01 as UntitledIcon, main: '#0B6FB8', tint: '#E3F1FB', ink: '#0A5A96' },
  editorial: { label: 'Éditorial', plural: 'Éditorial', addTitle: 'Ajouter une activité éditoriale', hint: 'Revue, relecture', titleExample: 'Éditeur associé de la revue…', icon: BookOpen01 as UntitledIcon, main: '#7B3FA8', tint: '#F3EAFA', ink: '#662F8F' },
  brevet: { label: 'Brevet', plural: 'Brevets', addTitle: 'Ajouter un brevet', hint: 'Dépôt, délivrance', titleExample: 'Système d’analyse automatisée', icon: Lightbulb01 as UntitledIcon, main: '#B45F06', tint: '#FDF0DF', ink: '#8F4B04' },
  conference: { label: 'Conférence', plural: 'Conférences', addTitle: 'Ajouter une conférence', hint: 'Keynote, conférence invitée', titleExample: 'Conférence invitée à NeurIPS 2024', icon: Announcement01 as UntitledIcon, main: '#C93B2B', tint: '#FCEAE8', ink: '#A32C1F' },
  distinction: { label: 'Distinction', plural: 'Distinctions', addTitle: 'Ajouter une distinction', hint: 'Prix, médaille', titleExample: 'Prix jeune chercheur', icon: Award01 as UntitledIcon, main: '#8F7100', tint: '#FAF3D3', ink: '#6F5800' },
  mediation: { label: 'Médiation', plural: 'Médiation', addTitle: 'Ajouter une action de médiation', hint: 'Grand public, scolaires', titleExample: 'Atelier à la Fête de la Science', icon: File02 as UntitledIcon, main: '#B5357E', tint: '#FBE8F3', ink: '#96286A' },
  enseignement: { label: 'Enseignement', plural: 'Enseignement', addTitle: 'Ajouter un enseignement', hint: 'Cours, TD, TP', titleExample: 'Intelligence artificielle, Master 2', icon: GraduationHat01 as UntitledIcon, main: '#2E7D32', tint: '#E7F5E8', ink: '#1F6124' },
  responsabilite: { label: 'Responsabilité', plural: 'Responsabilités collectives', addTitle: 'Ajouter une responsabilité', hint: 'Direction, instance, jury, comité', titleExample: 'Membre du conseil de laboratoire', icon: Building07 as UntitledIcon, main: '#56616E', tint: '#ECEFF3', ink: '#3F4954' },
}
