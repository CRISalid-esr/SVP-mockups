'use client'

import { useMemo, useState } from 'react'
import { Box, Checkbox, Chip, InputAdornment, Link, TextField, Tooltip, Typography } from '@mui/material'
import { LinkOutlined, OpenInNew, Search } from '@mui/icons-material'
import { CURRENT_YEAR, ResearchTheme, TEAL } from '../types'
import { PUBLICATION_TYPES, Publication, PublicationType, halUrl } from '../mockPublications'

// ─── Sélecteur de publications ───────────────────────────────────────────────
// Liste compacte des publications du chercheur, groupée par année, avec
// recherche, filtre par type et sélections rapides. Les publications déjà
// rattachées à un thème sont signalées (nom du thème) et grisées, pour que le
// chercheur voie d'un coup d'œil ce qui reste à décrire.

type QuickPick = 'uncovered' | 'recent' | 'all' | 'none'

interface Props {
  publications: Publication[]
  selected: string[]
  onChange: (ids: string[]) => void
  /** publication id → thème qui la couvre déjà. */
  coveredBy: Record<string, string>
  themes: ResearchTheme[]
  /** Hauteur maximale de la liste (défilement interne). */
  maxHeight?: number | string
}

const TYPE_COLORS: Record<PublicationType, string> = {
  Article: '#1565C0', Chapitre: '#6A1B9A', Communication: '#00838F', Ouvrage: '#4E342E', Thèse: '#AD1457', Rapport: '#558B2F',
}

