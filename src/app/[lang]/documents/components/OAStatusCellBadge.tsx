import { Chip } from '@mui/material'
import { alpha, darken } from '@mui/material/styles'
import { LockOpen } from '@mui/icons-material'
import { OAStatus } from '@prisma/client'
import { OAStatusProperties } from '@/app/[lang]/documents/components/OAStatusProperties'

type OAStatusCellBadgeProps = {
  children?: React.ReactNode
  type: OAStatus | 'UNKNOWN'
}

const OAStatusCellBadge = ({ type }: OAStatusCellBadgeProps) => {
  const Icon = OAStatusProperties[type].icon
    ? OAStatusProperties[type].icon
    : LockOpen
  const color = OAStatusProperties[type].color

  return (
    <Chip
      icon={<Icon sx={{ fontSize: 'large' }} />}
      label={type}
      size='small'
      sx={{
        backgroundColor: alpha(color, 0.12),
        color: darken(color, 0.35),
        padding: '1px',
        '& .MuiChip-icon': { color: 'inherit' },
      }}
    />
  )
}
export default OAStatusCellBadge
