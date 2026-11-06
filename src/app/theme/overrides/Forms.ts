import { Theme } from '@mui/material/styles'

const Forms = (theme: Theme) => ({
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        backgroundColor: theme.palette.background.paper,
      },
      notchedOutline: {
        borderColor: theme.palette.divider,
      },
    },
  },
  MuiToggleButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        borderColor: theme.palette.divider,
      },
    },
  },
})

export default Forms
