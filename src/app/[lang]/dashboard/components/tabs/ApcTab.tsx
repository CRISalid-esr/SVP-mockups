import { useEffect, useMemo, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { t } from '@lingui/core/macro'
import { useDashboardData } from '@/app/[lang]/dashboard/components/DashboardViewContext'
import {
  aggregateOverview,
  getYearBounds,
} from '@/app/[lang]/dashboard/components/charts/overviewAggregates'
import LabTabHeader from '@/app/[lang]/dashboard/components/charts/LabTabHeader'
import DashboardSectionCard from '@/app/[lang]/dashboard/components/charts/DashboardSectionCard'
import ApcYearlyChart from '@/app/[lang]/dashboard/components/charts/ApcYearlyChart'

const ApcTab = () => {
  const { publications } = useDashboardData()
  const bounds = useMemo(() => getYearBounds(publications), [publications])
  const [range, setRange] = useState({ start: bounds.min, end: bounds.max })

  // Recadrer la plage d'années si la perspective change le périmètre.
  useEffect(() => {
    setRange({ start: bounds.min, end: bounds.max })
  }, [bounds.min, bounds.max])

  const agg = useMemo(
    () => aggregateOverview(publications, range),
    [publications, range],
  )
  const yearOptions = useMemo(
    () =>
      Array.from({ length: bounds.max - bounds.min + 1 }, (_, i) => bounds.min + i),
    [bounds],
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <LabTabHeader
        title={t`dashboard_tab_apc`}
        range={range}
        yearOptions={yearOptions}
        onRangeChange={setRange}
      />
      <DashboardSectionCard title={t`dashboard_overview_apc_title`}>
        {agg.apcByYear.length > 0 ? (
          <ApcYearlyChart data={agg.apcByYear} />
        ) : (
          <Typography color='text.secondary'>
            {t`dashboard_overview_apc_empty`}
          </Typography>
        )}
      </DashboardSectionCard>
    </Box>
  )
}

export default ApcTab
