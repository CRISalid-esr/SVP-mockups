import { Box, Link, Typography } from '@mui/material'
import { useState } from 'react'

/** Au-delà de cette longueur, le résumé est replié sur quelques lignes. */
const LONG_ABSTRACT = 400

const Abstracts = ({ content }: { content: string }) => {
  const [expanded, setExpanded] = useState(false)
  const isLong = content.length > LONG_ABSTRACT

  return (
    <Box>
      <Typography
        sx={
          isLong && !expanded
            ? { display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }
            : undefined
        }
      >
        {content}
      </Typography>
      {isLong && (
        <Link component='button' underline='hover' onClick={() => setExpanded(!expanded)} sx={{ mt: 0.5, fontSize: '0.875rem' }}>
          {expanded ? 'Réduire' : 'Lire tout le résumé'}
        </Link>
      )}
    </Box>
  )
}
export default Abstracts
