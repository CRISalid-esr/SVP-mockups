'use client'

import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2 as Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import {
  ArrowBack,
  Close,
  EmojiEvents,
  Engineering,
  Hub,
  Lightbulb,
  MenuBook,
  MicExternalOn,
  People,
  School,
} from '@mui/icons-material'
import { Activity, ActivityType } from '@/types/Activity'

// ─── Type catalogue ────────────────────────────────────────────────────────

const ACTIVITY_TYPES: {
  id: ActivityType
  label: string
  icon: React.ReactNode
  color: string
}[] = [
  { id: 'projet', label: 'Projet', icon: <Hub />, color: '#006A61' },
  { id: 'encadrement', label: 'Encadrement', icon: <People />, color: '#0088CC' },
  { id: 'editorial', label: 'Éditorial', icon: <MenuBook />, color: '#9B59B6' },
  { id: 'brevet', label: 'Brevet', icon: <Lightbulb />, color: '#F39C12' },
  { id: 'conference', label: 'Conférence', icon: <MicExternalOn />, color: '#E74C3C' },
  { id: 'distinction', label: 'Distinction', icon: <EmojiEvents />, color: '#D4AF37' },
  { id: 'mediation', label: 'Médiation', icon: <Engineering />, color: '#16A085' },
  { id: 'enseignement', label: 'Enseignement', icon: <School />, color: '#2ECC71' },
]

// ─── Props ─────────────────────────────────────────────────────────────────

