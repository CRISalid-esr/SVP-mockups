'use client'

import {
  Alert,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { APPS, ROLES } from '../mockRights'

export default function RolesTab() {
  return (
    <Box>
      <Alert severity='info' sx={{ mb: 2 }}>
        {`Vocabulaire de rôles transverse à toutes les applications et chatbots du consortium. Chaque rôle peut être attribué à n'importe quel niveau de l'arborescence (établissement, composante, laboratoire, équipe) — le niveau définit le périmètre. Ce vocabulaire est le seul point de coordination nécessaire entre les applications.`}
      </Alert>

      <Table size='small'>
        <TableHead>
          <TableRow>
            <TableCell>Rôle (segment de groupe)</TableCell>
            <TableCell>Libellé</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Interprété par</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ROLES.map((role) => (
            <TableRow key={role.key} hover>
              <TableCell>
                <Chip
                  size='small'
                  label={role.key}
                  sx={{ fontFamily: 'monospace' }}
                  color={role.key === 'admin' ? 'secondary' : 'default'}
                />
              </TableCell>
              <TableCell>
                <Typography variant='body2' sx={{ fontWeight: 600 }}>
                  {role.label}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant='body2' color='text.secondary'>
                  {role.description}
                </Typography>
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {role.apps.map((appKey) => (
                    <Chip
                      key={appKey}
                      size='small'
                      label={APPS[appKey].label}
                      sx={{
                        height: 20,
                        fontSize: 11,
                        color: 'white',
                        bgcolor: APPS[appKey].color,
                      }}
                    />
                  ))}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
        {`Exemples de chemins complets : `}
        <code>/UnivParis1/admin</code>
        {` (admin global de l'établissement), `}
        <code>/NantesUniversite/UFR-Sciences/document_editor</code>
        {` (éditeur sur toute l'UFR et ses labos), `}
        <code>/UnivParis1/UFR08/LaboXYZ/account_editor</code>
        {` (gestionnaire de comptes du labo).`}
      </Typography>
    </Box>
  )
}
