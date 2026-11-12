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
  InputLabel,
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
import { GlobalStyles } from '@mui/material'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import Link from 'next/link'
import {
  CITATION_STYLES,
  CitationStyle,
  CvSectionKey,
  CvTemplate,
  PersonCv,
  SECTION_LABELS,
  SECTION_ORDER,
  TEMPLATES,
  selectPublications,
  toBibtex,
  toCslJson,
} from '../cvMock'
import CvDocument, { SOURCE_LABELS } from './CvDocument'

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
    ...cv.positions.map((p) => `- ${p.from}${p.to === null ? '–' : p.to ? `–${p.to}` : ''} : ${p.title}${p.place ? `, ${p.place}` : ''}`),
    '',
    '## Publications',
    ...pubs.map((p) => `- ${p.authors.join(', ')} (${p.year}). ${p.title}. *${p.venue}*.${p.doi ? ` https://doi.org/${p.doi}` : ''}`),
    '',
  ].join('\n')
}

interface PersonCvViewProps {
  cv: PersonCv
  isOwn: boolean
  lang: string
}

const PersonCvView = ({ cv, isOwn, lang }: PersonCvViewProps) => {
  const [template, setTemplate] = useState<CvTemplate>('complete')
  const [style, setStyle] = useState<CitationStyle>('apa')
  const [cvLang, setCvLang] = useState<'fr' | 'en'>(lang === 'en' ? 'en' : 'fr')
  const [sections, setSections] = useState<Record<CvSectionKey, boolean>>(
    () => Object.fromEntries(SECTION_ORDER.map((key) => [key, true])) as Record<CvSectionKey, boolean>,
  )
  const [includeUnvalidated, setIncludeUnvalidated] = useState(false)
  const [showSources, setShowSources] = useState(true)
  const [exportAnchor, setExportAnchor] = useState<HTMLElement | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const counts = useMemo(() => {
    const bySource = { sovisu: 0, hal: 0, openalex: 0 }
    cv.publications.forEach((p) => { bySource[p.source] += 1 })
    return { ...bySource, unvalidated: cv.publications.filter((p) => !p.validated).length }
  }, [cv])

  const config = TEMPLATES[template]
  const slugBase = `cv-${cv.slug}`

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
            ? 'Votre CV est construit à partir de vos publications validées dans SoVisu+ et des sources ouvertes. Choisissez un modèle, puis exportez-le.'
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
        <Card className='cv-screen-only' sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2.5, position: { lg: 'sticky' }, top: { lg: 88 } }}>
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
              {SECTION_ORDER.filter((key) => config.sections.includes(key)).map((key) => (
                <FormControlLabel
                  key={key}
                  control={<Checkbox size='small' checked={sections[key]} onChange={(e) => setSections({ ...sections, [key]: e.target.checked })} />}
                  label={<Typography variant='body2'>{SECTION_LABELS.fr[key]}</Typography>}
                />
              ))}
            </FormGroup>
          </Box>

          <Divider />

          <Box>
            <Typography variant='subtitle2' sx={{ mb: 1 }}>{'Sources des publications'}</Typography>
            <Box component='ul' sx={{ m: 0, pl: 2.5, typography: 'body2', color: 'text.secondary' }}>
              <li>{`${counts.sovisu} validées dans ${SOURCE_LABELS.sovisu}`}</li>
              {counts.hal > 0 && <li>{`${counts.hal} trouvées dans HAL`}</li>}
              {counts.openalex > 0 && <li>{`${counts.openalex} trouvées dans OpenAlex, absentes de SoVisu+`}</li>}
            </Box>
            {counts.unvalidated > 0 && (
              <FormControlLabel
                sx={{ mt: 1 }}
                control={<Switch size='small' checked={includeUnvalidated} onChange={(e) => setIncludeUnvalidated(e.target.checked)} />}
                label={<Typography variant='body2'>{`Inclure les ${counts.unvalidated} publications à vérifier`}</Typography>}
              />
            )}
            <FormControlLabel
              control={<Switch size='small' checked={showSources} onChange={(e) => setShowSources(e.target.checked)} />}
              label={<Typography variant='body2'>{'Afficher la provenance (écran seulement)'}</Typography>}
            />
            {isOwn && counts.unvalidated > 0 && (
              <Button component={Link} href={`/${lang}/documents`} size='small' sx={{ mt: 1, px: 0 }}>
                {'Valider mes publications'}
              </Button>
            )}
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
          />
        </Card>
      </Box>

      <Snackbar open={!!message} autoHideDuration={6000} onClose={() => setMessage(null)} message={message} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </>
  )
}

export default PersonCvView
