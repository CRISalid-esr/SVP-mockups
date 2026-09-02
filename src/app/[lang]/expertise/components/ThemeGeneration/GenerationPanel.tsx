'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Box, Button, Chip, CircularProgress, Divider, TextField, Typography,
} from '@mui/material'
import { AutoAwesome, AutoGraph } from '@mui/icons-material'
import { generateGraphFromPrompt, generateGraphFromPublications } from '../MindMap/mockLlm'
import { ExpertiseGraph } from '../../types'
import { getPerspective, loadSelectedPublications } from '../../storage'

const TEAL = '#006A61'

export const EXAMPLE_PROMPTS: Record<string, string> = {
  Sociologue: "Je suis sociologue spécialisé·e dans les migrations de travail et les inégalités de genre. Mes recherches portent sur les dynamiques identitaires et les politiques migratoires entre l'Asie du Sud et le Moyen-Orient.",
  Historien: "Je suis historien·ne médiéviste. Mes travaux portent sur les pratiques religieuses monastiques, les échanges culturels entre l'Europe occidentale et Byzance, et l'histoire des manuscrits enluminés.",
  Physicien: "Je suis physicien·ne spécialisé·e en physique des matériaux. Mes recherches portent sur les propriétés optiques des matériaux bidimensionnels et leurs applications en optoélectronique.",
  Juriste: "Je suis juriste spécialisé·e en droit européen et droits numériques. Mes travaux portent sur la régulation des plateformes, la protection des données personnelles et les libertés fondamentales en ligne.",
}

interface Props {
  graph: ExpertiseGraph
  /** Le graphe généré + un libellé de provenance (prompt tronqué ou nb de publications). L'appelant persiste. */
  onGraphGenerated: (graph: ExpertiseGraph, sourceLabel: string) => void
  /** 'empty' : carte centrée pour l'onboarding. 'inline' : sans habillage, pour un Accordion. */
  variant: 'empty' | 'inline'
}

export default function GenerationPanel({ graph, onGraphGenerated, variant }: Props) {
  const params = useParams()
  const router = useRouter()
  const lang = (params?.lang as string) || 'fr'
  const perspective = getPerspective()

  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [selectedPubs] = useState(() => loadSelectedPublications())

  const hasThemes = graph.nodes.length > 0

  const handleGenerateFromPrompt = async () => {
    if (!prompt.trim()) return
    setGenerating(true)
    try {
      const result = await generateGraphFromPrompt(prompt, graph.meta)
      onGraphGenerated(result, `Généré par IA — "${prompt.slice(0, 50)}${prompt.length > 50 ? '…' : ''}"`)
      setPrompt('')
    } finally {
      setGenerating(false)
    }
  }

  const handleGenerateFromPublications = async () => {
    setGenerating(true)
    try {
      const result = await generateGraphFromPublications(selectedPubs.length, graph.meta)
      onGraphGenerated(result, `Généré depuis ${selectedPubs.length} publication${selectedPubs.length > 1 ? 's' : ''}`)
    } finally {
      setGenerating(false)
    }
  }

  const goToDocuments = () => {
    router.push(`/${lang}/documents${perspective !== 'default' ? `?perspective=${perspective}` : ''}`)
  }

  const content = (
    <>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5,
        bgcolor: selectedPubs.length > 0 ? `${TEAL}12` : '#f5f5f5',
        borderRadius: 2, minHeight: 44,
      }}>
        {selectedPubs.length > 0 ? (
          <>
            <Chip
              label={`${selectedPubs.length} publication${selectedPubs.length > 1 ? 's' : ''} sélectionnée${selectedPubs.length > 1 ? 's' : ''}`}
              size="small"
              sx={{ bgcolor: TEAL, color: 'white', fontWeight: 600 }}
            />
          </>
        ) : (
          <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
            Aucune publication sélectionnée pour l&apos;instant
          </Typography>
        )}
      </Box>

      <Button
        variant="outlined" fullWidth size="medium"
        onClick={goToDocuments}
        sx={{ textTransform: 'none', borderColor: TEAL, color: TEAL, borderRadius: 2, mt: 1.5 }}
      >
        Sélectionner des publications →
      </Button>

      <Button
        variant="contained" fullWidth size={variant === 'empty' ? 'large' : 'medium'}
        startIcon={generating ? <CircularProgress size={18} color="inherit" /> : <AutoAwesome />}
        onClick={handleGenerateFromPublications}
        disabled={selectedPubs.length === 0 || generating}
        sx={{
          bgcolor: TEAL, '&:hover': { bgcolor: '#004d46' }, textTransform: 'none',
          py: variant === 'empty' ? 1.25 : 1, borderRadius: 2, mt: 1.5,
        }}
      >
        {generating
          ? (hasThemes ? 'Recalcul en cours…' : 'Construction en cours…')
          : (hasThemes ? 'Recalculer à partir des publications' : 'Générer mes thèmes de recherche')}
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 2 }}>
        <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
        <Typography variant="caption" color="text.disabled">ou</Typography>
        <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
      </Box>

      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75, color: TEAL }}>
        Décrire mes thèmes de recherche
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        Décrivez vos thèmes de recherche en langage naturel. L&apos;IA générera des thèmes que vous pourrez modifier.
      </Typography>
      <TextField
        multiline rows={variant === 'empty' ? 5 : 4} fullWidth size="small"
        placeholder="Ex : Je suis spécialiste des migrations pour le travail entre le Sri Lanka et le Moyen-Orient. Mes recherches portent sur le genre, l'identité et les politiques migratoires…"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={generating}
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleGenerateFromPrompt() }}
        sx={{ mb: 1.5, '& .MuiOutlinedInput-root': variant === 'empty' ? { borderRadius: 2 } : undefined }}
      />

      {variant === 'empty' && (
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Exemples de profils :
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {Object.entries(EXAMPLE_PROMPTS).map(([label, text]) => (
              <Chip
                key={label} label={label} size="small" variant="outlined"
                onClick={() => setPrompt(text)}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: `${TEAL}10`, borderColor: TEAL, color: TEAL } }}
              />
            ))}
          </Box>
        </Box>
      )}

      <Button
        fullWidth variant="contained" size={variant === 'empty' ? 'large' : 'medium'}
        startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <AutoAwesome />}
        onClick={handleGenerateFromPrompt}
        disabled={!prompt.trim() || generating}
        sx={{
          bgcolor: TEAL, '&:hover': { bgcolor: '#004d46' }, textTransform: 'none',
          py: variant === 'empty' ? 1.25 : 1, borderRadius: 2,
        }}
      >
        {generating ? 'Génération en cours…' : (hasThemes ? 'Générer de nouveaux thèmes' : 'Générer mes thèmes de recherche')}
      </Button>
    </>
  )

  if (variant === 'inline') {
    return <Box sx={{ p: 2 }}>{content}</Box>
  }

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      py: 6,
    }}>
      <Box sx={{
        bgcolor: 'background.paper', borderRadius: 3,
        border: '1px solid', borderColor: 'divider',
        p: { xs: 3, sm: 4 }, maxWidth: 520, width: '90%',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <AutoGraph sx={{ fontSize: 52, color: TEAL, opacity: 0.85 }} />
        </Box>
        <Box sx={{ textAlign: 'center', mb: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.75 }}>
            Retrouvez vos thèmes de recherche
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sélectionnez les publications à analyser et/ou décrivez vos thèmes en quelques phrases :
            l&apos;IA génèrera une première liste que vous pourrez ensuite affiner.
          </Typography>
        </Box>
        <Divider sx={{ mb: 2.5 }} />
        {content}
      </Box>
    </Box>
  )
}
