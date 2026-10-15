import { fireEvent, render, screen, within } from '@testing-library/react'
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

jest.mock('@/stores/global_store', () => ({
  __esModule: true,
  default: (selector: (s: unknown) => unknown) => selector({ user: { currentPerspective: null } }),
}))

jest.mock('@/mocks/dashboardMockService', () => ({
  dashboardMockService: { getLab: () => ({ name: 'IREENA' }) },
}))

// Rendus lourds (éditeur, React Flow stubbé, labo) : le délai par défaut de 5 s
// est dépassé sous instrumentation de couverture.
jest.setTimeout(20000)

describe('ExpertiseV2Page', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('affiche la liste des thèmes du profil de démo avec période, diffusion et statut', () => {
    render(<ExpertiseV2Page />)

    expect(screen.getByText('Mes thèmes de recherche')).toBeInTheDocument()
    const row = screen.getByRole('button', { name: /Modifier le thème Habitat inclusif et politiques publiques/ })
    expect(within(row).getByText('2017 → en cours')).toBeInTheDocument()
    expect(within(row).getByText('Établissement')).toBeInTheDocument()
    expect(within(row).getByText('Validé')).toBeInTheDocument()
    // Repères structurés résumés sur la ligne
    expect(within(row).getByText('Bretagne, Pays de la Loire +1')).toBeInTheDocument()
    // Un brouillon est signalé
    expect(screen.getByText(/1 thème en brouillon/)).toBeInTheDocument()
  })

  it('ouvre l’éditeur, active les sollicitations quand le thème devient public, puis valide', () => {
    render(<ExpertiseV2Page />)

    fireEvent.click(screen.getByRole('button', { name: /Modifier le thème Habitat inclusif/ }))
    expect(screen.getByText('Diffusion de ce thème')).toBeInTheDocument()

    const press = screen.getByLabelText(/contacté·e par des journalistes/)
    expect(press).toBeDisabled()

    fireEvent.click(screen.getByRole('radio', { name: /Public/ }))
    expect(screen.getByLabelText(/contacté·e par des journalistes/)).not.toBeDisabled()
    fireEvent.click(screen.getByLabelText(/contacté·e par des journalistes/))

    fireEvent.click(screen.getByRole('button', { name: /Valider ce thème/ }))

    // Retour à la liste : la ligne affiche désormais Public · Presse
    const row = screen.getByRole('button', { name: /Modifier le thème Habitat inclusif/ })
    expect(within(row).getByText('Public')).toBeInTheDocument()
    expect(within(row).getByText('Presse')).toBeInTheDocument()
  })

  it('propose les lieux, personnes et organisations en option normale de l’éditeur et permet d’ajouter un lieu', () => {
    render(<ExpertiseV2Page />)

    fireEvent.click(screen.getByRole('button', { name: /Modifier le thème Vieillissement et territoires ruraux/ }))
    expect(screen.getByText('Lieux, personnes et organisations')).toBeInTheDocument()
    // Repères existants rendus en chips avec lien vers le référentiel
    expect(screen.getByRole('link', { name: /Finistère/ })).toHaveAttribute('href', 'https://www.geonames.org/3018471')
    expect(screen.getByRole('link', { name: /INSEE/ })).toHaveAttribute('href', 'https://www.idref.fr/033155291')

    const placeInput = screen.getByLabelText('Terrains et lieux')
    fireEvent.change(placeInput, { target: { value: 'Morbi' } })
    fireEvent.click(screen.getByText('Morbihan'))

    fireEvent.click(screen.getByRole('button', { name: /Enregistrer le brouillon/ }))
    const row = screen.getByRole('button', { name: /Modifier le thème Vieillissement et territoires ruraux/ })
    expect(within(row).getByText('Bretagne, Finistère +2')).toBeInTheDocument()
  })

  it('génère les déclinaisons par public depuis la description, sans saisie supplémentaire', async () => {
    render(<ExpertiseV2Page />)

    fireEvent.click(screen.getByRole('button', { name: /Modifier le thème Mobilités résidentielles des retraités/ }))
    expect(screen.getByText('Déclinaison par public')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Générer les déclinaisons/ }))
    expect(await screen.findByText('4 / 4 publics', {}, { timeout: 4000 })).toBeInTheDocument()

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
    expect(screen.getAllByText('Version adaptée aux journalistes')).toHaveLength(2)
    // Le thème sans déclinaison garde la description générale
    expect(screen.getByText('Description générale (pas de déclinaison pour ce public)')).toBeInTheDocument()
    expect(screen.getByText(/1 thème sans déclinaison pour ce public/)).toBeInTheDocument()
  })

  it('distingue la période de travail de la période étudiée dans la liste et l’éditeur', () => {
    render(<ExpertiseV2Page />)

    const row = screen.getByRole('button', { name: /Modifier le thème Mobilités résidentielles des retraités/ })
    expect(within(row).getByText('2009 → 2014')).toBeInTheDocument()
    expect(within(row).getByText('Porte sur')).toBeInTheDocument()
    expect(within(row).getByText('Recensements 1975 – 2006')).toBeInTheDocument()

    fireEvent.click(row)
    expect(screen.getByText('Période de travail sur ce thème')).toBeInTheDocument()
    expect(screen.getByText('Période étudiée')).toBeInTheDocument()

    // Ajout d'une période nommée du référentiel
    fireEvent.change(screen.getByLabelText('Période étudiée'), { target: { value: 'Trente' } })
    fireEvent.click(screen.getByText('Trente Glorieuses'))
    fireEvent.click(screen.getByRole('button', { name: /Enregistrer le brouillon/ }))

    const updated = screen.getByRole('button', { name: /Modifier le thème Mobilités résidentielles des retraités/ })
    expect(within(updated).getByText('Trente Glorieuses')).toBeInTheDocument()
  })

  it('propose des thèmes d’après les publications non rattachées et rattache les autres aux thèmes existants', async () => {
    render(<ExpertiseV2Page />)

    fireEvent.click(screen.getByRole('button', { name: /Proposer des thèmes d’après mes publications/ }))
    expect(screen.getByText('Choisir les publications')).toBeInTheDocument()
    // Les 12 publications non rattachées à un thème sont pré-sélectionnées
    expect(screen.getByText(/12 publications sélectionnées sur 28/)).toBeInTheDocument()
    // Une publication déjà rattachée est signalée par le nom de son thème
    expect(screen.getAllByText('Habitat inclusif et politiques publiques').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: /Proposer des thèmes d’après 12 publications/ }))
    // Une carte par proposition : 3 nouveaux thèmes + 2 rattachements
    expect(await screen.findAllByText('Publications à l’appui', {}, { timeout: 4000 })).toHaveLength(5)

    // Trois nouveaux thèmes, deux rattachements à des thèmes existants
    expect(screen.getByLabelText('Intitulé proposé : Précarité énergétique des ménages âgés')).toBeInTheDocument()
    expect(screen.getByText(/Période de travail : 2020 → en cours/)).toBeInTheDocument()
    expect(screen.getByText(/Vous décrivez déjà ce sujet : « Mobilités résidentielles des retraités »/)).toBeInTheDocument()
    expect(screen.getByText(/période étendue à 2009 → 2015/)).toBeInTheDocument()
    expect(screen.getByText(/période étudiée ajoutée : Trente Glorieuses/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Ajouter 3 thèmes en brouillon et rattacher/ }))

    expect(screen.getByText(/4 thèmes en brouillon/)).toBeInTheDocument()
    const newRow = screen.getByRole('button', { name: /Modifier le thème Précarité énergétique des ménages âgés/ })
    expect(within(newRow).getByText('2020 → en cours')).toBeInTheDocument()
    expect(within(newRow).getByText('4 publications')).toBeInTheDocument()
    // Le thème existant a été enrichi : période étendue, publication et période étudiée ajoutées
    const existingRow = screen.getByRole('button', { name: /Modifier le thème Mobilités résidentielles des retraités/ })
    expect(within(existingRow).getByText('2009 → 2015')).toBeInTheDocument()
    expect(within(existingRow).getByText('5 publications')).toBeInTheDocument()
    expect(within(existingRow).getByText('Trente Glorieuses')).toBeInTheDocument()
  })

  it('affiche la vue laboratoire agrégée à partir des thèmes des membres', () => {
    render(<ExpertiseV2Page />)

    fireEvent.click(screen.getByRole('button', { name: /Laboratoire/ }))
    expect(screen.getByText('Territoires, Habitat et Sociétés (THS)')).toBeInTheDocument()
    expect(screen.getByText('Frise des sujets du laboratoire')).toBeInTheDocument()
    expect(screen.getByText('Profils renseignés')).toBeInTheDocument()
    expect(screen.getByText('Expertises publiques')).toBeInTheDocument()

    // Le profil connecté est un membre : son thème privé et son brouillon sont signalés comme invisibles
    expect(screen.getByText(/1 de vos thèmes n’est pas visible ici/)).toBeInTheDocument()

    // Un sujet partagé regroupe plusieurs membres via le mot-clé contrôlé
    fireEvent.click(screen.getByRole('button', { name: /Voir les membres travaillant sur Habitat inclusif/ }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('Aurélie Tanguy')).toBeInTheDocument()
    expect(within(dialog).getByText('Léa Guillou')).toBeInTheDocument()
    expect(within(dialog).getByText('Jean Dupont (vous)')).toBeInTheDocument()
  })
})
