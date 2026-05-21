'use client'

import CloseIcon from '@mui/icons-material/Close'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import { Box, Drawer, IconButton, Tooltip, Typography } from '@mui/material'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { publicPath } from '@/utils/publicPath'

function getPromptKey(pathname: string, tab: string | null): string | null {
  const withoutLang = pathname.replace(/^\/[a-z]{2}/, '').replace(/\/$/, '')
  if (withoutLang === '/research-structures') return 'research-structures'
  if (withoutLang.startsWith('/research-structures/')) return 'structures-detail'
  if (withoutLang === '/researchers') return 'chercheurs-liste'
  if (withoutLang.startsWith('/researchers/')) return 'chercheurs-detail'
  if (withoutLang.startsWith('/documents/') && tab === 'authors') return 'author-tab'
  return null
}

export default function PromptDrawer() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tab = searchParams?.get('tab') ?? null

  const promptKey = getPromptKey(pathname ?? '', tab)

  const [open, setOpen] = useState(false)
  const [originalContent, setOriginalContent] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const prevKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!promptKey) {
      setOpen(false)
      return
    }
    if (promptKey === prevKeyRef.current) return
    prevKeyRef.current = promptKey

    fetch(publicPath(`/prompts/${promptKey}.md`))
      .then((res) => {
        if (!res.ok) throw new Error('not found')
        return res.text()
      })
      .then((text) => {
        setOriginalContent(text)
        setContent(text)
      })
      .catch(() => {
        const fallback = `# Prompt introuvable\n\nLe fichier \`${promptKey}.md\` n'a pas été trouvé.`
        setOriginalContent(fallback)
        setContent(fallback)
      })
  }, [promptKey])

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!promptKey) return null

  return (
    <>
      {!open && (
        <Box
          onClick={() => setOpen(true)}
          sx={{
            position: 'fixed',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1300,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            cursor: 'pointer',
            px: 0.75,
            py: 1.5,
            borderRadius: '6px 0 0 6px',
            boxShadow: 3,
            writingMode: 'vertical-lr',
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            userSelect: 'none',
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          Prompt
        </Box>
      )}

      <Drawer
        anchor='right'
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100vw', sm: 560 },
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
          }}
        >
          <Typography variant='subtitle2' sx={{ fontWeight: 700, flexGrow: 1 }}>
            Prompt de développement
          </Typography>
          <Tooltip title={copied ? 'Copié !' : 'Copier'}>
            <IconButton size='small' onClick={handleCopy} color={copied ? 'success' : 'default'}>
              <ContentCopyIcon fontSize='small' />
            </IconButton>
          </Tooltip>
          <Tooltip title='Réinitialiser'>
            <span>
              <IconButton
                size='small'
                onClick={() => setContent(originalContent)}
                disabled={content === originalContent}
              >
                <RestartAltIcon fontSize='small' />
              </IconButton>
            </span>
          </Tooltip>
          <IconButton size='small' onClick={() => setOpen(false)}>
            <CloseIcon fontSize='small' />
          </IconButton>
        </Box>

        <Box sx={{ px: 2, pt: 1, pb: 0.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography
            component='a'
            href={`https://github.com/CRISalid-esr/SVP-mockups/blob/main/public/prompts/${promptKey}.md`}
            target='_blank'
            rel='noopener noreferrer'
            variant='caption'
            color='text.secondary'
            sx={{ '&:hover': { color: 'primary.main' } }}
          >
            {promptKey}.md ↗
          </Typography>
          {copied && (
            <Typography variant='caption' color='success.main'>
              ✓ Copié dans le presse-papiers
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            px: 2,
            pb: 2,
            pt: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
            style={{
              flexGrow: 1,
              width: '100%',
              height: '100%',
              fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
              fontSize: '0.8125rem',
              lineHeight: 1.65,
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              padding: '12px',
              resize: 'none',
              outline: 'none',
              backgroundColor: '#fafafa',
              color: '#1a1a1a',
              boxSizing: 'border-box',
            }}
          />
        </Box>
      </Drawer>
    </>
  )
}
