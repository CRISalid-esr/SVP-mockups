import { Theme } from '@mui/material/styles'

const Table = (theme: Theme) => ({
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderColor: theme.palette.divider,
      },
      head: {
        fontWeight: 600,
        fontSize: '0.8125rem',
        color: theme.palette.text.secondary,
      },
    },
  },
})

export default Table
