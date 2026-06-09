'use client'

import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from '@xyflow/react'
import { Box, Typography } from '@mui/material'
import { EdgeData } from '../../types'

const COLOR_LABELED = '#006A61'
const COLOR_UNLABELED = '#94a3b8'

export default function RelationEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
}: EdgeProps) {
  const edgeData = (data ?? {}) as EdgeData
  const direction = edgeData.direction ?? 'forward'
  const label = edgeData.label?.trim() ?? ''
  const hasLabel = label.length > 0

  const color = hasLabel ? COLOR_LABELED : COLOR_UNLABELED
  const strokeDasharray = hasLabel ? undefined : '5 3'
  const strokeWidth = selected ? 2.5 : 1.8

  const markerId = `url(#arrow-${color.replace('#', '')})`
  const markerEnd = direction !== 'backward' ? markerId : undefined
  const markerStart = direction !== 'forward' ? markerId : undefined

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  })

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth,
          strokeDasharray,
          filter: selected ? `drop-shadow(0 0 4px ${color}88)` : undefined,
        }}
        markerEnd={markerEnd}
        markerStart={markerStart}
      />
      <EdgeLabelRenderer>
        <Box
          sx={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            cursor: 'pointer',
            px: 0.8,
            py: 0.2,
            borderRadius: '4px',
            bgcolor: selected ? color : 'rgba(255,255,255,0.92)',
            border: `1px solid ${color}`,
            boxShadow: selected ? `0 0 0 2px ${color}44` : 'none',
            transition: 'all 0.15s ease',
            '&:hover': { bgcolor: `${color}22` },
          }}
          className="nodrag nopan"
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.65rem',
              fontWeight: hasLabel ? 600 : 400,
              color: selected ? 'white' : color,
              fontStyle: hasLabel ? 'normal' : 'italic',
              whiteSpace: 'nowrap',
            }}
          >
            {hasLabel ? label : 'qualifier →'}
          </Typography>
        </Box>
      </EdgeLabelRenderer>
    </>
  )
}
