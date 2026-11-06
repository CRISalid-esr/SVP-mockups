'use client'

import { BaseEdge, EdgeLabelRenderer, EdgeProps, InternalNode, Position, getBezierPath, useInternalNode } from '@xyflow/react'
import { ButtonBase } from '@mui/material'
import { RelationDirection, TEAL } from '../types'

const EDGE_COLOR = '#A9B6B3'
export const ARROW_COLORS = [EDGE_COLOR, TEAL]

export interface JourneyEdgeData {
  label: string
  direction: RelationDirection
  onSelect: (id: string) => void
  [key: string]: unknown
}

/** Point d'accroche : le milieu du bord tourné vers l'autre thème, pour que le trait ne contourne jamais une carte. */
function anchor(node: InternalNode, other: InternalNode) {
  const { x, y } = node.internals.positionAbsolute
  const width = node.measured.width ?? 0
  const height = node.measured.height ?? 0
  const otherCenterX = other.internals.positionAbsolute.x + (other.measured.width ?? 0) / 2
  const otherCenterY = other.internals.positionAbsolute.y + (other.measured.height ?? 0) / 2
  const centerX = x + width / 2
  const centerY = y + height / 2

  if (Math.abs(otherCenterX - centerX) > width) {
    return otherCenterX > centerX
      ? { x: x + width, y: centerY, position: Position.Right }
      : { x, y: centerY, position: Position.Left }
  }
  return otherCenterY > centerY
    ? { x: centerX, y: y + height, position: Position.Bottom }
    : { x: centerX, y, position: Position.Top }
}

export default function JourneyEdge({ id, source, target, selected, data }: EdgeProps) {
  const sourceNode = useInternalNode(source)
  const targetNode = useInternalNode(target)
  const { label: rawLabel, direction, onSelect } = data as JourneyEdgeData
  const label = rawLabel?.trim()
  const color = selected ? TEAL : EDGE_COLOR
  const markerId = `url(#journey-arrow-${color.replace('#', '')})`

  if (!sourceNode || !targetNode) return null
  const start = anchor(sourceNode, targetNode)
  const end = anchor(targetNode, sourceNode)

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: start.x,
    sourceY: start.y,
    sourcePosition: start.position,
    targetX: end.x,
    targetY: end.y,
    targetPosition: end.position,
  })

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{ stroke: color, strokeWidth: selected ? 2 : 1.5 }}
        markerEnd={direction !== 'backward' ? markerId : undefined}
        markerStart={direction !== 'forward' ? markerId : undefined}
      />
      <EdgeLabelRenderer>
        <ButtonBase
          className="nodrag nopan"
          onClick={() => onSelect(id)}
          sx={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            px: 1,
            py: 0.25,
            borderRadius: 2,
            fontSize: '0.75rem',
            fontStyle: label ? 'normal' : 'italic',
            whiteSpace: 'nowrap',
            color: selected ? 'primary.main' : 'text.secondary',
            bgcolor: selected ? 'navActive' : 'background.paper',
            border: '1px solid',
            borderColor: selected ? 'primary.main' : 'divider',
            '&:hover': { borderColor: 'primary.main' },
          }}
        >
          {label || 'À qualifier'}
        </ButtonBase>
      </EdgeLabelRenderer>
    </>
  )
}
