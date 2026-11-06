import { Trans } from '@lingui/react'
import { Box, Card, Checkbox, FormControlLabel, Typography } from '@mui/material'

const NotificationPage = () => (
  <Card sx={{ p: 3 }}>
    <Typography variant='h6' component='h2'>
      <Trans id='notification_page_notification_title' />
    </Typography>
    <Typography variant='body1' color='text.secondary' sx={{ mt: 0.5, mb: 2 }}>
      <Trans id='notification_page_description' />
    </Typography>
    <Box sx={{ display: 'grid', gap: 0.5 }}>
      <FormControlLabel
        control={<Checkbox defaultChecked />}
        label={<Trans id='notification_page_new_publication_referenced' />}
      />
      <FormControlLabel
        control={<Checkbox defaultChecked />}
        label={<Trans id='notification_page_new_expertise_awaiting_validation' />}
      />
    </Box>
  </Card>
)

export default NotificationPage
