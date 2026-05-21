'use client'

import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { MemberScope, PerimeterConfig, StructureRaw } from '../types'

type ScopeRowProps = {
  scope: MemberScope
  allStructures: StructureRaw[]
  lang: string
  onChange: (scope: MemberScope) => void
  onRemove: () => void
}

function ScopeRow({ scope, allStructures, lang, onChange, onRemove }: ScopeRowProps) {
  const institutions = allStructures.filter((s) => s.generic_type === 'institution')
  const candidates = allStructures.filter(
    (s) => s.generic_type === 'unit' || s.generic_type === 'team',
  )
  const filterType = scope.filter?.type ?? 'all'

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <FormControl size='small' sx={{ minWidth: 200 }}>
        <InputLabel>Structure</InputLabel>
        <Select
          value={scope.structureUid}
          label='Structure'
          onChange={(e) => onChange({ ...scope, structureUid: e.target.value as string })}
        >
          {candidates.map((s) => {
            const name =
              s.long_labels.find((l) => l.language === lang)?.value ??
              s.long_labels[0]?.value ??
              s.acronym
            return (
              <MenuItem key={s.uid} value={s.uid}>
                <Box>
                  <Typography variant='body2' component='span' fontWeight='medium'>
                    {s.acronym}
                  </Typography>
                  <Typography
                    variant='caption'
                    component='span'
                    sx={{ ml: 0.75, color: 'text.secondary' }}
                  >
                    {name}
                  </Typography>
                </Box>
              </MenuItem>
            )
          })}
        </Select>
      </FormControl>

      <FormControl size='small' sx={{ minWidth: 210 }}>
        <InputLabel>Périmètre</InputLabel>
        <Select
          value={filterType}
          label='Périmètre'
          onChange={(e) => {
            const val = e.target.value
            if (val === 'all') {
              onChange({ structureUid: scope.structureUid })
            } else if (val === 'employer') {
              onChange({
                structureUid: scope.structureUid,
                filter: { type: 'employer', institutionUid: '' },
              })
            } else if (val === 'campus') {
              onChange({
                structureUid: scope.structureUid,
                filter: { type: 'campus', campus: '' },
              })
            }
          }}
        >
          <MenuItem value='all'>Tous les membres</MenuItem>
          <MenuItem value='employer'>{`Membres employés par…`}</MenuItem>
          <MenuItem value='campus'>{`Membres localisés sur le campus…`}</MenuItem>
        </Select>
      </FormControl>

      {filterType === 'employer' && (
        <FormControl size='small' sx={{ minWidth: 180 }}>
          <InputLabel>Employeur</InputLabel>
          <Select
            value={
              (scope.filter as { type: 'employer'; institutionUid: string } | undefined)
                ?.institutionUid ?? ''
            }
            label='Employeur'
            onChange={(e) =>
              onChange({
                ...scope,
                filter: { type: 'employer', institutionUid: e.target.value as string },
              })
            }
          >
            {institutions.map((s) => (
              <MenuItem key={s.uid} value={s.uid}>
                {s.acronym}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {filterType === 'campus' && (
        <TextField
          size='small'
          label='Campus'
          value={
            (scope.filter as { type: 'campus'; campus: string } | undefined)?.campus ?? ''
          }
          onChange={(e) =>
            onChange({ ...scope, filter: { type: 'campus', campus: e.target.value } })
          }
          sx={{ minWidth: 150 }}
        />
      )}

      <IconButton
        size='small'
        onClick={onRemove}
        aria-label='Supprimer ce périmètre'
        sx={{ mt: 0.5 }}
      >
        <DeleteOutlineIcon fontSize='small' />
      </IconButton>
    </Box>
  )
}

type Props = {
  structure: StructureRaw
  allStructures: StructureRaw[]
  lang: string
}

export default function PerimeterEditor({ structure, allStructures, lang }: Props) {
  const [config, setConfig] = useState<PerimeterConfig>(
    structure.perimeterConfig ?? { scopes: [] },
  )
  const [isDirty, setIsDirty] = useState(false)
  const [saved, setSaved] = useState(false)

  const updateScope = (index: number, scope: MemberScope) => {
    const scopes = [...config.scopes]
    scopes[index] = scope
    setConfig({ scopes })
    setIsDirty(true)
    setSaved(false)
  }

  const removeScope = (index: number) => {
    setConfig({ scopes: config.scopes.filter((_, i) => i !== index) })
    setIsDirty(true)
    setSaved(false)
  }

  const addScope = () => {
    setConfig({ scopes: [...config.scopes, { structureUid: '' }] })
    setIsDirty(true)
    setSaved(false)
  }

  const handleSave = () => {
    setIsDirty(false)
    setSaved(true)
  }

  const handleCancel = () => {
    setConfig(structure.perimeterConfig ?? { scopes: [] })
    setIsDirty(false)
    setSaved(false)
  }

  return (
    <Card variant='outlined'>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography variant='subtitle1' fontWeight='bold'>
              Périmètre de comptage
            </Typography>
            <Tooltip title="Chaque ligne sélectionne un ensemble de membres. Les ensembles sont combinés en union : un membre présent dans plusieurs lignes n'est compté qu'une seule fois.">
              <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', cursor: 'help' }} />
            </Tooltip>
          </Box>
        }
        subheader="Règles de sélection des membres et publications comptabilisés pour cette structure"
        sx={{ pb: 1 }}
      />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {config.scopes.length === 0 && (
          <Alert severity='info' variant='outlined' sx={{ py: 0.5 }}>
            {`Aucun périmètre configuré — les indicateurs sont saisis manuellement.`}
          </Alert>
        )}

        {config.scopes.map((scope, i) => (
          <ScopeRow
            key={i}
            scope={scope}
            allStructures={allStructures}
            lang={lang}
            onChange={(s) => updateScope(i, s)}
            onRemove={() => removeScope(i)}
          />
        ))}

        <Button
          startIcon={<AddIcon />}
          onClick={addScope}
          size='small'
          sx={{ alignSelf: 'flex-start' }}
        >
          Ajouter une règle
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
          {saved && !isDirty && <Chip label='Enregistré' color='success' size='small' />}
          {isDirty && (
            <>
              <Button size='small' onClick={handleCancel}>
                Annuler
              </Button>
              <Button size='small' variant='contained' onClick={handleSave}>
                Enregistrer
              </Button>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
