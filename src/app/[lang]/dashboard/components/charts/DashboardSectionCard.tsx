import React from 'react'
import { CardContent, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { CustomCard } from '@/components/Card'

interface Props {
  title: string
  subtitle?: string
  children: React.ReactNode
}

const DashboardSectionCard = ({ title, subtitle, children }: Props) => {
  const theme = useTheme()
  return (
    <CustomCard
      header={
        <>
          <Typography
            sx={{
              color: theme.palette.primary.main,
              fontSize: theme.utils.pxToRem(18),
              lineHeight: 'normal',
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant='caption' color='text.secondary'>
              {subtitle}
            </Typography>
          )}
        </>
      }
    >
      <CardContent>{children}</CardContent>
    </CustomCard>
  )
}

export default DashboardSectionCard
