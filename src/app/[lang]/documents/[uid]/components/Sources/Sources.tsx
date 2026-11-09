import { publicPath } from '@/utils/publicPath'
import useStore from '@/stores/global_store'
import { BibliographicPlatformMetadata } from '@/types/BibliographicPlatform'
import { DocumentRecord } from '@/types/DocumentRecord'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'
import { getLocalizedValue } from '@/utils/getLocalizedValue'
import * as Lingui from '@lingui/core'
import { useLingui } from '@lingui/react'
import { CallSplit, MoreHoriz, OpenInNew, ReportGmailerrorred } from '@mui/icons-material'
import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  Typography,
} from '@mui/material'
import Image from 'next/image'
import { ReactNode, useState } from 'react'
import { visuallyHidden } from '@mui/utils'
import dayjs from 'dayjs'
import { LocaleDateFormats } from '@/types/LocaleDateFormats'
import { SourceRecordType } from '@prisma/client'
import { SourceRecordTypeLabels } from '@/app/[lang]/documents/components/SourceRecordTypeLabels'
import { SourceRecordTypeService } from '@/lib/services/SourceRecordTypeService'
import { LocRelator } from '@/types/LocRelator'
import DocumentSection from '../DocumentSection'
import CompareTable, { CompareColumn, CompareRow, CompareStatus } from '../CompareTable'

type FieldKey = 'title' | 'date' | 'type' | 'journal' | 'authors'

const FIELD_LABELS: Record<FieldKey, string> = {
  title: 'Titre',
  date: 'Date de publication',
  type: 'Type',
  journal: 'Paru dans',
  authors: 'Auteurs',
}

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ')

const SourceName = ({ record }: { record: DocumentRecord }) => {
  const metadata = BibliographicPlatformMetadata[record.platform]
  const name = metadata?.name || record.platform
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
      <Image src={metadata?.icon || publicPath('/icons/default.png')} alt='' width={24} height={24} />
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{name}</Typography>
        <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.8125rem' }} noWrap>
          {record.sourceIdentifier}
        </Typography>
      </Box>
    </Box>
  )
}

