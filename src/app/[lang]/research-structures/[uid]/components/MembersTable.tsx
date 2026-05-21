'use client'

import { Avatar, Box, Card, CardContent, CardHeader, Chip, LinearProgress, Link, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material'
import NextLink from 'next/link'
import { PersonRaw } from '../types'

type Props = {
  members: PersonRaw[]
  lang: string
  structureUid: string
}

function initials(displayName: string): string {
  return displayName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const STATUT_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'info'> = {
  'Pr.': 'primary',
  'MCF': 'primary',
  'DR': 'info',
  'CR': 'info',
  'Doctorant': 'secondary',
  'Post-doc': 'secondary',
  'ATER': 'warning',
  'Ingé.': 'default',
}

export default function MembersTable({ members, lang, structureUid }: Props) {
  if (members.length === 0) return null

  const sorted = [...members]
    .sort((a, b) => (b.publis24m ?? 0) - (a.publis24m ?? 0))
    .slice(0, 8)

  return (
    <Card variant='outlined'>
      <CardHeader
        title={
          <Typography variant='subtitle1' fontWeight='bold'>
            Membres les plus actifs
          </Typography>
        }
        action={
          <Link
            component={NextLink}
            href={`/${lang}/researchers?structure=${structureUid}`}
            underline='hover'
            variant='body2'
            sx={{ color: 'success.main', fontWeight: 500 }}
          >
            Voir tous les membres →
          </Link>
        }
        subheader={`${members.length} membre${members.length > 1 ? 's' : ''} au total`}
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ p: 0, pb: '0 !important' }}>
        <Table size='small' aria-label='Membres les plus actifs'>
          <TableHead>
            <TableRow sx={{ '& th': { borderBottom: '1px solid', borderColor: 'divider', fontWeight: 600, fontSize: 12, color: 'text.secondary' } }}>
              <TableCell scope='col'>Chercheur</TableCell>
              <TableCell scope='col'>Statut</TableCell>
              <TableCell scope='col' align='right'>Publis 24m</TableCell>
              <TableCell scope='col' sx={{ minWidth: 110 }}>OA</TableCell>
              <TableCell scope='col'>HAL</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((person) => (
              <TableRow
                key={person.uid}
                hover
                sx={{ cursor: 'pointer', '&:last-child td': { border: 0 } }}
                component={NextLink as React.ElementType}
                href={`/${lang}/researchers/${person.slug}`}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: 11, bgcolor: 'primary.light' }}>
                      {initials(person.displayName)}
                    </Avatar>
                    <Typography variant='body2' fontWeight='medium' sx={{ whiteSpace: 'nowrap' }}>
                      {person.displayName}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {person.statut && (
                    <Chip
                      label={person.statut}
                      size='small'
                      variant='outlined'
                      color={STATUT_COLORS[person.statut] ?? 'default'}
                      sx={{ fontSize: 11, height: 20 }}
                    />
                  )}
                </TableCell>
                <TableCell align='right'>
                  <Typography variant='body2' fontWeight='bold'>
                    {person.publis24m ?? '—'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {person.oaRate != null ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 54 }}>
                        <LinearProgress
                          variant='determinate'
                          value={person.oaRate}
                          aria-label={`OA ${person.oaRate} %`}
                          aria-valuenow={person.oaRate}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          role='progressbar'
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: 'action.disabledBackground',
                            '& .MuiLinearProgress-bar': { bgcolor: '#3FB97A' },
                          }}
                        />
                      </Box>
                      <Typography variant='caption' fontWeight='bold'>{person.oaRate} %</Typography>
                    </Box>
                  ) : (
                    <Typography variant='body2' sx={{ color: 'text.disabled' }}>—</Typography>
                  )}
                </TableCell>
                <TableCell>
                  {person.halRate != null ? (
                    <Tooltip title={`${person.halRate} % des publications dans HAL`}>
                      <Chip
                        label={`${person.halRate} %`}
                        size='small'
                        color={person.halRate >= 80 ? 'success' : person.halRate >= 50 ? 'warning' : 'error'}
                        sx={{ fontSize: 11, height: 20 }}
                      />
                    </Tooltip>
                  ) : (
                    <Typography variant='body2' sx={{ color: 'text.disabled' }}>—</Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
