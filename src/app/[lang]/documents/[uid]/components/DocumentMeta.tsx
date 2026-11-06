import { useLingui } from '@lingui/react'
import { Box, Typography } from '@mui/material'
import dayjs from 'dayjs'
import useStore from '@/stores/global_store'
import { DocumentTypeLabels } from '@/app/[lang]/documents/components/DocumentTypeLabels'
import HalStatusCell from '@/app/[lang]/documents/components/HalStatusCell'
import OAStatusCell from '@/app/[lang]/documents/components/OAStatusCell'

/** Sous le titre de la fiche : les statuts, puis le type, l'année et la revue. */
const DocumentMeta = () => {
  const { _ } = useLingui()
  const { selectedDocument = null } = useStore((state) => state.document)
  if (!selectedDocument) return null

  const { documentType, publicationDate, journal } = selectedDocument
  const parsedDate = publicationDate ? dayjs(publicationDate, 'YYYY-MM-DD') : null
  const details = [
    DocumentTypeLabels[documentType] && _(DocumentTypeLabels[documentType]),
    parsedDate?.isValid() ? parsedDate.format('YYYY') : publicationDate,
    journal?.title,
  ].filter(Boolean)

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mt: 1.5 }}>
      <HalStatusCell row={{ original: selectedDocument }} />
      <OAStatusCell row={{ original: selectedDocument }} />
      <Typography variant='body1' color='text.secondary' sx={{ ml: 0.5 }}>
        {details.join(' · ')}
      </Typography>
    </Box>
  )
}

export default DocumentMeta
