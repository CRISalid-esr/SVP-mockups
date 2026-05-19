'use client'

import * as Lingui from '@lingui/core'
import { Trans } from '@lingui/react/macro'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import SyncIcon from '@mui/icons-material/Sync'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import {
  Box,
  Button,
  LinearProgress,
  Snackbar,
  Tooltip,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
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

type Laboratory = {
  uid: string
  acronym: string
  name: string
  institutionNames: string[]
  membersCount: number
  publicationsCount: number
  oaRate: number
  halRate: number
  rnsr?: string
  slug: string
}

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
        {value} %
      </Typography>
    </Box>
  )
}

function exportToCsv(rows: { original: Laboratory }[]) {
  const headers = ['Acronyme', 'Nom', 'Tutelles', 'Membres', 'Publications (24 mois)', 'OA %', 'HAL %', 'RNSR']
  const lines = rows.map(({ original: d }) =>
    [
      d.acronym,
      `"${d.name.replace(/"/g, '""')}"`,
      `"${d.institutionNames.join(' / ')}"`,
      d.membersCount,
      d.publicationsCount,
      d.oaRate,
      d.halRate,
      d.rnsr ?? '',
    ].join(';'),
  )
  const csv = '﻿' + [headers.join(';'), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'laboratoires.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const LaboratoriesPage = () => {
  const lang = Lingui.i18n.locale as ExtendedLanguageCode
  const theme = useTheme()
  const router = useRouter()
  const [syncOpen, setSyncOpen] = useState(false)

  const data = useMemo<Laboratory[]>(() => {
    const { laboratories } = mockService.getLaboratories()
    return laboratories.map((s) => ({
      uid: s.uid,
      acronym: s.acronym,
      name:
        s.names.find((n) => n.language === lang)?.value ??
        s.names[0]?.value ??
        '',
      institutionNames: (s as { institutionNames?: string[] }).institutionNames ?? [],
      membersCount: (s as { membersCount?: number }).membersCount ?? 0,
      publicationsCount: (s as { publicationsCount?: number }).publicationsCount ?? 0,
      oaRate: (s as { oaRate?: number }).oaRate ?? 0,
      halRate: (s as { halRate?: number }).halRate ?? 0,
      rnsr: (s as { rnsr?: string }).rnsr,
      slug: s.slug ?? s.uid,
    }))
  }, [lang])

  const allInstitutions = useMemo(
    () => [...new Set(data.flatMap((d) => d.institutionNames))].sort(),
    [data],
  )

  const navigateToDetail = useCallback(
    (uid: string) => router.push(`/${lang}/laboratories/${uid}`),
    [lang, router],
  )

  const columns = useMemo<MRT_ColumnDef<Laboratory>[]>(
    () => [
      {
        accessorKey: 'acronym',
        header: 'Laboratoire',
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
          const { acronym, name, rnsr } = row.original
          return (
            <Box
              sx={{ cursor: 'pointer' }}
              onClick={() => navigateToDetail(row.original.uid)}
            >
              <Typography
                variant='body2'
                fontWeight='bold'
                color='primary'
                sx={{ '&:hover': { textDecoration: 'underline' } }}
              >
                {acronym}
              </Typography>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{
                  display: 'block',
                  maxWidth: 300,
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
          return row.original.institutionNames.some((inst) =>
            filterValue.includes(inst),
          )
        },
        Cell({ row }) {
          return (
            <Typography variant='body2'>
              {row.original.institutionNames.join(', ')}
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
              {row.original.membersCount}
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
            <Tooltip title={'24 derniers mois'}>
              <Typography variant='body2' fontWeight='bold'>
                {row.original.publicationsCount}
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
          return (
            <RateBar
              value={row.original.oaRate}
              color={theme.palette.success.main}
            />
          )
        },
      },
      {
        accessorKey: 'halRate',
        header: 'HAL',
        size: 120,
        Cell({ row }) {
          return (
            <RateBar
              value={row.original.halRate}
              color={theme.palette.primary.main}
            />
          )
        },
      },
      {
        id: 'detail',
        header: 'Voir le détail',
        enableSorting: false,
        enableColumnFilter: false,
        size: 130,
        Cell({ row }) {
          return (
            <Button
              component={Link}
              href={`/${lang}/laboratories/${row.original.uid}`}
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
    [lang, theme, allInstitutions, navigateToDetail],
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
      pagination: { pageIndex: 0, pageSize: 20 },
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
            <Tooltip title={'Réinitialiser les filtres'}>
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
        <Typography variant='h4'>
          <Trans>side_bar_laboratories</Trans>
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<FileDownloadIcon />}
            variant='outlined'
            onClick={() =>
              exportToCsv(
                table.getFilteredRowModel().rows as { original: Laboratory }[],
              )
            }
          >
            <Trans id='labs_export'>Exporter</Trans>
          </Button>
          <Button
            startIcon={<SyncIcon />}
            variant='outlined'
            onClick={() => setSyncOpen(true)}
          >
            <Trans id='labs_sync'>Mettre à jour les publications</Trans>
          </Button>
        </Box>
      </Box>

      <MaterialReactTable table={table} />

      <Snackbar
        open={syncOpen}
        autoHideDuration={3000}
        onClose={() => setSyncOpen(false)}
        message={'Mise à jour des publications lancée'}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  )
}

export default LaboratoriesPage
