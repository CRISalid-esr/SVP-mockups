import { defineMessage, t } from '@lingui/core/macro'
import { MessageDescriptor } from '@lingui/core'
import {
  Box,
  CardContent,
  Grid2 as Grid,
  MenuItem,
  Select,
  Slider,
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
import { aggregateNetwork } from '@/app/[lang]/dashboard/components/charts/networkAggregates'
import OverviewKpiCards from '@/app/[lang]/dashboard/components/charts/OverviewKpiCards'
import YearlyEvolutionChart from '@/app/[lang]/dashboard/components/charts/YearlyEvolutionChart'
import LanguagePieChart from '@/app/[lang]/dashboard/components/charts/LanguagePieChart'
import PublicationTypesChart from '@/app/[lang]/dashboard/components/charts/PublicationTypesChart'
import OpenAccessPieChart from '@/app/[lang]/dashboard/components/charts/OpenAccessPieChart'
import NetworkChart from '@/app/[lang]/dashboard/components/charts/NetworkChart'
import DashboardSectionCard from '@/app/[lang]/dashboard/components/charts/DashboardSectionCard'

const OverviewTab = () => {
  const theme = useTheme()
  const { _ } = useLingui()

  const { publications, authors, isResearcher, researcherId } =
    useDashboardData()
  const bounds = useMemo(() => getYearBounds(publications), [publications])

  const [overviewRange, setOverviewRange] = useState({
    start: bounds.min,
    end: bounds.max,
  })
  // En vue chercheur (ego-réseau), on garde tous les collaborateurs directs (seuil 1).
  const [minPubs, setMinPubs] = useState(isResearcher ? 1 : 2)

  // Recadrer la plage d'années si la perspective change le périmètre.
  useEffect(() => {
    setOverviewRange({ start: bounds.min, end: bounds.max })
  }, [bounds.min, bounds.max])

  useEffect(() => {
    setMinPubs(isResearcher ? 1 : 2)
  }, [isResearcher])

  const aggregates = useMemo(
    () => aggregateOverview(publications, overviewRange),
    [publications, overviewRange],
  )

  const network = useMemo(
    () =>
      aggregateNetwork(
        publications,
        authors,
        overviewRange,
        minPubs,
        isResearcher ? researcherId : null,
      ),
    [publications, authors, overviewRange, minPubs, isResearcher, researcherId],
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
          <DashboardSectionCard
            title={
              isResearcher
                ? t`dashboard_network_researcher_title`
                : t`dashboard_network_title`
            }
            subtitle={
              isResearcher
                ? t`dashboard_network_researcher_subtitle`
                : t`dashboard_network_subtitle`
            }
          >
            <Stack
              direction='row'
              spacing={2}
              alignItems='center'
              sx={{ mb: 1, maxWidth: 360 }}
            >
              <Typography variant='caption' sx={{ whiteSpace: 'nowrap' }}>
                {t`dashboard_network_min_pubs`}
              </Typography>
              <Slider
                value={minPubs}
                onChange={(_e, v) => setMinPubs(v as number)}
                min={1}
                max={6}
                step={1}
                marks
                valueLabelDisplay='auto'
              />
            </Stack>
            {network.nodes.length > 0 ? (
              <NetworkChart data={network} />
            ) : (
              <Typography color='text.secondary'>
                {t`dashboard_network_empty`}
              </Typography>
            )}
          </DashboardSectionCard>
        </Grid>
      </Grid>
    </Box>
  )
}

export default OverviewTab
