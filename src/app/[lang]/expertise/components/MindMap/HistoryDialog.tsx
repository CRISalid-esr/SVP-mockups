'use client'
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, IconButton, Typography,
} from '@mui/material'
import { Close, History, Restore } from '@mui/icons-material'
import { HistoryEntry } from '../../types'

const TEAL = '#006A61'

interface Props {
  open: boolean
  onClose: () => void
  history: HistoryEntry[]
  onRestore: (entry: HistoryEntry) => void
}

export default function HistoryDialog({ open, onClose, history, onRestore }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <History sx={{ color: TEAL, fontSize: 20 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Historique des versions</Typography>
        </Box>
        <IconButton size="small" onClick={onClose}><Close fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {history.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary" sx={{ mb: 0.5 }}>Aucune version enregistrée.</Typography>
            <Typography variant="caption" color="text.disabled">
              Les versions sont sauvegardées à chaque enregistrement ou génération.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {history.map((entry, idx) => {
              const date = new Date(entry.timestamp)
              const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
              const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
              const isCurrent = idx === 0
              return (
                <Box key={entry.id}>
                  <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0.25 }}>
                      <Box sx={{
                        width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                        bgcolor: isCurrent ? TEAL : '#cbd5e1',
                        border: isCurrent ? `2px solid ${TEAL}` : '2px solid #94a3b8',
                      }} />
                      {idx < history.length - 1 && (
                        <Box sx={{ width: 2, flex: 1, minHeight: 28, bgcolor: '#e2e8f0', mt: 0.5 }} />
                      )}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{entry.label}</Typography>
                        {isCurrent && (
                          <Chip size="small" label="Actuelle" sx={{ fontSize: '0.6rem', height: 16, bgcolor: `${TEAL}15`, color: TEAL }} />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">{dateStr} à {timeStr}</Typography>
                      <Box sx={{ display: 'flex', gap: 0.75, mt: 0.75, flexWrap: 'wrap' }}>
                        <Chip size="small" label={`${entry.nodeCount} nœud${entry.nodeCount !== 1 ? 's' : ''}`}
                          sx={{ fontSize: '0.65rem', height: 18, bgcolor: `${TEAL}10`, color: TEAL }} />
                        <Chip size="small" label={`${entry.edgeCount} lien${entry.edgeCount !== 1 ? 's' : ''}`}
                          sx={{ fontSize: '0.65rem', height: 18, bgcolor: `${TEAL}10`, color: TEAL }} />
                        <Chip size="small" label={`v${entry.graph.meta.version}`} variant="outlined"
                          sx={{ fontSize: '0.65rem', height: 18 }} />
                      </Box>
                    </Box>
                    <Button
                      size="small" startIcon={<Restore sx={{ fontSize: '14px !important' }} />}
                      onClick={() => onRestore(entry)}
                      disabled={isCurrent}
                      sx={{ textTransform: 'none', color: isCurrent ? 'text.disabled' : TEAL, flexShrink: 0, fontSize: '0.75rem' }}
                    >
                      {isCurrent ? 'Actuelle' : 'Restaurer'}
                    </Button>
                  </Box>
                  {idx < history.length - 1 && <Divider />}
                </Box>
              )
            })}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>Fermer</Button>
      </DialogActions>
    </Dialog>
  )
}
