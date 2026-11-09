'use client'

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import { Box, Button, ButtonBase, Card, CircularProgress, TextField, Tooltip, Typography } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useThemeContext } from '@/app/[lang]/context/ThemeContext'
import { DEFAULT_BRAND, contrastRatio, generateBrand, isDefaultBrand, isValidHex } from '@/app/theme/brand'
import { colors as defaultColors } from '@/app/theme/palette'
import BrandPreview from './BrandPreview'
import { colorsFromImage } from './logoColors'

/** Teintes de départ : des familles courantes dans les chartes universitaires, sans viser un établissement. */
const PRESETS = [
  { hex: DEFAULT_BRAND, label: 'Sarcelle SoVisu+' },
  { hex: '#003d7c', label: 'Bleu marine' },
  { hex: '#0072bc', label: 'Bleu' },
  { hex: '#c8102e', label: 'Rouge' },
  { hex: '#8a1538', label: 'Bordeaux' },
  { hex: '#5b2c83', label: 'Violet' },
  { hex: '#2e7d32', label: 'Vert' },
  { hex: '#e35205', label: 'Orange' },
]

const FIXED = [
  'Les statuts (validé, brouillon, erreur) gardent leurs couleurs : elles portent un sens.',
  'Les couleurs de l’accès ouvert (diamant, or, vert, bronze) aussi.',
  'Les couleurs des types d’activités et des équipes restent les mêmes.',
]

const formatRatio = (ratio: number) => `${ratio.toFixed(1).replace('.', ',')}:1`

function Swatch({ color, label, selected, onClick }: { color: string; label: string; selected?: boolean; onClick: () => void }) {
  return (
    <Tooltip title={`${label} · ${color.toUpperCase()}`}>
      <ButtonBase
        onClick={onClick}
        aria-label={`${label} (${color.toUpperCase()})`}
        aria-pressed={selected}
        sx={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          bgcolor: color,
          outline: selected ? '2px solid' : 'none',
          outlineColor: 'text.primary',
          outlineOffset: 2,
          border: 1,
          borderColor: 'divider',
          '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
        }}
      />
    </Tooltip>
  )
}

