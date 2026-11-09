import { t } from '@lingui/core/macro'
import useStore from '@/stores/global_store'
import { Box, ButtonBase, Typography } from '@mui/material'
import { ChevronRight, Label, People } from '@mui/icons-material'
import * as Lingui from '@lingui/core'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { ReactNode, useEffect, useMemo, useState } from 'react'

import { ConceptGroup } from '@/types/ConceptGroup'
import PublicationDate from './PublicationDate'
import Sources from './Sources'
import Titles from './Titles'
import Type from './Type'
import Journal from './Journal'
import Abstracts from './Abstracts'
import Row from './Row'
import Identifiers from '@/app/[lang]/documents/[uid]/components/BibliographicInformation/Identifiers'
import DocumentSection from '../DocumentSection'
import { getDomainsScenario, loadDomainsState } from '../Domains/domainsMock'

export type DocumentFieldKey =
  | 'titles'
  | 'type'
  | 'journal'
  | 'identifiers'
  | 'authors'
  | 'date'
  | 'abstracts'
  | 'sources'

export type DocumentLocalizableFieldKey = 'titles' | 'abstracts'

export interface DocumentField {
  value: DocumentFieldKey
  title: string
  noContentAvailableMessage?: string
  component: React.ComponentType<{ content: string }> | null
  hasLanguageSelector?: boolean
}

const plural = (count: number, singular: string, pluralForm = `${singular}s`) =>
  `${count} ${count > 1 ? pluralForm : singular}`

/** Raccourci vers un onglet où l'on modifie une partie de la notice. */
const EditTile = ({
  icon,
  title,
  summary,
  detail,
  action,
  onClick,
}: {
  icon: ReactNode
  title: string
  summary: string
  detail: string
  action: string
  onClick: () => void
}) => (
  <ButtonBase
    onClick={onClick}
    aria-label={`${action} : ${summary}`}
    sx={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      gap: 1.5,
      p: 2,
      textAlign: 'left',
      border: 1,
      borderColor: 'divider',
      borderRadius: 3,
      transition: 'border-color 120ms, background-color 120ms',
      '&:hover': { borderColor: 'primary.main', bgcolor: 'navHover' },
      '&:focus-visible': { outline: 2, outlineColor: 'primary.main', outlineOffset: 2 },
    }}
  >
    <Box
      aria-hidden
      sx={{
        display: 'flex',
        p: 1,
        borderRadius: 2,
        bgcolor: 'navActive',
        color: 'primary.main',
      }}
    >
      {icon}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant='body2' color='text.secondary' sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography sx={{ fontWeight: 600 }}>{summary}</Typography>
      <Typography variant='body2' color='text.secondary'>
        {detail}
      </Typography>
      <Typography
        component='span'
        variant='body2'
        sx={{ display: 'inline-flex', alignItems: 'center', mt: 1, color: 'primary.main', fontWeight: 600 }}
      >
        {action}
        <ChevronRight fontSize='small' />
      </Typography>
    </Box>
  </ButtonBase>
)

const BibliographicInformation = () => {
  const { selectedDocument = null } = useStore((state) => state.document)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { uid } = useParams<{ uid: string }>()
  const lang = Lingui.i18n.locale

  const goToTab = (tab: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    params.set('tab', tab)
    router.push(`/${lang}/documents/${uid}?${params.toString()}`)
  }

  const documentUid = selectedDocument?.uid ?? ''
  const [domainCount, setDomainCount] = useState(0)
  useEffect(() => {
    if (!documentUid) return
    const scenario = getDomainsScenario(documentUid)
    const state = loadDomainsState(documentUid)
    setDomainCount(
      scenario.openalex.length +
        state.manual.length +
        scenario.halHarvested.length +
        state.attributedHal.length,
    )
  }, [documentUid])

  const keywordCount = useMemo(
    () => ConceptGroup.fromConcepts(selectedDocument?.subjects ?? []).length,
    [selectedDocument?.subjects],
  )

  const documentFields: Record<Exclude<DocumentFieldKey, 'authors'>, DocumentField> = {
    titles: {
      value: 'titles',
      title: t`document_details_page_titles_row_label`,
      noContentAvailableMessage: t`document_details_page_no_title_available`,
      component: selectedDocument?.titles ? Titles : null,
      hasLanguageSelector: true,
    },
    type: {
      value: 'type',
      title: t`document_details_page_type_row_label`,
      component: Type,
    },
    date: {
      value: 'date',
      title: t`document_details_page_publication_date_row_label`,
      component: PublicationDate,
    },
    journal: {
      value: 'journal',
      title: 'Paru dans',
      component: selectedDocument?.journal?.title ? Journal : null,
    },
    abstracts: {
      value: 'abstracts',
      title: t`document_details_page_abstracts_row_label`,
      noContentAvailableMessage: t`document_details_page_no_abstract_available`,
      component: selectedDocument?.abstracts ? Abstracts : null,
      hasLanguageSelector: true,
    },
    identifiers: {
      value: 'identifiers',
      title: t`document_details_page_identifiers_row_label`,
      component: Identifiers,
    },
    sources: {
      value: 'sources',
      title: t`document_details_page_sources_row_label`,
      component: Sources,
    },
  }

  const fieldOrder: Exclude<DocumentFieldKey, 'authors'>[] = [
    'titles',
    'type',
    'date',
    'journal',
    'abstracts',
    'identifiers',
    'sources',
  ]

  if (!selectedDocument) return null

  const authorCount = selectedDocument.contributions?.length ?? 0

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <DocumentSection
        title='Récapitulatif'
        subtitle='Les informations de la notice, telles que SoVisu+ les réunit à partir des sources'
      >
        <Box component='dl' sx={{ m: 0 }}>
          {fieldOrder.map((fieldKey) => {
            const field = documentFields[fieldKey]
            return field.component ? <Row key={fieldKey} field={field} /> : null
          })}
        </Box>
      </DocumentSection>

      <DocumentSection
        title='À compléter dans les autres onglets'
        subtitle='Les auteurs et les thématiques font aussi partie de la notice.'
      >
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
          }}
        >
          <EditTile
            icon={<People fontSize='small' />}
            title={t`document_details_authors_tab`}
            summary={plural(authorCount, 'auteur')}
            detail='Identifiants HAL, affiliations, rôles et rangs'
            action='Modifier les auteurs'
            onClick={() => goToTab('authors')}
          />
          <EditTile
            icon={<Label fontSize='small' />}
            title='Thématiques'
            summary={`${plural(keywordCount, 'mot-clé', 'mots-clés')} · ${plural(domainCount, 'domaine')}`}
            detail='Mots-clés, classification OpenAlex, domaines HAL'
            action='Modifier les thématiques'
            onClick={() => goToTab('themes')}
          />
        </Box>
      </DocumentSection>
    </Box>
  )
}

export default BibliographicInformation
