'use client'

import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { Box, Card, CardContent, CardHeader, IconButton, Link, Tooltip, Typography } from '@mui/material'
import { useState } from 'react'
import { StructureRaw } from '../types'

type IdentifierRowProps = {
  label: string
  value: string | null | undefined
  href?: string
  copyValue?: string
}

function IdentifierRow({ label, value, href, copyValue }: IdentifierRowProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (copyValue) {
      navigator.clipboard.writeText(copyValue)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.75, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
      <Typography variant='caption' sx={{ color: 'text.secondary', minWidth: 100 }}>
        {label}
      </Typography>
      {value ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {href ? (
            <Link
              href={href}
              target='_blank'
              rel='noopener'
              aria-label={`Ouvrir la fiche ${label} dans un nouvel onglet`}
              variant='caption'
              fontFamily='monospace'
              fontWeight='bold'
              sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}
            >
              {value}
              <OpenInNewIcon sx={{ fontSize: 11 }} />
            </Link>
          ) : (
            <Typography variant='caption' fontFamily='monospace' fontWeight='bold'>
              {value}
            </Typography>
          )}
          {copyValue && (
            <Tooltip title={copied ? 'Copié !' : 'Copier'} placement='top'>
              <IconButton
                size='small'
                onClick={handleCopy}
                aria-label={`Copier l'identifiant ${label}`}
                sx={{ p: 0.25, opacity: 0.5, '&:hover': { opacity: 1 } }}
              >
                <ContentCopyIcon sx={{ fontSize: 12 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ) : (
        <Typography variant='caption' sx={{ color: 'text.disabled' }}>
          —
        </Typography>
      )}
    </Box>
  )
}

type Props = { structure: StructureRaw }

export default function SidebarIdentifiers({ structure }: Props) {
  const ids = structure.identifiers ?? {}

  return (
    <Card variant='outlined'>
      <CardHeader
        title={<Typography variant='subtitle2' fontWeight='bold'>Identifiants</Typography>}
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ pt: 1, pb: '12px !important' }}>
        <IdentifierRow
          label='RNSR'
          value={structure.rnsr ?? null}
          href={structure.rnsr ? `https://appliweb.dgri.education.fr/rnsr/${structure.rnsr}` : undefined}
        />
        <IdentifierRow
          label='ROR'
          value={ids.ror ?? null}
          href={ids.ror ? `https://ror.org/${ids.ror}` : undefined}
          copyValue={ids.ror}
        />
        <IdentifierRow
          label='Collection HAL'
          value={ids.halCollection ?? null}
          href={ids.halCollection ? `https://hal.science/${ids.halCollection}` : undefined}
        />
        <IdentifierRow
          label='IdRef'
          value={ids.idref ?? null}
          href={ids.idref ? `https://www.idref.fr/${ids.idref}` : undefined}
        />
        <IdentifierRow
          label='Wikidata'
          value={ids.wikidata ?? null}
          href={ids.wikidata ? `https://www.wikidata.org/wiki/${ids.wikidata}` : undefined}
        />
        <IdentifierRow
          label='Scopus ID'
          value={ids.scopusId ?? null}
          href={ids.scopusId ? `https://www.scopus.com/affil/profile.uri?afid=${ids.scopusId}` : undefined}
        />
      </CardContent>
    </Card>
  )
}
