'use client'

import React, { useEffect, useRef, useState } from 'react'
import { t } from '@lingui/core/macro'
import {
  Box,
  CircularProgress,
  Divider,
  InputAdornment,
  ListSubheader,
  MenuItem,
  MenuList,
  Popover,
  TextField,
  Typography,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CheckIcon from '@mui/icons-material/Check'
import useStore from '@/stores/global_store'
import PerspectiveAvatar from './PerspectiveAvatar'
import { usePerspectiveUi } from './perspectiveUiStore'
import { HelpLink } from '../HelpLink'
import { StructureLevel } from './usePerspectiveScope'
import { PerspectiveEntry, toEntry, usePerspectiveNavigation } from './usePerspectiveNavigation'

const Section: React.FC<{ title: string }> = ({ title }) => (
  <ListSubheader
    disableSticky
    sx={{ lineHeight: '32px', fontSize: 13, fontWeight: 600, color: 'text.secondary', bgcolor: 'transparent' }}
  >
    {title}
  </ListSubheader>
)

/**
 * Menu de changement de perspective, rendu une seule fois dans le layout.
 * Le moteur couvre tous les chercheurs de la base et toutes les structures, quel que soit leur niveau.
 * Sans saisie, il les présente tous, précédés de mon espace et des espaces récents.
 */
const PerspectivePicker: React.FC = () => {
  const { anchorEl, closePicker, restoreVariant } = usePerspectiveUi()
  const open = Boolean(anchorEl)
  const { goTo, goHome, recents } = usePerspectiveNavigation()
  const { connectedUser, currentPerspective } = useStore((s) => s.user)
  const { fetchPeopleByName, people = [], loading: peopleLoading } = useStore((s) => s.person)
  const {
    fetchResearchStructuresByName,
    researchStructures = [],
    loading: structuresLoading,
  } = useStore((s) => s.researchStructure)

  const [query, setQuery] = useState('')
  const listRef = useRef<HTMLUListElement>(null)
  const term = query.trim()
  const searching = term.length > 0

  useEffect(() => restoreVariant(), [restoreVariant])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  useEffect(() => {
    if (!open) return
    const h = setTimeout(() => {
      fetchPeopleByName?.({ searchTerm: term, page: 1 }).catch(console.error)
      fetchResearchStructuresByName?.({ searchTerm: term, page: 1 }).catch(console.error)
    }, searching ? 300 : 0)
    return () => clearTimeout(h)
  }, [open, term, searching, fetchPeopleByName, fetchResearchStructuresByName])

  const me = connectedUser?.person ? toEntry(connectedUser.person) : null
  const otherRecents = recents.filter((r) => r.slug !== me?.slug)

  // Sans saisie, mon espace a déjà sa section : inutile de le répéter parmi les chercheurs.
  const personResults = (people.map(toEntry).filter(Boolean) as PerspectiveEntry[]).filter(
    (p) => searching || p.slug !== me?.slug,
  )
  const structureResults = researchStructures.map(toEntry).filter(Boolean) as PerspectiveEntry[]
  const structureSections: { level: StructureLevel; title: string }[] = [
    { level: 'institution', title: t`perspective_picker_institutions` },
    { level: 'unit', title: t`perspective_picker_units` },
    { level: 'other', title: t`perspective_picker_other_structures` },
    { level: 'team', title: t`perspective_picker_teams` },
  ]
  const loading = peopleLoading || structuresLoading

  const select = (entry: PerspectiveEntry) => {
    closePicker()
    if (me && entry.slug === me.slug) goHome()
    else goTo(entry)
  }

  const item = (entry: PerspectiveEntry, hint?: string, keyPrefix = '') => {
    const active = currentPerspective?.slug === entry.slug
    return (
      <MenuItem
        key={`${keyPrefix}${entry.kind}-${entry.slug}`}
        selected={active}
        onClick={() => select(entry)}
        sx={{ gap: 1.5, py: 1, borderRadius: 1, mx: 1 }}
      >
        <PerspectiveAvatar kind={entry.kind} label={entry.label} size={32} />
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant='body2' fontWeight={500} noWrap>
            {entry.label}
          </Typography>
          {(hint || entry.sublabel) && (
            <Typography variant='caption' color='text.secondary' noWrap component='div'>
              {hint ?? entry.sublabel}
            </Typography>
          )}
        </Box>
        {active && <CheckIcon fontSize='small' color='primary' aria-label={t`perspective_picker_active_aria`} />}
      </MenuItem>
    )
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={closePicker}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      slotProps={{ paper: { sx: { width: 360, maxWidth: 'calc(100vw - 32px)', mt: 1, borderRadius: 2 } } }}
      sx={{ zIndex: (t) => t.zIndex.drawer + 3 }}
    >
      <Box sx={{ p: 1.5, pb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <TextField
          autoFocus
          fullWidth
          size='small'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              listRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
            }
          }}
          placeholder={t`perspective_picker_placeholder`}
          inputProps={{ 'aria-label': t`perspective_picker_search_aria` }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon fontSize='small' />
              </InputAdornment>
            ),
            endAdornment: loading ? <CircularProgress size={16} /> : null,
          }}
        />
        <HelpLink topic='perspective' />
      </Box>
      <Divider />
      <MenuList ref={listRef} dense sx={{ maxHeight: 420, overflowY: 'auto', py: 0.5 }}>
        {!searching && me && [<Section key='s-me' title={t`perspective_switcher_own`} />, item(me, t`perspective_picker_me_hint`)]}
        {!searching && otherRecents.length > 0 && [
          <Section key='s-rec' title={t`perspective_picker_recents`} />,
          ...otherRecents.map((r) => item(r, undefined, 'recent')),
        ]}
        {personResults.length > 0 && [
          <Section key='s-p' title={t`perspective_picker_people`} />,
          ...personResults.map((p) => item(p)),
        ]}
        {structureSections.map(({ level, title }) => {
          const entries = structureResults.filter((s) => s.level === level)
          return entries.length > 0
            ? [<Section key={`s-${level}`} title={title} />, ...entries.map((s) => item(s))]
            : null
        })}
        {searching && !loading && personResults.length + structureResults.length === 0 && (
          <Typography variant='body2' color='text.secondary' sx={{ px: 2, py: 2 }}>
            {t`perspective_picker_no_result`}
          </Typography>
        )}
      </MenuList>
      {!searching && (
        <>
          <Divider />
          <Typography variant='caption' color='text.secondary' component='p' sx={{ px: 2, py: 1.25 }}>
            {t`perspective_picker_help`}
          </Typography>
        </>
      )}
    </Popover>
  )
}

export default PerspectivePicker
