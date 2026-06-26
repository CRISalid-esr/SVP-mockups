import { useEffect, useState } from 'react'
import * as echarts from 'echarts'
import EChart from './EChart'
import type { EChartsOption } from 'echarts'
import { Box, CircularProgress } from '@mui/material'
import { publicPath } from '@/utils/publicPath'
import { FlowMapAggregates } from './internationalAggregates'

const MAP_NAME = 'world'

const FlowMapChart = ({ data }: { data: FlowMapAggregates }) => {
  const [ready, setReady] = useState(Boolean(echarts.getMap(MAP_NAME)))

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

  const max = data.maxValue || 1
  const width = (v: number) => 1 + Math.round((v / max) * 5)

  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: (p) => {
        const param = p as {
          seriesType: string
          name: string
          value: number[]
          data: { value?: number }
        }
        if (param.seriesType === 'lines') {
          return `${param.data?.value ?? ''}`
        }
        return `${param.name} : ${param.value?.[2] ?? 0}`
      },
    },
    geo: {
      map: MAP_NAME,
      roam: true,
      itemStyle: { areaColor: '#f4f4f4', borderColor: '#d8d8d8' },
      emphasis: {
        label: { show: false },
        itemStyle: { areaColor: '#e9eef5' },
      },
    },
    series: [
      {
        name: 'flux',
        type: 'lines',
        coordinateSystem: 'geo',
        zlevel: 1,
        effect: {
          show: true,
          period: 5,
          trailLength: 0.4,
          symbol: 'arrow',
          symbolSize: 5,
        },
        lineStyle: { color: '#F58518', opacity: 0.45, curveness: 0.3 },
        data: data.points.map((pt) => ({
          coords: [data.origin.coord, pt.coord],
          value: pt.value,
          lineStyle: { width: width(pt.value) },
        })),
      },
      {
        name: 'partenaires',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: 2,
        rippleEffect: { brushType: 'stroke', scale: 3 },
        symbolSize: (val: number[]) => 6 + (val[2] / max) * 22,
        itemStyle: { color: '#F58518' },
        data: data.points.map((pt) => ({
          name: pt.name,
          value: [...pt.coord, pt.value],
        })),
      },
      {
        name: 'origine',
        type: 'scatter',
        coordinateSystem: 'geo',
        zlevel: 3,
        symbol: 'pin',
        symbolSize: 30,
        itemStyle: { color: '#4C78A8' },
        label: {
          show: true,
          formatter: data.origin.name,
          position: 'right',
          fontSize: 10,
          color: '#333',
        },
        data: [{ name: data.origin.name, value: [...data.origin.coord, 0] }],
      },
    ],
  }

  if (!ready) {
    return (
      <Box
        sx={{
          height: 460,
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
    <EChart exportName="carte-flux" option={option} notMerge lazyUpdate style={{ height: 460 }} />
  )
}

export default FlowMapChart
