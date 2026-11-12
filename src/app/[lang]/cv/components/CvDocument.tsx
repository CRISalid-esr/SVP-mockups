'use client'

import { Fragment, ReactNode } from 'react'
import { Box, Chip, Divider, Link, Typography } from '@mui/material'
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined'
import NextLink from 'next/link'
import {
  CitationStyle,
  CvEntry,
  CvOrigin,
  CvPublication,
  CvSectionKey,
  CvTemplate,
  ORIGIN_CONFIG,
  PUBLICATION_SECTIONS,
  PersonCv,
  PublicationSectionKey,
  SECTION_LABELS,
  SECTION_ORDER,
  TEMPLATES,
  formatAuthors,
  publicationSection,
  selectPublications,
} from '../cvMock'

export const SOURCE_LABELS: Record<CvPublication['source'], string> = {
  sovisu: 'SoVisu+',
  hal: 'HAL',
  openalex: 'OpenAlex',
}

const PUBLICATION_GROUPS: { label: Record<'fr' | 'en', string>; types: CvPublication['type'][] }[] = [
  { label: { fr: 'Articles dans des revues', en: 'Journal articles' }, types: ['article'] },
  { label: { fr: 'Communications', en: 'Conference papers' }, types: ['conference'] },
  { label: { fr: 'Ouvrages et chapitres', en: 'Books and chapters' }, types: ['book', 'chapter'] },
  { label: { fr: 'Rapports', en: 'Reports' }, types: ['report'] },
]

const formatPeriod = (entry: CvEntry, lang: 'fr' | 'en') => {
  if (entry.from == null) return ''
  if (entry.to === undefined) return String(entry.from)
  if (entry.to === null) return lang === 'fr' ? `depuis ${entry.from}` : `${entry.from}–present`
  return entry.to === entry.from ? String(entry.from) : `${entry.from}–${entry.to}`
}

/** Sections qui ont du contenu pour ce CV et ce modèle. */
export const sectionsWithContent = (cv: PersonCv, template: CvTemplate, includeUnvalidated: boolean): CvSectionKey[] => {
  const pubs = selectPublications(cv, template, includeUnvalidated)
  return SECTION_ORDER.filter((key) => {
    if (!TEMPLATES[template].sections.includes(key)) return false
    if (key === 'statement') return !!cv.statement.text
    if ((PUBLICATION_SECTIONS as CvSectionKey[]).includes(key)) return pubs.some((p) => publicationSection(p) === key)
    return (cv.sections[key as keyof PersonCv['sections']]?.length ?? 0) > 0
  })
}

/** Provenance d'une section : celle de ses entrées (la plus fréquente). */
const originOf = (cv: PersonCv, key: CvSectionKey): CvOrigin => {
  if (key === 'statement') return cv.statement.origin
  if ((PUBLICATION_SECTIONS as CvSectionKey[]).includes(key)) return 'publications'
  const entries = cv.sections[key as keyof PersonCv['sections']] ?? []
  return entries[0]?.origin ?? 'cv'
}

interface CvDocumentProps {
  cv: PersonCv
  template: CvTemplate
  style: CitationStyle
  lang: 'fr' | 'en'
  sections: Partial<Record<CvSectionKey, boolean>>
  includeUnvalidated: boolean
  showSources: boolean
  /** Lien « Gérer » vers la rubrique de SoVisu+ d'où vient une section (son propre CV seulement). */
  manageHref?: (origin: CvOrigin) => string | undefined
}

