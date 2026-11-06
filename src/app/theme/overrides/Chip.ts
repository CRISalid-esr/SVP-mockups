import { alpha, darken, lighten, Theme } from '@mui/material/styles'

const TINTED_COLORS = ['primary', 'secondary', 'success', 'warning', 'error', 'info'] as const

/** Étiquettes pleines adoucies : un fond pâle et un texte foncé de la même teinte. */
const Chip = (theme: Theme) => ({
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 500,
        variants: TINTED_COLORS.map((color) => {
          const { main } = theme.palette[color]
          return {
            props: { variant: 'filled', color },
            style: {
              backgroundColor: alpha(main, 0.12),
              color: theme.palette.mode === 'light' ? darken(main, 0.3) : lighten(main, 0.3),
              '& .MuiChip-icon, & .MuiChip-deleteIcon': { color: 'inherit' },
              '&.MuiChip-clickable:hover': { backgroundColor: alpha(main, 0.2) },
            },
          }
        }),
      },
    },
  },
})

export default Chip
