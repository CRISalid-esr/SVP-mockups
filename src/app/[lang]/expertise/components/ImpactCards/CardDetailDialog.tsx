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
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import {
  CloseOutlined,
  ContentCopyOutlined,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from '@mui/icons-material'
import { ImpactCard, ImpactFamily, PROFILE_CONFIG, SPECIFIC_SUGGESTIONS, TARGET_AUDIENCE_OPTIONS } from './impactCardsTypes'

const STATUS_LABELS = { VALIDATED: 'Validée', TO_VALIDATE: 'À valider', CUSTOM: 'Personnalisée' }

interface Props {
  card: ImpactCard
  family?: ImpactFamily
  open: boolean
  onClose: () => void
  onSave: (updated: ImpactCard) => void
  onDuplicate: () => void
  onArchive: () => void
}

export default function CardDetailDialog({ card, family, open, onClose, onSave, onDuplicate, onArchive }: Props) {
  const [tab, setTab] = useState(0)
  const [draft, setDraft] = useState<ImpactCard>(card)
  const [newSpecKey, setNewSpecKey] = useState('')
  const [newSpecVal, setNewSpecVal] = useState('')
  const cfg = PROFILE_CONFIG[draft.profile]

  const handleSave = () => {
    onSave({ ...draft, lastUpdate: new Date().toLocaleDateString('fr-FR') })
    onClose()
  }

  const addSpecific = () => {
    if (!newSpecKey.trim()) return
    setDraft((d) => ({ ...d, specifics: { ...(d.specifics ?? {}), [newSpecKey]: newSpecVal } }))
    setNewSpecKey('')
    setNewSpecVal('')
  }

  const removeSpecific = (key: string) => {
    const next = { ...(draft.specifics ?? {}) }
    delete next[key]
    setDraft((d) => ({ ...d, specifics: next }))
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: cfg.bg,
          borderBottom: `3px solid ${cfg.border}`,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
          pr: 1,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Chip
            label={cfg.label}
            size="small"
            sx={{ bgcolor: cfg.border, color: '#fff', fontWeight: 700, fontSize: '0.65rem', height: 20, mb: 0.5 }}
          />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: cfg.color, lineHeight: 1.3 }}>
            {draft.title}
          </Typography>
          {family && (
            <Typography variant="caption" color="text.secondary">
              Famille : {family.title}
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={onClose}><CloseOutlined fontSize="small" /></IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ '& .MuiTab-root': { textTransform: 'none', fontSize: '0.85rem' } }}>
          <Tab label="Contenu" value={0} />
          <Tab label="Spécificités" value={1} />
          <Tab label="Métadonnées" value={2} />
        </Tabs>
      </Box>

      <DialogContent sx={{ pt: 2 }}>
        {tab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Titre"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              fullWidth
              size="small"
            />
            <TextField
              label="Description"
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              fullWidth
              multiline
              rows={4}
              size="small"
            />
            {/* Audiences */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Audiences cibles
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
            {/* Spécialisation */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                Spécialisation (1–10)
              </Typography>
              <FormControl size="small" sx={{ minWidth: 80 }}>
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

        {tab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Champs libres pour préciser le contexte de l&apos;expertise (terrain, langue, méthode…)
            </Typography>
            {Object.entries(draft.specifics ?? {}).map(([key, val]) => (
              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 110, color: 'text.secondary' }}>
                  {key}
                </Typography>
                <TextField
                  size="small"
                  value={val}
                  onChange={(e) => setDraft((d) => ({ ...d, specifics: { ...(d.specifics ?? {}), [key]: e.target.value } }))}
                  sx={{ flex: 1 }}
                />
                <Button size="small" color="error" onClick={() => removeSpecific(key)} sx={{ minWidth: 0, px: 1 }}>
                  ×
                </Button>
              </Box>
            ))}
            <Divider />
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Clé</InputLabel>
                <Select
                  value={newSpecKey}
                  label="Clé"
                  onChange={(e) => setNewSpecKey(e.target.value)}
                  renderValue={(v) => v}
                >
                  {SPECIFIC_SUGGESTIONS.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Valeur"
                size="small"
                value={newSpecVal}
                onChange={(e) => setNewSpecVal(e.target.value)}
                sx={{ flex: 2 }}
              />
              <Button variant="outlined" size="small" onClick={addSpecific} sx={{ textTransform: 'none', mb: 0.25 }}>
                Ajouter
              </Button>
            </Box>
          </Box>
        )}

        {tab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select
                value={draft.status}
                label="Statut"
                onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as ImpactCard['status'] }))}
              >
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <MenuItem key={k} value={k}>{v}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Visibilité</InputLabel>
              <Select
                value={draft.visibility}
                label="Visibilité"
                onChange={(e) => setDraft((d) => ({ ...d, visibility: e.target.value as ImpactCard['visibility'] }))}
              >
                <MenuItem value="PUBLIC">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VisibilityOutlined fontSize="small" /> Publique
                  </Box>
                </MenuItem>
                <MenuItem value="PRIVATE">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VisibilityOffOutlined fontSize="small" /> Privée
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {family && (
              <Box sx={{ bgcolor: 'grey.50', p: 1.5, borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">Famille (nœud source)</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{family.title}</Typography>
                <Typography variant="caption" color="text.secondary">Source : {family.source}</Typography>
              </Box>
            )}

            <Typography variant="caption" color="text.secondary">
              Dernière mise à jour : {draft.lastUpdate}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2, pt: 1, gap: 1, borderTop: 1, borderColor: 'divider' }}>
        <Button
          size="small"
          startIcon={<ContentCopyOutlined />}
          onClick={onDuplicate}
          sx={{ textTransform: 'none', mr: 'auto' }}
        >
          Dupliquer
        </Button>
        <Button size="small" color="error" onClick={onArchive} sx={{ textTransform: 'none' }}>
          Archiver
        </Button>
        <Button size="small" onClick={onClose} sx={{ textTransform: 'none' }}>
          Annuler
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={handleSave}
          sx={{ textTransform: 'none', bgcolor: cfg.border, '&:hover': { bgcolor: cfg.border, filter: 'brightness(0.9)' } }}
        >
          Enregistrer
        </Button>
      </DialogActions>
    </Dialog>
  )
}
