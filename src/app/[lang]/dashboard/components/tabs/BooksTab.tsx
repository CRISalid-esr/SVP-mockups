import { useMemo } from 'react'
import { Box, Grid2 as Grid, Typography } from '@mui/material'
import { t } from '@lingui/core/macro'
import { useDashboardData } from '@/app/[lang]/dashboard/components/DashboardViewContext'
import { useDashboardPeriod } from '@/app/[lang]/dashboard/components/DashboardPeriod'
import { aggregateBooks } from '@/app/[lang]/dashboard/components/charts/booksAggregates'
import DashboardSectionCard from '@/app/[lang]/dashboard/components/charts/DashboardSectionCard'
import PublicationTypesChart from '@/app/[lang]/dashboard/components/charts/PublicationTypesChart'
import BooksByYearChart from '@/app/[lang]/dashboard/components/charts/BooksByYearChart'

const BooksTab = () => {
  const { publications } = useDashboardData()
  const { range } = useDashboardPeriod()

  const agg = useMemo(
    () => aggregateBooks(publications, range),
    [publications, range],
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {agg.total === 0 ? (
        <Typography color='text.secondary'>
          {t`dashboard_books_empty`}
        </Typography>
      ) : (
        <Grid container spacing={3}>
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
