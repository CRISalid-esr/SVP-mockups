import { Box, Link, Typography } from '@mui/material'
import useStore from '@/stores/global_store'

/** « Paru dans » : la revue, son ISSN (lien vers le portail ISSN) et son éditeur. */
const Journal = () => {
  const { selectedDocument = null } = useStore((state) => state.document)
  const journal = selectedDocument?.journal
  if (!journal?.title) return null

  const issn = journal.issnL || journal.identifiers?.find((id) => id.type?.toLowerCase().includes('issn'))?.value

  return (
    <Box>
      <Typography sx={{ fontWeight: 500 }}>{journal.title}</Typography>
      <Typography variant='body2' color='text.secondary'>
        {issn ? (
          <>
            {'ISSN '}
            <Link
              href={`https://portal.issn.org/resource/ISSN/${issn}`}
              target='_blank'
              rel='noopener noreferrer'
              underline='hover'
            >
              {issn}
            </Link>
          </>
        ) : (
          'ISSN non renseigné'
        )}
        {journal.publisher && ` · ${journal.publisher}`}
      </Typography>
    </Box>
  )
}
export default Journal
