'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert, Box, Button, Snackbar, Tab, Tabs, Typography,
} from '@mui/material'
import { AccountTree, PersonSearch, RestartAlt, ViewList, VisibilityOutlined } from '@mui/icons-material'
import * as Lingui from '@lingui/core'
import DocumentHeader from '@/app/[lang]/documents/components/DocumentHeader'
import useStore from '@/stores/global_store'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'
import { dashboardMockService } from '@/mocks/dashboardMockService'
import { usePerspectiveNavigation } from '@/app/[lang]/components/Perspective/usePerspectiveNavigation'
import { usePerspectiveUi } from '@/app/[lang]/components/Perspective/perspectiveUiStore'
import { demoIndex, structureLevelOf, usePerspectiveScope } from '@/app/[lang]/components/Perspective/usePerspectiveScope'
import ThemesList from './components/ThemesList'
import ThemeEditor from './components/ThemeEditor'
import PublicPreview from './components/PublicPreview'
import ThemeProposalsWorkshop, { WorkshopResult } from './components/ThemeProposalsWorkshop'
import LabView from './components/Lab/LabView'
import MemberProfileView from './components/MemberProfile/MemberProfileView'
import { LAB_INFO, LabMember, memberForPerson } from './components/Lab/labMock'
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

interface EditingState {
  theme: ResearchTheme
  isNew: boolean
}

export default function ExpertiseV2Page() {
  const { currentPerspective, connectedUser } = useStore((state) => state.user)
  const lang = Lingui.i18n.locale as ExtendedLanguageCode
  const displayName = currentPerspective?.getDisplayName(lang) || 'Jean Dupont'
  const ownName = connectedUser?.person?.getDisplayName(lang) || displayName
  const labName = dashboardMockService.getLab().name
  const scope = usePerspectiveScope()
  const { goHome } = usePerspectiveNavigation()
  const openPicker = usePerspectiveUi((state) => state.openPicker)
  const slug = currentPerspective?.slug ?? ''

  // Toujours le profil de la personne connectée : c'est le seul modifiable.
  const [profile, setProfile] = useState<ResearchProfile>(EMPTY_PROFILE)
  const [mounted, setMounted] = useState(false)
  const [tab, setTab] = useState<TabKey>('themes')
  const [editing, setEditing] = useState<EditingState | null>(null)
  const [workshopOpen, setWorkshopOpen] = useState(false)
  const [snackbar, setSnackbar] = useState('')
  /** Membre ouvert depuis la vue laboratoire, en lecture seule. */
  const [labMember, setLabMember] = useState<LabMember | null>(null)

  // Copie en attente : l'éditeur ne s'ouvre qu'une fois revenu dans son propre espace.
  const pendingEdit = useRef<ResearchTheme | null>(null)

  // Changer d'espace referme ce qui était ouvert dans le précédent.
  useEffect(() => {
    setLabMember(null)
    if (scope !== 'own') {
      setEditing(null)
      setWorkshopOpen(false)
    } else if (pendingEdit.current) {
      setEditing({ theme: pendingEdit.current, isNew: false })
      pendingEdit.current = null
    }
  }, [slug, scope])

  // Personne consultée depuis le sélecteur d'espace.
  const consultedPerson = useMemo(() => {
    if (scope !== 'person' || !currentPerspective) return null
    const affiliation = currentPerspective.membershipAcronyms[0] ?? ''
    return memberForPerson(displayName, slug, affiliation)
  }, [scope, currentPerspective, displayName, slug])

  const isMyStructure = scope === 'structure' && Boolean(
    connectedUser?.person?.memberships?.some((m) => m.researchStructure.uid === currentPerspective?.uid),
  )

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

  const openMember = (member: LabMember) => {
    if (member.id === 'me') { setLabMember(null); setTab('themes'); goHome(); return }
    setLabMember(member)
  }

  /** Copie d'un thème d'un·e collègue : enregistrée en brouillon dans son profil, puis ouverte dans l'éditeur. */
  const applyCopy = (copy: ResearchTheme) => {
    commit({ ...profile, themes: [...profile.themes, copy] })
    setLabMember(null)
    setTab('themes')
    if (scope !== 'own') goHome()
    pendingEdit.current = copy
    setSnackbar(`« ${copy.label} » copié dans votre profil en brouillon — adaptez-le puis validez-le`)
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
      <DocumentHeader perspectiveName={labMember ? labMember.name : displayName} pageName="Profil de recherche 2">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {/* Même moteur de recherche que le sélecteur d'espace, proposé là où on en a besoin. */}
          <Button size="small" variant="outlined" startIcon={<PersonSearch />} onClick={(e) => openPicker(e.currentTarget)}
            sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}>
            Consulter le profil d’un·e collègue
          </Button>
          {scope === 'own' && (
            <Button size="small" startIcon={<RestartAlt />} onClick={handleReset}
              sx={{ textTransform: 'none', color: 'text.secondary' }}>
              Réinitialiser la démo
            </Button>
          )}
        </Box>
      </DocumentHeader>

      {consultedPerson && mounted && (
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <MemberProfileView member={consultedPerson} ownProfile={profile} labLine={consultedPerson.team} onCopy={applyCopy} />
        </Box>
      )}

      {labMember && mounted && (
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <MemberProfileView
            member={labMember}
            ownProfile={profile}
            backLabel="Retour au laboratoire"
            onBack={() => setLabMember(null)}
            onCopy={applyCopy}
          />
        </Box>
      )}

      {!labMember && scope === 'structure' && mounted && (
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <LabView
            key={slug}
            initialTeam={structureLevelOf(currentPerspective?.uid) === 'team' ? LAB_INFO.teams[demoIndex(slug, LAB_INFO.teams.length)] : 'all'}
            researcherName={ownName}
            ownProfile={profile}
            labName={displayName}
            includeOwn={isMyStructure}
            onOpenMember={openMember}
          />
        </Box>
      )}

      {scope === 'own' && !editing && !workshopOpen && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, bgcolor: 'background.paper' }}>
          <Tabs
            data-tour='profile-tabs'
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

      {scope === 'own' && <Box sx={{ flex: 1, overflow: 'auto' }}>
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
            researcherName={displayName}
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
