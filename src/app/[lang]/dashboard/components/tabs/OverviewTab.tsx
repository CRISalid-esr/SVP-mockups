import { defineMessage, t } from '@lingui/core/macro'
import { MessageDescriptor } from '@lingui/core'
import {
  Box,
  CardContent,
  Grid2 as Grid,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useLingui } from '@lingui/react'
import React, { useEffect, useMemo, useState } from 'react'
import { CustomCard } from '@/components/Card'
import { useDashboardData } from '@/app/[lang]/dashboard/components/DashboardViewContext'
import {
  aggregateOverview,
  getYearBounds,
} from '@/app/[lang]/dashboard/components/charts/overviewAggregates'
import OverviewKpiCards from '@/app/[lang]/dashboard/components/charts/OverviewKpiCards'
import YearlyEvolutionChart from '@/app/[lang]/dashboard/components/charts/YearlyEvolutionChart'
import LanguagePieChart from '@/app/[lang]/dashboard/components/charts/LanguagePieChart'
import PublicationTypesChart from '@/app/[lang]/dashboard/components/charts/PublicationTypesChart'
import OpenAccessPieChart from '@/app/[lang]/dashboard/components/charts/OpenAccessPieChart'
import ApcYearlyChart from '@/app/[lang]/dashboard/components/charts/ApcYearlyChart'

const OverviewTab = () => {
  const theme = useTheme()
  const { _ } = useLingui()

  const { publications, isResearcher } = useDashboardData()
  const bounds = useMemo(() => getYearBounds(publications), [publications])

  const [overviewRange, setOverviewRange] = useState({
    start: bounds.min,
    end: bounds.max,
  })

  // Recadrer la plage d'années si la perspective change le périmètre.
  useEffect(() => {
    setOverviewRange({ start: bounds.min, end: bounds.max })
  }, [bounds.min, bounds.max])

  const aggregates = useMemo(
    () => aggregateOverview(publications, overviewRange),
    [publications, overviewRange],
  )

  const yearOptions = useMemo(
    () =>
      Array.from(
        { length: bounds.max - bounds.min + 1 },
        (_unused, i) => bounds.min + i,
      ),
    [bounds],
  )

  const SectionCard = ({
    title,
    children,
  }: {
    title: MessageDescriptor
    children: React.ReactNode
  }) => (
    <CustomCard
      header={
        <Typography
          sx={{
            color: theme.palette.primary.main,
            fontSize: theme.utils.pxToRem(20),
            fontWeight: theme.typography.fontWeightRegular,
            lineHeight: 'normal',
          }}
        >
          {_(title)}
        </Typography>
      }
    >
      <CardContent>{children}</CardContent>
    </CustomCard>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* ── Synthèse (jeu de démo, filtré selon la perspective) ───────────── */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: theme.utils.pxToRem(18),
              color: theme.palette.primary.main,
            }}
          >
            {isResearcher
              ? t`dashboard_overview_researcher_synthesis_title`
              : t`dashboard_overview_lab_synthesis_title`}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {t`dashboard_overview_lab_demo_caption`}
          </Typography>
        </Box>

        <Stack direction='row' spacing={1} alignItems='center'>
          <Typography variant='body2'>
            {t`dashboard_overview_year_from`}
          </Typography>
          <Select
            size='small'
            value={overviewRange.start}
            onChange={(e) =>
              setOverviewRange((r) => ({
                ...r,
                start: Math.min(e.target.value as number, r.end),
              }))
            }
          >
            {yearOptions.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
          <Typography variant='body2'>
            {t`dashboard_overview_year_to`}
          </Typography>
          <Select
            size='small'
            value={overviewRange.end}
            onChange={(e) =>
              setOverviewRange((r) => ({
                ...r,
                end: Math.max(e.target.value as number, r.start),
              }))
            }
          >
            {yearOptions.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </Stack>
      </Box>

      <OverviewKpiCards kpis={aggregates.kpis} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title={defineMessage`dashboard_overview_yearly_title`}>
            <YearlyEvolutionChart data={aggregates.byYear} />
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title={defineMessage`dashboard_overview_language_title`}>
            <LanguagePieChart data={aggregates.byLanguage} />
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title={defineMessage`dashboard_overview_types_title`}>
            <PublicationTypesChart data={aggregates.byType} />
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title={defineMessage`dashboard_overview_oa_title`}>
            <OpenAccessPieChart data={aggregates.byOa} />
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <SectionCard title={defineMessage`dashboard_overview_apc_title`}>
            {aggregates.apcByYear.length > 0 ? (
              <ApcYearlyChart data={aggregates.apcByYear} />
            ) : (
              <Typography color='text.secondary'>
                {t`dashboard_overview_apc_empty`}
              </Typography>
            )}
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  )
}

export default OverviewTab
