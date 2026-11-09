'use client'

import { KpiCardData, KpiCardGrid } from '@/app/[lang]/dashboard/components/charts/KpiCard'
import { StructureRaw } from '../types'

type Props = { structure: StructureRaw }

const signed = (value: number, unit: string) => `${value > 0 ? '+' : ''}${value} ${unit}`

/** Quatre indicateurs, présentés comme ceux du tableau de bord. */
export default function StructureKpis({ structure }: Props) {
  const { membersCount, publicationsCount, oaRate, halRate, halDelta, publicationsDelta } = structure

  const cards: KpiCardData[] = [
    { label: 'Membres', value: membersCount.toLocaleString('fr-FR'), hint: 'permanents et contractuels' },
    {
      label: 'Publications sur 24 mois',
      value: publicationsCount.toLocaleString('fr-FR'),
      hint:
        publicationsDelta == null
          ? undefined
          : publicationsDelta === 0
            ? 'stable sur un an'
            : `${signed(publicationsDelta, '%')} sur un an`,
    },
    { label: 'En accès ouvert', value: oaRate > 0 ? `${oaRate} %` : '—', hint: 'objectif : 60 %' },
    {
      label: 'Dans HAL',
      value: halRate > 0 ? `${halRate} %` : '—',
      hint: halDelta == null ? undefined : halDelta === 0 ? 'stable sur 12 mois' : `${signed(halDelta, 'pts')} sur 12 mois`,
    },
  ]

  return <KpiCardGrid cards={cards} />
}
