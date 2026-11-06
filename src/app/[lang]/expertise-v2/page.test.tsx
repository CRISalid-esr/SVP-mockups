import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { usePerspectiveUi } from '@/app/[lang]/components/Perspective/perspectiveUiStore'
import ExpertiseV2Page from './page'

jest.mock('next/dynamic', () => () => {
  const Stub = () => <div data-testid="journey-graph" />
  Stub.displayName = 'JourneyGraphStub'
  return Stub
})

jest.mock('echarts-for-react', () => {
  const Stub = () => <div data-testid="echarts" />
  Stub.displayName = 'EChartsStub'
  return { __esModule: true, default: Stub }
})

const OWN = {
  currentPerspective: null,
  ownPerspective: true,
  connectedUser: { person: { getDisplayName: () => 'Jean Dupont', memberships: [{ researchStructure: { uid: 'lab-ths' } }] } },
}
const LAB = {
  ...OWN,
  ownPerspective: false,
  currentPerspective: {
    type: 'research_structure', uid: 'lab-ths', slug: 'ths', membershipAcronyms: ['THS'],
    getDisplayName: () => 'Territoires, Habitat et Sociétés (THS)',
  },
}
const COLLEAGUE = {
  ...OWN,
  ownPerspective: false,
  currentPerspective: {
    type: 'person', uid: 'marie', slug: 'marie-curie', membershipAcronyms: ['LS2N'],
    getDisplayName: () => 'Marie Curie',
  },
}
let mockUser: unknown = OWN

jest.mock('@/stores/global_store', () => ({
  __esModule: true,
  default: (selector: (s: unknown) => unknown) => selector({ user: mockUser }),
}))

// Revenir à son espace : la perspective redevient celle de la personne connectée.
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: () => { mockUser = OWN } }),
  usePathname: () => '/fr/expertise-v2',
  useSearchParams: () => new URLSearchParams(),
}))

jest.mock('@/mocks/dashboardMockService', () => ({
  dashboardMockService: { getLab: () => ({ name: 'IREENA' }) },
}))

// Rendus lourds (éditeur, React Flow stubbé, labo) : le délai par défaut de 5 s
// est dépassé sous instrumentation de couverture.
jest.setTimeout(20000)

const themeButton = (name: RegExp) => screen.getByRole('button', { name })
const themeRow = (name: RegExp) => themeButton(name).closest('tr') as HTMLElement
const openSection = (name: RegExp) => fireEvent.click(screen.getByRole('button', { name }))

