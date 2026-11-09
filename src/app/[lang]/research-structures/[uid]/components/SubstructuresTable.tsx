'use client'

import { Box, LinearProgress, Typography } from '@mui/material'
import { MaterialReactTable, MRT_ColumnDef } from 'material-react-table'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { listTableProps, listTitleSx } from '@/components/ListTable/listTableProps'
import { StructureRaw } from '../types'

const GENERIC_LABELS: Record<string, string> = {
  institution: 'Établissement',
  institution_subdivision: 'Composante',
  unit: 'Unité',
  team: 'Équipe',
}

function RateCell({ value }: { value: number }) {
  if (value <= 0) return <Typography variant='body2' color='text.secondary'>—</Typography>
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
      <Typography variant='body2' sx={{ width: 40, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{`${value} %`}</Typography>
      <LinearProgress variant='determinate' value={value} aria-hidden sx={{ flex: 1, maxWidth: 64, height: 4, borderRadius: 2, bgcolor: 'action.hover' }} />
    </Box>
  )
}

/** Liste de structures (équipes, unités, composantes), au style des listes : clic sur la ligne pour ouvrir la fiche. */
export function StructureTable({
  structures,
  parentUid,
  lang,
  emptyText,
}: {
  structures: StructureRaw[]
  /** Pour signaler les structures rattachées en co-tutelle. */
  parentUid?: string
  lang: string
  emptyText: string
}) {
  const router = useRouter()

  const columns = useMemo<MRT_ColumnDef<StructureRaw>[]>(
    () => [
      {
        accessorKey: 'acronym',
        header: 'Structure',
        size: 340,
        Cell: ({ row }) => {
          const child = row.original
          const name = child.long_labels.find((l) => l.language === lang)?.value ?? child.long_labels[0]?.value ?? ''
          const secondary = parentUid && child.parent_uid !== parentUid && child.secondary_parent_uids?.includes(parentUid)
          return (
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
                <Typography sx={{ ...listTitleSx, width: 'auto', fontWeight: 600 }}>{child.acronym}</Typography>
                <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                  {[child.national_type ?? GENERIC_LABELS[child.generic_type], secondary && 'en co-tutelle'].filter(Boolean).join(' · ')}
                </Typography>
              </Box>
              <Typography variant='body2' color='text.secondary' noWrap sx={{ fontSize: '0.8125rem' }}>{name}</Typography>
            </Box>
          )
        },
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
        Cell: ({ row }) => (row.original.publicationsCount > 0 ? row.original.publicationsCount.toLocaleString('fr-FR') : '—'),
      },
      { accessorKey: 'oaRate', header: 'Accès ouvert', size: 150, Cell: ({ row }) => <RateCell value={row.original.oaRate} /> },
      { accessorKey: 'halRate', header: 'Dans HAL', size: 150, Cell: ({ row }) => <RateCell value={row.original.halRate} /> },
    ],
    [lang, parentUid],
  )

  return (
    <MaterialReactTable<StructureRaw>
      {...listTableProps}
      columns={columns}
      data={structures}
      enableTopToolbar={false}
      enablePagination={false}
      enableBottomToolbar={false}
      muiTableBodyRowProps={({ row }) => ({
        onClick: () => router.push(`/${lang}/research-structures/${row.original.uid}`),
        sx: { cursor: 'pointer' },
      })}
      renderEmptyRowsFallback={() => (
        <Typography color='text.secondary' sx={{ p: 4, textAlign: 'center' }}>{emptyText}</Typography>
      )}
    />
  )
}

type Props = {
  structure: StructureRaw
  allStructures: StructureRaw[]
  lang: string
}

/** Structures rattachées à un établissement ou à une composante, rattachements secondaires compris. */
export default function SubstructuresTable({ structure, allStructures, lang }: Props) {
  const direct = allStructures.filter((s) => s.parent_uid === structure.uid)
  const secondary = allStructures.filter(
    (s) => s.secondary_parent_uids?.includes(structure.uid) && s.parent_uid !== structure.uid,
  )
  const fromChildUids = (structure.childUids ?? [])
    .map((uid) => allStructures.find((s) => s.uid === uid))
    .filter(Boolean) as StructureRaw[]
  const children = direct.length + secondary.length > 0 ? [...direct, ...secondary] : fromChildUids

  return <StructureTable structures={children} parentUid={structure.uid} lang={lang} emptyText='Aucune structure rattachée.' />
}
