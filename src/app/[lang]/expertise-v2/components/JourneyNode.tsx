'use client'

import { Handle, NodeProps, Position } from '@xyflow/react'
import { Box, Typography } from '@mui/material'
import { ResearchTheme, TEAL, formatPeriod } from '../types'
import { NODE_WIDTH } from './journeyLayout'

export interface JourneyNodeData {
  theme: ResearchTheme
  [key: string]: unknown
}

const handleStyle = {
  width: 12, height: 12, background: '#fff', border: `2px solid ${TEAL}`,
}

/** Thème dans le graphe de parcours : son intitulé et sa période, le reste est à un clic. */
export default function JourneyNode({ data, selected }: NodeProps) {
  const { theme } = data as JourneyNodeData
  const draft = theme.status === 'draft'

  return (
    <>
      <Handle type="target" position={Position.Left} style={handleStyle} />
      <Box
        sx={{
          width: NODE_WIDTH,
          boxSizing: 'border-box',
          px: 2,
          py: 1.5,
          borderRadius: 3,
          border: '1px solid',
          borderStyle: draft ? 'dashed' : 'solid',
          borderColor: selected ? 'primary.main' : draft ? 'warning.main' : 'divider',
          bgcolor: selected ? 'navActive' : 'background.paper',
          transition: 'border-color 0.15s ease',
          '&:hover': { borderColor: 'primary.main' },
        }}
      >
        <Typography sx={{
          fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.35,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {theme.label || 'Thème sans titre'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {formatPeriod(theme)}{draft ? ' · Brouillon' : ''}
        </Typography>
      </Box>
      <Handle type="source" position={Position.Right} style={handleStyle} />
    </>
  )
}
