'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { PersonIdentifier, PersonIdentifierType } from '@/types/PersonIdentifier'

/** Identifiants qu'une personne gère elle-même, dans l'ordre d'affichage. */
export const EDITABLE_IDENTIFIERS = [
  {
    type: PersonIdentifierType.IDREF,
    label: 'IdRef',
    placeholder: '123456789',
    pattern: /^\d{8}[\dX]$/,
    format: '9 caractères : 8 chiffres, puis un chiffre ou X',
    linkable: false,
  },
  {
    type: PersonIdentifierType.ID_HAL_S,
    label: 'HAL',
    placeholder: 'prenom-nom',
    pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
    format: 'minuscules, chiffres et tirets, par exemple prenom-nom',
    linkable: true,
  },
  {
    type: PersonIdentifierType.ORCID,
    label: 'ORCID',
    placeholder: '0000-0000-0000-0000',
    pattern: /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/,
    format: '16 caractères groupés par 4, par exemple 0000-0002-1825-0097',
    linkable: true,
  },
] as const

export type EditableIdentifierType = (typeof EDITABLE_IDENTIFIERS)[number]['type']

interface StoredIdentifier {
  /** null : identifiant supprimé. */
  value?: string | null
  linked?: boolean
}

type StoredIdentifiers = Partial<Record<EditableIdentifierType, StoredIdentifier>>

interface PersonWithIdentifiers {
  uid?: string
  slug?: string | null
  getIdentifiers: () => PersonIdentifier[]
}

const storageKey = (person: PersonWithIdentifiers) => `person-identifiers-v1-${person.slug ?? person.uid}`

/** idHal_i est une autre forme de l'identifiant HAL : il est remplacé en même temps que idHal_s. */
const replacedBy = (type: PersonIdentifierType): EditableIdentifierType | null => {
  if (type === PersonIdentifierType.ID_HAL_I) return PersonIdentifierType.ID_HAL_S
  return EDITABLE_IDENTIFIERS.some((field) => field.type === type) ? (type as EditableIdentifierType) : null
}

/**
 * Identifiants d'une personne avec les modifications faites dans la maquette, qui n'a pas d'API :
 * elles sont conservées dans le navigateur, et partagées par la page Compte et le Tableau de bord.
 */
export const usePersonIdentifiers = (person: PersonWithIdentifiers) => {
  const [stored, setStored] = useState<StoredIdentifiers>({})
  const key = storageKey(person)

  useEffect(() => {
    try {
      setStored(JSON.parse(localStorage.getItem(key) ?? '{}'))
    } catch {
      setStored({})
    }
  }, [key])

  const update = useCallback((type: EditableIdentifierType, patch: StoredIdentifier) => {
    setStored((current) => {
      const next = { ...current, [type]: { ...current[type], ...patch } }
      localStorage.setItem(key, JSON.stringify(next))
      return next
    })
  }, [key])

  const baseIdentifiers = person.getIdentifiers()

  const identifiers = useMemo(() => {
    const kept = baseIdentifiers.filter((identifier) => {
      const type = replacedBy(identifier.type)
      return !type || stored[type]?.value === undefined
    })
    const changed = EDITABLE_IDENTIFIERS.flatMap(({ type }) => {
      const value = stored[type]?.value
      return value ? [new PersonIdentifier(type, value)] : []
    })
    return [...kept, ...changed]
  }, [baseIdentifiers, stored])

  return {
    identifiers,
    valueOf: (type: EditableIdentifierType) =>
      identifiers.find((identifier) => replacedBy(identifier.type) === type) ?? null,
    isLinked: (type: EditableIdentifierType) => Boolean(stored[type]?.linked),
    setValue: (type: EditableIdentifierType, value: string | null) => update(type, { value, linked: false }),
    setLinked: (type: EditableIdentifierType, linked: boolean) => update(type, { linked }),
  }
}
