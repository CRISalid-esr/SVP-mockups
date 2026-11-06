import React, { ReactNode, useState } from 'react'
import { t } from '@lingui/core/macro'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  Button,
  ButtonBase,
  Checkbox,
  InputAdornment,
  ListItemText,
  Menu,
  MenuItem,
  Popover,
  TextField,
} from '@mui/material'
import { MRT_ColumnFiltersState } from 'material-react-table'

export interface FilterOption {
  value: string
  label: ReactNode
  /** Décalage pour les listes hiérarchiques. */
  depth?: number
}

export interface FilterDefinition {
  id: string
  label: string
  options: FilterOption[]
}

interface ListFilterBarProps {
  filters: FilterDefinition[]
  /** Filtre par années, facultatif. */
  dateFilterId?: string
  dateFilterLabel?: string
  columnFilters: MRT_ColumnFiltersState
  onColumnFiltersChange: (filters: MRT_ColumnFiltersState) => void
  globalFilter: string
  onGlobalFilterChange: (value: string) => void
  /** Commandes affichées au bout de la ligne, par exemple le choix des colonnes. */
  endActions?: ReactNode
  /** Actions sur les lignes sélectionnées, affichées sous les filtres. */
  children?: ReactNode
}

const segmentSx = {
  height: 38,
  px: 1.5,
  gap: 0.5,
  fontSize: '0.875rem',
  whiteSpace: 'nowrap',
  color: 'text.primary',
  '&:hover': { backgroundColor: 'navHover' },
  '&:not(:last-of-type)': { borderRight: '1px solid', borderColor: 'divider' },
  '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -2 },
}

const FilterSegment = ({
  label,
  count,
  onClick,
}: {
  label: string
  count: number
  onClick: (event: React.MouseEvent<HTMLElement>) => void
}) => (
  <ButtonBase
    aria-haspopup='true'
    onClick={onClick}
    sx={{ ...segmentSx, fontWeight: count ? 600 : 400, backgroundColor: count ? 'navActive' : 'transparent' }}
  >
    {label}
    {count > 0 && ` (${count})`}
    <KeyboardArrowDownIcon sx={{ fontSize: 18, color: 'text.secondary' }} aria-hidden />
  </ButtonBase>
)

/** Barre de filtres de la liste : un groupe de menus déroulants et une recherche. */
const ListFilterBar = ({
  filters,
  dateFilterId,
  dateFilterLabel,
  columnFilters,
  onColumnFiltersChange,
  globalFilter,
  onGlobalFilterChange,
  endActions,
  children,
}: ListFilterBarProps) => {
  const [menu, setMenu] = useState<{ id: string; anchor: HTMLElement } | null>(null)

  const valueOf = (id: string) => columnFilters.find((filter) => filter.id === id)?.value
  const setValue = (id: string, value: unknown) => {
    const others = columnFilters.filter((filter) => filter.id !== id)
    onColumnFiltersChange(value === null ? others : [...others, { id, value }])
  }

  const toggleOption = (id: string, option: string) => {
    const selected = (valueOf(id) as string[] | undefined) ?? []
    const next = selected.includes(option)
      ? selected.filter((value) => value !== option)
      : [...selected, option]
    setValue(id, next.length ? next : null)
  }

  const [dateFrom, dateTo] = (dateFilterId ? (valueOf(dateFilterId) as (string | null)[] | undefined) : undefined) ?? []
  const setYear = (from: string | null | undefined, to: string | null | undefined) => {
    if (dateFilterId) setValue(dateFilterId, from || to ? [from ?? null, to ?? null] : null)
  }
  const yearOf = (date?: string | null) => date?.slice(0, 4) ?? ''
  const isYear = (value: string) => /^\d{4}$/.test(value)

  const openFilter = menu ? filters.find(({ id }) => id === menu.id) : undefined

  return (
    <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            display: 'flex',
            maxWidth: '100%',
            overflowX: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          {filters.map(({ id, label }) => (
            <FilterSegment
              key={id}
              label={label}
              count={((valueOf(id) as string[] | undefined) ?? []).length}
              onClick={(event) => setMenu({ id, anchor: event.currentTarget })}
            />
          ))}
          {dateFilterId && dateFilterLabel && (
            <FilterSegment
              label={dateFilterLabel}
              count={dateFrom || dateTo ? 1 : 0}
              onClick={(event) => setMenu({ id: dateFilterId, anchor: event.currentTarget })}
            />
          )}
        </Box>

        {columnFilters.length > 0 && (
          <Button variant='text' size='small' onClick={() => onColumnFiltersChange([])} sx={{ color: 'text.secondary' }}>
            {t`documents_page_reset_filters`}
          </Button>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: { sm: 'auto' } }}>
          <TextField
            size='small'
            value={globalFilter}
            onChange={(event) => onGlobalFilterChange(event.target.value)}
            placeholder={t`documents_page_search_placeholder`}
            slotProps={{
              htmlInput: { 'aria-label': t`documents_page_search_placeholder` },
              input: {
                sx: { borderRadius: 5 },
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon fontSize='small' />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: 220 }}
          />
          {endActions}
        </Box>
      </Box>

      {children}

      <Menu
        anchorEl={menu?.anchor}
        open={Boolean(openFilter)}
        onClose={() => setMenu(null)}
        slotProps={{ paper: { sx: { maxHeight: 400 } } }}
      >
        {openFilter?.options.map(({ value, label, depth = 0 }) => {
          const selected = ((valueOf(openFilter.id) as string[] | undefined) ?? []).includes(value)
          return (
            <MenuItem
              key={value}
              dense
              selected={selected}
              onClick={() => toggleOption(openFilter.id, value)}
              sx={{ pl: 1 + depth * 2 }}
            >
              <Checkbox size='small' checked={selected} tabIndex={-1} disableRipple sx={{ p: 0.5, mr: 1 }} />
              <ListItemText>{label}</ListItemText>
            </MenuItem>
          )
        })}
      </Menu>

      <Popover
        anchorEl={menu?.anchor}
        open={Boolean(dateFilterId) && menu?.id === dateFilterId}
        onClose={() => setMenu(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ display: 'flex', gap: 1, p: 2 }}>
          <TextField
            size='small'
            type='number'
            label={t`documents_page_year_from`}
            defaultValue={yearOf(dateFrom)}
            onChange={({ target: { value } }) =>
              setYear(isYear(value) ? `${value}-01-01` : null, dateTo)
            }
            sx={{ width: 110 }}
          />
          <TextField
            size='small'
            type='number'
            label={t`documents_page_year_to`}
            defaultValue={yearOf(dateTo)}
            onChange={({ target: { value } }) =>
              setYear(dateFrom, isYear(value) ? `${value}-12-31` : null)
            }
            sx={{ width: 110 }}
          />
        </Box>
      </Popover>
    </Box>
  )
}

export default ListFilterBar
