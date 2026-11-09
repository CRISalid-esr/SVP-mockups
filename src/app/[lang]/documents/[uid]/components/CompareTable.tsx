import { ReactNode } from 'react'
import { Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'

export interface CompareColumn {
  key: string
  header: ReactNode
  /** Largeur CSS facultative (ex. 48, '30%'). */
  width?: number | string
  align?: 'left' | 'right' | 'center'
}

export interface CompareRow {
  key: string
  cells: Record<string, ReactNode>
}

/**
 * Tableau des comparaisons de la fiche publication (sources, HAL),
 * présenté comme les listes : une carte, un en-tête sobre, des lignes séparées par un filet.
 */
const CompareTable = ({
  columns,
  rows,
  ariaLabel,
}: {
  columns: CompareColumn[]
  rows: CompareRow[]
  ariaLabel: string
}) => (
  <TableContainer
    sx={{ border: 1, borderColor: 'divider', borderRadius: 4, overflowX: 'auto', bgcolor: 'background.paper' }}
  >
    <Table aria-label={ariaLabel} sx={{ minWidth: 560 }}>
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <TableCell
              key={column.key}
              align={column.align}
              sx={{
                width: column.width,
                height: 56,
                py: 1,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'text.primary',
                bgcolor: 'background.default',
                borderColor: 'divider',
                whiteSpace: 'nowrap',
              }}
            >
              {column.header}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.key} sx={{ '&:last-of-type td': { borderBottom: 0 } }}>
            {columns.map((column) => (
              <TableCell
                key={column.key}
                align={column.align}
                sx={{ py: 1.75, fontSize: '0.875rem', verticalAlign: 'top', borderColor: 'divider', overflowWrap: 'anywhere' }}
              >
                {row.cells[column.key] ?? <Box component='span' sx={{ color: 'text.disabled' }}>—</Box>}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)

/** Pastille d'état d'une ligne de comparaison : le texte porte le sens, la couleur ne fait que l'appuyer. */
export const CompareStatus = ({ status }: { status: 'same' | 'differs' | 'missing' | 'single' }) => {
  const config = {
    same: { label: 'Concordant', color: 'success' as const },
    differs: { label: 'Diffère', color: 'warning' as const },
    missing: { label: 'Absent de HAL', color: 'info' as const },
    single: { label: 'Une seule source', color: 'default' as const },
  }[status]
  return <Chip size='small' variant='outlined' label={config.label} color={config.color} sx={{ fontWeight: 500 }} />
}

export default CompareTable
