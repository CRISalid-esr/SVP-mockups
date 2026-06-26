'use client'

import {
  createContext,
  CSSProperties,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import ReactEcharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import ShareIcon from '@mui/icons-material/Share'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CloseIcon from '@mui/icons-material/Close'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

/**
 * Vrai à l'intérieur d'une iframe d'intégration : on masque alors le bouton
 * « Partager » pour éviter une intégration récursive.
 */
export const EmbedModeContext = createContext(false)

interface Props {
  option: EChartsOption
  style?: CSSProperties
  /** Identifiant unique de l'instance (clé du registre d'intégration + nom du PNG). */
  chartId?: string
  /** Nom de fichier (sans extension) pour le PNG ; par défaut = chartId. */
  exportName?: string
  notMerge?: boolean
  lazyUpdate?: boolean
}

const buildEmbedUrl = (chartId: string, perspective: string): string => {
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  // La fiche tableau de bord se termine par /dashboard/ (trailingSlash) ; la
  // page d'intégration est /{lang}/embed/ (sans le menu latéral).
  if (/\/dashboard\/?$/.test(url.pathname)) {
    url.pathname = url.pathname.replace(/\/dashboard\/?$/, '/embed/')
  } else if (!/\/embed\/?$/.test(url.pathname)) {
    url.pathname = url.pathname.replace(/\/?$/, '/embed/')
  }
  url.searchParams.set('chart', chartId)
  url.searchParams.set('perspective', perspective)
  return url.toString()
}

/**
 * Wrapper commun à tous les graphiques du tableau de bord. La barre d'outils
 * (télécharger PNG, réinitialiser, plein écran, partager) est rendue en HTML et
 * positionnée en absolu en haut à droite : elle se place dans le bandeau de titre
 * de la `CustomCard` (qui est en `position: relative`) au lieu d'empiéter sur le
 * graphique. Gère aussi le plein écran et le dialogue d'intégration iframe.
 */
const EChart = ({
  option,
  style,
  chartId,
  exportName,
  notMerge = true,
  lazyUpdate = true,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<ReactEcharts>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const isEmbed = useContext(EmbedModeContext)
  // Perspective laboratoire par défaut : jeu de données le plus complet.
  const [perspective, setPerspective] = useState<'researcher' | 'lab'>('lab')

  // Identifiant pour le partage (clé de registre) ; le PNG préfère le chartId.
  const shareId = chartId ?? exportName
  const fileName = chartId ?? exportName ?? 'graphique'
  const heightNum = typeof style?.height === 'number' ? style.height : 360

  const getInstance = () => chartRef.current?.getEchartsInstance()

  const downloadPng = () => {
    const inst = getInstance()
    if (!inst) return
    const url = inst.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff',
    })
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName}.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const restore = () => getInstance()?.dispatchAction({ type: 'restore' })

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void el.requestFullscreen?.()
    }
  }, [])

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current)
      setTimeout(() => getInstance()?.resize(), 80)
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const embedUrl =
    shareOpen && shareId && typeof window !== 'undefined'
      ? buildEmbedUrl(shareId, perspective)
      : ''
  const iframeCode = embedUrl
    ? `<iframe src="${embedUrl}" width="640" height="${heightNum + 80}" style="border:0" loading="lazy"></iframe>`
    : ''

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).then(() => setCopied(true))
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%',
        // En plein écran seulement, on ancre la barre d'outils sur le conteneur ;
        // sinon elle s'ancre sur la CustomCard (bandeau de titre).
        '&:fullscreen': {
          position: 'relative',
          p: 2,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'background.paper',
        },
      }}
    >
      {/* Barre d'outils HTML — placée dans le bandeau de titre de la carte. */}
      <Stack
        direction='row'
        spacing={0.25}
        sx={{
          position: 'absolute',
          top: 6,
          right: 6,
          zIndex: 3,
          borderRadius: 1,
          bgcolor: 'rgba(255,255,255,0.65)',
          '& .MuiIconButton-root': { color: 'text.secondary', p: 0.5 },
        }}
      >
        <Tooltip title='Télécharger (PNG)'>
          <IconButton size='small' onClick={downloadPng}>
            <DownloadIcon fontSize='small' />
          </IconButton>
        </Tooltip>
        <Tooltip title='Réinitialiser'>
          <IconButton size='small' onClick={restore}>
            <RestartAltIcon fontSize='small' />
          </IconButton>
        </Tooltip>
        <Tooltip title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}>
          <IconButton size='small' onClick={toggleFullscreen}>
            {isFullscreen ? (
              <FullscreenExitIcon fontSize='small' />
            ) : (
              <FullscreenIcon fontSize='small' />
            )}
          </IconButton>
        </Tooltip>
        {!isEmbed && shareId && (
          <Tooltip title='Partager / Intégrer'>
            <IconButton
              size='small'
              onClick={() => {
                setPerspective('lab')
                setShareOpen(true)
              }}
            >
              <ShareIcon fontSize='small' />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      <ReactEcharts
        ref={chartRef}
        option={option}
        notMerge={notMerge}
        lazyUpdate={lazyUpdate}
        style={{
          width: '100%',
          ...style,
          height: isFullscreen ? '100%' : (style?.height ?? 320),
        }}
      />

      <Dialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle sx={{ pr: 6 }}>
          Partager / intégrer ce graphique
          <IconButton
            onClick={() => setShareOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Box>
              <Typography variant='subtitle2' gutterBottom>
                Perspective
              </Typography>
              <ToggleButtonGroup
                size='small'
                exclusive
                value={perspective}
                onChange={(_e, v) => v && setPerspective(v)}
              >
                <ToggleButton value='researcher' sx={{ textTransform: 'none' }}>
                  Chercheur
                </ToggleButton>
                <ToggleButton value='lab' sx={{ textTransform: 'none' }}>
                  Laboratoire
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box>
              <Typography variant='subtitle2' gutterBottom>
                Lien direct
              </Typography>
              <Stack direction='row' spacing={1}>
                <TextField
                  fullWidth
                  size='small'
                  value={embedUrl}
                  InputProps={{ readOnly: true }}
                />
                <Button
                  variant='outlined'
                  startIcon={<ContentCopyIcon />}
                  onClick={() => copy(embedUrl)}
                  sx={{ flexShrink: 0 }}
                >
                  Copier
                </Button>
              </Stack>
            </Box>

            <Box>
              <Typography variant='subtitle2' gutterBottom>
                Code d&apos;intégration (iframe)
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={2}
                size='small'
                value={iframeCode}
                InputProps={{
                  readOnly: true,
                  sx: { fontFamily: 'monospace', fontSize: 12 },
                }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<OpenInNewIcon />}
            onClick={() => window.open(embedUrl, '_blank', 'noopener')}
          >
            Aperçu
          </Button>
          <Button
            variant='contained'
            startIcon={<ContentCopyIcon />}
            onClick={() => copy(iframeCode)}
          >
            Copier le code
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity='success' variant='filled' onClose={() => setCopied(false)}>
          Copié dans le presse-papier
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default EChart
