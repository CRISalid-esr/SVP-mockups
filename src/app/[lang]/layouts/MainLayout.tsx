'use client'

import { Appbar } from '@/components/appbar'
import { Sidebar } from 'src/app/[lang]/components/Sidebar'
import { PerspectiveBanner, PerspectivePicker } from 'src/app/[lang]/components/Perspective'
import { OnboardingTour, useOnboarding } from 'src/app/[lang]/components/Onboarding'
import PromptDrawer from 'src/app/[lang]/components/PromptDrawer/PromptDrawer'
import ChatWidget from 'src/app/[lang]/components/ChatWidget/ChatWidget'
import { useTheme } from '@mui/material/styles'
import { Box, useMediaQuery } from '@mui/system'
import { useEffect, useState } from 'react'
import AuthenticatedRoute from '@/components/AuthenticatedRoute'
import useStore from '@/stores/global_store'
import { IAgent } from '@/types/IAgent'
import { useSearchParams } from 'next/navigation'
import { SnackbarProvider } from 'notistack'
import WebSocketListener from '@/lib/websocket/WebSocketListener'
import {
  CONTENT_MAX_WIDTH,
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_WIDTH,
  TOPBAR_HEIGHT,
  TOPBAR_HEIGHT_MOBILE,
} from './shell'

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(true) // Determines if the drawer is expanded or collapsed

  const { currentPerspective, setPerspective, setPerspectiveBySlug } = useStore(
    (state) => state.user,
  )
  const searchParams = useSearchParams()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Sur mobile, le menu est un tiroir fermé par défaut.
  useEffect(() => {
    setOpen(!isMobile)
  }, [isMobile])

  // La visite guidée présente des entrées du menu : il doit être déplié.
  const tourActive = useOnboarding((state) => state.active)
  useEffect(() => {
    if (tourActive && !isMobile) setOpen(true)
  }, [tourActive, isMobile])

  const handleToggleDrawer = () => {
    setOpen((prev) => !prev)
  }

  const { connectedUser, loading, fetchConnectedUser } = useStore(
    (state) => state.user,
  )

  useEffect(() => {
    if (!connectedUser) {
      fetchConnectedUser().catch((error) => {
        console.error('Failed to fetch connected user', error)
      })
    }
  }, [connectedUser, fetchConnectedUser])

  // if the current perspective is not set, set it to the connected user
  useEffect(() => {
    const perspectiveSlugFromUrl = searchParams?.get('perspective')
    // If the perspective is set from the url and matches
    // the current perspective, do nothing
    if (
      perspectiveSlugFromUrl &&
      currentPerspective &&
      currentPerspective.slug == perspectiveSlugFromUrl
    ) {
      return
    }
    // If the perspective is set from the url and does not match the current
    // perspective, set the perspective
    const currentPerspectiveSlug = currentPerspective?.slug
    if (
      perspectiveSlugFromUrl &&
      perspectiveSlugFromUrl !== currentPerspectiveSlug
    ) {
      setPerspectiveBySlug(perspectiveSlugFromUrl)
      return
    }
    if (connectedUser) {
      // the connected user will watch her/his own works
      setPerspective(connectedUser.person as IAgent)
    }
  }, [connectedUser, currentPerspective, setPerspective, searchParams])

  if (loading && !connectedUser) {
    return <p>Loading...</p>
  }

  return (
    <AuthenticatedRoute>
      <SnackbarProvider
        maxSnack={5}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        autoHideDuration={4000}
        preventDuplicate
      >
        <WebSocketListener />
        <PromptDrawer />
        <ChatWidget />
        <PerspectivePicker />
        <OnboardingTour />
        <Box sx={{ display: 'flex', height: '100vh' }}>
          <Appbar
            handleToggleDrawer={handleToggleDrawer}
            sidebarOpen={open}
            user={connectedUser}
          />
          <Sidebar handleToggleDrawerAction={handleToggleDrawer} open={open} />
          {/* Main Content */}
          <Box
            component='main'
            sx={{
              flexGrow: 1,
              minWidth: 0,
              padding: !isMobile ? '40px' : '24px 16px',
              marginLeft: isMobile ? 0 : `${open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH}px`,
              marginTop: `${isMobile ? TOPBAR_HEIGHT_MOBILE : TOPBAR_HEIGHT}px`,
              transition: 'margin-left 0.15s ease',
              overflowY: 'auto', // Allow scrolling if content overflows
              position: 'relative', // Ensure main is properly positioned
            }}
          >
            <Box sx={{ maxWidth: CONTENT_MAX_WIDTH, mx: 'auto' }}>
              <PerspectiveBanner />
              {children}
            </Box>
          </Box>
        </Box>
      </SnackbarProvider>
    </AuthenticatedRoute>
  )
}
export default MainLayout
