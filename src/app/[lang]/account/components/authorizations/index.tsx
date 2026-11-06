import { Trans } from '@lingui/react'
import { Box, Card, Checkbox, FormControlLabel, Typography } from '@mui/material'

const AuthorizationsPage = () => (
  <Card sx={{ p: 3 }}>
    <Typography variant='h6' component='h2'>
      <Trans id='authorizations_page_authorizations_title' />
    </Typography>
    <Typography variant='body1' color='text.secondary' sx={{ mt: 0.5, mb: 2 }}>
      <Trans id='authorizations_page_description' />
    </Typography>
    <Box sx={{ display: 'grid', gap: 0.5 }}>
      <FormControlLabel
        control={<Checkbox defaultChecked />}
        label={<Trans id='authorizations_page_list_publications' />}
      />
      <FormControlLabel
        control={<Checkbox defaultChecked />}
        label={<Trans id='authorizations_page_my_expertise' />}
      />
    </Box>
  </Card>
)

export default AuthorizationsPage
