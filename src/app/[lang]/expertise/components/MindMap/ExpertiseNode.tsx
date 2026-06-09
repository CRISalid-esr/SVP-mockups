'use client'

import { Handle, NodeProps, Position, useReactFlow } from '@xyflow/react'
import { Box, Chip, Divider, IconButton, Tooltip, Typography } from '@mui/material'
import {
  Business, CalendarToday, ExpandLess, ExpandMore, LocalOffer, Person, Place,
} from '@mui/icons-material'
import { ExpertiseNodeData, NODE_TYPE_CONFIG } from '../../types'

const TEAL = '#006A61'

const ATTR_ROWS = [
  { key: 'temporal',      Icon: CalendarToday, color: '#0288D1' },
  { key: 'geographic',    Icon: Place,         color: '#388E3C' },
  { key: 'persons',       Icon: Person,        color: '#7B1FA2' },
  { key: 'organizations', Icon: Business,      color: '#E65100' },
  { key: 'concepts',      Icon: LocalOffer,    color: TEAL },
] as const

const ExpertiseNode = ({ id, data, selected }: NodeProps) => {
  const nodeData = data as ExpertiseNodeData
  const config = NODE_TYPE_CONFIG.expertise
  const { setNodes } = useReactFlow()

  const attrCount = ATTR_ROWS.reduce(
    (sum, { key }) => sum + (nodeData[key]?.length ?? 0), 0,
  )
  const expanded = Boolean(nodeData.expanded)
  const hasAttrs = attrCount > 0

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, expanded: !expanded } } : n,
      ),
    )
  }

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0.5 }} />

      <Box
        sx={{
          minWidth: 160,
          maxWidth: expanded ? 280 : 240,
          borderRadius: '10px',
          border: `2px solid ${config.color}`,
          backgroundColor: selected ? config.color : config.bg,
          boxShadow: selected
            ? `0 0 0 3px ${config.color}44`
            : '0 2px 6px rgba(0,0,0,0.12)',
          cursor: 'grab',
          transition: 'all 0.15s ease',
          overflow: 'hidden',
          '&:hover': { boxShadow: `0 0 0 3px ${config.color}44` },
        }}
      >
        {/* Label row */}
        <Tooltip title={nodeData.description || ''} placement="top" arrow>
          <Box sx={{ px: 2, pt: 1.2, pb: hasAttrs ? 0.8 : 1.2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography
              sx={{
                flex: 1,
                color: selected ? 'white' : '#1a1a1a',
                fontWeight: 600,
                fontSize: '0.85rem',
                lineHeight: 1.3,
              }}
            >
              {nodeData.label}
            </Typography>

            {/* Toggle button — visible uniquement si des attributs existent */}
            {hasAttrs && (
              <IconButton
                size="small"
                onClick={handleToggle}
                className="nodrag"
                sx={{
                  p: 0.2,
                  flexShrink: 0,
                  color: selected ? 'rgba(255,255,255,0.75)' : config.color,
                  '&:hover': { bgcolor: selected ? 'rgba(255,255,255,0.15)' : `${config.color}15` },
                }}
              >
                {expanded
                  ? <ExpandLess sx={{ fontSize: 16 }} />
                  : <ExpandMore sx={{ fontSize: 16 }} />
                }
              </IconButton>
            )}
          </Box>
        </Tooltip>

        {/* Compteur replié */}
        {hasAttrs && !expanded && (
          <Typography
            variant="caption"
            onClick={handleToggle}
            className="nodrag"
            sx={{
              display: 'block',
              px: 2,
              pb: 1,
              color: selected ? 'rgba(255,255,255,0.7)' : config.color,
              fontSize: '0.6rem',
              fontWeight: 600,
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            {attrCount} caractéristique{attrCount > 1 ? 's' : ''}
          </Typography>
        )}

        {/* Section attributs déployée */}
        {hasAttrs && expanded && (
          <>
            <Divider sx={{ borderColor: selected ? 'rgba(255,255,255,0.3)' : `${config.color}44` }} />
            <Box sx={{ px: 1.5, py: 1, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {ATTR_ROWS.map(({ key, Icon, color }) => {
                const items = (nodeData[key] ?? []) as Array<{ label: string; vocabulary?: string }>
                if (!items.length) return null
                return (
                  <Box key={key} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
                    <Icon sx={{ fontSize: 12, color: selected ? 'rgba(255,255,255,0.75)' : color, mt: 0.3, flexShrink: 0 }} />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4 }}>
                      {items.map((item, i) => (
                        <Chip
                          key={i}
                          label={
                            key === 'concepts' && item.vocabulary
                              ? `${item.label} · ${item.vocabulary.toUpperCase()}`
                              : item.label
                          }
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.6rem',
                            fontWeight: 500,
                            bgcolor: selected ? 'rgba(255,255,255,0.18)' : `${color}12`,
                            color: selected ? 'white' : color,
                            border: `1px solid ${selected ? 'rgba(255,255,255,0.3)' : `${color}44`}`,
                            '& .MuiChip-label': { px: 0.75 },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )
              })}
            </Box>
          </>
        )}
      </Box>

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0.5 }} />
    </>
  )
}

export default ExpertiseNode
