'use client'

import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  AccountTree,
  AddOutlined,
  AutoAwesomeOutlined,
  CheckCircleOutlined,
  ScheduleOutlined,
  TuneOutlined,
  VisibilityOutlined,
} from '@mui/icons-material'
import {
  ImpactCard,
  ImpactFamily,
  INITIAL_CARDS,
  INITIAL_FAMILIES,
  PROFILE_CONFIG,
  ProfileType,
} from './impactCardsTypes'
import ImpactCardItem from './ImpactCard'
import CardDetailDialog from './CardDetailDialog'
import CreateCardWizard from './CreateCardWizard'

const CARDS_KEY = 'expertise-cards-v1'
const TEAL = '#006A61'

function loadCards(): ImpactCard[] {
  if (typeof window === 'undefined') return INITIAL_CARDS
  try {
    const raw = localStorage.getItem(CARDS_KEY)
    if (raw) return JSON.parse(raw) as ImpactCard[]
  } catch (_e) { /* ignore parse errors */ }
  return INITIAL_CARDS
}

function saveCards(cards: ImpactCard[]) {
  localStorage.setItem(CARDS_KEY, JSON.stringify(cards))
}

function nextId(cards: ImpactCard[]) {
  const nums = cards.map((c) => parseInt(c.id.replace('c', ''), 10)).filter(Boolean)
  return `c${Math.max(0, ...nums) + 1}`
}

type TabKey = 'all' | 'to_validate' | 'custom' | 'private'

const TAB_DEF: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: 'Toutes', icon: <VisibilityOutlined fontSize="small" /> },
  { key: 'to_validate', label: 'À valider', icon: <ScheduleOutlined fontSize="small" /> },
  { key: 'custom', label: 'Personnalisées', icon: <TuneOutlined fontSize="small" /> },
  { key: 'private', label: 'Privées', icon: <VisibilityOutlined fontSize="small" /> },
]

function filterCards(cards: ImpactCard[], tab: TabKey): ImpactCard[] {
  if (tab === 'to_validate') return cards.filter((c) => c.status === 'TO_VALIDATE')
  if (tab === 'custom') return cards.filter((c) => c.status === 'CUSTOM')
  if (tab === 'private') return cards.filter((c) => c.visibility === 'PRIVATE')
  return cards
}

interface Props {
  onGoToMindMap: () => void
}