const AppearancePage = () => {
  const { brandColor, setBrandColor } = useThemeContext()
  const [draft, setDraft] = useState(brandColor.toUpperCase())
  const [logoColors, setLogoColors] = useState<string[] | null>(null)
  const [readingLogo, setReadingLogo] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  // La couleur enregistrée arrive après le premier rendu : on aligne la saisie dessus.
  useEffect(() => setDraft(brandColor.toUpperCase()), [brandColor])

  // Le sélecteur natif envoie une valeur à chaque mouvement : on applique après une courte pause.
  const valid = isValidHex(draft)
  useEffect(() => {
    if (!valid || draft.toLowerCase() === brandColor.toLowerCase()) return
    const timer = window.setTimeout(() => setBrandColor(draft), 120)
    return () => window.clearTimeout(timer)
  }, [draft, valid, brandColor, setBrandColor])

  const brand = useMemo(() => generateBrand(brandColor), [brandColor])
  const isDefault = isDefaultBrand(brandColor)
  const contrast = isDefault ? contrastRatio(DEFAULT_BRAND, '#ffffff') : brand.contrast

  const choose = (hex: string) => {
    setDraft(hex.toUpperCase())
    setBrandColor(hex)
  }

  const readLogo = async (file: File | undefined) => {
    if (!file) return
    setReadingLogo(true)
    setLogoError(null)
    try {
      const found = await colorsFromImage(file)
      setLogoColors(found)
      if (found.length === 0) setLogoError('Aucune couleur nette dans cette image.')
    } catch {
      setLogoError('Cette image n’a pas pu être lue. Essayez un fichier PNG, JPEG ou SVG.')
    } finally {
      setReadingLogo(false)
    }
  }

  const exportConfig = () => {
    const values = isDefault ? defaultColors : { ...defaultColors, ...brand.colors }
    const body = Object.entries(values)
      .map(([key, value]) => `  ${key}: '${value}',`)
      .join('\n')
    const text = `// Couleurs de SoVisu+ générées depuis ${brandColor.toUpperCase()} (page Apparence de l’établissement).\n// À placer dans configs/custom/colors.ts, avec NEXT_PUBLIC_INSTITUTIONAL=custom.\nexport const colors = {\n${body}\n}\n`
    const url = URL.createObjectURL(new Blob([text], { type: 'text/typescript' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'colors.ts'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box component='header' sx={{ mb: 4 }}>
        <Typography variant='h4' component='h1'>Apparence de l’établissement</Typography>
        <Typography color='text.secondary' sx={{ mt: 0.5, maxWidth: 720 }}>
          Choisissez la couleur de votre établissement : les autres couleurs de SoVisu+ en découlent. Dans la maquette,
          votre choix est conservé dans ce navigateur.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: '380px minmax(0, 1fr)' }, gap: 3, alignItems: 'start' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
          <Card component='section' aria-label='Couleur principale' sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant='h6' component='h2'>Couleur principale</Typography>

            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <Box
                component='input'
                type='color'
                aria-label='Choisir une couleur'
                value={valid ? draft.toLowerCase() : brandColor}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDraft(e.target.value.toUpperCase())}
                sx={{
                  width: 56,
                  height: 40,
                  p: 0,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'transparent',
                  cursor: 'pointer',
                  flexShrink: 0,
                  '&::-webkit-color-swatch-wrapper': { p: '3px' },
                  '&::-webkit-color-swatch': { border: 0, borderRadius: '6px' },
                  '&::-moz-color-swatch': { border: 0, borderRadius: '6px' },
                }}
              />
              <TextField
                size='small'
                label='Code couleur'
                value={draft}
                onChange={(e) => setDraft(e.target.value.trim().toUpperCase())}
                error={!valid}
                helperText={valid ? undefined : 'Format attendu : # suivi de 6 caractères, par exemple #006A61'}
                sx={{ flex: 1 }}
                slotProps={{ htmlInput: { spellCheck: false, maxLength: 7 } }}
              />
            </Box>

            <Box role='status' sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              {brand.adjusted && !isDefault ? (
                <>
                  <InfoOutlinedIcon fontSize='small' sx={{ color: 'warning.dark', mt: 0.25 }} />
                  <Box>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>Ajustée pour rester lisible</Typography>
                    <Typography variant='body2' color='text.secondary' component='div' sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mt: 0.25 }}>
                      <Box component='span' sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: brand.seed, border: 1, borderColor: 'divider' }} />
                      {brand.seed.toUpperCase()} devient
                      <Box component='span' sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: brand.main }} />
                      {brand.main.toUpperCase()} pour les boutons et les liens ({formatRatio(contrast)} sur fond blanc).
                    </Typography>
                  </Box>
                </>
              ) : (
                <>
                  <CheckCircleOutlineIcon fontSize='small' sx={{ color: 'success.main', mt: 0.25 }} />
                  <Typography variant='body2'>
                    <Box component='span' sx={{ fontWeight: 600 }}>Lisible</Box> : {formatRatio(contrast)} sur fond blanc, utilisée telle quelle.
                  </Typography>
                </>
              )}
            </Box>

            <Box>
              <Typography variant='subtitle2' component='h3' sx={{ fontWeight: 700, mb: 1 }}>Suggestions</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
                {PRESETS.map((p) => (
                  <Swatch key={p.hex} color={p.hex} label={p.label} selected={brandColor.toLowerCase() === p.hex} onClick={() => choose(p.hex)} />
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant='subtitle2' component='h3' sx={{ fontWeight: 700 }}>À partir de votre logo</Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                L’image est lue dans votre navigateur, elle n’est envoyée nulle part.
              </Typography>
              <input
                ref={fileInput}
                type='file'
                accept='image/png,image/jpeg,image/svg+xml,image/webp'
                hidden
                aria-label='Logo de l’établissement'
                onChange={(e) => {
                  readLogo(e.target.files?.[0])
                  e.target.value = ''
                }}
              />
              <Button
                variant='outlined'
                startIcon={readingLogo ? <CircularProgress size={16} /> : <ImageOutlinedIcon />}
                onClick={() => fileInput.current?.click()}
                disabled={readingLogo}
              >
                Choisir une image
              </Button>
              {logoError && (
                <Typography variant='body2' color='error' sx={{ mt: 1 }}>{logoError}</Typography>
              )}
              {logoColors && logoColors.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1.25, mt: 1.5 }} aria-label='Couleurs du logo'>
                  {logoColors.map((hex, i) => (
                    <Swatch key={hex} color={hex} label={`Couleur ${i + 1} du logo`} selected={brandColor.toLowerCase() === hex} onClick={() => choose(hex)} />
                  ))}
                </Box>
              )}
            </Box>
          </Card>

          <Card component='section' aria-label='Ce qui ne change pas' sx={{ p: 3 }}>
            <Typography variant='h6' component='h2' sx={{ mb: 1 }}>Ce qui ne change pas</Typography>
            <Box component='ul' sx={{ m: 0, pl: 2.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {FIXED.map((line) => (
                <Typography key={line} component='li' variant='body2' color='text.secondary'>{line}</Typography>
              ))}
            </Box>
          </Card>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Button variant='contained' disableElevation startIcon={<DownloadOutlinedIcon />} onClick={exportConfig}>
              Exporter la configuration
            </Button>
            <Button startIcon={<RestartAltIcon />} onClick={() => choose(DEFAULT_BRAND)} disabled={isDefault}>
              Revenir aux couleurs SoVisu+
            </Button>
          </Box>
        </Box>

        <BrandPreview />
      </Box>
    </Box>
  )
}

export default AppearancePage
