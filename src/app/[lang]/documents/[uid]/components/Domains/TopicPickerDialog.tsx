'use client'

import { Close, Search } from '@mui/icons-material'
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view'
import { useEffect, useState } from 'react'
import {
  ALL_TOPICS,
  getTopic,
  TAXONOMY,
  TAXONOMY_TOTAL_TOPICS,
  TaxonomyTopic,
  topicPath,
} from './domainsMock'

const TEAL = 'primary.main'
const TEAL_DARK = 'primary.dark'
const BORDER = 'divider'
const SURFACE = 'action.hover'
const TEXT = 'text.primary'
const MUTED = 'text.secondary'

const MAX_RESULTS = 30

const LevelLabel = ({ label, level }: { label: string; level: string }) => (
  <Box sx={{ py: 0.25 }}>
    <Typography sx={{ color: TEXT, fontSize: '0.875rem' }}>{label}</Typography>
    <Typography sx={{ color: TEAL, fontSize: '0.75rem' }}>{level}</Typography>
  </Box>
)

interface TopicPickerDialogProps {
  open: boolean
  /** Sujets déjà rattachés au document, non sélectionnables. */
  linkedIds: string[]
  onClose: () => void
  onConfirm: (topicIds: string[]) => void
}

export default function TopicPickerDialog({
  open,
  linkedIds,
  onClose,
  onConfirm,
}: TopicPickerDialogProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelected([])
    }
  }, [open])

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))

  const renderTopicCheck = (topic: TaxonomyTopic, caption?: string) => {
    const isLinked = linkedIds.includes(topic.id)
    return (
      <FormControlLabel
        disabled={isLinked}
        sx={{ m: 0, alignItems: 'flex-start', width: '100%' }}
        control={
          <Checkbox
            size="small"
            checked={isLinked || selected.includes(topic.id)}
            onChange={() => toggle(topic.id)}
            sx={{ p: 0.5, mr: 0.5, '&.Mui-checked': { color: TEAL } }}
          />
        }
        label={
          <Box sx={{ py: 0.25 }}>
            <Typography sx={{ color: isLinked ? MUTED : TEXT, fontSize: '0.875rem' }}>
              {topic.label}
            </Typography>
            <Typography sx={{ color: MUTED, fontSize: '0.75rem' }}>
              {isLinked ? `Déjà présent${caption ? ` · ${caption}` : ''}` : caption ?? 'Sujet'}
            </Typography>
          </Box>
        }
      />
    )
  }

  const trimmedQuery = query.trim().toLowerCase()
  const results = trimmedQuery
    ? ALL_TOPICS.filter((topic) =>
        trimmedQuery.split(/\s+/).every((word) => topic.searchText.includes(word)),
      )
    : []

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Ajouter un domaine</DialogTitle>
      <DialogContent>
        <Typography sx={{ color: MUTED, fontSize: '0.875rem', mb: 2 }}>
          {`Choisissez un ou plusieurs sujets : le domaine, la discipline et la sous-discipline s'en déduisent.`}
        </Typography>

        <TextField
          fullWidth
          size="small"
          label="Rechercher un sujet ou une discipline"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1.5 }}
        />

        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1, height: 340, overflowY: 'auto' }}>
          {!trimmedQuery && (
            <SimpleTreeView disableSelection aria-label="Classification OpenAlex">
              {TAXONOMY.map((domain) => (
                <TreeItem
                  key={domain.id}
                  itemId={domain.id}
                  label={<LevelLabel label={domain.label} level="Domaine" />}
                >
                  {domain.fields.map((field) => (
                    <TreeItem
                      key={field.id}
                      itemId={field.id}
                      label={<LevelLabel label={field.label} level="Discipline" />}
                    >
                      {field.subfields.map((subfield) => (
                        <TreeItem
                          key={subfield.id}
                          itemId={subfield.id}
                          label={<LevelLabel label={subfield.label} level="Sous-discipline" />}
                        >
                          {subfield.topics.map((topic) => (
                            <TreeItem key={topic.id} itemId={topic.id} label={renderTopicCheck(topic)} />
                          ))}
                        </TreeItem>
                      ))}
                    </TreeItem>
                  ))}
                </TreeItem>
              ))}
            </SimpleTreeView>
          )}

          {trimmedQuery && results.length === 0 && (
            <Typography sx={{ color: MUTED, fontSize: '0.875rem', p: 1 }}>
              {`Aucun sujet ne correspond. Essayez un terme plus général, ou parcourez la classification en effaçant la recherche.`}
            </Typography>
          )}
          {results.slice(0, MAX_RESULTS).map((topic) => (
            <Box key={topic.id}>{renderTopicCheck(topic, topicPath(topic))}</Box>
          ))}
        </Box>

        {/* Sous la liste : la sélection ne doit pas faire sauter l'arbre pendant qu'on coche. */}
        {selected.length > 0 && (
          <Box sx={{ p: 1.5, mt: 1.5, bgcolor: SURFACE, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Typography sx={{ color: TEXT, fontWeight: 600, fontSize: '0.8125rem', mb: 0.5 }}>
              {`Sélection (${selected.length})`}
            </Typography>
            {selected.map((id) => {
              const topic = getTopic(id)
              if (!topic) return null
              return (
                <Box key={id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ color: TEXT, fontSize: '0.8125rem', flex: 1, minWidth: 0 }}>
                    {`${topicPath(topic)} › ${topic.label}`}
                  </Typography>
                  <IconButton size="small" aria-label={`Retirer ${topic.label}`} onClick={() => toggle(id)}>
                    <Close sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              )
            })}
          </Box>
        )}

        <Typography sx={{ color: MUTED, fontSize: '0.75rem', mt: 1 }}>
          {`Les sujets sont en anglais, comme dans OpenAlex. Maquette : échantillon de ${ALL_TOPICS.length} sujets sur ${TAXONOMY_TOTAL_TOPICS.toLocaleString('fr-FR')}.`}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: MUTED, textTransform: 'none' }}>
          Annuler
        </Button>
        <Button
          variant="contained"
          disabled={selected.length === 0}
          onClick={() => onConfirm(selected)}
          sx={{ bgcolor: TEAL, textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: TEAL_DARK } }}
        >
          {`Ajouter (${selected.length})`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
