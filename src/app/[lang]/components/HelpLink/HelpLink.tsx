'use client'

import React from 'react'
import * as Lingui from '@lingui/core'
import { t } from '@lingui/core/macro'
import { IconButton, SxProps, Theme, Tooltip } from '@mui/material'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'

const HELP_BASE_URL = (
  process.env.NEXT_PUBLIC_HELP_BASE_URL ?? 'https://sovisuplus-aide.guillaumegodet.workers.dev'
).replace(/\/$/, '')

/**
 * Pages du centre d'aide (dépôt sovisuplus-aide). Une rubrique sans page d'aide n'a pas de sujet ici,
 * donc pas de « ? » : Profil recherche, Profil de recherche 2, Activités, Droits, Chercheurs.
 */
export const HELP_PAGES = {
  dashboard: 'guides/visualiser/lire-le-tableau-de-bord',
  perspective: 'guides/visualiser/changer-de-perspective',
  documents: 'guides/publications/rechercher-filtrer',
  statuses: 'guides/publications/lire-statuts-acces-ouvert-hal',
  merge: 'guides/publications/fusionner-des-doublons',
  update: 'guides/publications/mettre-a-jour-les-publications',
  bibliographic: 'guides/fiche-publication/modifier-les-informations',
  authors: 'guides/fiche-publication/gerer-les-auteurs',
  align: 'guides/fiche-publication/aligner-un-auteur-hal',
  keywords: 'guides/fiche-publication/gerer-les-mots-cles',
  sources: 'donnees/publications-sources-fusion',
  halDeposit: 'guides/hal/deposer-dans-hal',
  structures: 'guides/structures/parcourir-les-structures',
  members: 'guides/structures/voir-les-membres',
  profile: 'guides/mon-profil/lire-mon-profil',
  identifiers: 'guides/mon-profil/verifier-identifiants',
  assistant: 'guides/assistant',
} as const

export type HelpTopic = keyof typeof HELP_PAGES

/** Adresse d'une page d'aide, dans la langue de l'interface. Sans sujet : l'accueil de l'aide. */
export const helpUrl = (topic?: HelpTopic, locale: string = Lingui.i18n.locale) => {
  const prefix = locale === 'en' ? 'en/' : ''
  return `${HELP_BASE_URL}/${prefix}${topic ? `${HELP_PAGES[topic]}/` : ''}`
}

const topicLabel = (topic: HelpTopic): string => {
  const labels: Record<HelpTopic, string> = {
    dashboard: t`help_topic_dashboard`,
    perspective: t`help_topic_perspective`,
    documents: t`help_topic_documents`,
    statuses: t`help_topic_statuses`,
    merge: t`help_topic_merge`,
    update: t`help_topic_update`,
    bibliographic: t`help_topic_bibliographic`,
    authors: t`help_topic_authors`,
    align: t`help_topic_align`,
    keywords: t`help_topic_keywords`,
    sources: t`help_topic_sources`,
    halDeposit: t`help_topic_hal_deposit`,
    structures: t`help_topic_structures`,
    members: t`help_topic_members`,
    profile: t`help_topic_profile`,
    identifiers: t`help_topic_identifiers`,
    assistant: t`help_topic_assistant`,
  }
  return labels[topic]
}

/** Le « ? » qui ouvre la page d'aide d'une fonctionnalité, dans un nouvel onglet. */
const HelpLink: React.FC<{ topic: HelpTopic; sx?: SxProps<Theme> }> = ({ topic, sx }) => {
  const label = `${t`help_link_prefix`} ${topicLabel(topic)}`
  return (
    <Tooltip title={label}>
      <IconButton
        component='a'
        href={helpUrl(topic)}
        target='_blank'
        rel='noopener noreferrer'
        size='small'
        aria-label={label}
        // Dans un en-tête de colonne ou une ligne cliquable, le clic ne doit rien déclencher d'autre.
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        sx={[{ color: 'text.secondary', verticalAlign: 'middle' }, ...(Array.isArray(sx) ? sx : [sx])]}
      >
        <HelpOutlineIcon fontSize='small' />
      </IconButton>
    </Tooltip>
  )
}

export default HelpLink
