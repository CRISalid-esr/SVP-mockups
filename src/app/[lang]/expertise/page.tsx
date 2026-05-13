'use client'

import React, { useState } from 'react'
import {
  Box,
  Button,
  Chip,
  Grid2 as Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Add, Search } from '@mui/icons-material'
import DocumentHeader from '@/app/[lang]/documents/components/DocumentHeader'
import useStore from '@/stores/global_store'
import * as Lingui from '@lingui/core'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'
import { Expertise, ExpertiseLevel } from '@/types/Expertise'
import ExpertiseCard, { CATEGORIES, LEVEL_INFO } from './components/ExpertiseCard'
import ExpertiseStats from './components/ExpertiseStats'
import ExpertiseDialog from './components/ExpertiseDialog'

const TEAL = '#006A61'

// ─── Mock data ──────────────────────────────────────────────────────────────

const initialExpertises: Expertise[] = [
  {
    id: '1',
    name: 'Deep Learning',
    category: 'Informatique & IA',
    level: 'reference',
    description:
      "Expertise de référence en apprentissage profond : architectures de réseaux convolutifs, récurrents et transformers, appliqués aux grandes masses de données en climatologie et biologie computationnelle.",
    geographicZones: [
      { type: 'country', name: 'France', code: 'FR' },
      { type: 'physical', name: 'International' },
    ],
    temporalPeriod: { type: 'custom', startYear: 2015, endYear: 2030 },
    availability: {
      pressWritten: true,
      pressTvRadio: false,
      publicConferences: true,
      hotTopics: true,
      academicConferences: true,
      businessPartnerships: true,
      publicExpertise: true,
      schoolInterventions: true,
      mediaTraining: false,
    },
    publications: 32,
    thesesEncadrees: 6,
    brevets: 2,
    projects: 8,
    lastUpdate: '2024-11-20',
    keywords: ['Deep Learning', 'Réseaux de neurones', 'Transformers', 'GPU', 'PyTorch'],
  },
  {
    id: '2',
    name: "Vision par ordinateur médicale",
    category: 'Santé',
    level: 'recherche',
    description:
      "Développement d'algorithmes d'analyse d'images radiologiques et histologiques pour la détection précoce de pathologies. Applications en oncologie et en cardiologie.",
    geographicZones: [
      { type: 'country', name: 'France', code: 'FR' },
      { type: 'geopolitical', name: 'Union Européenne' },
    ],
    temporalPeriod: { type: 'custom', startYear: 2018, endYear: 2027 },
    availability: {
      pressWritten: true,
      pressTvRadio: true,
      publicConferences: true,
      hotTopics: true,
      academicConferences: true,
      businessPartnerships: true,
      publicExpertise: true,
      schoolInterventions: false,
      mediaTraining: false,
    },
    publications: 18,
    thesesEncadrees: 4,
    brevets: 3,
    projects: 6,
    lastUpdate: '2024-10-15',
    keywords: ['Imagerie médicale', 'Détection précoce', 'Radiologie', 'IA en santé'],
  },
  {
    id: '3',
    name: 'Traitement du Langage Naturel',
    category: 'Informatique & IA',
    level: 'recherche',
    description:
      "Recherche sur les grands modèles de langage (LLM) et leurs applications en génération de texte médical, extraction d'information et raisonnement automatique.",
    geographicZones: [
      { type: 'country', name: 'France', code: 'FR' },
      { type: 'country', name: 'États-Unis', code: 'US' },
      { type: 'physical', name: 'International' },
    ],
    temporalPeriod: { type: 'custom', startYear: 2020, endYear: 2030 },
    availability: {
      pressWritten: true,
      pressTvRadio: true,
      publicConferences: true,
      hotTopics: true,
      academicConferences: true,
      businessPartnerships: true,
      publicExpertise: false,
      schoolInterventions: true,
      mediaTraining: true,
    },
    publications: 14,
    thesesEncadrees: 3,
    brevets: 0,
    projects: 4,
    lastUpdate: '2024-11-05',
    keywords: ['LLM', 'NLP', 'GPT', 'BERT', 'Génération de texte'],
  },
  {
    id: '4',
    name: 'Apprentissage par renforcement',
    category: 'Informatique & IA',
    level: 'enseignement',
    description:
      "Maîtrise des méthodes d'apprentissage par renforcement (Q-learning, PPO, SAC) avec applications en robotique chirurgicale et jeux à somme nulle. Enseignement en Master 2.",
    geographicZones: [
      { type: 'country', name: 'France', code: 'FR' },
    ],
    temporalPeriod: { type: 'custom', startYear: 2021, endYear: 2026 },
    availability: {
      pressWritten: false,
      pressTvRadio: false,
      publicConferences: false,
      hotTopics: false,
      academicConferences: true,
      businessPartnerships: true,
      publicExpertise: false,
      schoolInterventions: false,
      mediaTraining: false,
    },
    publications: 6,
    thesesEncadrees: 1,
    brevets: 0,
    projects: 3,
    lastUpdate: '2024-09-01',
    keywords: ['Reinforcement Learning', 'Robotique', 'PPO', 'Simulation'],
  },
  {
    id: '5',
    name: 'IA pour le climat',
    category: 'Sciences de la Terre',
    level: 'veille',
    description:
      "Suivi des travaux à l'intersection entre apprentissage automatique et sciences du climat : prédiction de phénomènes extrêmes, désagrégation de modèles climatiques, empreinte carbone du numérique.",
    geographicZones: [
      { type: 'geopolitical', name: 'Union Européenne' },
      { type: 'physical', name: 'International' },
    ],
    temporalPeriod: { type: 'custom', startYear: 2022, endYear: 2030 },
    availability: {
      pressWritten: false,
      pressTvRadio: false,
      publicConferences: true,
      hotTopics: false,
      academicConferences: true,
      businessPartnerships: false,
      publicExpertise: false,
      schoolInterventions: false,
      mediaTraining: false,
    },
    publications: 3,
    thesesEncadrees: 0,
    brevets: 0,
    projects: 2,
    lastUpdate: '2024-08-10',
    keywords: ['Climat', 'Empreinte carbone IA', 'Green AI', 'Météorologie'],
  },
]