describe('ExpertiseV2Page', () => {
  beforeEach(() => {
    localStorage.clear()
    mockUser = OWN
  })

  it('affiche la liste des thèmes du profil de démo avec période, diffusion et statut', () => {
    render(<ExpertiseV2Page />)

    const row = themeRow(/Modifier le thème Habitat inclusif et politiques publiques/)
    expect(within(row).getByText('2017 → en cours')).toBeInTheDocument()
    expect(within(row).getByText('Établissement')).toBeInTheDocument()
    expect(within(row).getByText('Validé')).toBeInTheDocument()
    // L'enrichissement n'encombre pas la liste
    expect(within(row).queryByText('Bretagne, Pays de la Loire +1')).not.toBeInTheDocument()
    // Un seul brouillon dans le profil de démo
    expect(screen.getAllByText('Brouillon')).toHaveLength(1)
  })

  it('filtre la liste des thèmes par statut, puis réinitialise', () => {
    render(<ExpertiseV2Page />)

    fireEvent.click(screen.getByRole('button', { name: 'Statut' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Brouillon' }))
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })
    expect(screen.queryByRole('button', { name: /Modifier le thème Habitat inclusif/, hidden: true })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'documents_page_reset_filters', hidden: true }))
    expect(themeButton(/Modifier le thème Habitat inclusif/)).toBeInTheDocument()
  })

  it('garde l’enrichissement replié à l’ouverture d’un thème', () => {
    render(<ExpertiseV2Page />)

    fireEvent.click(themeButton(/Modifier le thème Vieillissement et territoires ruraux/))
    // Le résumé est visible, pas le formulaire
    expect(screen.getByRole('button', { name: /Lieux, personnes et organisations/ })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByLabelText('Terrains et lieux')).not.toBeInTheDocument()

    openSection(/Lieux, personnes et organisations/)
    expect(screen.getByLabelText('Terrains et lieux')).toBeInTheDocument()
  })

  it('ouvre l’éditeur, active les sollicitations quand le thème devient public, puis valide', () => {
    render(<ExpertiseV2Page />)

    fireEvent.click(themeButton(/Modifier le thème Habitat inclusif/))
    expect(screen.getByText('Diffusion de ce thème')).toBeInTheDocument()

    // Les sollicitations n'apparaissent que pour un thème public
    expect(screen.queryByLabelText(/contacté·e par des journalistes/)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('radio', { name: /Public/ }))
    fireEvent.click(screen.getByLabelText(/contacté·e par des journalistes/))

    fireEvent.click(screen.getByRole('button', { name: /Valider ce thème/ }))

    // Retour à la liste : la ligne affiche désormais Public, et le choix est conservé
    expect(within(themeRow(/Modifier le thème Habitat inclusif/)).getByText('Public')).toBeInTheDocument()
    fireEvent.click(themeButton(/Modifier le thème Habitat inclusif/))
    expect(screen.getByLabelText(/contacté·e par des journalistes/)).toBeChecked()
  })

  it('propose les lieux, personnes et organisations en option normale de l’éditeur et permet d’ajouter un lieu', () => {
    render(<ExpertiseV2Page />)

    fireEvent.click(themeButton(/Modifier le thème Vieillissement et territoires ruraux/))
    openSection(/Lieux, personnes et organisations/)
    // Repères existants rendus en chips avec lien vers le référentiel
    expect(screen.getByRole('link', { name: /Finistère/ })).toHaveAttribute('href', 'https://www.geonames.org/3018471')
    expect(screen.getByRole('link', { name: /INSEE/ })).toHaveAttribute('href', 'https://www.idref.fr/033155291')

    const placeInput = screen.getByLabelText('Terrains et lieux')
    fireEvent.change(placeInput, { target: { value: 'Morbi' } })
    fireEvent.click(screen.getByText('Morbihan'))

    fireEvent.click(screen.getByRole('button', { name: /Enregistrer le brouillon/ }))
    fireEvent.click(themeButton(/Modifier le thème Vieillissement et territoires ruraux/))
    expect(screen.getByRole('button', { name: /Lieux, personnes et organisations.*4 lieux/ })).toBeInTheDocument()
  })

  it('génère les déclinaisons par public depuis la description, sans saisie supplémentaire', async () => {
    render(<ExpertiseV2Page />)

    fireEvent.click(themeButton(/Modifier le thème Mobilités résidentielles des retraités/))
    openSection(/Déclinaison par public/)

    fireEvent.click(screen.getByRole('button', { name: /Générer les déclinaisons/ }))
    expect(await screen.findByRole('button', { name: /Déclinaison par public.*4 . 4 publics/ }, { timeout: 4000 })).toBeInTheDocument()

    const researchers = screen.getByLabelText('Déclinaison pour Chercheurs') as HTMLTextAreaElement
    expect(researchers.value).toMatch(/Mobilités résidentielles des retraités/)
    expect(researchers.value).toMatch(/Terrains : Littoral atlantique, Vendée et Charente-Maritime/)

    fireEvent.click(screen.getByRole('tab', { name: /Presse/ }))
    const media = screen.getByLabelText('Déclinaison pour Journalistes') as HTMLTextAreaElement
    expect(media.value).toMatch(/Je peux répondre sur mobilités résidentielles des retraités/)
  })

  it('décline l’aperçu public selon le public choisi', () => {
    render(<ExpertiseV2Page />)

    fireEvent.click(screen.getByRole('tab', { name: /Aperçu public/ }))
    expect(screen.getByText('Méthodes participatives en géographie sociale')).toBeInTheDocument()
    expect(screen.queryByText('Habitat inclusif et politiques publiques')).not.toBeInTheDocument()
    expect(screen.getByText(/2 thèmes masqués/)).toBeInTheDocument()

    // Vue journalistes : la version adaptée remplace la description générale
    fireEvent.click(screen.getByRole('button', { name: /^Presse$/ }))
    expect(screen.getByText(/Comment associer vraiment les habitants aux décisions/)).toBeInTheDocument()
    // Seul le thème sans déclinaison le signale
    expect(screen.getAllByText('Description générale (pas de déclinaison pour ce public)')).toHaveLength(1)
  })

  it('replie le détail des thèmes dans l’aperçu public', () => {
    render(<ExpertiseV2Page />)

    fireEvent.click(screen.getByRole('tab', { name: /Aperçu public/ }))
    const article = screen.getByRole('heading', { name: 'Méthodes participatives en géographie sociale' }).parentElement as HTMLElement
    const details = within(article).getByRole('button', { name: 'Voir le détail' })
    expect(details).toHaveAttribute('aria-expanded', 'false')
    const keywordCount = () => article.querySelectorAll('.MuiChip-root').length
    expect(keywordCount()).toBe(0)

    fireEvent.click(details)
    expect(within(article).getByRole('button', { name: 'Masquer le détail' })).toHaveAttribute('aria-expanded', 'true')
    expect(keywordCount()).toBeGreaterThan(0)
  })

  it('distingue la période de travail de la période étudiée dans la liste et l’éditeur', () => {
    render(<ExpertiseV2Page />)

    expect(within(themeRow(/Modifier le thème Mobilités résidentielles des retraités/)).getByText('2009 → 2014')).toBeInTheDocument()

    fireEvent.click(themeButton(/Modifier le thème Mobilités résidentielles des retraités/))
    expect(screen.getByText('Période de travail sur ce thème')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Période étudiée.*Recensements 1975 – 2006/ })).toBeInTheDocument()
    openSection(/Période étudiée/)

    // Ajout d'une période nommée du référentiel
    fireEvent.change(screen.getByLabelText('Période étudiée'), { target: { value: 'Trente' } })
    fireEvent.click(screen.getByText('Trente Glorieuses'))
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer le brouillon/ }))

    fireEvent.click(themeButton(/Modifier le thème Mobilités résidentielles des retraités/))
    expect(screen.getByRole('button', { name: /Période étudiée.*Trente Glorieuses/ })).toBeInTheDocument()
  })

  it('propose des thèmes d’après les publications non rattachées et rattache les autres aux thèmes existants', async () => {
    render(<ExpertiseV2Page />)

    fireEvent.click(screen.getByRole('button', { name: /Proposer des thèmes d’après mes publications/ }))
    expect(screen.getByText(/Choisir les publications/)).toBeInTheDocument()
    // Les 12 publications non rattachées à un thème sont pré-sélectionnées
    expect(screen.getByText(/12 publications sélectionnées sur 28/)).toBeInTheDocument()
    // Une publication déjà rattachée est signalée par le nom de son thème
    expect(screen.getAllByText('Habitat inclusif et politiques publiques').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: /Proposer des thèmes d’après 12 publications/ }))
    // Une carte par proposition : 3 nouveaux thèmes + 2 rattachements
    expect(await screen.findAllByRole('button', { name: 'Voir le détail' }, { timeout: 4000 })).toHaveLength(5)
    // Le détail est replié : la liste des publications n'apparaît qu'à la demande
    expect(screen.queryByText('Publications à l’appui')).not.toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: 'Voir le détail' })[0])
    expect(screen.getByText('Publications à l’appui')).toBeInTheDocument()

    // Trois nouveaux thèmes, deux rattachements à des thèmes existants
    expect(screen.getByLabelText('Intitulé proposé : Précarité énergétique des ménages âgés')).toBeInTheDocument()
    expect(screen.getByText(/2020 → en cours · 4 publications/)).toBeInTheDocument()
    expect(screen.getByText(/Vous décrivez déjà ce sujet : « Mobilités résidentielles des retraités »/)).toBeInTheDocument()
    expect(screen.getByText(/période étendue à 2009 → 2015/)).toBeInTheDocument()
    expect(screen.getByText(/période étudiée ajoutée : Trente Glorieuses/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Ajouter 3 thèmes en brouillon et rattacher/ }))

    expect(screen.getAllByText('Brouillon')).toHaveLength(4)
    const newRow = themeRow(/Modifier le thème Précarité énergétique des ménages âgés/)
    expect(within(newRow).getByText('2020 → en cours')).toBeInTheDocument()
    expect(within(newRow).getByText('4')).toBeInTheDocument()
    // Le thème existant a été enrichi : période étendue, publication et période étudiée ajoutées
    const existingRow = themeRow(/Modifier le thème Mobilités résidentielles des retraités/)
    expect(within(existingRow).getByText('2009 → 2015')).toBeInTheDocument()
    expect(within(existingRow).getByText('5')).toBeInTheDocument()
    fireEvent.click(themeButton(/Modifier le thème Mobilités résidentielles des retraités/))
    expect(screen.getByRole('button', { name: /Période étudiée.*Trente Glorieuses/ })).toBeInTheDocument()
  })

  it('affiche la vue laboratoire agrégée à partir des thèmes des membres', () => {
    mockUser = LAB
    render(<ExpertiseV2Page />)

    expect(screen.getByText(/Territoires, Habitat et Sociétés \(THS\)/)).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Sujets/ })).toBeInTheDocument()
    expect(screen.getByText('Profils renseignés')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Expertises publiques/ })).toBeInTheDocument()

    // Le profil connecté est un membre : son thème privé et son brouillon sont signalés comme invisibles
    expect(screen.getByText(/1 de vos thèmes n’est pas visible ici/)).toBeInTheDocument()

    // Un sujet partagé regroupe plusieurs membres via le mot-clé contrôlé
    fireEvent.click(screen.getByRole('button', { name: /Voir les membres travaillant sur Habitat inclusif/ }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('Aurélie Tanguy')).toBeInTheDocument()
    expect(within(dialog).getByText('Léa Guillou')).toBeInTheDocument()
    expect(within(dialog).getByText('Jean Dupont (vous)')).toBeInTheDocument()
  })

  it('filtre la vue laboratoire par année et par sollicitation', () => {
    mockUser = LAB
    render(<ExpertiseV2Page />)

    fireEvent.click(screen.getByRole('button', { name: 'Année' }))
    fireEvent.change(screen.getByLabelText('documents_page_year_from'), { target: { value: '2030' } })
    expect(screen.getByText('Aucun sujet ne correspond à ces filtres.')).toBeInTheDocument()
    fireEvent.keyDown(screen.getByRole('presentation'), { key: 'Escape' })

    fireEvent.click(screen.getByRole('button', { name: /documents_page_reset_filters/ }))
    fireEvent.click(screen.getByRole('tab', { name: /Expertises publiques/ }))
    const before = screen.getAllByRole('button', { name: /Voir l’expertise/ }).length

    fireEvent.click(screen.getByRole('button', { name: 'Sollicitations' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Accepte la presse' }))
    // Le menu de filtre encore ouvert masque la page aux technologies d'assistance.
    expect(screen.getAllByRole('button', { name: /Voir l’expertise/, hidden: true }).length).toBeLessThan(before)
  })

  it('consulte le profil d’un·e collègue en lecture seule et copie un thème avec ses mots-clés', () => {
    mockUser = LAB
    render(<ExpertiseV2Page />)

    fireEvent.click(screen.getByRole('tab', { name: /Membres/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Voir le profil de recherche de Thomas Caradec' }))

    expect(screen.getByText('Lecture seule')).toBeInTheDocument()
    expect(screen.getByRole('article', { name: /Renouvellement urbain et quartiers populaires/ })).toBeInTheDocument()
    expect(screen.getByRole('article', { name: /Méthodes participatives en géographie sociale/ })).toBeInTheDocument()
    // Aucun thème modifiable dans cette vue
    expect(screen.queryByRole('button', { name: /Modifier le thème/ })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Copier le thème Renouvellement urbain et quartiers populaires dans mon profil/ }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('Mots-clés repris (2/2)')).toBeInTheDocument()
    expect(within(dialog).getByText('Rénovation urbaine')).toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: /Copier et modifier/ }))

    // L'éditeur s'ouvre sur la copie, avec sa provenance et les mots-clés repris
    expect(screen.getByText(/depuis le thème « Renouvellement urbain et quartiers populaires » de Thomas Caradec/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Mots-clés.*Rénovation urbaine/ })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }))
    expect(within(themeRow(/Modifier le thème Renouvellement urbain et quartiers populaires/)).getByText('Brouillon')).toBeInTheDocument()
  })

  it('ne montre pas les brouillons ni les thèmes privés d’un·e collègue', () => {
    mockUser = LAB
    render(<ExpertiseV2Page />)

    fireEvent.click(screen.getByRole('tab', { name: /Membres/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Voir le profil de recherche de Sarah Lemoine' }))
    expect(screen.getByText('Aucun thème visible pour l’instant')).toBeInTheDocument()
    expect(screen.getByText('1 thème non affiché (brouillon ou privé).')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Retour au laboratoire/ }))
    expect(screen.getByRole('tab', { name: /Sujets/ })).toBeInTheDocument()
  })

  it('propose de consulter un·e collègue depuis son propre profil, via le moteur de recherche', () => {
    render(<ExpertiseV2Page />)

    fireEvent.click(screen.getByRole('button', { name: 'Plus d’actions' }))
    fireEvent.click(screen.getByRole('menuitem', { name: /Consulter le profil d’un·e collègue/ }))
    expect(usePerspectiveUi.getState().anchorEl).not.toBeNull()
    act(() => usePerspectiveUi.getState().closePicker())
  })

  it('consulte une autre personne en lecture seule sans rien écrire dans son profil', () => {
    mockUser = COLLEAGUE
    render(<ExpertiseV2Page />)

    expect(screen.getByText('Lecture seule')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Modifier le thème/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Ajouter un thème/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Réinitialiser la démo/ })).not.toBeInTheDocument()
    expect(localStorage.length).toBe(0)
  })

  it('n’inclut pas la personne connectée dans une structure dont elle n’est pas membre', () => {
    mockUser = { ...LAB, currentPerspective: { ...LAB.currentPerspective, uid: 'autre', slug: 'autre', getDisplayName: () => 'Autre labo' } }
    render(<ExpertiseV2Page />)

    expect(screen.getByText(/Autre labo/)).toBeInTheDocument()
    expect(screen.queryByText(/de vos thèmes/)).not.toBeInTheDocument()
  })

  it('copie un thème depuis l’espace d’une autre personne : retour à son profil, éditeur ouvert', () => {
    mockUser = COLLEAGUE
    render(<ExpertiseV2Page />)

    fireEvent.click(screen.getAllByRole('button', { name: /Copier le thème .* dans mon profil/ })[0])
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /Copier et modifier/ }))

    expect(screen.getByText(/de Marie Curie/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }))
    expect(screen.getByRole('button', { name: /Ajouter un thème/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Thèmes/ })).toBeInTheDocument()
  })
})
