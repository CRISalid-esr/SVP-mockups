'use client'

import React, { useEffect, useMemo, useState } from 'react'
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
import { INITIAL_ACTIVITIES, loadActivities, saveActivities } from './activitiesStore'
import ActivityCard from './components/ActivityCard'
import ActivityDialog from './components/ActivityDialog'
import GraphProposals from './components/GraphProposals'
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

const ResearchActivitiesPage = () => {
  const { currentPerspective, ownPerspective } = useStore((state) => state.user)
  const lang = Lingui.i18n.locale as ExtendedLanguageCode

  const [activities, setActivitiesState] = useState<Activity[]>(INITIAL_ACTIVITIES)
  // Lu après le montage : la page est pré-rendue sans localStorage.
  useEffect(() => setActivitiesState(loadActivities()), [])
  const setActivities = (next: Activity[]) => {
    setActivitiesState(next)
    saveActivities(next)
  }
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

      {ownPerspective && (
        <GraphProposals onAccept={(activity) => setActivities([activity, ...activities])} />
      )}

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
