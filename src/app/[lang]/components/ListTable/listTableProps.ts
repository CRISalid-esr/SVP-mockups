/** Présentation commune des grandes listes (publications, thèmes) : une seule carte, des colonnes sobres. */
export const listTableProps = {
  layoutMode: 'grid-no-grow',
  enableColumnActions: false,
  enableColumnFilters: false,
  enableColumnResizing: false,
  muiTablePaperProps: {
    elevation: 0,
    sx: { border: '1px solid', borderColor: 'divider', borderRadius: '16px', overflow: 'hidden' },
  },
  muiTableHeadCellProps: {
    sx: {
      minHeight: 56,
      justifyContent: 'center',
      fontSize: '0.875rem',
      fontWeight: 500,
      color: 'text.primary',
      backgroundColor: 'background.default',
    },
  },
  muiTableBodyCellProps: {
    sx: { minHeight: 72, alignItems: 'center', fontSize: '0.875rem' },
  },
  muiBottomToolbarProps: { sx: { boxShadow: 'none' } },
} as const

/** Intitulé d'une ligne, sur deux lignes au plus. */
export const listTitleSx = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  width: '100%',
  textAlign: 'left',
  color: 'text.primary',
  fontSize: '0.875rem',
  fontWeight: 500,
  lineHeight: 1.35,
} as const
