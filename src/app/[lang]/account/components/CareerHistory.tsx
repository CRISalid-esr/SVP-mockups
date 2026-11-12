'use client'

import { Fragment, useEffect, useState } from 'react'
import { Box, Button, Chip, Typography } from '@mui/material'
import { CareerEntry, careerOf } from '@/app/[lang]/cv/cvMock'
import { CareerDecisions, loadCareerDecisions, saveCareerDecisions } from '../careerStore'

const period = (entry: CareerEntry) =>
  entry.to === null ? `depuis ${entry.from}` : entry.to && entry.to !== entry.from ? `${entry.from}–${entry.to}` : String(entry.from)

interface CareerHistoryProps {
  slug: string
  isOwn: boolean
}

/**
 * Parcours daté, tel que le graphe CRISalid le connaît (affiliations successives).
 * Une affiliation passée trouvée par le graphe se confirme ici avant d'aller dans le CV.
 */
const CareerHistory = ({ slug, isOwn }: CareerHistoryProps) => {
  const { confirmed, proposals } = careerOf(slug)
  const [decisions, setDecisions] = useState<CareerDecisions | null>(null)
  useEffect(() => setDecisions(loadCareerDecisions(slug)), [slug])
  if (!decisions) return null

  const decide = (id: string, kind: keyof CareerDecisions) => {
    const next = { ...decisions, [kind]: [...decisions[kind], id] }
    setDecisions(next)
    saveCareerDecisions(slug, next)
  }

  const entries = [...confirmed, ...proposals.filter((p) => decisions.confirmed.includes(p.id))]
    .sort((a, b) => (b.from ?? 0) - (a.from ?? 0))
  const pending = proposals.filter((p) => !decisions.confirmed.includes(p.id) && !decisions.dismissed.includes(p.id))

  return (
    <>
      {entries.length === 0 ? (
        <Typography variant='body1' color='text.secondary'>{'Aucune affiliation datée connue.'}</Typography>
      ) : (
        <Box component='dl' sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '120px 1fr' }, columnGap: 2, rowGap: 1, m: 0 }}>
          {entries.map((entry) => (
            <Fragment key={entry.id}>
              <Typography component='dt' variant='body1' color='text.secondary' sx={{ fontVariantNumeric: 'tabular-nums' }}>{period(entry)}</Typography>
              <Typography component='dd' variant='body1' sx={{ m: 0 }}>
                <Box component='span' sx={{ fontWeight: 600 }}>{entry.title}</Box>
                {entry.place && `, ${entry.place}`}
              </Typography>
            </Fragment>
          ))}
        </Box>
      )}

      {pending.map((proposal) => (
        <Box
          key={proposal.id}
          role='group'
          aria-label={`Affiliation proposée : ${proposal.title}`}
          sx={{ mt: 2, p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}
        >
          <Box sx={{ flex: '1 1 260px', minWidth: 0 }}>
            <Chip size='small' label='Trouvée dans le graphe CRISalid' sx={{ mb: 0.5 }} />
            <Typography variant='body1'>
              <Box component='span' sx={{ fontWeight: 600 }}>{proposal.title}</Box>
              {proposal.place && `, ${proposal.place}`}
              {` (${period(proposal)})`}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              {isOwn ? 'Est-ce bien vous ? Une fois confirmée, elle apparaît dans votre CV.' : 'Une fois confirmée, elle apparaît dans le CV.'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={() => decide(proposal.id, 'dismissed')}>{isOwn ? 'Ce n’est pas moi' : 'Écarter'}</Button>
            <Button variant='outlined' onClick={() => decide(proposal.id, 'confirmed')}>{'Confirmer'}</Button>
          </Box>
        </Box>
      ))}
    </>
  )
}

export default CareerHistory