/** Le CV tel que le service de CV le rendrait (et tel qu'il s'imprime). */
const CvDocument = ({ cv, template, style, lang, sections, includeUnvalidated, showSources, manageHref }: CvDocumentProps) => {
  const config = TEMPLATES[template]
  const publications = selectPublications(cv, template, includeUnvalidated)
  const labels = SECTION_LABELS[lang]
  const visible = sectionsWithContent(cv, template, includeUnvalidated).filter((key) => sections[key] !== false)

  const entries = (list: CvEntry[]) => (
    <Box component='dl' sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '120px 1fr' }, columnGap: 2, rowGap: 1, m: 0 }}>
      {list.map((entry, i) => (
        <Fragment key={i}>
          <Typography component='dt' variant='body2' sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
            {formatPeriod(entry, lang)}
          </Typography>
          <Box component='dd' sx={{ m: 0 }}>
            <Typography variant='body2' sx={{ fontWeight: 600 }}>
              {entry.title}
              {entry.place && <Box component='span' sx={{ fontWeight: 400 }}>{`, ${entry.place}`}</Box>}
              {showSources && entry.visibility === 'private' && (
                <Chip className='cv-screen-only' size='small' variant='outlined' label='Privé' sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} />
              )}
            </Typography>
            {entry.detail && <Typography variant='body2' color='text.secondary'>{entry.detail}</Typography>}
            {entry.keywords && entry.keywords.length > 0 && (
              <Typography variant='body2' color='text.secondary'>{entry.keywords.join(' · ')}</Typography>
            )}
          </Box>
        </Fragment>
      ))}
    </Box>
  )

  const citation = (p: CvPublication) => {
    const authors = formatAuthors(p.authors, style)
    const self = cv.lastName
    // Le nom de la personne est mis en gras, comme dans la plupart des CV académiques.
    const highlighted = authors.split(new RegExp(`(${self.toUpperCase()}|${self})`)).map((part, i) =>
      part === self || part === self.toUpperCase() ? <strong key={i}>{part}</strong> : part,
    )
    const doi = p.doi && (
      <Link href={`https://doi.org/${p.doi}`} target='_blank' rel='noopener' underline='hover' sx={{ wordBreak: 'break-all' }}>
        {`https://doi.org/${p.doi}`}
      </Link>
    )
    if (style === 'apa') return <>{highlighted}{` (${p.year}). ${p.title}. `}<em>{p.venue}</em>{'. '}{doi}</>
    if (style === 'vancouver') return <>{highlighted}{`. ${p.title}. ${p.venue}. ${p.year}. `}{doi}</>
    return <>{highlighted}{`. ${p.title}. `}<em>{p.venue}</em>{`, ${p.year}. `}{doi}</>
  }

  const publicationItems = (items: CvPublication[]) => (
    <Box component='ol' sx={{ m: 0, pl: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
      {items.map((p) => (
        <Box component='li' key={p.id} sx={{ typography: 'body2', pl: 0.5 }}>
          {citation(p)}
          {(showSources || p.openAccess) && (
            <Box component='span' className='cv-screen-only' sx={{ display: 'inline-flex', gap: 0.5, ml: 1, verticalAlign: 'middle', flexWrap: 'wrap' }}>
              {p.openAccess && (
                <Chip size='small' variant='outlined' icon={<LockOpenOutlinedIcon />} label={lang === 'fr' ? 'Accès ouvert' : 'Open access'} sx={{ height: 20, fontSize: '0.7rem' }} />
              )}
              {showSources && (
                <Chip
                  size='small'
                  color={p.validated ? 'success' : 'warning'}
                  variant='outlined'
                  label={p.validated ? `${SOURCE_LABELS[p.source]} · validé` : `${SOURCE_LABELS[p.source]} · à vérifier`}
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              )}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  )

  const publicationSectionContent = (key: PublicationSectionKey) => {
    const items = publications.filter((p) => publicationSection(p) === key)
    // Les modèles courts listent une sélection, sans regroupement par type.
    if (key !== 'publications' || config.maxPublications) return publicationItems(items)
    return PUBLICATION_GROUPS
      .map((g) => ({ label: g.label[lang], items: items.filter((p) => g.types.includes(p.type)) }))
      .filter((g) => g.items.length)
      .map((group) => (
        <Box key={group.label} sx={{ mb: 2 }}>
          <Typography variant='subtitle2' sx={{ mb: 1 }}>{`${group.label} (${group.items.length})`}</Typography>
          {publicationItems(group.items)}
        </Box>
      ))
  }

  const content = (key: CvSectionKey): ReactNode => {
    if (key === 'statement') {
      return (
        <>
          <Typography variant='body2' sx={{ mb: 1 }}>{cv.statement.text}</Typography>
          {cv.statement.keywords.length > 0 && (
            <Typography variant='body2' color='text.secondary'>
              {`${lang === 'fr' ? 'Mots-clés' : 'Keywords'} : ${cv.statement.keywords.join(' · ')}`}
            </Typography>
          )}
        </>
      )
    }
    if ((PUBLICATION_SECTIONS as CvSectionKey[]).includes(key)) return publicationSectionContent(key as PublicationSectionKey)
    return entries(cv.sections[key as keyof PersonCv['sections']] ?? [])
  }

  const provenance = (key: CvSectionKey) => {
    const origin = originOf(cv, key)
    const href = manageHref?.(origin)
    return (
      <Box className='cv-screen-only' sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
        <Typography variant='caption' color='text.secondary'>{ORIGIN_CONFIG[origin].label}</Typography>
        {href && (
          <Link component={NextLink} href={href} variant='caption' underline='hover'>{'Gérer'}</Link>
        )}
      </Box>
    )
  }

  const identifiers = [
    cv.orcid && { label: 'ORCID', value: cv.orcid, href: `https://orcid.org/${cv.orcid}` },
    cv.idhal && { label: 'IdHAL', value: cv.idhal, href: `https://hal.science/search/index/?q=authIdHal_s:${cv.idhal}` },
    cv.idref && { label: 'IdRef', value: cv.idref, href: `https://www.idref.fr/${cv.idref}` },
  ].filter(Boolean) as { label: string; value: string; href: string }[]

  return (
    <Box id='cv-print' component='article' aria-label={`CV de ${cv.displayName}`} sx={{ p: { xs: 3, md: 6 }, color: 'text.primary' }}>
      <Box component='header' sx={{ mb: 4 }}>
        <Typography variant='h4' component='h2' sx={{ fontWeight: 700 }}>{cv.displayName}</Typography>
        <Typography variant='subtitle1' sx={{ mt: 0.5 }}>{cv.position}</Typography>
        {cv.affiliations.map((a) => (
          <Typography key={a} variant='body2' color='text.secondary'>{a}</Typography>
        ))}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 2, rowGap: 0.5, mt: 1.5, typography: 'body2' }}>
          <span>{cv.email}</span>
          {identifiers.map((id) => (
            <span key={id.label}>
              {`${id.label} `}
              <Link href={id.href} target='_blank' rel='noopener' underline='hover'>{id.value}</Link>
            </span>
          ))}
        </Box>
      </Box>

      {visible.map((key) => (
        <Box component='section' key={key} aria-labelledby={`cv-section-${key}`} sx={{ mb: 3.5, breakInside: 'avoid-page' }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 0.5 }}>
            <Typography variant='h6' component='h3' id={`cv-section-${key}`}>
              {key === 'publications' && config.maxPublications
                ? `${labels.publications} — ${lang === 'fr' ? 'sélection' : 'selection'}`
                : labels[key]}
            </Typography>
            {showSources && provenance(key)}
          </Box>
          <Divider sx={{ mb: 1.5 }} />
          {content(key)}
        </Box>
      ))}

      <Typography variant='caption' color='text.secondary' component='footer' sx={{ display: 'block', mt: 4 }}>
        {lang === 'fr'
          ? `CV mis à jour le 12/11/2026 à partir de SoVisu+${cv.idhal ? ', HAL' : ''}${cv.orcid ? ', OpenAlex et ORCID' : ''}. Propulsé par SigmaCV.`
          : `CV updated on 2026-11-12 from SoVisu+${cv.idhal ? ', HAL' : ''}${cv.orcid ? ', OpenAlex and ORCID' : ''}. Powered by SigmaCV.`}
      </Typography>
    </Box>
  )
}

export default CvDocument
