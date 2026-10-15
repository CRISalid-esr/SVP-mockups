'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import { Alert, Box, Button, Snackbar, Tab, Tabs, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { AccountTree, Apartment, PersonOutline, RestartAlt, ViewList, VisibilityOutlined } from '@mui/icons-material'
import * as Lingui from '@lingui/core'
import DocumentHeader from '@/app/[lang]/documents/components/DocumentHeader'
import useStore from '@/stores/global_store'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'
import { dashboardMockService } from '@/mocks/dashboardMockService'
import ThemesList from './components/ThemesList'
import ThemeEditor from './components/ThemeEditor'
import PublicPreview from './components/PublicPreview'
import ThemeProposalsWorkshop, { WorkshopResult } from './components/ThemeProposalsWorkshop'
import LabView from './components/Lab/LabView'
import { LAB_INFO } from './components/Lab/labMock'
import { loadProfile, resetProfile, saveProfile } from './storage'
import { EMPTY_PROFILE, ResearchProfile, ResearchTheme, TEAL, ThemeRelation, blankTheme } from './types'

const JourneyGraph = dynamic(() => import('./components/JourneyGraph'), {
  ssr: false,
  loading: () => (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography color="text.secondary">Chargement du graphe de parcours…</Typography>
    </Box>
  ),
})

type TabKey = 'themes' | 'graph' | 'preview'
type PageView = 'researcher' | 'lab'

interface EditingState {
  theme: ResearchTheme
  isNew: boolean
}