interface ActivityDialogProps {
  open: boolean
  onClose: () => void
  onSave: (activity: Partial<Activity>) => void
  activity?: Activity | null
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function updateSpecific(
  formData: Partial<Activity>,
  setFormData: React.Dispatch<React.SetStateAction<Partial<Activity>>>,
  key: string,
  value: string,
) {
  setFormData({ ...formData, specificData: { ...formData.specificData, [key]: value } })
}

// ─── Component ─────────────────────────────────────────────────────────────

const ActivityDialog: React.FC<ActivityDialogProps> = ({
  open,
  onClose,
  onSave,
  activity,
}) => {
  const [step, setStep] = useState<'category' | 'form'>('category')
  const [formData, setFormData] = useState<Partial<Activity>>({})

  useEffect(() => {
    if (open) {
      if (activity) {
        setFormData(activity)
        setStep('form')
      } else {
        setFormData({})
        setStep('category')
      }
    }
  }, [activity, open])

  const set = (key: string, value: string) => updateSpecific(formData, setFormData, key, value)

  const handleTypeSelect = (type: ActivityType) => {
    setFormData({ type })
    setStep('form')
  }

  const handleSubmit = () => {
    if (!formData.title?.trim() || !formData.startDate) return
    onSave(formData)
  }

  // ─── Type-specific fields ─────────────────────────────────────────────

  const renderSpecificFields = () => {
    switch (formData.type) {
      case 'projet':
        return (
          <>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Budget"
                placeholder="ex : 450 000 €"
                value={formData.specificData?.budget || ''}
                onChange={(e) => set('budget', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                select
                label="Rôle"
                value={formData.specificData?.role || ''}
                onChange={(e) => set('role', e.target.value)}
              >
                <MenuItem value="Coordinateur">Coordinateur</MenuItem>
                <MenuItem value="Participant">Participant</MenuItem>
                <MenuItem value="Responsable de tâche">Responsable de tâche</MenuItem>
              </TextField>
            </Grid>
          </>
        )

      case 'encadrement':
        return (
          <>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Nom de l'étudiant·e"
                placeholder="ex : Marie Dupont"
                value={formData.specificData?.student || ''}
                onChange={(e) => set('student', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                select
                label="Niveau"
                value={formData.specificData?.level || ''}
                onChange={(e) => set('level', e.target.value)}
              >
                <MenuItem value="Stage">Stage</MenuItem>
                <MenuItem value="Master">Master</MenuItem>
                <MenuItem value="PhD">PhD</MenuItem>
                <MenuItem value="Post-doc">Post-doc</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                label="Encadrement"
                placeholder="50%"
                value={formData.specificData?.percentage || ''}
                onChange={(e) => set('percentage', e.target.value)}
              />
            </Grid>
          </>
        )

      case 'brevet':
        return (
          <>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Numéro de dépôt"
                placeholder="ex : FR2024001234"
                value={formData.specificData?.number || ''}
                onChange={(e) => set('number', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                select
                label="Statut"
                value={formData.specificData?.status || ''}
                onChange={(e) => set('status', e.target.value)}
              >
                <MenuItem value="Déposé">Déposé</MenuItem>
                <MenuItem value="En cours d'examen">{"En cours d'examen"}</MenuItem>
                <MenuItem value="Délivré">Délivré</MenuItem>
                <MenuItem value="Rejeté">Rejeté</MenuItem>
              </TextField>
            </Grid>
          </>
        )

      case 'conference':
        return (
          <>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Lieu"
                placeholder="ex : Paris, France"
                value={formData.specificData?.location || ''}
                onChange={(e) => set('location', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                select
                label="Type d'intervention"
                value={formData.specificData?.type || ''}
                onChange={(e) => set('type', e.target.value)}
              >
                <MenuItem value="Keynote">Keynote</MenuItem>
                <MenuItem value="Invited talk">Invited talk</MenuItem>
                <MenuItem value="Présentation">Présentation</MenuItem>
                <MenuItem value="Poster">Poster</MenuItem>
              </TextField>
            </Grid>
          </>
        )

      case 'distinction':
        return (
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Organisation"
              placeholder="ex : Académie des sciences"
              value={formData.specificData?.organization || ''}
              onChange={(e) => set('organization', e.target.value)}
            />
          </Grid>
        )

      case 'editorial':
        return (
          <>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                label="Revue / Ouvrage"
                placeholder="ex : Journal of Machine Learning Research"
                value={formData.specificData?.journal || ''}
                onChange={(e) => set('journal', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                select
                label="Rôle"
                value={formData.specificData?.role || ''}
                onChange={(e) => set('role', e.target.value)}
              >
                <MenuItem value="Rédacteur en chef">Rédacteur en chef</MenuItem>
                <MenuItem value="Éditeur associé">Éditeur associé</MenuItem>
                <MenuItem value="Relecteur">Relecteur</MenuItem>
                <MenuItem value="Coordinateur de numéro">Coordinateur de numéro</MenuItem>
              </TextField>
            </Grid>
          </>
        )

      case 'enseignement':
        return (
          <>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Établissement"
                placeholder="ex : Université de Nantes"
                value={formData.specificData?.establishment || ''}
                onChange={(e) => set('establishment', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                select
                label="Niveau"
                value={formData.specificData?.level || ''}
                onChange={(e) => set('level', e.target.value)}
              >
                {[
                  'Licence 1', 'Licence 2', 'Licence 3',
                  'Master 1', 'Master 2', 'Doctorat',
                  "École d'ingénieurs", 'Formation continue',
                ].map((v) => (
                  <MenuItem key={v} value={v}>{v}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Matière / UE"
                placeholder="ex : Intelligence Artificielle"
                value={formData.specificData?.subject || ''}
                onChange={(e) => set('subject', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                select
                label="Type de cours"
                value={formData.specificData?.courseType || ''}
                onChange={(e) => set('courseType', e.target.value)}
              >
                <MenuItem value="CM">CM (Cours Magistral)</MenuItem>
                <MenuItem value="TD">TD (Travaux Dirigés)</MenuItem>
                <MenuItem value="TP">TP (Travaux Pratiques)</MenuItem>
                <MenuItem value="Mixte">Mixte (CM/TD/TP)</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Volume horaire"
                placeholder="ex : 48"
                type="number"
                value={formData.specificData?.hours || ''}
                onChange={(e) => set('hours', e.target.value)}
                slotProps={{ input: { endAdornment: <Typography variant="caption">h</Typography> } }}
              />
            </Grid>
          </>
        )

      case 'mediation':
        return (
          <>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Public cible"
                placeholder="ex : Grand public, scolaires…"
                value={formData.specificData?.audience || ''}
                onChange={(e) => set('audience', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Lieu"
                placeholder="ex : Fête de la Science, Nantes"
                value={formData.specificData?.location || ''}
                onChange={(e) => set('location', e.target.value)}
              />
            </Grid>
          </>
        )

      default:
        return null
    }
  }

  const selectedTypeMeta = ACTIVITY_TYPES.find((t) => t.id === formData.type)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {step === 'form' && !activity && (
            <IconButton onClick={() => setStep('category')} size="small">
              <ArrowBack fontSize="small" />
            </IconButton>
          )}
          <Typography variant="h6">
            {activity
              ? "Modifier l'activité"
              : step === 'category'
                ? 'Choisir un type'
                : `Ajouter — ${selectedTypeMeta?.label ?? ''}`}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ minHeight: 320 }}>
        {/* Étape 1 : sélection du type */}
        {step === 'category' && (
          <Grid container spacing={2} sx={{ pt: 1 }}>
            {ACTIVITY_TYPES.map((type) => (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={type.id}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleTypeSelect(type.id)}
                  sx={{
                    height: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    textTransform: 'none',
                    borderColor: `${type.color}40`,
                    color: type.color,
                    '&:hover': {
                      borderColor: type.color,
                      bgcolor: `${type.color}08`,
                    },
                  }}
                >
                  <Box sx={{ color: type.color, fontSize: 28 }}>{type.icon}</Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {type.label}
                  </Typography>
                </Button>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Étape 2 : formulaire */}
        {step === 'form' && (
          <Grid container spacing={2.5} sx={{ pt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Titre / Nom de l'activité *"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                autoFocus
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Date de début *"
                slotProps={{ inputLabel: { shrink: true } }}
                value={formData.startDate || ''}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Date de fin"
                slotProps={{ inputLabel: { shrink: true } }}
                value={formData.endDate || ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="URL"
                type="url"
                placeholder="https://…"
                value={formData.url || ''}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
            </Grid>
            {renderSpecificFields()}
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ textTransform: 'none' }}>
          {'Annuler'}
        </Button>
        {step === 'form' && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ textTransform: 'none' }}
            disabled={!formData.title?.trim() || !formData.startDate}
          >
            {'Enregistrer'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default ActivityDialog
