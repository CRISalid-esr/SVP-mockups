'use client'

import { useMemo, useState } from 'react'
import { Autocomplete, Box, Chip, Link, TextField, Tooltip, Typography } from '@mui/material'
import { Add, BusinessOutlined, PersonOutline, PlaceOutlined } from '@mui/icons-material'
import { OrgRef, PersonRef, PlaceRef, TEAL, geonamesUrl, idrefUrl } from '../types'
import { searchOrganizations, searchPersons, searchPlaces, suggestedPlaces } from '../mockRefs'

// ─── Repères structurés : lieux, personnes, organisations ────────────────────
// Trois champs de recherche (GeoNames / IdRef simulés), chaque repère retenu
// devient un chip avec un lien vers le référentiel quand l'identifiant est connu.

export type RefKind = 'place' | 'person' | 'organization'

export const REF_KIND_CONFIG: Record<RefKind, {
  label: string
  placeholder: string
  source: string
  Icon: React.ElementType
}> = {
  place: { label: 'Terrains et lieux', placeholder: 'Rechercher un lieu (région, ville, littoral…)', source: 'GeoNames', Icon: PlaceOutlined },
  person: { label: 'Personnes', placeholder: 'Rechercher une personne (auteur de référence, figure étudiée…)', source: 'IdRef', Icon: PersonOutline },
  organization: { label: 'Organisations', placeholder: 'Rechercher un organisme (institution étudiée, partenaire…)', source: 'IdRef', Icon: BusinessOutlined },
}

type AnyRef = PlaceRef | PersonRef | OrgRef

function refId(kind: RefKind, r: AnyRef): string | undefined {
  if (kind === 'place') return (r as PlaceRef).geonamesId?.toString()
  return (r as PersonRef | OrgRef).ppn
}

function refUrl(kind: RefKind, r: AnyRef): string | undefined {
  if (kind === 'place') {
    const id = (r as PlaceRef).geonamesId
    return id ? geonamesUrl(id) : undefined
  }
  const ppn = (r as PersonRef | OrgRef).ppn
  return ppn ? idrefUrl(ppn) : undefined
}

function refDetail(kind: RefKind, r: AnyRef): string | undefined {
  if (kind === 'person') return (r as PersonRef).dates
  return (r as PlaceRef | OrgRef).detail
}

function sameRef(a: AnyRef, b: AnyRef): boolean {
  return a.label.trim().toLowerCase() === b.label.trim().toLowerCase()
}

/** Chip d'un repère : icône de la nature, libellé, lien vers le référentiel si identifié. */
export function RefChip({ kind, value, onDelete, size = 'medium' }: {
  kind: RefKind; value: AnyRef; onDelete?: () => void; size?: 'small' | 'medium'
}) {
  const cfg = REF_KIND_CONFIG[kind]
  const url = refUrl(kind, value)
  const id = refId(kind, value)
  const detail = refDetail(kind, value)
  const tooltip = url
    ? `${cfg.source} ${id} — ouvrir la notice`
    : `${cfg.source} : non aligné (libellé libre)`
  // Le libellé est un lien vers la notice ; le chip lui-même reste un conteneur
  // (le bouton de suppression et le lien doivent rester deux cibles distinctes).
  const label = (
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
      {url ? (
        <Link href={url} target="_blank" rel="noopener noreferrer" underline="hover"
          onClick={(e) => e.stopPropagation()}
          sx={{ color: 'inherit', '&:hover': { color: TEAL } }}>
          {value.label}
        </Link>
      ) : (
        <span>{value.label}</span>
      )}
      {detail && (
        <Typography component="span" variant="caption" sx={{ color: 'text.secondary', fontSize: '0.66rem' }}>
          {detail}
        </Typography>
      )}
    </Box>
  )
  return (
    <Tooltip title={tooltip}>
      <Chip
        size={size}
        icon={<cfg.Icon sx={{ fontSize: size === 'small' ? 14 : 16 }} />}
        label={label}
        onDelete={onDelete}
        sx={{
          height: size === 'small' ? 24 : 30,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: url ? `${TEAL}55` : 'divider',
          borderStyle: url ? 'solid' : 'dashed',
          color: 'text.primary',
          textDecoration: 'none',
          '& .MuiChip-icon': { color: url ? TEAL : 'text.disabled' },
          '& .MuiChip-label': { px: 1 },
        }}
      />
    </Tooltip>
  )
}

