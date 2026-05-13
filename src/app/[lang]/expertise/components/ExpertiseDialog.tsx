'use client'

import React, { useEffect, useState } from 'react'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid2 as Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import {
  ArrowBack,
  Business,
  CalendarToday,
  Close,
  EmojiEvents,
  LocationOn,
  Psychology,
  School,
  Tv,
} from '@mui/icons-material'
import { Expertise, ExpertiseFormData, ExpertiseLevel, GeographicZone } from '@/types/Expertise'
import { CATEGORIES } from './ExpertiseCard'

// ─── Constants ─────────────────────────────────────────────────────────────

const TEMPORAL_PERIODS = [
  { value: 'antiquite', label: 'Antiquité (avant 500)' },
  { value: 'medieval', label: 'Moyen Âge (500–1500)' },
  { value: 'moderne', label: 'Époque moderne (1500–1800)' },
  { value: 'contemporain', label: 'Époque contemporaine (1800–2000)' },
  { value: 'recent', label: 'Période récente (2000–présent)' },
]

const GEOGRAPHIC_OPTIONS: GeographicZone[] = [
  { type: 'country', name: 'France', code: 'FR' },
  { type: 'country', name: 'Allemagne', code: 'DE' },
  { type: 'country', name: 'Royaume-Uni', code: 'GB' },
  { type: 'country', name: 'États-Unis', code: 'US' },
  { type: 'country', name: 'Canada', code: 'CA' },
  { type: 'country', name: 'Japon', code: 'JP' },
  { type: 'country', name: 'Chine', code: 'CN' },
  { type: 'country', name: 'Brésil', code: 'BR' },
  { type: 'geopolitical', name: 'Union Européenne' },
  { type: 'geopolitical', name: 'Afrique Subsaharienne' },
  { type: 'geopolitical', name: 'Amérique du Nord' },
  { type: 'geopolitical', name: 'Asie-Pacifique' },
  { type: 'geopolitical', name: 'Méditerranée' },
  { type: 'physical', name: 'International' },
  { type: 'physical', name: 'Atlantique Nord' },
  { type: 'physical', name: 'Bassin Méditerranéen' },
]

const ZONE_STYLES: Record<string, { bg: string; color: string }> = {
  country: { bg: '#e0f2fe', color: '#0369a1' },
  geopolitical: { bg: '#fef3c7', color: '#92400e' },
  physical: { bg: '#dcfce7', color: '#166534' },
}

const EMPTY_AVAILABILITY = {
  pressWritten: false,
  pressTvRadio: false,
  publicConferences: false,
  hotTopics: false,
  academicConferences: false,
  businessPartnerships: false,
  publicExpertise: false,
  schoolInterventions: false,
  mediaTraining: false,
}

const EMPTY_FORM: ExpertiseFormData = {
  name: '',
  category: '',
  description: '',
  keywords: '',
  geographicZones: [],
  temporalPeriodType: 'custom',
  temporalPeriodStandard: '',
  temporalStartYear: '',
  temporalEndYear: '',
  level: 'veille',
  availability: { ...EMPTY_AVAILABILITY },
}

// ─── Steps ─────────────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Informations générales', icon: Psychology },
  { label: 'Contexte / Terrain', icon: LocationOn },
  { label: "Niveau d'expertise", icon: EmojiEvents },
  { label: 'Disponibilités', icon: CalendarToday },
]

// ─── Props ─────────────────────────────────────────────────────────────────

interface ExpertiseDialogProps {
  open: boolean
  onClose: () => void
  onSave: (data: Partial<Expertise>) => void
  expertise?: Expertise | null
}

// ─── Step content ──────────────────────────────────────────────────────────

