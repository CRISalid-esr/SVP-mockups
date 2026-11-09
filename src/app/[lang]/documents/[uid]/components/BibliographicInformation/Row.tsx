import { Box } from '@mui/material'
import * as Lingui from '@lingui/core'
import { useEffect, useState } from 'react'

import { getLocalizedValue } from '@/utils/getLocalizedValue'
import { LanguageChips } from '@/components/LanguageChips'
import useStore from '@/stores/global_store'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'
import RowLabel from './RowLabel'
import {
  DocumentField,
  DocumentLocalizableFieldKey,
} from './BibliographicInformation'

/** Une ligne de la notice : libellé à gauche (au-dessus sur mobile), valeur à droite. */
const Row = ({ field }: { field: DocumentField }) => {
  const lang = Lingui.i18n.locale as ExtendedLanguageCode
  const [selectedLang, setSelectedLang] = useState<string>(lang)
  const [content, setContent] = useState('')
  const { selectedDocument } = useStore((state) => state.document)

  useEffect(() => {
    if (!field.hasLanguageSelector) {
      return
    }

    const supportedLocales =
      process.env.NEXT_PUBLIC_SUPPORTED_LOCALES?.split(',') || []

    const { language, value } = getLocalizedValue(
      selectedDocument?.[field.value as DocumentLocalizableFieldKey] ?? [],
      selectedLang,
      supportedLocales,
      field.noContentAvailableMessage || '',
    )

    if (language !== selectedLang) {
      setSelectedLang(language)
    }

    setContent(value)
  }, [
    selectedLang,
    selectedDocument,
    field.hasLanguageSelector,
    field.value,
    field.noContentAvailableMessage,
  ])

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: '180px minmax(0, 1fr)' },
        columnGap: 3,
        rowGap: 0.75,
        py: 2,
        borderTop: 1,
        borderColor: 'divider',
        '&:first-of-type': { borderTop: 0, pt: 0 },
        '&:last-of-type': { pb: 0 },
      }}
    >
      <Box component='dt' sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, m: 0, pt: { sm: 0.25 } }}>
        <RowLabel>{field.title}</RowLabel>
        {field.hasLanguageSelector && (
          <LanguageChips
            texts={selectedDocument?.[field.value as DocumentLocalizableFieldKey] ?? []}
            selectedLang={selectedLang}
            onLanguageSelect={setSelectedLang}
            isInline
          />
        )}
      </Box>
      <Box component='dd' sx={{ m: 0, minWidth: 0 }}>
        {field.component && <field.component content={content} />}
      </Box>
    </Box>
  )
}
export default Row
