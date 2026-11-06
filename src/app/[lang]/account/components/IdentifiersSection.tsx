'use client'

import { useState } from 'react'
import { Trans } from '@lingui/react'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import {
  Alert, Box, Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Link,
  Snackbar, TextField, Tooltip, Typography,
} from '@mui/material'
import Image from 'next/image'
import { HelpLink } from '@/app/[lang]/components/HelpLink'
import { PersonIdentifier, PersonIdentifierType } from '@/types/PersonIdentifier'
import {
  EDITABLE_IDENTIFIERS, EditableIdentifierType, usePersonIdentifiers,
} from '../usePersonIdentifiers'

type Field = (typeof EDITABLE_IDENTIFIERS)[number]
type PersonIdentifiers = ReturnType<typeof usePersonIdentifiers>

const HELPERS: Partial<Record<EditableIdentifierType, string>> = {
  [PersonIdentifierType.ID_HAL_S]: 'hal_control_helper',
}

function IdentifierForm({ field, initialValue, onCancel, onSave }: {
  field: Field
  initialValue: string
  onCancel: () => void
  onSave: (value: string) => void
}) {
  const [value, setValue] = useState(initialValue)
  const [invalid, setInvalid] = useState(false)

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = value.trim()
    if (field.pattern.test(trimmed)) onSave(trimmed)
    else setInvalid(true)
  }

  return (
    <Box component='form' onSubmit={submit} sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 1, mt: 1.5 }}>
      <TextField
        autoFocus
        size='small'
        label={`Identifiant ${field.label}`}
        placeholder={field.placeholder}
        value={value}
        error={invalid}
        helperText={invalid ? `Format attendu : ${field.format}` : undefined}
        onChange={(event) => {
          setValue(event.target.value)
          setInvalid(false)
        }}
        sx={{ flex: '1 1 260px', maxWidth: 420 }}
      />
      <Button type='submit' variant='contained'>Enregistrer</Button>
      <Button onClick={onCancel}>Annuler</Button>
    </Box>
  )
}

function IdentifierRow({ field, identifiers, canLink, onNotify, onAskDelete }: {
  field: Field
  identifiers: PersonIdentifiers
  /** Lier un compte demande de s'y connecter : seule la personne elle-même le peut. */
  canLink: boolean
  onNotify: (message: string) => void
  onAskDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const identifier = identifiers.valueOf(field.type)
  const linked = identifiers.isLinked(field.type)
  const url = identifier?.getUrl()
  const icon = new PersonIdentifier(field.type, field.placeholder).getIcon()

  const copy = async () => {
    if (!identifier) return
    await navigator.clipboard?.writeText(identifier.value)
    onNotify(`Identifiant ${field.label} copié`)
  }

  return (
    <Box sx={{ py: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
        <Image src={icon} alt='' width={28} height={28} />
        <Box sx={{ flex: '1 1 200px', minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant='body1' fontWeight={600}>{field.label}</Typography>
            {linked && <Chip size='small' color='success' label='Compte lié' />}
          </Box>
          {identifier ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {url ? (
                <Link href={url} target='_blank' rel='noopener noreferrer' underline='hover' sx={{ fontSize: '0.875rem', overflowWrap: 'anywhere' }}>
                  {identifier.value}
                </Link>
              ) : (
                <Typography variant='body1'>{identifier.value}</Typography>
              )}
              <Tooltip title='Copier'>
                <IconButton size='small' aria-label={`Copier l’identifiant ${field.label}`} onClick={copy}>
                  <ContentCopyIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          ) : (
            <Typography variant='body1' color='text.secondary'>Non renseigné</Typography>
          )}
        </Box>

        {!editing && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5 }}>
            {canLink && field.linkable && !linked && (
              <Button
                size='small'
                variant='outlined'
                onClick={() => {
                  identifiers.setLinked(field.type, true)
                  onNotify(`Compte ${field.label} lié (simulation)`)
                }}
              >
                {`Lier mon compte ${field.label}`}
              </Button>
            )}
            {identifier ? (
              <>
                <Button size='small' aria-label={`Modifier l’identifiant ${field.label}`} onClick={() => setEditing(true)}>Modifier</Button>
                <Button size='small' color='error' aria-label={`Supprimer l’identifiant ${field.label}`} onClick={onAskDelete}>Supprimer</Button>
              </>
            ) : (
              <Button size='small' aria-label={`Ajouter l’identifiant ${field.label}`} onClick={() => setEditing(true)}>Ajouter</Button>
            )}
          </Box>
        )}
      </Box>

      {editing && (
        <IdentifierForm
          field={field}
          initialValue={identifier?.value ?? ''}
          onCancel={() => setEditing(false)}
          onSave={(value) => {
            identifiers.setValue(field.type, value)
            setEditing(false)
            onNotify(`Identifiant ${field.label} enregistré`)
          }}
        />
      )}

      {canLink && field.linkable && !linked && HELPERS[field.type] && (
        <Typography variant='body2' color='text.secondary' sx={{ mt: 1, pl: { sm: 5.5 } }}>
          <Trans id={HELPERS[field.type] as string} />
        </Typography>
      )}
    </Box>
  )
}

interface IdentifiersSectionProps {
  person: Parameters<typeof usePersonIdentifiers>[0]
  displayName: string
  isOwn: boolean
}

const IdentifiersSection = ({ person, displayName, isOwn }: IdentifiersSectionProps) => {
  const identifiers = usePersonIdentifiers(person)
  const [toDelete, setToDelete] = useState<Field | null>(null)
  const [message, setMessage] = useState('')

  return (
    <Card sx={{ px: 3, pt: 3, pb: 0.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography variant='h6' component='h2'>
          {isOwn ? <Trans id='profile_identifiers_card_title' /> : `Identifiants de ${displayName}`}
        </Typography>
        <HelpLink topic='identifiers' />
      </Box>
      <Typography variant='body1' color='text.secondary' sx={{ mt: 0.5, mb: 2.5 }}>
        Ils servent à retrouver les publications et à les rattacher au bon profil.
      </Typography>

      {EDITABLE_IDENTIFIERS.map((field) => (
        <IdentifierRow
          key={field.type}
          field={field}
          identifiers={identifiers}
          canLink={isOwn}
          onNotify={setMessage}
          onAskDelete={() => setToDelete(field)}
        />
      ))}

      <Dialog open={Boolean(toDelete)} onClose={() => setToDelete(null)} maxWidth='xs' fullWidth>
        <DialogTitle>{`Supprimer l’identifiant ${toDelete?.label ?? ''} ?`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Les publications ne seront plus recherchées avec cet identifiant. Vous pourrez le saisir de nouveau.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToDelete(null)}>Annuler</Button>
          <Button
            variant='contained'
            color='error'
            onClick={() => {
              if (toDelete) {
                identifiers.setValue(toDelete.type, null)
                setMessage(`Identifiant ${toDelete.label} supprimé`)
              }
              setToDelete(null)
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(message)}
        autoHideDuration={3000}
        onClose={() => setMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity='success' onClose={() => setMessage('')}>{message}</Alert>
      </Snackbar>
    </Card>
  )
}

export default IdentifiersSection
