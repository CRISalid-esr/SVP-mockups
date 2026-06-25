import { Box, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { t } from '@lingui/core/macro'
import { YearRange } from './overviewAggregates'
import YearRangeSelector from './YearRangeSelector'

interface Props {
  title: string
  range: YearRange
  yearOptions: number[]
  onRangeChange: (r: YearRange) => void
}

const LabTabHeader = ({ title, range, yearOptions, onRangeChange }: Props) => {
  const theme = useTheme()
  return (
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
          {title}
        </Typography>
        <Typography variant='caption' color='text.secondary'>
          {t`dashboard_overview_lab_demo_caption`}
        </Typography>
      </Box>
      <YearRangeSelector
        value={range}
        options={yearOptions}
        onChange={onRangeChange}
      />
    </Box>
  )
}

export default LabTabHeader
