'use client'

import { t } from '@lingui/core/macro'
import LanguageIcon from '@mui/icons-material/Language'
import { Box } from '@mui/system'
import {
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'

type Props = {
  value: ExtendedLanguageCode
}

const LanguageSwitcher = ({ value }: Props) => {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const supportedLocales = process.env.NEXT_PUBLIC_SUPPORTED_LOCALES?.split(
    ',',
  ) as unknown as Array<ExtendedLanguageCode>

  // Static messages so Lingui can extract them
  const localeTranslations: Partial<Record<ExtendedLanguageCode, string>> = {
    en: t`language_en`,
    fr: t`language_fr`,
  }

  const handleLangChange = (event: SelectChangeEvent<ExtendedLanguageCode>) => {
    const newLang = event.target.value as ExtendedLanguageCode

    const segments = pathname.split('/').filter(Boolean)
    // Replace the first segment (current lang) with the new one
    const rest = segments.slice(1).join('/')
    const qs = searchParams.toString()
    const href = `/${newLang}` + (rest ? `/${rest}` : '') + (qs ? `?${qs}` : '')
    router.push(href)
  }

  return (
    <Select
      aria-label='Language switcher'
      name='language switcher'
      variant='standard'
      disableUnderline
      IconComponent={() => null}
      value={value}
      onChange={handleLangChange}
      inputProps={{ 'aria-label': 'Language switcher' }}
      renderValue={(val) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <LanguageIcon sx={{ fontSize: 22 }} aria-hidden />
          <Box component='span' sx={{ fontSize: '0.875rem', textTransform: 'uppercase' }}>
            {String(val)}
          </Box>
        </Box>
      )}
      sx={{
        color: 'text.primary',
        borderRadius: 2,
        '&:hover': { backgroundColor: 'navHover' },
        '& .MuiSelect-select.MuiSelect-select': {
          display: 'flex',
          alignItems: 'center',
          padding: '8px',
          borderRadius: 2,
          backgroundColor: 'transparent',
        },
      }}
    >
      {supportedLocales?.map((locale) => (
        <MenuItem key={locale} value={locale}>
          <ListItemText>{localeTranslations[locale] ?? locale}</ListItemText>
        </MenuItem>
      ))}
    </Select>
  )
}
export default LanguageSwitcher
