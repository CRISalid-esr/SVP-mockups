import { t } from '@lingui/core/macro'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { IconButton, Tooltip } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import useStore from '@/stores/global_store'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'
import * as Lingui from '@lingui/core'

const DocumentDetailsHeader = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currentPerspective, connectedUser } = useStore((state) => state.user)
  const lang = Lingui.i18n.locale as ExtendedLanguageCode

  const backToPublicationList = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('tab')
    router.push(`/${lang}/documents?${params.toString()}`)
  }

  const label =
    connectedUser?.person?.uid !== currentPerspective?.uid
      ? `${t`document_details_page_back_to_publications`} : ${currentPerspective?.getDisplayName(lang) || ''}`
      : t`document_details_page_back_to_my_publications`

  return (
    <Tooltip title={label}>
      <IconButton aria-label={label} onClick={backToPublicationList} sx={{ color: 'text.primary', mt: -0.5 }}>
        <ArrowBackIcon />
      </IconButton>
    </Tooltip>
  )
}

export default DocumentDetailsHeader
