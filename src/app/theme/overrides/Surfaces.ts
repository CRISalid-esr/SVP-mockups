import { Theme } from '@mui/material/styles'

const FLOATING_SHADOW = '0 8px 24px rgba(17, 38, 34, 0.10)'

/** Surfaces posées sur la page : une bordure fine plutôt qu'une ombre. */
const Surfaces = (theme: Theme) => {
  const flat = {
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
  }

  return {
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 12 },
        elevation1: flat,
        elevation2: flat,
        elevation3: flat,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: theme.spacing(3),
          '&:last-child': { paddingBottom: theme.spacing(3) },
        },
      },
    },
    MuiAccordion: {
      defaultProps: { disableGutters: true },
      styleOverrides: {
        root: { '&::before': { display: 'none' } },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16, boxShadow: FLOATING_SHADOW },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: FLOATING_SHADOW,
          border: `1px solid ${theme.palette.divider}`,
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: { boxShadow: FLOATING_SHADOW },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { borderRadius: 8, fontSize: '0.75rem' },
      },
    },
  }
}

export default Surfaces
