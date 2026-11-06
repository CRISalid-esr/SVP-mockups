'use client'

import React, { useMemo } from 'react'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { Avatar, Box, Card, IconButton, Tooltip, Typography } from '@mui/material'
import Image from 'next/image'
import Link from 'next/link'

import { isPerson } from '@/types/Person'
import { PersonIdentifierType } from '@/types/PersonIdentifier'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import * as Lingui from '@lingui/core'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'
import { IAgent } from '@/types/IAgent'
import useStore from '@/stores/global_store'
import { usePersonIdentifiers } from '@/app/[lang]/account/usePersonIdentifiers'

const IDENTIFIERS_TO_SHOW: PersonIdentifierType[] = [
  PersonIdentifierType.ID_HAL_S,
  PersonIdentifierType.ORCID,
  PersonIdentifierType.IDREF,
]

const initialsFromDisplayName = (displayName: string): string => {
  const parts = displayName.trim().split(/\s+/).filter(Boolean)
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '')
  return initials.join('') || 'N/C'
}

const PersonIdentityCard = ({ person }: { person: IAgent }) => {
  if (!isPerson(person)) {
    throw new Error('PersonIdentityCard: agent is not a Person')
  }
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lang = (Lingui.i18n.locale || 'ul') as ExtendedLanguageCode
  const displayName = person.getDisplayName(lang) || ''
  const { connectedUser } = useStore((state) => state.user)
  const { identifiers } = usePersonIdentifiers(person)

  // Ses propres identifiants sont dans Mon compte ; ceux d'une autre personne, sur sa page.
  const editIdentifiers = () => {
    const isOwn = connectedUser?.person?.uid === person.uid
    const query = isOwn ? '' : `?perspective=${encodeURIComponent(person.slug ?? '')}`
    router.push(`/${lang}/account${query}`)
  }

  const navigateToPerspective = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('perspective', slug)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const identifiersToDisplay = useMemo(() => {
    return identifiers.filter((id) => IDENTIFIERS_TO_SHOW.includes(id.type))
  }, [identifiers])

  const structures = person.memberships.filter(
    (m) => m.researchStructure?.acronym && m.researchStructure?.slug,
  )

  return (
    <Card sx={{ p: 2.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
      <Avatar aria-hidden sx={{ width: 48, height: 48, bgcolor: 'primary.main', fontWeight: 700 }}>
        {initialsFromDisplayName(displayName)}
      </Avatar>

      <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
        <Typography variant='body1' fontWeight={700}>
          {displayName || 'N/C'}
        </Typography>
        {structures.length > 0 && (
          <Typography variant='body2' color='text.secondary'>
            {structures.map((m, index) => {
              const rs = m.researchStructure!
              return (
                <Box
                  key={rs.uid}
                  component='span'
                  onClick={() => navigateToPerspective(rs.slug!)}
                  sx={{ cursor: 'pointer', fontWeight: 500, color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
                >
                  {rs.acronym}
                  {index < structures.length - 1 ? ', ' : ''}
                </Box>
              )
            })}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
        {identifiersToDisplay.map((id) => {
          const href = id.getUrl()
          const badge = (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.25,
                py: 0.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                color: 'text.primary',
                '&:hover': href ? { bgcolor: 'navHover' } : undefined,
              }}
            >
              <Image src={id.getIcon()} alt={id.getLabel()} width={18} height={18} />
              <Typography variant='body2' sx={{ whiteSpace: 'nowrap' }}>
                {id.value}
              </Typography>
            </Box>
          )

          return href ? (
            <Link
              key={`${id.type}:${id.value}`}
              href={href}
              target='_blank'
              rel='noopener noreferrer'
              style={{ textDecoration: 'none' }}
            >
              {badge}
            </Link>
          ) : (
            <Box key={`${id.type}:${id.value}`}>{badge}</Box>
          )
        })}
        <Tooltip title='Modifier les identifiants'>
          <IconButton size='small' aria-label='Modifier les identifiants' onClick={editIdentifiers}>
            <EditOutlinedIcon fontSize='small' />
          </IconButton>
        </Tooltip>
      </Box>
    </Card>
  )
}
export default PersonIdentityCard
