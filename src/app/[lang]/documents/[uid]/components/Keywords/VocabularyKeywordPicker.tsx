import { useMemo, useState } from 'react'
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { Add, HelpOutline, Search } from '@mui/icons-material'
import {
  AddedKeyword,
  MOCK_VOCABULARIES,
  MockVocabConcept,
  MockVocabulary,
  searchMockConcepts,
  vocabularyOf,
} from './mockVocabularies'

/** Logo du vocabulaire, ou pastille à ses initiales quand il n'en a pas. */
export const VocabLogo = ({ vocab, size = 20 }: { vocab: MockVocabulary; size?: number }) =>
  vocab.icon ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={vocab.icon} alt='' width={size} height={size} style={{ objectFit: 'contain', flexShrink: 0 }} />
  ) : (
    <Box
      aria-hidden
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '50%',
        bgcolor: vocab.color,
        color: '#fff',
        fontSize: size * 0.45,
        fontWeight: 700,
        display: 'grid',
        placeItems: 'center',
      }}
    >
      {vocab.short.slice(0, 2).toUpperCase()}
    </Box>
  )

type Option = MockVocabConcept | { free: true; label: string }

const isFree = (option: Option): option is { free: true; label: string } => 'free' in option

/**
 * Maquette de l'ajout de mots-clés : choix d'un ou plusieurs vocabulaires contrôlés,
 * recherche dans ces vocabulaires, ou mot-clé libre.
 */
const VocabularyKeywordPicker = ({
  existingLabels,
  onAdd,
}: {
  existingLabels: string[]
  onAdd: (keyword: AddedKeyword) => void
}) => {
  const [selectedVocabs, setSelectedVocabs] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [value, setValue] = useState<Option | null>(null)

  const options = useMemo<Option[]>(() => {
    const found = searchMockConcepts(input, selectedVocabs).filter(
      (concept) => !existingLabels.includes(concept.label.toLowerCase()),
    )
    const typed = input.trim()
    const exact = found.some((concept) => concept.label.toLowerCase() === typed.toLowerCase())
    return typed.length >= 2 && !exact ? [...found, { free: true, label: typed }] : found
  }, [input, selectedVocabs, existingLabels])

  const toggleVocab = (code: string) =>
    setSelectedVocabs((current) =>
      current.includes(code) ? current.filter((c) => c !== code) : [...current, code],
    )

  const add = (option: Option | null) => {
    if (!option) return
    onAdd(
      isFree(option)
        ? { id: `free-${Date.now()}`, label: option.label, vocab: null }
        : { id: `${option.id}-${Date.now()}`, label: option.label, vocab: option.vocab, notation: option.notation },
    )
    setValue(null)
    setInput('')
  }

  const scope =
    selectedVocabs.length === 0
      ? 'tous les vocabulaires'
      : selectedVocabs.map((code) => vocabularyOf(code)?.short).join(', ')

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box>
        <Typography variant='subtitle1' component='h3' fontWeight={600}>
          Ajouter des mots-clés
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Sélectionnez un ou plusieurs vocabulaires contrôlés, puis cherchez un terme. Sans sélection, la
          recherche porte sur tous.
        </Typography>
      </Box>

      <Box
        role='group'
        aria-label='Vocabulaires contrôlés'
        sx={{
          display: 'grid',
          gap: 1,
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        {MOCK_VOCABULARIES.map((vocab) => {
          const checked = selectedVocabs.includes(vocab.code)
          return (
            <Box
              key={vocab.code}
              component='label'
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                pl: 0.5,
                pr: 0.5,
                py: 0.5,
                border: 1,
                borderColor: checked ? 'primary.main' : 'divider',
                bgcolor: checked ? 'navActive' : 'transparent',
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': { borderColor: 'primary.main' },
              }}
            >
              <Checkbox
                size='small'
                checked={checked}
                onChange={() => toggleVocab(vocab.code)}
                inputProps={{ 'aria-label': vocab.name }}
              />
              <VocabLogo vocab={vocab} />
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, minWidth: 0 }} noWrap>
                {vocab.name}
              </Typography>
              <Tooltip
                title={
                  <>
                    {`${vocab.name} — ${vocab.org}. `}
                    <Link href={vocab.url} target='_blank' rel='noopener noreferrer' color='inherit'>
                      Consulter le vocabulaire
                    </Link>
                  </>
                }
              >
                <IconButton size='small' sx={{ ml: 'auto' }} aria-label={`À propos de ${vocab.name}`}>
                  <HelpOutline fontSize='small' />
                </IconButton>
              </Tooltip>
            </Box>
          )
        })}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <Autocomplete<Option, false, false, true>
          freeSolo
          fullWidth
          options={options}
          value={value}
          inputValue={input}
          filterOptions={(all) => all}
          onInputChange={(_event, text) => setInput(text)}
          onChange={(_event, option) => {
            if (typeof option === 'string') add(option.trim().length >= 2 ? { free: true, label: option.trim() } : null)
            else add(option)
          }}
          groupBy={(option) => (isFree(option) ? 'Mot-clé libre' : (vocabularyOf(option.vocab)?.name ?? ''))}
          getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
          noOptionsText={input.trim().length < 2 ? 'Saisissez au moins deux lettres' : 'Aucun terme trouvé'}
          renderOption={({ key, ...props }, option) => (
            <Box component='li' key={key} {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {isFree(option) ? (
                <>
                  <Add fontSize='small' color='action' />
                  <Typography sx={{ fontSize: '0.875rem' }}>{`Ajouter « ${option.label} » comme mot-clé libre`}</Typography>
                </>
              ) : (
                <>
                  {vocabularyOf(option.vocab) && <VocabLogo vocab={vocabularyOf(option.vocab)!} size={18} />}
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{option.label}</Typography>
                    {option.notation && (
                      <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.75rem' }} noWrap>
                        {option.notation}
                      </Typography>
                    )}
                  </Box>
                </>
              )}
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              size='small'
              placeholder={`Chercher dans ${scope}`}
              inputProps={{ ...params.inputProps, 'aria-label': 'Chercher un mot-clé' }}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position='start'>
                    <Search fontSize='small' />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
        <Button
          variant='contained'
          disableElevation
          startIcon={<Add />}
          disabled={!value && input.trim().length < 2}
          onClick={() => add(value ?? (input.trim().length >= 2 ? { free: true, label: input.trim() } : null))}
          sx={{ height: 40, flexShrink: 0 }}
        >
          Ajouter
        </Button>
      </Box>
    </Box>
  )
}

export default VocabularyKeywordPicker
