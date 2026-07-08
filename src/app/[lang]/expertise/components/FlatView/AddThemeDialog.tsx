'use client'

import { useState } from 'react'
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, MenuItem, Select, TextField, Typography,
} from '@mui/material'
import { Add, Business, LocalOffer, Person, Place, Schedule } from '@mui/icons-material'
import {
  AttributeCategory, CONTROLLED_VOCABULARIES, ExpertiseAttributes,
} from '../../types'

const TEAL = '#006A61'

const CATEGORIES: Array<{
  key: AttributeCategory
  label: string
  Icon: React.ElementType
  color: string
  placeholder: string
  showVocab?: boolean
}> = [
  { key: 'temporal', label: 'Couverture temporelle', Icon: Schedule, color: '#0288D1', placeholder: "Ex : 2005 — aujourd'hui, XIXe siècle…" },
  { key: 'geographic', label: 'Lieux', Icon: Place, color: '#388E3C', placeholder: 'Ex : France, Afrique subsaharienne…' },
  { key: 'persons', label: 'Personnes', Icon: Person, color: '#7B1FA2', placeholder: 'Ex : Arjun Appadurai, Michel Foucault…' },
  { key: 'organizations', label: 'Organisations', Icon: Business, color: '#E65100', placeholder: 'Ex : OIT, UNESCO, CNRS…' },
  { key: 'concepts', label: 'Concepts et mots-clés', Icon: LocalOffer, color: TEAL, placeholder: 'Ex : migration du travail, genre…', showVocab: true },
]

export interface NewTheme {
  label: string
  description: string
  attributes: ExpertiseAttributes
}

interface Props {
  open: boolean
  onClose: () => void
  onAdd: (theme: NewTheme) => void
}

const EMPTY_ATTRS: ExpertiseAttributes = {}

export default function AddThemeDialog({ open, onClose, onAdd }: Props) {
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [attrs, setAttrs] = useState<ExpertiseAttributes>(EMPTY_ATTRS)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [vocab, setVocab] = useState('libre')

  const reset = () => {
    setLabel('')
    setDescription('')
    setAttrs(EMPTY_ATTRS)
    setDrafts({})
    setVocab('libre')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const addAttr = (key: AttributeCategory) => {
    const value = (drafts[key] ?? '').trim()
    if (!value) return
    setAttrs((prev) => {
      const list = [...((prev[key] ?? []) as { label: string; vocabulary?: string }[])]
      if (key === 'concepts') list.push({ label: value, vocabulary: vocab })
      else list.push({ label: value })
      return { ...prev, [key]: list } as ExpertiseAttributes
    })
    setDrafts((d) => ({ ...d, [key]: '' }))
  }

  const removeAttr = (key: AttributeCategory, index: number) => {
    setAttrs((prev) => ({
      ...prev,
      [key]: (prev[key] ?? []).filter((_, i) => i !== index),
    } as ExpertiseAttributes))
  }

  const handleSubmit = () => {
    if (!label.trim()) return
    onAdd({ label: label.trim(), description: description.trim(), attributes: attrs })
    reset()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Ajouter un thème de recherche</DialogTitle>
      <DialogContent dividers>
        <TextField
          autoFocus fullWidth required size="small" label="Intitulé du thème"
          placeholder="Ex : Migration pour le travail"
          value={label} onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
          sx={{ mt: 0.5, mb: 2 }}
        />
        <TextField
          fullWidth multiline minRows={2} size="small" label="Description (optionnelle)"
          placeholder="En une ou deux phrases, de quoi parle ce thème ?"
          value={description} onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 2.5 }}
        />

        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1 }}>
          Caractéristiques (optionnelles)
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
          {CATEGORIES.map(({ key, label: catLabel, Icon, color, placeholder, showVocab }) => (
            <Box key={key}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <Icon sx={{ fontSize: 14, color }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color }}>{catLabel}</Typography>
              </Box>
              {(attrs[key] ?? []).length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.75 }}>
                  {(attrs[key] ?? []).map((item, i) => (
                    <Chip
                      key={`${item.label}-${i}`}
                      size="small"
                      label={'vocabulary' in item && item.vocabulary && item.vocabulary !== 'libre'
                        ? `${item.label} · ${item.vocabulary.toUpperCase()}`
                        : item.label}
                      onDelete={() => removeAttr(key, i)}
                      sx={{ bgcolor: `${color}14`, color, fontSize: '0.7rem' }}
                    />
                  ))}
                </Box>
              )}
              <Box sx={{ display: 'flex', gap: 0.75 }}>
                <TextField
                  fullWidth size="small" placeholder={placeholder}
                  value={drafts[key] ?? ''}
                  onChange={(e) => setDrafts((d) => ({ ...d, [key]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAttr(key) } }}
                  inputProps={{ style: { fontSize: '0.85rem' } }}
                />
                {showVocab && (
                  <Select size="small" value={vocab} onChange={(e) => setVocab(e.target.value)}
                    sx={{ minWidth: 130, fontSize: '0.8rem' }}>
                    {CONTROLLED_VOCABULARIES.map((v) => (
                      <MenuItem key={v.key} value={v.key} sx={{ fontSize: '0.8rem' }}>{v.label}</MenuItem>
                    ))}
                  </Select>
                )}
                <IconButton size="small" onClick={() => addAttr(key)} disabled={!(drafts[key] ?? '').trim()}
                  sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Add fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>

        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 2 }}>
          Vous pourrez relier ce thème aux autres et affiner ses caractéristiques
          (référentiels IdRef, GeoNames, périodes nommées) dans la carte mentale.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ textTransform: 'none' }}>Annuler</Button>
        <Button variant="contained" disabled={!label.trim()} onClick={handleSubmit}
          startIcon={<Add />}
          sx={{ textTransform: 'none', bgcolor: TEAL, '&:hover': { bgcolor: '#004d46' } }}>
          Ajouter le thème
        </Button>
      </DialogActions>
    </Dialog>
  )
}
