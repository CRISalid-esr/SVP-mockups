'use client'

import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { Box, Button, ButtonBase, MenuItem, Popover, TextField } from '@mui/material'
import { useDashboardData } from '@/app/[lang]/dashboard/components/DashboardViewContext'
import { getYearBounds, YearRange } from '@/app/[lang]/dashboard/components/charts/overviewAggregates'

interface DashboardPeriod {
  range: YearRange
  bounds: { min: number; max: number }
  setRange: (range: YearRange) => void
}

const DashboardPeriodContext = createContext<DashboardPeriod | null>(null)

/** Une seule période pour tout le tableau de bord : elle suit l'utilisateur d'un onglet à l'autre. */
export const DashboardPeriodProvider = ({ children }: { children: ReactNode }) => {
  const { publications } = useDashboardData()
  const bounds = useMemo(() => getYearBounds(publications), [publications])
  const [range, setRange] = useState<YearRange>({ start: bounds.min, end: bounds.max })

  // Un autre périmètre (changement de perspective) repart de toute sa période.
  useEffect(() => {
    setRange({ start: bounds.min, end: bounds.max })
  }, [bounds.min, bounds.max])

  const value = useMemo(() => ({ range, bounds, setRange }), [range, bounds])
  return <DashboardPeriodContext.Provider value={value}>{children}</DashboardPeriodContext.Provider>
}

export const useDashboardPeriod = (): DashboardPeriod => {
  const period = useContext(DashboardPeriodContext)
  if (!period) throw new Error('useDashboardPeriod doit être utilisé dans DashboardPeriodProvider')
  return period
}

/** Filtre « Années » affiché au bout des onglets. */
export const DashboardPeriodFilter = () => {
  const { range, bounds, setRange } = useDashboardPeriod()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const years = Array.from({ length: bounds.max - bounds.min + 1 }, (_, i) => bounds.min + i)
  const isFull = range.start === bounds.min && range.end === bounds.max
  const label = range.start === range.end ? `${range.start}` : `${range.start} – ${range.end}`

  const yearField = (fieldLabel: string, value: number, onChange: (year: number) => void, allowed: number[]) => (
    <TextField
      select
      size='small'
      label={fieldLabel}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      sx={{ width: 120 }}
    >
      {allowed.map((year) => (
        <MenuItem key={year} value={year}>{year}</MenuItem>
      ))}
    </TextField>
  )

  return (
    <>
      <ButtonBase
        aria-haspopup='dialog'
        aria-label={`Années : ${label}`}
        onClick={(event) => setAnchor(event.currentTarget)}
        sx={{
          flexShrink: 0,
          ml: 2,
          mb: 1,
          height: 38,
          px: 1.5,
          gap: 0.5,
          fontSize: '0.875rem',
          whiteSpace: 'nowrap',
          color: 'text.primary',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          fontWeight: isFull ? 400 : 600,
          backgroundColor: isFull ? 'transparent' : 'navActive',
          '&:hover': { backgroundColor: isFull ? 'navHover' : 'navActive' },
          '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
        }}
      >
        Années : {label}
        <KeyboardArrowDownIcon sx={{ fontSize: 18, color: 'text.secondary' }} aria-hidden />
      </ButtonBase>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {yearField('Depuis', range.start, (start) => setRange({ start, end: range.end }), years.filter((y) => y <= range.end))}
            {yearField('Jusqu’à', range.end, (end) => setRange({ start: range.start, end }), years.filter((y) => y >= range.start))}
          </Box>
          {!isFull && (
            <Button
              size='small'
              onClick={() => setRange({ start: bounds.min, end: bounds.max })}
              sx={{ alignSelf: 'flex-start' }}
            >
              Toute la période
            </Button>
          )}
        </Box>
      </Popover>
    </>
  )
}
