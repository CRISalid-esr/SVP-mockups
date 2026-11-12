import personsData from '@/mocks/data/persons.json'
import { CV_PERSON_UIDS, formatAuthors, getPersonCv, selectPublications, toBibtex, toCslJson } from './cvMock'

describe('CV de maquette', () => {
  it('donne un CV à chaque personne de la base', () => {
    expect(CV_PERSON_UIDS).toHaveLength(personsData.length)
    for (const uid of CV_PERSON_UIDS) {
      const cv = getPersonCv(uid)!
      expect(cv.publications.length).toBeGreaterThan(0)
      expect(cv.positions.length).toBeGreaterThan(0)
      // Chaque publication cite la personne.
      for (const p of cv.publications) expect(p.authors).toContain(`${cv.lastName}, ${cv.firstName}`)
    }
  })

  it('reprend les documents de la base comme validés dans SoVisu+', () => {
    const cv = getPersonCv('person-1')!
    const doc = cv.publications.find((p) => p.id === 'doc-1')
    expect(doc).toMatchObject({ source: 'sovisu', validated: true })
  })

  it('sans ORCID, aucune publication ne vient d’OpenAlex', () => {
    const cv = getPersonCv('person-ls2n-2')!
    expect(cv.orcid).toBeUndefined()
    expect(cv.publications.every((p) => p.source !== 'openalex')).toBe(true)
  })

  it('applique les limites des modèles et écarte les publications à vérifier', () => {
    const cv = getPersonCv('person-2')!
    expect(selectPublications(cv, 'short', true)).toHaveLength(5)
    expect(selectPublications(cv, 'complete', false).every((p) => p.validated)).toBe(true)
    expect(selectPublications(cv, 'erc', true).every((p) => p.year > 2016)).toBe(true)
  })

  it('formate les auteurs selon le style', () => {
    const authors = ['Dupont, Jean', 'El Amrani, Fatima']
    expect(formatAuthors(authors, 'apa')).toBe('Dupont, J., & El Amrani, F.')
    expect(formatAuthors(authors, 'vancouver')).toBe('Dupont J, El Amrani F')
    expect(formatAuthors(authors, 'iso690')).toBe('DUPONT, Jean et EL AMRANI, Fatima')
  })

  it('exporte en CSL-JSON et en BibTeX', () => {
    const pubs = getPersonCv('person-1')!.publications
    const csl = JSON.parse(toCslJson(pubs))
    expect(csl).toHaveLength(pubs.length)
    expect(csl[0].author[0]).toHaveProperty('family')
    expect(toBibtex(pubs).match(/^@/gm)).toHaveLength(pubs.length)
  })
})
