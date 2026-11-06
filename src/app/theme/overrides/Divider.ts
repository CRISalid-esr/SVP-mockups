/* eslint-disable react/destructuring-assignment */

/**
 * @link https://mui.com/customization/theme-components/#default-props
 *
 * @link https://mui.com/components/dividers/
 * @link https://mui.com/api/divider/
 */

import { Theme } from '@mui/material/styles'

const Divider = (theme: Theme) => ({
  MuiDivider: {
    defaultProps: {},
    styleOverrides: {
      root: {
        color: theme.palette.divider,
        borderColor: theme.palette.divider,
        fontSize: '2px',
        '&::before': {
          position: 'inherit',
        },
        '&::after': {
          position: 'inherit',
        },
      },
    },
  },
})
export default Divider
