'use client'

import { useEffect, useState } from 'react'
import { Box, Button, Card, Chip, Typography } from '@mui/material'
import { Activity } from '@/types/Activity'
import { ACTIVITY_TYPES } from './activityTypes'

/**
 * Activités que le graphe CRISalid connaît déjà (plan CV, S4) : proposées à la
 * personne, qui les ajoute ou les écarte, comme pour les publications.
 * Données de maquette ; le rôle de directeur ou de membre de jury venant de
 * theses.fr doit encore être confirmé jusqu'au graphe (plan, S4).
 */
export const GRAPH_PROPOSALS: Activity[] = [
  {
    id: 'graph-these-kone',
    type: 'encadrement',
    title: 'Thèse de Yanis Koné',
    startDate: '2019-10-01',
    endDate: '2022-12-09',
    description: 'Thèse soutenue à Nantes Université le 9 décembre 2022.',
    url: 'https://theses.fr',
    specificData: { student: 'Yanis Koné', level: 'Doctorat', role: 'Co-direction ou co-encadrement', status: 'Terminé', thesisTitle: 'Apprentissage fédéré sur objets connectés' },
    source: { label: 'theses.fr' },
  },
  {
    id: 'graph-jury-roy',
    type: 'responsabilite',
    title: 'Membre du jury de la thèse de Camille Roy',
    startDate: '2024-11-28',
    endDate: '2024-11-28',
    description: 'Thèse soutenue à l’IMT Atlantique sur la compression de réseaux de neurones.',
    url: 'https://theses.fr',
    specificData: { category: 'Jury (thèse, HDR, recrutement)', role: 'Examinateur', scope: 'National', body: 'IMT Atlantique' },
    source: { label: 'theses.fr' },
  },
  {
    id: 'graph-anr-graphedge',
    type: 'projet',
    title: 'ANR JCJC GRAPHEDGE',
    startDate: '2019-10-01',
    endDate: '2023-09-30',
    description: 'Projet jeunes chercheuses et jeunes chercheurs : apprentissage sur graphes pour l’informatique en périphérie.',
    url: 'https://anr.fr',
    specificData: { role: 'Coordinateur', funder: 'ANR', awardId: 'ANR-19-CE25-0007' },
    source: { label: 'ANR, projets financés' },
  },
]

const STORAGE_KEY = 'activity-proposals-v1'

const readHandled = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

const formatYears = (activity: Activity) => {
  const from = activity.startDate.slice(0, 4)
  const to = activity.endDate?.slice(0, 4)
  return to && to !== from ? `${from}–${to}` : from
}

interface GraphProposalsProps {
  onAccept: (activity: Activity) => void
}

/** Bandeau des propositions, au-dessus de la liste. Disparaît quand tout est traité. */
const GraphProposals = ({ onAccept }: GraphProposalsProps) => {
  const [handled, setHandled] = useState<string[] | null>(null)
  useEffect(() => setHandled(readHandled()), [])

  if (!handled) return null
  const pending = GRAPH_PROPOSALS.filter((p) => !handled.includes(p.id))
  if (pending.length === 0) return null

  const markHandled = (id: string) => {
    const next = [...handled, id]
    setHandled(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* stockage indisponible */
    }
  }

  return (
    <Card component='section' aria-labelledby='graph-proposals-title' sx={{ mb: 4, p: { xs: 2, sm: 3 } }}>
      <Typography variant='h6' component='h2' id='graph-proposals-title'>
        {pending.length > 1 ? `${pending.length} activités trouvées pour vous` : '1 activité trouvée pour vous'}
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
        {'Ces activités viennent de sources que SoVisu+ moissonne. Ajoutez celles qui sont justes : vous pourrez les compléter ensuite.'}
      </Typography>
      <Box component='ul' sx={{ m: 0, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {pending.map((proposal) => {
          const style = ACTIVITY_TYPES[proposal.type]
          const details = Object.values(proposal.specificData ?? {}).slice(0, 2).join(' · ')
          return (
            <Box
              component='li'
              key={proposal.id}
              sx={{
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2,
                p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2,
              }}
            >
              <Box sx={{ flex: '1 1 320px', minWidth: 0 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Chip size='small' label={style.label} sx={{ bgcolor: style.tint, color: style.ink, fontWeight: 600 }} />
                  <Typography variant='caption' color='text.secondary'>{`Source : ${proposal.source?.label}`}</Typography>
                </Box>
                <Typography variant='subtitle1' component='h3' sx={{ fontWeight: 600 }}>{proposal.title}</Typography>
                <Typography variant='body2' color='text.secondary'>{[formatYears(proposal), details].filter(Boolean).join(' · ')}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button onClick={() => markHandled(proposal.id)}>{'Écarter'}</Button>
                <Button
                  variant='outlined'
                  aria-label={`Ajouter : ${proposal.title}`}
                  onClick={() => {
                    markHandled(proposal.id)
                    onAccept({ ...proposal, id: `${proposal.id}-${Date.now().toString(36)}` })
                  }}
                >
                  {'Ajouter'}
                </Button>
              </Box>
            </Box>
          )
        })}
      </Box>
    </Card>
  )
}

export default GraphProposals
