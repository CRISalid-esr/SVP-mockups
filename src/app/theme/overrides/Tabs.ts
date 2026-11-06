import { Theme } from '@mui/material/styles'

const Tabs = (theme: Theme) => ({
  MuiTabs: {
    defaultProps: {},
    styleOverrides: {
      root: {},
      indicator: {
        height: '2px',
        borderRadius: '2px 2px 0px 0px',
        backgroundColor: theme.palette.primary.main,
      },
    },
  },
})
export default Tabs
