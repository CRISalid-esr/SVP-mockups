// Données de démonstration du parcours « Compléter dans HAL ».
// Les propositions sont écrites à la main pour rester cohérentes avec doc-1 et doc-6
// (voir src/mocks/data/documents.json). En production, elles viendraient d'une
// comparaison entre la notice SoVisu+ et la notice HAL moissonnée.

export type HalAccess = 'owner' | 'delegate' | 'not_owner'

export interface HalUpdateProposal {
  id: string
  /** add : envoyable à HAL. replace : visible seulement, à corriger dans HAL. */
  kind: 'add' | 'replace'
  category: string
  value: string
  /** Valeur actuelle dans HAL (uniquement pour kind = replace). */
  halValue?: string
  source: string
  defaultSelected: boolean
  /** Point d'attention, par exemple sur les droits de réutilisation. */
  warning?: string
  /** Intérêt concret de l'ajout, par exemple l'entrée dans une collection. */
  benefit?: string
}

export interface HalUpdateScenario {
  ownerName: string
  delegateStructure: string
  defaultAccess: HalAccess
  proposals: HalUpdateProposal[]
}

const ABSTRACT_RIGHTS_WARNING =
  `Ce résumé vient d'une source externe : vérifiez que vous pouvez le réutiliser avant de l'ajouter.`

const SCENARIOS: Record<string, HalUpdateScenario> = {
  'doc-1': {
    ownerName: 'Jean Dupont',
    delegateStructure: 'LS2N',
    defaultAccess: 'owner',
    proposals: [
      {
        id: 'keyword-deep-learning',
        kind: 'add',
        category: 'Mot-clé',
        value: 'Apprentissage profond',
        source: 'Scopus',
        defaultSelected: true,
      },
      {
        id: 'keyword-climate',
        kind: 'add',
        category: 'Mot-clé',
        value: 'Changement climatique',
        source: 'Scopus',
        defaultSelected: true,
      },
      {
        id: 'title-fr',
        kind: 'add',
        category: 'Titre en français',
        value: 'Une approche par apprentissage profond pour la modélisation climatique',
        source: 'Saisi dans SoVisu+',
        defaultSelected: true,
      },
      {
        id: 'orcid-martin',
        kind: 'add',
        category: 'ORCID de Sophie Martin',
        value: '0000-0002-9876-5432',
        source: 'Onglet Auteurs',
        defaultSelected: true,
      },
      {
        id: 'affiliation-leclerc',
        kind: 'add',
        category: 'Affiliation d\'Anne Leclerc',
        value: 'EHESS - École des hautes études en sciences sociales',
        source: 'Onglet Auteurs',
        defaultSelected: true,
      },
      {
        id: 'abstract-en',
        kind: 'add',
        category: 'Résumé en anglais',
        value: 'In this paper, we present a novel architecture for climate prediction...',
        source: 'Scopus',
        defaultSelected: false,
        warning: ABSTRACT_RIGHTS_WARNING,
      },
      {
        id: 'date',
        kind: 'replace',
        category: 'Date de publication',
        value: '15 mai 2023',
        halValue: '1er janvier 2023',
        source: 'Scopus',
        defaultSelected: false,
      },
    ],
  },
  'doc-6': {
    ownerName: 'Anne Leclerc',
    delegateStructure: 'LS2N',
    defaultAccess: 'not_owner',
    proposals: [
      {
        id: 'affiliation-leclerc-ls2n',
        kind: 'add',
        category: 'Affiliation d\'Anne Leclerc',
        value: 'LS2N - Laboratoire des sciences du numérique à Nantes',
        source: 'Onglet Auteurs',
        defaultSelected: true,
        benefit: 'Peut faire entrer cette publication dans la collection LS2N, selon les règles de collection du laboratoire.',
      },
      {
        id: 'keyword-biodiversity',
        kind: 'add',
        category: 'Mot-clé',
        value: 'Biodiversité des sols',
        source: 'OpenAlex',
        defaultSelected: true,
      },
      {
        id: 'title-en',
        kind: 'add',
        category: 'Titre en anglais',
        value: 'Agricultural soil biodiversity: impact of intensive farming practices',
        source: 'OpenAlex',
        defaultSelected: true,
      },
      {
        id: 'abstract-fr',
        kind: 'add',
        category: 'Résumé en français',
        value: `Cette étude analyse l'effet des pratiques agricoles intensives sur la diversité microbienne et faunistique des sols à l'échelle de la parcelle.`,
        source: 'OpenAlex',
        defaultSelected: false,
        warning: ABSTRACT_RIGHTS_WARNING,
      },
    ],
  },
}

const EMPTY_SCENARIO: HalUpdateScenario = {
  ownerName: '',
  delegateStructure: '',
  defaultAccess: 'owner',
  proposals: [],
}

export const getHalUpdateScenario = (uid: string): HalUpdateScenario =>
  SCENARIOS[uid] ?? EMPTY_SCENARIO
