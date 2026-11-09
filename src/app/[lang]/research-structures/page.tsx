'use client'

import * as Lingui from '@lingui/core'
import { HelpLink } from '@/app/[lang]/components/HelpLink'
import CallMadeIcon from '@mui/icons-material/CallMade'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import TableRowsIcon from '@mui/icons-material/TableRows'
import {
  Box,
  Button,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import { MaterialReactTable, MRT_ColumnDef, MRT_ColumnFiltersState } from 'material-react-table'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { mockService } from '@/mocks/mockService'
import { Localization } from '@/types/Localization'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'
import ListFilterBar, { FilterDefinition } from '@/components/ListTable/ListFilterBar'
import { listTableProps, listTitleSx } from '@/components/ListTable/listTableProps'

// ─── Types ───────────────────────────────────────────────────────────────────

const GENERIC_TYPE_LABELS: Record<string, string> = {
  institution: 'Établissement',
  institution_subdivision: 'Composante',
  unit: 'Unité de recherche',
  team: 'Équipe',
}

type Structure = {
  uid: string
  acronym: string
  name: string
  genericType: string
  nationalType: string | null
  institutionNames: string[]
  membersCount: number
  publicationsCount: number
  oaRate: number
  halRate: number
  parentUid: string | null
  secondaryParentUids: string[]
  slug: string
  isReference?: boolean
  originalUid?: string
  subRows?: Structure[]
}

type View = 'list' | 'tree'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const typeLabel = (structure: Structure) =>
  structure.nationalType ?? GENERIC_TYPE_LABELS[structure.genericType] ?? structure.genericType

/** Taux en pourcentage, avec une barre fine : le nombre porte l'information. */
function RateCell({ value }: { value: number }) {
  if (value <= 0) return <Typography variant='body2' color='text.secondary'>—</Typography>
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
      <Typography variant='body2' sx={{ width: 40, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {`${value} %`}
      </Typography>
      <LinearProgress
        variant='determinate'
        value={value}
        aria-hidden
        sx={{ flex: 1, maxWidth: 64, height: 4, borderRadius: 2, bgcolor: 'action.hover' }}
      />
    </Box>
  )
}

function exportToCsv(rows: Structure[]) {
  const headers = ['Acronyme', 'Nom', 'Type', 'Tutelles', 'Membres', 'Publications (24 mois)', 'OA %', 'HAL %']
  const lines = rows.map((d) =>
    [
      d.acronym,
      `"${d.name.replace(/"/g, '""')}"`,
      typeLabel(d),
      `"${d.institutionNames.join(' / ')}"`,
      d.membersCount,
      d.publicationsCount,
      d.oaRate,
      d.halRate,
    ].join(';'),
  )
  const csv = '﻿' + [headers.join(';'), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'structures-de-recherche.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function buildTree(flat: Structure[]): Structure[] {
  const byUid = new Map(flat.map((s) => [s.uid, { ...s, subRows: [] as Structure[] }]))
  const roots: Structure[] = []

  for (const node of byUid.values()) {
    if (node.parentUid && byUid.has(node.parentUid)) {
      byUid.get(node.parentUid)!.subRows!.push(node)
    } else {
      roots.push(node)
    }
    // Une structure en co-tutelle apparaît aussi, en renvoi, sous ses autres tutelles.
    for (const secUid of node.secondaryParentUids) {
      if (byUid.has(secUid)) {
        byUid.get(secUid)!.subRows!.push({
          ...node,
          uid: `${node.uid}__ref__${secUid}`,
          originalUid: node.uid,
          isReference: true,
          subRows: undefined,
          secondaryParentUids: [],
        })
      }
    }
  }

  const clean = (nodes: Structure[]): Structure[] =>
    nodes.map((n) => ({
      ...n,
      subRows: n.subRows && n.subRows.length > 0 ? clean(n.subRows) : undefined,
    }))
  return clean(roots)
}

const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

// ─── Cellule « Structure » ───────────────────────────────────────────────────

function NameCell({ row }: { row: Structure }) {
  return (
    <Box sx={{ minWidth: 0, opacity: row.isReference ? 0.7 : 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        {row.isReference && <CallMadeIcon sx={{ fontSize: 14, color: 'text.secondary' }} aria-hidden />}
        <Typography sx={{ ...listTitleSx, width: 'auto', fontWeight: 600 }}>{row.acronym}</Typography>
        <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
          {row.isReference ? `${typeLabel(row)} · en co-tutelle` : typeLabel(row)}
        </Typography>
      </Box>
      <Typography variant='body2' color='text.secondary' noWrap sx={{ fontSize: '0.8125rem' }}>
        {row.name}
      </Typography>
    </Box>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

const ResearchStructuresPage = () => {
  const lang = Lingui.i18n.locale as ExtendedLanguageCode
  const router = useRouter()
  const [view, setView] = useState<View>('list')
  const [filters, setFilters] = useState<MRT_ColumnFiltersState>([])
  const [query, setQuery] = useState('')

  const data = useMemo<Structure[]>(() => {
    const { researchStructures } = mockService.getResearchStructures()
    return researchStructures.map((s) => ({
      uid: s.uid,
      acronym:
        s.short_labels?.find((n) => n.language === lang)?.value ??
        s.short_labels?.[0]?.value ??
        (s as { acronym?: string }).acronym ??
        s.uid,
      name:
        s.long_labels?.find((n) => n.language === lang)?.value ??
        s.long_labels?.[0]?.value ??
        '',
      genericType: (s as { generic_type?: string }).generic_type ?? 'unit',
      nationalType: (s as { national_type?: string | null }).national_type ?? null,
      institutionNames: (s as { institutionNames?: string[] }).institutionNames ?? [],
      membersCount: (s as { membersCount?: number }).membersCount ?? 0,
      publicationsCount: (s as { publicationsCount?: number }).publicationsCount ?? 0,
      oaRate: (s as { oaRate?: number }).oaRate ?? 0,
      halRate: (s as { halRate?: number }).halRate ?? 0,
      parentUid: (s as { parent_uid?: string | null }).parent_uid ?? null,
      secondaryParentUids: (s as { secondary_parent_uids?: string[] }).secondary_parent_uids ?? [],
      slug: s.slug ?? s.uid,
    }))
  }, [lang])

  const navigateToDetail = useCallback(
    (structure: Structure) => router.push(`/${lang}/research-structures/${structure.originalUid ?? structure.uid}`),
    [lang, router],
  )

  const filterDefinitions = useMemo<FilterDefinition[]>(
    () => [
      {
        id: 'type',
        label: 'Type',
        options: Object.entries(GENERIC_TYPE_LABELS)
          .filter(([value]) => data.some((d) => d.genericType === value))
          .map(([value, label]) => ({ value, label })),
      },
      {
        id: 'institution',
        label: 'Tutelles',
        options: [...new Set(data.flatMap((d) => d.institutionNames))].sort().map((name) => ({ value: name, label: name })),
      },
    ],
    [data],
  )

  const selected = (id: string) => (filters.find((f) => f.id === id)?.value as string[] | undefined) ?? []
  const types = selected('type')
  const institutions = selected('institution')
  const q = fold(query.trim())

  const matches = useCallback(
    (d: Structure) =>
      (types.length === 0 || types.includes(d.genericType)) &&
      (institutions.length === 0 || d.institutionNames.some((name) => institutions.includes(name))) &&
      (!q || fold(`${d.acronym} ${d.name}`).includes(q)),
    [types, institutions, q],
  )

  const filtered = useMemo(() => data.filter(matches), [data, matches])
  // L'arborescence garde les parents d'une structure trouvée, pour qu'on voie où elle se situe.
  const treeData = useMemo(() => {
    if (filtered.length === data.length) return buildTree(data)
    const keep = new Set<string>()
    const byUid = new Map(data.map((d) => [d.uid, d]))
    for (const d of filtered) {
      let current: Structure | undefined = d
      while (current && !keep.has(current.uid)) {
        keep.add(current.uid)
        current = current.parentUid ? byUid.get(current.parentUid) : undefined
      }
    }
    return buildTree(data.filter((d) => keep.has(d.uid)).map((d) => ({ ...d, secondaryParentUids: d.secondaryParentUids.filter((uid) => keep.has(uid)) })))
  }, [data, filtered])

  const columns = useMemo<MRT_ColumnDef<Structure>[]>(
    () => [
      {
        accessorKey: 'acronym',
        header: 'Structure',
        size: 320,
        Cell: ({ row }) => <NameCell row={row.original} />,
      },
      {
        id: 'institutions',
        accessorFn: (row) => row.institutionNames.join(', '),
        header: 'Tutelles',
        size: 200,
        Cell: ({ row }) => (
          <Typography variant='body2' color={row.original.institutionNames.length ? 'text.primary' : 'text.secondary'} sx={{ fontSize: '0.875rem' }}>
            {row.original.institutionNames.join(', ') || '—'}
          </Typography>
        ),
      },
      {
        accessorKey: 'membersCount',
        header: 'Membres',
        size: 110,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right', sx: { justifyContent: 'flex-end' } },
        Cell: ({ row }) => row.original.membersCount.toLocaleString('fr-FR'),
      },
      {
        accessorKey: 'publicationsCount',
        header: 'Publications',
        size: 130,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right', sx: { justifyContent: 'flex-end' } },
        Cell: ({ row }) => (
          <Tooltip title='24 derniers mois'>
            <span>{row.original.publicationsCount > 0 ? row.original.publicationsCount.toLocaleString('fr-FR') : '—'}</span>
          </Tooltip>
        ),
      },
      {
        accessorKey: 'oaRate',
        header: 'Accès ouvert',
        size: 150,
        Cell: ({ row }) => <RateCell value={row.original.oaRate} />,
      },
      {
        accessorKey: 'halRate',
        header: 'Dans HAL',
        size: 150,
        Cell: ({ row }) => <RateCell value={row.original.halRate} />,
      },
    ],
    [],
  )

  const viewToggle = (
    <ToggleButtonGroup
      data-tour='structures-tabs'
      size='small'
      exclusive
      value={view}
      onChange={(_, value: View | null) => value && setView(value)}
      aria-label='Présentation'
      sx={{ ml: 1 }}
    >
      <ToggleButton value='list' aria-label='Liste'>
        <TableRowsIcon fontSize='small' sx={{ mr: 0.5 }} />
        Liste
      </ToggleButton>
      <ToggleButton value='tree' aria-label='Arborescence'>
        <AccountTreeIcon fontSize='small' sx={{ mr: 0.5 }} />
        Arborescence
      </ToggleButton>
    </ToggleButtonGroup>
  )

  const filterBar = (
    <ListFilterBar
      filters={filterDefinitions}
      columnFilters={filters}
      onColumnFiltersChange={setFilters}
      globalFilter={query}
      onGlobalFilterChange={setQuery}
      endActions={viewToggle}
    />
  )

  const isTree = view === 'tree'

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant='h4' component='h1'>
            Structures <HelpLink topic='structures' sx={{ ml: 0.5 }} />
          </Typography>
          <Typography color='text.secondary' sx={{ mt: 0.5 }}>
            {filtered.length === data.length
              ? `${data.length} structures : établissements, composantes, unités et équipes`
              : `${filtered.length} structure${filtered.length > 1 ? 's' : ''} sur ${data.length}`}
          </Typography>
        </Box>
        <Button startIcon={<FileDownloadIcon />} variant='outlined' onClick={() => exportToCsv(filtered)}>
          Exporter
        </Button>
      </Box>

      <MaterialReactTable<Structure>
        key={view}
        {...listTableProps}
        columns={columns}
        data={isTree ? treeData : filtered}
        enableSorting={!isTree}
        enableExpanding={isTree}
        getSubRows={isTree ? (row) => row.subRows : undefined}
        enablePagination={!isTree}
        enableBottomToolbar={!isTree}
        enableGlobalFilter={false}
        initialState={{ expanded: true, pagination: { pageIndex: 0, pageSize: 25 } }}
        localization={Localization[lang]}
        muiTableBodyRowProps={({ row }) => ({
          onClick: () => navigateToDetail(row.original),
          sx: { cursor: 'pointer' },
        })}
        renderEmptyRowsFallback={() => (
          <Typography color='text.secondary' sx={{ p: 4, textAlign: 'center' }}>
            Aucune structure ne correspond à ces filtres.
          </Typography>
        )}
        renderTopToolbar={() => filterBar}
      />
    </Box>
  )
}

export default ResearchStructuresPage
