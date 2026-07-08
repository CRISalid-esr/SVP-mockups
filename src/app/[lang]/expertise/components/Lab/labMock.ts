import { ProfileType } from '../ImpactCards/impactCardsTypes'

// Données de démonstration pour la vue laboratoire (perspective structure).
// Le labo agrège les thèmes de recherche saisis par chacun de ses membres :
// deux membres partagent un thème quand leurs libellés sont alignés sur le
// même concept (vocabulaire contrôlé) ou identiques après normalisation.

export interface LabMember {
  id: string
  name: string
  team: string
  /** Libellés des thèmes de recherche renseignés par le membre (vide = profil non renseigné). */
  sujets: string[]
}

export interface LabSujet {
  label: string
  /** Vocabulaire contrôlé sur lequel le thème est aligné (regroupement fiable). */
  vocabulary?: 'RAMEAU' | 'Wikidata'
}

export interface LabFiche {
  id: string
  title: string
  description: string
  profile: ProfileType
  memberName: string
  targetAudiences: string[]
  specialization: number
  lastUpdate: string
}

export const LAB_TEAMS = [
  'Migrations & mobilités',
  'Genre & société',
  'Histoire & patrimoine',
]

// Alignements sur vocabulaire contrôlé : ces thèmes se regroupent par
// identifiant, les autres par simple rapprochement de libellés.
export const SUJET_VOCABULARIES: Record<string, LabSujet['vocabulary']> = {
  'Migration pour le travail': 'RAMEAU',
  'Politiques migratoires': 'RAMEAU',
  'Études de genre': 'RAMEAU',
  'Asile et réfugiés': 'RAMEAU',
  'Travail domestique': 'RAMEAU',
  'Diasporas et transnationalisme': 'Wikidata',
  'Histoire de l’immigration en France': 'RAMEAU',
  'Sociologie du travail': 'RAMEAU',
}

export const LAB_MEMBERS: LabMember[] = [
  { id: 'm1', name: 'Jean Dupont', team: 'Migrations & mobilités', sujets: ['Migration pour le travail', 'Politiques migratoires', 'Genre et migration', 'Identités en migration'] },
  { id: 'm2', name: 'Claire Moreau', team: 'Migrations & mobilités', sujets: ['Migration pour le travail', 'Diasporas et transnationalisme', 'Asile et réfugiés'] },
  { id: 'm3', name: 'Karim Benali', team: 'Migrations & mobilités', sujets: ['Politiques migratoires', 'Frontières et contrôle migratoire', 'Asile et réfugiés'] },
  { id: 'm4', name: 'Sophie Lambert', team: 'Genre & société', sujets: ['Études de genre', 'Genre et migration', 'Travail domestique'] },
  { id: 'm5', name: 'Marc Petit', team: 'Migrations & mobilités', sujets: ['Migration pour le travail', 'Économie informelle', 'Sociologie du travail'] },
  { id: 'm6', name: 'Aïcha Diallo', team: 'Genre & société', sujets: ['Études de genre', 'Discriminations et racisme', 'Santé des migrants'] },
  { id: 'm7', name: 'Paul Fournier', team: 'Histoire & patrimoine', sujets: ['Histoire de l’immigration en France', 'Diasporas et transnationalisme'] },
  { id: 'm8', name: 'Elena Rossi', team: 'Migrations & mobilités', sujets: ['Politiques migratoires', 'Mobilités étudiantes', 'Politiques publiques de l’intégration'] },
  { id: 'm9', name: 'Thomas Girard', team: 'Genre & société', sujets: ['Sociologie du travail', 'Travail domestique', 'Économie informelle'] },
  { id: 'm10', name: 'Nadia Cherif', team: 'Migrations & mobilités', sujets: ['Migration pour le travail', 'Genre et migration', 'Santé des migrants'] },
  { id: 'm11', name: 'Julien Mercier', team: 'Histoire & patrimoine', sujets: ['Histoire de l’immigration en France', 'Mémoires et patrimoines migratoires'] },
  { id: 'm12', name: 'Lucie Bernard', team: 'Genre & société', sujets: ['Études de genre', 'Discriminations et racisme'] },
  { id: 'm13', name: 'Omar Haddad', team: 'Migrations & mobilités', sujets: ['Asile et réfugiés', 'Frontières et contrôle migratoire', 'Numérique et migrations'] },
  { id: 'm14', name: 'Isabelle Roux', team: 'Genre & société', sujets: ['Études de genre', 'Vieillissement des populations immigrées'] },
  { id: 'm15', name: 'David Lefèvre', team: 'Histoire & patrimoine', sujets: [] },
  { id: 'm16', name: 'Emma Blanchard', team: 'Migrations & mobilités', sujets: [] },
  { id: 'm17', name: 'Antoine Perrin', team: 'Genre & société', sujets: [] },
  { id: 'm18', name: 'Yasmine Kaci', team: 'Histoire & patrimoine', sujets: ['Politiques publiques de l’intégration', 'Sociologie du travail'] },
]

