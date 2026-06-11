import AttachFileIcon from '@mui/icons-material/AttachFile'

import useStore from '@/stores/global_store'
import { Document } from '@/types/Document'
import { BibliographicPlatform } from '@/types/BibliographicPlatform'
import HalStatusCellBadge, { HalStatusCellType } from './HalStatusCellBadge'
import AttachFileOffIcon from '@/app/theme/icons/AttachFileOffIcon'
import { useEffect, useState } from 'react'

const halSubmitTypeToHalSubmitTypeIcon = (halSubmitType: string | null) => {
  switch (halSubmitType) {
    case 'annex':
    case 'file':
      return <AttachFileIcon />
    case 'notice':
      return <AttachFileOffIcon />
    default:
      return null
  }
}

const HalStatusCell = ({ row }: { row: { original: Document } }) => {
  const { currentPerspective } = useStore((state) => state.user)
  const [isPendingModeration, setIsPendingModeration] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(`hal-deposit-status-${row.original.uid}`)
    if (saved) {
      const parsed = JSON.parse(saved)
      setIsPendingModeration(parsed.step === 'moderation')
    } else {
      setIsPendingModeration(false)
    }
  }, [row.original.uid])

  const halRecord = row.original.records.find(
    (record) => record.platform === BibliographicPlatform.HAL,
  )

  if (!halRecord) {
    if (isPendingModeration) {
      return <HalStatusCellBadge type={HalStatusCellType.PendingModeration} />
    }
    return <HalStatusCellBadge type={HalStatusCellType.OutsideHal} />
  }

  const { halSubmitType } = halRecord
  const halSubmitTypeIcon = halSubmitTypeToHalSubmitTypeIcon(halSubmitType)

  const isInCollection =
    halRecord.isResearchStructureInCollectionCodes(currentPerspective)

  if (isInCollection) {
    return (
      <HalStatusCellBadge
        type={HalStatusCellType.InCollection}
        icon={halSubmitTypeIcon}
        halSubmitType={halSubmitType}
      />
    )
  }

  const acronyms = currentPerspective?.membershipAcronyms || []

  return (
    <HalStatusCellBadge
      type={HalStatusCellType.OutOfCollection}
      icon={halSubmitTypeIcon}
      halSubmitType={halSubmitType}
      acronyms={acronyms}
    />
  )
}
export default HalStatusCell
