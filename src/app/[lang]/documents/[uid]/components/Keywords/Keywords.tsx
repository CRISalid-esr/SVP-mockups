import { Trans } from '@lingui/react'
import { Box, Checkbox, IconButton, Link, Tooltip, Typography } from '@mui/material'
import useStore from '@/stores/global_store'
import { useEffect, useMemo, useState } from 'react'
import { ConceptGroup } from '@/types/ConceptGroup'
import ConceptChip from '@/app/[lang]/documents/[uid]/components/Keywords/ConceptChip'
import * as Lingui from '@lingui/core'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'
import { Concept } from '@/types/Concept'
import KeywordSearchAutocomplete from '@/app/[lang]/documents/[uid]/components/Keywords/components/KeywordSearchAutocomplete'
import { Vocab } from '@/types/Vocab'
import { useSession } from 'next-auth/react'
import { abilityFromAuthzContext } from '@/app/auth/ability'
import { PermissionAction } from '@/types/Permission'
import { Can } from '@casl/react'
import { VOCABS } from '@/lib/services/Vocabs'
import Image from 'next/image'
import { HelpOutline } from '@mui/icons-material'
import DocumentSection from '../DocumentSection'
import VocabularyKeywordPicker, { VocabLogo } from './VocabularyKeywordPicker'
import { AddedKeyword, KeywordEdits, loadKeywordEdits, saveKeywordEdits, vocabularyOf } from './mockVocabularies'
import { Chip } from '@mui/material'

const IS_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

