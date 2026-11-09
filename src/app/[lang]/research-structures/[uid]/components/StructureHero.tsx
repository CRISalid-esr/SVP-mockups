'use client'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Box, Breadcrumbs, IconButton, Link, Tooltip, Typography } from '@mui/material'
import NextLink from 'next/link'
import { Fragment } from 'react'
import { StructureRaw } from '../types'

const MISSION_LABELS: Record<string, string> = {
  research: 'Recherche',
  scientific_services: 'Services scientifiques',
  administrative_services: 'Services administratifs',
  teaching: 'Enseignement',
}

const GENERIC_LABELS: Record<string, string> = {
  institution: 'Établissement',
  institution_subdivision: 'Composante',
  unit: 'Unité de recherche',
  team: 'Équipe',
}

type Props = {
  structure: StructureRaw
  allStructures: StructureRaw[]
  lang: string
}

function buildBreadcrumb(structure: StructureRaw, all: StructureRaw[]): StructureRaw[] {
  const chain: StructureRaw[] = []
  let current: StructureRaw | undefined = structure
  const visited = new Set<string>()

  while (current && current.parent_uid && !visited.has(current.uid)) {
    visited.add(current.uid)
    const parent = all.find((s) => s.uid === current!.parent_uid)
    if (!parent) break
    chain.unshift(parent)
    current = parent
  }
  return chain
}

const labelOf = (structure: StructureRaw, lang: string) =>
  structure.long_labels.find((l) => l.language === lang)?.value ?? structure.long_labels[0]?.value ?? structure.acronym

/** En-tête de la fiche : comme la fiche publication, flèche de retour, titre, puis une ligne d'informations. */
export default function StructureHero({ structure, allStructures, lang }: Props) {
  const ancestors = buildBreadcrumb(structure, allStructures)

  const parentStructure = structure.parent_uid ? allStructures.find((s) => s.uid === structure.parent_uid) : null
  const secondaryParents = (structure.secondary_parent_uids ?? [])
    .map((uid) => allStructures.find((s) => s.uid === uid))
    .filter(Boolean) as StructureRaw[]
  const memberOf = (structure.member_of_uids ?? [])
    .map((uid) => allStructures.find((s) => s.uid === uid))
    .filter(Boolean) as StructureRaw[]

  const inScope = new Set([parentStructure?.acronym, ...secondaryParents.map((s) => s.acronym)])
  const outOfScope = structure.institutionNames.filter((n) => !inScope.has(n) && n !== structure.acronym)

  const typeLabel = structure.national_type ?? GENERIC_LABELS[structure.generic_type] ?? structure.generic_type
  const mission = MISSION_LABELS[structure.main_mission] ?? structure.main_mission

  const structureLink = (s: StructureRaw, text: string) => (
    <Link component={NextLink} href={`/${lang}/research-structures/${s.uid}`} underline='hover' sx={{ fontWeight: 500 }}>
      {text}
    </Link>
  )

  const relations: { label: string; items: React.ReactNode[] }[] = [
    parentStructure && { label: 'Tutelle', items: [structureLink(parentStructure, parentStructure.acronym)] },
    (secondaryParents.length > 0 || outOfScope.length > 0) && {
      label: 'Co-tutelles',
      items: [...secondaryParents.map((s) => structureLink(s, s.acronym)), ...outOfScope.map((name) => <span key={name}>{name}</span>)],
    },
    memberOf.length > 0 && { label: 'Membre de', items: memberOf.map((s) => structureLink(s, s.acronym)) },
  ].filter(Boolean) as { label: string; items: React.ReactNode[] }[]

  return (
    <Box component='header' sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 4 }}>
      <Tooltip title='Retour aux structures'>
        <IconButton component={NextLink} href={`/${lang}/research-structures`} aria-label='Retour aux structures' sx={{ mt: 0.25 }}>
          <ArrowBackIcon />
        </IconButton>
      </Tooltip>
      <Box sx={{ minWidth: 0 }}>
        {ancestors.length > 0 && (
          <Breadcrumbs aria-label='Rattachement de la structure' sx={{ fontSize: '0.8125rem', mb: 0.5 }}>
            {ancestors.map((ancestor) => (
              <Link
                key={ancestor.uid}
                component={NextLink}
                href={`/${lang}/research-structures/${ancestor.uid}`}
                underline='hover'
                color='text.secondary'
                sx={{ fontSize: '0.8125rem' }}
              >
                {ancestor.acronym}
              </Link>
            ))}
            <Typography sx={{ fontSize: '0.8125rem' }}>{structure.acronym}</Typography>
          </Breadcrumbs>
        )}
        <Typography component='h1' variant='h4'>
          {structure.acronym}
        </Typography>
        <Typography color='text.secondary' sx={{ mt: 0.25 }}>
          {labelOf(structure, lang)}
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', columnGap: 1.5, rowGap: 0.5 }}>
          <span>{typeLabel}</span>
          {mission && <span>{`· ${mission}`}</span>}
          {relations.map(({ label, items }) => (
            <span key={label}>
              {`· ${label} : `}
              {items.map((item, index) => (
                <Fragment key={index}>
                  {index > 0 && ', '}
                  {item}
                </Fragment>
              ))}
            </span>
          ))}
        </Typography>
      </Box>
    </Box>
  )
}
