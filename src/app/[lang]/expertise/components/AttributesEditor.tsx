'use client'

import { useState } from 'react'
import {
  Autocomplete, Box, Button, Chip, FormControl, IconButton, InputLabel,
  MenuItem, Select, Slider, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material'
import { Add, Business, LocalOffer, OpenInNew, Person, Place, Schedule } from '@mui/icons-material'
import {
  AttributeCategory, CONTROLLED_VOCABULARIES, ExpertiseAttributes,
} from '../types'
import {
  GEONAMES_MOCK, NAMED_PERIODS, searchIdRefOrganizations, searchIdRefPersons,
} from './MindMap/mockIdRef'
import type { IdRefResult } from './MindMap/mockIdRef'

const TEAL = '#006A61'

// Éditeur des caractéristiques d'un thème de recherche — mêmes widgets que le
// panneau de la vue Relations : slider / périodes nommées, GeoNames, IdRef,
// vocabulaires contrôlés. Réutilisé par la modale d'ajout de thème, le wizard
// de création de fiche expertise et le dialog de détail.
const CATEGORIES: Array<{
  key: AttributeCategory
  label: string
  Icon: React.ElementType
  color: string
}> = [
  { key: 'temporal', label: 'Couverture temporelle', Icon: Schedule, color: '#0288D1' },
  { key: 'geographic', label: 'Lieux', Icon: Place, color: '#388E3C' },
  { key: 'persons', label: 'Personnes', Icon: Person, color: '#7B1FA2' },
  { key: 'organizations', label: 'Organisations', Icon: Business, color: '#E65100' },
  { key: 'concepts', label: 'Concepts et mots-clés', Icon: LocalOffer, color: TEAL },
]

function formatYear(y: number): string {
  return y < 0 ? `${Math.abs(y)} av. J.-C.` : `${y}`
}

export type AttrItem = {
  label: string
  vocabulary?: string
  identifier?: string
  yearFrom?: number
  yearTo?: number
}

interface Props {
  value: ExpertiseAttributes
  onChange: (next: ExpertiseAttributes) => void
}

export default function AttributesEditor({ value, onChange }: Props) {
  const [addingCat, setAddingCat] = useState<AttributeCategory | null>(null)
  const [addingLabel, setAddingLabel] = useState('')
  const [addingVocab, setAddingVocab] = useState('')
  const [temporalMode, setTemporalMode] = useState<'range' | 'named'>('range')
  const [yearRange, setYearRange] = useState<[number, number]>([1990, new Date().getFullYear()])
  const [addingIdRefPpn, setAddingIdRefPpn] = useState<string | undefined>(undefined)
  const [idrefOptions, setIdrefOptions] = useState<IdRefResult[]>([])

  const cancelAddAttr = () => {
    setAddingCat(null)
    setAddingLabel('')
    setAddingVocab('')
    setTemporalMode('range')
    setYearRange([1990, new Date().getFullYear()])
    setAddingIdRefPpn(undefined)
    setIdrefOptions([])
  }

  const openAddAttr = (cat: AttributeCategory) => {
    cancelAddAttr()
    setAddingCat(cat)
  }

  const confirmAddAttr = (cat: AttributeCategory) => {
    const itemLabel = cat === 'temporal' && temporalMode === 'range'
      ? `${formatYear(yearRange[0])} — ${formatYear(yearRange[1])}`
      : addingLabel.trim()
    if (!itemLabel) return
    let item: AttrItem
    if (cat === 'concepts') {
      item = { label: itemLabel, ...(addingVocab ? { vocabulary: addingVocab } : {}) }
    } else if (cat === 'temporal' && temporalMode === 'range') {
      item = { label: itemLabel, yearFrom: yearRange[0], yearTo: yearRange[1] }
    } else if ((cat === 'persons' || cat === 'organizations') && addingIdRefPpn) {
      item = { label: itemLabel, identifier: addingIdRefPpn }
    } else {
      item = { label: itemLabel }
    }
    onChange({
      ...value,
      [cat]: [...((value[cat] ?? []) as AttrItem[]), item],
    } as ExpertiseAttributes)
    cancelAddAttr()
  }

  const removeAttr = (cat: AttributeCategory, index: number) => {
    onChange({
      ...value,
      [cat]: (value[cat] ?? []).filter((_, i) => i !== index),
    } as ExpertiseAttributes)
  }

  const renderInlineEditor = (cat: AttributeCategory, color: string) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, pt: 0.5 }}>
      {cat === 'temporal' ? (
        <>
          <ToggleButtonGroup
            size="small" value={temporalMode} exclusive
            onChange={(_, v) => { if (v) { setTemporalMode(v); setAddingLabel('') } }}
            sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontSize: '0.7rem', py: 0.4, flex: 1 } }}
            fullWidth
          >
            <ToggleButton value="range">Plage d&apos;années</ToggleButton>
            <ToggleButton value="named">Période nommée</ToggleButton>
          </ToggleButtonGroup>
          {temporalMode === 'range' ? (
            <Box sx={{ px: 1, pt: 0.5 }}>
              <Slider
                value={yearRange}
                onChange={(_, v) => setYearRange(v as [number, number])}
                min={-100000} max={2030} step={50}
                valueLabelDisplay="off"
                disableSwap
                sx={{ color, '& .MuiSlider-thumb': { width: 14, height: 14 }, mb: 0.5 }}
              />
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  size="small" label="De" type="number" value={yearRange[0]}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10)
                    if (!isNaN(v) && v >= -100000 && v <= yearRange[1]) setYearRange([v, yearRange[1]])
                  }}
                  inputProps={{ min: -100000, max: yearRange[1], step: 1, style: { fontSize: '0.75rem' } }}
                  sx={{ flex: 1, '& .MuiInputLabel-root': { fontSize: '0.75rem' } }}
                />
                <Typography variant="caption" color="text.disabled">—</Typography>
                <TextField
                  size="small" label="À" type="number" value={yearRange[1]}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10)
                    if (!isNaN(v) && v >= yearRange[0] && v <= 2030) setYearRange([yearRange[0], v])
                  }}
                  inputProps={{ min: yearRange[0], max: 2030, step: 1, style: { fontSize: '0.75rem' } }}
                  sx={{ flex: 1, '& .MuiInputLabel-root': { fontSize: '0.75rem' } }}
                />
              </Box>
            </Box>
          ) : (
            <Autocomplete
              size="small" freeSolo
              options={NAMED_PERIODS}
              inputValue={addingLabel}
              onInputChange={(_, v) => setAddingLabel(v)}
              renderInput={(params) => (
                <TextField {...params} size="small" autoFocus
                  placeholder="Ex : Révolution française, Moyen Âge…"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); confirmAddAttr(cat) } }}
                  sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8rem' } }}
                />
              )}
            />
          )}
        </>
      ) : cat === 'geographic' ? (
        <>
          <Autocomplete
            size="small" freeSolo
            options={addingLabel.length >= 1 ? GEONAMES_MOCK.filter((g) => g.toLowerCase().includes(addingLabel.toLowerCase())).slice(0, 8) : GEONAMES_MOCK.slice(0, 6)}
            inputValue={addingLabel}
            onInputChange={(_, v) => setAddingLabel(v)}
            renderInput={(params) => (
              <TextField {...params} size="small" autoFocus
                placeholder="Ex : France, Afrique subsaharienne…"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); confirmAddAttr(cat) } }}
                sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8rem' } }}
              />
            )}
          />
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Place sx={{ fontSize: 11, color }} /> Source : GeoNames
          </Typography>
        </>
      ) : cat === 'persons' || cat === 'organizations' ? (
        <>
          <Autocomplete
            size="small" freeSolo
            options={idrefOptions}
            getOptionLabel={(o) => typeof o === 'string' ? o : o.label}
            inputValue={addingLabel}
            onInputChange={(_, v) => {
              setAddingLabel(v)
              setAddingIdRefPpn(undefined)
              setIdrefOptions(cat === 'persons' ? searchIdRefPersons(v) : searchIdRefOrganizations(v))
            }}
            onChange={(_, v) => {
              if (v && typeof v === 'object') {
                setAddingLabel(v.label)
                setAddingIdRefPpn(v.ppn)
              }
            }}
            renderOption={(props, option) => {
              const { key: _key, ...optionProps } = props as { key?: string } & React.HTMLAttributes<HTMLLIElement>
              return (
                <Box component="li" key={option.ppn} {...optionProps} sx={{ flexDirection: 'column', alignItems: 'flex-start !important' }}>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{option.label}</Typography>
                  {(option.dates || option.description) && (
                    <Typography variant="caption" color="text.secondary">
                      {[option.dates, option.description].filter(Boolean).join(' · ')}
                    </Typography>
                  )}
                </Box>
              )
            }}
            renderInput={(params) => (
              <TextField {...params} size="small" autoFocus
                placeholder={cat === 'persons' ? 'Rechercher dans IdRef (personnes)…' : 'Rechercher dans IdRef (organismes)…'}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); confirmAddAttr(cat) } }}
                sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8rem' } }}
              />
            )}
          />
          {addingIdRefPpn && (
            <Typography variant="caption" sx={{ color, fontStyle: 'italic' }}>
              PPN IdRef : {addingIdRefPpn} ✓
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <OpenInNew sx={{ fontSize: 11, color }} /> Source : IdRef — les identifiants seront liés à la notice
          </Typography>
        </>
      ) : (
        <>
          <TextField
            size="small" fullWidth autoFocus
            placeholder="Ex : migration du travail, genre…"
            value={addingLabel}
            onChange={(e) => setAddingLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirmAddAttr(cat)
              if (e.key === 'Escape') cancelAddAttr()
            }}
            sx={{ '& .MuiOutlinedInput-root': { fontSize: '0.8rem' } }}
          />
          <FormControl size="small" fullWidth>
            <InputLabel sx={{ fontSize: '0.8rem' }}>Vocabulaire (optionnel)</InputLabel>
            <Select
              label="Vocabulaire (optionnel)"
              value={addingVocab}
              onChange={(e) => setAddingVocab(e.target.value)}
              sx={{ fontSize: '0.8rem' }}
            >
              <MenuItem value=""><em>Aucun</em></MenuItem>
              {CONTROLLED_VOCABULARIES.map((v) => (
                <MenuItem key={v.key} value={v.key} sx={{ fontSize: '0.8rem' }}>{v.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </>
      )}

      <Box sx={{ display: 'flex', gap: 0.75 }}>
        <Button size="small" variant="contained" onClick={() => confirmAddAttr(cat)}
          disabled={cat === 'temporal' && temporalMode === 'range' ? false : !addingLabel.trim()}
          sx={{ textTransform: 'none', bgcolor: color, fontSize: '0.72rem', py: 0.25, '&:hover': { bgcolor: color } }}>
          Ajouter
        </Button>
        <Button size="small" onClick={cancelAddAttr}
          sx={{ textTransform: 'none', color: 'text.secondary', fontSize: '0.72rem', py: 0.25 }}>
          Annuler
        </Button>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {CATEGORIES.map(({ key, label: catLabel, Icon, color }) => {
        const items = (value[key] ?? []) as AttrItem[]
        const isAdding = addingCat === key
        return (
          <Box key={key}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: items.length > 0 || isAdding ? 0.75 : 0 }}>
              <Icon sx={{ fontSize: 13, color, flexShrink: 0 }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color, flex: 1 }}>{catLabel}</Typography>
              {!isAdding && (
                <IconButton size="small" onClick={() => openAddAttr(key)}
                  sx={{ p: 0.25, color: 'text.disabled', '&:hover': { color } }}>
                  <Add sx={{ fontSize: 16 }} />
                </IconButton>
              )}
            </Box>

            {items.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: isAdding ? 0.75 : 0 }}>
                {items.map((item, idx) => {
                  const hasIdRef = (key === 'persons' || key === 'organizations') && Boolean(item.identifier)
                  const chipLabel = key === 'temporal' && item.yearFrom != null && item.yearTo != null
                    ? `${formatYear(item.yearFrom)} — ${formatYear(item.yearTo)}`
                    : item.vocabulary ? `${item.label} (${item.vocabulary})` : item.label
                  return (
                    <Chip
                      key={`${item.label}-${idx}`}
                      label={chipLabel}
                      size="small"
                      onDelete={() => removeAttr(key, idx)}
                      onClick={hasIdRef ? () => window.open(`https://www.idref.fr/${item.identifier}`, '_blank') : undefined}
                      icon={hasIdRef ? <OpenInNew sx={{ fontSize: '10px !important' }} /> : undefined}
                      sx={{
                        fontSize: '0.65rem', height: 20,
                        bgcolor: `${color}10`, color,
                        border: `1px solid ${color}33`,
                        cursor: hasIdRef ? 'pointer' : 'default',
                        '& .MuiChip-deleteIcon': { fontSize: 12, color: `${color}99`, '&:hover': { color } },
                        '& .MuiChip-icon': { color: `${color}88` },
                      }}
                    />
                  )
                })}
              </Box>
            )}

            {isAdding && renderInlineEditor(key, color)}
          </Box>
        )
      })}
    </Box>
  )
}
