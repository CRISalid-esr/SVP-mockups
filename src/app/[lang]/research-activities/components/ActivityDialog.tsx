'use client'

import React, { useEffect, useState } from 'react'
import { ArrowBack, Close } from '@mui/icons-material'
import {
  Box,
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Activity, ActivityType } from '@/types/Activity'
import { ACTIVITY_TYPES, isPunctual } from './activityTypes'

// ─── Champs propres à chaque type ──────────────────────────────────────────

interface SpecificField {
  key: string
  label: string
  placeholder?: string
  options?: { value: string; label?: string }[]
  type?: 'number'
  /** Occupe toute la largeur. */
  wide?: boolean
}

const values = (...items: string[]) => items.map((value) => ({ value }))

const SPECIFIC_FIELDS: Record<ActivityType, SpecificField[]> = {
  projet: [
    { key: 'role', label: 'Rôle', options: values('Coordinateur', 'Participant', 'Responsable de tâche') },
    { key: 'budget', label: 'Budget', placeholder: '450 000 €' },
  ],
  encadrement: [
    { key: 'student', label: 'Nom de l’étudiant·e', placeholder: 'Marie Dupont', wide: true },
    { key: 'level', label: 'Niveau', options: values('Stage', 'Master', 'PhD', 'Post-doc') },
    { key: 'percentage', label: 'Taux d’encadrement', placeholder: '50%' },
  ],
  brevet: [
    { key: 'number', label: 'Numéro de dépôt', placeholder: 'FR2024001234' },
    { key: 'status', label: 'Statut', options: values('Déposé', 'En cours d\'examen', 'Délivré', 'Rejeté') },
  ],
  conference: [
    { key: 'location', label: 'Lieu', placeholder: 'Paris, France' },
    { key: 'type', label: 'Type d’intervention', options: values('Keynote', 'Invited talk', 'Présentation', 'Poster') },
  ],
  distinction: [
    { key: 'organization', label: 'Organisation', placeholder: 'Académie des sciences', wide: true },
  ],
  editorial: [
    { key: 'journal', label: 'Revue ou ouvrage', placeholder: 'Journal of Machine Learning Research', wide: true },
    { key: 'role', label: 'Rôle', options: values('Rédacteur en chef', 'Éditeur associé', 'Relecteur', 'Coordinateur de numéro'), wide: true },
  ],
  enseignement: [
    { key: 'establishment', label: 'Établissement', placeholder: 'Université de Nantes' },
    { key: 'level', label: 'Niveau', options: values('Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2', 'Doctorat', 'École d\'ingénieurs', 'Formation continue') },
    { key: 'subject', label: 'Matière ou UE', placeholder: 'Intelligence artificielle', wide: true },
    {
      key: 'courseType',
      label: 'Type de cours',
      options: [
        { value: 'CM', label: 'CM (cours magistral)' },
        { value: 'TD', label: 'TD (travaux dirigés)' },
        { value: 'TP', label: 'TP (travaux pratiques)' },
        { value: 'Mixte', label: 'Mixte (CM, TD, TP)' },
      ],
    },
    { key: 'hours', label: 'Volume horaire (heures)', placeholder: '48', type: 'number' },
  ],
  mediation: [
    { key: 'audience', label: 'Public cible', placeholder: 'Grand public, scolaires…' },
    { key: 'location', label: 'Lieu', placeholder: 'Fête de la Science, Nantes' },
  ],
}

const TYPES = Object.keys(ACTIVITY_TYPES) as ActivityType[]

/** Une erreur par champ, avec ce qu'il faut faire. */
const validate = ({ title, startDate, endDate, url }: Partial<Activity>) => ({
  title: title?.trim() ? null : 'Indiquez un intitulé.',
  startDate: startDate ? null : 'Indiquez une date.',
  endDate: endDate && startDate && endDate < startDate ? 'La fin doit suivre le début.' : null,
  url: url?.trim() && !/^https?:\/\/\S+$/i.test(url.trim()) ? 'Saisissez une adresse commençant par https://' : null,
})

