# Page : Liste des structures de recherche

**Route :** `/[lang]/research-structures`

## Contexte

Page de l'application **SoVisu+** listant l'ensemble des structures du périmètre de l'utilisateur, tous types confondus : institutions (universités, EPST), composantes (UFR, écoles, instituts), unités (UMR, UAR, UR, IRL, services scientifiques, services administratifs). Typiquement quelques institutions, quelques dizaines de composantes, et 30 à 100+ unités.

La page expose deux vues complémentaires accessibles par onglets :
- **Vue à plat** : tableau tabulaire filtrable et triable, adapté à la recherche et à l'export.
- **Vue hiérarchique** : arbre "part of" pour visualiser les rattachements entre structures.

---

## Modèle de données

```ts
type ResearchStructure = {
  uid: string
  generic_type: "institution" | "composante" | "unit"
  national_type: string | null       // ex. "UMR", "UAR", "UR", "UFR", "Université", "EPST"
  local_types?: Literal[]            // désignations libres si pas de national_type
  main_mission: "research" | "scientific_services" | "administrative_services" | "teaching"
  acronym: string                    // issu de short_labels
  long_name: string                  // issu de long_labels
  institutionNames: string[]         // tutelles (noms, dénormalisé)
  parent_uid: string | null          // relation "part of" vers la structure parente
  membersCount: number
  publicationsCount: number          // 24 derniers mois
  oaRate: number                     // 0–100
  halRate: number                    // 0–100
  rnsr?: string
}
```

Libellés `generic_type` :
- `institution` → **Institution** (chip primary)
- `composante` → **Composante** (chip secondary)
- `unit` → **Unité de recherche** (chip default)

Libellés `main_mission` :
- `research` → **Recherche** (chip vert)
- `scientific_services` → **Services scientifiques** (chip bleu)
- `administrative_services` → **Services administratifs** (chip orange)
- `teaching` → **Enseignement** (chip violet)

---

## Vue à plat

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Sidebar │ « Structures de recherche »                    [Exporter]          │
│         ├──────────────────────────────────────────────────────────────────  │
│         │ [Vue à plat] [Vue hiérarchique]                                    │
│         │ ┌──────────────────────────────────────────────────────────────┐   │
│         │ │ Toolbar : [🔍] [Filtres] [Densité] [Plein écran] [Col] [✕]  │   │
│         │ ├──────────────────────────────────────────────────────────────┤   │
│         │ │ ☐ Structure  Type  Mission  Tutelles  Membres  Publis  OA  HAL │ │
│         │ │ ☐ SU ⬦Université  Enseignement  —  55 000  8 200  68%  62%   │ │
│         │ │ ☐ LIP6 ⬦UMR ⬦Unité  Recherche  SU/CNRS  280  412  72%  65%  │ │
│         │ │ …                                                              │ │
│         │ └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Colonnes

| Col | Header           | Contenu                                                                                                                        |
|-----|------------------|--------------------------------------------------------------------------------------------------------------------------------|
| 1   | ☐                | Checkbox sélection.                                                                                                            |
| 2   | **Structure**    | Acronyme gras + chip `national_type` + chip `generic_type`. Nom long en sous-texte gris 12 px, tronqué. RNSR si disponible.   |
| 3   | **Type**         | Chip `generic_type` (Institution / Composante / Unité de recherche). Filtre multi-select.                                     |
| 4   | **Mission**      | Chip coloré. Filtre multi-select.                                                                                              |
| 5   | **Tutelles**     | Noms séparés par virgule. Filtre multi-select. Vide pour les institutions racines.                                             |
| 6   | **Membres**      | Nombre aligné à droite, gras.                                                                                                  |
| 7   | **Publications** | Nombre aligné à droite, gras. Tooltip "24 derniers mois". `—` si 0.                                                           |
| 8   | **OA**           | Barre de progression 54×6 px + pourcentage (vert). `—` si 0.                                                                  |
| 9   | **HAL**          | Barre de progression + pourcentage (couleur primaire). `—` si 0.                                                              |
| 10  | (sans header)    | Bouton "Détail →" → `/research-structures/[uid]`.                                                                             |

---

## Vue hiérarchique

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [Vue à plat] [Vue hiérarchique]                                              │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ Toolbar : [🔍] [Densité] [Plein écran] [Col]                            │ │
│ ├──────────────────────────────────────────────────────────────────────────┤ │
│ │ ▼ Structure                     Mission    Membres  Publis  OA     HAL   │ │
│ │ ▼ Sorbonne Université ⬦Institution  Enseignement  55 000  8 200  68%  62% │ │
│ │   ▼ UFR Info ⬦Composante       Enseignement  1 200    680  71%  66%      │ │
│ │       LIP6 ⬦UMR ⬦Unité         Recherche       280    412  72%  65%      │ │
│ │     MeSU ⬦UAR ⬦Unité           Serv.sci.        18      8 100%  88%      │ │
│ │ ▼ Nantes Université ⬦Institution  Enseignement  40 000  5 100  60%  55%  │ │
│ │     LS2N ⬦UMR ⬦Unité           Recherche       350    520  58%  52%      │ │
│ │     BU Sciences ⬦Unité          Admin.           32      0    —    —      │ │
│ │ …                                                                         │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

La hiérarchie est construite depuis le champ `parent_uid`. Les nœuds sont développés par défaut. Le tri et les filtres par colonne sont désactivés pour ne pas casser l'arbre.

---

## En-tête de page

- **Exporter** → CSV de la vue à plat (colonnes visibles, filtres actifs).

## Toolbar

`[🔍 Recherche globale]` `[Filtres par colonne]` `[Densité]` `[Plein écran]` `[Colonnes]` `[✕ Réinitialiser les filtres]`

## Navigation

- Clic sur "Détail →" ou sur une ligne → `/research-structures/[uid]`

---

## Questions ouvertes

❓ **Structures multi-tutelles dans la vue hiérarchique** : une UMR appartenant à une université et au CNRS doit-elle apparaître sous les deux nœuds (avec risque de doublons), ou seulement sous sa tutelle principale ?

❓ **Nombre de niveaux** : la maquette montre 3 niveaux max (institution > composante > unité). L'arbre peut-il être plus profond en production ? Comment gérer la profondeur infinie ?

❓ **Structures sans `parent_uid`** : les unités sans institution connue dans le périmètre doivent-elles apparaître en racine de l'arbre, ou dans un groupe "Autres" ?

❓ **Tri dans la vue hiérarchique** : doit-on trier les nœuds frères par nom, par nombre de membres, ou garder l'ordre de la base ?
