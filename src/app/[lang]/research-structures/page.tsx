'use client'

import * as Lingui from '@lingui/core'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CallMadeIcon from '@mui/icons-material/CallMade'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import TableRowsIcon from '@mui/icons-material/TableRows'
import {
  Box,
  Button,
  Chip,
  LinearProgress,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material'
import { useTheme, Theme } from '@mui/material/styles'
import {
  MaterialReactTable,
  MRT_ColumnDef,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
  useMaterialReactTable,
} from 'material-react-table'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { mockService } from '@/mocks/mockService'
import { Localization } from '@/types/Localization'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'

// ─── Types ───────────────────────────────────────────────────────────────────

const GENERIC_TYPE_LABELS: Record<string, string> = {
  institution: 'Institution',
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
  rnsr?: string
  parentUid: string | null
  secondaryParentUids: string[]
  slug: string
  isReference?: boolean
  originalUid?: string
  subRows?: Structure[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function RateBar({ value, color }: { value: number; color: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ width: 54 }}>
        <LinearProgress
          variant='determinate'
          value={value}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: 'action.disabledBackground',
            '& .MuiLinearProgress-bar': { backgroundColor: color },
          }}
        />
      </Box>
      <Typography variant='caption' fontWeight='bold'>
        {value > 0 ? `${value} %` : '—'}
      </Typography>
    </Box>
  )
}

