'use client'

import { Handle, Position, NodeProps } from '@xyflow/react'
import { Box, Typography, Tooltip } from '@mui/material'
import { ExpertiseNodeData, NODE_TYPE_CONFIG } from '../../types'

const ExpertiseNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as ExpertiseNodeData
  const config = NODE_TYPE_CONFIG[nodeData.nodeType]

  const isMain = nodeData.nodeType === 'main'

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0.5 }} />
      <Tooltip title={nodeData.description || ''} placement="top" arrow>
        <Box
          sx={{
            px: isMain ? 2.5 : 1.8,
            py: isMain ? 1.5 : 1,
            minWidth: isMain ? 180 : 130,
            maxWidth: 240,
            borderRadius: isMain ? '12px' : '8px',
            border: `2px solid ${config.color}`,
            backgroundColor: selected ? config.color : config.bg,
            boxShadow: selected
              ? `0 0 0 3px ${config.color}44`
              : '0 2px 6px rgba(0,0,0,0.12)',
            cursor: 'grab',
            transition: 'all 0.15s ease',
            '&:hover': {
              boxShadow: `0 0 0 3px ${config.color}44`,
            },
          }}
        >
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              color: selected ? 'white' : config.color,
              fontWeight: 600,
              fontSize: isMain ? '0.6rem' : '0.55rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              mb: 0.3,
              opacity: 0.85,
            }}
          >
            {config.label}
          </Typography>
          <Typography
            sx={{
              color: selected ? 'white' : '#1a1a1a',
              fontWeight: isMain ? 700 : 500,
              fontSize: isMain ? '0.95rem' : '0.82rem',
              lineHeight: 1.3,
            }}
          >
            {nodeData.label}
          </Typography>
        </Box>
      </Tooltip>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0.5 }} />
    </>
  )
}

export default ExpertiseNode
