'use client'

import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import ApartmentIcon from '@mui/icons-material/Apartment'
import GroupsIcon from '@mui/icons-material/Groups'
import KeyIcon from '@mui/icons-material/Key'
import ScienceIcon from '@mui/icons-material/Science'
import SyncIcon from '@mui/icons-material/Sync'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Link,
  Typography,
} from '@mui/material'
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import {
  AssignmentMap,
  ORG_TREE,
  ORG_TYPE_LABELS,
  OrgNode,
  ROLES,
} from '../mockRights'
import GroupMembersDialog from './GroupMembersDialog'

const TYPE_ICONS = {
  institution: AccountBalanceIcon,
  component: ApartmentIcon,
  laboratory: ScienceIcon,
  team: GroupsIcon,
} as const

interface GroupsTabProps {
  assignments: AssignmentMap
  onAssignmentsChange: (next: AssignmentMap) => void
}

export default function GroupsTab({
  assignments,
  onAssignmentsChange,
}: GroupsTabProps) {
  const { enqueueSnackbar } = useSnackbar()
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState('12/07/2026 06:00')
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)

  const memberCount = (groupPath: string) =>
    Object.values(assignments).filter((groups) => groups.includes(groupPath))
      .length

  const handleSync = () => {
    setSyncing(true)
    setTimeout(() => {
      setSyncing(false)
      setLastSync(
        new Date().toLocaleString('fr-FR', {
          dateStyle: 'short',
          timeStyle: 'short',
        }),
      )
      enqueueSnackbar(
        'Arborescence synchronisée depuis l’organigramme CRISalid (32 groupes, aucun changement)',
        { variant: 'success' },
      )
    }, 1500)
  }

  const renderOrgNode = (node: OrgNode, parentPath: string) => {
    const path = `${parentPath}/${node.id}`
    const Icon = TYPE_ICONS[node.type]
    return (
      <TreeItem
        key={path}
        itemId={path}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.25 }}>
            <Icon fontSize='small' color='action' />
            <Typography variant='body2' sx={{ fontWeight: 600 }}>
              {node.name}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {ORG_TYPE_LABELS[node.type]}
            </Typography>
          </Box>
        }
      >
        {ROLES.map((role) => {
          const groupPath = `${path}/${role.key}`
          const count = memberCount(groupPath)
          return (
            <TreeItem
              key={groupPath}
              itemId={groupPath}
              onClick={() => setSelectedGroup(groupPath)}
              label={
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.25 }}
                >
                  <KeyIcon
                    sx={{ fontSize: 16 }}
                    color={count > 0 ? 'primary' : 'disabled'}
                  />
                  <Typography
                    variant='body2'
                    sx={{
                      fontFamily: 'monospace',
                      color: count > 0 ? 'text.primary' : 'text.secondary',
                    }}
                  >
                    {role.key}
                  </Typography>
                  <Chip
                    size='small'
                    label={count === 0 ? 'aucun membre' : `${count} membre${count > 1 ? 's' : ''}`}
                    color={count > 0 ? 'primary' : 'default'}
                    variant={count > 0 ? 'filled' : 'outlined'}
                    sx={{ height: 18, fontSize: 10 }}
                  />
                </Box>
              }
            />
          )
        })}
        {(node.children ?? []).map((child) => renderOrgNode(child, path))}
      </TreeItem>
    )
  }

  return (
    <Box>
      <Alert
        severity='info'
        sx={{ mb: 2 }}
        action={
          <Button
            size='small'
            color='inherit'
            startIcon={
              syncing ? <CircularProgress size={14} color='inherit' /> : <SyncIcon />
            }
            disabled={syncing}
            onClick={handleSync}
          >
            {syncing ? 'Synchronisation…' : 'Resynchroniser'}
          </Button>
        }
      >
        {`Cette arborescence de groupes est générée automatiquement dans Keycloak depuis l'organigramme organisationnel CRISalid (admin REST API). Dernière synchronisation : ${lastSync}.`}
      </Alert>

      <Typography variant='body2' color='text.secondary' sx={{ mb: 1.5 }}>
        {`Les établissements (ou super-établissements : EPE, Comue) sont à la racine. Chaque niveau porte des feuilles par rôle : cliquer sur une feuille pour gérer ses membres. Un droit attribué à un niveau s'applique à toutes ses sous-structures.`}
      </Typography>

      <SimpleTreeView
        defaultExpandedItems={[
          '/NantesUniversite',
          '/NantesUniversite/UFR-Sciences',
          '/NantesUniversite/UFR-Sciences/LS2N',
        ]}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          p: 1.5,
          maxHeight: 560,
          overflowY: 'auto',
        }}
      >
        {ORG_TREE.map((node) => renderOrgNode(node, ''))}
      </SimpleTreeView>

      <Alert severity='warning' variant='outlined' sx={{ mt: 2 }}>
        <strong>Administration déléguée :</strong>{' '}
        {`avec les `}
        <Link
          href='https://www.keycloak.org/2025/05/fgap-kc-26-2'
          target='_blank'
          rel='noreferrer'
        >
          fine-grained admin permissions (Keycloak 26.2)
        </Link>
        {`, un gestionnaire local (composante, labo) peut administrer les membres de sa seule branche, directement dans la console Keycloak — sans être admin du realm.`}
      </Alert>

      {selectedGroup && (
        <GroupMembersDialog
          groupPath={selectedGroup}
          assignments={assignments}
          onAssignmentsChange={onAssignmentsChange}
          onClose={() => setSelectedGroup(null)}
        />
      )}
    </Box>
  )
}