function exportToCsv(rows: { original: Structure }[]) {
  const headers = ['Acronyme', 'Nom', 'Type', 'Tutelles', 'Membres', 'Publications (24 mois)', 'OA %', 'HAL %']
  const lines = rows.map(({ original: d }) =>
    [
      d.acronym,
      `"${d.name.replace(/"/g, '""')}"`,
      d.nationalType ?? GENERIC_TYPE_LABELS[d.genericType] ?? d.genericType,
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
    // Place under primary parent
    if (node.parentUid && byUid.has(node.parentUid)) {
      byUid.get(node.parentUid)!.subRows!.push(node)
    } else {
      roots.push(node)
    }
    // Place a reference node under each secondary parent
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

// ─── Name cell (shared between flat and tree views) ──────────────────────────

function NameCell({ row, onNavigate }: { row: Structure; onNavigate: (uid: string) => void }) {
  const { acronym, name, rnsr, nationalType, isReference, originalUid } = row
  const targetUid = originalUid ?? row.uid

  if (isReference) {
    return (
      <Box
        sx={{ cursor: 'pointer', opacity: 0.65 }}
        onClick={() => onNavigate(targetUid)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <CallMadeIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
          <Typography
            variant='body2'
            fontStyle='italic'
            color='text.secondary'
            sx={{ '&:hover': { textDecoration: 'underline' } }}
          >
            {acronym}
          </Typography>
          {nationalType && (
            <Chip label={nationalType} size='small' sx={{ height: 14, fontSize: 10 }} />
          )}
          <Chip label='co-tutelle' size='small' variant='outlined' sx={{ height: 14, fontSize: 10, borderStyle: 'dashed' }} />
        </Box>
        <Typography variant='caption' color='text.disabled' fontStyle='italic'
          sx={{ display: 'block', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {name}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ cursor: 'pointer' }} onClick={() => onNavigate(targetUid)}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
        <Typography
          variant='body2'
          fontWeight='bold'
          color='primary'
          sx={{ '&:hover': { textDecoration: 'underline' } }}
        >
          {acronym}
        </Typography>
        {nationalType && (
          <Chip label={nationalType} size='small' sx={{ height: 16, fontSize: 10 }} />
        )}
      </Box>
      <Typography
        variant='caption'
        color='text.secondary'
        sx={{
          display: 'block',
          maxWidth: 320,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </Typography>
      {rnsr && (
        <Typography variant='caption' color='text.disabled'>
          {`RNSR ${rnsr}`}
        </Typography>
      )}
    </Box>
  )
}

// ─── Flat table ──────────────────────────────────────────────────────────────

function FlatTable({ data, lang, theme, onNavigate }: {
  data: Structure[]
  lang: ExtendedLanguageCode
  theme: Theme
  onNavigate: (uid: string) => void
}) {
  const allInstitutions = useMemo(
    () => [...new Set(data.flatMap((d) => d.institutionNames))].sort(),
    [data],
  )

  const columns = useMemo<MRT_ColumnDef<Structure>[]>(
    () => [
      {
        accessorKey: 'acronym',
        header: 'Structure',
        size: 260,
        grow: 2,
        filterFn: (row, _id, filterValue: string) => {
          const q = filterValue.toLowerCase()
          return (
            row.original.acronym.toLowerCase().includes(q) ||
            row.original.name.toLowerCase().includes(q)
          )
        },
        Cell({ row }) {
          return <NameCell row={row.original} onNavigate={onNavigate} />
        },
      },
      {
        accessorKey: 'institutionNames',
        header: 'Tutelles',
        size: 200,
        grow: 1,
        accessorFn: (row) => row.institutionNames.join(', '),
        filterVariant: 'multi-select',
        filterSelectOptions: allInstitutions,
        filterFn: (row, _id, filterValue: string[]) => {
          if (!filterValue || filterValue.length === 0) return true
          return row.original.institutionNames.some((inst) => filterValue.includes(inst))
        },
        Cell({ row }) {
          return (
            <Typography variant='body2'>
              {row.original.institutionNames.join(', ') || '—'}
            </Typography>
          )
        },
      },
      {
        accessorKey: 'membersCount',
        header: 'Membres',
        size: 100,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell({ row }) {
          return (
            <Typography variant='body2' fontWeight='bold'>
              {row.original.membersCount.toLocaleString('fr-FR')}
            </Typography>
          )
        },
      },
      {
        accessorKey: 'publicationsCount',
        header: 'Publications',
        size: 120,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell({ row }) {
          return (
            <Tooltip title='24 derniers mois'>
              <Typography variant='body2' fontWeight='bold'>
                {row.original.publicationsCount > 0
                  ? row.original.publicationsCount.toLocaleString('fr-FR')
                  : '—'}
              </Typography>
            </Tooltip>
          )
        },
      },
      {
        accessorKey: 'oaRate',
        header: 'OA',
        size: 120,
        Cell({ row }) {
          return <RateBar value={row.original.oaRate} color={theme.palette.success.main} />
        },
      },
      {
        accessorKey: 'halRate',
        header: 'HAL',
        size: 120,
        Cell({ row }) {
          return <RateBar value={row.original.halRate} color={theme.palette.primary.main} />
        },
      },
      {
        id: 'detail',
        header: '',
        enableSorting: false,
        enableColumnFilter: false,
        size: 100,
        Cell({ row }) {
          return (
            <Button
              component={Link}
              href={`/${lang}/research-structures/${row.original.uid}`}
              size='small'
              endIcon={<ArrowForwardIcon />}
              variant='text'
            >
              Détail
            </Button>
          )
        },
      },
    ],
    [lang, theme, allInstitutions, onNavigate],
  )

  const table = useMaterialReactTable({
    columns,
    data,
    enableColumnResizing: true,
    enablePagination: true,
    enableRowSelection: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    layoutMode: 'grid',
    localization: Localization[lang],
    initialState: {
      showColumnFilters: false,
      pagination: { pageIndex: 0, pageSize: 25 },
    },
    muiSelectCheckboxProps: { color: 'secondary' },
    muiTablePaperProps: { sx: { width: '100%' } },
    muiTableContainerProps: { sx: { width: '100%' } },
    renderToolbarInternalActions: ({ table }) => (
      <Box>
        <MRT_ToggleGlobalFilterButton table={table} />
        <MRT_ToggleFiltersButton table={table} />
        <MRT_ToggleDensePaddingButton table={table} />
        <MRT_ToggleFullScreenButton table={table} />
        <MRT_ShowHideColumnsButton table={table} />
        <Tooltip title='Réinitialiser les filtres'>
          <span>
            <Button
              size='small'
              sx={{ minWidth: 0, px: 1 }}
              onClick={() => table.resetColumnFilters()}
            >
              <FilterAltOffIcon fontSize='small' />
            </Button>
          </span>
        </Tooltip>
      </Box>
    ),
  })

  return <MaterialReactTable table={table} />
}

// ─── Tree table ──────────────────────────────────────────────────────────────

function TreeTable({ data, lang, theme, onNavigate }: {
  data: Structure[]
  lang: ExtendedLanguageCode
  theme: Theme
  onNavigate: (uid: string) => void
}) {
  const treeData = useMemo(() => buildTree(data), [data])

  const columns = useMemo<MRT_ColumnDef<Structure>[]>(
    () => [
      {
        accessorKey: 'acronym',
        header: 'Structure',
        size: 300,
        grow: 2,
        Cell({ row }) {
          return <NameCell row={row.original} onNavigate={onNavigate} />
        },
      },
      {
        accessorKey: 'membersCount',
        header: 'Membres',
        size: 100,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell({ row }) {
          return (
            <Typography variant='body2' fontWeight='bold'>
              {row.original.membersCount.toLocaleString('fr-FR')}
            </Typography>
          )
        },
      },
      {
        accessorKey: 'publicationsCount',
        header: 'Publications',
        size: 120,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell({ row }) {
          return (
            <Tooltip title='24 derniers mois'>
              <Typography variant='body2' fontWeight='bold'>
                {row.original.publicationsCount > 0
                  ? row.original.publicationsCount.toLocaleString('fr-FR')
                  : '—'}
              </Typography>
            </Tooltip>
          )
        },
      },
      {
        accessorKey: 'oaRate',
        header: 'OA',
        size: 120,
        Cell({ row }) {
          return <RateBar value={row.original.oaRate} color={theme.palette.success.main} />
        },
      },
      {
        accessorKey: 'halRate',
        header: 'HAL',
        size: 120,
        Cell({ row }) {
          return <RateBar value={row.original.halRate} color={theme.palette.primary.main} />
        },
      },
      {
        id: 'detail',
        header: '',
        enableSorting: false,
        enableColumnFilter: false,
        size: 100,
        Cell({ row }) {
          return (
            <Button
              component={Link}
              href={`/${lang}/research-structures/${row.original.uid}`}
              size='small'
              endIcon={<ArrowForwardIcon />}
              variant='text'
            >
              Détail
            </Button>
          )
        },
      },
    ],
    [lang, theme, onNavigate],
  )

  const table = useMaterialReactTable({
    columns,
    data: treeData,
    enableExpanding: true,
    getSubRows: (row) => row.subRows,
    enableColumnResizing: true,
    enablePagination: false,
    enableGlobalFilter: true,
    enableColumnFilters: false,
    layoutMode: 'grid',
    localization: Localization[lang],
    initialState: {
      expanded: true,
    },
    muiTablePaperProps: { sx: { width: '100%' } },
    muiTableContainerProps: { sx: { width: '100%', maxHeight: '70vh' } },
    enableStickyHeader: true,
    renderToolbarInternalActions: ({ table }) => (
      <Box>
        <MRT_ToggleGlobalFilterButton table={table} />
        <MRT_ToggleDensePaddingButton table={table} />
        <MRT_ToggleFullScreenButton table={table} />
        <MRT_ShowHideColumnsButton table={table} />
      </Box>
    ),
  })

  return <MaterialReactTable table={table} />
}

// ─── Page ────────────────────────────────────────────────────────────────────

const ResearchStructuresPage = () => {
  const lang = Lingui.i18n.locale as ExtendedLanguageCode
  const theme = useTheme()
  const router = useRouter()
  const [tab, setTab] = useState(0)

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
      rnsr: (s as { rnsr?: string }).rnsr,
      parentUid: (s as { parent_uid?: string | null }).parent_uid ?? null,
      secondaryParentUids: (s as { secondary_parent_uids?: string[] }).secondary_parent_uids ?? [],
      slug: s.slug ?? s.uid,
    }))
  }, [lang])

  const navigateToDetail = useCallback(
    (uid: string) => router.push(`/${lang}/research-structures/${uid}`),
    [lang, router],
  )

  const flatData = useMemo(() => data, [data])

  const tableProps = { data: flatData, lang, theme, onNavigate: navigateToDetail }

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant='h4'>Structures de recherche</Typography>
        <Button
          startIcon={<FileDownloadIcon />}
          variant='outlined'
          onClick={() => {
            exportToCsv(flatData.map((d) => ({ original: d })))
          }}
        >
          Exporter
        </Button>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<TableRowsIcon fontSize='small' />} iconPosition='start' label='Vue à plat' />
        <Tab icon={<AccountTreeIcon fontSize='small' />} iconPosition='start' label='Vue hiérarchique' />
      </Tabs>

      {tab === 0 && <FlatTable {...tableProps} />}
      {tab === 1 && <TreeTable {...tableProps} />}
    </Box>
  )
}

export default ResearchStructuresPage
