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
  SPECIFIC_SUGGESTIONS,
  TARGET_AUDIENCE_OPTIONS,
} from './impactCardsTypes'

const STEPS = ['Profil & Famille', 'Titre & Description', 'Audiences & Spécifiques']

interface Props {
  open: boolean
  families: ImpactFamily[]
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
  specifics: {},
}

export default function CreateCardWizard({ open, families, onClose, onCreate }: Props) {
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Omit<ImpactCard, 'id'>>(EMPTY)
  const [newSpecKey, setNewSpecKey] = useState('')
  const [newSpecVal, setNewSpecVal] = useState('')

  const cfg = PROFILE_CONFIG[draft.profile]

  const reset = () => { setStep(0); setDraft(EMPTY); setNewSpecKey(''); setNewSpecVal('') }
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

  const addSpecific = () => {
    if (!newSpecKey.trim()) return
    setDraft((d) => ({ ...d, specifics: { ...(d.specifics ?? {}), [newSpecKey]: newSpecVal } }))
    setNewSpecKey('')
    setNewSpecVal('')
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Nouvelle carte impact</Typography>
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
              <InputLabel>Famille (expertise source)</InputLabel>
              <Select
                value={draft.familyId}
                label="Famille (expertise source)"
                onChange={(e) => setDraft((d) => ({ ...d, familyId: e.target.value }))}
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
              label="Titre de la carte"
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
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Informations spécifiques (facultatif)
              </Typography>
              {Object.entries(draft.specifics ?? {}).map(([key, val]) => (
                <Box key={key} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 100, color: 'text.secondary' }}>
                    {key}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1 }}>{val}</Typography>
                  <Button size="small" color="error" onClick={() => {
                    const next = { ...(draft.specifics ?? {})} ; delete next[key]
                    setDraft((d) => ({ ...d, specifics: next }))
                  }} sx={{ minWidth: 0, px: 1 }}>×</Button>
                </Box>
              ))}
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <FormControl size="small" sx={{ flex: 1 }}>
                  <InputLabel>Clé</InputLabel>
                  <Select value={newSpecKey} label="Clé" onChange={(e) => setNewSpecKey(e.target.value)} renderValue={(v) => v}>
                    {SPECIFIC_SUGGESTIONS.map((s) => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField label="Valeur" size="small" value={newSpecVal} onChange={(e) => setNewSpecVal(e.target.value)} sx={{ flex: 2 }} />
                <Button variant="outlined" size="small" onClick={addSpecific} sx={{ textTransform: 'none' }}>
                  +
                </Button>
              </Box>
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
            Créer la carte
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