// ─── Component ──────────────────────────────────────────────────────────────

const ExpertisePage = () => {
  const { currentPerspective } = useStore((state) => state.user)
  const lang = Lingui.i18n.locale as ExtendedLanguageCode

  const [expertises, setExpertises] = useState<Expertise[]>(initialExpertises)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterLevel, setFilterLevel] = useState<ExpertiseLevel | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpertise, setEditingExpertise] = useState<Expertise | null>(null)

  const filtered = expertises.filter((e) => {
    const matchCat = filterCategory === 'all' || e.category === filterCategory
    const matchLevel = filterLevel === 'all' || e.level === filterLevel
    const q = searchQuery.toLowerCase()
    const matchSearch =
      !q ||
      e.name.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.keywords.some((k) => k.toLowerCase().includes(q))
    return matchCat && matchLevel && matchSearch
  })

  const handleSave = (data: Partial<Expertise>) => {
    if (editingExpertise) {
      setExpertises(
        expertises.map((e) =>
          e.id === editingExpertise.id ? ({ ...e, ...data } as Expertise) : e,
        ),
      )
    } else {
      const newE: Expertise = {
        ...data,
        id: Math.random().toString(36).substring(2, 9),
      } as Expertise
      setExpertises([newE, ...expertises])
    }
    setIsDialogOpen(false)
    setEditingExpertise(null)
  }

  const handleEdit = (e: Expertise) => {
    setEditingExpertise(e)
    setIsDialogOpen(true)
  }

  const handleDelete = (e: Expertise) => {
    if (confirm(`Supprimer l'expertise "${e.name}" ?`)) {
      setExpertises(expertises.filter((x) => x.id !== e.id))
    }
  }

  const resetFilters = () => {
    setFilterCategory('all')
    setFilterLevel('all')
    setSearchQuery('')
  }

  const hasActiveFilters = filterCategory !== 'all' || filterLevel !== 'all' || searchQuery

  return (
    <Box>
      <DocumentHeader
        perspectiveName={currentPerspective?.getDisplayName(lang) || ''}
        pageName={'Expertises'}
      />

      <Box sx={{ p: 3 }}>
        {/* Titre + bouton */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
              {'Expertises'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {'Gérez et valorisez vos domaines d\'expertise avec terrain de recherche et disponibilités'}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setEditingExpertise(null)
              setIsDialogOpen(true)
            }}
            sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
          >
            {'Ajouter une expertise'}
          </Button>
        </Box>

        {/* Statistiques */}
        <Box sx={{ mb: 4 }}>
          <ExpertiseStats expertises={expertises} />
        </Box>

        {/* Filtres */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <TextField
            placeholder="Rechercher une expertise…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{ flexGrow: 1 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            size="small"
            label="Catégorie"
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">{'Toutes les catégories'}</MenuItem>
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
          </TextField>
          <TextField
            select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as ExpertiseLevel | 'all')}
            size="small"
            label="Niveau"
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="all">{'Tous les niveaux'}</MenuItem>
            {(Object.keys(LEVEL_INFO) as ExpertiseLevel[]).map((lvl) => (
              <MenuItem key={lvl} value={lvl}>
                {LEVEL_INFO[lvl].label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {/* Compteur + chips actifs */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            {filtered.length === 0
              ? 'Aucune expertise'
              : filtered.length === 1
                ? '1 expertise'
                : `${filtered.length} expertises`}
          </Typography>
          {filterCategory !== 'all' && (
            <Chip
              label={filterCategory}
              size="small"
              onDelete={() => setFilterCategory('all')}
              sx={{ bgcolor: `${TEAL}15`, color: TEAL, fontWeight: 600 }}
            />
          )}
          {filterLevel !== 'all' && (
            <Chip
              label={LEVEL_INFO[filterLevel].label}
              size="small"
              onDelete={() => setFilterLevel('all')}
              sx={{ bgcolor: `${TEAL}15`, color: TEAL, fontWeight: 600 }}
            />
          )}
        </Box>

        {/* Grille */}
        <Grid container spacing={3}>
          {filtered.map((e) => (
            <Grid size={{ xs: 12, md: 6 }} key={e.id}>
              <ExpertiseCard expertise={e} onEdit={handleEdit} onDelete={handleDelete} />
            </Grid>
          ))}
          {filtered.length === 0 && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ textAlign: 'center', py: 10 }}>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {'Aucune expertise trouvée.'}
                </Typography>
                {hasActiveFilters && (
                  <Button
                    variant="text"
                    onClick={resetFilters}
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

      <ExpertiseDialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false)
          setEditingExpertise(null)
        }}
        onSave={handleSave}
        expertise={editingExpertise}
      />
    </Box>
  )
}

export default ExpertisePage
