import { Badge, Box, Tab, Tabs, Typography } from '@mui/material'
import { useTheme } from '@mui/system'

type TabData = {
  label: string
  value: string
  numberOfItems?: number
  color?: string
}

type TabFilterProps = {
  tabsData: TabData[]
  selectedValue: string
  onTabChange: (newValue: string) => void
  /** Commande affichée au bout de la ligne d'onglets, par exemple un lien d'aide. */
  action?: React.ReactNode
  /** Repère de la zone pour la visite guidée. */
  tourId?: string
}

const TabFilter = ({
  tabsData = [],
  selectedValue,
  onTabChange,
  action,
  tourId,
}: TabFilterProps) => {
  const theme = useTheme()

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    onTabChange(newValue) // Call the parent's handler
  }

  return (
    <Box
      data-tour={tourId}
      sx={(theme) => ({
        display: 'flex',
        alignItems: 'center',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        borderBottom: '1px solid #DDE4E1',
        marginBottom: theme.spacing(8),
      })}
    >
      <Tabs
        value={selectedValue}
        onChange={handleTabChange}
        variant='scrollable'
        scrollButtons='auto'
        aria-label='scrollable tabs'
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexGrow: 1,
          minWidth: 0,
        }}
      >
        {tabsData.map((tab, index) => (
          <Tab
            sx={{
              textTransform: 'none',
            }}
            key={index}
            label={
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Typography sx={{ mr: 1 }}>{tab.label}</Typography>
                {tab.numberOfItems && (
                  <Badge
                    sx={{
                      ' .MuiBadge-badge': {
                        color: theme.palette.white,
                        backgroundColor: tab.color,
                        position: 'initial',
                        transform: 'initial',
                      },
                    }}
                    badgeContent={tab.numberOfItems}
                    max={999_999}
                  />
                )}
              </Box>
            }
            value={tab.value}
          />
        ))}
      </Tabs>
      {action}
    </Box>
  )
}

export default TabFilter