function StepGeneralInfo({
  formData,
  setFormData,
}: {
  formData: ExpertiseFormData
  setFormData: React.Dispatch<React.SetStateAction<ExpertiseFormData>>
}) {
  return (
    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Alert severity="info">
        {'Commencez par décrire votre expertise (champs marqués * sont obligatoires)'}
      </Alert>
      <TextField
        fullWidth
        label="Nom de l'expertise *"
        placeholder="Ex : Intelligence Artificielle"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={!formData.name}
        helperText={!formData.name ? 'Le nom est requis' : ''}
      />
      <FormControl fullWidth required error={!formData.category}>
        <InputLabel>{'Catégorie *'}</InputLabel>
        <Select
          label="Catégorie *"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            return (
              <MenuItem key={cat.name} value={cat.name}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon sx={{ color: cat.color, fontSize: 18 }} />
                  {cat.name}
                </Box>
              </MenuItem>
            )
          })}
        </Select>
      </FormControl>
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Description"
        placeholder="Décrivez votre expertise…"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />
      <TextField
        fullWidth
        label="Mots-clés"
        placeholder="Séparez les mots-clés par des virgules"
        helperText="Ex : Intelligence artificielle, Machine Learning, Deep Learning"
        value={formData.keywords}
        onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
      />
    </Box>
  )
}

