'use client'

import { useMemo, useState } from 'react'
import {
  Autocomplete, Box, Button, Chip, MenuItem, TextField, Tooltip, Typography,
} from '@mui/material'
import { Add, HistoryEdu } from '@mui/icons-material'
import { StudiedPeriod, TEAL, formatStudiedBounds, formatYear } from '../types'
import { searchPeriods } from '../mockPeriods'

// ─── Période étudiée ─────────────────────────────────────────────────────────
// L'époque sur laquelle porte le thème, distincte de la période de travail.
// Deux façons de la saisir : une période nommée (Néolithique, Trente Glorieuses…)
// ou une plage d'années libre, avant ou après J.-C.

const PERIOD_COLOR = '#7B5E2A'

/** Chip d'une période étudiée : libellé + bornes datées en petit. */
export function StudiedPeriodChip({ value, onDelete, size = 'medium' }: {
  value: StudiedPeriod; onDelete?: () => void; size?: 'small' | 'medium'
}) {
  const bounds = formatStudiedBounds(value)
  const showBounds = bounds && bounds !== value.label
  return (
    <Tooltip title={showBounds ? `Période étudiée : ${bounds}` : 'Période étudiée'}>
      <Chip
        size={size}
        icon={<HistoryEdu sx={{ fontSize: size === 'small' ? 14 : 16 }} />}
        onDelete={onDelete}
        label={
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 0.75 }}>
            <span>{value.label}</span>
            {showBounds && (
              <Typography component="span" variant="caption" sx={{ color: 'text.secondary', fontSize: '0.66rem' }}>
                {bounds}
              </Typography>
            )}
          </Box>
        }
        sx={{
          height: size === 'small' ? 24 : 30,
          bgcolor: '#FBF6EC',
          border: '1px solid',
          borderColor: `${PERIOD_COLOR}40`,
          color: 'text.primary',
          '& .MuiChip-icon': { color: PERIOD_COLOR },
          '& .MuiChip-label': { px: 1 },
        }}
      />
    </Tooltip>
  )
}

type Era = 'ad' | 'bc'

function toSigned(raw: string, era: Era): number | null {
  const n = parseInt(raw, 10)
  if (Number.isNaN(n) || n < 0) return null
  return era === 'bc' ? -n : n
}

interface Props {
  value: StudiedPeriod[]
  onChange: (next: StudiedPeriod[]) => void
}

export default function StudiedPeriodPicker({ value, onChange }: Props) {
  const [input, setInput] = useState('')
  const [from, setFrom] = useState('')
  const [fromEra, setFromEra] = useState<Era>('ad')
  const [to, setTo] = useState('')
  const [toEra, setToEra] = useState<Era>('ad')

  const options = useMemo(() => searchPeriods(input, value), [input, value])

  const add = (p: StudiedPeriod) => {
    if (!p.label.trim()) return
    if (value.some((v) => v.label.toLowerCase() === p.label.toLowerCase())) return
    onChange([...value, p])
    setInput('')
  }

  const yearFrom = toSigned(from, fromEra)
  const yearTo = toSigned(to, toEra)
  const rangeValid = yearFrom != null && yearTo != null && yearFrom <= yearTo
  const rangeError = yearFrom != null && yearTo != null && yearFrom > yearTo

  const addRange = () => {
    if (!rangeValid) return
    add({ label: formatStudiedBounds({ label: '', yearFrom, yearTo }), yearFrom, yearTo })
    setFrom(''); setTo('')
  }

  const eraSelect = (era: Era, setEra: (e: Era) => void, label: string) => (
    <TextField select size="small" value={era} onChange={(e) => setEra(e.target.value as Era)}
      sx={{ width: 120 }} inputProps={{ 'aria-label': label }}>
      <MenuItem value="ad">ap. J.-C.</MenuItem>
      <MenuItem value="bc">av. J.-C.</MenuItem>
    </TextField>
  )

  return (
    <Box>
      <Autocomplete<StudiedPeriod, false, true, true>
        freeSolo
        disableClearable
        options={options}
        inputValue={input}
        onInputChange={(_e, v, reason) => { if (reason !== 'reset') setInput(v) }}
        value={null as unknown as StudiedPeriod}
        onChange={(_e, v) => {
          if (!v) return
          if (typeof v === 'string') add({ label: v.trim() }); else add(v)
        }}
        filterOptions={(o) => o}
        getOptionLabel={(o) => (typeof o === 'string' ? o : o.label)}
        renderOption={(props, o) => {
          const { key, ...rest } = props as typeof props & { key: string }
          return (
            <li key={key} {...rest}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', width: '100%', gap: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{o.label}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                  {formatStudiedBounds(o)}
                </Typography>
              </Box>
            </li>
          )
        }}
        renderInput={(params) => (
          <TextField {...params} size="small"
            placeholder="Rechercher une période : Néolithique, Révolution française, Trente Glorieuses…"
            inputProps={{ ...params.inputProps, 'aria-label': 'Période étudiée' }} />
        )}
        sx={{ mb: 1.25 }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1.25 }}>
        <Typography variant="body2" color="text.secondary">ou une plage d’années :</Typography>
        <TextField size="small" type="number" placeholder="de" value={from} onChange={(e) => setFrom(e.target.value)}
          sx={{ width: 96 }} inputProps={{ min: 0, 'aria-label': 'Période étudiée, année de début' }} />
        {eraSelect(fromEra, setFromEra, 'Ère de l’année de début')}
        <Typography color="text.disabled">–</Typography>
        <TextField size="small" type="number" placeholder="à" value={to} onChange={(e) => setTo(e.target.value)}
          sx={{ width: 96 }} inputProps={{ min: 0, 'aria-label': 'Période étudiée, année de fin' }} />
        {eraSelect(toEra, setToEra, 'Ère de l’année de fin')}
        <Button size="small" startIcon={<Add />} disabled={!rangeValid} onClick={addRange}
          sx={{ textTransform: 'none', color: TEAL }}>
          Ajouter la plage
        </Button>
        {rangeError && (
          <Typography variant="caption" color="error">
            {`Le début (${formatYear(yearFrom as number)}) doit précéder la fin (${formatYear(yearTo as number)}).`}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, minHeight: 24, alignItems: 'center' }}>
        {value.length === 0 ? (
          <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
            Aucune période étudiée : ce thème ne porte pas sur une époque particulière.
          </Typography>
        ) : value.map((p) => (
          <StudiedPeriodChip key={p.label} value={p} onDelete={() => onChange(value.filter((v) => v.label !== p.label))} />
        ))}
      </Box>
    </Box>
  )
}
