'use client'

import { useState } from 'react'
import { Trans } from '@lingui/react'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Box, Card, IconButton, Snackbar, Tooltip, Typography } from '@mui/material'

interface AffiliationsSectionProps {
  laboratories: string[]
  signatures: string[]
  isOwn: boolean
}

const Row = ({ label, children }: { label: React.ReactNode; children: React.ReactNode }) => (
  <Box sx={{ py: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
    <Typography variant='body1' fontWeight={600}>{label}</Typography>
    {children}
  </Box>
)

const AffiliationsSection = ({ laboratories, signatures, isOwn }: AffiliationsSectionProps) => {
  const [copied, setCopied] = useState(false)
  const signature = signatures.filter(Boolean).join(', ')

  return (
    <Card sx={{ px: 3, pt: 3, pb: 0.5 }}>
      <Typography variant='h6' component='h2' sx={{ mb: 2.5 }}>
        {isOwn ? <Trans id='profile_affiliations_card_title' /> : 'Affiliations'}
      </Typography>
      <Row label={<Trans id='profile_affiliations_laboratories_label' />}>
        <Typography variant='body1' color='text.secondary'>
          {laboratories.length ? laboratories.join(', ') : 'Aucune unité de recherche associée'}
        </Typography>
      </Row>
      <Row label={<Trans id='profile_affiliations_signature_label' />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant='body1' color='text.secondary'>{signature || 'Aucune signature'}</Typography>
          {signature && (
            <Tooltip title='Copier'>
              <IconButton
                size='small'
                aria-label='Copier la signature'
                onClick={async () => {
                  await navigator.clipboard?.writeText(signature)
                  setCopied(true)
                }}
              >
                <ContentCopyIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Row>
      <Snackbar
        open={copied}
        autoHideDuration={3000}
        onClose={() => setCopied(false)}
        message={<Trans id='profile_affiliations_signature_copied_message_confirmation' />}
      />
    </Card>
  )
}

export default AffiliationsSection
