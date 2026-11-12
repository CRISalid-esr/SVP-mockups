'use client'

import * as Lingui from '@lingui/core'
import { Box, Typography } from '@mui/material'
import DocumentHeader from '@/app/[lang]/documents/components/DocumentHeader'
import { usePerspectiveScope } from '@/app/[lang]/components/Perspective/usePerspectiveScope'
import useStore from '@/stores/global_store'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'
import { getPersonCv } from './cvMock'
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
  const cv = getPersonCv(uid, lang)

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
