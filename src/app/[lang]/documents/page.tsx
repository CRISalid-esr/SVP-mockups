'use client'
import { t } from '@lingui/core/macro'
import './page.css'
import { TabFilter } from '@/components/TabFilter'
import useStore from '@/stores/global_store'
import {
  BibliographicPlatform,
  BibliographicPlatformMetadata,
} from '@/types/BibliographicPlatform'
import { Contribution } from '@/types/Contribution'
import {
  Document,
  DocumentState,
  DocumentType,
  isDocument,
} from '@/types/Document'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'
import { Literal } from '@/types/Literal'
import { getLocalizedValue } from '@/utils/getLocalizedValue'
import * as Lingui from '@lingui/core'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Link,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import {
  MRT_Column,
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MRT_ShowHideColumnsButton,
  MRT_SortingState,
} from 'material-react-table'
import Image from 'next/image'
import { publicPath } from '@/utils/publicPath'
import { useRouter, useSearchParams } from 'next/navigation' // Import useRouter
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import Highlighter from 'react-highlight-words'
import DocumentHeader from './components/DocumentHeader'
import { HelpLink } from '@/app/[lang]/components/HelpLink'
import HalStatusCell from './components/HalStatusCell'
import HalStatusCellBadge, {
  HalStatusCellType,
} from './components/HalStatusCellBadge'
import { DocumentTypeIcons } from './components/DocumentTypeIcons'
import { DocumentTypeLabels } from './components/DocumentTypeLabels'
import SyncIcon from '@mui/icons-material/Sync'
import DocumentSyncDialog from '@/app/[lang]/documents/components/documentsSyncModal/DocumentSyncDialog'
import { Trans, useLingui } from '@lingui/react'
import { useSession } from 'next-auth/react'
import { abilityFromAuthzContext } from '@/app/auth/ability'
import { PermissionAction } from '@/types/Permission'
import { Can } from '@casl/react'
import { DocumentTypeService } from '@/lib/services/DocumentTypeService'
import OAStatusCell from '@/app/[lang]/documents/components/OAStatusCell'
import {
  DocumentTable,
  normalizeDateFilters,
  readInitialColumnFilters,
  readInitialGlobalFilter,
  readInitialPagination,
  readInitialSorting,
} from '@/app/[lang]/documents/components/DocumentTable'
import { OAStatus } from '@prisma/client'
import OAStatusCellBadge from '@/app/[lang]/documents/components/OAStatusCellBadge'
import ListFilterBar, { FilterDefinition } from '@/components/ListTable/ListFilterBar'
import { listTableProps, listTitleSx } from '@/components/ListTable/listTableProps'
import HalNextActionCell from '@/app/[lang]/documents/components/HalNextActionCell'
import { FeaturedToggle } from '@/app/[lang]/documents/featured'

dayjs.extend(utc)

const DEFAULT_SORTING = [
  {
    id: 'date',
    desc: true,
  },
]
const DEFAULT_PAGINATION = {
  pageIndex: 0,
  pageSize: 10,
}
// Le reste reste accessible par le choix des colonnes.
const DEFAULT_COLUMN_VISIBILITY = { type: false, publishedIn: false, source: false }

