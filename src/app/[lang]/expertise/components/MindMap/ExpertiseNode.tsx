'use client'

import { Handle, Position, NodeProps } from '@xyflow/react'
import { Box, Tooltip, Typography } from '@mui/material'
import { ExpertiseNodeData, NODE_TYPE_CONFIG } from '../../types'

const ExpertiseNode = ({ data, selected }: NodeProps) => {
  const nodeData = data as ExpertiseNodeData
  const config = NODE_TYPE_CONFIG.expertise

  const attrCount = [
    nodeData.temporal?.length ?? 0,
    nodeData.geographic?.length ?? 0,
    nodeData.persons?.length ?? 0,
    nodeData.organizations?.length ?? 0,
    nodeData.concepts?.length ?? 0,
  ].reduce((a, b) => a + b, 0)

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0.5 }} />
      <Tooltip title={nodeData.description || ''} placement="top" arrow>
        <Box
          sx={{
            px: 2,
            py: 1.2,
            minWidth: 150,
            maxWidth: 240,
            borderRadius: '10px',
            border: `2px solid ${config.color}`,
            backgroundColor: selected ? config.color : config.bg,
            boxShadow: selected
              ? `0 0 0 3px ${config.color}44`
              : '0 2px 6px rgba(0,0,0,0.12)',
            cursor: 'grab',
            transition: 'all 0.15s ease',
            '&:hover': { boxShadow: `0 0 0 3px ${config.color}44` },
          }}
        >
          <Typography
            sx={{
              color: selected ? 'white' : '#1a1a1a',
              fontWeight: 600,
              fontSize: '0.85rem',
              lineHeight: 1.3,
            }}
          >
            {nodeData.label}
          </Typography>
          {attrCount > 0 && (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mt: 0.5,
                color: selected ? 'rgba(255,255,255,0.75)' : config.color,
                fontSize: '0.6rem',
                fontWeight: 600,
              }}
            >
              {attrCount} caractéristique{attrCount > 1 ? 's' : ''}
            </Typography>
          )}
        </Box>
      </Tooltip>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0.5 }} />
    </>
  )
}

export default ExpertiseNode
