'use client'

import { useEffect, useState } from 'react'
import * as Lingui from '@lingui/core'
import { Box, Typography } from '@mui/material'
import DocumentHeader from '@/app/[lang]/documents/components/DocumentHeader'
import { usePerspectiveScope } from '@/app/[lang]/components/Perspective/usePerspectiveScope'
import useStore from '@/stores/global_store'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'
import { loadActivities } from '@/app/[lang]/research-activities/activitiesStore'
import { loadProfile } from '@/app/[lang]/expertise-v2/storage'
import { OwnDossier, getPersonCv } from './cvMock'
import MembersCvList from './components/MembersCvList'
import PersonCvView from './components/PersonCvView'

/**
 * Rubrique « Mon CV » (plan « Mon CV », § 5.4 S1). Dans la cible, l'entrée de menu
 * ouvre le service de CV de l'établissement dans un nouvel onglet ; la maquette montre
 * le CV directement, construit à partir des données des personnes fictives.
 */
const CvPage = () => {
  const lang = Lingui.i18n.locale as ExtendedLanguageCode
  const scope = usePerspectiveScope()
  const { connectedUser, currentPerspective } = useStore((state) => state.user)

  const perspectiveName = currentPerspective?.getDisplayName(lang) || ''

  // Son propre CV reprend ce qui est saisi dans SoVisu+ (lu après le montage : localStorage).
  const [dossier, setDossier] = useState<OwnDossier | null>(null)
  useEffect(() => setDossier({ activities: loadActivities(), profile: loadProfile() }), [])

  if (scope === 'structure' && currentPerspective) {
    return (
      <Box>
        <DocumentHeader perspectiveName={perspectiveName} pageName='CV' />
        <MembersCvList structureUid={currentPerspective.uid} structureName={perspectiveName} lang={lang} />
      </Box>
    )
  }

  const isOwn = scope === 'own'
  const uid = isOwn ? connectedUser?.person?.uid : currentPerspective?.uid
  if (!uid) return null
  if (isOwn && !dossier) return null
  const cv = getPersonCv(uid, lang, isOwn ? dossier ?? undefined : undefined)

  return (
    <Box>
      <DocumentHeader perspectiveName={perspectiveName} pageName={isOwn ? 'Mon CV' : 'CV'} />
      {cv ? (
        <PersonCvView key={cv.uid} cv={cv} isOwn={isOwn} lang={lang} />
      ) : (
        <Typography color='text.secondary'>{'Pas de CV disponible pour cette personne dans la maquette.'}</Typography>
      )}
    </Box>
  )
}

export default CvPage
