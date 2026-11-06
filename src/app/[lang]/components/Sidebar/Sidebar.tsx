'use client'

import { ReactNode } from 'react'
import { Trans } from '@lingui/react/macro'
import {
  Box,
  Divider,
  Drawer,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { visuallyHidden } from '@mui/utils'
import {
  BarChartSquare02 as BarChartSquare,
  Building02 as Building,
  ClipboardCheck,
  Compass03 as Compass,
  LayersThree01 as LayerThree,
} from '@untitled-ui/icons-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { institutionalConfig } from '@/configs/index'
import { useThemeContext } from '../../context/ThemeContext'
import { SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH, TOPBAR_HEIGHT } from '../../layouts/shell'
import { PerspectiveSwitcher, PerspectiveVariantSwitch } from '../Perspective'

interface NavItem {
  /** Segment de route, sans la langue. */
  route: string
  label: ReactNode
  icon: ReactNode
}

const ICON_PROPS = { width: 20, height: 20 }

const MAIN_ITEMS: NavItem[] = [
  { route: 'dashboard', label: <Trans>side_bar_dashboard</Trans>, icon: <BarChartSquare {...ICON_PROPS} /> },
  { route: 'documents', label: <Trans>side_bar_documents</Trans>, icon: <LayerThree {...ICON_PROPS} /> },
  {
    route: 'research-activities',
    label: <Trans id='side_bar_research_activities'>{'Activités de recherche'}</Trans>,
    icon: <ClipboardCheck {...ICON_PROPS} />,
  },
  { route: 'expertise-v2', label: <Trans>side_bar_expertise</Trans>, icon: <Compass {...ICON_PROPS} /> },
]

const SECONDARY_ITEMS: NavItem[] = [
  { route: 'research-structures', label: 'Structures', icon: <Building {...ICON_PROPS} /> },
]

interface SidebarProps {
  handleToggleDrawerAction: () => void
  open: boolean
}

const Sidebar = ({ open, handleToggleDrawerAction }: SidebarProps) => {
  const pathname = usePathname()
  const lang = pathname.split('/')[1]
  const theme = useTheme()
  const { resolvedTheme } = useThemeContext()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const searchParams = useSearchParams()
  // Sur mobile, le tiroir s'affiche toujours déplié.
  const expanded = open || isMobile

  const logo =
    resolvedTheme === 'dark'
      ? institutionalConfig.logos.darkSideBarLogo
      : institutionalConfig.logos.lightSideBarLogo

  const renderItem = ({ route, label, icon }: NavItem) => {
    const base = `/${lang}/${route}`
    const selected = pathname === base || pathname.startsWith(`${base}/`)
    const button = (
      <ListItemButton
        key={route}
        component={Link}
        href={`${base}?${searchParams.toString()}`}
        selected={selected}
        aria-current={selected ? 'page' : undefined}
        onClick={() => isMobile && handleToggleDrawerAction()}
        sx={{
          minHeight: 48,
          mb: 0.5,
          px: 1.5,
          borderRadius: 2,
          color: 'text.primary',
          justifyContent: expanded ? 'flex-start' : 'center',
          '&:hover': { backgroundColor: 'navHover' },
          '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: 'navActive' },
          '&.Mui-focusVisible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: -2 },
        }}
      >
        <ListItemIcon sx={{ minWidth: 0, mr: expanded ? 1.5 : 0, color: 'inherit' }}>{icon}</ListItemIcon>
        {expanded ? (
          <ListItemText
            primary={label}
            slotProps={{ primary: { sx: { fontSize: '0.875rem', lineHeight: 1.3, fontWeight: selected ? 700 : 400 } } }}
          />
        ) : (
          <Box component='span' sx={visuallyHidden}>
            {label}
          </Box>
        )}
      </ListItemButton>
    )

    return expanded ? (
      button
    ) : (
      <Tooltip key={route} title={label} placement='right'>
        {button}
      </Tooltip>
    )
  }

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={handleToggleDrawerAction}
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': {
          width: expanded ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
          transition: 'width 0.15s ease',
          boxSizing: 'border-box',
          overflowX: 'hidden',
          backgroundColor: 'background.paper',
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box
          sx={{
            height: TOPBAR_HEIGHT,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: expanded ? 'flex-start' : 'center',
            px: expanded ? 2.5 : 0,
          }}
        >
          {/* Replié, on ne garde que le symbole placé à gauche du logo. */}
          <Box sx={{ width: expanded ? 148 : 32, overflow: 'hidden', flexShrink: 0, lineHeight: 0 }}>
            <Image
              src={logo}
              alt='logo'
              width={148}
              height={34}
              priority
              style={{ width: 148, height: 'auto', maxWidth: 'none' }}
            />
          </Box>
        </Box>

        <Box sx={{ px: 2, pt: 1, pb: 3, flexShrink: 0 }}>
          <PerspectiveSwitcher compact={!expanded} />
        </Box>

        <Box component='nav' sx={{ px: 2, flexGrow: 1, overflowY: 'auto' }}>
          {MAIN_ITEMS.map(renderItem)}
          <Divider sx={{ my: 2 }} />
          {SECONDARY_ITEMS.map(renderItem)}
        </Box>

        {/* Commande de maquette : à retirer quand l'emplacement du sélecteur sera choisi. */}
        {expanded && (
          <Box sx={{ px: 2, py: 2, flexShrink: 0 }}>
            <PerspectiveVariantSwitch />
          </Box>
        )}
      </Box>
    </Drawer>
  )
}

export default Sidebar
