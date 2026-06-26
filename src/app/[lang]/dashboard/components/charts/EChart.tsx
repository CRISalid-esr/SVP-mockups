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
  Typography,
} from '@mui/material'
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

// Icône « plein écran » (chevrons vers les 4 coins) au format path ECharts.
const FULLSCREEN_ICON =
  'path://M3 9V3h6v2H5v4H3zm12-6h6v6h-2V5h-4V3zM3 15h2v4h4v2H3v-6zm18 0v6h-6v-2h4v-4h2z'
// Icône « partager » (trois nœuds reliés) au format path ECharts.
const SHARE_ICON =
  'path://M18 16a3 3 0 0 0-2.4 1.2l-7-4a3 3 0 0 0 0-2.4l7-4A3 3 0 1 0 15 4l-7 4a3 3 0 1 0 0 8l7 4a3 3 0 1 0 3-4z'

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
 * Wrapper commun à tous les graphiques du tableau de bord : ajoute une barre
 * d'outils ECharts (télécharger en PNG, voir les données, réinitialiser, plein
 * écran, partager) et gère plein écran + dialogue d'intégration iframe.
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
  const heightNum =
    typeof style?.height === 'number' ? style.height : 360

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
      setTimeout(() => chartRef.current?.getEchartsInstance()?.resize(), 80)
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

  const feature: Record<string, unknown> = {
    dataView: {
      show: true,
      readOnly: true,
      title: 'Voir les données',
      lang: ['Données', 'Fermer', 'Actualiser'],
    },
    saveAsImage: {
      show: true,
      title: 'Télécharger (PNG)',
      name: fileName,
      pixelRatio: 2,
    },
    restore: { show: true, title: 'Réinitialiser' },
    myFullscreen: {
      show: true,
      title: isFullscreen ? 'Quitter le plein écran' : 'Plein écran',
      icon: FULLSCREEN_ICON,
      onclick: toggleFullscreen,
    },
  }
  // Bouton « Partager » seulement hors iframe et si l'instance a un identifiant.
  if (!isEmbed && shareId) {
    feature.myShare = {
      show: true,
      title: 'Partager / Intégrer',
      icon: SHARE_ICON,
      onclick: () => {
        setPerspective('lab')
        setShareOpen(true)
      },
    }
  }

  const mergedOption = {
    ...option,
    // Une barre d'outils déjà définie par le graphique reste prioritaire.
    toolbox: option.toolbox ?? {
      show: true,
      right: 8,
      top: 0,
      itemSize: 14,
      itemGap: 10,
      feature,
    },
  } as EChartsOption

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%',
        bgcolor: 'background.paper',
        '&:fullscreen': {
          p: 2,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
        },
      }}
    >
      <ReactEcharts
        ref={chartRef}
        option={mergedOption}
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
