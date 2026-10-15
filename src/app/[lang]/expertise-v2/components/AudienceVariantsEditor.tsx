'use client'

import { useState } from 'react'
import { Box, Button, Chip, CircularProgress, Tab, Tabs, TextField, Typography } from '@mui/material'
import { AutoAwesome, RestartAlt } from '@mui/icons-material'
import { AUDIENCES, AUDIENCE_CONFIG, Audience, AudienceVariants, ResearchTheme, TEAL, TEAL_DARK, variantCount } from '../types'
import { generateAudienceVariants } from '../mockAudienceLlm'

// ─── Déclinaison par public ──────────────────────────────────────────────────
// Aucune saisie supplémentaire n'est demandée : les quatre reformulations sont
// générées depuis la description, puis le chercheur peut les retoucher.

interface Props {
  theme: ResearchTheme
  onChange: (patch: Pick<ResearchTheme, 'variants' | 'variantsGeneratedAt'>) => void
}

export default function AudienceVariantsEditor({ theme, onChange }: Props) {
  const [audience, setAudience] = useState<Audience>('researchers')
  const [loading, setLoading] = useState(false)

  const count = variantCount(theme)
  const canGenerate = theme.description.trim().length > 0 && theme.label.trim().length > 0
  const cfg = AUDIENCE_CONFIG[audience]

  const generate = async () => {
    setLoading(true)
    const variants = await generateAudienceVariants(theme)
    onChange({ variants, variantsGeneratedAt: new Date().toISOString().split('T')[0] })
    setLoading(false)
  }

  const setVariant = (a: Audience, text: string) => {
    const variants: AudienceVariants = { ...theme.variants, [a]: text }
    onChange({ variants, variantsGeneratedAt: theme.variantsGeneratedAt })
  }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Votre description est reformulée pour chaque public du portail : chercheurs, entreprises et
        collectivités, journalistes, grand public. Rien à saisir : relisez, retouchez si besoin.
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
        <Button
          variant={count ? 'outlined' : 'contained'} size="small" disabled={!canGenerate || loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : count ? <RestartAlt /> : <AutoAwesome />}
          onClick={generate}
          sx={count
            ? { textTransform: 'none', borderColor: TEAL, color: TEAL }
            : { textTransform: 'none', bgcolor: TEAL, '&:hover': { bgcolor: TEAL_DARK } }}
        >
          {loading ? 'Génération en cours…' : count ? 'Régénérer depuis la description' : 'Générer les déclinaisons'}
        </Button>
        {count > 0 ? (
          <Chip size="small" label={`${count} / ${AUDIENCES.length} publics`}
            sx={{ height: 22, fontSize: '0.72rem', bgcolor: '#E8F5F4', color: TEAL, fontWeight: 600 }} />
        ) : (
          <Typography variant="caption" color="text.secondary">
            {canGenerate
              ? 'Sans déclinaison, le portail affiche la description générale à tous les publics.'
              : 'Renseignez l’intitulé et la description pour générer les déclinaisons.'}
          </Typography>
        )}
        {theme.variantsGeneratedAt && count > 0 && (
          <Typography variant="caption" color="text.disabled">· générées le {theme.variantsGeneratedAt}</Typography>
        )}
      </Box>

      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Tabs value={audience} onChange={(_e, v: Audience) => setAudience(v)} variant="scrollable" allowScrollButtonsMobile
          aria-label="Public"
          sx={{
            minHeight: 44, bgcolor: '#FAFAFA', borderBottom: '1px solid', borderColor: 'divider',
            '& .MuiTab-root': { textTransform: 'none', minHeight: 44, fontWeight: 600, fontSize: '0.85rem' },
            '& .Mui-selected': { color: `${cfg.color} !important` },
            '& .MuiTabs-indicator': { bgcolor: cfg.color },
          }}>
          {AUDIENCES.map((a) => {
            const c = AUDIENCE_CONFIG[a]
            const filled = Boolean(theme.variants[a]?.trim())
            return (
              <Tab key={a} value={a} iconPosition="start" icon={<c.Icon sx={{ fontSize: 18 }} />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    {c.short}
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: filled ? c.color : 'transparent', border: filled ? 'none' : '1px solid', borderColor: 'text.disabled' }} />
                  </Box>
                } />
            )
          })}
        </Tabs>
        <Box sx={{ p: 2, bgcolor: `${cfg.bg}55` }}>
          <Typography variant="caption" sx={{ display: 'block', color: cfg.color, fontWeight: 700, mb: 1 }}>
            {cfg.label} — {cfg.question}
          </Typography>
          <TextField
            fullWidth multiline minRows={3}
            value={theme.variants[audience] ?? ''}
            placeholder={count ? 'Pas encore de déclinaison pour ce public.' : 'La déclinaison apparaîtra ici après génération. Vous pouvez aussi l’écrire directement.'}
            onChange={(e) => setVariant(audience, e.target.value)}
            inputProps={{ 'aria-label': `Déclinaison pour ${cfg.label}` }}
            sx={{ bgcolor: 'background.paper' }}
          />
        </Box>
      </Box>
    </Box>
  )
}
