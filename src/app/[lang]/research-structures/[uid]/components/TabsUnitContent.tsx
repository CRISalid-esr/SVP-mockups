'use client'

import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Box, Button, Typography } from '@mui/material'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnFiltersState } from 'material-react-table'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import ListFilterBar, { FilterDefinition } from '@/components/ListTable/ListFilterBar'
import { listTableProps } from '@/components/ListTable/listTableProps'
import DashboardSectionCard from '@/app/[lang]/dashboard/components/charts/DashboardSectionCard'
import { PersonRaw, StructureRaw } from '../types'
import PublicationsChart from './PublicationsChart'
import { StructureTable } from './SubstructuresTable'

function initials(name: string) {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
}

const fold = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// ── Membres ───────────────────────────────────────────────────────────────────

type MembresTabProps = { members: PersonRaw[]; lang: string }
export function MembresTab({ members, lang }: MembresTabProps) {
  const router = useRouter()
  const [filters, setFilters] = useState<MRT_ColumnFiltersState>([])
  const [query, setQuery] = useState('')

  const filterDefinitions = useMemo<FilterDefinition[]>(
    () => [
      {
        id: 'statut',
        label: 'Statut',
        options: [...new Set(members.map((m) => m.statut).filter(Boolean) as string[])].sort().map((s) => ({ value: s, label: s })),
      },
    ],
    [members],
  )
  const statuts = (filters.find((f) => f.id === 'statut')?.value as string[] | undefined) ?? []
  const q = fold(query.trim())
  const shown = members.filter(
    (m) => (statuts.length === 0 || (m.statut && statuts.includes(m.statut))) && (!q || fold(m.displayName).includes(q)),
  )

  const columns = useMemo<MRT_ColumnDef<PersonRaw>[]>(
    () => [
      {
        accessorKey: 'displayName',
        header: 'Membre',
        size: 280,
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <Box
              aria-hidden
              sx={{ width: 32, height: 32, borderRadius: 2, flexShrink: 0, bgcolor: 'navActive', color: 'primary.main', display: 'grid', placeItems: 'center', fontSize: '0.75rem', fontWeight: 600 }}
            >
              {initials(row.original.displayName)}
            </Box>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }} noWrap>{row.original.displayName}</Typography>
          </Box>
        ),
      },
      { accessorKey: 'statut', header: 'Statut', size: 130, Cell: ({ row }) => row.original.statut ?? '—' },
      {
        accessorKey: 'publis24m',
        header: 'Publications',
        size: 130,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right', sx: { justifyContent: 'flex-end' } },
        Cell: ({ row }) => row.original.publis24m ?? '—',
      },
      {
        accessorKey: 'oaRate',
        header: 'Accès ouvert',
        size: 130,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right', sx: { justifyContent: 'flex-end' } },
        Cell: ({ row }) => (row.original.oaRate != null ? `${row.original.oaRate} %` : '—'),
      },
      {
        accessorKey: 'halRate',
        header: 'Dans HAL',
        size: 130,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right', sx: { justifyContent: 'flex-end' } },
        Cell: ({ row }) => (row.original.halRate != null ? `${row.original.halRate} %` : '—'),
      },
    ],
    [],
  )

  if (members.length === 0) {
    return (
      <Typography color='text.secondary' sx={{ py: 2 }}>
        Pas encore de données sur les membres de cette structure.
      </Typography>
    )
  }

  return (
    <MaterialReactTable<PersonRaw>
      {...listTableProps}
      columns={columns}
      data={shown}
      enableGlobalFilter={false}
      initialState={{ sorting: [{ id: 'publis24m', desc: true }], pagination: { pageIndex: 0, pageSize: 25 } }}
      muiTableBodyRowProps={({ row }) => ({
        onClick: () => router.push(`/${lang}/researchers/${row.original.slug}`),
        sx: { cursor: 'pointer' },
      })}
      renderEmptyRowsFallback={() => (
        <Typography color='text.secondary' sx={{ p: 4, textAlign: 'center' }}>Aucun membre ne correspond à ces filtres.</Typography>
      )}
      renderTopToolbar={() => (
        <ListFilterBar
          filters={filterDefinitions}
          columnFilters={filters}
          onColumnFiltersChange={setFilters}
          globalFilter={query}
          onGlobalFilterChange={setQuery}
        />
      )}
    />
  )
}

// ── Équipes ───────────────────────────────────────────────────────────────────

type EquipesTabProps = { teams: StructureRaw[]; lang: string }
export function EquipesTab({ teams, lang }: EquipesTabProps) {
  return <StructureTable structures={teams} lang={lang} emptyText='Aucune équipe rattachée à cette unité.' />
}

// ── Publications ──────────────────────────────────────────────────────────────

type PublicationsTabProps = { structure: StructureRaw; lang: string }
export function PublicationsTab({ structure, lang }: PublicationsTabProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <DashboardSectionCard title='Publications par année' subtitle='Selon le mode d’accès'>
        <PublicationsChart publicationsByYear={structure.publicationsByYear ?? []} />
      </DashboardSectionCard>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <Button
          component={NextLink}
          href={`/${lang}/documents?perspective=${encodeURIComponent(structure.slug ?? structure.uid)}`}
          variant='outlined'
          endIcon={<ArrowForwardIcon />}
        >
          Voir les publications
        </Button>
        <Button
          component={NextLink}
          href={`/${lang}/dashboard?perspective=${encodeURIComponent(structure.slug ?? structure.uid)}`}
          endIcon={<ArrowForwardIcon />}
        >
          Ouvrir le tableau de bord
        </Button>
      </Box>
    </Box>
  )
}

// ── À propos ──────────────────────────────────────────────────────────────────

type AProposTabProps = { structure: StructureRaw; lang: string }
export function AProposTab({ structure, lang }: AProposTabProps) {
  const description = structure.descriptions.find((d) => d.language === lang)?.value ?? structure.descriptions[0]?.value ?? null
  const rows = [
    { label: 'Présentation', value: description },
    { label: 'Tutelles', value: structure.institutionNames.length > 0 ? structure.institutionNames.join(' · ') : null },
    { label: 'RNSR', value: structure.rnsr ?? null },
  ].filter((row) => row.value)

  return (
    <DashboardSectionCard title='À propos'>
      <Box component='dl' sx={{ m: 0 }}>
        {rows.map((row, index) => (
          <Box
            key={row.label}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: '160px minmax(0, 1fr)' },
              columnGap: 3,
              py: 1.5,
              borderTop: index === 0 ? 0 : 1,
              borderColor: 'divider',
            }}
          >
            <Typography component='dt' variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>{row.label}</Typography>
            <Typography component='dd' variant='body2' sx={{ m: 0, lineHeight: 1.7 }}>{row.value}</Typography>
          </Box>
        ))}
      </Box>
    </DashboardSectionCard>
  )
}