const Keywords = () => {
  const { data: session } = useSession()

  const ability = useMemo(
    () => abilityFromAuthzContext(session?.user.authz),
    [session?.user?.authz],
  )
  const [selectedVocabs, setSelectedVocabs] =
    useState<Record<string, boolean>>()

  const { selectedDocument = null, error = null } = useStore(
    (state) => state.document,
  )
  const removeConcepts = useStore((state) => state.document.removeConcepts)

  const lang = Lingui.i18n.locale
  const uid = selectedDocument?.uid ?? ''

  // Maquette : les ajouts et retraits restent dans le navigateur, sans appel à l'API.
  const [edits, setEdits] = useState<KeywordEdits>({ added: [], removed: [] })
  useEffect(() => {
    if (IS_MOCK && uid) setEdits(loadKeywordEdits(uid))
  }, [uid])
  const updateEdits = (next: KeywordEdits) => {
    setEdits(next)
    saveKeywordEdits(uid, next)
  }

  const allGroups = useMemo(
    () => ConceptGroup.fromConcepts(selectedDocument?.subjects ?? []),
    [selectedDocument?.subjects],
  )
  const groups = allGroups.filter((group) => !edits.removed.includes(group.uid as string))

  const onRemoveConcepts = async (concepts: Concept[]) => {
    if (!selectedDocument) return
    if (IS_MOCK) {
      const group = allGroups.find((g) => concepts.some((c) => g.concepts?.includes(c)))
      const ids = group ? [group.uid as string] : concepts.map((c) => c.uid as string)
      updateEdits({ ...edits, removed: [...edits.removed, ...ids] })
      return
    }
    await removeConcepts(concepts.map((c) => c.uid as string))
  }

  const addKeyword = (keyword: AddedKeyword) =>
    updateEdits({ ...edits, added: [...edits.added, keyword] })
  const removeAdded = (id: string) =>
    updateEdits({ ...edits, added: edits.added.filter((keyword) => keyword.id !== id) })

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedVocabs({
      ...selectedVocabs,
      [e.target.name]: e.target.checked,
    })
  }

  useEffect(() => {
    // Implement a centralized error handling
    if (error) {
      console.error('Error in Keywords component:', error)
    }
  }, [error])

  const vocabs = Vocab.getVocabs().filter((vocab) =>
    Object.keys(VOCABS).includes(vocab.toUpperCase()),
  )

  return (
    <Can
      I={PermissionAction.update}
      a={selectedDocument}
      field='subjects'
      ability={ability}
      passThrough
    >
      {(canUpdate: boolean) => {
        const allowed = canUpdate || IS_MOCK
        return (
        <DocumentSection
          title='Mots-clés'
          subtitle='Mots-clés libres ou issus de vocabulaires contrôlés'
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {groups.length + edits.added.length > 0 ? (
              [...groups.map((group) => (
                <ConceptChip
                  key={group.uid as string}
                  group={group}
                  language={lang as ExtendedLanguageCode}
                  removable={allowed}
                  onRemoveConcepts={onRemoveConcepts}
                />
              )),
              ...edits.added.map((keyword) => {
                const vocab = keyword.vocab ? vocabularyOf(keyword.vocab) : undefined
                return (
                  <Chip
                    key={keyword.id}
                    label={keyword.label}
                    variant='outlined'
                    title={vocab ? `${vocab.name}${keyword.notation ? ' · ' + keyword.notation : ''}` : 'Mot-clé libre'}
                    avatar={vocab ? <Box sx={{ display: 'grid', placeItems: 'center', bgcolor: 'transparent !important' }}><VocabLogo vocab={vocab} size={18} /></Box> : undefined}
                    onDelete={allowed ? () => removeAdded(keyword.id) : undefined}
                  />
                )
              })]
            ) : (
              <Typography color='text.secondary'>
                <Trans id='document_details_page_keywords_tab_card_empty_content' />
              </Typography>
            )}
          </Box>

          {allowed && IS_MOCK && (
            <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <VocabularyKeywordPicker
                existingLabels={[
                  ...groups.flatMap((group) => (group.concepts ?? []).flatMap((c) => (c.prefLabels ?? []).map((l) => l.value.toLowerCase()))),
                  ...edits.added.map((keyword) => keyword.label.toLowerCase()),
                ]}
                onAdd={addKeyword}
              />
            </Box>
          )}

          {allowed && !IS_MOCK && (
            <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider', display: 'grid', gap: 2 }}>
              <Box>
                <Typography variant='subtitle1' component='h3' fontWeight={600}>
                  Ajouter des mots-clés
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  <Trans id='document_details_page_keywords_search_field_title' />
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gap: 1,
                  gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
                }}
              >
                {vocabs.map((vocab) => {
                  const meta = VOCABS[vocab.toUpperCase()]
                  const checked = !!selectedVocabs?.[vocab]
                  return (
                    <Box
                      key={vocab + '-checkbox'}
                      component='label'
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        pl: 0.5,
                        pr: 1,
                        py: 0.5,
                        border: 1,
                        borderColor: checked ? 'primary.main' : 'divider',
                        bgcolor: checked ? 'navActive' : 'transparent',
                        borderRadius: 2,
                        cursor: 'pointer',
                      }}
                    >
                      <Checkbox size='small' onChange={handleCheckboxChange} name={vocab} checked={checked} />
                      <Image src={meta?.icon || ''} alt='' width={20} height={20} />
                      <Link
                        href={meta?.url || ''}
                        target='_blank'
                        rel='noopener noreferrer'
                        underline='hover'
                        color='text.primary'
                        onClick={(event) => event.stopPropagation()}
                        sx={{ fontWeight: 500 }}
                      >
                        {meta?.name || ''}
                      </Link>
                      <Tooltip title={meta?.org || ''}>
                        <IconButton size='small' sx={{ ml: 'auto' }} aria-label={`À propos de ${meta?.name ?? vocab}`}>
                          <HelpOutline fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )
                })}
              </Box>
              <KeywordSearchAutocomplete
                selectedVocabs={
                  selectedVocabs
                    ? Object.keys(selectedVocabs).filter((key) => selectedVocabs[key])
                    : []
                }
              />
            </Box>
          )}
        </DocumentSection>
        )
      }}
    </Can>
  )
}

export default Keywords
