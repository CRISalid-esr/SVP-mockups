const Button = () => ({
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        textTransform: 'none',
        borderRadius: '100px',
        fontWeight: 600,
        gap: '8px',
        '& .MuiButton-startIcon': {
          marginRight: 0,
        },
      },
      sizeMedium: {
        fontSize: '0.875rem',
        padding: '8px 20px',
      },
    },
  },
})
export default Button
