'use client'

import CloseIcon from '@mui/icons-material/Close'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
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

interface GroupMembersDialogProps {
  groupPath: string
  assignments: AssignmentMap
  onAssignmentsChange: (next: AssignmentMap) => void
  onClose: () => void
}

export default function GroupMembersDialog({
  groupPath,
  assignments,
  onAssignmentsChange,
  onClose,
}: GroupMembersDialogProps) {
  const [userToAdd, setUserToAdd] = useState<RightsUser | null>(null)
  const parsed = parseGroupPath(groupPath)

  const members = MOCK_USERS.filter((user) =>
    (assignments[user.id] ?? []).includes(groupPath),
  )
  const nonMembers = MOCK_USERS.filter(
    (user) => !(assignments[user.id] ?? []).includes(groupPath),
  )

  const addMember = () => {
    if (!userToAdd) return
    onAssignmentsChange({
      ...assignments,
      [userToAdd.id]: [...(assignments[userToAdd.id] ?? []), groupPath],
    })
    setUserToAdd(null)
  }

  const removeMember = (userId: string) => {
    onAssignmentsChange({
      ...assignments,
      [userId]: (assignments[userId] ?? []).filter((g) => g !== groupPath),
    })
  }

  return (
    <Dialog open onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {parsed && (
            <Chip
              size='small'
              color={parsed.role.key === 'admin' ? 'secondary' : 'primary'}
              label={parsed.role.label}
            />
          )}
          <Typography variant='h6' component='span'>
            {parsed ? parsed.scope.node.name.split(' — ')[0] : groupPath}
          </Typography>
        </Box>
        <Typography
          variant='caption'
          sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
        >
          {groupPath}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', top: 12, right: 12 }}
          aria-label='Fermer'
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Alert severity='info' sx={{ mb: 2 }}>
          {`Attribuer ce droit = ajouter l'utilisateur à ce groupe (console Keycloak ou admin REST API). Le chemin complet du groupe arrive dans le JWT à la prochaine connexion.`}
        </Alert>

        <Typography variant='subtitle2' sx={{ mb: 0.5 }}>
          {members.length === 0
            ? 'Aucun membre'
            : `${members.length} membre${members.length > 1 ? 's' : ''}`}
        </Typography>
        <List dense>
          {members.map((user) => (
            <ListItem
              key={user.id}
              secondaryAction={
                <Tooltip title='Retirer du groupe'>
                  <IconButton edge='end' onClick={() => removeMember(user.id)}>
                    <PersonRemoveIcon fontSize='small' />
                  </IconButton>
                </Tooltip>
              }
            >
              <ListItemAvatar>
                <Avatar sx={{ width: 32, height: 32, fontSize: 13 }}>
                  {user.firstName[0]}
                  {user.lastName[0]}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`${user.firstName} ${user.lastName}`}
                secondary={user.email}
              />
            </ListItem>
          ))}
        </List>

        <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
          <Autocomplete
            size='small'
            sx={{ flex: 1 }}
            options={nonMembers}
            value={userToAdd}
            onChange={(_, value) => setUserToAdd(value)}
            getOptionLabel={(user) =>
              `${user.firstName} ${user.lastName} (${user.email})`
            }
            renderInput={(params) => (
              <TextField {...params} label='Ajouter un utilisateur au groupe' />
            )}
          />
          <Button
            variant='contained'
            startIcon={<PersonAddIcon />}
            disabled={!userToAdd}
            onClick={addMember}
          >
            Ajouter
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
