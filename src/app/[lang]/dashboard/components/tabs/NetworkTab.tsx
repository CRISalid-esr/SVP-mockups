import { useEffect, useMemo, useState } from 'react'
import { Box, Slider, Stack, Typography } from '@mui/material'
import { t } from '@lingui/core/macro'
import { useDashboardData } from '@/app/[lang]/dashboard/components/DashboardViewContext'
import { getYearBounds } from '@/app/[lang]/dashboard/components/charts/overviewAggregates'
import { aggregateNetwork } from '@/app/[lang]/dashboard/components/charts/networkAggregates'
import LabTabHeader from '@/app/[lang]/dashboard/components/charts/LabTabHeader'
import DashboardSectionCard from '@/app/[lang]/dashboard/components/charts/DashboardSectionCard'
import NetworkChart from '@/app/[lang]/dashboard/components/charts/NetworkChart'

const NetworkTab = () => {
  const { publications, authors, isResearcher, researcherId } =
    useDashboardData()
  const bounds = useMemo(() => getYearBounds(publications), [publications])
  const [range, setRange] = useState({ start: bounds.min, end: bounds.max })
  // En vue chercheur (ego-réseau), on garde tous les collaborateurs directs (seuil 1).
  const [minPubs, setMinPubs] = useState(isResearcher ? 1 : 2)

  useEffect(() => {
    setRange({ start: bounds.min, end: bounds.max })
  }, [bounds.min, bounds.max])

  useEffect(() => {
    setMinPubs(isResearcher ? 1 : 2)
  }, [isResearcher])

  const data = useMemo(
    () =>
      aggregateNetwork(
        publications,
        authors,
        range,
        minPubs,
        isResearcher ? researcherId : null,
      ),
    [publications, authors, range, minPubs, isResearcher, researcherId],
  )
  const yearOptions = useMemo(
    () =>
      Array.from({ length: bounds.max - bounds.min + 1 }, (_, i) => bounds.min + i),
    [bounds],
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <LabTabHeader
        title={t`dashboard_tab_network`}
        range={range}
        yearOptions={yearOptions}
        onRangeChange={setRange}
      />
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
        {data.nodes.length > 0 ? (
          <NetworkChart data={data} />
        ) : (
          <Typography color='text.secondary'>
            {t`dashboard_network_empty`}
          </Typography>
        )}
      </DashboardSectionCard>
    </Box>
  )
}

export default NetworkTab
