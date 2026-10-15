'use client'

import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, useReactFlow } from '@xyflow/react'
import { Box, Typography } from '@mui/material'
import { RelationDirection, TEAL } from '../types'

export const EDGE_COLOR_LABELED = TEAL
export const EDGE_COLOR_UNLABELED = '#94a3b8'
export const ARROW_COLORS = [EDGE_COLOR_LABELED, EDGE_COLOR_UNLABELED]

export interface JourneyEdgeData {
  label: string
  direction: RelationDirection
  [key: string]: unknown
}

export default function JourneyEdge({
  id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, selected, data,
}: EdgeProps) {
  const { setEdges } = useReactFlow()
  const edgeData = (data ?? { label: '', direction: 'forward' }) as JourneyEdgeData
  const label = edgeData.label?.trim() ?? ''
  const hasLabel = label.length > 0
  const color = hasLabel ? EDGE_COLOR_LABELED : EDGE_COLOR_UNLABELED
  const markerId = `url(#journey-arrow-${color.replace('#', '')})`

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  })

  const select = () => setEdges((eds) => eds.map((e) => ({ ...e, selected: e.id === id })))

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: color,
          strokeWidth: selected ? 3 : 2,
          strokeDasharray: hasLabel ? undefined : '6 4',
          filter: selected ? `drop-shadow(0 0 4px ${color}88)` : undefined,
        }}
        markerEnd={edgeData.direction !== 'backward' ? markerId : undefined}
        markerStart={edgeData.direction !== 'forward' ? markerId : undefined}
      />
      <EdgeLabelRenderer>
        <Box
          className="nodrag nopan"
          onClick={select}
          sx={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all', cursor: 'pointer',
            px: 1.25, py: 0.4, borderRadius: '999px',
            bgcolor: selected ? color : 'rgba(255,255,255,0.95)',
            border: `1.5px solid ${color}`,
            boxShadow: selected ? `0 0 0 3px ${color}33` : '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'all 0.15s ease',
            '&:hover': { bgcolor: selected ? color : `${color}18` },
          }}
        >
          <Typography variant="caption" sx={{
            fontSize: '0.74rem', whiteSpace: 'nowrap',
            fontWeight: hasLabel ? 700 : 400, fontStyle: hasLabel ? 'normal' : 'italic',
            color: selected ? '#fff' : color,
          }}>
            {hasLabel ? label : 'Qualifier cette relation'}
          </Typography>
        </Box>
      </EdgeLabelRenderer>
    </>
  )
}
