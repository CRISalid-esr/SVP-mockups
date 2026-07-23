'use client'

import { publicPath } from '@/utils/publicPath'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CloseIcon from '@mui/icons-material/Close'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import {
  Avatar,
  Box,
  Fab,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material'
import { ChatBox } from '@mui/x-chat'
import type { ChatLocaleText, ChatMessage, ChatUser } from '@mui/x-chat-headless'
import { useMemo, useState } from 'react'
import { createCrisalidMockAdapter } from './mockAgent'

/**
 * Widget « Assistant de Recherche CRISalid » — bouton flottant en bas à droite,
 * panneau dépliable construit sur @mui/x-chat (ChatBox). Version maquette :
 * les réponses proviennent d'un adaptateur mock qui simule le CRISalid Graph
 * Agent (appels d'outils sur le graphe + streaming). La conversation vit dans
 * le sessionStorage : conservée à la navigation, oubliée à la fermeture de
 * l'onglet.
 */

const STORAGE_KEY = 'crisalid-chat-messages'

const SUGGESTIONS = [
  'Que sais-tu faire ?',
  'Quels sont les domaines de recherche du LPPL ?',
  'Y a-t-il des collaborations entre le CRCI2NA et la Belgique ?',
  'Qui travaille sur les batteries du futur ?',
]

const MEMBERS: ChatUser[] = [
  { id: 'me', role: 'user', displayName: 'Vous' },
  {
    id: 'crisalid-agent',
    role: 'assistant',
    displayName: 'Assistant CRISalid',
    avatarUrl: publicPath('/crisalid.png'),
  },
]

const TOOL_STATE_LABELS: Record<string, string> = {
  'input-streaming': 'Interrogation du graphe…',
  'input-available': 'Interrogation du graphe…',
  'approval-requested': 'En attente de validation',
  'approval-responded': 'Interrogation du graphe…',
  'output-available': 'Terminé',
  'output-error': 'Échec',
  'output-denied': 'Refusé',
}

const FR_LOCALE: Partial<ChatLocaleText> = {
  composerInputPlaceholder: 'Votre question…',
  composerInputAriaLabel: 'Question',
  composerSendButtonLabel: 'Envoyer',
  messageCopyButtonLabel: 'Copier',
  messageCopyCodeButtonLabel: 'Copier le code',
  messageCopiedCodeButtonLabel: 'Copié',
  messageToolInputLabel: 'Requête au graphe',
  messageToolOutputLabel: 'Résultat',
  threadNoMessagesLabel: 'Assistant de Recherche CRISalid',
  threadNoMessagesHelperText:
    'Posez vos questions sur la recherche à Nantes Université : publications, laboratoires, domaines d’expertise…',
  suggestionsLabel: 'Questions suggérées',
  retryButtonLabel: 'Réessayer',
  genericErrorLabel: 'Une erreur est survenue',
  loadingLabel: 'Chargement…',
  scrollToBottomLabel: 'Aller en bas de la conversation',
  messageAuthorUserLabel: 'Vous',
  messageAuthorAssistantLabel: 'Assistant CRISalid',
  messageListLabel: 'Fil de la conversation',
  composerLandmarkLabel: 'Saisie de la question',
  responseStreamingStartedAnnouncement: 'L’assistant répond',
  responseStreamingCompletedAnnouncement: 'Réponse terminée',
  toolStateLabel: (state) => TOOL_STATE_LABELS[state] ?? state,
}

function loadMessages(): ChatMessage[] {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (message): message is ChatMessage =>
        message &&
        (message.role === 'user' || message.role === 'assistant') &&
        Array.isArray(message.parts),
    )
  } catch {
    return []
  }
}

function saveMessages(messages: ChatMessage[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)))
  } catch {
    /* quota plein : la conversation reste en mémoire */
  }
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [initialMessages, setInitialMessages] =
    useState<ChatMessage[]>(loadMessages)
  const adapter = useMemo(() => createCrisalidMockAdapter(), [])

  const handleReset = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    setInitialMessages([])
    setResetKey((key) => key + 1)
  }

  if (!open) {
    return (
      <Tooltip title='Assistant de Recherche CRISalid' placement='left'>
        <Fab
          color='primary'
          aria-label={`Ouvrir l'assistant de recherche CRISalid`}
          onClick={() => setOpen(true)}
          sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1250 }}
        >
          <AutoAwesomeIcon />
        </Fab>
      </Tooltip>
    )
  }

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1350,
        width: 400,
        maxWidth: 'calc(100vw - 32px)',
        height: 640,
        maxHeight: 'calc(100vh - 96px)',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      {/* Entête */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.5,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <Avatar
          src={publicPath('/crisalid.png')}
          alt='CRISalid'
          sx={{ width: 36, height: 36, bgcolor: 'common.white', p: 0.5 }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant='subtitle2' sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            Assistant de Recherche CRISalid
          </Typography>
          <Typography variant='caption' noWrap sx={{ display: 'block', opacity: 0.85 }}>
            {`Publications, laboratoires, domaines d'expertise…`}
          </Typography>
        </Box>
        <Tooltip title='Nouvelle conversation'>
          <IconButton size='small' onClick={handleReset} sx={{ color: 'inherit' }}>
            <RestartAltIcon fontSize='small' />
          </IconButton>
        </Tooltip>
        <Tooltip title='Réduire'>
          <IconButton
            size='small'
            onClick={() => setOpen(false)}
            sx={{ color: 'inherit' }}
          >
            <CloseIcon fontSize='small' />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Conversation */}
      <ChatBox
        key={resetKey}
        adapter={adapter}
        members={MEMBERS}
        initialMessages={initialMessages}
        onMessagesChange={saveMessages}
        suggestions={SUGGESTIONS}
        suggestionsAutoSubmit
        localeText={FR_LOCALE}
        density='compact'
        features={{
          conversationHeader: false,
          attachments: false,
          helperText: false,
        }}
        sx={{ flex: 1, minHeight: 0, border: 'none', borderRadius: 0 }}
      />

      {/* Bandeau maquette */}
      <Typography
        variant='caption'
        align='center'
        sx={{ py: 0.5, color: 'text.secondary', bgcolor: 'action.hover' }}
      >
        Maquette — réponses simulées
      </Typography>
    </Paper>
  )
}
