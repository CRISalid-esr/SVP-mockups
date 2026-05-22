'use client'

import * as Lingui from '@lingui/core'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material'
import ReactECharts from 'echarts-for-react'
import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { mockService } from '@/mocks/mockService'
import { publicPath } from '@/utils/publicPath'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'

// ─── Types ───────────────────────────────────────────────────────────────────

type InstRef = { uid: string; acronym: string; names?: { language: string; value: string }[] }
type LabRef = { uid: string; acronym: string; names?: { language: string; value: string }[] }
type MembershipRaw = { researchStructure: LabRef; membershipType?: string }
type IdentifierRaw = { type: string; value: string }
type CoAuthorRaw = { uid: string; displayName: string; publicationsCount: number }
type PubYear = { year: number; open: number; closed: number; unknown: number }

type PersonData = {
  uid: string
  slug: string
  displayName: string
  firstName: string
  lastName: string
  statut?: string
  hdr?: boolean
  institution?: InstRef
  memberships: MembershipRaw[]
  identifiers: IdentifierRaw[]
  publis24m?: number
  oaRate?: number
  halRate?: number
  publicationsByYear?: PubYear[]
  researchDomains?: string[]
  keywords?: string[]
  coAuthors?: CoAuthorRaw[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#1976d2', '#388e3c', '#f57c00', '#7b1fa2', '#c62828', '#00838f', '#5d4037', '#0288d1']

function avatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

const POSITION_COLORS: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'info'> = {
  'Pr.': 'primary', 'MCF': 'primary', 'DR': 'info', 'CR': 'info',
  'Doctorant': 'secondary', 'Post-doc': 'secondary', 'ATER': 'warning', 'Ingé.': 'default',
}

const MEMBERSHIP_LABELS: Record<string, string> = {
  stat_mmb: 'statutaire',
  assoc_mmb: 'associé',
  second_mmb: 'second rattachement',
  visit_mmb: 'visiteur',
}

// ─── Identifier icon ──────────────────────────────────────────────────────────

function IdentIcon({
  icon, alt, value, absentLabel, href,
}: { icon: string; alt: string; value: string | null; absentLabel: string; href: string | null }) {
  const img = (
    <Box component='span' sx={{ display: 'inline-flex', width: 18, height: 18, alignItems: 'center', justifyContent: 'center', opacity: value ? 1 : 0.25, filter: value ? 'none' : 'grayscale(100%)' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={publicPath(icon)} alt={alt} width={16} height={16} style={{ objectFit: 'contain' }} />
    </Box>
  )
  const title = value ?? absentLabel
  if (value && href) {
    return (
      <Tooltip title={title} arrow>
        <a href={href} target='_blank' rel='noopener noreferrer' style={{ display: 'inline-flex', lineHeight: 0 }}>{img}</a>
      </Tooltip>
    )
  }
  return <Tooltip title={title} arrow><span style={{ display: 'inline-flex', cursor: 'default' }}>{img}</span></Tooltip>
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card variant='outlined' sx={{ height: '100%' }}>
      <CardContent sx={{ pb: '12px !important' }}>
        <Typography variant='caption' sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </Typography>
        <Typography variant='h4' fontWeight='bold' sx={{ my: 0.5, lineHeight: 1 }}>
          {value}
        </Typography>
        {sub && <Typography variant='caption' sx={{ color: 'text.secondary' }}>{sub}</Typography>}
      </CardContent>
    </Card>
  )
}

// ─── Publications chart ───────────────────────────────────────────────────────

function PersonPublicationsChart({ data }: { data: PubYear[] }) {
  if (data.length === 0) {
    return (
      <Card variant='outlined'>
        <CardContent>
          <Typography variant='body2' sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
            Aucune donnée de publication disponible
          </Typography>
        </CardContent>
      </Card>
    )
  }
  const years = data.map((d) => String(d.year))
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['Accès ouvert', 'Accès fermé', 'Type inconnu'], bottom: 0, textStyle: { fontSize: 12 } },
    grid: { left: 40, right: 16, top: 16, bottom: 40 },
    xAxis: { type: 'category', data: years, axisLine: { lineStyle: { color: '#DDE4E1' } }, axisTick: { show: false } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#F0F4F2' } } },
    series: [
      { name: 'Accès ouvert', type: 'bar', stack: 'total', data: data.map((d) => d.open), itemStyle: { color: '#3FB97A' } },
      { name: 'Accès fermé', type: 'bar', stack: 'total', data: data.map((d) => d.closed), itemStyle: { color: '#3B79D8' } },
      { name: 'Type inconnu', type: 'bar', stack: 'total', data: data.map((d) => d.unknown), itemStyle: { color: '#9AA39E', borderRadius: [4, 4, 0, 0] } },
    ],
  }
  return (
    <Card variant='outlined'>
      <CardHeader title={<Typography variant='subtitle1' fontWeight='bold'>Publications par année</Typography>} sx={{ pb: 0 }} />
      <CardContent sx={{ pt: 1, pb: '12px !important' }}>
        <ReactECharts option={option} style={{ height: 220 }} />
      </CardContent>
    </Card>
  )
}

// ─── Co-auteurs tab ───────────────────────────────────────────────────────────

function CoAuteursTab({ coAuthors, lang }: { coAuthors: CoAuthorRaw[]; lang: string }) {
  if (coAuthors.length === 0) {
    return <Typography variant='body2' sx={{ color: 'text.secondary', py: 3 }}>Aucune donnée de co-auteur disponible.</Typography>
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {coAuthors.map((ca) => (
        <Card key={ca.uid} variant='outlined' sx={{ '&:hover': { borderColor: 'primary.main' } }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: '10px !important' }}>
            <Button
              component={Link}
              href={`/${lang}/researchers/${ca.uid}`}
              variant='text'
              sx={{ textTransform: 'none', p: 0, fontWeight: 'bold', fontSize: '0.875rem' }}
            >
              {ca.displayName}
            </Button>
            <Chip label={`${ca.publicationsCount} publication${ca.publicationsCount > 1 ? 's' : ''} communes`} size='small' variant='outlined' />
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}

// ─── Publications tab (mock) ──────────────────────────────────────────────────

function PublicationsTab({ person, lang }: { person: PersonData; lang: string }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
        <Button
          component={Link}
          href={`/${lang}/documents`}
          size='small'
          endIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
          variant='text'
          sx={{ textTransform: 'none' }}
        >
          {`Voir toutes les publications de ${person.firstName} ${person.lastName}`}
        </Button>
      </Box>
      <Typography variant='body2' sx={{ color: 'text.secondary', py: 3, textAlign: 'center' }}>
        La liste des publications filtrée par chercheur sera disponible ici.
      </Typography>
    </Box>
  )
}

// ─── Sidebar blocks ───────────────────────────────────────────────────────────

function SidebarIdentifiers({ identifiers }: { identifiers: IdentifierRaw[] }) {
  const get = (type: string) => identifiers.find((i) => i.type === type)?.value ?? null
  const orcid = get('orcid')
  const idhals = get('id_hal_s')
  const idhali = get('idhali')
  const idref = get('idref')
  const scopus = get('scopus')

  return (
    <Card variant='outlined'>
      <CardHeader title={<Typography variant='subtitle2' fontWeight='bold'>Identifiants</Typography>} sx={{ pb: 0 }} />
      <CardContent sx={{ pt: 1, pb: '12px !important' }}>
        {[
          { label: 'ORCID', value: orcid, href: orcid ? `https://orcid.org/${orcid}` : null },
          { label: 'IdHAL', value: idhals, href: idhals ? `https://hal.science/search/?authIdHal_s=${idhals}` : null },
          { label: 'IdHAL (num.)', value: idhali, href: null },
          { label: 'IdRef', value: idref, href: idref ? `https://www.idref.fr/${idref}` : null },
          { label: 'Scopus', value: scopus, href: null },
        ].map(({ label, value, href }) => (
          <Box key={label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.75, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
            <Typography variant='caption' sx={{ color: 'text.secondary', minWidth: 110 }}>{label}</Typography>
            {value ? (
              href ? (
                <Box component='a' href={href} target='_blank' rel='noopener' sx={{ display: 'flex', alignItems: 'center', gap: 0.25, typography: 'caption', fontFamily: 'monospace', fontWeight: 'bold', color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  {value}<OpenInNewIcon sx={{ fontSize: 11 }} />
                </Box>
              ) : (
                <Typography variant='caption' fontFamily='monospace' fontWeight='bold'>{value}</Typography>
              )
            ) : (
              <Typography variant='caption' sx={{ color: 'text.disabled' }}>—</Typography>
            )}
          </Box>
        ))}
      </CardContent>
    </Card>
  )
}

function SidebarEmploi({ person, lang }: { person: PersonData; lang: string }) {
  const inst = person.institution
  if (!inst) return null
  const instName = inst.names?.find((n) => n.language === lang)?.value ?? inst.names?.[0]?.value ?? inst.acronym
  return (
    <Card variant='outlined'>
      <CardHeader title={<Typography variant='subtitle2' fontWeight='bold'>Emploi</Typography>} sx={{ pb: 0 }} />
      <CardContent sx={{ pt: 1, pb: '12px !important', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <Button
          component={Link}
          href={`/${lang}/research-structures/${inst.uid}`}
          variant='text'
          sx={{ textTransform: 'none', p: 0, fontWeight: 'bold', justifyContent: 'flex-start', fontSize: '0.875rem' }}
        >
          {instName}
        </Button>
        {person.statut && (
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>{person.statut}</Typography>
        )}
        {person.hdr && (
          <Chip label='HDR' size='small' color='success' variant='outlined' sx={{ alignSelf: 'flex-start', height: 20, fontSize: 11 }} />
        )}
      </CardContent>
    </Card>
  )
}

function SidebarAppartenances({ memberships, lang }: { memberships: MembershipRaw[]; lang: string }) {
  if (memberships.length === 0) return null
  return (
    <Card variant='outlined'>
      <CardHeader title={<Typography variant='subtitle2' fontWeight='bold'>Appartenances</Typography>} sx={{ pb: 0 }} />
      <CardContent sx={{ pt: 1, pb: '12px !important', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {memberships.map((m, idx) => {
          const lab = m.researchStructure
          const labName = lab.names?.find((n) => n.language === lang)?.value ?? lab.names?.[0]?.value ?? lab.acronym
          return (
            <Box key={idx}>
              <Button
                component={Link}
                href={`/${lang}/research-structures/${lab.uid}`}
                variant='text'
                sx={{ textTransform: 'none', p: 0, fontWeight: 'bold', justifyContent: 'flex-start', fontSize: '0.875rem' }}
              >
                {lab.acronym}
              </Button>
              <Typography variant='caption' sx={{ color: 'text.secondary', display: 'block' }}>{labName}</Typography>
              {m.membershipType && (
                <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                  {MEMBERSHIP_LABELS[m.membershipType] ?? m.membershipType}
                </Typography>
              )}
            </Box>
          )
        })}
      </CardContent>
    </Card>
  )
}

function SidebarDomaines({ domains }: { domains: string[] }) {
  if (domains.length === 0) return null
  return (
    <Card variant='outlined'>
      <CardHeader title={<Typography variant='subtitle2' fontWeight='bold'>Domaines de recherche</Typography>} sx={{ pb: 0 }} />
      <CardContent sx={{ pt: 1, pb: '12px !important', display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {domains.map((d) => <Chip key={d} label={d} size='small' />)}
      </CardContent>
    </Card>
  )
}

function SidebarMotsCles({ keywords }: { keywords: string[] }) {
  if (keywords.length === 0) return null
  return (
    <Card variant='outlined'>
      <CardHeader title={<Typography variant='subtitle2' fontWeight='bold'>Mots-clés</Typography>} sx={{ pb: 0 }} />
      <CardContent sx={{ pt: 1, pb: '12px !important', display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {keywords.map((k) => <Chip key={k} label={k} size='small' variant='outlined' />)}
      </CardContent>
    </Card>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ResearcherDetailPage() {
  const uid = useParams<{ uid: string }>().uid
  const lang = Lingui.i18n.locale as ExtendedLanguageCode

  const [loading, setLoading] = useState(true)
  const [person, setPerson] = useState<PersonData | null | undefined>(undefined)
  const [selectedTab, setSelectedTab] = useState('publications')

  useEffect(() => {
    const p = mockService.getPersonByUid(uid) as PersonData | null
    setPerson(p)
    setLoading(false)
  }, [uid])

  if (loading || person === undefined) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='60vh'>
        <Box sx={{ width: 40, height: 40, border: '3px solid', borderColor: 'primary.main', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', '@keyframes spin': { to: { transform: 'rotate(360deg)' } } }} />
      </Box>
    )
  }

  if (!person) return notFound()

  const identifiers: IdentifierRaw[] = (person.identifiers as IdentifierRaw[]) ?? []
  const getIdent = (type: string) => identifiers.find((i) => i.type === type)?.value ?? null
  const orcid = getIdent('orcid')
  const idhals = getIdent('id_hal_s')
  const idref = getIdent('idref')
  const scopus = getIdent('scopus')

  const pubsYear: PubYear[] = person.publicationsByYear ?? []
  const coAuthors: CoAuthorRaw[] = person.coAuthors ?? []
  const domains: string[] = person.researchDomains ?? []
  const keywords: string[] = person.keywords ?? []

  const instName = person.institution?.names?.find((n) => n.language === lang)?.value
    ?? person.institution?.names?.[0]?.value
    ?? person.institution?.acronym

  return (
    <Box>
      {/* Back button */}
      <Button
        component={Link}
        href={`/${lang}/researchers`}
        startIcon={<ArrowBackIcon />}
        variant='text'
        sx={{ mb: 2, textTransform: 'none', color: 'text.secondary' }}
      >
        Chercheurs
      </Button>

      {/* Hero */}
      <Card variant='outlined' sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <Avatar
            sx={{
              bgcolor: avatarColor(person.displayName),
              width: 56,
              height: 56,
              fontSize: 20,
              fontWeight: 'bold',
              flexShrink: 0,
            }}
          >
            {initials(person.firstName, person.lastName)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
              <Typography variant='h5' fontWeight='bold'>{person.displayName}</Typography>
              {person.statut && (
                <Chip label={person.statut} size='small' color={POSITION_COLORS[person.statut] ?? 'default'} variant='outlined' />
              )}
              {person.hdr && (
                <Chip label='HDR' size='small' color='success' />
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mb: 1 }}>
              {person.institution && (
                <Button
                  component={Link}
                  href={`/${lang}/research-structures/${person.institution.uid}`}
                  variant='text'
                  size='small'
                  sx={{ textTransform: 'none', p: 0, color: 'text.secondary', fontWeight: 'normal' }}
                >
                  {instName}
                </Button>
              )}
              {person.memberships.map((m, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center' }}>
                  {(idx > 0 || person.institution) && <Typography variant='body2' sx={{ color: 'divider', mx: 0.5 }}>·</Typography>}
                  <Button
                    component={Link}
                    href={`/${lang}/research-structures/${m.researchStructure.uid}`}
                    variant='text'
                    size='small'
                    sx={{ textTransform: 'none', p: 0, color: 'text.secondary', fontWeight: 'normal' }}
                  >
                    {m.researchStructure.acronym}
                  </Button>
                </Box>
              ))}
            </Box>
            {/* Identifier icons */}
            <Box sx={{ display: 'flex', gap: 0.75 }}>
              <IdentIcon icon='/icons/orcid.png' alt='ORCID' value={orcid} absentLabel={"Pas d'identifiant ORCID"} href={orcid ? `https://orcid.org/${orcid}` : null} />
              <IdentIcon icon='/icons/hal.png' alt='HAL' value={idhals} absentLabel={"Pas encore aligné dans HAL"} href={idhals ? `https://hal.science/search/?authIdHal_s=${idhals}` : null} />
              <IdentIcon icon='/icons/idref.png' alt='IdRef' value={idref} absentLabel={"Pas d'identifiant IdRef"} href={idref ? `https://www.idref.fr/${idref}` : null} />
              <IdentIcon icon='/icons/scopus.png' alt='Scopus' value={scopus} absentLabel={"Pas d'identifiant Scopus"} href={null} />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Main grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 300px' }, gap: 2, alignItems: 'start' }}>

        {/* Main column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* KPIs */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
            <KpiCard label='Publications 24 mois' value={person.publis24m != null && person.publis24m > 0 ? String(person.publis24m) : '—'} sub='24 derniers mois' />
            <KpiCard
              label='Accès ouvert'
              value={person.oaRate != null && person.oaRate > 0 ? `${person.oaRate} %` : '—'}
              sub='sur les publis 24m'
            />
            <KpiCard
              label='Dépôt HAL'
              value={person.halRate != null && person.halRate > 0 ? `${person.halRate} %` : '—'}
              sub='sur les publis 24m'
            />
          </Box>

          {/* Publications chart */}
          <PersonPublicationsChart data={pubsYear} />

          {/* Tabs */}
          <Box>
            <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 2 }}>
              <Tabs
                value={selectedTab}
                onChange={(_, v) => setSelectedTab(v)}
                sx={{ '& .MuiTab-root': { textTransform: 'none' } }}
              >
                <Tab value='publications' label='Publications' />
                <Tab value='coauteurs' label={`Co-auteurs${coAuthors.length > 0 ? ` (${coAuthors.length})` : ''}`} />
              </Tabs>
            </Box>
            {selectedTab === 'publications' && <PublicationsTab person={person} lang={lang} />}
            {selectedTab === 'coauteurs' && <CoAuteursTab coAuthors={coAuthors} lang={lang} />}
          </Box>
        </Box>

        {/* Sidebar */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <SidebarIdentifiers identifiers={identifiers} />
          <SidebarEmploi person={person} lang={lang} />
          <SidebarAppartenances memberships={person.memberships} lang={lang} />
          {domains.length > 0 && <SidebarDomaines domains={domains} />}
          {keywords.length > 0 && <SidebarMotsCles keywords={keywords} />}
        </Box>
      </Box>
    </Box>
  )
}
