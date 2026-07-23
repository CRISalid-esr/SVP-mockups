'use client'

import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import KeyIcon from '@mui/icons-material/Key'
import { Box, Chip, Paper, Tab, Tabs, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import GroupsTab from './components/GroupsTab'
import RolesTab from './components/RolesTab'
import UsersTab from './components/UsersTab'
import {
  AssignmentMap,
  APPS,
  loadAssignments,
  saveAssignments,
} from './mockRights'

/**
 * Écrans de gestion des droits — maquette de la proposition CRISalid :
 * les droits vivent dans une arborescence de groupes Keycloak qui suit
 * l'organigramme (établissement > composante > labo > équipe) avec des
 * feuilles par rôle. Les applications clientes (SoVisu+, chatbot, Projects,
 * couche MCP) n'assignent rien : elles parsent les chemins de groupes du JWT.
 */

const FLOW_STEPS = [
  { label: 'Organigramme CRISalid', caption: 'source de la hiérarchie' },
  { label: 'Groupes Keycloak', caption: 'assignation des droits' },
  { label: 'JWT (full group path)', caption: '/Étab/UFR/Labo/rôle' },
]

export default function RightsPage() {
  const [tab, setTab] = useState(0)
  const [assignments, setAssignments] =
    useState<AssignmentMap>(loadAssignments)

  useEffect(() => {
    saveAssignments(assignments)
  }, [assignments])

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
        <KeyIcon color='primary' />
        <Typography variant='h4'>Gestion des droits</Typography>
        <Chip
          size='small'
          color='primary'
          variant='outlined'
          label='Groupes Keycloak = source unique'
        />
      </Box>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
        {`Les droits sont portés par les groupes Keycloak et partagés par toutes les applications. SoVisu+ n'assigne rien : cette interface pilote les groupes (via l'admin REST API) et montre comment chaque application interprète le JWT.`}
      </Typography>

      {/* Schéma du flux */}
      <Paper
        variant='outlined'
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
          px: 2,
          py: 1.5,
          mb: 3,
          borderRadius: 2,
        }}
      >
        {FLOW_STEPS.map((step, index) => (
          <Box
            key={step.label}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            {index > 0 && <ArrowForwardIcon fontSize='small' color='action' />}
            <Box>
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                {step.label}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {step.caption}
              </Typography>
            </Box>
          </Box>
        ))}
        <ArrowForwardIcon fontSize='small' color='action' />
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {Object.values(APPS).map((app) => (
            <Chip
              key={app.label}
              size='small'
              label={app.label}
              sx={{ color: 'white', bgcolor: app.color }}
            />
          ))}
        </Box>
        <Typography variant='caption' color='text.secondary' sx={{ ml: 0.5 }}>
          interprétation seule (rôle + périmètre)
        </Typography>
      </Paper>

      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
        <Tab label='Utilisateurs' />
        <Tab label='Groupes Keycloak' />
        <Tab label='Rôles (vocabulaire transverse)' />
      </Tabs>

      {tab === 0 && (
        <UsersTab
          assignments={assignments}
          onAssignmentsChange={setAssignments}
        />
      )}
      {tab === 1 && (
        <GroupsTab
          assignments={assignments}
          onAssignmentsChange={setAssignments}
        />
      )}
      {tab === 2 && <RolesTab />}
    </Box>
  )
}
