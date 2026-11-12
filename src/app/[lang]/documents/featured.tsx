'use client'

import { MouseEvent, useCallback, useEffect, useState } from 'react'
import { IconButton, Tooltip } from '@mui/material'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'

/**
 * Publications phares de la personne connectée (plan CV, S3 ; champ `featured`
 * du schéma de SigmaCV). Les modèles de CV courts les choisissent en priorité.
 * Gardées en localStorage pour la maquette, partagées entre la liste, la fiche et le CV.
 */
export const FEATURED_KEY = 'featured-publications-v1'
const EVENT = 'svp-featured-change'

export const loadFeatured = (): string[] => {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(FEATURED_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

const saveFeatured = (ids: string[]) => {
  try {
    localStorage.setItem(FEATURED_KEY, JSON.stringify(ids))
  } catch {
    /* stockage indisponible : le choix reste en mémoire */
  }
  window.dispatchEvent(new Event(EVENT))
}

/** Liste des publications phares, tenue à jour quand un autre composant la modifie. */
export const useFeatured = () => {
  const [featured, setFeatured] = useState<string[]>([])

  useEffect(() => {
    const sync = () => setFeatured(loadFeatured())
    sync()
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const toggle = useCallback((id: string) => {
    const current = loadFeatured()
    saveFeatured(current.includes(id) ? current.filter((x) => x !== id) : [...current, id])
  }, [])

  return { featured, isFeatured: (id: string) => featured.includes(id), toggle }
}

interface FeaturedToggleProps {
  id: string
  size?: 'small' | 'medium'
}

/** Étoile « publication phare ». Le clic ne remonte pas (la ligne de la liste ouvre la fiche). */
export const FeaturedToggle = ({ id, size = 'small' }: FeaturedToggleProps) => {
  const { isFeatured, toggle } = useFeatured()
  const on = isFeatured(id)
  const label = on ? 'Retirer des publications phares' : 'Marquer comme publication phare'
  return (
    <Tooltip title={on ? 'Publication phare : choisie en priorité dans les CV courts' : label}>
      <IconButton
        size={size}
        aria-label={label}
        aria-pressed={on}
        onClick={(event: MouseEvent) => {
          event.stopPropagation()
          toggle(id)
        }}
        sx={{ color: on ? 'warning.main' : 'text.secondary' }}
      >
        {on ? <StarIcon fontSize={size} /> : <StarBorderIcon fontSize={size} />}
      </IconButton>
    </Tooltip>
  )
}
