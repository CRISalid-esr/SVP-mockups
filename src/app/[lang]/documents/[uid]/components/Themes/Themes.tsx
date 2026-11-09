import { Box } from '@mui/material'
import Keywords from '../Keywords/Keywords'
import Domains from '../Domains/Domains'

/** Onglet « Thématiques » : les mots-clés, puis la classification OpenAlex et les domaines HAL. */
const Themes = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
    <Keywords />
    <Domains />
  </Box>
)

export default Themes
