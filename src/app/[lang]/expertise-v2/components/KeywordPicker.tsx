'use client'

import { useMemo, useState } from 'react'
import {
  Autocomplete, Box, Chip, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { Keyword, TEAL, VOCAB_CONFIG, Vocabulary } from '../types'
import { searchVocab, suggestedKeywords } from '../mockVocab'

interface Props {
  value: Keyword[]
  onChange: (next: Keyword[]) => void
}

type Option = Keyword & { isFree?: boolean }

const VOCABS: Vocabulary[] = ['rameau', 'mesh', 'wikidata', 'hal', 'libre']

function sameKeyword(a: Keyword, b: Keyword): boolean {
  return a.vocabulary === b.vocabulary && a.label.trim().toLowerCase() === b.label.trim().toLowerCase()
}

/** Chip d'un mot-clé, avec son vocabulaire d'origine en étiquette discrète. */
export function KeywordChip({ keyword, onDelete }: { keyword: Keyword; onDelete?: () => void }) {
  const cfg = VOCAB_CONFIG[keyword.vocabulary]
  const tag = keyword.vocabulary === 'hal' && keyword.detail ? `HAL ${keyword.detail}` : cfg.tag
  return (
    <Chip
      size="medium"
      onDelete={onDelete}
      label={
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
          <span>{keyword.label}</span>
          <Typography component="span" variant="caption" sx={{ color: cfg.color, fontWeight: 700, fontSize: '0.62rem', letterSpacing: '0.04em' }}>
            {tag}
          </Typography>
        </Box>
      }
      sx={{
        height: 30, bgcolor: 'background.paper', border: `1px solid ${cfg.color}40`,
        '& .MuiChip-label': { px: 1.25 },
      }}
    />
  )
}

export default function KeywordPicker({ value, onChange }: Props) {
  const [vocab, setVocab] = useState<Vocabulary>('rameau')
  const [input, setInput] = useState('')

  const options: Option[] = useMemo(() => {
    const found = searchVocab(input, vocab).filter((k) => !value.some((v) => sameKeyword(v, k)))
    const free: Option[] = input.trim()
      ? [{ label: input.trim(), vocabulary: 'libre', isFree: true }]
      : []
    return [...found, ...free]
  }, [input, vocab, value])

  const add = (k: Keyword) => {
    if (value.some((v) => sameKeyword(v, k))) return
    const { isFree: _f, ...clean } = k as Option
    onChange([...value, clean])
    setInput('')
  }

  const remove = (k: Keyword) => onChange(value.filter((v) => !sameKeyword(v, k)))

  const suggestions = suggestedKeywords(value)
  const vocabCfg = VOCAB_CONFIG[vocab]

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Les termes contrôlés relient votre thème au graphe de connaissance. Choisissez un référentiel,
        puis cherchez un terme ; vous pouvez aussi saisir un mot-clé libre.
      </Typography>

      <ToggleButtonGroup
        size="small" exclusive value={vocab}
        onChange={(_e, v: Vocabulary | null) => { if (v) { setVocab(v); setInput('') } }}
        aria-label="Référentiel"
        sx={{ mb: 1.5, flexWrap: 'wrap', '& .MuiToggleButton-root': { textTransform: 'none', px: 1.5, py: 0.5 } }}
      >
        {VOCABS.map((v) => (
          <ToggleButton key={v} value={v}
            sx={{ '&.Mui-selected': { bgcolor: `${VOCAB_CONFIG[v].color}14`, color: VOCAB_CONFIG[v].color, fontWeight: 700 } }}>
            {VOCAB_CONFIG[v].label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Autocomplete<Option, false, true, true>
        freeSolo
        disableClearable
        options={options}
        inputValue={input}
        onInputChange={(_e, v, reason) => { if (reason !== 'reset') setInput(v) }}
        value={null as unknown as Option}
        onChange={(_e, v) => {
          if (!v) return
          if (typeof v === 'string') { if (v.trim()) add({ label: v.trim(), vocabulary: 'libre' }) }
          else add(v)
        }}
        filterOptions={(o) => o}
        getOptionLabel={(o) => (typeof o === 'string' ? o : o.label)}
        isOptionEqualToValue={(o, v) => sameKeyword(o, v)}
        renderOption={(props, o) => {
          const { key, ...rest } = props as typeof props & { key: string }
          const cfg = VOCAB_CONFIG[o.vocabulary]
          return (
            <li key={key} {...rest}>
              {o.isFree ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                  <Add sx={{ fontSize: 16 }} />
                  <Typography variant="body2">Ajouter « {o.label} » en mot-clé libre</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', width: '100%', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{o.label}</Typography>
                    {o.detail && <Typography variant="caption" color="text.secondary">{o.detail}</Typography>}
                  </Box>
                  <Typography variant="caption" sx={{ color: cfg.color, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {cfg.tag}{cfg.source ? ` · ${cfg.source}` : ''}
                  </Typography>
                </Box>
              )}
            </li>
          )
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            placeholder={vocab === 'libre' ? 'Saisissez un mot-clé puis Entrée' : `Rechercher dans ${vocabCfg.label}…`}
            inputProps={{ ...params.inputProps, 'aria-label': 'Rechercher un mot-clé' }}
          />
        )}
        sx={{ mb: 1.5 }}
      />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, minHeight: 30 }}>
        {value.length === 0 && (
          <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic', alignSelf: 'center' }}>
            Aucun mot-clé pour l’instant.
          </Typography>
        )}
        {value.map((k) => (
          <KeywordChip key={`${k.vocabulary}-${k.label}`} keyword={k} onDelete={() => remove(k)} />
        ))}
      </Box>

      {suggestions.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          <Typography variant="caption" color="text.secondary">Suggérés d’après vos publications HAL :</Typography>
          {suggestions.map((s) => (
            <Chip key={`${s.vocabulary}-${s.label}`} size="small" variant="outlined" clickable
              icon={<Add sx={{ fontSize: 14 }} />}
              label={`${s.label}${s.vocabulary !== 'rameau' ? ` (${VOCAB_CONFIG[s.vocabulary].tag})` : ''}`}
              onClick={() => add(s)}
              sx={{ borderColor: `${TEAL}60`, color: TEAL, '& .MuiChip-icon': { color: TEAL } }} />
          ))}
        </Box>
      )}
    </Box>
  )
}
