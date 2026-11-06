'use client'

import React, { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { MRT_ColumnFiltersState } from 'material-react-table'
import DocumentHeader from '@/app/[lang]/documents/components/DocumentHeader'
import ListFilterBar, { FilterDefinition } from '@/components/ListTable/ListFilterBar'
import useStore from '@/stores/global_store'
import * as Lingui from '@lingui/core'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'
import { Activity, ActivityType } from '@/types/Activity'
import ActivityCard from './components/ActivityCard'
import ActivityDialog from './components/ActivityDialog'
import { ACTIVITY_TYPES, isPunctual } from './components/activityTypes'

const TYPE_FILTER: FilterDefinition[] = [{
  id: 'type',
  label: 'Type',
  options: (Object.keys(ACTIVITY_TYPES) as ActivityType[]).map((type) => ({
    value: type,
    label: (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: ACTIVITY_TYPES[type].main }} />
        {ACTIVITY_TYPES[type].plural}
      </Box>
    ),
  })),
}]

/** L'activité s'est-elle déroulée pendant cette plage d'années ? */
const overlaps = (activity: Activity, from?: string | null, to?: string | null) => {
  const start = activity.startDate.slice(0, 10)
  const end = activity.endDate?.slice(0, 10) ?? (isPunctual(activity.type) ? start : '9999-12-31')
  return (!to || start <= to.slice(0, 10)) && (!from || end >= from.slice(0, 10))
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
  const [filters, setFilters] = useState<MRT_ColumnFiltersState>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [toDelete, setToDelete] = useState<Activity | null>(null)

  const filteredActivities = useMemo(() => {
    const types = (filters.find(({ id }) => id === 'type')?.value as string[] | undefined) ?? []
    const [from, to] = (filters.find(({ id }) => id === 'date')?.value as (string | null)[] | undefined) ?? []
    const term = searchQuery.trim().toLowerCase()
    return activities.filter((activity) =>
      (types.length === 0 || types.includes(activity.type))
      && overlaps(activity, from, to)
      && (!term || activity.title.toLowerCase().includes(term) || activity.description.toLowerCase().includes(term)),
    )
  }, [activities, filters, searchQuery])

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

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity)
    setIsDialogOpen(true)
  }

  return (
    <Box>
      <DocumentHeader
        perspectiveName={currentPerspective?.getDisplayName(lang) || ''}
        pageName={'Activités de recherche'}
      >
        <Button
          variant='contained'
          startIcon={<Add />}
          onClick={() => {
            setEditingActivity(null)
            setIsDialogOpen(true)
          }}
          sx={{ whiteSpace: 'nowrap' }}
        >
          {'Ajouter une activité'}
        </Button>
      </DocumentHeader>

      <Box
        data-tour='activities-header'
        sx={{ mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 4, overflow: 'hidden', bgcolor: 'background.paper' }}
      >
        <ListFilterBar
          filters={TYPE_FILTER}
          dateFilterId='date'
          dateFilterLabel='Année'
          columnFilters={filters}
          onColumnFiltersChange={setFilters}
          globalFilter={searchQuery}
          onGlobalFilterChange={setSearchQuery}
        />
      </Box>

      {filteredActivities.length === 0 ? (
        <Box sx={{ py: 10, textAlign: 'center' }}>
          <Typography color='text.secondary'>{'Aucune activité ne correspond à ces filtres.'}</Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' },
            gap: 3,
          }}
        >
          {filteredActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onEdit={handleEditActivity}
              onDelete={setToDelete}
            />
          ))}
        </Box>
      )}

      <Dialog open={Boolean(toDelete)} onClose={() => setToDelete(null)} maxWidth='xs' fullWidth>
        <DialogTitle>{'Supprimer cette activité ?'}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`« ${toDelete?.title ?? ''} » sera retirée de vos activités.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToDelete(null)}>{'Annuler'}</Button>
          <Button
            variant='contained'
            color='error'
            onClick={() => {
              setActivities(activities.filter((a) => a.id !== toDelete?.id))
              setToDelete(null)
            }}
          >
            {'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>

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
