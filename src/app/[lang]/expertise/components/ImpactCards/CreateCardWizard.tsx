'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material'
import { CloseOutlined } from '@mui/icons-material'
import {
  ImpactCard,
  ImpactFamily,
  PROFILE_CONFIG,
  ProfileType,
  TARGET_AUDIENCE_OPTIONS,
} from './impactCardsTypes'
import { ExpertiseAttributes } from '../../types'
import AttributesEditor from '../AttributesEditor'

const STEPS = ['Public & Thème', 'Titre & Description', 'Audiences & Caractéristiques']

interface Props {
  open: boolean
  families: ImpactFamily[]
  /** Caractéristiques du thème source, par id de famille (pré-remplissage). */
  familyAttributes?: Record<string, ExpertiseAttributes | undefined>
  onClose: () => void
  onCreate: (card: Omit<ImpactCard, 'id'>) => void
}

const EMPTY: Omit<ImpactCard, 'id'> = {
  title: '',
  description: '',
  profile: 'RECHERCHE',
  specialization: 5,
  targetAudiences: [],
  status: 'TO_VALIDATE',
  visibility: 'PRIVATE',
  familyId: '',
  lastUpdate: new Date().toLocaleDateString('fr-FR'),
  attributes: {},
}

export default function CreateCardWizard({ open, families, familyAttributes, onClose, onCreate }: Props) {
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Omit<ImpactCard, 'id'>>(EMPTY)

  const cfg = PROFILE_CONFIG[draft.profile]

  const reset = () => { setStep(0); setDraft(EMPTY) }
  const handleClose = () => { reset(); onClose() }

  const handleNext = () => setStep((s) => Math.min(s + 1, 2))
  const handleBack = () => setStep((s) => Math.max(s - 1, 0))

  const canNext = () => {
    if (step === 0) return draft.profile && draft.familyId
    if (step === 1) return draft.title.trim().length > 0
    return true
  }

  const handleCreate = () => {
    onCreate({ ...draft, lastUpdate: new Date().toLocaleDateString('fr-FR') })
    reset()
    onClose()
  }

  const toggleAudience = (a: string) => {
    setDraft((d) => ({
      ...d,
      targetAudiences: d.targetAudiences.includes(a)
        ? d.targetAudiences.filter((x) => x !== a)
        : [...d.targetAudiences, a],
    }))
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Nouvelle fiche expertise</Typography>
          <Typography variant="caption" color="text.secondary">
            Étape {step + 1} / {STEPS.length}
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleClose}><CloseOutlined fontSize="small" /></IconButton>
      </DialogTitle>

      <Box sx={{ px: 3, pb: 1 }}>
        <Stepper activeStep={step} alternativeLabel>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: '0.75rem' } }}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <DialogContent sx={{ pt: 2 }}>
        {step === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Profil d&apos;audience
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {(Object.keys(PROFILE_CONFIG) as ProfileType[]).map((p) => {
                  const c = PROFILE_CONFIG[p]
                  const selected = draft.profile === p
                  return (
                    <Box
                      key={p}
                      onClick={() => setDraft((d) => ({ ...d, profile: p }))}
                      sx={{
                        border: `2px solid ${selected ? c.border : '#E5E7EB'}`,
                        borderRadius: 2,
                        p: 1.5,
                        cursor: 'pointer',
                        bgcolor: selected ? c.bg : 'background.paper',
                        minWidth: 110,
                        transition: 'all 0.15s',
                        '&:hover': { borderColor: c.border },
                      }}
                    >
                      <c.Icon sx={{ fontSize: 22, color: c.border, mb: 0.5 }} />
                      <Typography variant="body2" sx={{ fontWeight: 700, color: c.color }}>{c.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{c.desc}</Typography>
                    </Box>
                  )
                })}
              </Box>
            </Box>

            <FormControl size="small" fullWidth>
              <InputLabel>Thème de recherche</InputLabel>
              <Select
                value={draft.familyId}
                label="Thème de recherche"
                onChange={(e) => {
                  const familyId = e.target.value
                  // Pré-remplit les caractéristiques depuis le thème source.
                  const inherited = familyAttributes?.[familyId]
                  setDraft((d) => ({ ...d, familyId, attributes: inherited ? { ...inherited } : {} }))
                }}
              >
                {families.map((f) => (
                  <MenuItem key={f.id} value={f.id}>{f.title}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}

        {step === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: cfg.bg, borderRadius: 1 }}>
              <cfg.Icon sx={{ fontSize: 20, color: cfg.border }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: cfg.color }}>
                Profil : {cfg.label} — {cfg.desc}
              </Typography>
            </Box>
            <TextField
              label="Titre de la fiche"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              fullWidth
              size="small"
              placeholder={`Formulez le titre pour ${cfg.desc.replace('Cible : ', '')}`}
            />
            <TextField
              label="Description"
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              fullWidth
              multiline
              rows={4}
              size="small"
              placeholder="Décrivez votre expertise de façon adaptée à ce public…"
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                Niveau de spécialisation (1 = grand public, 10 = très spécialisé)
              </Typography>
              <FormControl size="small" sx={{ minWidth: 70 }}>
                <Select
                  value={draft.specialization}
                  onChange={(e) => setDraft((d) => ({ ...d, specialization: Number(e.target.value) }))}
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <MenuItem key={n} value={n}>{n}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        )}

        {step === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Audiences cibles (sélectionner plusieurs)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {TARGET_AUDIENCE_OPTIONS.map((a) => (
                  <Chip
                    key={a}
                    label={a}
                    size="small"
                    clickable
                    onClick={() => toggleAudience(a)}
                    sx={{
                      bgcolor: draft.targetAudiences.includes(a) ? cfg.border : undefined,
                      color: draft.targetAudiences.includes(a) ? '#fff' : undefined,
                      fontWeight: draft.targetAudiences.includes(a) ? 700 : undefined,
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Caractéristiques du thème de recherche
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 1.5 }}>
                Héritées du thème sélectionné — ajustez-les pour cette fiche si besoin.
              </Typography>
              <AttributesEditor
                value={draft.attributes ?? {}}
                onChange={(attributes) => setDraft((d) => ({ ...d, attributes }))}
              />
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2, pt: 1, borderTop: 1, borderColor: 'divider' }}>
        <Button size="small" onClick={handleClose} sx={{ textTransform: 'none', mr: 'auto' }}>
          Annuler
        </Button>
        {step > 0 && (
          <Button size="small" onClick={handleBack} sx={{ textTransform: 'none' }}>
            Retour
          </Button>
        )}
        {step < 2 ? (
          <Button
            size="small"
            variant="contained"
            onClick={handleNext}
            disabled={!canNext()}
            sx={{ textTransform: 'none', bgcolor: cfg.border, '&:hover': { bgcolor: cfg.border, filter: 'brightness(0.9)' } }}
          >
            Suivant
          </Button>
        ) : (
          <Button
            size="small"
            variant="contained"
            onClick={handleCreate}
            sx={{ textTransform: 'none', bgcolor: cfg.border, '&:hover': { bgcolor: cfg.border, filter: 'brightness(0.9)' } }}
          >
            Créer la fiche
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
