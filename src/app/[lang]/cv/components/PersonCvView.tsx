'use client'

import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  GlobalStyles,
  InputLabel,
  Link as MuiLink,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  Snackbar,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import Link from 'next/link'
import {
  CITATION_STYLES,
  CitationStyle,
  CvOrigin,
  CvSectionKey,
  CvTemplate,
  ORIGIN_CONFIG,
  PersonCv,
  SECTION_LABELS,
  TEMPLATES,
  selectPublications,
  toBibtex,
  toCslJson,
} from '../cvMock'
import CvDocument, { SOURCE_LABELS, sectionsWithContent } from './CvDocument'

/** Adresse du service de CV de l'établissement (NEXT_PUBLIC_CV_URL dans le plan). */
const CV_SERVICE_HOST = 'cv.univ-nantes.fr'

const download = (filename: string, content: string, type: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const toMarkdown = (cv: PersonCv, template: CvTemplate, includeUnvalidated: boolean) => {
  const pubs = selectPublications(cv, template, includeUnvalidated)
  return [
    `# ${cv.displayName}`,
    '',
    `${cv.position} — ${cv.affiliations.join(' ; ')}`,
    '',
    '## Parcours professionnel',
    ...(cv.sections.positions ?? []).map((p) => `- ${p.from}${p.to === null ? '–' : p.to ? `–${p.to}` : ''} : ${p.title}${p.place ? `, ${p.place}` : ''}`),
    '',
    '## Publications',
    ...pubs.map((p) => `- ${p.authors.join(', ')} (${p.year}). ${p.title}. *${p.venue}*.${p.doi ? ` https://doi.org/${p.doi}` : ''}`),
    '',
  ].join('\n')
}

const ORIGIN_ORDER: CvOrigin[] = ['publications', 'activities', 'profile', 'affiliations', 'cv']

interface PersonCvViewProps {
  cv: PersonCv
  isOwn: boolean
  lang: string
}

const PersonCvView = ({ cv, isOwn, lang }: PersonCvViewProps) => {
  const [template, setTemplate] = useState<CvTemplate>('complete')
  const [style, setStyle] = useState<CitationStyle>('apa')
  const [cvLang, setCvLang] = useState<'fr' | 'en'>(lang === 'en' ? 'en' : 'fr')
  const [sections, setSections] = useState<Partial<Record<CvSectionKey, boolean>>>({})
  const [includeUnvalidated, setIncludeUnvalidated] = useState(false)
  const [showSources, setShowSources] = useState(true)
  const [exportAnchor, setExportAnchor] = useState<HTMLElement | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const counts = useMemo(() => {
    const bySource = { sovisu: 0, hal: 0, openalex: 0 }
    cv.publications.forEach((p) => { bySource[p.source] += 1 })
    return { ...bySource, unvalidated: cv.publications.filter((p) => !p.validated).length }
  }, [cv])

  /** Nombre d'entrées du CV par provenance (hors publications). */
  const byOrigin = useMemo(() => {
    const result: Partial<Record<CvOrigin, number>> = {}
    Object.values(cv.sections).flat().forEach((entry) => {
      if (entry) result[entry.origin] = (result[entry.origin] ?? 0) + 1
    })
    result[cv.statement.origin] = (result[cv.statement.origin] ?? 0) + 1
    return result
  }, [cv])

  const config = TEMPLATES[template]
  const available = sectionsWithContent(cv, template, includeUnvalidated)
  const slugBase = `cv-${cv.slug}`

  const manageHref = (origin: CvOrigin) => {
    const route = ORIGIN_CONFIG[origin].route
    return isOwn && route ? `/${lang}/${route}` : undefined
  }

  const exportAs = (format: string) => {
    setExportAnchor(null)
    const pubs = selectPublications(cv, template, includeUnvalidated)
    if (format === 'pdf') {
      window.print()
    } else if (format === 'bibtex') {
      download(`${slugBase}.bib`, toBibtex(pubs), 'application/x-bibtex')
    } else if (format === 'csl') {
      download(`${slugBase}.json`, toCslJson(pubs), 'application/json')
    } else if (format === 'md') {
      download(`${slugBase}.md`, toMarkdown(cv, template, includeUnvalidated), 'text/markdown')
    } else {
      setMessage(`Export ${format} simulé dans la maquette : le service de CV produit le fichier.`)
    }
  }

  return (
    <>
      {/* À l'impression, seul le CV sort. */}
      <GlobalStyles
        styles={{
          '@media print': {
            'body *': { visibility: 'hidden' },
            '#cv-print, #cv-print *': { visibility: 'visible' },
            '#cv-print': { position: 'absolute', left: 0, top: 0, width: '100%', padding: '0 !important' },
            '.cv-screen-only': { display: 'none !important' },
          },
        }}
      />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3, alignItems: 'center' }}>
        {!isOwn && <Chip label='Lecture seule' size='small' />}
        <Typography variant='body2' color='text.secondary' sx={{ flexGrow: 1, minWidth: 240 }}>
          {isOwn
            ? 'Votre CV reprend vos publications validées, vos activités de recherche et les thèmes validés de votre profil. Pour corriger une rubrique, modifiez-la là où elle est saisie.'
            : `CV de ${cv.displayName}, construit à partir de ses données dans SoVisu+.`}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant='outlined'
            endIcon={<OpenInNewIcon />}
            onClick={() => setMessage(`Dans la version cible, ouvre ${CV_SERVICE_HOST} dans un nouvel onglet, sans nouvelle connexion (compte de l'établissement).`)}
          >
            {'Ouvrir dans le service de CV'}
          </Button>
          <Button variant='contained' startIcon={<FileDownloadOutlinedIcon />} onClick={(e) => setExportAnchor(e.currentTarget)}>
            {'Exporter'}
          </Button>
        </Box>
        <Menu anchorEl={exportAnchor} open={!!exportAnchor} onClose={() => setExportAnchor(null)}>
          <MenuItem onClick={() => exportAs('pdf')}><ListItemText primary='PDF' secondary='Impression du CV affiché' /></MenuItem>
          <MenuItem onClick={() => exportAs('Word')}><ListItemText primary='Word (.docx)' /></MenuItem>
          <MenuItem onClick={() => exportAs('LaTeX')}><ListItemText primary='LaTeX' /></MenuItem>
          <MenuItem onClick={() => exportAs('md')}><ListItemText primary='Markdown' /></MenuItem>
          <Divider />
          <MenuItem onClick={() => exportAs('bibtex')}><ListItemText primary='Bibliographie BibTeX' /></MenuItem>
          <MenuItem onClick={() => exportAs('csl')}><ListItemText primary='Bibliographie CSL-JSON' /></MenuItem>
        </Menu>
      </Box>

      {!cv.orcid && (
        <Alert severity='warning' sx={{ mb: 3 }} action={isOwn ? <Button component={Link} href={`/${lang}/account`} color='inherit' size='small'>{'Ajouter mon ORCID'}</Button> : undefined}>
          {isOwn
            ? 'Sans ORCID, votre CV ne reprend que les publications validées dans SoVisu+'
            : 'Sans ORCID, ce CV ne reprend que les publications validées dans SoVisu+'}
          {cv.idhal ? ' et HAL.' : '.'}
          {' Les sources ouvertes (OpenAlex, Crossref…) ne peuvent pas être interrogées.'}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: '300px minmax(0, 1fr)' }, gap: 3, alignItems: 'start' }}>
        <Card className='cv-screen-only' sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5, position: { lg: 'sticky' }, top: { lg: 88 }, maxHeight: { lg: 'calc(100vh - 104px)' }, overflowY: { lg: 'auto' } }}>
          <FormControl size='small' fullWidth>
            <InputLabel id='cv-template'>{'Modèle'}</InputLabel>
            <Select labelId='cv-template' label='Modèle' value={template} onChange={(e) => setTemplate(e.target.value as CvTemplate)}>
              {(Object.keys(TEMPLATES) as CvTemplate[]).map((key) => (
                <MenuItem key={key} value={key}>{TEMPLATES[key].label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant='body2' color='text.secondary' sx={{ mt: -1.5 }}>{config.description}</Typography>

          <FormControl size='small' fullWidth>
            <InputLabel id='cv-style'>{'Style bibliographique'}</InputLabel>
            <Select labelId='cv-style' label='Style bibliographique' value={style} onChange={(e) => setStyle(e.target.value as CitationStyle)}>
              {(Object.keys(CITATION_STYLES) as CitationStyle[]).map((key) => (
                <MenuItem key={key} value={key}>{CITATION_STYLES[key]}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <Typography variant='subtitle2' sx={{ mb: 1 }} id='cv-lang'>{'Langue du CV'}</Typography>
            <ToggleButtonGroup size='small' exclusive value={cvLang} onChange={(_, v) => v && setCvLang(v)} aria-labelledby='cv-lang'>
              <ToggleButton value='fr'>{'Français'}</ToggleButton>
              <ToggleButton value='en'>{'English'}</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box>
            <Typography variant='subtitle2' sx={{ mb: 0.5 }}>{'Rubriques'}</Typography>
            <FormGroup>
              {available.map((key) => (
                <FormControlLabel
                  key={key}
                  control={<Checkbox size='small' checked={sections[key] !== false} onChange={(e) => setSections({ ...sections, [key]: e.target.checked })} />}
                  label={<Typography variant='body2'>{SECTION_LABELS.fr[key]}</Typography>}
                />
              ))}
            </FormGroup>
          </Box>

          <Divider />

          <Box>
            <Typography variant='subtitle2' sx={{ mb: 1 }}>{'D’où vient ce CV'}</Typography>
            <Box component='ul' sx={{ m: 0, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {ORIGIN_ORDER.map((origin) => {
                const exclusions = cv.exclusions.filter((x) => x.origin === origin)
                const count = origin === 'publications' ? cv.publications.length : byOrigin[origin] ?? 0
                if (!count && !exclusions.length) return null
                const href = manageHref(origin)
                return (
                  <Box component='li' key={origin} sx={{ typography: 'body2' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                      <Box component='span' sx={{ fontWeight: 600 }}>{ORIGIN_CONFIG[origin].label}</Box>
                      {href && <MuiLink component={Link} href={href} underline='hover' variant='body2'>{'Gérer'}</MuiLink>}
                    </Box>
                    <Box sx={{ color: 'text.secondary' }}>
                      {origin === 'publications'
                        ? `${counts.sovisu} validées dans ${SOURCE_LABELS.sovisu}${counts.hal ? `, ${counts.hal} trouvées dans HAL` : ''}${counts.openalex ? `, ${counts.openalex} trouvées dans OpenAlex, absentes de SoVisu+` : ''}`
                        : `${count} élément${count > 1 ? 's' : ''}`}
                      {exclusions.map((x) => (
                        <Box key={x.reason}>{`Non repris : ${x.count} ${x.reason}`}</Box>
                      ))}
                    </Box>
                  </Box>
                )
              })}
            </Box>
            {counts.unvalidated > 0 && (
              <FormControlLabel
                sx={{ mt: 1.5 }}
                control={<Switch size='small' checked={includeUnvalidated} onChange={(e) => setIncludeUnvalidated(e.target.checked)} />}
                label={<Typography variant='body2'>{`Inclure les ${counts.unvalidated} publications à vérifier`}</Typography>}
              />
            )}
            <FormControlLabel
              control={<Switch size='small' checked={showSources} onChange={(e) => setShowSources(e.target.checked)} />}
              label={<Typography variant='body2'>{'Afficher la provenance (écran seulement)'}</Typography>}
            />
          </Box>
        </Card>

        <Card sx={{ minWidth: 0, maxWidth: 900 }}>
          <CvDocument
            cv={cv}
            template={template}
            style={style}
            lang={cvLang}
            sections={sections}
            includeUnvalidated={includeUnvalidated}
            showSources={showSources}
            manageHref={manageHref}
          />
        </Card>
      </Box>

      <Snackbar open={!!message} autoHideDuration={6000} onClose={() => setMessage(null)} message={message} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </>
  )
}

export default PersonCvView
