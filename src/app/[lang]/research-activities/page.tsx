'use client'

import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Grid2 as Grid,
  TextField,
  MenuItem,
  Stack,
} from '@mui/material'
import { Plus } from '@untitled-ui/icons-react'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'
import DocumentHeader from '@/app/[lang]/documents/components/DocumentHeader'
import useStore from '@/stores/global_store'
import * as Lingui from '@lingui/core'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'
import { Activity, ActivityType } from '@/types/Activity'
import ActivityCard from './components/ActivityCard'
import ActivityDialog from './components/ActivityDialog'

const initialActivities: Activity[] = [
  {
    id: '1',
    type: 'projet',
    title: 'ANR SoVisuPlus',
    startDate: '2023-01-01',
    endDate: '2025-12-31',
    description: 'Projet de recherche sur la visualisation des données scientifiques.',
    specificData: { budget: '250k€', role: 'Coordinateur' }
  },
  {
    id: '2',
    type: 'encadrement',
    title: 'Thèse : IA et Visualisation',
    startDate: '2022-10-15',
    description: 'Direction de la thèse de Jean Dupont sur l\'application de l\'IA aux outils de visualisation.',
    specificData: { student: 'Jean Dupont', level: 'PhD' }
  }
]

const ResearchActivitiesPage = () => {
  const { currentPerspective } = useStore((state) => state.user)
  const lang = Lingui.i18n.locale as ExtendedLanguageCode

  const [activities, setActivities] = useState<Activity[]>(initialActivities)
  const [filterType, setFilterType] = useState<ActivityType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)

  const filteredActivities = activities.filter(activity => {
    const matchesType = filterType === 'all' || activity.type === filterType
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const handleSaveActivity = (data: Partial<Activity>) => {
    if (editingActivity) {
      setActivities(activities.map(a => a.id === editingActivity.id ? { ...a, ...data } as Activity : a))
    } else {
      const newActivity: Activity = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
      } as Activity
      setActivities([newActivity, ...activities])
    }
    setIsDialogOpen(false)
    setEditingActivity(null)
  }

  const handleDeleteActivity = (activity: Activity) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette activité ?')) {
      setActivities(activities.filter(a => a.id !== activity.id))
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
        pageName={t`research_activities_page_main_title`}
      />

      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4">
            <Trans>research_activities_page_main_title</Trans>
          </Typography>
          <Button
            variant="contained"
            startIcon={<Plus width={20} height={20} />}
            onClick={() => {

              setEditingActivity(null)
              setIsDialogOpen(true)
            }}
          >
            Ajouter une activité
          </Button>
        </Box>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 4 }}>
          <TextField
            placeholder="Rechercher une activité..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <TextField
            select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ActivityType | 'all')}
            sx={{ minWidth: 200 }}
            label="Type d'activité"
          >
            <MenuItem value="all">Tous les types</MenuItem>
            <MenuItem value="projet">Projets</MenuItem>
            <MenuItem value="encadrement">Encadrement</MenuItem>
            <MenuItem value="brevet">Brevets</MenuItem>
            <MenuItem value="conference">Conférences</MenuItem>
            <MenuItem value="enseignement">Enseignement</MenuItem>
            <MenuItem value="editorial">Éditorial</MenuItem>
            <MenuItem value="distinction">Distinctions</MenuItem>
            <MenuItem value="mediation">Médiation</MenuItem>
          </TextField>
        </Stack>

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
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="bodyLarge" color="text.secondary">
                  Aucune activité trouvée.
                </Typography>
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

