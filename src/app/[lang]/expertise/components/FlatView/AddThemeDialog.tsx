'use client'

import { useEffect, useState } from 'react'
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography,
} from '@mui/material'
import { Add, Check } from '@mui/icons-material'
import { ExpertiseAttributes } from '../../types'
import AttributesEditor from '../AttributesEditor'

const TEAL = '#006A61'

export interface NewTheme {
  label: string
  description: string
  attributes: ExpertiseAttributes
}

interface Props {
  open: boolean
  onClose: () => void
  onAdd: (theme: NewTheme) => void
  /** Si fourni, le dialog passe en mode édition avec ces valeurs préremplies. */
  initial?: NewTheme
}

export default function AddThemeDialog({ open, onClose, onAdd, initial }: Props) {
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [attrs, setAttrs] = useState<ExpertiseAttributes>({})

  const isEdit = Boolean(initial)

  useEffect(() => {
    if (open) {
      setLabel(initial?.label ?? '')
      setDescription(initial?.description ?? '')
      setAttrs(initial?.attributes ?? {})
    }
  }, [open, initial])

  const handleSubmit = () => {
    if (!label.trim()) return
    onAdd({ label: label.trim(), description: description.trim(), attributes: attrs })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Modifier le thème de recherche' : 'Ajouter un thème de recherche'}</DialogTitle>
      <DialogContent dividers>
        <TextField
          autoFocus fullWidth required size="small" label="Intitulé du thème"
          placeholder="Ex : Migration pour le travail"
          value={label} onChange={(e) => setLabel(e.target.value)}
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

        <AttributesEditor value={attrs} onChange={setAttrs} />

        {!isEdit && (
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 2 }}>
            Vous pourrez ensuite relier ce thème aux autres thèmes de recherche.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Annuler</Button>
        <Button variant="contained" disabled={!label.trim()} onClick={handleSubmit}
          startIcon={isEdit ? <Check /> : <Add />}
          sx={{ textTransform: 'none', bgcolor: TEAL, '&:hover': { bgcolor: '#004d46' } }}>
          {isEdit ? 'Enregistrer' : 'Ajouter le thème'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
