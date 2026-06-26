import { useEffect, useState } from 'react'
import * as echarts from 'echarts'
import EChart from './EChart'
import type { EChartsOption } from 'echarts'
import { Box, CircularProgress } from '@mui/material'
import { t } from '@lingui/core/macro'
import { publicPath } from '@/utils/publicPath'
import { CountryItem } from './internationalAggregates'

const MAP_NAME = 'world'

const WorldChoroplethChart = ({ data }: { data: CountryItem[] }) => {
  const [ready, setReady] = useState(
    Boolean(echarts.getMap(MAP_NAME)),
  )

  useEffect(() => {
    if (echarts.getMap(MAP_NAME)) {
      setReady(true)
      return
    }
    let active = true
    fetch(publicPath('/vendor/world.json'))
      .then((r) => r.json())
      .then((geo) => {
        if (!active) return
        echarts.registerMap(MAP_NAME, geo)
        setReady(true)
      })
      .catch((e) => console.error('Failed to load world map', e))
    return () => {
      active = false
    }
  }, [])

  const points = data.filter((d) => d.echarts)
  const max = points.reduce((m, d) => Math.max(m, d.count), 0)

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: (p) => {
        const param = p as { name: string; value: number }
        const val = Number.isNaN(param.value) ? 0 : param.value
        return `${param.name} : ${val}`
      },
    },
    visualMap: {
      min: 0,
      max: max || 1,
      left: 8,
      bottom: 8,
      calculable: true,
      inRange: { color: ['#e8f0f9', '#9ec1e3', '#4C78A8', '#11304e'] },
      text: [t`dashboard_intl_map_more`, t`dashboard_intl_map_less`],
    },
    series: [
      {
        type: 'map',
        map: MAP_NAME,
        roam: true,
        emphasis: { label: { show: false } },
        itemStyle: { areaColor: '#f4f4f4', borderColor: '#d0d0d0' },
        data: points.map((d) => ({ name: d.echarts, value: d.count })),
      },
    ],
  }

  if (!ready) {
    return (
      <Box
        sx={{
          height: 440,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <EChart exportName="carte-monde" option={option} notMerge lazyUpdate style={{ height: 440 }} />
  )
}

export default WorldChoroplethChart
