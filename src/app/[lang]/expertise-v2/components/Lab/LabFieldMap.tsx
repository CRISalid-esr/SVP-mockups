'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { TEAL } from '../../types'
import { LabEntry } from './labMock'
import { LatLon } from './placeCoords'
import { PlaceHits, aggregatePlaces } from './labPlaces'

// ─── Carte des terrains du laboratoire ───────────────────────────────────────
// Première version : fond de carte OpenStreetMap (style CARTO clair), un
// cercle par terrain cité dans les thèmes visibles du laboratoire, rayon
// proportionnel au nombre de thèmes. Les régions et départements sont dessinés
// plus larges et plus clairs que les villes. Clic → liste des membres.

type Extent = 'ouest' | 'monde'

/** Grand Ouest français : de la pointe du Finistère au Mans, de La Rochelle à Saint-Malo. */
const OUEST_BOUNDS = L.latLngBounds([45.6, -5.4], [49.0, 0.6])

interface Props {
  entries: LabEntry[]
  teamColor: (team: string) => string
  onSelectPlace: (hits: PlaceHits) => void
  height?: number
}

export default function LabFieldMap({ entries, teamColor, onSelectPlace, height = 420 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)
  const [extent, setExtent] = useState<Extent>('ouest')

  const places = useMemo(() => aggregatePlaces(entries), [entries])
  const located = useMemo(() => places.filter((p) => p.coords), [places])
  const outsideWest = located.filter((p) => !OUEST_BOUNDS.contains(p.coords as LatLon))
  const maxCount = Math.max(1, ...located.map((p) => p.entries.length))
  // Clé stable de l'ensemble localisé : évite de recadrer la carte à chaque rendu.
  const locatedKey = located.map((p) => p.place.label).join('|')

  // Création de la carte (une seule fois)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: false, attributionControl: true })
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
      // Fond atténué pour laisser les cercles lisibles.
      className: 'lab-map-tiles',
    }).addTo(map)
    map.fitBounds(OUEST_BOUNDS)
    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null; layerRef.current = null }
  }, [])

  // Marqueurs : un cercle par terrain
  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return
    layer.clearLayers()
    // Les zones d'abord (dessous), puis les villes.
    const ordered = [...located].sort((a, b) => Number(b.area) - Number(a.area))
    for (const p of ordered) {
      const count = p.entries.length
      const teams = [...new Set(p.entries.map((e) => e.member.team))]
      const color = teams.length === 1 ? teamColor(teams[0]) : TEAL
      const radius = p.area ? 13 + 9 * Math.sqrt(count / maxCount) : 7 + 9 * Math.sqrt(count / maxCount)
      const marker = L.circleMarker(p.coords as LatLon, {
        radius,
        color,
        weight: p.area ? 1.5 : 2,
        dashArray: p.area ? '4 4' : undefined,
        fillColor: color,
        fillOpacity: p.area ? 0.12 : 0.55,
      })
      const memberList = p.members.slice(0, 4).join(', ') + (p.members.length > 4 ? ` +${p.members.length - 4}` : '')
      marker.bindTooltip(
        `<strong>${p.place.label}</strong>${p.place.detail ? ` <span style="color:#777">· ${p.place.detail}</span>` : ''}`
        + `<br/>${count} thème${count > 1 ? 's' : ''} · ${p.members.length} membre${p.members.length > 1 ? 's' : ''}`
        + `<br/><span style="color:#555">${memberList}</span>`,
        { direction: 'top', offset: [0, -radius], opacity: 0.95 },
      )
      marker.on('click', () => onSelectPlace(p))
      marker.addTo(layer)
    }
  }, [located, maxCount, teamColor, onSelectPlace])

  // Étendue : Grand Ouest ou tous les terrains localisés
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (extent === 'ouest' || located.length === 0) {
      map.fitBounds(OUEST_BOUNDS, { animate: false })
    } else {
      map.fitBounds(L.latLngBounds(located.map((p) => p.coords as LatLon)).pad(0.15), { animate: false, maxZoom: 6 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extent, locatedKey])

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap', px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          {located.length} terrain{located.length > 1 ? 's' : ''} localisé{located.length > 1 ? 's' : ''}
          {places.length - located.length > 0 ? ` · ${places.length - located.length} sans coordonnées` : ''}
          {extent === 'ouest' && outsideWest.length > 0 ? ` · ${outsideWest.length} hors Grand Ouest` : ''}
        </Typography>
        <ToggleButtonGroup size="small" exclusive value={extent} onChange={(_e, v: Extent | null) => v && setExtent(v)} aria-label="Étendue de la carte"
          sx={{ '& .MuiToggleButton-root': { textTransform: 'none', px: 1.5, py: 0.25, fontSize: '0.78rem' } }}>
          <ToggleButton value="ouest" sx={{ '&.Mui-selected': { bgcolor: `${TEAL}14`, color: TEAL, fontWeight: 700 } }}>Grand Ouest</ToggleButton>
          <ToggleButton value="monde" sx={{ '&.Mui-selected': { bgcolor: `${TEAL}14`, color: TEAL, fontWeight: 700 } }}>Tous les terrains</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box ref={containerRef} role="img" aria-label="Carte des terrains du laboratoire"
        sx={{ height, width: '100%', '& .leaflet-container': { fontFamily: 'inherit' }, '& .lab-map-tiles': { filter: 'grayscale(0.6) opacity(0.75)' } }} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', px: 2, py: 0.75, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: `${TEAL}90`, border: `2px solid ${TEAL}` }} />
          <Typography variant="caption" color="text.secondary">Ville (taille = nombre de thèmes)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: `${TEAL}20`, border: `1.5px dashed ${TEAL}` }} />
          <Typography variant="caption" color="text.secondary">Région, département, espace</Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">Couleur = équipe (teal si plusieurs équipes). Clic sur un terrain : membres concernés.</Typography>
      </Box>
    </Box>
  )
}
