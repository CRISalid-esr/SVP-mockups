'use client'

import { useMemo, useState } from 'react'
import { Box, Checkbox, IconButton, Link, Tooltip, Typography } from '@mui/material'
import { OpenInNew } from '@mui/icons-material'
import { MRT_ColumnFiltersState } from 'material-react-table'
import ListFilterBar, { FilterDefinition } from '@/components/ListTable/ListFilterBar'
import { ResearchTheme } from '../types'
import { PUBLICATION_TYPES, Publication, halUrl } from '../mockPublications'

// ─── Sélecteur de publications ───────────────────────────────────────────────
// Liste des publications du chercheur, groupée par année, avec la même barre de
// filtres que les autres listes. Les publications déjà rattachées à un thème sont
// signalées, pour montrer d'un coup d'œil ce qui reste à décrire.

interface Props {
  publications: Publication[]
  selected: string[]
  onChange: (ids: string[]) => void
  /** publication id → thème qui la couvre déjà. */
  coveredBy: Record<string, string>
  themes: ResearchTheme[]
  /** Hauteur maximale de la liste (défilement interne). */
  maxHeight?: number | string
}

export default function PublicationPicker({ publications, selected, onChange, coveredBy, themes, maxHeight = 460 }: Props) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<MRT_ColumnFiltersState>([])

  const themeLabel = (id: string) => themes.find((t) => t.id === id)?.label ?? 'un thème'
  const selectedSet = useMemo(() => new Set(selected), [selected])

  const filterDefinitions: FilterDefinition[] = useMemo(() => [{
    id: 'type',
    label: 'Type',
    options: PUBLICATION_TYPES
      .filter((type) => publications.some((p) => p.type === type))
      .map((type) => ({ value: type, label: type })),
  }], [publications])

  const types = (filters.find((f) => f.id === 'type')?.value as string[] | undefined) ?? []

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return publications
      .filter((p) => types.length === 0 || types.includes(p.type))
      .filter((p) => !q || p.title.toLowerCase().includes(q) || p.venue.toLowerCase().includes(q) || String(p.year).includes(q))
      .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title))
  }, [publications, query, types])

  const byYear = useMemo(() => {
    const map = new Map<number, Publication[]>()
    for (const p of visible) map.set(p.year, [...(map.get(p.year) ?? []), p])
    return [...map.entries()]
  }, [visible])

  const uncovered = publications.filter((p) => !coveredBy[p.id])

  const toggle = (id: string) => {
    onChange(selectedSet.has(id) ? selected.filter((s) => s !== id) : [...selected, id])
  }
  const toggleYear = (pubs: Publication[]) => {
    const allIn = pubs.every((p) => selectedSet.has(p.id))
    const ids = pubs.map((p) => p.id)
    onChange(allIn ? selected.filter((s) => !ids.includes(s)) : [...new Set([...selected, ...ids])])
  }

  const quickLink = (label: string, ids: string[]) => (
    <Link component="button" type="button" underline="hover" onClick={() => onChange(ids)} sx={{ fontSize: '0.875rem' }}>
      {label}
    </Link>
  )

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4, overflow: 'hidden', bgcolor: 'background.paper' }}>
      <ListFilterBar
        filters={filterDefinitions}
        columnFilters={filters}
        onColumnFiltersChange={setFilters}
        globalFilter={query}
        onGlobalFilterChange={setQuery}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mt: 1.5 }}>
          <Typography variant="body2" color="text.secondary">Sélectionner :</Typography>
          {quickLink(`Non rattachées (${uncovered.length})`, uncovered.map((p) => p.id))}
          {quickLink(`Toutes (${publications.length})`, publications.map((p) => p.id))}
          {quickLink('Aucune', [])}
          <Typography variant="body2" color="text.secondary" sx={{ ml: { sm: 'auto' } }}>
            {`${selected.length} publication${selected.length > 1 ? 's' : ''} sélectionnée${selected.length > 1 ? 's' : ''} sur ${publications.length}`}
          </Typography>
        </Box>
      </ListFilterBar>

      <Box sx={{ maxHeight, overflow: 'auto' }}>
        {byYear.length === 0 && (
          <Typography variant="body1" color="text.secondary" sx={{ p: 4, textAlign: 'center' }}>
            Aucune publication ne correspond à ces critères.
          </Typography>
        )}
        {byYear.map(([year, pubs]) => {
          const count = pubs.filter((p) => selectedSet.has(p.id)).length
          return (
            <Box key={year}>
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 0.5,
                bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider',
                position: 'sticky', top: 0, zIndex: 1,
              }}>
                <Checkbox
                  size="small"
                  checked={count === pubs.length}
                  indeterminate={count > 0 && count < pubs.length}
                  onChange={() => toggleYear(pubs)}
                  inputProps={{ 'aria-label': `Sélectionner les publications de ${year}` }}
                  sx={{ p: 0.5 }}
                />
                <Typography variant="body1" fontWeight={600} sx={{ fontVariantNumeric: 'tabular-nums' }}>{year}</Typography>
              </Box>
              {pubs.map((p) => {
                const covered = coveredBy[p.id]
                const checked = selectedSet.has(p.id)
                return (
                  <Box
                    key={p.id}
                    onClick={() => toggle(p.id)}
                    sx={{
                      display: 'flex', alignItems: 'flex-start', gap: 1.5, px: 2, py: 1.25, cursor: 'pointer',
                      borderBottom: '1px solid', borderColor: 'divider',
                      '&:hover': { bgcolor: 'navHover' },
                    }}
                  >
                    <Checkbox size="small" checked={checked} tabIndex={-1} inputProps={{ 'aria-label': p.title }} sx={{ p: 0.5 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body1" fontWeight={500}>{p.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                        {p.type} · {p.venue}
                        {covered && (
                          <>
                            {' · Déjà rattachée à '}
                            <span>{themeLabel(covered)}</span>
                          </>
                        )}
                      </Typography>
                    </Box>
                    <Tooltip title="Voir dans HAL">
                      <IconButton
                        size="small"
                        component="a"
                        href={halUrl(p.halId)}
                        target="_blank"
                        rel="noopener"
                        aria-label={`Voir ${p.halId} dans HAL`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <OpenInNew sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )
              })}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
