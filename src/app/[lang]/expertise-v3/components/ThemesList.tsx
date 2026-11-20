'use client'

import { useMemo, useState } from 'react'
import * as Lingui from '@lingui/core'
import { Box, Button, Chip, Link, Tooltip, Typography } from '@mui/material'
import { Add, AutoAwesome, CheckCircle } from '@mui/icons-material'
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
} from 'material-react-table'
import ListFilterBar, { FilterDefinition } from '@/components/ListTable/ListFilterBar'
import { listTableProps, listTitleSx } from '@/components/ListTable/listTableProps'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'
import { Localization } from '@/types/Localization'
import {
  CURRENT_YEAR, ResearchProfile, ResearchTheme, VISIBILITY_CONFIG, Visibility, formatPeriod,
} from '../types'

interface Props {
  profile: ResearchProfile
  onEdit: (id: string) => void
  onAdd: () => void
  /** Ouvre l'atelier « Proposer des thèmes d'après mes publications ». */
  onPropose: () => void
}

/** Tri : thèmes validés d'abord (en cours puis par date de début décroissante), brouillons à la fin. */
export function sortThemes(themes: ResearchTheme[]): ResearchTheme[] {
  const rank = (t: ResearchTheme) => (t.status === 'draft' ? 1 : 0)
  return [...themes].sort((a, b) => {
    if (rank(a) !== rank(b)) return rank(a) - rank(b)
    const aOngoing = a.yearTo == null ? 0 : 1
    const bOngoing = b.yearTo == null ? 0 : 1
    if (aOngoing !== bOngoing) return aOngoing - bOngoing
    return (b.yearFrom ?? 0) - (a.yearFrom ?? 0)
  })
}

export function periodBounds(themes: ResearchTheme[]): { min: number; max: number } {
  const starts = themes.map((t) => t.yearFrom).filter((y): y is number => y != null)
  const min = starts.length ? Math.min(...starts) - 1 : CURRENT_YEAR - 10
  return { min, max: CURRENT_YEAR }
}

const FILTERS: FilterDefinition[] = [
  {
    id: 'visibility',
    label: 'Diffusion',
    options: (Object.keys(VISIBILITY_CONFIG) as Visibility[]).map((value) => ({
      value,
      label: VISIBILITY_CONFIG[value].short,
    })),
  },
  {
    id: 'status',
    label: 'Statut',
    options: [
      { value: 'validated', label: 'Validé' },
      { value: 'draft', label: 'Brouillon' },
    ],
  },
]

const COLUMNS: MRT_ColumnDef<ResearchTheme>[] = [
  {
    id: 'label',
    header: 'Thème',
    size: 320,
    grow: true,
    Cell({ row: { original: theme } }) {
      const label = theme.label || 'Thème sans titre'
      return (
        <Box sx={{ minWidth: 0, width: '100%' }}>
          {/* Le clic remonte à la ligne : ce bouton la rend accessible au clavier. */}
          <Link component='button' underline='hover' aria-label={`Modifier le thème ${label}`} sx={listTitleSx}>
            {label}
          </Link>
          <Typography
            variant='body2'
            noWrap
            color='text.secondary'
            sx={{ mt: 0.25, fontStyle: theme.description ? 'normal' : 'italic' }}
          >
            {theme.description || 'Description à compléter'}
          </Typography>
        </Box>
      )
    },
  },
  {
    id: 'period',
    header: 'Période de travail',
    size: 170,
    Cell: ({ row }) => formatPeriod(row.original),
  },
  {
    id: 'publications',
    header: 'Publications',
    size: 125,
    Cell: ({ row }) => row.original.publicationIds?.length ?? 0,
  },
  {
    id: 'visibility',
    header: 'Diffusion',
    size: 165,
    Cell({ row }) {
      const visibility = VISIBILITY_CONFIG[row.original.visibility]
      return (
        <Chip
          size='small'
          icon={<visibility.Icon sx={{ fontSize: 14 }} />}
          label={visibility.short}
          sx={{ bgcolor: visibility.bg, color: visibility.color, '& .MuiChip-icon': { color: 'inherit' } }}
        />
      )
    },
  },
  {
    id: 'status',
    header: 'Statut',
    size: 125,
    Cell({ row }) {
      const { status, lastValidated } = row.original
      return status === 'draft' ? (
        <Tooltip title='Tant qu’il n’est pas validé, ce thème n’apparaît ni dans le graphe de connaissance ni sur les portails.'>
          <Chip size='small' color='warning' label='Brouillon' />
        </Tooltip>
      ) : (
        <Tooltip title={lastValidated ? `Validé le ${lastValidated}` : ''}>
          <Chip size='small' color='success' icon={<CheckCircle sx={{ fontSize: 14 }} />} label='Validé' />
        </Tooltip>
      )
    },
  },
]

export default function ThemesList({ profile, onEdit, onAdd, onPropose }: Props) {
  const lang = Lingui.i18n.locale as ExtendedLanguageCode
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([])
  const [search, setSearch] = useState('')

  const themes = useMemo(() => {
    const term = search.trim().toLowerCase()
    return sortThemes(profile.themes).filter((theme) => {
      const matchesFilters = columnFilters.every(({ id, value }) =>
        (value as string[]).includes(id === 'visibility' ? theme.visibility : theme.status),
      )
      const matchesSearch = !term || [theme.label, theme.description, ...theme.keywords.map((k) => k.label)]
        .some((text) => text.toLowerCase().includes(term))
      return matchesFilters && matchesSearch
    })
  }, [profile.themes, columnFilters, search])

  if (profile.themes.length === 0) {
    return (
      <Box sx={{ p: 6, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 4, bgcolor: 'background.paper' }}>
        <Typography variant='h6' sx={{ mb: 1 }}>Aucun thème pour l’instant</Typography>
        <Typography variant='body1' color='text.secondary' sx={{ mb: 3, maxWidth: 480, mx: 'auto' }}>
          Laissez l’IA proposer des thèmes d’après vos publications, ou décrivez
          directement un premier thème de recherche.
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
          <Button variant='outlined' startIcon={<AutoAwesome />} onClick={onPropose}>
            Proposer des thèmes d’après mes publications
          </Button>
          <Button variant='contained' startIcon={<Add />} onClick={onAdd}>
            Ajouter un thème
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <MaterialReactTable<ResearchTheme>
      {...listTableProps}
      columns={COLUMNS}
      data={themes}
      getRowId={(theme) => theme.id}
      localization={Localization[lang]}
      enableSorting={false}
      enablePagination={false}
      enableBottomToolbar={false}
      muiTableBodyRowProps={({ row }) => ({
        onClick: () => onEdit(row.original.id),
        sx: { cursor: 'pointer' },
      })}
      renderEmptyRowsFallback={() => (
        <Typography color='text.secondary' sx={{ p: 4, textAlign: 'center' }}>
          Aucun thème ne correspond à ces filtres.
        </Typography>
      )}
      renderTopToolbar={() => (
        <ListFilterBar
          filters={FILTERS}
          columnFilters={columnFilters}
          onColumnFiltersChange={setColumnFilters}
          globalFilter={search}
          onGlobalFilterChange={setSearch}
        />
      )}
    />
  )
}
