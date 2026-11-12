import { Activity } from '@/types/Activity'

/**
 * Activités de recherche de la personne connectée (maquette).
 * Gardées en localStorage pour que « Mon CV » reprenne ce qui a été saisi.
 */
export const ACTIVITIES_KEY = 'research-activities-v1'

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: '1',
    type: 'projet',
    title: 'ANR DeepLearning4Science',
    startDate: '2023-01-15',
    endDate: '2025-12-31',
    description:
      "Développement de méthodes d'apprentissage profond pour l'analyse de données scientifiques massives en climatologie et biologie computationnelle.",
    url: 'https://anr.fr',
    specificData: { budget: '450 000 €', role: 'Coordinateur', funder: 'ANR', awardId: 'ANR-22-CE23-0012' },
  },
  {
    id: '2',
    type: 'encadrement',
    title: 'Thèse de Marie Dupont',
    startDate: '2022-10-01',
    endDate: '2025-09-30',
    description:
      "Optimisation des algorithmes de traitement d'images médicales par apprentissage profond — application à la détection précoce du cancer.",
    specificData: { student: 'Marie Dupont', level: 'Doctorat', role: 'Co-direction ou co-encadrement', status: 'En cours', percentage: '50%', thesisTitle: 'Apprentissage profond pour la détection précoce en imagerie médicale' },
  },
  {
    id: '3',
    type: 'brevet',
    title: "Système d'analyse automatisée pour la détection précoce",
    startDate: '2024-03-15',
    description:
      "Brevet déposé pour un système innovant utilisant l'IA pour la détection précoce de pathologies à partir d'images radiologiques.",
    specificData: { number: 'FR2024001234', status: "En cours d'examen" },
  },
  {
    id: '4',
    type: 'distinction',
    title: "Prix jeune chercheur – Société Française d'IA",
    startDate: '2024-06-10',
    description:
      "Récompense pour contributions exceptionnelles dans le domaine de l'apprentissage automatique appliqué aux sciences de la vie.",
    specificData: { organization: 'SFIA' },
  },
  {
    id: '5',
    type: 'conference',
    title: 'Conférence invitée – NeurIPS 2024',
    startDate: '2024-12-10',
    description:
      'Présentation invitée sur les avancées récentes en apprentissage par renforcement appliqué à la robotique chirurgicale.',
    url: 'https://neurips.cc',
    specificData: { location: 'Vancouver, Canada', type: 'Conférence invitée' },
  },
  {
    id: '6',
    type: 'enseignement',
    title: 'Intelligence Artificielle Avancée – Master 2',
    startDate: '2023-09-01',
    endDate: '2024-06-30',
    description:
      "Cours magistral et travaux dirigés sur l'apprentissage profond, les réseaux de neurones convolutifs et récurrents, avec projets appliqués.",
    specificData: {
      establishment: 'Université de Nantes',
      level: 'Master 2',
      hours: '48',
      courseType: 'Mixte',
      subject: 'Intelligence Artificielle Avancée',
    },
  },
  {
    id: '7',
    type: 'editorial',
    title: "Éditeur associé – Journal of Machine Learning Research",
    startDate: '2022-01-01',
    description:
      "Responsabilités éditoriales incluant la gestion de soumissions et la coordination des relectures pour une revue internationale classée A*.",
    specificData: { journal: 'JMLR', role: 'Éditeur associé' },
  },
  {
    id: '8',
    type: 'encadrement',
    title: 'Stage M2 – Lucas Martin',
    startDate: '2024-02-01',
    endDate: '2024-07-31',
    description:
      "Stage de master 2 sur la génération de texte médical par grands modèles de langage, en partenariat avec le CHU de Nantes.",
    specificData: { student: 'Lucas Martin', level: 'Master', role: 'Direction', status: 'Terminé', percentage: '100%' },
  },
  {
    id: '9',
    type: 'responsabilite',
    title: 'Membre élu du conseil de laboratoire',
    startDate: '2021-01-01',
    description: 'Représentant des enseignants-chercheurs au conseil du LS2N : budget, recrutements, politique scientifique.',
    specificData: { category: 'Direction ou gouvernance', role: 'Membre élu', scope: 'Laboratoire', body: 'Conseil de laboratoire du LS2N' },
  },
  {
    id: '10',
    type: 'responsabilite',
    title: 'Rapporteur de la thèse de Léa Morin',
    startDate: '2025-06-20',
    endDate: '2025-06-20',
    description: 'Thèse de l’Université de Rennes sur l’apprentissage frugal pour l’imagerie satellite.',
    specificData: { category: 'Jury (thèse, HDR, recrutement)', role: 'Rapporteur', scope: 'National', body: 'Université de Rennes' },
  },
]

/** Activités enregistrées, sinon celles de démonstration. */
export const loadActivities = (): Activity[] => {
  if (typeof window === 'undefined') return INITIAL_ACTIVITIES
  try {
    const raw = localStorage.getItem(ACTIVITIES_KEY)
    if (raw) return JSON.parse(raw) as Activity[]
  } catch {
    /* stockage indisponible : données de démonstration */
  }
  return INITIAL_ACTIVITIES
}

export const saveActivities = (activities: Activity[]) => {
  try {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities))
  } catch {
    /* stockage indisponible : les modifications restent en mémoire */
  }
}
