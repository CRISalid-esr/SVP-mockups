import { useEffect, useMemo, useState } from 'react'
import { Box, Grid2 as Grid, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { t } from '@lingui/core/macro'
import { useDashboardData } from '@/app/[lang]/dashboard/components/DashboardViewContext'
import { getYearBounds } from '@/app/[lang]/dashboard/components/charts/overviewAggregates'
import { aggregateBooks } from '@/app/[lang]/dashboard/components/charts/booksAggregates'
import YearRangeSelector from '@/app/[lang]/dashboard/components/charts/YearRangeSelector'
import DashboardSectionCard from '@/app/[lang]/dashboard/components/charts/DashboardSectionCard'
import PublicationTypesChart from '@/app/[lang]/dashboard/components/charts/PublicationTypesChart'
import BooksByYearChart from '@/app/[lang]/dashboard/components/charts/BooksByYearChart'

const BooksTab = () => {
  const theme = useTheme()
  const { publications } = useDashboardData()
  const bounds = useMemo(() => getYearBounds(publications), [publications])
  const [range, setRange] = useState({ start: bounds.min, end: bounds.max })

  useEffect(() => {
    setRange({ start: bounds.min, end: bounds.max })
  }, [bounds.min, bounds.max])

  const agg = useMemo(
    () => aggregateBooks(publications, range),
    [publications, range],
  )

  const yearOptions = useMemo(
    () =>
      Array.from(
        { length: bounds.max - bounds.min + 1 },
        (_, i) => bounds.min + i,
      ),
    [bounds],
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
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
            {t`dashboard_tab_books`}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {t`dashboard_overview_lab_demo_caption`}
          </Typography>
        </Box>
        <YearRangeSelector
          value={range}
          options={yearOptions}
          onChange={setRange}
        />
      </Box>

      {agg.total === 0 ? (
        <Typography color='text.secondary'>
          {t`dashboard_books_empty`}
        </Typography>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <DashboardSectionCard title={t`dashboard_books_types_title`}>
              <PublicationTypesChart data={agg.byType} chartId='ouvrages-types' />
            </DashboardSectionCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <DashboardSectionCard title={t`dashboard_books_yearly_title`}>
              <BooksByYearChart years={agg.years} series={agg.series} />
            </DashboardSectionCard>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

export default BooksTab