const DocumentsPage = () => {
  const { data: session } = useSession()
  const { _ } = useLingui()
  const ability = useMemo(
    () => abilityFromAuthzContext(session?.user.authz),
    [session?.user?.authz],
  )

  const [pagination, setPagination] = useState(readInitialPagination)

  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    readInitialColumnFilters,
  )
  const [globalFilter, setGlobalFilter] = useState(readInitialGlobalFilter)

  const [sorting, setSorting] = useState<MRT_SortingState>(readInitialSorting)

  const [openSynchronizeModal, setOpenSynchronizeModal] =
    useState<boolean>(false)
  const [triggerReloadList, setTriggerReloadList] = useState<boolean>(false)
  const { currentPerspective, ownPerspective } = useStore((state) => state.user)
  const lang = Lingui.i18n.locale as ExtendedLanguageCode
  const supportedLocales = process.env.NEXT_PUBLIC_SUPPORTED_LOCALES?.split(',')

  const harvestings = useStore((state) => state.harvesting.harvestings)
  const currentPerspectiveHarvesting =
    harvestings[currentPerspective?.uid || '']
  const isAnyHarvestingRunning = Object.values(
    currentPerspectiveHarvesting || {},
  ).some((h) => h?.status === 'running')

  const theme = useTheme()
  const router = useRouter()
  const searchParams = useSearchParams()

  const navigateToDetailsPage = useCallback(
    (documentUid: string, tab = 'bibliographic_information') => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', tab)
      router.push(`/${lang}/documents/${documentUid}?${params.toString()}`)
    },
    [lang, router, searchParams],
  )

  const filterDefinitions = useMemo<FilterDefinition[]>(() => {
    const acronyms = currentPerspective?.membershipAcronyms || []
    return [
      {
        id: 'type',
        label: t`documents_page_type_column`,
        options: DocumentTypeService.toMenuTree()
          .filter((node) => node.value !== DocumentType.Document)
          .map(({ value, depth }) => ({
            value,
            depth,
            label: (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {DocumentTypeIcons[value]}
                {_(DocumentTypeLabels[value])}
              </Box>
            ),
          })),
      },
      {
        id: 'halStatus',
        label: t`documents_page_halStatus_column`,
        options: [
          {
            value: 'in_collection',
            label: <HalStatusCellBadge type={HalStatusCellType.InCollection} isSingleLine />,
          },
          {
            value: 'out_of_collection',
            label: (
              <HalStatusCellBadge
                type={HalStatusCellType.OutOfCollection}
                acronyms={acronyms}
                isSingleLine
              />
            ),
          },
          {
            value: 'pending_moderation',
            label: <HalStatusCellBadge type={HalStatusCellType.PendingModeration} isSingleLine />,
          },
          {
            value: 'outside_hal',
            label: <HalStatusCellBadge type={HalStatusCellType.OutsideHal} isSingleLine />,
          },
        ],
      },
      {
        id: 'oaStatus',
        label: t`documents_page_oaStatus_column`,
        options: [...Object.values(OAStatus), 'UNKNOWN' as const].map((value) => ({
          value,
          label: <OAStatusCellBadge type={value} />,
        })),
      },
      {
        id: 'source',
        label: t`documents_page_source_column`,
        options: Object.values(BibliographicPlatform).map((platform) => {
          const metadata = BibliographicPlatformMetadata[platform]
          return {
            value: platform,
            label: (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Image
                  src={metadata?.icon || publicPath('/icons/default.png')}
                  alt=''
                  width={20}
                  height={20}
                />
                {metadata?.name || platform}
              </Box>
            ),
          }
        }),
      },
    ]
  }, [currentPerspective?.membershipAcronyms, _])

  const columns = useMemo<MRT_ColumnDef<Document>[]>(() => {
    const searchWords = (column: MRT_Column<Document>) => [
      globalFilter,
      column.getFilterValue() as string,
    ]
    return [
      {
        accessorKey: 'titles',
        accessorFn: (row) => row.titles,
        header: t`documents_page_title_column`,
        size: 260,
        grow: true,
        Cell({ row, column }) {
          const { titles, documentType, journal } = row.original
          const title = getLocalizedValue(
            titles,
            lang,
            supportedLocales,
            t`no_title_available`,
          ).value
          return (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, minWidth: 0, width: '100%' }}>
            {/* Publication phare (plan CV, S3) : seulement dans son propre espace. */}
            {ownPerspective && <Box sx={{ mt: -0.5, ml: -1 }}><FeaturedToggle id={row.original.uid} /></Box>}
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              {/* Le clic remonte à la ligne : ce bouton la rend accessible au clavier. */}
              <Link
                component='button'
                underline='hover'
                title={title}
                sx={listTitleSx}
              >
                <Highlighter
                  highlightClassName='highlight'
                  searchWords={searchWords(column)}
                  autoEscape
                  textToHighlight={title}
                />
              </Link>
              <Typography variant='body2' color='text.secondary' noWrap sx={{ mt: 0.25 }}>
                <span>{_(DocumentTypeLabels[documentType])}</span>
                {journal?.title && (
                  <>
                    {' · '}
                    <span>{journal.title}</span>
                  </>
                )}
              </Typography>
            </Box>
            </Box>
          )
        },
      },
      {
        enableSorting: false,
        accessorKey: 'contributions',
        accessorFn: (row) => row.contributions,
        header: t`documents_page_contributors_column`,
        size: 140,
        Cell({ row, column }) {
          const names = row.original.contributions
            .map(({ person }: Contribution) => {
              const name = [person.firstName, person.lastName].filter(Boolean).join(' ')
              return name.trim() ? name : person.getDisplayName()
            })
            .filter(Boolean)
          const [first, ...others] = names
          return (
            <Typography variant='body1' noWrap title={names.join(', ')} sx={{ fontSize: '0.875rem' }}>
              <Highlighter
                highlightClassName='highlight'
                searchWords={searchWords(column)}
                autoEscape
                textToHighlight={first ?? ''}
              />
              {others.length > 0 && (
                <Box component='span' sx={{ color: 'text.secondary' }}>
                  {` +${others.length}`}
                </Box>
              )}
            </Typography>
          )
        },
      },
      {
        accessorKey: 'date',
        header: t`documents_page_year_column`,
        size: 115,
        Cell({ row }) {
          const date = row.original.publicationDate
          if (!date) return '—'
          const parsed = dayjs(date, 'YYYY-MM-DD')
          return parsed.isValid() ? parsed.format('YYYY') : date
        },
      },
      {
        enableSorting: false,
        accessorKey: 'halStatus',
        header: t`documents_page_halStatus_column`,
        size: 205,
        Header: () => (
          <>
            {t`documents_page_halStatus_column`}
            <HelpLink topic='statuses' />
          </>
        ),
        Cell({ row }) {
          return <HalStatusCell row={row} />
        },
      },
      {
        enableSorting: false,
        accessorFn: (row) => row.upwOAStatus ?? row.oaStatus ?? 'UNKNOWN',
        accessorKey: 'oaStatus',
        header: t`documents_page_oaStatus_column`,
        size: 170,
        Cell({ row }) {
          return <OAStatusCell row={row} />
        },
      },
      ...(ownPerspective
        ? [
            {
              id: 'nextAction',
              enableSorting: false,
              header: 'Action',
              size: 170,
              Cell({ row }: { row: { original: Document } }) {
                return (
                  <HalNextActionCell
                    document={row.original}
                    onDeposit={() => navigateToDetailsPage(row.original.uid, 'hal_deposit')}
                  />
                )
              },
            },
          ]
        : []),
      {
        accessorKey: 'publishedIn',
        header: t`documents_page_publishedIn_column`,
        size: 200,
        Cell({ row }) {
          return row.original.journal?.title ?? ''
        },
      },
      {
        accessorKey: 'type',
        enableSorting: false,
        header: t`documents_page_type_column`,
        size: 80,
        Cell({ row }) {
          return DocumentTypeIcons[row.original.documentType]
        },
      },
      {
        enableSorting: false,
        accessorKey: 'source',
        header: t`documents_page_source_column`,
        size: 130,
        Cell({ row }) {
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {Object.values(BibliographicPlatform).reduce<ReactElement[]>((acc, platform) => {
                const record = row.original.records.find((r) => r.platform === platform)
                if (!record) return acc
                const metadata = BibliographicPlatformMetadata[platform]
                const image = (
                  <Image
                    src={metadata?.icon || publicPath('/icons/default.png')}
                    alt={metadata?.name || 'Unknown Source'}
                    title={metadata?.name || 'Unknown Source'}
                    width={24}
                    height={24}
                  />
                )
                acc.push(
                  record.url ? (
                    <IconButton
                      key={platform}
                      component='a'
                      href={record.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      onClick={(event) => event.stopPropagation()}
                      sx={{ padding: 0 }}
                    >
                      {image}
                    </IconButton>
                  ) : (
                    <Box key={platform}>{image}</Box>
                  ),
                )
                return acc
              }, [])}
            </Box>
          )
        },
      },
    ]
  }, [
    lang,
    globalFilter,
    supportedLocales,
    navigateToDetailsPage,
    ownPerspective,
    _,
  ])

  const {
    fetchDocuments,
    countDocuments,
    loading,
    documents = [],
    latestDocumentRequestId,
    totalItems,
    count: { allItems, incompleteHalRepositoryItems },
    listHasChanged,
    setListHasChanged,
    mergeDocuments,
  } = useStore((state) => state.document)

  const requestIdRef = useRef(latestDocumentRequestId || 0)
  const countDocumentsRequestIdRef = useRef(0)

  const tabs = [
    {
      label: t`documents_page_all_documents_filter`,
      value: 'all_documents',
      numberOfItems: allItems,
      color: theme.palette.primary.main,
    },
    {
      label: t`documents_page_incomplete_hal_repository_filter`,
      value: 'incomplete_hal_repository',
      numberOfItems: incompleteHalRepositoryItems,
      color: theme.palette.error.main,
    },
  ]

  const [selectedTab, setSelectedTab] = useState(tabs[0].value)

  useEffect(() => {
    const adjustedFilters = normalizeDateFilters(columnFilters)
    const contributorType = currentPerspective?.type
    if (!contributorType) return

    const nextRequestId = ++requestIdRef.current
    fetchDocuments({
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      searchTerm: globalFilter,
      searchLang: lang,
      columnFilters: JSON.stringify(adjustedFilters), // Use adjusted date filter
      sorting: JSON.stringify(sorting),
      contributorUid: currentPerspective?.uid || '',
      contributorType: contributorType,
      requestId: nextRequestId,
      halCollectionCodes: JSON.stringify(currentPerspective.membershipAcronyms),
      areHalCollectionCodesOmitted: selectedTab === 'incomplete_hal_repository',
    }).catch((error) => {
      console.error('Error fetching documents:', error)
    })

    const nextCountDocumentsRequestId = ++countDocumentsRequestIdRef.current
    countDocuments({
      page: pagination.pageIndex + 1,
      searchTerm: globalFilter,
      searchLang: lang,
      columnFilters: JSON.stringify(adjustedFilters), // Use adjusted date filter
      contributorUid: currentPerspective?.uid || '',
      contributorType: contributorType,
      requestId: nextCountDocumentsRequestId,
      halCollectionCodes: JSON.stringify(currentPerspective.membershipAcronyms),
    }).catch((error) => {
      console.error('Error counting documents:', error)
    })
  }, [
    columnFilters,
    globalFilter,
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    lang,
    fetchDocuments,
    countDocuments,
    currentPerspective,
    selectedTab,
    triggerReloadList,
  ])

  useEffect(() => {
    const tab = searchParams.get('tab')

    setSelectedTab(tab ?? 'all_documents')
  }, [searchParams])

  const handleTabChange = (newValue: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', newValue)

    router.push(`/${lang}/documents?${params.toString()}`)
  }

  const onMergeDocuments = async (documentUids: string[]) => {
    if (documentUids.length < 2) return
    try {
      await mergeDocuments(documentUids)
      setTriggerReloadList((prev) => !prev)
    } catch (error) {
      console.error('Error merging documents:', error)
    }
  }

  useEffect(() => {
    sessionStorage.setItem(
      'mrt_pagination_publication_table',
      JSON.stringify(pagination),
    )
  }, [pagination])

  useEffect(() => {
    const id = setTimeout(() => {
      sessionStorage.setItem(
        'mrt_global_publication_table',
        JSON.stringify(globalFilter),
      )
    }, 250)
    return () => clearTimeout(id)
  }, [globalFilter])

  useEffect(() => {
    if (!sorting) return
    sessionStorage.setItem(
      'mrt_sorting_publication_table',
      JSON.stringify(sorting),
    )
  }, [sorting])

  useEffect(() => {
    const id = setTimeout(() => {
      sessionStorage.setItem(
        'mrt_columnFilters_publication_table',
        JSON.stringify(columnFilters),
      )
    }, 250)
    return () => clearTimeout(id)
  }, [columnFilters])

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_MOCK !== 'true') return
    const MOCK_DEPOSIT_STATUSES = [
      { uid: 'doc-3', step: 'moderation', halId: 'hal-04853421', hasFile: true, submittedAt: '2026-06-08T10:30:00.000Z' },
      { uid: 'doc-4', step: 'rejected',   halId: 'hal-04856789', hasFile: true, submittedAt: '2026-05-20T14:15:00.000Z' },
      { uid: 'doc-5', step: 'changes_requested', halId: 'hal-04859012', hasFile: true, submittedAt: '2026-05-28T09:00:00.000Z' },
    ]
    MOCK_DEPOSIT_STATUSES.forEach(({ uid, ...status }) => {
      const key = `hal-deposit-status-${uid}`
      if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(status))
    })
  }, [])

  return (
    <Box>
      <DocumentHeader
        perspectiveName={
          currentPerspective?.getDisplayName(lang as ExtendedLanguageCode) || ''
        }
        pageName={
          ownPerspective
            ? t`documents_page_main_title_first_person`
            : t`documents_page_main_title`
        }
        helpTopic='documents'
      >
        {listHasChanged && (
          <Alert
            severity='info'
            variant='filled'
            className='refresh-alert'
            onClose={() => setListHasChanged(false)}
          >
            <Typography component='span'>
              {ownPerspective && (
                <Trans id='documents_page_refresh_list_alert_own_perspective' />
              )}
              {ownPerspective || (
                <Trans
                  id='documents_page_refresh_list_alert_other_perspective'
                  values={{
                    name:
                      currentPerspective?.getDisplayName(
                        lang as ExtendedLanguageCode,
                      ) || '',
                  }}
                />
              )}
            </Typography>{' '}
            <Link
              component='button'
              onClick={() => {
                setTriggerReloadList((prev) => !prev)
                setListHasChanged(false)
              }}
              underline='always'
              sx={{ ml: 1 }}
            >
              {t`documents_page_refresh_list`}
            </Link>
          </Alert>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {currentPerspective && (
          <Can
            I={PermissionAction.fetch_documents}
            a={currentPerspective}
            passThrough
            ability={ability}
          >
            {(allowed: boolean) => (
              <Button
                startIcon={
                  isAnyHarvestingRunning ? (
                    <CircularProgress size={18} thickness={4} />
                  ) : (
                    <SyncIcon />
                  )
                }
                variant='outlined'
                disabled={!allowed}
                onClick={() => setOpenSynchronizeModal(true)}
              >
                <Trans id='documents_page_synchronize_button' />
              </Button>
            )}
          </Can>
        )}
          <HelpLink topic='update' />
        </Box>
      </DocumentHeader>
      <TabFilter
        tabsData={tabs}
        selectedValue={selectedTab}
        onTabChange={handleTabChange}
      />
      {currentPerspective && (
        <Can
          I={PermissionAction.fetch_documents}
          a={currentPerspective}
          ability={ability}
        >
          <DocumentSyncDialog
            openSynchronizeModal={openSynchronizeModal}
            setOpenSynchronizeModal={setOpenSynchronizeModal}
            personUid={currentPerspective?.uid || ''}
          />
        </Can>
      )}

      <Box data-tour='documents-table'>
      <DocumentTable<Document>
        columns={columns}
        data={documents}
        defaultColumnVisibility={DEFAULT_COLUMN_VISIBILITY}
        {...listTableProps}
        enableRowSelection={(row) => {
          if (!isDocument(row.original)) return false
          const canMerge = ability.can(PermissionAction.merge, row.original)
          return canMerge && row.original.state == DocumentState.default
        }}
        manualFiltering
        manualPagination
        manualSorting
        muiTableBodyRowProps={({ row }) => {
          const isWaiting = row.original.state === DocumentState.waiting_for_update
          return {
            className: isWaiting ? 'mrt-row-waiting' : '',
            onClick: () => {
              if (!isWaiting) navigateToDetailsPage(row.original.uid)
            },
            sx: { cursor: isWaiting ? 'progress' : 'pointer' },
          }
        }}
        onGlobalFilterChange={setGlobalFilter}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        rowCount={totalItems}
        state={{
          columnFilters,
          globalFilter,
          isLoading: loading,
          pagination,
          sorting: sorting || DEFAULT_SORTING,
        }}
        renderTopToolbar={({ table }) => {
          const selectedRows = table.getSelectedRowModel().rows
          return (
            <ListFilterBar
              filters={filterDefinitions}
              dateFilterId='date'
              dateFilterLabel={t`documents_page_year_column`}
              columnFilters={columnFilters}
              onColumnFiltersChange={setColumnFilters}
              globalFilter={globalFilter}
              onGlobalFilterChange={setGlobalFilter}
              endActions={<MRT_ShowHideColumnsButton table={table} />}
            >
              {selectedRows.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2 }}>
                  <Button
                    size='small'
                    variant='outlined'
                    disabled={selectedRows.length < 2}
                    onClick={async () => {
                      await onMergeDocuments(selectedRows.map((row) => row.original.uid))
                      table.resetRowSelection()
                    }}
                  >
                    {t`documents_page_merge_selected_documents_button`}
                  </Button>
                  <HelpLink topic='merge' />
                </Box>
              )}
            </ListFilterBar>
          )
        }}
      />
      </Box>
    </Box>
  )
}
export default DocumentsPage
