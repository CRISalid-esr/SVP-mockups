'use client'

import AccountTreeIcon from '@mui/icons-material/AccountTree'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import DataObjectIcon from '@mui/icons-material/DataObject'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import {
  APPS,
  buildJwtPayload,
  parseGroupPath,
  RightsUser,
  ROLES,
  SCOPE_OPTIONS,
  ScopeOption,
} from '../mockRights'

interface UserRightsDialogProps {
  user: RightsUser
  groups: string[]
  onClose: () => void
  onGroupsChange: (groups: string[]) => void
}

export default function UserRightsDialog({
  user,
  groups,
  onClose,
  onGroupsChange,
}: UserRightsDialogProps) {
  const [newRoleKey, setNewRoleKey] = useState('')
  const [newScope, setNewScope] = useState<ScopeOption | null>(null)

  const previewPath =
    newRoleKey && newScope ? `${newScope.path}/${newRoleKey}` : null
  const alreadyAssigned = previewPath !== null && groups.includes(previewPath)

  const handleAdd = () => {
    if (!previewPath || alreadyAssigned) return
    onGroupsChange([...groups, previewPath])
    setNewRoleKey('')
    setNewScope(null)
  }

  const jwtPayload = buildJwtPayload(user, groups)

  return (
    <Dialog open onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        {`Droits de ${user.firstName} ${user.lastName}`}
        <Typography variant='body2' color='text.secondary'>
          {user.email} — {user.institution}
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
          {`Attribuer un droit = ajouter l'utilisateur au groupe Keycloak correspondant. Les applications (SoVisu+, chatbot, Projects, couche MCP) n'assignent rien : elles lisent les chemins de groupes dans le JWT.`}
        </Alert>

        {/* Droits actuels */}
        <Typography variant='subtitle2' sx={{ mb: 1 }}>
          Groupes de droits
        </Typography>
        {groups.length === 0 && (
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            Aucun droit attribué.
          </Typography>
        )}
        {groups.map((groupPath) => {
          const parsed = parseGroupPath(groupPath)
          if (!parsed) return null
          const hasChildren = (parsed.scope.node.children?.length ?? 0) > 0
          return (
            <Box
              key={groupPath}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                py: 1,
                px: 1.5,
                mb: 1,
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Chip
                size='small'
                label={parsed.role.label}
                color={parsed.role.key === 'admin' ? 'secondary' : 'primary'}
                variant='outlined'
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant='body2'>
                  {parsed.scope.labels.join(' › ')}
                </Typography>
                <Typography
                  variant='caption'
                  sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                >
                  {groupPath}
                </Typography>
              </Box>
              {hasChildren && (
                <Tooltip
                  title={`Ce droit s'applique aussi aux sous-structures (${parsed.scope.node.children?.length} directes)`}
                >
                  <AccountTreeIcon fontSize='small' color='action' />
                </Tooltip>
              )}
              <Tooltip title='Retirer ce droit (retire du groupe Keycloak)'>
                <IconButton
                  size='small'
                  onClick={() =>
                    onGroupsChange(groups.filter((g) => g !== groupPath))
                  }
                >
                  <DeleteOutlineIcon fontSize='small' />
                </IconButton>
              </Tooltip>
            </Box>
          )
        })}

        <Divider sx={{ my: 2 }} />

        {/* Ajout d'un droit */}
        <Typography variant='subtitle2' sx={{ mb: 1 }}>
          Ajouter un droit
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          <TextField
            select
            size='small'
            label='Rôle'
            value={newRoleKey}
            onChange={(event) => setNewRoleKey(event.target.value)}
            sx={{ width: 240 }}
          >
            {ROLES.map((role) => (
              <MenuItem key={role.key} value={role.key}>
                <Box>
                  <Typography variant='body2'>{role.label}</Typography>
                  <Typography
                    variant='caption'
                    sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                  >
                    {role.key}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </TextField>
          <Autocomplete
            size='small'
            sx={{ flex: 1, minWidth: 280 }}
            options={SCOPE_OPTIONS}
            value={newScope}
            onChange={(_, value) => setNewScope(value)}
            getOptionLabel={(option) => option.labels.join(' › ')}
            isOptionEqualToValue={(option, value) => option.path === value.path}
            renderOption={(props, option) => (
              <li {...props} key={option.path}>
                <Box sx={{ pl: option.depth * 2 }}>
                  <Typography variant='body2'>{option.node.name}</Typography>
                  <Typography
                    variant='caption'
                    sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                  >
                    {option.path}
                  </Typography>
                </Box>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label='Périmètre (structure)'
                placeholder='Établissement, composante, labo, équipe…'
              />
            )}
          />
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            disabled={!previewPath || alreadyAssigned}
            onClick={handleAdd}
          >
            Ajouter
          </Button>
        </Box>
        {previewPath && (
          <Typography
            variant='caption'
            sx={{
              display: 'block',
              mt: 1,
              fontFamily: 'monospace',
              color: alreadyAssigned ? 'error.main' : 'text.secondary',
            }}
          >
            {alreadyAssigned
              ? `Déjà attribué : ${previewPath}`
              : `Groupe Keycloak : ${previewPath}`}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        {/* JWT décodé */}
        <Accordion variant='outlined' disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DataObjectIcon fontSize='small' color='action' />
              <Typography variant='subtitle2'>
                JWT résultant (ce que voient les applications)
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              component='pre'
              sx={{
                m: 0,
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'grey.900',
                color: 'grey.100',
                fontSize: 12,
                overflowX: 'auto',
              }}
            >
              {JSON.stringify(jwtPayload, null, 2)}
            </Box>
            <Typography variant='subtitle2' sx={{ mt: 2, mb: 1 }}>
              Interprétation par les applications
            </Typography>
            {groups.length === 0 && (
              <Typography variant='body2' color='text.secondary'>
                Aucun groupe : aucun droit dans aucune application.
              </Typography>
            )}
            {groups.map((groupPath) => {
              const parsed = parseGroupPath(groupPath)
              if (!parsed) return null
              return (
                <Box
                  key={groupPath}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    flexWrap: 'wrap',
                    py: 0.75,
                  }}
                >
                  <Typography
                    variant='caption'
                    sx={{ fontFamily: 'monospace', minWidth: 0 }}
                  >
                    {groupPath}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    →
                  </Typography>
                  <Typography variant='caption'>
                    {parsed.role.label} sur{' '}
                    {parsed.scope.node.name.split(' — ')[0]}
                    {(parsed.scope.node.children?.length ?? 0) > 0 &&
                      ' (+ sous-structures)'}
                  </Typography>
                  {parsed.role.apps.map((appKey) => (
                    <Chip
                      key={appKey}
                      size='small'
                      label={APPS[appKey].label}
                      sx={{
                        height: 18,
                        fontSize: 10,
                        color: 'white',
                        bgcolor: APPS[appKey].color,
                      }}
                    />
                  ))}
                </Box>
              )
            })}
          </AccordionDetails>
        </Accordion>
      </DialogContent>
    </Dialog>
  )
}