export interface AggregatedSujet {
  label: string
  vocabulary?: LabSujet['vocabulary']
  members: LabMember[]
}

export function aggregateSujets(members: LabMember[]): AggregatedSujet[] {
  const byLabel = new Map<string, LabMember[]>()
  for (const member of members) {
    for (const label of member.sujets) {
      const list = byLabel.get(label) ?? []
      list.push(member)
      byLabel.set(label, list)
    }
  }
  return [...byLabel.entries()]
    .map(([label, list]) => ({ label, vocabulary: SUJET_VOCABULARIES[label], members: list }))
    .sort((a, b) => b.members.length - a.members.length || a.label.localeCompare(b.label))
}

export const LAB_FICHES: LabFiche[] = [
  {
    id: 'lf1', profile: 'RECHERCHE', memberName: 'Jean Dupont', specialization: 9, lastUpdate: '12/03/2026',
    title: 'Migrations Sri Lanka — Golfe Persique : trajectoires et vulnérabilités',
    description: "Analyse des trajectoires migratoires des travailleurs sri-lankais vers les pays du Golfe, avec focus sur les conditions d'emploi dans le cadre du système kafala.",
    targetAudiences: ['Chercheurs en sociologie', 'Géographes', 'Démographes'],
  },
  {
    id: 'lf2', profile: 'MEDIA', memberName: 'Jean Dupont', specialization: 4, lastUpdate: '05/02/2026',
    title: 'Ces travailleurs qui font tourner le Golfe',
    description: "De Colombo à Dubaï, des millions de travailleurs construisent des tours qu'ils ne verront jamais de l'intérieur. Récit d'une migration invisible.",
    targetAudiences: ['Journalistes d’investigation', 'Documentaristes'],
  },
  {
    id: 'lf3', profile: 'INNOVATION', memberName: 'Jean Dupont', specialization: 6, lastUpdate: '20/01/2026',
    title: 'Mobilité internationale et accompagnement RH',
    description: 'Expertise pour les entreprises gérant des équipes mobiles internationales : cadres légaux, risques psychosociaux et intégration des travailleurs migrants.',
    targetAudiences: ['DRH', 'Cabinets de conseil RH'],
  },
  {
    id: 'lf4', profile: 'RECHERCHE', memberName: 'Claire Moreau', specialization: 8, lastUpdate: '02/04/2026',
    title: 'Diasporas numériques : réseaux transnationaux et pratiques connectées',
    description: 'Étude des usages numériques des diasporas : circulation des informations, transferts financiers et maintien des liens familiaux à distance.',
    targetAudiences: ['Chercheurs', 'Doctorants'],
  },
  {
    id: 'lf5', profile: 'MEDIA', memberName: 'Karim Benali', specialization: 5, lastUpdate: '18/05/2026',
    title: 'Frontières européennes : ce que disent les chiffres',
    description: "Décryptage des politiques de contrôle migratoire aux frontières de l'UE : dispositifs, coûts, effets mesurés et idées reçues.",
    targetAudiences: ['Journalistes', 'Rédactions spécialisées'],
  },
  {
    id: 'lf6', profile: 'VULGARISATION', memberName: 'Sophie Lambert', specialization: 2, lastUpdate: '22/04/2026',
    title: 'Le genre, c’est quoi au juste ?',
    description: 'Présentation accessible des études de genre : de quoi parle-t-on, comment travaillent les chercheurs et pourquoi ces questions traversent la société.',
    targetAudiences: ['Grand Public', 'Scolaires / Étudiants'],
  },
  {
    id: 'lf7', profile: 'RECHERCHE', memberName: 'Sophie Lambert', specialization: 9, lastUpdate: '11/03/2026',
    title: 'Travail domestique et rapports de genre : approches comparées',
    description: 'Analyse comparée du travail domestique rémunéré en Europe du Sud : statuts, invisibilisation et mobilisations collectives.',
    targetAudiences: ['Chercheurs en sociologie', 'Juristes'],
  },
  {
    id: 'lf8', profile: 'INNOVATION', memberName: 'Marc Petit', specialization: 7, lastUpdate: '09/06/2026',
    title: 'Audit des chaînes de sous-traitance et travail précaire',
    description: 'Accompagnement des entreprises dans la détection des risques liés au travail informel et à la précarité dans leurs chaînes d’approvisionnement.',
    targetAudiences: ['Grands groupes', 'Compliance officers'],
  },
  {
    id: 'lf9', profile: 'MEDIA', memberName: 'Aïcha Diallo', specialization: 4, lastUpdate: '28/02/2026',
    title: 'Santé des migrants : au-delà des idées reçues',
    description: 'Interventions presse sur l’accès aux soins des populations migrantes : données épidémiologiques, obstacles administratifs et initiatives de terrain.',
    targetAudiences: ['Journalistes', 'Documentaristes'],
  },
  {
    id: 'lf10', profile: 'VULGARISATION', memberName: 'Paul Fournier', specialization: 3, lastUpdate: '15/01/2026',
    title: 'Deux siècles d’immigration en France',
    description: 'Conférences grand public sur l’histoire de l’immigration en France : grandes vagues, politiques publiques et constructions mémorielles.',
    targetAudiences: ['Grand Public', 'Scolaires / Étudiants', 'Associations'],
  },
  {
    id: 'lf11', profile: 'RECHERCHE', memberName: 'Elena Rossi', specialization: 8, lastUpdate: '30/04/2026',
    title: 'Mobilités étudiantes internationales : flux, politiques et inégalités',
    description: 'Étude des mobilités étudiantes entre Europe et Afrique : politiques de visas, stratégies familiales et retours.',
    targetAudiences: ['Chercheurs', 'Élus / Décideurs'],
  },
  {
    id: 'lf12', profile: 'INNOVATION', memberName: 'Elena Rossi', specialization: 6, lastUpdate: '07/05/2026',
    title: 'Politiques locales d’intégration : évaluation et conseil',
    description: 'Appui aux collectivités pour concevoir et évaluer leurs dispositifs d’accueil et d’intégration : diagnostics territoriaux, indicateurs, comparaisons.',
    targetAudiences: ['Élus / Décideurs', 'Collectivités'],
  },
  {
    id: 'lf13', profile: 'MEDIA', memberName: 'Omar Haddad', specialization: 5, lastUpdate: '25/05/2026',
    title: 'Asile en Europe : comprendre les parcours',
    description: 'Décryptage des parcours de demandeurs d’asile : procédures, délais, conditions d’accueil et comparaisons européennes.',
    targetAudiences: ['Journalistes', 'ONG'],
  },
  {
    id: 'lf14', profile: 'VULGARISATION', memberName: 'Lucie Bernard', specialization: 2, lastUpdate: '19/03/2026',
    title: 'Les discriminations, comment les mesure-t-on ?',
    description: 'Présentation accessible des méthodes de mesure des discriminations : testing, statistiques, enquêtes — et ce qu’elles révèlent.',
    targetAudiences: ['Grand Public', 'Associations', 'Scolaires / Étudiants'],
  },
]
