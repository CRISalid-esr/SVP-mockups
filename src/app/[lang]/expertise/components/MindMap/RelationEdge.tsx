'use client'

import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  useReactFlow,
} from '@xyflow/react'
import { Box, Typography } from '@mui/material'
import { RELATION_TYPES, RelationTypeKey } from '../../types'

interface RelationEdgeData {
  relationType?: RelationTypeKey
  onEdgeClick?: (id: string) => void
  [key: string]: unknown
}

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
  const edgeData = (data ?? {}) as RelationEdgeData
  const relationType = (edgeData.relationType ?? 'croise') as RelationTypeKey
  const cfg = RELATION_TYPES[relationType] ?? RELATION_TYPES.croise

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  })

  const stroke = cfg.color
  const strokeDasharray = cfg.strokeDasharray ?? undefined
  const strokeWidth = selected ? 2.5 : 1.8

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke,
          strokeWidth,
          strokeDasharray,
          filter: selected ? `drop-shadow(0 0 4px ${stroke}88)` : undefined,
        }}
        markerEnd={`url(#arrow-${cfg.category})`}
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
            bgcolor: selected ? stroke : 'rgba(255,255,255,0.92)',
            border: `1px solid ${stroke}`,
            boxShadow: selected ? `0 0 0 2px ${stroke}44` : 'none',
            transition: 'all 0.15s ease',
            '&:hover': { bgcolor: `${stroke}22` },
          }}
          className="nodrag nopan"
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.65rem',
              fontWeight: 600,
              color: selected ? 'white' : stroke,
              whiteSpace: 'nowrap',
            }}
          >
            {cfg.label}
          </Typography>
        </Box>
      </EdgeLabelRenderer>
    </>
  )
}
