'use client'

import * as Lingui from '@lingui/core'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import {
  Avatar,
  Box,
  Button,
  Chip,
  LinearProgress,
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
import { useMemo } from 'react'
import { mockService } from '@/mocks/mockService'
import { publicPath } from '@/utils/publicPath'
import { Localization } from '@/types/Localization'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'

// ─── Types ───────────────────────────────────────────────────────────────────

type PersonRow = {
  uid: string
  slug: string
  displayName: string
  firstName: string
  lastName: string
  position: string | null
  institution: { uid: string; acronym: string; name: string } | null
  memberships: { uid: string; acronym: string; name: string }[]
  publis24m: number
  oaRate: number
  halRate: number
  orcid: string | null
  idhals: string | null
  idref: string | null
  scopus: string | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#c62828', '#00838f', '#5d4037', '#0288d1']

function avatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
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
        {value > 0 ? `${value} %` : '—'}
      </Typography>
    </Box>
  )
}

// ─── Identifier icon ──────────────────────────────────────────────────────────

type IdentIconProps = {
  icon: string
  alt: string
  value: string | null
  absentLabel: string
  href: string | null
}

function IdentIcon({ icon, alt, value, absentLabel, href }: IdentIconProps) {
  const img = (
    <Box
      component='span'
      sx={{
        display: 'inline-flex',
        width: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: value ? 1 : 0.25,
        filter: value ? 'none' : 'grayscale(100%)',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={publicPath(icon)} alt={alt} width={14} height={14} style={{ objectFit: 'contain' }} />
    </Box>
  )

  const tooltipTitle = value ?? absentLabel

  if (value && href) {
    return (
      <Tooltip title={tooltipTitle} arrow>
        <a href={href} target='_blank' rel='noopener noreferrer' style={{ display: 'inline-flex', lineHeight: 0 }}>
          {img}
        </a>
      </Tooltip>
    )
  }
  return (
    <Tooltip title={tooltipTitle} arrow>
      <span style={{ display: 'inline-flex', cursor: 'default' }}>{img}</span>
    </Tooltip>
  )
}

// ─── Person cell ─────────────────────────────────────────────────────────────

const POSITION_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'info'> = {
  'Pr.': 'primary',
  'MCF': 'primary',
  'DR': 'info',
  'CR': 'info',
  'Doctorant': 'secondary',
  'Post-doc': 'secondary',
  'ATER': 'warning',
  'Ingé.': 'default',
}

function PersonCell({ row }: { row: PersonRow }) {
  const { displayName, firstName, lastName, position, orcid, idhals, idref, scopus } = row
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
      <Avatar
        sx={{
          bgcolor: avatarColor(displayName),
          width: 32,
          height: 32,
          fontSize: 12,
          fontWeight: 'bold',
          flexShrink: 0,
          mt: 0.25,
        }}
      >
        {initials(firstName, lastName)}
      </Avatar>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          <Typography variant='body2' fontWeight='bold'>
            {displayName}
          </Typography>
          {position && (
            <Chip
              label={position}
              size='small'
              color={POSITION_COLORS[position] ?? 'default'}
              variant='outlined'
              sx={{ height: 16, fontSize: 10 }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
          <IdentIcon
            icon='/icons/orcid.png'
            alt='ORCID'
            value={orcid}
            absentLabel={'Pas d’identifiant ORCID'}
            href={orcid ? `https://orcid.org/${orcid}` : null}
          />
          <IdentIcon
            icon='/icons/hal.png'
            alt='HAL'
            value={idhals}
            absentLabel={'Pas encore aligné dans HAL'}
            href={idhals ? `https://hal.science/search/?authIdHal_s=${idhals}` : null}
          />
          <IdentIcon
            icon='/icons/idref.png'
            alt='IdRef'
            value={idref}
            absentLabel={'Pas d’identifiant IdRef'}
            href={idref ? `https://www.idref.fr/${idref}` : null}
          />
          <IdentIcon
            icon='/icons/scopus.png'
            alt='Scopus'
            value={scopus}
            absentLabel={'Pas d’identifiant Scopus'}
            href={null}
          />
        </Box>
      </Box>
    </Box>
  )
}

// ─── CSV export ──────────────────────────────────────────────────────────────

function exportToCsv(rows: PersonRow[]) {
  const headers = ['Nom', 'Prénom', 'Position', 'Employeur', 'Appartenance', 'Publications 24m', 'OA %', 'HAL %', 'ORCID', 'IdHAL', 'IdRef', 'Scopus']
  const lines = rows.map((d) =>
    [
      d.lastName,
      d.firstName,
      d.position ?? '',
      d.institution?.name ?? '',
      d.memberships.map((m) => m.acronym).join(' / '),
      d.publis24m,
      d.oaRate,
      d.halRate,
      d.orcid ?? '',
      d.idhals ?? '',
      d.idref ?? '',
      d.scopus ?? '',
    ].join(';'),
  )
  const csv = '﻿' + [headers.join(';'), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'chercheurs.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ResearchersPage() {
  const lang = Lingui.i18n.locale as ExtendedLanguageCode
  const theme = useTheme()

  const data = useMemo<PersonRow[]>(() => {
    const { people } = mockService.getPeople()
    return (people as Record<string, unknown>[]).map((p) => {
      const identifiers = (p.identifiers as { type: string; value: string }[]) ?? []
      const getIdent = (type: string) => identifiers.find((i) => i.type === type)?.value ?? null

      type InstRaw = { uid: string; acronym: string; names?: { language: string; value: string }[] }
      const inst = p.institution as InstRaw | undefined

      type MembershipRaw = {
        researchStructure: { uid: string; acronym: string; names?: { language: string; value: string }[] }
      }

      return {
        uid: p.uid as string,
        slug: (p.slug as string) ?? (p.uid as string),
        displayName: p.displayName as string,
        firstName: p.firstName as string,
        lastName: p.lastName as string,
        position: (p.statut as string | undefined) ?? null,
        institution: inst
          ? {
              uid: inst.uid,
              acronym: inst.acronym,
              name: inst.names?.find((n) => n.language === lang)?.value ?? inst.names?.[0]?.value ?? inst.acronym,
            }
          : null,
        memberships: ((p.memberships as MembershipRaw[]) ?? []).map((m) => ({
          uid: m.researchStructure.uid,
          acronym: m.researchStructure.acronym,
          name:
            m.researchStructure.names?.find((n) => n.language === lang)?.value ??
            m.researchStructure.names?.[0]?.value ??
            m.researchStructure.acronym,
        })),
        publis24m: (p.publis24m as number) ?? 0,
        oaRate: (p.oaRate as number) ?? 0,
        halRate: (p.halRate as number) ?? 0,
        orcid: getIdent('orcid'),
        idhals: getIdent('id_hal_s'),
        idref: getIdent('idref'),
        scopus: getIdent('scopus'),
      }
    })
  }, [lang])

  const allInstitutions = useMemo(
    () => [...new Set(data.map((d) => d.institution?.name).filter((n): n is string => !!n))].sort(),
    [data],
  )

  const allLabs = useMemo(
    () => [...new Set(data.flatMap((d) => d.memberships.map((m) => m.acronym)))].sort(),
    [data],
  )

  const columns = useMemo<MRT_ColumnDef<PersonRow>[]>(
    () => [
      {
        accessorKey: 'displayName',
        header: 'Chercheur',
        size: 290,
        grow: 2,
        Cell({ row }) {
          return <PersonCell row={row.original} />
        },
      },
      {
        id: 'institution',
        accessorFn: (row) => row.institution?.name ?? '',
        header: 'Employeur',
        size: 170,
        grow: 1,
        filterVariant: 'multi-select',
        filterSelectOptions: allInstitutions,
        filterFn: (row, _id, filterValue: string[]) => {
          if (!filterValue || filterValue.length === 0) return true
          return filterValue.includes(row.original.institution?.name ?? '')
        },
        Cell({ row }) {
          const inst = row.original.institution
          if (!inst) return <Typography variant='body2' color='text.disabled'>—</Typography>
          return (
            <Button
              component={Link}
              href={`/${lang}/research-structures/${inst.uid}`}
              variant='text'
              size='small'
              sx={{ textTransform: 'none', p: 0, minWidth: 0, fontWeight: 'normal', justifyContent: 'flex-start' }}
            >
              {inst.acronym}
            </Button>
          )
        },
      },
      {
        id: 'appartenance',
        accessorFn: (row) => row.memberships.map((m) => m.acronym).join(', '),
        header: 'Appartenance',
        size: 150,
        grow: 1,
        filterVariant: 'multi-select',
        filterSelectOptions: allLabs,
        filterFn: (row, _id, filterValue: string[]) => {
          if (!filterValue || filterValue.length === 0) return true
          return row.original.memberships.some((m) => filterValue.includes(m.acronym))
        },
        Cell({ row }) {
          const ms = row.original.memberships
          if (ms.length === 0) return <Typography variant='body2' color='text.disabled'>—</Typography>
          return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {ms.map((m) => (
                <Button
                  key={m.uid}
                  component={Link}
                  href={`/${lang}/research-structures/${m.uid}`}
                  variant='text'
                  size='small'
                  sx={{ textTransform: 'none', p: 0, minWidth: 0, fontWeight: 'normal' }}
                >
                  {m.acronym}
                </Button>
              ))}
            </Box>
          )
        },
      },
      {
        accessorKey: 'publis24m',
        header: 'Pub 24m',
        size: 90,
        muiTableHeadCellProps: { align: 'right' },
        muiTableBodyCellProps: { align: 'right' },
        Cell({ row }) {
          const v = row.original.publis24m
          return (
            <Typography variant='body2' fontWeight='bold'>
              {v > 0 ? v : '—'}
            </Typography>
          )
        },
      },
      {
        accessorKey: 'oaRate',
        header: 'OA',
        size: 120,
        Cell({ row }) {
          return <RateBar value={row.original.oaRate} color={(theme as Theme).palette.success.main} />
        },
      },
      {
        accessorKey: 'halRate',
        header: 'HAL',
        size: 120,
        Cell({ row }) {
          return <RateBar value={row.original.halRate} color={(theme as Theme).palette.primary.main} />
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
              href={`/${lang}/researchers/${row.original.uid}`}
              size='small'
              endIcon={<ArrowForwardIcon />}
              variant='text'
            >
              {`Détail`}
            </Button>
          )
        },
      },
    ],
    [lang, theme, allInstitutions, allLabs],
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant='h4'>Chercheurs</Typography>
        <Button
          startIcon={<FileDownloadIcon />}
          variant='outlined'
          onClick={() => exportToCsv(data)}
        >
          Exporter
        </Button>
      </Box>
      <MaterialReactTable table={table} />
    </Box>
  )
}
