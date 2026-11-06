'use client'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import * as Lingui from '@lingui/core'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import {
  Box, Card, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Tooltip, Typography,
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import { HelpLink } from '@/app/[lang]/components/HelpLink'
import { usePerspectiveScope } from '@/app/[lang]/components/Perspective/usePerspectiveScope'
import useStore from '@/stores/global_store'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'
import { Person } from '@/types/Person'
import AffiliationsSection from './components/AffiliationsSection'
import Authorizations from './components/authorizations/'
import IdentifiersSection from './components/IdentifiersSection'
import Notifications from './components/notification'

type Section = 'identifiers' | 'affiliations' | 'notification' | 'authorizations'

const MyAccountPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const lang = Lingui.i18n.locale as ExtendedLanguageCode
  const scope = usePerspectiveScope()
  const { connectedUser, currentPerspective } = useStore((state) => state.user)

  // Le crayon du Tableau de bord ouvre cette page sur la personne consultée.
  const isOwn = scope !== 'person'
  const person = (isOwn ? connectedUser?.person : currentPerspective) as Person | null | undefined

  const sections: { value: Section; label: string; icon: React.ReactNode }[] = [
    { value: 'identifiers', label: 'Identifiants', icon: <BadgeOutlinedIcon fontSize='small' /> },
    { value: 'affiliations', label: 'Affiliations', icon: <AccountBalanceOutlinedIcon fontSize='small' /> },
    ...(isOwn
      ? [
          { value: 'notification' as const, label: t`my_account_page_notification_tab`, icon: <NotificationsNoneOutlinedIcon fontSize='small' /> },
          { value: 'authorizations' as const, label: t`my_account_page_authorizations_tab`, icon: <VerifiedUserOutlinedIcon fontSize='small' /> },
        ]
      : []),
  ]

  const requested = searchParams.get('tab')
  const selected = sections.find(({ value }) => value === requested)?.value ?? 'identifiers'

  const selectSection = (value: Section) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  if (!person) return null

  const displayName = person.getDisplayName(lang)

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 4 }}>
        {!isOwn && (
          <Tooltip title='Retour au tableau de bord'>
            <IconButton
              aria-label='Retour au tableau de bord'
              onClick={() => router.push(`/${lang}/dashboard?perspective=${encodeURIComponent(person.slug ?? '')}`)}
              sx={{ color: 'text.primary', mt: -0.5 }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
        )}
        <Typography variant='h4' component='h1'>
          {isOwn ? <Trans>side_bar_my_account</Trans> : displayName}
          {isOwn && <HelpLink topic='profile' sx={{ ml: 0.5 }} />}
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '280px minmax(0, 1fr)' }, gap: 4, alignItems: 'start' }}>
        <Card component='nav' aria-label='Rubriques du compte' sx={{ p: 1 }}>
          <List disablePadding>
            {sections.map(({ value, label, icon }) => (
              <ListItemButton
                key={value}
                selected={selected === value}
                aria-current={selected === value ? 'page' : undefined}
                onClick={() => selectSection(value)}
                sx={{
                  minHeight: 48,
                  borderRadius: 2,
                  '&:hover': { backgroundColor: 'navHover' },
                  '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: 'navActive' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: 1.5, color: 'inherit' }}>{icon}</ListItemIcon>
                <ListItemText
                  primary={label}
                  slotProps={{ primary: { sx: { fontSize: '0.875rem', fontWeight: selected === value ? 700 : 400 } } }}
                />
              </ListItemButton>
            ))}
          </List>
        </Card>

        <Box sx={{ minWidth: 0 }}>
          {selected === 'identifiers' && (
            <IdentifiersSection key={person.uid} person={person} displayName={displayName} isOwn={isOwn} />
          )}
          {selected === 'affiliations' && (
            <AffiliationsSection laboratories={person.membershipAcronyms} signatures={person.membershipSignatures} isOwn={isOwn} />
          )}
          {selected === 'notification' && <Notifications />}
          {selected === 'authorizations' && <Authorizations />}
        </Box>
      </Box>
    </Box>
  )
}
export default MyAccountPage
