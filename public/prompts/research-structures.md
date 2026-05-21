# Page : Liste des structures de recherche

**Route :** `/[lang]/research-structures`

## Contexte

Page de l'application **SoVisu+** listant l'ensemble des structures du périmètre de l'utilisateur, tous types confondus : institutions (universités, EPE, EPST), composantes (UFR, écoles internes, instituts), unités (UMR, UAR, UR, IRL, services scientifiques, services administratifs), équipes. Typiquement quelques institutions, quelques dizaines de composantes, et 30 à 100+ unités.

La page expose deux vues complémentaires accessibles par onglets :
- **Vue à plat** : tableau tabulaire filtrable et triable, adapté à la recherche et à l'export.
- **Vue hiérarchique** : arbre "part of" pour visualiser les rattachements entre structures.

**Périmètre de la maquette :** EPE Nantes Université — Nantes Université, Centrale Nantes, ENSA Nantes.

---

## Modèle de données

```ts
type ResearchStructure = {
  uid: string
  generic_type: "institution" | "composante" | "unit" | "team"
  national_type: string | null       // ex. "UMR", "UAR", "UR", "UFR", "Université", "EPE"
  local_types?: Literal[]            // désignations libres si pas de national_type
  main_mission: "research" | "scientific_services" | "administrative_services" | "teaching"
  acronym: string                    // issu de short_labels
  long_name: string                  // issu de long_labels
  institutionNames: string[]         // tutelles (noms, dénormalisé — toutes tutelles confondues)
  parent_uid: string | null          // tutelle principale dans l'arbre "part of"
  secondary_parent_uids: string[]    // tutelles secondaires (ex. CNRS, co-tutelles)
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
- `team` → **Équipe** (chip warning)

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
│         │ │ ☐ Structure       Type       Mission   Tutelles  Mbr  Pub  OA  HAL │
│         │ │ ☐ NU ⬦Université  Institution  Enseign.  —      56k  5.8k 62% 58% │
│         │ │ ☐ LS2N ⬦UMR      Unité        Recherche NU/CN/CNRS 350 520 58% 52%│
│         │ │ ↗ LS2N ⬦UMR      Unité (réf.) …                              │   │
│         │ │ …                                                              │   │
│         │ └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Colonnes

| Col | Header           | Contenu                                                                                                                        |
|-----|------------------|--------------------------------------------------------------------------------------------------------------------------------|
| 1   | ☐                | Checkbox sélection.                                                                                                            |
| 2   | **Structure**    | Acronyme gras + chip `national_type` + chip `generic_type` (si non-unité). Nom long en sous-texte gris 12 px, tronqué. RNSR si disponible. |
| 3   | **Type**         | Chip `generic_type` (Institution / Composante / Unité / Équipe). Filtre multi-select.                                         |
| 4   | **Mission**      | Chip coloré. Filtre multi-select.                                                                                              |
| 5   | **Tutelles**     | Noms de `institutionNames` séparés par virgule. Filtre multi-select. Vide pour les institutions racines.                       |
| 6   | **Membres**      | Nombre aligné à droite, gras.                                                                                                  |
| 7   | **Publications** | Nombre aligné à droite, gras. Tooltip "24 derniers mois". `—` si 0.                                                           |
| 8   | **OA**           | Barre de progression 54×6 px + pourcentage (vert). `—` si 0.                                                                  |
| 9   | **HAL**          | Barre de progression + pourcentage (couleur primaire). `—` si 0.                                                              |
| 10  | (sans header)    | Bouton "Détail →" → `/research-structures/[uid]`.                                                                             |

---

## Vue hiérarchique

```
▼ Nantes Université ⬦Université
  ▼ UFR Sciences ⬦UFR
    ▼ LS2N ⬦UMR          Recherche  350  520  58%  52%   ← occurrence principale
        TASC ⬦Équipe      Recherche   28   42  61%  55%
        ALMA ⬦Équipe      Recherche   22   31  55%  49%
      LMJL ⬦UMR          Recherche  130  210  72%  68%
  ▼ UFR LLSHS ⬦UFR
      CENS ⬦UMR           Recherche   68   95  51%  44%
  ▼ IAE Nantes ⬦Institut
      LEMNA ⬦UR            Recherche   72   98  39%  32%
    Polytech Nantes ⬦École interne
    BU Nantes ⬦SCD        Adm.       145    0   —    —

▼ Centrale Nantes ⬦École d'ingénieurs
  ↗ LS2N ⬦UMR  [co-tutelle]                              ← référence grisée/italique
    GeM ⬦UMR             Recherche  250  380  70%  76%
    LHEEA ⬦UMR           Recherche  105  188  74%  80%

