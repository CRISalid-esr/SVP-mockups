import { t } from '@lingui/core/macro'
import { HourglassEmpty } from '@mui/icons-material'
import { Chip, Tooltip } from '@mui/material'

export enum HalStatusCellType {
  InCollection = 'InCollection',
  OutOfCollection = 'OutOfCollection',
  OutsideHal = 'OutsideHal',
  PendingModeration = 'PendingModeration',
}

const multilineChipSx = {
  height: 'auto',
  padding: '.1875rem 0',
  '& .MuiChip-label': {
    display: 'block',
    whiteSpace: 'normal',
  },
}

type HalStatusCellBadgeProps =
  | {
      type: HalStatusCellType.InCollection | HalStatusCellType.OutsideHal | HalStatusCellType.PendingModeration
      icon?: React.ReactElement | null
      halSubmitType?: string | null
      acronyms?: string[]
      isSingleLine?: boolean
    }
  | {
      type: HalStatusCellType.OutOfCollection
      icon?: React.ReactElement | null
      halSubmitType?: string | null
      acronyms: string[]
      isSingleLine?: boolean
    }

const HalStatusCellBadge = ({
  type,
  icon,
  halSubmitType,
  acronyms,
  isSingleLine,
}: HalStatusCellBadgeProps) => {
  const submitTypeTooltip =
    halSubmitType === 'file'
      ? t`documents_page_hal_status_submit_type_file`
      : halSubmitType === 'notice'
      ? t`documents_page_hal_status_submit_type_notice`
      : ''

  const wrapInTooltip = (label: React.ReactNode, title: string) => (
    <Tooltip title={title} arrow>
      <span style={{ display: 'inline-flex', cursor: 'default' }}>{label}</span>
    </Tooltip>
  )

  if (type === HalStatusCellType.PendingModeration)
    return wrapInTooltip(
      <Chip
        {...(!isSingleLine && { sx: multilineChipSx })}
        icon={<HourglassEmpty />}
        label="En cours de modération"
        size='small'
        color='warning'
      />,
      t`documents_page_hal_status_tooltip_pending_moderation`,
    )

  if (type === HalStatusCellType.OutsideHal)
    return wrapInTooltip(
      <Chip
        {...(!isSingleLine && { sx: multilineChipSx })}
        label={t`documents_page_hal_status_outside_hal`}
        size='small'
        color='error'
      />,
      t`documents_page_hal_status_tooltip_outside_hal`,
    )

  if (type === HalStatusCellType.OutOfCollection) {
    const numberOfAcronyms = acronyms?.length || 0
    const formattedAcronyms = acronyms?.join(', ') || ''
    const collectionTooltip =
      numberOfAcronyms > 0
        ? t`documents_page_hal_status_tooltip_out_of_collection_with_acronyms ${formattedAcronyms}`
        : t`documents_page_hal_status_tooltip_out_of_collection`
    const tooltip = [collectionTooltip, submitTypeTooltip].filter(Boolean).join(' ')

    return wrapInTooltip(
      <Chip
        {...(!isSingleLine && { sx: multilineChipSx })}
        {...(icon && { icon })}
        label={t`documents_page_hal_status_out_of_collection`}
        size='small'
        color='info'
      />,
      tooltip,
    )
  }

  if (type === HalStatusCellType.InCollection) {
    const tooltip = [
      t`documents_page_hal_status_tooltip_in_collection`,
      submitTypeTooltip,
    ]
      .filter(Boolean)
      .join(' ')

    return wrapInTooltip(
      <Chip
        {...(!isSingleLine && { sx: multilineChipSx })}
        {...(icon && { icon })}
        label={t`documents_page_hal_status_in_collection`}
        size='small'
        color='success'
      />,
      tooltip,
    )
  }
}
export default HalStatusCellBadge
