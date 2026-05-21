'use client'

import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Box, Card, CardContent, CardHeader, IconButton, Typography } from '@mui/material'
import NextLink from 'next/link'
import { StructureRaw } from '../types'

type Props = {
  structure: StructureRaw
  allStructures: StructureRaw[]
  lang: string
}

export default function SidebarMemberships({ structure, allStructures, lang }: Props) {
  const members = allStructures.filter(
    (s) => s.member_of_uids?.includes(structure.uid),
  )

  if (members.length === 0) return null

  return (
    <Card variant='outlined'>
      <CardHeader
        title={
          <Typography variant='subtitle2' fontWeight='bold'>
            Membres
          </Typography>
        }
        subheader={`${members.length} structure${members.length > 1 ? 's' : ''}`}
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ pt: 1, pb: '8px !important' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {members.map((member) => {
            const name =
              member.long_labels.find((l) => l.language === lang)?.value ??
              member.long_labels[0]?.value ??
              member.acronym
            return (
              <Box
                key={member.uid}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant='body2' fontWeight='medium' noWrap>
                    {member.acronym}
                  </Typography>
                  <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }} noWrap>
                    {name}
                  </Typography>
                </Box>
                <IconButton
                  component={NextLink}
                  href={`/${lang}/research-structures/${member.uid}`}
                  size='small'
                  aria-label={`Voir la fiche de ${member.acronym}`}
                  sx={{ flexShrink: 0 }}
                >
                  <ArrowForwardIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            )
          })}
        </Box>
      </CardContent>
    </Card>
  )
}
