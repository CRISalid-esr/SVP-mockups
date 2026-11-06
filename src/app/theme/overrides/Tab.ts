import { Theme } from '@mui/material/styles'

const Tab = (theme: Theme) => ({
  MuiTab: {
    defaultProps: {},
    styleOverrides: {
      root: {
        textTransform: 'none',
        minHeight: 48,
        padding: '12px 16px',
        fontWeight: 500,
        color: theme.palette.text.secondary,
        '&.Mui-selected': {
          fontWeight: 700,
          color: theme.palette.text.primary,
        },
      },
    },
  },
})
export default Tab
