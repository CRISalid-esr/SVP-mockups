'use client'

import { Handle, NodeProps, Position } from '@xyflow/react'
import { Box, Typography } from '@mui/material'
import { HistoryEdu } from '@mui/icons-material'
import { ResearchTheme, TEAL, VISIBILITY_CONFIG, formatPeriod } from '../types'

export interface JourneyNodeData {
  theme: ResearchTheme
  width: number
  [key: string]: unknown
}

const handleStyle = {
  width: 12, height: 12, background: '#fff', border: `2px solid ${TEAL}`,
}

/** Nœud « thème » du graphe de parcours : une barre dont la largeur suit la période. */
export default function JourneyNode({ data, selected }: NodeProps) {
  const { theme, width } = data as JourneyNodeData
  const draft = theme.status === 'draft'
  const vis = VISIBILITY_CONFIG[theme.visibility]
  const border = draft ? '#ED6C02' : TEAL

  return (
    <>
      <Handle type="target" position={Position.Left} style={handleStyle} />
      <Box
        sx={{
          width, minHeight: 64, boxSizing: 'border-box',
          px: 1.75, py: 1.25, borderRadius: '12px',
          border: `2px ${draft ? 'dashed' : 'solid'} ${border}`,
          bgcolor: selected ? TEAL : draft ? '#FFF8F0' : '#E8F5F4',
          color: selected ? '#fff' : 'text.primary',
          boxShadow: selected ? `0 0 0 4px ${TEAL}33` : '0 1px 4px rgba(0,0,0,0.08)',
          transition: 'all 0.15s ease',
          '&:hover': { boxShadow: `0 0 0 4px ${TEAL}33` },
        }}
      >
        <Typography sx={{
          fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.3,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {theme.label || 'Thème sans titre'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5, opacity: selected ? 0.85 : 0.75 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {formatPeriod(theme)}
          </Typography>
          <vis.Icon sx={{ fontSize: 13 }} titleAccess={vis.label} />
          {draft && <Typography variant="caption" sx={{ fontWeight: 600, color: selected ? '#fff' : '#E65100' }}>· brouillon</Typography>}
        </Box>
        {theme.studiedPeriods.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25, opacity: selected ? 0.85 : 0.75 }}>
            <HistoryEdu sx={{ fontSize: 12, color: selected ? '#fff' : '#7B5E2A' }} />
            <Typography variant="caption" noWrap title={`Porte sur : ${theme.studiedPeriods.map((p) => p.label).join(', ')}`}>
              {theme.studiedPeriods.map((p) => p.label).join(', ')}
            </Typography>
          </Box>
        )}
      </Box>
      <Handle type="source" position={Position.Right} style={handleStyle} />
    </>
  )
}

/** Graduation de la frise (année). */
export function AxisTickNode({ data }: NodeProps) {
  const { label } = data as { label: string }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
      <Box sx={{ width: '1px', height: 10, bgcolor: 'text.disabled' }} />
      <Typography variant="caption" sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums', mt: 0.25 }}>
        {label}
      </Typography>
    </Box>
  )
}

/** Ligne de base de la frise. */
export function AxisLineNode({ data }: NodeProps) {
  const { width } = data as { width: number }
  return <Box sx={{ width, height: '2px', bgcolor: '#CFD8DC', pointerEvents: 'none' }} />
}
