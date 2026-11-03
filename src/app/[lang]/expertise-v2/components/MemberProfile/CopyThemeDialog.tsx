'use client'

import { useEffect, useState } from 'react'
import {
  Alert, Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Link,
  TextField, Typography,
} from '@mui/material'
import { ContentCopy } from '@mui/icons-material'
import { Keyword, ResearchTheme, TEAL, TEAL_DARK, VOCAB_CONFIG, copyTheme } from '../../types'

interface Props {
  open: boolean
  theme: ResearchTheme | null
  member: { id: string; name: string } | null
  onClose: () => void
  /** Reçoit le nouveau thème (brouillon) à ouvrir dans l'éditeur. */
  onConfirm: (copy: ResearchTheme) => void
}

const kwKey = (k: Keyword) => `${k.vocabulary}-${k.label}`

/**
 * Copie d'un thème d'un·e collègue : l'intitulé et tous les mots-clés sont repris
 * par défaut (c'est ce qui prend du temps à saisir), les repères et périodes
 * étudiées en option. La description est rédigée à la première personne par
 * l'autre chercheur·e : elle n'est reprise que sur demande.
 */
export default function CopyThemeDialog({ open, theme, member, onClose, onConfirm }: Props) {
  const [label, setLabel] = useState('')
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [refs, setRefs] = useState(true)
  const [studied, setStudied] = useState(true)
  const [description, setDescription] = useState(false)

  useEffect(() => {
    if (!theme) return
    setLabel(theme.label)
    setKeywords(theme.keywords)
    setRefs(true)
    setStudied(true)
    setDescription(false)
  }, [theme])

  if (!theme || !member) return null

  const refCount = theme.places.length + theme.persons.length + theme.organizations.length
  const removed = theme.keywords.length - keywords.length
  const firstName = member.name.split(' ')[0]

  const confirm = () => onConfirm(copyTheme(theme, member, {
    label, keywords, refs: refs && refCount > 0, studiedPeriods: studied && theme.studiedPeriods.length > 0, description,
  }))

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 0.5 }}>Copier ce thème dans mon profil</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Un nouveau thème est créé en brouillon dans votre profil, à partir de celui de {member.name}.
          Le thème d’origine n’est pas modifié.
        </Typography>

        <TextField fullWidth size="small" label="Intitulé de votre thème" value={label}
          onChange={(e) => setLabel(e.target.value)} sx={{ mb: 2.5 }} />

        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Mots-clés repris ({keywords.length}/{theme.keywords.length})
          </Typography>
          {removed > 0 && (
            <Link component="button" variant="caption" onClick={() => setKeywords(theme.keywords)}>
              Tout reprendre
            </Link>
          )}
        </Box>
        {keywords.length === 0 ? (
          <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic', mb: 2 }}>Aucun mot-clé repris.</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 0.75 }}>
            {keywords.map((k) => {
              const c = VOCAB_CONFIG[k.vocabulary]
              return (
                <Chip key={kwKey(k)} size="small"
                  label={<><span>{k.label}</span><Box component="span" sx={{ ml: 0.75, fontSize: '0.62rem', fontWeight: 700, opacity: 0.75 }}>{c.tag}</Box></>}
                  onDelete={() => setKeywords((ks) => ks.filter((x) => kwKey(x) !== kwKey(k)))}
                  sx={{ bgcolor: `${c.color}10`, color: c.color, border: `1px solid ${c.color}30`, '& .MuiChip-deleteIcon': { color: `${c.color}90` } }} />
              )
            })}
          </Box>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          Les alignements sur les référentiels (RAMEAU, MeSH, Wikidata, HAL) sont conservés. Retirez ceux qui ne vous concernent pas.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <FormControlLabel
            control={<Checkbox checked={refs && refCount > 0} disabled={refCount === 0} onChange={(e) => setRefs(e.target.checked)} />}
            label={<Typography variant="body2">Terrains, personnes et organisations <Typography component="span" variant="caption" color="text.secondary">({refCount})</Typography></Typography>} />
          <FormControlLabel
            control={<Checkbox checked={studied && theme.studiedPeriods.length > 0} disabled={theme.studiedPeriods.length === 0} onChange={(e) => setStudied(e.target.checked)} />}
            label={<Typography variant="body2">Périodes étudiées <Typography component="span" variant="caption" color="text.secondary">({theme.studiedPeriods.length})</Typography></Typography>} />
          <FormControlLabel
            control={<Checkbox checked={description} disabled={!theme.description} onChange={(e) => setDescription(e.target.checked)} />}
            label={<Typography variant="body2">Description <Typography component="span" variant="caption" color="text.secondary">— rédigée par {firstName}, à reformuler avec vos mots</Typography></Typography>} />
        </Box>

        <Alert severity="info" variant="outlined" sx={{ mt: 2 }}>
          Ne sont pas repris, car propres à {member.name} : période de travail, publications, diffusion,
          sollicitations et déclinaisons par public.
        </Alert>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Annuler</Button>
        <Button variant="contained" startIcon={<ContentCopy />} onClick={confirm} disabled={!label.trim()}
          sx={{ textTransform: 'none', bgcolor: TEAL, '&:hover': { bgcolor: TEAL_DARK } }}>
          Copier et modifier
        </Button>
      </DialogActions>
    </Dialog>
  )
}
