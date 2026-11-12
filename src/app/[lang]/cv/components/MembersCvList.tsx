'use client'

import { Box, Card, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'
import personsData from '@/mocks/data/persons.json'
import { mockService } from '@/mocks/mockService'
import { getPersonCv } from '../cvMock'

/** Membres d'une structure : liste déclarée, sinon rattachements, sinon établissement. */
const membersOf = (uid: string) => {
  const declared = mockService.getStructureMembers(uid)
  if (declared.length) return declared
  const byMembership = personsData.filter((p) => p.memberships?.some((m) => m.researchStructure.uid === uid))
  if (byMembership.length) return byMembership
  return personsData.filter((p) => p.institution?.uid === uid)
}

interface MembersCvListProps {
  structureUid: string
  structureName: string
  lang: string
}

/** Perspective structure : pas de CV de structure, mais les CV de ses membres. */
const MembersCvList = ({ structureUid, structureName, lang }: MembersCvListProps) => {
  const router = useRouter()
  const rows = membersOf(structureUid)
    .map((p) => ({ person: p, cv: getPersonCv(p.uid, lang) }))
    .filter((r) => r.cv)
    .sort((a, b) => a.person.lastName.localeCompare(b.person.lastName))

  const withOrcid = rows.filter((r) => r.cv!.orcid).length

  const open = (slug: string) => router.push(`/${lang}/cv?perspective=${encodeURIComponent(slug)}`)

  return (
    <Card>
      <Box sx={{ p: 2.5 }}>
        <Typography variant='h6' component='h2'>{'CV des membres'}</Typography>
        <Typography variant='body2' color='text.secondary'>
          {rows.length
            ? `${rows.length} membres de ${structureName} · ${withOrcid} avec ORCID (CV complété par les sources ouvertes), ${rows.length - withOrcid} sans ORCID (CV limité à SoVisu+ et HAL).`
            : `Aucun membre de ${structureName} n'a de CV dans la maquette.`}
        </Typography>
      </Box>
      {rows.length > 0 && (
        <TableContainer>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>{'Nom'}</TableCell>
                <TableCell>{'Fonction'}</TableCell>
                <TableCell align='right'>{'Publications'}</TableCell>
                <TableCell>{'ORCID'}</TableCell>
                <TableCell>{'Dernière publication'}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(({ person, cv }) => (
                <TableRow
                  key={person.uid}
                  hover
                  tabIndex={0}
                  role='link'
                  aria-label={`Voir le CV de ${person.displayName}`}
                  onClick={() => open(person.slug)}
                  onKeyDown={(e) => e.key === 'Enter' && open(person.slug)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell sx={{ fontWeight: 600 }}>{person.displayName}</TableCell>
                  <TableCell>{cv!.position}</TableCell>
                  <TableCell align='right'>{cv!.publications.filter((p) => p.validated).length}</TableCell>
                  <TableCell>
                    {cv!.orcid
                      ? <Chip size='small' color='success' variant='outlined' label='Oui' />
                      : <Chip size='small' color='warning' variant='outlined' label='Non' />}
                  </TableCell>
                  <TableCell>{cv!.publications[0]?.year ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  )
}

export default MembersCvList
