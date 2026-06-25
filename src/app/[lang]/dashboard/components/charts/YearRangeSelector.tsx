import { MenuItem, Select, Stack, Typography } from '@mui/material'
import { t } from '@lingui/core/macro'
import { YearRange } from './overviewAggregates'

interface Props {
  value: YearRange
  options: number[]
  onChange: (r: YearRange) => void
}

const YearRangeSelector = ({ value, options, onChange }: Props) => (
  <Stack direction='row' spacing={1} alignItems='center'>
    <Typography variant='body2'>{t`dashboard_overview_year_from`}</Typography>
    <Select
      size='small'
      value={value.start}
      onChange={(e) =>
        onChange({
          start: Math.min(e.target.value as number, value.end),
          end: value.end,
        })
      }
    >
      {options.map((y) => (
        <MenuItem key={y} value={y}>
          {y}
        </MenuItem>
      ))}
    </Select>
    <Typography variant='body2'>{t`dashboard_overview_year_to`}</Typography>
    <Select
      size='small'
      value={value.end}
      onChange={(e) =>
        onChange({
          start: value.start,
          end: Math.max(e.target.value as number, value.start),
        })
      }
    >
      {options.map((y) => (
        <MenuItem key={y} value={y}>
          {y}
        </MenuItem>
      ))}
    </Select>
  </Stack>
)

export default YearRangeSelector
