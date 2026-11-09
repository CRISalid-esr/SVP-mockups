import { Typography } from '@mui/material'

const RowLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography variant='body2' component='span' color='text.secondary' sx={{ fontWeight: 600 }}>
    {children}
  </Typography>
)
export default RowLabel