// ─── Composant ─────────────────────────────────────────────────────────────

interface ActivityDialogProps {
  open: boolean
  onClose: () => void
  onSave: (activity: Partial<Activity>) => void
  activity?: Activity | null
}

const ActivityDialog: React.FC<ActivityDialogProps> = ({ open, onClose, onSave, activity }) => {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const [step, setStep] = useState<'category' | 'form'>('category')
  const [formData, setFormData] = useState<Partial<Activity>>({})
  const [showErrors, setShowErrors] = useState(false)

  useEffect(() => {
    if (open) {
      setFormData(activity ?? {})
      setStep(activity ? 'form' : 'category')
      setShowErrors(false)
    }
  }, [activity, open])

  const patch = (changes: Partial<Activity>) => setFormData((current) => ({ ...current, ...changes }))
  const setSpecific = (key: string, value: string) =>
    setFormData((current) => ({ ...current, specificData: { ...current.specificData, [key]: value } }))

  // Changer de type garde ce qui est commun et retire ce qui lui était propre.
  const selectType = (type: ActivityType) => {
    patch({ type, specificData: formData.type === type ? formData.specificData : {} })
    setStep('form')
  }

  const errors = validate(formData)
  const hasErrors = Object.values(errors).some(Boolean)
  const errorOf = (field: keyof typeof errors) => (showErrors ? errors[field] : null)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (hasErrors) {
      setShowErrors(true)
      return
    }
    const punctual = formData.type ? isPunctual(formData.type) : false
    onSave({
      ...formData,
      title: formData.title?.trim(),
      description: formData.description?.trim() ?? '',
      url: formData.url?.trim() || undefined,
      endDate: punctual ? undefined : formData.endDate || undefined,
    })
  }

  // Un clic à côté de la fenêtre ne doit pas faire perdre une saisie.
  const isDirty = !activity && Boolean(formData.title || formData.description || formData.startDate)
  const handleDialogClose = (_event: object, reason: 'backdropClick' | 'escapeKeyDown') => {
    if (reason === 'backdropClick' && (isDirty || activity)) return
    onClose()
  }

  const style = formData.type ? ACTIVITY_TYPES[formData.type] : null
  const Icon = style?.icon
  const showForm = step === 'form' && style && formData.type
  const punctual = formData.type ? isPunctual(formData.type) : false

  return (
    <Dialog open={open} onClose={handleDialogClose} maxWidth='sm' fullWidth fullScreen={fullScreen} aria-labelledby='activity-dialog-title'>
      {showForm && Icon ? (
        <DialogTitle
          id='activity-dialog-title'
          component='div'
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3, py: 2, bgcolor: style.tint }}
        >
          {!activity && (
            <IconButton aria-label='Changer de type' onClick={() => setStep('category')} sx={{ color: style.ink, ml: -1 }}>
              <ArrowBack />
            </IconButton>
          )}
          <Box sx={{ width: 44, height: 44, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: 3, bgcolor: style.main, color: '#fff' }}>
            <Icon size={22} />
          </Box>
          <Typography variant='h6' component='h2' sx={{ flex: 1, minWidth: 0, color: style.ink }}>
            {activity ? `Modifier : ${style.label.toLowerCase()}` : style.addTitle}
          </Typography>
          <IconButton aria-label='Fermer' onClick={onClose} sx={{ color: style.ink, mr: -1 }}>
            <Close />
          </IconButton>
        </DialogTitle>
      ) : (
        <DialogTitle id='activity-dialog-title' component='div' sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2 }}>
          <Typography variant='h6' component='h2'>Quel type d’activité ?</Typography>
          <IconButton aria-label='Fermer' onClick={onClose} sx={{ color: 'text.primary', mr: -1 }}>
            <Close />
          </IconButton>
        </DialogTitle>
      )}

      {!showForm && (
        <DialogContent sx={{ px: 3, pb: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.5 }}>
            {TYPES.map((type) => {
              const typeStyle = ACTIVITY_TYPES[type]
              const TypeIcon = typeStyle.icon
              return (
                <ButtonBase
                  key={type}
                  onClick={() => selectType(type)}
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    gap: 1.5,
                    p: 1.5,
                    textAlign: 'left',
                    borderRadius: 3,
                    bgcolor: typeStyle.tint,
                    outline: formData.type === type ? `2px solid ${typeStyle.main}` : 'none',
                    '&:hover': { outline: `2px solid ${typeStyle.main}` },
                    '&.Mui-focusVisible': { outline: `2px solid ${typeStyle.main}`, outlineOffset: 2 },
                  }}
                >
                  <Box sx={{ width: 40, height: 40, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: 2, bgcolor: typeStyle.main, color: '#fff' }}>
                    <TypeIcon size={20} />
                  </Box>
                  <Box sx={{ minWidth: 0, color: typeStyle.ink }}>
                    <Typography variant='body1' fontWeight={600}>{typeStyle.label}</Typography>
                    <Typography variant='body2'>{typeStyle.hint}</Typography>
                  </Box>
                </ButtonBase>
              )
            })}
          </Box>
        </DialogContent>
      )}

      {showForm && (
        <Box component='form' noValidate onSubmit={handleSubmit} sx={{ display: 'contents' }}>
          <DialogContent sx={{ px: 3, pt: '24px !important', pb: 3 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2.5 }}>
              <TextField
                autoFocus
                required
                label='Intitulé'
                placeholder={style.titleExample}
                value={formData.title ?? ''}
                error={Boolean(errorOf('title'))}
                helperText={errorOf('title')}
                onChange={(e) => patch({ title: e.target.value })}
                sx={{ gridColumn: '1 / -1' }}
              />
              <TextField
                required
                type='date'
                label={punctual ? 'Date' : 'Début'}
                slotProps={{ inputLabel: { shrink: true } }}
                value={formData.startDate ?? ''}
                error={Boolean(errorOf('startDate'))}
                helperText={errorOf('startDate')}
                onChange={(e) => patch({ startDate: e.target.value })}
                sx={punctual ? { gridColumn: '1 / -1', maxWidth: { sm: 'calc(50% - 10px)' } } : undefined}
              />
              {!punctual && (
                <TextField
                  type='date'
                  label='Fin'
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={formData.endDate ?? ''}
                  error={Boolean(errorOf('endDate'))}
                  helperText={errorOf('endDate') ?? 'Laissez vide si l’activité est en cours.'}
                  onChange={(e) => patch({ endDate: e.target.value })}
                />
              )}

              {SPECIFIC_FIELDS[formData.type as ActivityType].map((field) => (
                <TextField
                  key={field.key}
                  select={Boolean(field.options)}
                  type={field.type}
                  label={field.label}
                  placeholder={field.placeholder}
                  value={formData.specificData?.[field.key] ?? ''}
                  onChange={(e) => setSpecific(field.key, e.target.value)}
                  sx={field.wide ? { gridColumn: '1 / -1' } : undefined}
                >
                  {field.options?.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label ?? option.value}</MenuItem>
                  ))}
                </TextField>
              ))}

              <TextField
                multiline
                minRows={3}
                label='Description'
                value={formData.description ?? ''}
                onChange={(e) => patch({ description: e.target.value })}
                sx={{ gridColumn: '1 / -1' }}
              />
              <TextField
                type='url'
                label='Site web'
                placeholder='https://…'
                value={formData.url ?? ''}
                error={Boolean(errorOf('url'))}
                helperText={errorOf('url')}
                onChange={(e) => patch({ url: e.target.value })}
                sx={{ gridColumn: '1 / -1' }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button onClick={onClose}>Annuler</Button>
            <Button type='submit' variant='contained'>
              {activity ? 'Enregistrer' : 'Ajouter l’activité'}
            </Button>
          </DialogActions>
        </Box>
      )}
    </Dialog>
  )
}

export default ActivityDialog
