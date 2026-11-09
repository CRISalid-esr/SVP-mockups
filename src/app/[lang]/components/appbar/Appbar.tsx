'use client'

import { useState } from 'react'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import CheckIcon from '@mui/icons-material/Check'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import SettingsBrightnessOutlinedIcon from '@mui/icons-material/SettingsBrightnessOutlined'
import TourOutlinedIcon from '@mui/icons-material/TourOutlined'
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material'
import { signOut } from 'next-auth/react'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { institutionalConfig } from '@/configs/index'
import { publicPath } from '@/utils/publicPath'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'
import { User } from '@/types/User'
import LanguageSwitcher from '@/components/LanguageSwitcher/LanguageSwitcher'
import { ThemeModeType, useThemeContext } from '../../context/ThemeContext'
import {
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_WIDTH,
  TOPBAR_HEIGHT,
  TOPBAR_HEIGHT_MOBILE,
} from '../../layouts/shell'
import { helpUrl } from '../HelpLink'
import { useOnboarding } from '../Onboarding'

const THEME_ICONS: Record<ThemeModeType, React.ReactNode> = {
  light: <LightModeOutlinedIcon fontSize='small' />,
  dark: <DarkModeOutlinedIcon fontSize='small' />,
  system: <SettingsBrightnessOutlinedIcon fontSize='small' />,
}

interface AppbarProps {
  handleToggleDrawer: () => void
  sidebarOpen?: boolean
  user?: User | null
}

const Appbar = ({ handleToggleDrawer, sidebarOpen = true, user }: AppbarProps) => {
  const pathname = usePathname()
  const lang = pathname.split('/')[1]
  const router = useRouter()
  const { currentTheme, resolvedTheme, setTheme } = useThemeContext()
  const startTour = useOnboarding((state) => state.start)
  const [themeAnchor, setThemeAnchor] = useState<HTMLElement | null>(null)
  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null)

  const logo =
    resolvedTheme === 'dark'
      ? institutionalConfig.logos.darkSideBarLogo
      : institutionalConfig.logos.lightSideBarLogo

  const themeOptions: { value: ThemeModeType; label: React.ReactNode }[] = [
    { value: 'light', label: <Trans>sidebar_theme_light</Trans> },
    { value: 'dark', label: <Trans>sidebar_theme_dark</Trans> },
    { value: 'system', label: <Trans>sidebar_theme_system</Trans> },
  ]

  return (
    <AppBar
      position='fixed'
      color='inherit'
      elevation={0}
      sx={(theme) => ({
        width: 'auto',
        right: 0,
        left: {
          xs: 0,
          md: sidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
        },
        height: { xs: TOPBAR_HEIGHT_MOBILE, md: TOPBAR_HEIGHT },
        transition: 'left 0.15s ease',
        backgroundColor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
      })}
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 0.5, md: 1 },
          px: { xs: 1, md: 3 },
        }}
      >
        <IconButton aria-label='menu' onClick={handleToggleDrawer} sx={{ color: 'text.primary' }}>
          <MenuIcon />
        </IconButton>

        {/* Sur ordinateur, le logo est en tête de la barre latérale. */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', minWidth: 0, ml: 0.5 }}>
          <Image
            src={logo}
            alt='Crisalid logo'
            width={104}
            height={24}
            priority
            style={{ width: 104, height: 'auto' }}
          />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box data-tour='help' sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={t`side_bar_help`}>
            <IconButton
              component='a'
              href={helpUrl(undefined, lang)}
              target='_blank'
              rel='noopener noreferrer'
              aria-label={t`side_bar_help`}
              sx={{ color: 'text.primary' }}
            >
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
          {/* La visite guidée se limite à une carte sur mobile : pas de commande pour la relancer. */}
          <Tooltip title={t`side_bar_tour`}>
            <IconButton
              aria-label={t`side_bar_tour`}
              onClick={() => startTour()}
              sx={{ color: 'text.primary', display: { xs: 'none', md: 'inline-flex' } }}
            >
              <TourOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <LanguageSwitcher value={lang as ExtendedLanguageCode} />

        <Tooltip title={t`topbar_theme`}>
          <IconButton
            aria-label={t`topbar_theme`}
            aria-haspopup='menu'
            onClick={(event) => setThemeAnchor(event.currentTarget)}
            sx={{ color: 'text.primary' }}
          >
            {THEME_ICONS[currentTheme]}
          </IconButton>
        </Tooltip>
        <Menu anchorEl={themeAnchor} open={Boolean(themeAnchor)} onClose={() => setThemeAnchor(null)}>
          {themeOptions.map(({ value, label }) => (
            <MenuItem
              key={value}
              selected={currentTheme === value}
              onClick={() => {
                setTheme(value)
                setThemeAnchor(null)
              }}
            >
              <ListItemIcon>{THEME_ICONS[value]}</ListItemIcon>
              <ListItemText sx={{ mr: 2 }}>{label}</ListItemText>
              {currentTheme === value && <CheckIcon fontSize='small' />}
            </MenuItem>
          ))}
        </Menu>

        <Tooltip title={t`side_bar_my_account`}>
          <IconButton
            aria-label={t`side_bar_my_account`}
            aria-haspopup='menu'
            onClick={(event) => setAccountAnchor(event.currentTarget)}
            sx={{ p: 0.5 }}
          >
            <Avatar src={publicPath('/icons/avatar.png')} alt='' sx={{ width: 36, height: 36 }} />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={accountAnchor}
          open={Boolean(accountAnchor)}
          onClose={() => setAccountAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Box sx={{ px: 2, py: 1, maxWidth: 280 }}>
            <Typography variant='body1' fontWeight={600} noWrap>
              {user?.person?.firstName} {user?.person?.lastName}
            </Typography>
            <Typography variant='body2' color='text.secondary' noWrap>
              {user?.person?.email}
            </Typography>
          </Box>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem
            onClick={() => {
              setAccountAnchor(null)
              router.push(`/${lang}/account`)
            }}
          >
            <ListItemIcon>
              <PersonOutlineIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>{t`side_bar_my_account`}</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAccountAnchor(null)
              router.push(`/${lang}/appearance`)
            }}
          >
            <ListItemIcon>
              <PaletteOutlinedIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>Apparence de l’établissement</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => signOut({ callbackUrl: '/api/logout' })}>
            <ListItemIcon>
              <LogoutIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>{t`topbar_logout`}</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    </AppBar>
  )
}

export default Appbar
