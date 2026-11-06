import { useEffect, useState } from 'react'
import { t } from '@lingui/core/macro'
import { Link } from '@mui/material'
import { BibliographicPlatform } from '@/types/BibliographicPlatform'
import { Document } from '@/types/Document'

interface HalNextActionCellProps {
  document: Document
  onDeposit: () => void
}

/** Prochaine action sur la ligne : proposée seulement quand la publication n'est pas dans HAL. */
const HalNextActionCell = ({ document, onDeposit }: HalNextActionCellProps) => {
  const [depositStep, setDepositStep] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(`hal-deposit-status-${document.uid}`)
    setDepositStep(saved ? JSON.parse(saved).step : null)
  }, [document.uid])

  const isInHal = document.records.some(({ platform }) => platform === BibliographicPlatform.HAL)
  if (isInHal || depositStep === 'moderation' || depositStep === 'accepted') return null

  return (
    <Link
      component='button'
      underline='hover'
      onClick={(event) => {
        event.stopPropagation()
        onDeposit()
      }}
      sx={{ fontSize: '0.875rem', fontWeight: 500, textAlign: 'left' }}
    >
      {depositStep ? 'Reprendre le dépôt' : t`document_details_hal_deposit_tab`}
    </Link>
  )
}

export default HalNextActionCell
