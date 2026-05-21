'use client'

import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { Box, Card, CardContent, CardHeader, Chip, IconButton, LinearProgress, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import NextLink from 'next/link'
import { StructureRaw } from '../types'

const GENERIC_LABELS: Record<string, string> = {
  institution: 'Institution',
  institution_subdivision: 'Composante',
  unit: 'Unité',
  team: 'Équipe',
}

type Props = {
  structure: StructureRaw
  allStructures: StructureRaw[]
  lang: string
}

export default function SubstructuresTable({ structure, allStructures, lang }: Props) {
  const childUids = structure.childUids ?? []

  const directChildren = allStructures.filter(
    (s) => s.parent_uid === structure.uid,
  )
  const secondaryChildren = allStructures.filter(
    (s) =>
      s.secondary_parent_uids?.includes(structure.uid) &&
      s.parent_uid !== structure.uid,
  )

  const allChildren = [...directChildren, ...secondaryChildren]

  if (allChildren.length === 0 && childUids.length === 0) {
    return (
      <Card variant='outlined'>
        <CardContent>
          <Typography variant='body2' sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
            Aucune structure rattachée
          </Typography>
        </CardContent>
      </Card>
    )
  }

  const children = allChildren.length > 0
    ? allChildren
    : childUids.map((uid) => allStructures.find((s) => s.uid === uid)).filter(Boolean) as StructureRaw[]

  return (
    <Card variant='outlined'>
      <CardHeader
        title={
          <Typography variant='subtitle1' fontWeight='bold'>
            {structure.generic_type === 'institution' ? 'Structures rattachées' : 'Unités rattachées'}
          </Typography>
        }
        subheader={`${children.length} structure${children.length > 1 ? 's' : ''}`}
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ p: 0, pb: '0 !important' }}>
        <Table size='small' aria-label='Structures rattachées'>
          <TableHead>
            <TableRow sx={{ '& th': { fontWeight: 600, fontSize: 12, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider' } }}>
              <TableCell scope='col'>Structure</TableCell>
              <TableCell scope='col'>Type</TableCell>
              <TableCell scope='col' align='right'>Membres</TableCell>
              <TableCell scope='col' align='right'>Publis 24m</TableCell>
              <TableCell scope='col' sx={{ minWidth: 90 }}>OA</TableCell>
              <TableCell scope='col' />
            </TableRow>
          </TableHead>
          <TableBody>
            {children.map((child) => {
              const isSecondary = child.secondary_parent_uids?.includes(structure.uid) && child.parent_uid !== structure.uid
              const name = child.long_labels.find((l) => l.language === lang)?.value ?? child.long_labels[0]?.value ?? child.acronym
              return (
                <TableRow key={child.uid} hover sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box>
                        <Typography variant='body2' fontWeight='medium'>
                          {child.acronym}
                        </Typography>
                        <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>
                          {name}
                        </Typography>
                      </Box>
                      {isSecondary && (
                        <Chip label='co-tutelle' size='small' variant='outlined' sx={{ fontSize: 10, height: 18 }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                      {GENERIC_LABELS[child.generic_type] ?? child.generic_type}
                      {child.national_type ? ` · ${child.national_type}` : ''}
                    </Typography>
                  </TableCell>
                  <TableCell align='right'>
                    <Typography variant='body2'>{child.membersCount.toLocaleString('fr-FR')}</Typography>
                  </TableCell>
                  <TableCell align='right'>
                    <Typography variant='body2'>{child.publicationsCount.toLocaleString('fr-FR')}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 48 }}>
                        <LinearProgress
                          variant='determinate'
                          value={child.oaRate}
                          role='progressbar'
                          aria-valuenow={child.oaRate}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`OA ${child.oaRate} %`}
                          sx={{ height: 6, borderRadius: 3, bgcolor: 'action.disabledBackground', '& .MuiLinearProgress-bar': { bgcolor: '#3FB97A' } }}
                        />
                      </Box>
                      <Typography variant='caption'>{child.oaRate > 0 ? `${child.oaRate} %` : '—'}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align='right'>
                    <IconButton
                      component={NextLink}
                      href={`/${lang}/research-structures/${child.uid}`}
                      size='small'
                      aria-label={`Voir la fiche de ${child.acronym}`}
                    >
                      <ArrowForwardIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
