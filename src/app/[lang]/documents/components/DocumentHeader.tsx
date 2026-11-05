import { FC, ReactNode } from 'react'
import { Typography } from '@mui/material'
import { Box } from '@mui/system'
import PerspectiveTitle from '@/app/[lang]/components/Perspective/PerspectiveTitle'
import { usePerspectiveUi } from '@/app/[lang]/components/Perspective/perspectiveUiStore'
import { HelpLink, HelpTopic } from '@/app/[lang]/components/HelpLink'

interface DocumentHeaderProps {
  perspectiveName: string
  pageName: string
  /** Page d'aide de cette rubrique, si elle existe : affiche un « ? » après le titre. */
  helpTopic?: HelpTopic
  children?: ReactNode
}

const DocumentHeader: FC<DocumentHeaderProps> = ({
  perspectiveName,
  pageName,
  helpTopic,
  children,
}) => {
  const variant = usePerspectiveUi((state) => state.variant)
  return (
    <Box
      mb={3}
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Typography variant='h4' gutterBottom>
        {pageName} :{' '}
        {variant === 'title' ? <PerspectiveTitle name={perspectiveName} /> : perspectiveName}
        {helpTopic && <HelpLink topic={helpTopic} sx={{ ml: 0.5 }} />}
      </Typography>
      {children}
    </Box>
  )
}

export default DocumentHeader
