import React from 'react'
import { Avatar, SxProps, Theme } from '@mui/material'
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined'
import { PerspectiveKind } from './usePerspectiveNavigation'

const initials = (label: string) =>
  label
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')

/**
 * Personne = avatar rond à initiales ; structure = carré arrondi avec un pictogramme.
 * La forme distingue les deux types d'un coup d'œil, sans dépendre de la couleur.
 */
const PerspectiveAvatar: React.FC<{
  kind: PerspectiveKind
  label: string
  size?: number
  sx?: SxProps<Theme>
}> = ({ kind, label, size = 32, sx }) => (
  <Avatar
    variant={kind === 'person' ? 'circular' : 'rounded'}
    aria-hidden
    sx={{
      width: size,
      height: size,
      fontSize: size * 0.4,
      fontWeight: 600,
      bgcolor: kind === 'person' ? 'primaryContainer' : 'secondaryContainer',
      color: kind === 'person' ? 'onPrimaryContainer' : 'onSecondaryContainer',
      ...sx,
    }}
  >
    {kind === 'person' ? initials(label) : <AccountBalanceOutlinedIcon sx={{ fontSize: size * 0.6 }} />}
  </Avatar>
)

export default PerspectiveAvatar
