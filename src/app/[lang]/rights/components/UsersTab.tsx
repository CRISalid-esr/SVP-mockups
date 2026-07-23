'use client'

import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import SearchIcon from '@mui/icons-material/Search'
import {
  Avatar,
  Box,
  Button,
  Chip,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import {
  AssignmentMap,
  MOCK_USERS,
  parseGroupPath,
  RightsUser,
} from '../mockRights'
import UserRightsDialog from './UserRightsDialog'

const AVATAR_COLORS = [
  '#00695c',
  '#5e35b1',
  '#ef6c00',
  '#455a64',
  '#c2185b',
  '#1565c0',
  '#6d4c41',
  '#2e7d32',
]

function avatarColor(userId: string): string {
  const hash = [...userId].reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

interface UsersTabProps {
  assignments: AssignmentMap
  onAssignmentsChange: (next: AssignmentMap) => void
}

export default function UsersTab({
  assignments,
  onAssignmentsChange,
}: UsersTabProps) {
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<RightsUser | null>(null)

  const normalizedSearch = search.trim().toLowerCase()
  const filteredUsers = MOCK_USERS.filter((user) => {
    if (!normalizedSearch) return true
    return `${user.firstName} ${user.lastName} ${user.email} ${user.institution}`
      .toLowerCase()
      .includes(normalizedSearch)
  })

  return (
    <Box>
      <TextField
        size='small'
        placeholder='Rechercher un utilisateur…'
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        sx={{ mb: 2, width: 360, maxWidth: '100%' }}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <SearchIcon fontSize='small' />
            </InputAdornment>
          ),
        }}
      />

      <Table size='small'>
        <TableHead>
          <TableRow>
            <TableCell>Utilisateur</TableCell>
            <TableCell>Établissement</TableCell>
            <TableCell>Droits (groupes Keycloak)</TableCell>
            <TableCell align='right' />
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredUsers.map((user) => {
            const groups = assignments[user.id] ?? []
            return (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: 13,
                        bgcolor: avatarColor(user.id),
                      }}
                    >
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </Avatar>
                    <Box>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>{user.institution}</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {groups.length === 0 && (
                      <Typography variant='caption' color='text.secondary'>
                        Aucun droit
                      </Typography>
                    )}
                    {groups.map((groupPath) => {
                      const parsed = parseGroupPath(groupPath)
                      if (!parsed) return null
                      const scopeLabel =
                        parsed.scope.node.type === 'institution'
                          ? 'Global établissement'
                          : parsed.scope.node.name.split(' — ')[0]
                      return (
                        <Tooltip key={groupPath} title={groupPath}>
                          <Chip
                            size='small'
                            variant='outlined'
                            label={`${parsed.role.label} · ${scopeLabel}`}
                            color={
                              parsed.role.key === 'admin'
                                ? 'secondary'
                                : 'default'
                            }
                          />
                        </Tooltip>
                      )
                    })}
                  </Box>
                </TableCell>
                <TableCell align='right'>
                  <Button
                    size='small'
                    startIcon={<ManageAccountsIcon />}
                    onClick={() => setSelectedUser(user)}
                  >
                    Gérer
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {selectedUser && (
        <UserRightsDialog
          user={selectedUser}
          groups={assignments[selectedUser.id] ?? []}
          onClose={() => setSelectedUser(null)}
          onGroupsChange={(nextGroups) =>
            onAssignmentsChange({
              ...assignments,
              [selectedUser.id]: nextGroups,
            })
          }
        />
      )}
    </Box>
  )
}
