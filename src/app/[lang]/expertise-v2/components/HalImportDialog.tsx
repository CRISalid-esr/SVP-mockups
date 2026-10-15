'use client'

import { useEffect, useState } from 'react'
import {
  Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Typography,
} from '@mui/material'
import { CloudDownloadOutlined } from '@mui/icons-material'
import { ResearchTheme, TEAL, TEAL_DARK, blankTheme, formatPeriod } from '../types'
import { HAL_THEME_SUGGESTIONS, HalThemeSuggestion, suggestionAlreadyPresent } from '../mockVocab'

interface Props {
  open: boolean
  themes: ResearchTheme[]
  onClose: () => void
  onImport: (themes: ResearchTheme[]) => void
}

function toTheme(s: HalThemeSuggestion): ResearchTheme {
  return {
    ...blankTheme(),
    label: s.label,
    description: s.description,
    yearFrom: s.yearFrom,
    yearTo: s.yearTo,
    keywords: s.keywords,
  }
}

export default function HalImportDialog({ open, themes, onClose, onImport }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (open) {
      setSelected(new Set(
        HAL_THEME_SUGGESTIONS.filter((s) => !suggestionAlreadyPresent(s, themes)).map((s) => s.label),
      ))
    }
  }, [open, themes])

  const toggle = (label: string) => setSelected((prev) => {
    const next = new Set(prev)
    if (next.has(label)) next.delete(label); else next.add(label)
    return next
  })

  const handleImport = () => {
    onImport(HAL_THEME_SUGGESTIONS.filter((s) => selected.has(s.label)).map(toTheme))
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CloudDownloadOutlined sx={{ color: TEAL }} />
        Importer des thèmes depuis HAL
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          D’après vos publications déposées dans HAL, voici des thèmes que vous n’avez pas encore décrits.
          Ils seront ajoutés en brouillon : vous pourrez les reformuler avant de les valider.
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {HAL_THEME_SUGGESTIONS.map((s) => {
            const present = suggestionAlreadyPresent(s, themes)
            const checked = selected.has(s.label)
            return (
              <Box key={s.label}
                onClick={() => !present && toggle(s.label)}
                sx={{
                  display: 'flex', gap: 1, p: 1.5, borderRadius: 2, cursor: present ? 'default' : 'pointer',
                  border: '1px solid', borderColor: checked ? TEAL : 'divider',
                  bgcolor: checked ? `${TEAL}06` : 'transparent', opacity: present ? 0.55 : 1,
                }}>
                <Checkbox checked={checked} disabled={present} size="small" sx={{ p: 0.5, alignSelf: 'flex-start' }}
                  inputProps={{ 'aria-label': s.label }} />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{s.label}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                      {formatPeriod(s)} · {s.publicationCount} publication{s.publicationCount > 1 ? 's' : ''}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>{s.description}</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.75 }}>
                    {s.keywords.map((k) => (
                      <Chip key={k.label} size="small" label={k.label} variant="outlined" sx={{ height: 20, fontSize: '0.68rem' }} />
                    ))}
                  </Box>
                  {present && (
                    <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5 }}>
                      Déjà présent dans vos thèmes
                    </Typography>
                  )}
                </Box>
              </Box>
            )
          })}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Annuler</Button>
        <Button variant="contained" disabled={selected.size === 0} onClick={handleImport}
          sx={{ textTransform: 'none', bgcolor: TEAL, '&:hover': { bgcolor: TEAL_DARK } }}>
          Ajouter {selected.size} thème{selected.size > 1 ? 's' : ''} en brouillon
        </Button>
      </DialogActions>
    </Dialog>
  )
}
