'use client'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { Box, Breadcrumbs, Chip, Link, Typography } from '@mui/material'
import NextLink from 'next/link'
import { StructureRaw } from '../types'

const MISSION_LABELS: Record<string, string> = {
  research: 'Recherche',
  scientific_services: 'Services scientifiques',
  administrative_services: 'Services administratifs',
  teaching: 'Enseignement',
}

const MISSION_COLORS: Record<string, 'success' | 'info' | 'warning' | 'secondary'> = {
  research: 'success',
  scientific_services: 'info',
  administrative_services: 'warning',
  teaching: 'secondary',
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

export default function StructureHero({ structure, allStructures, lang }: Props) {
  const breadcrumbAncestors = buildBreadcrumb(structure, allStructures)
  const missionColor = MISSION_COLORS[structure.main_mission] ?? 'default'
  const missionLabel = MISSION_LABELS[structure.main_mission] ?? structure.main_mission

  const parentStructure = structure.parent_uid
    ? allStructures.find((s) => s.uid === structure.parent_uid)
    : null

  const secondaryParents = (structure.secondary_parent_uids ?? [])
    .map((uid) => allStructures.find((s) => s.uid === uid))
    .filter(Boolean) as StructureRaw[]

  const memberOfStructures = (structure.member_of_uids ?? [])
    .map((uid) => allStructures.find((s) => s.uid === uid))
    .filter(Boolean) as StructureRaw[]

  const inScopeInstitutionNames = new Set([
    parentStructure?.acronym,
    ...secondaryParents.map((s) => s.acronym),
  ])
  const outOfScopeNames = structure.institutionNames.filter(
    (n) => !inScopeInstitutionNames.has(n) && n !== structure.acronym,
  )

  const longLabel =
    structure.long_labels.find((l) => l.language === lang)?.value ??
    structure.long_labels[0]?.value ??
    structure.acronym

  return (
    <Box component='header' sx={{ mb: 3 }}>
      {/* Back link */}
      <Link
        component={NextLink}
        href={`/${lang}/research-structures`}
        underline='hover'
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mb: 2, color: 'text.secondary', fontSize: 14 }}
      >
        <ArrowBackIcon sx={{ fontSize: 16 }} />
        Structures de recherche
      </Link>

      {/* Breadcrumb */}
      {breadcrumbAncestors.length > 0 && (
        <Breadcrumbs
          aria-label='hiérarchie de la structure'
          sx={{ mb: 1.5, fontSize: 13, color: 'text.secondary' }}
        >
          {breadcrumbAncestors.map((ancestor) => (
            <Link
              key={ancestor.uid}
              component={NextLink}
              href={`/${lang}/research-structures/${ancestor.uid}`}
              underline='hover'
              sx={{ color: 'text.secondary', fontSize: 13 }}
            >
              {ancestor.acronym}
            </Link>
          ))}
          <Typography sx={{ fontSize: 13, color: 'text.primary' }}>{structure.acronym}</Typography>
        </Breadcrumbs>
      )}

      {/* Acronym + national type */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
        <Typography component='h1' variant='h4' fontWeight='bold' sx={{ lineHeight: 1.2 }}>
          {structure.acronym}
        </Typography>
        {structure.national_type && (
          <Chip label={structure.national_type} size='small' variant='outlined' />
        )}
        <Chip
          label={missionLabel}
          size='small'
          color={missionColor}
          sx={{ fontWeight: 500 }}
        />
        {structure.rnsr && (
          <Typography variant='caption' sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
            RNSR {structure.rnsr}
          </Typography>
        )}
      </Box>

      {/* Long label */}
      <Typography variant='h6' fontWeight='normal' sx={{ color: 'text.secondary', mb: 1.5 }}>
        {longLabel}
      </Typography>

      {/* Tutelles */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {parentStructure && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant='body2' sx={{ color: 'text.secondary', minWidth: 140 }}>
              Tutelle principale :
            </Typography>
            <Link
              component={NextLink}
              href={`/${lang}/research-structures/${parentStructure.uid}`}
              underline='hover'
              variant='body2'
              fontWeight='medium'
            >
              {parentStructure.long_labels.find((l) => l.language === lang)?.value ??
                parentStructure.long_labels[0]?.value ??
                parentStructure.acronym}
            </Link>
          </Box>
        )}

        {(secondaryParents.length > 0 || outOfScopeNames.length > 0) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant='body2' sx={{ color: 'text.secondary', minWidth: 140 }}>
              Co-tutelles :
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              {secondaryParents.map((s) => (
                <Link
                  key={s.uid}
                  component={NextLink}
                  href={`/${lang}/research-structures/${s.uid}`}
                  underline='hover'
                  variant='body2'
                  fontWeight='medium'
                >
                  {s.acronym}
                </Link>
              ))}
              {outOfScopeNames.map((name) => (
                <Box key={name} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    {name}
                  </Typography>
                  <OpenInNewIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {memberOfStructures.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant='body2' sx={{ color: 'text.secondary', minWidth: 140 }}>
              Membre de :
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              {memberOfStructures.map((s) => (
                <Link
                  key={s.uid}
                  component={NextLink}
                  href={`/${lang}/research-structures/${s.uid}`}
                  underline='hover'
                  variant='body2'
                  fontWeight='medium'
                >
                  {s.long_labels.find((l) => l.language === lang)?.value ?? s.long_labels[0]?.value ?? s.acronym}
                </Link>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}