function RefField<T extends AnyRef>({ kind, value, search, onChange, suggestions = [] }: {
  kind: RefKind
  value: T[]
  search: (q: string) => T[]
  onChange: (next: T[]) => void
  suggestions?: T[]
}) {
  const cfg = REF_KIND_CONFIG[kind]
  const [input, setInput] = useState('')

  const options = useMemo(() => {
    const found = search(input).filter((r) => !value.some((v) => sameRef(v, r)))
    const free = input.trim() && !found.some((r) => sameRef(r, { label: input }))
      ? [{ label: input.trim(), isFree: true } as unknown as T & { isFree?: boolean }]
      : []
    return [...found, ...free] as (T & { isFree?: boolean })[]
  }, [input, search, value])

  const add = (r: T & { isFree?: boolean }) => {
    if (value.some((v) => sameRef(v, r))) return
    const { isFree: _f, ...clean } = r
    onChange([...value, clean as T])
    setInput('')
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
        <cfg.Icon sx={{ fontSize: 18, color: TEAL }} />
        <Typography variant="body2" sx={{ fontWeight: 700 }}>{cfg.label}</Typography>
        <Typography variant="caption" color="text.disabled">· {cfg.source}</Typography>
      </Box>
      <Autocomplete<T & { isFree?: boolean }, false, true, true>
        freeSolo
        disableClearable
        options={options}
        inputValue={input}
        onInputChange={(_e, v, reason) => { if (reason !== 'reset') setInput(v) }}
        value={null as unknown as T}
        onChange={(_e, v) => {
          if (!v) return
          if (typeof v === 'string') { if (v.trim()) add({ label: v.trim() } as T) } else add(v)
        }}
        filterOptions={(o) => o}
        getOptionLabel={(o) => (typeof o === 'string' ? o : o.label)}
        isOptionEqualToValue={(o, v) => sameRef(o, v)}
        renderOption={(props, o) => {
          const { key, ...rest } = props as typeof props & { key: string }
          const id = refId(kind, o)
          const detail = refDetail(kind, o)
          return (
            <li key={key} {...rest}>
              {o.isFree ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                  <Add sx={{ fontSize: 16 }} />
                  <Typography variant="body2">Ajouter « {o.label} » sans alignement {cfg.source}</Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', width: '100%', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{o.label}</Typography>
                    {detail && <Typography variant="caption" color="text.secondary">{detail}</Typography>}
                  </Box>
                  <Typography variant="caption" sx={{ color: TEAL, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {cfg.source}{id ? ` · ${id}` : ''}
                  </Typography>
                </Box>
              )}
            </li>
          )
        }}
        renderInput={(params) => (
          <TextField {...params} size="small" placeholder={cfg.placeholder}
            inputProps={{ ...params.inputProps, 'aria-label': cfg.label }} />
        )}
        sx={{ mb: 1 }}
      />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center', minHeight: 24 }}>
        {value.length === 0 && suggestions.length === 0 && (
          <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>Aucun pour l’instant.</Typography>
        )}
        {value.map((r) => (
          <RefChip key={r.label} kind={kind} value={r} onDelete={() => onChange(value.filter((v) => !sameRef(v, r)))} />
        ))}
        {suggestions.length > 0 && (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ ml: value.length ? 1 : 0 }}>Repéré dans votre texte :</Typography>
            {suggestions.map((s) => (
              <Chip key={s.label} size="small" variant="outlined" clickable icon={<Add sx={{ fontSize: 14 }} />}
                label={s.label} onClick={() => add(s)}
                sx={{ borderColor: `${TEAL}60`, color: TEAL, '& .MuiChip-icon': { color: TEAL } }} />
            ))}
          </>
        )}
      </Box>
    </Box>
  )
}

interface Props {
  places: PlaceRef[]
  persons: PersonRef[]
  organizations: OrgRef[]
  /** Texte libre (intitulé + description + mots-clés) pour repérer des lieux à suggérer. */
  contextText?: string
  onChange: (patch: { places?: PlaceRef[]; persons?: PersonRef[]; organizations?: OrgRef[] }) => void
}

export default function RefsPicker({ places, persons, organizations, contextText = '', onChange }: Props) {
  const placeSuggestions = useMemo(() => suggestedPlaces(contextText, places), [contextText, places])
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Précisez sur quoi porte ce thème : les terrains étudiés, les personnes de référence, les organismes
        observés ou partenaires. Ces repères sont alignés sur GeoNames et IdRef et enrichissent le graphe de
        connaissance ; ils restent facultatifs.
      </Typography>
      <RefField<PlaceRef> kind="place" value={places} search={searchPlaces} suggestions={placeSuggestions}
        onChange={(next) => onChange({ places: next })} />
      <RefField<PersonRef> kind="person" value={persons} search={searchPersons}
        onChange={(next) => onChange({ persons: next })} />
      <RefField<OrgRef> kind="organization" value={organizations} search={searchOrganizations}
        onChange={(next) => onChange({ organizations: next })} />
    </Box>
  )
}
