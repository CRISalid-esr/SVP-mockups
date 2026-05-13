'use client'

import React, { useState } from 'react'
import {
  Box,
  Button,
  Chip,
  Grid2 as Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { t } from '@lingui/core/macro'
import DocumentHeader from '@/app/[lang]/documents/components/DocumentHeader'
import useStore from '@/stores/global_store'
import * as Lingui from '@lingui/core'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'
import { Activity, ActivityType } from '@/types/Activity'
import ActivityCard from './components/ActivityCard'
import ActivityDialog from './components/ActivityDialog'

const TEAL = '#006A61'

const TYPE_LABELS: Record<ActivityType | 'all', string> = {
  all: 'Tous les types',
  projet: 'Projets',
  encadrement: 'Encadrement',
  brevet: 'Brevets',
  conference: 'Conférences',
  enseignement: 'Enseignement',
  editorial: 'Éditorial',
  distinction: 'Distinctions',
  mediation: 'Médiation',
}

const initialActivities: Activity[] = [
  {
    id: '1',
    type: 'projet',
    title: 'ANR DeepLearning4Science',
    startDate: '2023-01-15',
    endDate: '2025-12-31',
    description:
      "Développement de méthodes d'apprentissage profond pour l'analyse de données scientifiques massives en climatologie et biologie computationnelle.",
    url: 'https://anr.fr',
    specificData: { budget: '450 000 €', role: 'Coordinateur' },
  },
  {
    id: '2',
    type: 'encadrement',
    title: 'Thèse de Marie Dupont',
    startDate: '2022-10-01',
    endDate: '2025-09-30',
    description:
      "Optimisation des algorithmes de traitement d'images médicales par apprentissage profond — application à la détection précoce du cancer.",
    specificData: { student: 'Marie Dupont', level: 'PhD', percentage: '50%' },
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
    specificData: { location: 'Vancouver, Canada', type: 'Invited talk' },
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
    specificData: { student: 'Lucas Martin', level: 'Master', percentage: '100%' },
  },
]

const ResearchActivitiesPage = () => {
  const { currentPerspective } = useStore((state) => state.user)
  const lang = Lingui.i18n.locale as ExtendedLanguageCode

  const [activities, setActivities] = useState<Activity[]>(initialActivities)
  const [filterType, setFilterType] = useState<ActivityType | 'all'>('all')
  const [filterYear, setFilterYear] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)

  const years = [
    'all',
    ...Array.from(
      new Set(activities.map((a) => a.startDate.substring(0, 4))),
    ).sort((a, b) => b.localeCompare(a)),
  ]

  const filteredActivities = activities.filter((activity) => {
    const matchesType = filterType === 'all' || activity.type === filterType
    const matchesYear =
      filterYear === 'all' || activity.startDate.startsWith(filterYear)
    const matchesSearch =
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesYear && matchesSearch
  })

  const handleSaveActivity = (data: Partial<Activity>) => {
    if (editingActivity) {
      setActivities(
        activities.map((a) =>
          a.id === editingActivity.id ? ({ ...a, ...data } as Activity) : a,
        ),
      )
    } else {
      const newActivity: Activity = {
        ...data,
        id: Math.random().toString(36).substring(2, 9),
      } as Activity
      setActivities([newActivity, ...activities])
    }
    setIsDialogOpen(false)
    setEditingActivity(null)
  }

  const handleDeleteActivity = (activity: Activity) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) {
      setActivities(activities.filter((a) => a.id !== activity.id))
    }
  }

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity)
    setIsDialogOpen(true)
  }

  return (
    <Box>
      <DocumentHeader
        perspectiveName={currentPerspective?.getDisplayName(lang) || ''}
        pageName={'Activités de recherche'}
      />

      <Box sx={{ p: 3 }}>
        {/* Titre + bouton */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
              {'Activités de recherche'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {'Gérez vos projets, encadrements et autres activités scientifiques'}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditingActivity(null)
              setIsDialogOpen(true)
            }}
            sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
          >
            {'Ajouter une activité'}
          </Button>
        </Box>

        {/* Filtres */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <TextField
            placeholder="Rechercher une activité…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ flexGrow: 1 }}
          />
          <TextField
            select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ActivityType | 'all')}
            size="small"
            label="Type"
            sx={{ minWidth: 180 }}
          >
            {(Object.keys(TYPE_LABELS) as Array<ActivityType | 'all'>).map((k) => (
              <MenuItem key={k} value={k}>
                {TYPE_LABELS[k]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            size="small"
            label="Année"
            sx={{ minWidth: 140 }}
          >
            {years.map((y) => (
              <MenuItem key={y} value={y}>
                {y === 'all' ? 'Toutes les années' : y}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {/* Compteur + chips de type actif */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {filteredActivities.length === 0
              ? 'Aucune activité'
              : filteredActivities.length === 1
                ? '1 activité'
                : `${filteredActivities.length} activités`}
          </Typography>
          {filterType !== 'all' && (
            <Chip
              label={TYPE_LABELS[filterType]}
              size="small"
              onDelete={() => setFilterType('all')}
              sx={{ bgcolor: `${TEAL}15`, color: TEAL, fontWeight: 600 }}
            />
          )}
          {filterYear !== 'all' && (
            <Chip
              label={filterYear}
              size="small"
              onDelete={() => setFilterYear('all')}
              sx={{ bgcolor: `${TEAL}15`, color: TEAL, fontWeight: 600 }}
            />
          )}
        </Box>

        {/* Grille */}
        <Grid container spacing={3}>
          {filteredActivities.map((activity) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={activity.id}>
              <ActivityCard
                activity={activity}
                onEdit={handleEditActivity}
                onDelete={handleDeleteActivity}
              />
            </Grid>
          ))}
          {filteredActivities.length === 0 && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ textAlign: 'center', py: 10 }}>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {'Aucune activité trouvée.'}
                </Typography>
                {(filterType !== 'all' || filterYear !== 'all' || searchQuery) && (
                  <Button
                    variant="text"
                    onClick={() => {
                      setFilterType('all')
                      setFilterYear('all')
                      setSearchQuery('')
                    }}
                    sx={{ color: TEAL, textTransform: 'none' }}
                  >
                    {'Réinitialiser les filtres'}
                  </Button>
                )}
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>

      <ActivityDialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false)
          setEditingActivity(null)
        }}
        onSave={handleSaveActivity}
        activity={editingActivity}
      />
    </Box>
  )
}

export default ResearchActivitiesPage
