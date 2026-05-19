# Page : Liste des unités

**Route :** `/[lang]/laboratories` (affichage : "Unités")

## Contexte

Page de l'application **SoVisu+** listant l'ensemble des unités du périmètre de l'utilisateur : unités de recherche (UMR, UAR, UR, IRL), unités de services scientifiques, unités administratives, unités d'enseignement. Typiquement 30 à 100 unités pour un établissement, plusieurs centaines pour un consortium / COMUE.

Usages principaux :
- accéder à la fiche d'une unité,
- repérer les unités qui décrochent (publications, OA, dépôt HAL),
- filtrer par mission ou par tutelle,
- exporter une liste filtrée.

## Modèle de données (`generic_type: "unit"`)

```ts
type Unit = {
  uid: string
  generic_type: "unit"
  national_type: string | null    // UMR, UAR, UR, IRL, …
  local_types: Literal[]          // désignations libres si pas de national_type
  main_mission: "research" | "scientific_services" | "administrative_services" | "teaching"
  acronym: string                  // issu de short_labels
  long_name: string                // issu de long_labels
  institutionNames: string[]       // tutelles (noms)
  membersCount: number
  publicationsCount: number        // 24 derniers mois
  oaRate: number                   // 0–100
  halRate: number                  // 0–100
  rnsr?: string
}
```

Libellés des missions :
- `research` → **Recherche**
- `scientific_services` → **Services scientifiques**
- `administrative_services` → **Services administratifs**
- `teaching` → **Enseignement**

## Anatomie de la page

```
┌───────────────────────────────────────────────────────────────────┐
│ Sidebar │ Topbar : « Unités »       [Exporter] [↻ Mettre à jour]  │
│         ├──────────────────────────────────────────────────────── │
│         │ ┌──────────────────────────────────────────────────────┐ │
│         │ │ Toolbar : [🔍] [Filtrer] [Densité] [Plein écran] [Col]│ │
│         │ ├──────────────────────────────────────────────────────┤ │
│         │ │ ☐ Unité  Tutelles  Mission  Membres  Publis  OA  HAL  │ │
│         │ │ ☐ LIP6 ⬦UMR  …      Recherche  280  412  72%  65%   │ │
│         │ │ ☐ MeSU ⬦UAR  …      Serv.sci.   18    8 100%  88%   │ │
│         │ │ …                                                     │ │
│         │ └──────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

## Colonnes du tableau

| Col | Header           | Largeur | Contenu                                                                                   |
|-----|------------------|---------|-------------------------------------------------------------------------------------------|
| 1   | ☐                | 32 px   | Checkbox sélection.                                                                       |
| 2   | **Unité**        | auto    | Acronyme en gras + chip `national_type` (UMR, UAR…) sur la même ligne. Nom long en sous-texte gris 12 px, tronqué à 300 px. RNSR en dessous si disponible. Filtre texte sur acronyme + nom long. |
| 3   | **Tutelles**     | auto    | Noms des tutelles séparés par virgule. Filtre multi-select.                               |
| 4   | **Mission**      | 170 px  | Chip coloré : Recherche (vert), Services scientifiques (bleu), Services administratifs (orange), Enseignement (violet). Filtre multi-select.                  |
| 5   | **Membres**      | 100 px  | Nombre aligné à droite, gras.                                                             |
| 6   | **Publications** | 120 px  | Nombre aligné à droite, gras. Tooltip : "24 derniers mois".                               |
| 7   | **OA**           | 120 px  | Barre de progression 54×6 px + pourcentage. Couleur verte.                                |
| 8   | **HAL**          | 120 px  | Barre de progression + pourcentage. Couleur primaire.                                     |
| 9   | **Voir le détail** | 130 px | Lien → `/laboratories/[uid]`.                                                             |

## En-tête de page (droite)

- **Exporter** (icône `download`) → CSV avec colonnes visibles et filtres actifs.
- **Mettre à jour les publications** (icône `refresh`) → rafraîchissement asynchrone HAL/OpenAlex. Toast de confirmation.

## Toolbar du tableau

`[🔍 Recherche globale]` `[Filtres par colonne]` `[Densité]` `[Plein écran]` `[Colonnes]` `[Réinitialiser les filtres]`

## Navigation

- Clic sur une ligne ou bouton "Voir le détail" → `/laboratories/[uid]`