export default function ExpertiseV2Page() {
  const { currentPerspective } = useStore((state) => state.user)
  const lang = Lingui.i18n.locale as ExtendedLanguageCode
  const researcherName = currentPerspective?.getDisplayName(lang) || 'Jean Dupont'
  const labName = dashboardMockService.getLab().name

  const [profile, setProfile] = useState<ResearchProfile>(EMPTY_PROFILE)
  const [mounted, setMounted] = useState(false)
  const [tab, setTab] = useState<TabKey>('themes')
  const [view, setView] = useState<PageView>('researcher')
  const [editing, setEditing] = useState<EditingState | null>(null)
  const [workshopOpen, setWorkshopOpen] = useState(false)
  const [snackbar, setSnackbar] = useState('')

  useEffect(() => {
    setProfile(loadProfile())
    setMounted(true)
  }, [])

  const commit = useCallback((next: ResearchProfile) => setProfile(saveProfile(next)), [])

  const upsertTheme = (theme: ResearchTheme, message: string) => {
    const exists = profile.themes.some((t) => t.id === theme.id)
    commit({
      ...profile,
      themes: exists ? profile.themes.map((t) => (t.id === theme.id ? theme : t)) : [...profile.themes, theme],
    })
    setEditing(null)
    setSnackbar(message)
  }

  const deleteTheme = (id: string) => {
    const { [id]: _removed, ...positions } = profile.positions ?? {}
    commit({
      ...profile,
      themes: profile.themes.filter((t) => t.id !== id),
      relations: profile.relations.filter((r) => r.source !== id && r.target !== id),
      positions,
    })
    setEditing(null)
    setSnackbar('Thème supprimé')
  }

  /** Résultat de l'atelier : nouveaux thèmes en brouillon + publications rattachées à des thèmes existants. */
  const applyWorkshop = ({ newThemes, attachments }: WorkshopResult) => {
    const themes = profile.themes.map((t) => {
      const a = attachments.find((x) => x.themeId === t.id)
      if (!a) return t
      const yearFrom = t.yearFrom == null ? a.yearFrom : a.yearFrom == null ? t.yearFrom : Math.min(t.yearFrom, a.yearFrom)
      const yearTo = t.yearTo == null || a.yearTo == null ? null : Math.max(t.yearTo, a.yearTo)
      return {
        ...t,
        yearFrom,
        yearTo,
        publicationIds: [...new Set([...(t.publicationIds ?? []), ...a.publicationIds])],
        studiedPeriods: [...t.studiedPeriods, ...a.studiedPeriods.filter((s) => !t.studiedPeriods.some((e) => e.label === s.label))],
      }
    })
    commit({ ...profile, themes: [...themes, ...newThemes] })
    setWorkshopOpen(false)
    const parts = [
      newThemes.length ? `${newThemes.length} thème${newThemes.length > 1 ? 's' : ''} ajouté${newThemes.length > 1 ? 's' : ''} en brouillon` : null,
      attachments.length ? `${attachments.length} thème${attachments.length > 1 ? 's' : ''} existant${attachments.length > 1 ? 's' : ''} enrichi${attachments.length > 1 ? 's' : ''}` : null,
    ].filter(Boolean)
    setSnackbar(`${parts.join(' · ')} — relisez les brouillons puis validez-les`)
  }

  const openEditor = (id: string) => {
    const theme = profile.themes.find((t) => t.id === id)
    if (theme) setEditing({ theme, isNew: false })
  }

  const handleReset = () => {
    resetProfile()
    setProfile(loadProfile())
    setEditing(null)
    setWorkshopOpen(false)
    setTab('themes')
    setSnackbar('Profil de démonstration réinitialisé')
  }

  const themeCount = profile.themes.length
  const publicCount = profile.themes.filter((t) => t.visibility === 'public' && t.status === 'validated').length

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <DocumentHeader perspectiveName={view === 'lab' ? LAB_INFO.name : researcherName} pageName="Profil de recherche 2">
        <ToggleButtonGroup
          size="small" exclusive value={view}
          onChange={(_e, v: PageView | null) => { if (v) { setView(v); setEditing(null); setWorkshopOpen(false) } }}
          aria-label="Perspective"
        >
          <ToggleButton value="researcher" sx={{ textTransform: 'none', gap: 0.5 }}>
            <PersonOutline fontSize="small" />
            Chercheur
          </ToggleButton>
          <ToggleButton value="lab" sx={{ textTransform: 'none', gap: 0.5 }}>
            <Apartment fontSize="small" />
            Laboratoire
          </ToggleButton>
        </ToggleButtonGroup>
        {view === 'researcher' && (
          <Button size="small" startIcon={<RestartAlt />} onClick={handleReset}
            sx={{ textTransform: 'none', color: 'text.secondary' }}>
            Réinitialiser la démo
          </Button>
        )}
      </DocumentHeader>

      {view === 'lab' && mounted && (
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <LabView researcherName={researcherName} ownProfile={profile} />
        </Box>
      )}

      {view === 'researcher' && !editing && !workshopOpen && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, bgcolor: 'background.paper' }}>
          <Tabs
            value={tab}
            onChange={(_e, v: TabKey) => setTab(v)}
            sx={{
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, minHeight: 52 },
              '& .Mui-selected': { color: TEAL },
              '& .MuiTabs-indicator': { bgcolor: TEAL },
            }}
          >
            <Tab value="themes" iconPosition="start" icon={<ViewList fontSize="small" />}
              label={`Thèmes${mounted && themeCount ? ` (${themeCount})` : ''}`} />
            <Tab value="graph" iconPosition="start" icon={<AccountTree fontSize="small" />} label="Graphe de parcours" />
            <Tab value="preview" iconPosition="start" icon={<VisibilityOutlined fontSize="small" />}
              label={`Aperçu public${mounted && publicCount ? ` (${publicCount})` : ''}`} />
          </Tabs>
        </Box>
      )}

      {view === 'researcher' && <Box sx={{ flex: 1, overflow: 'auto' }}>
        {!mounted ? null : workshopOpen ? (
          <ThemeProposalsWorkshop profile={profile} onBack={() => setWorkshopOpen(false)} onApply={applyWorkshop} />
        ) : editing ? (
          <ThemeEditor
            theme={editing.theme}
            isNew={editing.isNew}
            allThemes={profile.themes}
            relations={profile.relations}
            onBack={() => setEditing(null)}
            onSaveDraft={(t) => upsertTheme(t, `Brouillon « ${t.label} » enregistré`)}
            onValidate={(t) => upsertTheme(t, `Thème « ${t.label} » validé`)}
            onDelete={deleteTheme}
            onOpenGraph={() => { setEditing(null); setTab('graph') }}
          />
        ) : tab === 'themes' ? (
          <ThemesList
            profile={profile}
            onEdit={openEditor}
            onAdd={() => setEditing({ theme: blankTheme(), isNew: true })}
            onPropose={() => setWorkshopOpen(true)}
          />
        ) : tab === 'graph' ? (
          <JourneyGraph
            profile={profile}
            onChangeRelations={(relations: ThemeRelation[]) => commit({ ...profile, relations })}
            onChangePositions={(positions) => commit({ ...profile, positions })}
            onEditTheme={openEditor}
          />
        ) : (
          <PublicPreview
            profile={profile}
            researcherName={researcherName}
            affiliation={labName}
            onBack={() => setTab('themes')}
          />
        )}
      </Box>}

      <Snackbar open={Boolean(snackbar)} autoHideDuration={3500} onClose={() => setSnackbar('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackbar('')} sx={{ width: '100%' }}>{snackbar}</Alert>
      </Snackbar>
    </Box>
  )
}
