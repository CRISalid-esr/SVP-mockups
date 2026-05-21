'use client'

import * as Lingui from '@lingui/core'
import { Box, CircularProgress, Tab, Tabs } from '@mui/material'
import { notFound, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { mockService } from '@/mocks/mockService'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'
import structuresData from '@/mocks/data/structures.json'
import {
  AProposTab,
  EquipesTab,
  MembersTable,
  MembresTab,
  PerimeterEditor,
  PublicationsChart,
  PublicationsTab,
  SidebarAbout,
  SidebarDisciplines,
  SidebarIdentifiers,
  SidebarMemberships,
  SidebarSources,
  StructureHero,
  StructureKpis,
  SubstructuresTable,
} from './components'
import { PersonRaw, StructureRaw } from './types'

export default function StructureDetailPage() {
  const rawUid = (useParams<{ uid: string }>()).uid
  const lang = Lingui.i18n.locale as ExtendedLanguageCode

  // Resolve reference nodes (uid__ref__parentUid → real uid)
  const uid = rawUid.includes('__ref__') ? rawUid.split('__ref__')[0] : rawUid

  const [loading, setLoading] = useState(true)
  const [structure, setStructure] = useState<StructureRaw | null | undefined>(undefined)
  const [members, setMembers] = useState<PersonRaw[]>([])
  const [selectedTab, setSelectedTab] = useState<string>('')

  useEffect(() => {
    const s = mockService.getResearchStructureByUid(uid) as StructureRaw | null
    const m = s ? (mockService.getStructureMembers(uid) as PersonRaw[]) : []
    setStructure(s)
    setMembers(m)

    if (s) {
      if (s.generic_type === 'institution') setSelectedTab('structures')
      else if (s.generic_type === 'institution_subdivision') setSelectedTab('unites')
      else setSelectedTab('membres')
    }

    setLoading(false)
  }, [uid])

  if (loading || structure === undefined) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='60vh'>
        <CircularProgress />
      </Box>
    )
  }

  if (structure === null) return notFound()

  const allStructures = structuresData as unknown as StructureRaw[]
  const isUnitOrTeam = structure.generic_type === 'unit' || structure.generic_type === 'team'

  const childTeams = isUnitOrTeam
    ? allStructures.filter((s) => s.generic_type === 'team' && s.parent_uid === uid)
    : []

  // Structure intermédiaire = unit/team dont d'autres structures déclarent être membres
  const isIntermediateStructure =
    isUnitOrTeam && allStructures.some((s) => s.member_of_uids?.includes(uid))

  // ── Tabs definition ─────────────────────────────────────────────────────────

  const tabs = isUnitOrTeam
    ? [
        { value: 'membres', label: `Membres (${members.length})` },
        ...(childTeams.length > 0 ? [{ value: 'equipes', label: `Équipes (${childTeams.length})` }] : []),
        { value: 'publications', label: 'Publications' },
        ...(isIntermediateStructure ? [{ value: 'perimetre', label: 'Périmètre' }] : []),
      ]
    : structure.generic_type === 'institution'
    ? [
        { value: 'structures', label: 'Structures rattachées' },
        { value: 'publications', label: 'Publications' },
        { value: 'apropos', label: 'À propos' },
        { value: 'perimetre', label: 'Périmètre' },
      ]
    : [
        { value: 'unites', label: 'Unités rattachées' },
        { value: 'apropos', label: 'À propos' },
        { value: 'perimetre', label: 'Périmètre' },
      ]

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'membres':
        return <MembresTab members={members} lang={lang} />
      case 'equipes':
        return <EquipesTab teams={childTeams} lang={lang} />
      case 'publications':
        return <PublicationsTab structure={structure} lang={lang} />
      case 'apropos':
        return <AProposTab structure={structure} lang={lang} />
      case 'structures':
      case 'unites':
        return <SubstructuresTable structure={structure} allStructures={allStructures} lang={lang} />
      case 'perimetre':
        return <PerimeterEditor structure={structure} allStructures={allStructures} lang={lang} />
      default:
        return null
    }
  }

  // ── Tabs bar ─────────────────────────────────────────────────────────────────

  const tabBar = (
    <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 2 }}>
      <Tabs
        value={selectedTab}
        onChange={(_, v) => setSelectedTab(v)}
        variant='scrollable'
        scrollButtons='auto'
        aria-label='Onglets de la structure'
        sx={{ '& .MuiTab-root': { textTransform: 'none' } }}
      >
        {tabs.map((t) => (
          <Tab key={t.value} label={t.label} value={t.value} />
        ))}
      </Tabs>
    </Box>
  )

  // ── Layout unit / team ───────────────────────────────────────────────────────

  if (isUnitOrTeam) {
    return (
      <Box>
        <StructureHero structure={structure} allStructures={allStructures} lang={lang} />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 320px' },
            gap: 2,
            alignItems: 'start',
          }}
        >
          {/* Main column */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <StructureKpis structure={structure} />
            <PublicationsChart publicationsByYear={structure.publicationsByYear ?? []} />
            <MembersTable members={members} lang={lang} structureUid={uid} />
            <Box>
              {tabBar}
              {renderTabContent()}
            </Box>
          </Box>

          {/* Sidebar */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <SidebarIdentifiers structure={structure} />
            <SidebarAbout structure={structure} lang={lang} />
            <SidebarMemberships structure={structure} allStructures={allStructures} lang={lang} />
            {(structure.disciplines ?? []).length > 0 && (
              <SidebarDisciplines disciplines={structure.disciplines!} />
            )}
            {(structure.sources ?? []).length > 0 && (
              <SidebarSources sources={structure.sources!} />
            )}
          </Box>
        </Box>
      </Box>
    )
  }

  // ── Layout institution / composante ─────────────────────────────────────────

  return (
    <Box>
      <StructureHero structure={structure} allStructures={allStructures} lang={lang} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 320px' },
          gap: 2,
          alignItems: 'start',
        }}
      >
        {/* Main column */}
        <Box>
          {tabBar}
          {renderTabContent()}
        </Box>

        {/* Sidebar */}
        <SidebarAbout structure={structure} lang={lang} />
      </Box>
    </Box>
  )
}