function StepContext({
  formData,
  setFormData,
}: {
  formData: ExpertiseFormData
  setFormData: React.Dispatch<React.SetStateAction<ExpertiseFormData>>
}) {
  return (
    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Alert severity="info">
        {'Définissez le contexte géographique et temporel de votre expertise'}
      </Alert>

      <Autocomplete
        multiple
        options={GEOGRAPHIC_OPTIONS}
        getOptionLabel={(o) => o.name}
        groupBy={(o) =>
          o.type === 'country' ? '🌍 Pays' : o.type === 'geopolitical' ? '🌐 Zones géopolitiques' : '🗺️ Zones physiques'
        }
        value={formData.geographicZones}
        onChange={(_, v) => setFormData({ ...formData, geographicZones: v })}
        isOptionEqualToValue={(opt, val) => opt.name === val.name}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Zone géographique *"
            placeholder="Sélectionnez une ou plusieurs zones"
            error={formData.geographicZones.length === 0}
            helperText={
              formData.geographicZones.length === 0
                ? 'Au moins une zone est requise'
                : ''
            }
          />
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => {
            const { key, ...tagProps } = getTagProps({ index })
            const s = ZONE_STYLES[option.type] ?? { bg: '#f3f4f6', color: '#374151' }
            return (
              <Chip
                key={key}
                label={option.name}
                {...tagProps}
                size="small"
                sx={{ bgcolor: s.bg, color: s.color }}
              />
            )
          })
        }
      />

      <Divider />

      <FormControl component="fieldset">
        <FormLabel component="legend">{'Période temporelle *'}</FormLabel>
        <RadioGroup
          value={formData.temporalPeriodType}
          onChange={(e) =>
            setFormData({ ...formData, temporalPeriodType: e.target.value as 'standard' | 'custom' })
          }
        >
          <FormControlLabel value="custom" control={<Radio />} label="Période personnalisée (années)" />
          <FormControlLabel value="standard" control={<Radio />} label="Période standard (époque historique)" />
        </RadioGroup>
      </FormControl>

      {formData.temporalPeriodType === 'custom' ? (
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              label="Année de début *"
              type="number"
              value={formData.temporalStartYear}
              onChange={(e) => setFormData({ ...formData, temporalStartYear: e.target.value })}
              placeholder="Ex : 2020"
              error={!formData.temporalStartYear}
              helperText={!formData.temporalStartYear ? 'Requis' : ''}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              label="Année de fin *"
              type="number"
              value={formData.temporalEndYear}
              onChange={(e) => setFormData({ ...formData, temporalEndYear: e.target.value })}
              placeholder="Ex : 2030"
              error={!formData.temporalEndYear}
              helperText={!formData.temporalEndYear ? 'Requis' : ''}
            />
          </Grid>
        </Grid>
      ) : (
        <FormControl fullWidth>
          <InputLabel>{'Période *'}</InputLabel>
          <Select
            label="Période *"
            value={formData.temporalPeriodStandard}
            onChange={(e) => setFormData({ ...formData, temporalPeriodStandard: e.target.value })}
            error={!formData.temporalPeriodStandard}
          >
            {TEMPORAL_PERIODS.map((p) => (
              <MenuItem key={p.value} value={p.value}>
                {p.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  )
}

function StepLevel({
  formData,
  setFormData,
}: {
  formData: ExpertiseFormData
  setFormData: React.Dispatch<React.SetStateAction<ExpertiseFormData>>
}) {
  const levels: { value: ExpertiseLevel; color: string; title: string; description: string }[] = [
    {
      value: 'veille',
      color: '#94a3b8',
      title: 'Intérêt secondaire / Veille',
      description: "Je suis le sujet, je peux en discuter de manière informelle, mais je ne publie pas activement dessus",
    },
    {
      value: 'enseignement',
      color: '#3b82f6',
      title: "Expertise d'enseignement",
      description: "Je maîtrise le sujet suffisamment pour l'enseigner à des étudiants, je connais l'état de l'art",
    },
    {
      value: 'recherche',
      color: '#f59e0b',
      title: 'Expertise de recherche active',
      description: "Je publie actuellement sur ce sujet (articles, thèses encadrées), je produis de la nouvelle connaissance",
    },
    {
      value: 'reference',
      color: '#10b981',
      title: 'Expertise de référence (Senior)',
      description: "Je suis reconnu par mes pairs comme une référence sur ce sujet (invitations keynote, direction d'ouvrages)",
    },
  ]

  return (
    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Alert severity="info">
        {"Auto-évaluez votre niveau d'expertise en fonction de ce que vous êtes capable de faire"}
      </Alert>
      <FormControl component="fieldset">
        <FormLabel component="legend">{'Mon niveau sur ce sujet'}</FormLabel>
        <RadioGroup
          value={formData.level}
          onChange={(e) => setFormData({ ...formData, level: e.target.value as ExpertiseLevel })}
        >
          {levels.map((l) => (
            <Card
              key={l.value}
              sx={{
                mb: 1,
                border: formData.level === l.value ? `2px solid ${l.color}` : '1px solid #e5e7eb',
              }}
            >
              <CardContent sx={{ py: 1.5 }}>
                <FormControlLabel
                  value={l.value}
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="subtitle2">{l.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {l.description}
                      </Typography>
                    </Box>
                  }
                />
              </CardContent>
            </Card>
          ))}
        </RadioGroup>
      </FormControl>
    </Box>
  )
}

function StepAvailability({
  formData,
  setFormData,
}: {
  formData: ExpertiseFormData
  setFormData: React.Dispatch<React.SetStateAction<ExpertiseFormData>>
}) {
  const avail = formData.availability
  const set = (key: keyof typeof avail, val: boolean) =>
    setFormData({ ...formData, availability: { ...avail, [key]: val } })

  const hasAny = Object.values(avail).some((v) => v)

  return (
    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Alert severity="info">
        {'Indiquez pour quels types d\'interventions vous êtes disponible'}
      </Alert>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tv fontSize="small" />
            {'Médias & Grand Public'}
          </Typography>
          <FormGroup>
            {[
              { key: 'pressWritten' as const, label: 'Interviews Presse écrite / Web', sub: 'Répondre aux journalistes' },
              { key: 'pressTvRadio' as const, label: 'Radio / TV (Direct)', sub: 'Demande une aisance orale spécifique' },
              { key: 'publicConferences' as const, label: 'Conférences Grand Public / Débats citoyens' },
              { key: 'hotTopics' as const, label: "Sujets d'actualité", sub: "Réagir à l'actualité immédiate" },
            ].map(({ key, label, sub }) => (
              <FormControlLabel
                key={key}
                control={<Switch checked={avail[key]} onChange={(e) => set(key, e.target.checked)} />}
                label={
                  sub ? (
                    <Box>
                      <Typography variant="body2">{label}</Typography>
                      <Typography variant="caption" color="text.secondary">{sub}</Typography>
                    </Box>
                  ) : label
                }
              />
            ))}
          </FormGroup>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Business fontSize="small" />
            {'Sphère Académique & Professionnelle'}
          </Typography>
          <FormGroup>
            {[
              { key: 'academicConferences' as const, label: 'Colloques spécialisés / Séminaires' },
              { key: 'businessPartnerships' as const, label: 'Interventions en entreprises / Partenariats R&D' },
              { key: 'publicExpertise' as const, label: 'Expertise publique', sub: 'Auditions parlementaires, Ministères, Think Tanks' },
            ].map(({ key, label, sub }) => (
              <FormControlLabel
                key={key}
                control={<Switch checked={avail[key]} onChange={(e) => set(key, e.target.checked)} />}
                label={
                  sub ? (
                    <Box>
                      <Typography variant="body2">{label}</Typography>
                      <Typography variant="caption" color="text.secondary">{sub}</Typography>
                    </Box>
                  ) : label
                }
              />
            ))}
          </FormGroup>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <School fontSize="small" />
            {'Mentoring & Pédagogie'}
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch checked={avail.schoolInterventions} onChange={(e) => set('schoolInterventions', e.target.checked)} />
              }
              label={
                <Box>
                  <Typography variant="body2">{'Intervention en milieu scolaire'}</Typography>
                  <Typography variant="caption" color="text.secondary">{'Lycées, collèges, etc.'}</Typography>
                </Box>
              }
            />
          </FormGroup>
        </CardContent>
      </Card>

      <Divider />
      <FormControlLabel
        control={
          <Checkbox checked={avail.mediaTraining} onChange={(e) => set('mediaTraining', e.target.checked)} />
        }
        label={'J\'ai suivi une formation « Média Training »'}
      />

      {hasAny && (
        <Alert severity="success">
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            {'Récapitulatif :'}
          </Typography>
          {avail.pressWritten && <Typography variant="caption" display="block">{'✓ Presse écrite / Web'}</Typography>}
          {avail.pressTvRadio && <Typography variant="caption" display="block">{'✓ TV / Radio'}</Typography>}
          {avail.publicConferences && <Typography variant="caption" display="block">{'✓ Conférences grand public'}</Typography>}
          {avail.hotTopics && <Typography variant="caption" display="block">{"✓ Sujets d'actualité"}</Typography>}
          {avail.academicConferences && <Typography variant="caption" display="block">{'✓ Colloques académiques'}</Typography>}
          {avail.businessPartnerships && <Typography variant="caption" display="block">{'✓ Partenariats R&D'}</Typography>}
          {avail.publicExpertise && <Typography variant="caption" display="block">{'✓ Expertise publique'}</Typography>}
          {avail.schoolInterventions && <Typography variant="caption" display="block">{'✓ Interventions scolaires'}</Typography>}
          {avail.mediaTraining && <Typography variant="caption" display="block" sx={{ fontStyle: 'italic' }}>{'+ Formation Média Training'}</Typography>}
        </Alert>
      )}
    </Box>
  )
}

// ─── Dialog ────────────────────────────────────────────────────────────────

const ExpertiseDialog: React.FC<ExpertiseDialogProps> = ({ open, onClose, onSave, expertise }) => {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<ExpertiseFormData>(EMPTY_FORM)

  useEffect(() => {
    if (!open) return
    if (expertise) {
      const tp = expertise.temporalPeriod
      setFormData({
        name: expertise.name,
        category: expertise.category,
        description: expertise.description,
        keywords: expertise.keywords.join(', '),
        geographicZones: expertise.geographicZones,
        temporalPeriodType: tp.type,
        temporalPeriodStandard:
          tp.type === 'standard'
            ? TEMPORAL_PERIODS.find((p) => p.label === tp.label)?.value ?? ''
            : '',
        temporalStartYear: tp.startYear?.toString() ?? '',
        temporalEndYear: tp.endYear?.toString() ?? '',
        level: expertise.level,
        availability: { ...expertise.availability },
      })
    } else {
      setFormData(EMPTY_FORM)
    }
    setStep(0)
  }, [open, expertise])

  const isStepValid = () => {
    if (step === 0) return !!formData.name && !!formData.category
    if (step === 1) {
      if (formData.geographicZones.length === 0) return false
      if (formData.temporalPeriodType === 'custom')
        return !!formData.temporalStartYear && !!formData.temporalEndYear
      return !!formData.temporalPeriodStandard
    }
    return true
  }

  const handleSave = () => {
    const tp: Expertise['temporalPeriod'] =
      formData.temporalPeriodType === 'custom'
        ? {
            type: 'custom',
            startYear: parseInt(formData.temporalStartYear),
            endYear: parseInt(formData.temporalEndYear),
          }
        : {
            type: 'standard',
            label: TEMPORAL_PERIODS.find((p) => p.value === formData.temporalPeriodStandard)?.label ?? '',
          }

    const data: Partial<Expertise> = {
      name: formData.name,
      category: formData.category,
      description: formData.description,
      keywords: formData.keywords.split(',').map((k) => k.trim()).filter(Boolean),
      geographicZones: formData.geographicZones,
      temporalPeriod: tp,
      level: formData.level,
      availability: formData.availability,
      publications: expertise?.publications ?? 0,
      thesesEncadrees: expertise?.thesesEncadrees ?? 0,
      brevets: expertise?.brevets ?? 0,
      projects: expertise?.projects ?? 0,
      lastUpdate: new Date().toISOString().split('T')[0],
    }
    onSave(data)
  }

  const stepContent = [
    <StepGeneralInfo key="0" formData={formData} setFormData={setFormData} />,
    <StepContext key="1" formData={formData} setFormData={setFormData} />,
    <StepLevel key="2" formData={formData} setFormData={setFormData} />,
    <StepAvailability key="3" formData={formData} setFormData={setFormData} />,
  ]

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: '#f8fafa', borderBottom: '1px solid #e5e7eb', pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {step > 0 && (
              <IconButton size="small" onClick={() => setStep((s) => s - 1)}>
                <ArrowBack fontSize="small" />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#006A61' }}>
              {expertise ? "Modifier l'expertise" : `Ajouter une expertise`}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}>
            <Close fontSize="small" />
          </IconButton>
        </Box>

        {/* Stepper */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const isActive = step === i
            const isDone = step > i
            return (
              <Box
                key={s.label}
                sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75, position: 'relative' }}
              >
                {i < STEPS.length - 1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 20,
                      left: 'calc(50% + 20px)',
                      right: 'calc(-50% + 20px)',
                      height: 2,
                      bgcolor: isDone ? '#006A61' : '#e5e7eb',
                    }}
                  />
                )}
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isActive || isDone ? '#006A61' : '#f3f4f6',
                    color: isActive || isDone ? '#fff' : '#9ca3af',
                    border: isActive ? '3px solid #99f6e4' : 'none',
                    zIndex: 1,
                    position: 'relative',
                  }}
                >
                  <Icon fontSize="small" />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    textAlign: 'center',
                    fontSize: '0.72rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#006A61' : isDone ? '#374151' : '#9ca3af',
                    maxWidth: 90,
                  }}
                >
                  {s.label}
                </Typography>
              </Box>
            )
          })}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ minHeight: 380 }}>{stepContent[step]}</DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ textTransform: 'none' }}>
          {'Annuler'}
        </Button>
        <Box sx={{ flex: 1 }} />
        {step < STEPS.length - 1 ? (
          <Button
            variant="contained"
            onClick={() => setStep((s) => s + 1)}
            disabled={!isStepValid()}
            sx={{ textTransform: 'none' }}
          >
            {'Suivant'}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!isStepValid()}
            sx={{ textTransform: 'none' }}
          >
            {expertise ? 'Modifier' : 'Ajouter'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default ExpertiseDialog
