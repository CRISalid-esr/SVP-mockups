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
  ListItemIcon,
  Menu,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import ShareIcon from '@mui/icons-material/Share'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CloseIcon from '@mui/icons-material/Close'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { useChartTheme } from './useChartTheme'

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
 * Wrapper commun à tous les graphiques du tableau de bord. Les actions (image, plein écran,
 * réinitialiser, intégrer) sont dans un menu ⋯ placé en haut à droite de la carte
 * (DashboardSectionCard, en `position: relative`).
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
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)

  const themed = useChartTheme(option)
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
      backgroundColor: themed.theme === 'dark' ? '#1A1C1B' : '#fff',
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
        // En plein écran seulement, le menu s'ancre sur le conteneur ; sinon sur la carte.
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
      {/* Menu ⋯ du graphique, en haut à droite de sa carte. */}
      <IconButton
        aria-label='Actions sur le graphique'
        aria-haspopup='menu'
        onClick={(event) => setMenuAnchor(event.currentTarget)}
        sx={{ position: 'absolute', top: 16, right: 16, zIndex: 3, color: 'text.secondary' }}
      >
        <MoreHorizIcon />
      </IconButton>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        container={isFullscreen ? containerRef.current : undefined}
      >
        <MenuItem onClick={() => { setMenuAnchor(null); downloadPng() }}>
          <ListItemIcon><DownloadIcon fontSize='small' /></ListItemIcon>
          Télécharger l’image
        </MenuItem>
        <MenuItem onClick={() => { setMenuAnchor(null); toggleFullscreen() }}>
          <ListItemIcon>{isFullscreen ? <FullscreenExitIcon fontSize='small' /> : <FullscreenIcon fontSize='small' />}</ListItemIcon>
          {isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
        </MenuItem>
        <MenuItem onClick={() => { setMenuAnchor(null); restore() }}>
          <ListItemIcon><RestartAltIcon fontSize='small' /></ListItemIcon>
          Réinitialiser le zoom
        </MenuItem>
        {!isEmbed && shareId && (
          <MenuItem onClick={() => { setMenuAnchor(null); setPerspective('lab'); setShareOpen(true) }}>
            <ListItemIcon><ShareIcon fontSize='small' /></ListItemIcon>
            Intégrer dans une page
          </MenuItem>
        )}
      </Menu>

      <ReactEcharts
        ref={chartRef}
        option={themed.option}
        theme={themed.theme}
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