export default function PublicationPicker({ publications, selected, onChange, coveredBy, themes, maxHeight = 460 }: Props) {
  const [query, setQuery] = useState('')
  const [types, setTypes] = useState<PublicationType[]>([])

  const themeLabel = (id: string) => themes.find((t) => t.id === id)?.label ?? 'un thème'
  const selectedSet = useMemo(() => new Set(selected), [selected])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return publications
      .filter((p) => types.length === 0 || types.includes(p.type))
      .filter((p) => !q || p.title.toLowerCase().includes(q) || p.venue.toLowerCase().includes(q) || String(p.year).includes(q))
      .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title))
  }, [publications, query, types])

  const byYear = useMemo(() => {
    const map = new Map<number, Publication[]>()
    for (const p of visible) map.set(p.year, [...(map.get(p.year) ?? []), p])
    return [...map.entries()]
  }, [visible])

  const uncovered = publications.filter((p) => !coveredBy[p.id])
  const quick = (pick: QuickPick) => {
    if (pick === 'none') return onChange([])
    if (pick === 'all') return onChange(publications.map((p) => p.id))
    if (pick === 'recent') return onChange(publications.filter((p) => p.year >= CURRENT_YEAR - 4).map((p) => p.id))
    onChange(uncovered.map((p) => p.id))
  }

  const toggle = (id: string) => {
    onChange(selectedSet.has(id) ? selected.filter((s) => s !== id) : [...selected, id])
  }
  const toggleYear = (pubs: Publication[]) => {
    const allIn = pubs.every((p) => selectedSet.has(p.id))
    const ids = pubs.map((p) => p.id)
    onChange(allIn ? selected.filter((s) => !ids.includes(s)) : [...new Set([...selected, ...ids])])
  }

  const quickChip = (pick: QuickPick, label: string) => (
    <Chip key={pick} size="small" label={label} variant="outlined" onClick={() => quick(pick)}
      sx={{ cursor: 'pointer', '&:hover': { bgcolor: `${TEAL}10`, borderColor: TEAL, color: TEAL } }} />
  )

  return (
    <Box>
      {/* Barre d'outils */}
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', mb: 1.5 }}>
        <TextField
          size="small" placeholder="Rechercher un titre, une revue, une année…" value={query}
          onChange={(e) => setQuery(e.target.value)}
          inputProps={{ 'aria-label': 'Rechercher une publication' }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
          sx={{ flex: 1, minWidth: 240 }}
        />
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {PUBLICATION_TYPES.filter((t) => publications.some((p) => p.type === t)).map((t) => {
            const on = types.includes(t)
            return (
              <Chip key={t} size="small" label={t} clickable
                onClick={() => setTypes(on ? types.filter((x) => x !== t) : [...types, t])}
                sx={{
                  height: 24, fontSize: '0.72rem',
                  bgcolor: on ? TYPE_COLORS[t] : 'transparent', color: on ? '#fff' : TYPE_COLORS[t],
                  border: `1px solid ${TYPE_COLORS[t]}${on ? '' : '60'}`,
                  '&:hover': { bgcolor: on ? TYPE_COLORS[t] : `${TYPE_COLORS[t]}14` },
                }} />
            )
          })}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="caption" color="text.secondary">Sélection rapide :</Typography>
        {quickChip('uncovered', `Non rattachées à un thème (${uncovered.length})`)}
        {quickChip('recent', `${CURRENT_YEAR - 4} → aujourd’hui`)}
        {quickChip('all', `Toutes (${publications.length})`)}
        {quickChip('none', 'Aucune')}
      </Box>

      {/* Liste groupée par année */}
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, maxHeight, overflow: 'auto', bgcolor: 'background.paper' }}>
        {byYear.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center', fontStyle: 'italic' }}>
            Aucune publication ne correspond à ces critères.
          </Typography>
        )}
        {byYear.map(([year, pubs]) => {
          const count = pubs.filter((p) => selectedSet.has(p.id)).length
          return (
            <Box key={year}>
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.25,
                bgcolor: '#F8FAFB', borderBottom: '1px solid', borderTop: '1px solid', borderColor: 'divider',
                position: 'sticky', top: 0, zIndex: 1,
              }}>
                <Checkbox size="small" checked={count === pubs.length} indeterminate={count > 0 && count < pubs.length}
                  onChange={() => toggleYear(pubs)} inputProps={{ 'aria-label': `Sélectionner les publications de ${year}` }}
                  sx={{ p: 0.5, '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: TEAL } }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{year}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {count}/{pubs.length} sélectionnée{pubs.length > 1 ? 's' : ''}
                </Typography>
              </Box>
              {pubs.map((p) => {
                const covered = coveredBy[p.id]
                const checked = selectedSet.has(p.id)
                return (
                  <Box key={p.id}
                    onClick={() => toggle(p.id)}
                    sx={{
                      display: 'flex', alignItems: 'flex-start', gap: 1, px: 1, py: 1, cursor: 'pointer',
                      borderBottom: '1px solid', borderColor: 'divider',
                      bgcolor: checked ? `${TEAL}08` : 'transparent',
                      opacity: covered && !checked ? 0.6 : 1,
                      '&:hover': { bgcolor: checked ? `${TEAL}10` : '#FAFAFA' },
                    }}>
                    <Checkbox size="small" checked={checked} tabIndex={-1}
                      inputProps={{ 'aria-label': p.title }}
                      sx={{ p: 0.5, '&.Mui-checked': { color: TEAL } }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.35 }}>{p.title}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mt: 0.35 }}>
                        <Chip size="small" label={p.type}
                          sx={{ height: 18, fontSize: '0.66rem', fontWeight: 600, bgcolor: `${TYPE_COLORS[p.type]}14`, color: TYPE_COLORS[p.type] }} />
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 360 }}>{p.venue}</Typography>
                        <Link href={halUrl(p.halId)} target="_blank" rel="noopener" underline="hover" variant="caption"
                          onClick={(e) => e.stopPropagation()}
                          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25, color: TEAL }}>
                          {p.halId}<OpenInNew sx={{ fontSize: 11 }} />
                        </Link>
                      </Box>
                    </Box>
                    {covered && (
                      <Tooltip title={`Déjà rattachée au thème « ${themeLabel(covered)} »`}>
                        <Chip size="small" icon={<LinkOutlined sx={{ fontSize: 13 }} />} label={themeLabel(covered)}
                          sx={{ height: 22, maxWidth: 220, fontSize: '0.68rem', bgcolor: '#F5F5F5', color: 'text.secondary', flexShrink: 0 }} />
                      </Tooltip>
                    )}
                  </Box>
                )
              })}
            </Box>
          )
        })}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        {selected.length} publication{selected.length > 1 ? 's' : ''} sélectionnée{selected.length > 1 ? 's' : ''} sur {publications.length}
        {uncovered.length > 0 && ` · ${uncovered.length} non rattachée${uncovered.length > 1 ? 's' : ''} à un thème`}
      </Typography>
    </Box>
  )
}