▼ ENSA Nantes ⬦École d'architecture
    CRENAU ⬦UMR          Recherche   42   58  46%  40%
```

La hiérarchie est construite depuis `parent_uid`. Les nœuds sont développés par défaut. Le tri et les filtres par colonne sont désactivés en vue hiérarchique pour ne pas casser l'arbre.

---

## Choix retenu : structures multi-tutelles

**Problème :** certaines unités (UMR) ont plusieurs tutelles dans le périmètre — ex. LS2N est co-tutelle Nantes Université + Centrale Nantes + CNRS. Afficher LS2N uniquement sous Nantes Université rendrait l'arbre de Centrale Nantes incomplet.

**Solution retenue — doublon avec nœud de référence :**

- LS2N apparaît en **occurrence principale** sous UFR Sciences (Nantes Université), avec ses enfants (équipes TASC, ALMA).
- LS2N apparaît en **occurrence secondaire** sous Centrale Nantes : ligne grisée, texte italique, icône ↗, chip "co-tutelle" en pointillés, sans enfants. Le clic mène à la même fiche détail.
- La distinction visuelle indique clairement que ce n'est pas un doublon de données, mais un raccourci vers la même structure.

**Implémentation :** champ `secondary_parent_uids: string[]` dans le modèle. La fonction `buildTree` crée un nœud fantôme (`isReference: true`, uid synthétique `uid__ref__parentUid`) sous chaque parent secondaire présent dans le périmètre. CNRS n'étant pas dans le périmètre, il n'y a pas de nœud fantôme sous CNRS.

---

## Alternatives envisagées

### Option A — Une seule occurrence, chip co-tutelle
LS2N n'apparaît que sous sa tutelle principale. Un chip "co-tutelle : Centrale Nantes, CNRS" est affiché sur la ligne.

- ✅ Pas de doublons, comptages sans ambiguïté.
- ❌ Centrale Nantes ne voit pas LS2N dans son arbre — lecture incomplète pour les responsables de Centrale.
- ❌ La colonne "Tutelles" existe déjà en vue à plat pour ce besoin.

### Option B — Doublon avec nœud de référence ✅ **retenu**
Voir ci-dessus.

- ✅ Chaque institution voit toutes ses unités, même co-tutelles.
- ✅ La différence visuelle évite la confusion "deux unités distinctes".
- ✅ Modèle adopté par HAL, Scanr, OpenAlex.
- ⚠️ Les chiffres sur le nœud de référence (membres, publications) sont identiques à l'original — risque de double comptage si l'utilisateur agrège mentalement les lignes.

### Option C — Groupe "Structures partagées"
Les UMRs multi-tutelles sont sorties de la hiérarchie et listées dans un groupe à part, en dehors de toute institution.

- ✅ Aucun doublon.
- ❌ Casse la lecture par institution.
- ❌ Les UMRs sont très nombreuses dans les grands établissements : le groupe "partagées" deviendrait dominant.

### Option D — Arbre multi-parent (DAG)
Affichage d'un graphe orienté acyclique plutôt qu'un arbre strict. LS2N est rattaché à deux nœuds par des flèches.

- ✅ Représentation la plus fidèle au modèle de données.
- ❌ Aucune bibliothèque de tableau (MRT, AG Grid, TanStack) ne gère nativement le DAG — nécessiterait un composant custom (D3, React Flow).
- ❌ Expérience utilisateur plus complexe à lire qu'un arbre.

---

## Questions ouvertes

❓ **Nœud de référence — afficher les chiffres ?** Faut-il afficher membres/publications sur le nœud de référence (risque de double comptage apparent) ou les masquer avec `—` ?

❓ **Tutelles hors périmètre** (ex. CNRS) : doit-on les afficher comme nœuds fantômes dans l'arbre, ou uniquement dans la colonne Tutelles de la vue à plat ?

❓ **Profondeur de l'arbre** : la maquette montre 4 niveaux max (institution > composante > unité > équipe). L'arbre peut-il être plus profond en production ? Faut-il limiter l'expansion automatique au-delà d'un certain niveau ?

❓ **Structures sans `parent_uid`** dans le périmètre : les unités dont la tutelle principale n'est pas dans le périmètre doivent-elles apparaître en racine de l'arbre, ou dans un groupe "Autres" ?

❓ **Tri des nœuds frères** : alphabétique, par nombre de membres, ou ordre de la base ?

❓ **Périmètre EPE** : l'EPE elle-même (Nantes Université au sens large) doit-elle apparaître comme nœud racine unique, ou les trois établissements membres sont-ils les racines, comme dans la maquette actuelle ?
