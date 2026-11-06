import { t } from '@lingui/core/macro'
import { Avatar, Box, Card, IconButton, Link, Tooltip, Typography } from '@mui/material'
import Image from 'next/image'
import useStore from '@/stores/global_store'
import {
  BibliographicPlatform,
  BibliographicPlatformMetadata,
} from '@/types/BibliographicPlatform'
import { publicPath } from '@/utils/publicPath'

const MAX_AUTHORS = 4

const initials = (name: string) =>
  name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('')

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Typography variant='h6' component='h2' sx={{ mb: 1.5 }}>
    {children}
  </Typography>
)

/** Colonne de droite de la fiche sur les grands écrans : qui a écrit la publication et d'où elle vient. */
const DocumentSummaryCard = ({ onShowAuthors }: { onShowAuthors: () => void }) => {
  const { selectedDocument = null } = useStore((state) => state.document)
  if (!selectedDocument) return null

  const contributions = selectedDocument.contributions ?? []
  const records = selectedDocument.records ?? []
  const platforms = Object.values(BibliographicPlatform)
    .map((platform) => ({ platform, record: records.find((r) => r.platform === platform) }))
    .filter(({ record }) => record)

  return (
    <Card sx={{ p: 3, display: { xs: 'none', xl: 'block' } }}>
      <SectionTitle>{t`document_details_authors_tab`}</SectionTitle>
      <Box component='ul' sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 1.5 }}>
        {contributions.slice(0, MAX_AUTHORS).map(({ person }, index) => {
          const name = person.getDisplayName()
          return (
            <Box component='li' key={`${person.uid}-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
              <Avatar
                aria-hidden
                variant='rounded'
                sx={{ width: 32, height: 32, fontSize: '0.75rem', fontWeight: 600, bgcolor: 'navActive', color: 'primary.main' }}
              >
                {initials(name)}
              </Avatar>
              <Typography variant='body1' fontWeight={500} noWrap>
                {name}
              </Typography>
            </Box>
          )
        })}
      </Box>
      {contributions.length > MAX_AUTHORS && (
        <Link component='button' underline='hover' onClick={onShowAuthors} sx={{ mt: 1.5, fontSize: '0.875rem' }}>
          {`${t`document_details_summary_all_authors`} (${contributions.length})`}
        </Link>
      )}

      {platforms.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <SectionTitle>{t`document_details_sources_tab`}</SectionTitle>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {platforms.map(({ platform, record }) => {
              const metadata = BibliographicPlatformMetadata[platform]
              const name = metadata?.name || platform
              const image = (
                <Image src={metadata?.icon || publicPath('/icons/default.png')} alt={name} width={24} height={24} />
              )
              return (
                <Tooltip key={platform} title={name}>
                  {record?.url ? (
                    <IconButton component='a' href={record.url} target='_blank' rel='noopener noreferrer' sx={{ p: 0.5 }}>
                      {image}
                    </IconButton>
                  ) : (
                    <Box sx={{ p: 0.5, display: 'flex' }}>{image}</Box>
                  )}
                </Tooltip>
              )
            })}
          </Box>
        </Box>
      )}
    </Card>
  )
}

export default DocumentSummaryCard