export default function ImpactCardsView({ onGoToMindMap }: Props) {
  const [cards, setCards] = useState<ImpactCard[]>(INITIAL_CARDS)
  const [families] = useState<ImpactFamily[]>(INITIAL_FAMILIES)
  const [mounted, setMounted] = useState(false)
  const [tab, setTab] = useState<TabKey>('all')
  const [selectedCard, setSelectedCard] = useState<ImpactCard | null>(null)
  const [wizardOpen, setWizardOpen] = useState(false)

  useEffect(() => {
    setCards(loadCards())
    setMounted(true)
  }, [])

  const updateCards = (next: ImpactCard[]) => {
    setCards(next)
    saveCards(next)
  }

  const handleSave = (updated: ImpactCard) => {
    updateCards(cards.map((c) => (c.id === updated.id ? updated : c)))
  }

  const handleDuplicate = (card: ImpactCard) => {
    const newCard: ImpactCard = {
      ...card,
      id: nextId(cards),
      title: `${card.title} (copie)`,
      status: 'TO_VALIDATE',
      visibility: 'PRIVATE',
      lastUpdate: new Date().toLocaleDateString('fr-FR'),
    }
    updateCards([...cards, newCard])
    setSelectedCard(null)
  }

  const handleArchive = (cardId: string) => {
    updateCards(cards.filter((c) => c.id !== cardId))
    setSelectedCard(null)
  }

  const handleCreate = (draft: Omit<ImpactCard, 'id'>) => {
    const newCard: ImpactCard = { ...draft, id: nextId(cards) }
    updateCards([...cards, newCard])
  }

  if (!mounted) return null

  const visible = filterCards(cards, tab)
  const validatedCount = cards.filter((c) => c.status === 'VALIDATED').length
  const toValidateCount = cards.filter((c) => c.status === 'TO_VALIDATE').length
  const publicCount = cards.filter((c) => c.visibility === 'PUBLIC').length

  // Group visible cards by family then by profile
  const familiesWithCards = families
    .map((f) => ({ family: f, cards: visible.filter((c) => c.familyId === f.id) }))
    .filter((g) => g.cards.length > 0)

  const orphanCards = visible.filter((c) => !families.find((f) => f.id === c.familyId))

  return (
    <Box sx={{ p: 3 }}>
      {/* Banner */}
      <Alert
        severity="info"
        icon={<AccountTree fontSize="small" />}
        action={
          <Button size="small" onClick={onGoToMindMap} sx={{ textTransform: 'none', whiteSpace: 'nowrap', color: '#1976D2' }}>
            Modifier le graphe →
          </Button>
        }
        sx={{ mb: 3, '& .MuiAlert-message': { flex: 1 } }}
      >
        Chaque famille correspond à un nœud d&apos;expertise de votre carte mentale.
        Déclinez-les en cartes adaptées à chaque audience.
      </Alert>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Mes cartes impact</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Stat icon={<CheckCircleOutlined sx={{ fontSize: 14, color: '#065F46' }} />} label={`${validatedCount} validée${validatedCount > 1 ? 's' : ''}`} color="#065F46" />
            <Stat icon={<ScheduleOutlined sx={{ fontSize: 14, color: '#92400E' }} />} label={`${toValidateCount} à valider`} color="#92400E" />
            <Stat icon={<VisibilityOutlined sx={{ fontSize: 14, color: '#1E40AF' }} />} label={`${publicCount} publique${publicCount > 1 ? 's' : ''}`} color="#1E40AF" />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Générer des cartes depuis votre carte mentale (bientôt disponible)">
            <span>
              <Button
                variant="outlined"
                startIcon={<AutoAwesomeOutlined />}
                disabled
                size="small"
                sx={{ textTransform: 'none', borderColor: TEAL, color: TEAL }}
              >
                Générer depuis le graphe
              </Button>
            </span>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddOutlined />}
            size="small"
            onClick={() => setWizardOpen(true)}
            sx={{ textTransform: 'none', bgcolor: TEAL, '&:hover': { bgcolor: '#004d46' } }}
          >
            Nouvelle carte
          </Button>
        </Box>
      </Box>

      {/* Sub-tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontSize: '0.85rem', minHeight: 40 } }}
        >
          {TAB_DEF.map((t) => {
            const count = filterCards(cards, t.key).length
            return (
              <Tab
                key={t.key}
                value={t.key}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    {t.label}
                    <Chip label={count} size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: tab === t.key ? TEAL : undefined, color: tab === t.key ? '#fff' : undefined }} />
                  </Box>
                }
              />
            )
          })}
        </Tabs>
      </Box>

      {visible.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aucune carte dans cette vue
          </Typography>
          <Button variant="contained" startIcon={<AddOutlined />} onClick={() => setWizardOpen(true)}
            sx={{ bgcolor: TEAL, '&:hover': { bgcolor: '#004d46' }, textTransform: 'none', mt: 1 }}>
            Créer une carte
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {familiesWithCards.map(({ family, cards: fCards }) => (
            <FamilySection key={family.id} family={family} cards={fCards} onSelect={setSelectedCard} onDuplicate={handleDuplicate} onArchive={(id) => handleArchive(id)} />
          ))}
          {orphanCards.length > 0 && (
            <FamilySection
              family={{ id: '_orphan', title: 'Sans famille', nodeId: '', source: '' }}
              cards={orphanCards}
              onSelect={setSelectedCard}
              onDuplicate={handleDuplicate}
              onArchive={(id) => handleArchive(id)}
            />
          )}
        </Box>
      )}

      {/* Detail dialog */}
      {selectedCard && (
        <CardDetailDialog
          card={selectedCard}
          family={families.find((f) => f.id === selectedCard.familyId)}
          open={Boolean(selectedCard)}
          onClose={() => setSelectedCard(null)}
          onSave={handleSave}
          onDuplicate={() => handleDuplicate(selectedCard)}
          onArchive={() => handleArchive(selectedCard.id)}
        />
      )}

      {/* Create wizard */}
      <CreateCardWizard
        open={wizardOpen}
        families={families}
        onClose={() => setWizardOpen(false)}
        onCreate={handleCreate}
      />
    </Box>
  )
}

function Stat({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {icon}
      <Typography variant="body2" sx={{ color, fontWeight: 600, fontSize: '0.8rem' }}>{label}</Typography>
    </Box>
  )
}

function FamilySection({
  family,
  cards,
  onSelect,
  onDuplicate,
  onArchive,
}: {
  family: ImpactFamily
  cards: ImpactCard[]
  onSelect: (c: ImpactCard) => void
  onDuplicate: (c: ImpactCard) => void
  onArchive: (id: string) => void
}) {
  // Group by profile
  const byProfile = (Object.keys(PROFILE_CONFIG) as ProfileType[]).map((p) => ({
    profile: p,
    cards: cards.filter((c) => c.profile === p),
  })).filter((g) => g.cards.length > 0)

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{family.title}</Typography>
        {family.source && (
          <Chip label={family.source} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
        )}
        <Divider sx={{ flex: 1 }} />
        <Typography variant="caption" color="text.secondary">{cards.length} carte{cards.length > 1 ? 's' : ''}</Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {byProfile.map(({ profile, cards: pCards }) => {
          const cfg = PROFILE_CONFIG[profile]
          return (
            <Box key={profile}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <cfg.Icon sx={{ fontSize: 16, color: cfg.border }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: cfg.color }}>{cfg.label}</Typography>
                <Typography variant="caption" color="text.secondary">— {cfg.desc}</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {pCards.map((card) => (
                  <ImpactCardItem
                    key={card.id}
                    card={card}
                    onClick={() => onSelect(card)}
                    onDuplicate={() => onDuplicate(card)}
                    onArchive={() => onArchive(card.id)}
                  />
                ))}
              </Box>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
