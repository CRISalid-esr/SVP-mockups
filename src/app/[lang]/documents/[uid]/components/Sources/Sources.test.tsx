import useStore from '@/stores/global_store'
import { BibliographicPlatform } from '@/types/BibliographicPlatform'
import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import '@testing-library/jest-dom'
import { fireEvent, render, screen, within } from '@testing-library/react'
import Sources from './Sources'

jest.mock('@/stores/global_store', () => ({
  __esModule: true,
  default: jest.fn(),
}))

const record = (platform: BibliographicPlatform, id: string, date: string) => ({
  uid: id,
  platform,
  sourceIdentifier: id,
  url: `https://example.org/${id}`,
  titles: [{ language: 'en', value: 'A deep learning approach to climate modeling' }],
  publicationDate: date,
  documentTypes: ['Article'],
  contributions: [],
})

const renderSources = () => {
  ;(useStore as unknown as jest.Mock).mockImplementation((selector) =>
    selector({
      document: {
        selectedDocument: {
          uid: 'doc-1',
          records: [
            record(BibliographicPlatform.HAL, 'hal-01234567', '2023-01-01T00:00:00.000Z'),
            record(BibliographicPlatform.SCOPUS, 'scopus-123', '2023-05-15T00:00:00.000Z'),
          ],
        },
      },
    }),
  )
  return render(
    <I18nProvider i18n={i18n}>
      <Sources />
    </I18nProvider>,
  )
}

describe('Sources', () => {
  it('liste les sources et met les différences en tête de la comparaison', () => {
    renderSources()

    const list = screen.getByRole('table', { name: 'Sources de la notice' })
    expect(within(list).getByText('hal-01234567')).toBeInTheDocument()
    expect(within(list).getByText('scopus-123')).toBeInTheDocument()

    const comparison = screen.getByRole('table', { name: 'Comparaison des sources' })
    const rows = within(comparison).getAllByRole('row')
    expect(within(rows[1]).getByText('Date de publication')).toBeInTheDocument()
    expect(within(rows[1]).getByText('Diffère')).toBeInTheDocument()
    expect(within(comparison).getByText('Titre').closest('tr')).toHaveTextContent('Concordant')
    expect(screen.getByText('1 information diffère d’une source à l’autre.')).toBeInTheDocument()
  })

  it('range les actions d’une source dans un menu', () => {
    renderSources()

    fireEvent.click(screen.getByRole('button', { name: 'Actions sur la source HAL' }))
    expect(screen.getByRole('menuitem', { name: /Séparer de cette publication/ })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Signaler comme erronée/ })).toBeInTheDocument()
  })
})