const Sources = () => {
  const { selectedDocument = null } = useStore((state) => state.document)
  const { _ } = useLingui()
  const lang = Lingui.i18n.locale as ExtendedLanguageCode
  const supportedLocales = process.env.NEXT_PUBLIC_SUPPORTED_LOCALES?.split(',')
  const [menu, setMenu] = useState<{ anchor: HTMLElement; record: DocumentRecord } | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  if (!selectedDocument) return null
  const records = selectedDocument.records ?? []

  const sourceName = (record: DocumentRecord) =>
    BibliographicPlatformMetadata[record.platform]?.name || record.platform

  const valueOf = (record: DocumentRecord, field: FieldKey): string => {
    switch (field) {
      case 'title':
        return record.titles.length
          ? getLocalizedValue(record.titles, lang, supportedLocales, '').value
          : ''
      case 'date': {
        if (!record.publicationDate) return ''
        const date = dayjs(record.publicationDate)
        return date.isValid() ? date.format(LocaleDateFormats[lang] || 'DD/MM/YYYY') : String(record.publicationDate)
      }
      case 'type': {
        const type = SourceRecordTypeService.getPreciseType(record.documentTypes) ?? SourceRecordType.Unknown
        return _(SourceRecordTypeLabels[type])
      }
      case 'journal': {
        const title = record.journal?.titles?.[0]
        if (!title) return ''
        return record.journal?.publisher ? `${title} (${record.journal.publisher})` : title
      }
      case 'authors': {
        const authors = record.contributions.filter((c) => c.role == LocRelator.AUTHOR)
        return authors.length ? `${authors.length} auteur${authors.length > 1 ? 's' : ''}` : ''
      }
    }
  }

  // ─── Liste des sources ──────────────────────────────────────────────────────

  const listColumns: CompareColumn[] = [
    { key: 'source', header: 'Source', width: 200 },
    { key: 'title', header: 'Titre' },
    { key: 'date', header: 'Date', width: 120 },
    { key: 'type', header: 'Type', width: 140 },
    { key: 'actions', header: <Box component='span' sx={visuallyHidden}>Actions</Box>, width: 56, align: 'right' },
  ]
  const listRows: CompareRow[] = records.map((record) => ({
    key: record.uid,
    cells: {
      source: <SourceName record={record} />,
      title: valueOf(record, 'title') || null,
      date: valueOf(record, 'date') || null,
      type: valueOf(record, 'type') || null,
      actions: (
        <IconButton
          size='small'
          aria-label={`Actions sur la source ${sourceName(record)}`}
          onClick={(event) => setMenu({ anchor: event.currentTarget, record })}
        >
          <MoreHoriz fontSize='small' />
        </IconButton>
      ),
    },
  }))

  // ─── Comparaison champ par champ ────────────────────────────────────────────

  const fields: FieldKey[] = ['title', 'date', 'type', 'journal', 'authors']
  const comparison = fields
    .map((field) => {
      const values = records.map((record) => valueOf(record, field))
      const present = values.filter(Boolean)
      if (present.length === 0) return null
      const distinct = new Set(present.map(normalize))
      const status: 'same' | 'differs' | 'single' =
        present.length < 2 ? 'single' : distinct.size > 1 ? 'differs' : 'same'
      return { field, values, status }
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)
    // Les différences en tête : c'est ce qu'on vient vérifier.
    .sort((a, b) => Number(b.status === 'differs') - Number(a.status === 'differs'))

  const differences = comparison.filter((row) => row.status === 'differs').length

  const compareColumns: CompareColumn[] = [
    { key: 'field', header: 'Information', width: 160 },
    ...records.map((record) => ({ key: record.uid, header: sourceName(record) as ReactNode })),
    { key: 'status', header: 'État', width: 140 },
  ]
  const compareRows: CompareRow[] = comparison.map(({ field, values, status }) => ({
    key: field,
    cells: {
      field: <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{FIELD_LABELS[field]}</Typography>,
      ...Object.fromEntries(records.map((record, index) => [record.uid, values[index] || null])),
      status: <CompareStatus status={status} />,
    },
  }))

  const runAction = (label: string) => {
    if (menu) setNotice(`${label} : ${sourceName(menu.record)} (simulation)`)
    setMenu(null)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <DocumentSection
        title='Sources de la notice'
        subtitle={
          records.length > 1
            ? `${records.length} notices, venues de plateformes différentes, ont été réunies pour former cette publication.`
            : records.length === 1
              ? 'Cette publication provient d’une seule plateforme.'
              : 'Aucune source pour cette publication.'
        }
      >
        {records.length > 0 && <CompareTable ariaLabel='Sources de la notice' columns={listColumns} rows={listRows} />}
      </DocumentSection>

      {records.length > 1 && (
        <DocumentSection
          title='Comparer les sources'
          subtitle={
            differences > 0
              ? `${differences} information${differences > 1 ? 's' : ''} diffère${differences > 1 ? 'nt' : ''} d’une source à l’autre.`
              : 'Les sources s’accordent sur toutes les informations comparées.'
          }
        >
          <CompareTable ariaLabel='Comparaison des sources' columns={compareColumns} rows={compareRows} />
        </DocumentSection>
      )}

      <Menu anchorEl={menu?.anchor} open={Boolean(menu)} onClose={() => setMenu(null)}>
        {menu?.record.url && (
          <MenuItem component='a' href={menu.record.url} target='_blank' rel='noopener noreferrer' onClick={() => setMenu(null)}>
            <ListItemIcon><OpenInNew fontSize='small' /></ListItemIcon>
            <ListItemText>{`Ouvrir dans ${sourceName(menu.record)}`}</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => runAction('Séparée de cette publication')}>
          <ListItemIcon><CallSplit fontSize='small' /></ListItemIcon>
          <ListItemText>Séparer de cette publication</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => runAction('Signalée comme erronée')}>
          <ListItemIcon><ReportGmailerrorred fontSize='small' /></ListItemIcon>
          <ListItemText>Signaler comme erronée</ListItemText>
        </MenuItem>
      </Menu>

      <Snackbar open={Boolean(notice)} autoHideDuration={4000} onClose={() => setNotice(null)} message={notice} />
    </Box>
  )
}

export default Sources
