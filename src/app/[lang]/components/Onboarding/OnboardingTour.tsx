'use client'

import React, { useEffect, useRef, useState } from 'react'
import { t } from '@lingui/core/macro'
import { Box, Button, Modal, Paper, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useMediaQuery } from '@mui/system'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import useStore from '@/stores/global_store'
import { helpUrl } from '../HelpLink'
import { useOnboarding } from './onboardingStore'
import { Box2D, getTourSteps, placeCard } from './tourSteps'

const CARD_WIDTH = 380
const SPOTLIGHT_PADDING = 6

interface Geometry {
  rect: Box2D | null
  cardHeight: number
  viewport: { width: number; height: number }
}

/** Zone visible de l'élément, marge comprise : une zone plus haute que l'écran y reste contenue. */
const measureTarget = (target: string, viewport: Geometry['viewport']): Box2D | null => {
  const element = document.querySelector(`[data-tour="${target}"]`)
  if (!element) return null
  const r = element.getBoundingClientRect()
  if (!r.width || !r.height) return null
  const left = Math.max(0, r.left - SPOTLIGHT_PADDING)
  const top = Math.max(0, r.top - SPOTLIGHT_PADDING)
  return {
    left,
    top,
    width: Math.min(viewport.width, r.right + SPOTLIGHT_PADDING) - left,
    height: Math.min(viewport.height, r.bottom + SPOTLIGHT_PADDING) - top,
  }
}

/**
 * Visite guidée de la première connexion : assombrit l'écran hors de la zone présentée et change de
 * page au besoin. Les pages chargeant leurs données à leur rythme, la zone est recherchée en continu :
 * tant qu'elle n'est pas là, la carte reste centrée et la visite ne se bloque jamais.
 */
const OnboardingTour = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const router = useRouter()
  const pathname = usePathname() ?? ''
  const searchParams = useSearchParams()
  const lang = pathname.split('/')[1]
  const connectedUser = useStore((state) => state.user.connectedUser)
  const { active, index, autoStart, goTo, close } = useOnboarding()

  // Sur mobile, le menu est masqué et les pages se réorganisent : une simple carte d'accueil.
  const allSteps = getTourSteps()
  const steps = isMobile ? allSteps.slice(0, 1) : allSteps
  const step = steps[Math.min(index, steps.length - 1)]
  const isLast = index >= steps.length - 1

  const cardRef = useRef<HTMLDivElement>(null)
  const [geometry, setGeometry] = useState<Geometry>({
    rect: null,
    cardHeight: 280,
    viewport: { width: 1280, height: 800 },
  })

  useEffect(() => {
    if (connectedUser) autoStart()
  }, [connectedUser, autoStart])

  const stepId = step.id
  const stepPath = step.path
  const stepTarget = step.target

  // La visite présente l'espace de la personne connectée : elle quitte toute autre perspective.
  useEffect(() => {
    if (!active || !stepPath) return
    const href = `/${lang}/${stepPath}`
    if (pathname.replace(/\/$/, '') !== href || searchParams?.has('perspective')) {
      router.push(href, { scroll: false })
    }
    // Une seule navigation par étape : le retour de la page ne doit pas la relancer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, stepId])

  useEffect(() => {
    if (!active) return
    let scrolled = false
    const update = () => {
      const viewport = { width: window.innerWidth, height: window.innerHeight }
      if (stepTarget && !scrolled) {
        const element = document.querySelector(`[data-tour="${stepTarget}"]`)
        if (element) {
          element.scrollIntoView?.({ block: 'nearest' })
          scrolled = true
        }
      }
      const next: Geometry = {
        rect: stepTarget ? measureTarget(stepTarget, viewport) : null,
        cardHeight: cardRef.current?.offsetHeight ?? 280,
        viewport,
      }
      setGeometry((current) => (JSON.stringify(current) === JSON.stringify(next) ? current : next))
    }
    update()
    const timer = window.setInterval(update, 200)
    return () => window.clearInterval(timer)
  }, [active, stepId, stepTarget])

  if (!active) return null

  const { rect, cardHeight, viewport } = geometry
  const cardWidth = Math.min(CARD_WIDTH, viewport.width - 32)
  const position = placeCard(rect, { width: cardWidth, height: cardHeight }, viewport)
  // Sans zone, le trou est de taille nulle au centre : l'ombre couvre tout l'écran.
  const hole = rect ?? { left: viewport.width / 2, top: viewport.height / 2, width: 0, height: 0 }

  return (
    <Modal
      open
      hideBackdrop
      disableScrollLock
      onClose={close}
      aria-labelledby='onboarding-title'
      aria-describedby='onboarding-body'
      sx={{ zIndex: 1400 }}
    >
      <Box tabIndex={-1} sx={{ outline: 0 }}>
        <Box
          aria-hidden
          sx={{
            position: 'fixed',
            ...hole,
            borderRadius: 1.5,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
            outline: rect ? `2px solid ${theme.palette.common.white}` : 'none',
            transition: 'all .2s ease',
            '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
          }}
        />
        <Paper
          ref={cardRef}
          elevation={12}
          sx={{
            position: 'fixed',
            ...position,
            width: cardWidth,
            p: 2.5,
            borderRadius: 2,
            transition: 'left .2s ease, top .2s ease',
            '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
          }}
        >
          <Box aria-live='polite'>
            <Typography variant='caption' color='text.secondary' component='div' sx={{ mb: 0.5 }}>
              {steps.length > 1 ? `${index + 1} / ${steps.length}` : null}
            </Typography>
            <Typography id='onboarding-title' variant='h6' component='h2' sx={{ mb: 1, lineHeight: 1.3 }}>
              {step.title}
            </Typography>
            <Typography id='onboarding-body' variant='body2' sx={{ mb: 2.5 }}>
              {step.body}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!isLast && (
              <Button size='small' color='inherit' onClick={close} sx={{ textTransform: 'none' }}>
                {t`onboarding_skip`}
              </Button>
            )}
            {isMobile && (
              <Button
                size='small'
                component='a'
                href={helpUrl()}
                target='_blank'
                rel='noopener noreferrer'
                sx={{ textTransform: 'none' }}
              >
                {t`side_bar_help`}
              </Button>
            )}
            <Box sx={{ flexGrow: 1 }} />
            {index > 0 && (
              <Button size='small' onClick={() => goTo(index - 1)} sx={{ textTransform: 'none' }}>
                {t`onboarding_previous`}
              </Button>
            )}
            <Button
              autoFocus
              size='small'
              variant='contained'
              onClick={() => (isLast ? close() : goTo(index + 1))}
              sx={{ textTransform: 'none' }}
            >
              {isLast ? t`onboarding_finish` : t`onboarding_next`}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Modal>
  )
}

export default OnboardingTour
