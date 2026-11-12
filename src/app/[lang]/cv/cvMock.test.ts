import personsData from '@/mocks/data/persons.json'
import { INITIAL_ACTIVITIES } from '@/app/[lang]/research-activities/activitiesStore'
import { DEMO_PROFILE } from '@/app/[lang]/expertise-v2/types'
import { Activity } from '@/types/Activity'
import {
  CV_PERSON_UIDS, activityToEntry, careerOf, isPublicEntry, formatAuthors, getPersonCv, publicationSection, selectPublications, toBibtex, toCslJson,
} from './cvMock'

describe('CV de maquette', () => {
  it('donne un CV à chaque personne de la base', () => {
    expect(CV_PERSON_UIDS).toHaveLength(personsData.length)
    for (const uid of CV_PERSON_UIDS) {
      const cv = getPersonCv(uid)!
      expect(cv.publications.length).toBeGreaterThan(0)
      expect(cv.sections.positions?.length).toBeGreaterThan(0)
      // Chaque publication cite la personne.
      for (const p of cv.publications) expect(p.authors).toContain(`${cv.lastName}, ${cv.firstName}`)
    }
  })

  it('ajoute au parcours une affiliation passée confirmée dans Mon compte', () => {
    const [proposal] = careerOf('jean-dupont').proposals
    const before = getPersonCv('person-1')!.sections.positions!.map((e) => e.title)
    expect(before).not.toContain(proposal.title)
    const after = getPersonCv('person-1', 'fr', undefined, [proposal.id])!.sections.positions!
    expect(after.map((e) => e.title)).toContain(proposal.title)
    // Toujours du plus récent au plus ancien.
    expect(after.map((e) => e.from)).toEqual([...after.map((e) => e.from)].sort((x, y) => (y ?? 0) - (x ?? 0)))
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
    const short = selectPublications(cv, 'short', true)
    expect(short.filter((p) => publicationSection(p) === 'publications')).toHaveLength(5)
    expect(short.some((p) => publicationSection(p) === 'preprints')).toBe(false)
    expect(selectPublications(cv, 'complete', false).every((p) => p.validated)).toBe(true)
    expect(selectPublications(cv, 'erc', true).every((p) => p.year > 2016)).toBe(true)
  })

  it('choisit d’abord les publications phares dans les modèles courts', () => {
    const cv = getPersonCv('person-1')!
    const main = cv.publications.filter((p) => publicationSection(p) === 'publications')
    const oldest = main[main.length - 1]
    expect(selectPublications(cv, 'short', true).map((p) => p.id)).not.toContain(oldest.id)
    const withFeatured = selectPublications(cv, 'short', true, [oldest.id]).filter((p) => publicationSection(p) === 'publications')
    expect(withFeatured).toHaveLength(5)
    expect(withFeatured.map((p) => p.id)).toContain(oldest.id)
  })

  it('range prépublications et jeux de données dans leurs sections', () => {
    const sections = getPersonCv('person-2')!.publications.map(publicationSection)
    expect(sections).toEqual(expect.arrayContaining(['publications', 'preprints', 'datasets']))
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

describe('son propre CV, alimenté par SoVisu+', () => {
  const activity = (type: Activity['type'], specificData: Record<string, string>, extra: Partial<Activity> = {}): Activity => ({
    id: type, type, title: `Activité ${type}`, startDate: '2024-01-15', description: '', specificData, ...extra,
  })

  it('range chaque type d’activité dans la section du schéma de CV', () => {
    expect(activityToEntry(activity('projet', { role: 'Coordinateur', funder: 'ANR' }))?.section).toBe('grants')
    expect(activityToEntry(activity('encadrement', { level: 'Doctorat' }))?.section).toBe('supervision')
    expect(activityToEntry(activity('conference', { type: 'Conférence invitée' }))?.section).toBe('talks')
    expect(activityToEntry(activity('editorial', { role: 'Éditeur associé' }))?.section).toBe('editorial')
    expect(activityToEntry(activity('editorial', { role: 'Relecteur' }))?.section).toBe('peer-review')
    expect(activityToEntry(activity('brevet', {}))?.section).toBe('patents')
    expect(activityToEntry(activity('distinction', {}))?.section).toBe('awards')
    expect(activityToEntry(activity('enseignement', {}))?.section).toBe('teaching')
    expect(activityToEntry(activity('mediation', {}))?.section).toBe('outreach')
    expect(activityToEntry(activity('responsabilite', { role: 'Membre élu', body: 'Conseil de laboratoire' }))?.section).toBe('service')
  })

  it('reprend le sujet et le devenir d’une personne encadrée', () => {
    const supervision = activityToEntry(activity('encadrement', { thesisTitle: 'Graphes dynamiques', level: 'Doctorat', currentPosition: 'MCF, Lille' }))!
    expect(supervision.entry.detail).toBe('Graphes dynamiques · Doctorat · aujourd’hui : MCF, Lille')
  })

  it('ne reprend ni le montant d’un projet, ni une communication ou un poster', () => {
    const grant = activityToEntry(activity('projet', { budget: '450 000 €', role: 'Coordinateur', funder: 'ANR' }))!
    expect(JSON.stringify(grant)).not.toContain('450 000')
    expect(grant.entry.detail).toBe('Coordinateur · ANR')
    expect(activityToEntry(activity('conference', { type: 'Poster' }))).toBeNull()
  })

  it('reprend les activités saisies et les seuls thèmes validés', () => {
    const profile = {
      ...DEMO_PROFILE,
      themes: [
        { ...DEMO_PROFILE.themes[0], status: 'validated' as const },
        { ...DEMO_PROFILE.themes[1], status: 'draft' as const },
      ],
    }
    const activities = [...INITIAL_ACTIVITIES, activity('conference', { type: 'Poster' })]
    const cv = getPersonCv('person-1', 'fr', { activities, profile })!
    expect(cv.sections.grants?.map((e) => e.title)).toEqual(['ANR DeepLearning4Science'])
    expect(cv.sections.grants?.every((e) => e.origin === 'activities')).toBe(true)
    expect(cv.sections.themes?.map((e) => e.title)).toEqual([DEMO_PROFILE.themes[0].label])
    // Les responsabilités viennent des activités, plus de la fiche de maquette.
    expect(cv.sections.service?.map((e) => e.origin)).toEqual(['activities', 'activities'])
    expect(cv.exclusions).toEqual(expect.arrayContaining([
      expect.objectContaining({ origin: 'activities', count: 1 }),
      expect.objectContaining({ origin: 'profile', count: 1 }),
    ]))
  })

  it('ne garde sur la page publique que les activités publiques', () => {
    const cv = getPersonCv('person-1', 'fr', { activities: INITIAL_ACTIVITIES, profile: DEMO_PROFILE })!
    expect(cv.sections.grants?.every(isPublicEntry)).toBe(true)
    // Encadrement et responsabilités sont « établissement » par défaut.
    expect(cv.sections.supervision?.some(isPublicEntry)).toBe(false)
    expect(cv.sections.service?.some(isPublicEntry)).toBe(false)
  })
})
