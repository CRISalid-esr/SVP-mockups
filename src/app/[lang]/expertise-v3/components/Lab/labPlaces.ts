import { PlaceRef } from '../../types'
import { LabEntry, normalizeLabel } from './labMock'
import { LatLon, coordsOf, isArea } from './placeCoords'

// Agrégation des terrains cités dans les thèmes visibles du laboratoire.
// Séparée de LabFieldMap.tsx pour rester importable côté serveur (Leaflet ne l'est pas).

export interface PlaceHits {
  place: PlaceRef
  coords?: LatLon
  area: boolean
  entries: LabEntry[]
  members: string[]
}

export function aggregatePlaces(entries: LabEntry[]): PlaceHits[] {
  const map = new Map<string, PlaceHits>()
  for (const e of entries) {
    for (const place of e.theme.places) {
      const key = normalizeLabel(place.label)
      const cur = map.get(key)
      if (!cur) {
        map.set(key, { place, coords: coordsOf(place), area: isArea(place), entries: [e], members: [e.member.name] })
      } else {
        cur.entries.push(e)
        if (!cur.members.includes(e.member.name)) cur.members.push(e.member.name)
      }
    }
  }
  return [...map.values()].sort((a, b) => b.entries.length - a.entries.length || a.place.label.localeCompare(b.place.label, 'fr'))
}
