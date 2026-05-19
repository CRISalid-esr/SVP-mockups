# Page : Liste des laboratoires

**Route :** `/[lang]/laboratories`

## Contexte

Tu développes une page de l'application **SoVisu+**, un outil de pilotage de la production scientifique destiné aux chercheurs, chargés de mission recherche, directions de laboratoires et bibliothécaires. 

La page **Laboratoires** liste l'ensemble des unités de recherche du périmètre de l'utilisateur (typiquement 30 à 50 labos pour un établissement, jusqu'à plusieurs centaines pour une vue consortium / COMUE). Elle est utilisée pour :

- accéder rapidement à la fiche d'un labo,
- repérer les labos qui décrochent (publications, OA, dépôt HAL),
- exporter une liste filtrée,


## Contenu attendu

- Titre de page : "Laboratoires"
- Filtre par institution (select ou chips)
- Liste des laboratoires (cards ou tableau) avec pour chaque labo :
  - Nom complet
  - Acronyme
  - Institution(s) de tutelle
  - Nombre de chercheurs
  - Identifiant ROR ou RNSR (si disponible)
- Champ de recherche par nom / acronyme

## Navigation

- Clic sur un laboratoire → `/laboratories/[id]`

## Données mock

Utiliser / enrichir `src/mocks/data/structures.json` avec des laboratoires ayant un type "laboratory" et un lien vers leur(s) institution(s) de tutelle.


## Anatomie de la page

```
┌───────────────────────────────────────────────────────────────────┐
│ Sidebar │ Topbar : « Laboratoires »   [Exporter] [↻ Mettre à jour] │
│         ├───────────────────────────────────────────────────────── │
│         ││         │                                                          │
│         │ ┌──────────────────────────────────────────────────────┐ │
│         │ │ Toolbar : [🔍] [Filtrer] [Trier] [Colonnes]           │ │
│         │ ├──────────────────────────────────────────────────────┤ │
│         │ │ ☐ Labo  Inst.  Domaine  Membres  Publis  OA  HAL …    │ │
│         │ │ ☐ LPG   …      …                                      │ │
│         │ │ ☐ LS2N  …      …                                      │ │
│         │ │ …                                                     │ │
│         │ └──────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

### 3.1 Topbar

- Titre : « Laboratoires »
- Actions à droite (boutons secondaires, icône + texte) :
  - **Exporter** (icône `download`) → ouvre un menu déroulant : CSV, XLSX, JSON. L'export reprend les colonnes visibles et les filtres actifs.
  - **Mettre à jour les publications** (icône `refresh`) → lance le rafraîchissement asynchrone des sources externes (HAL, OpenAlex…) pour les labos visibles. Toast de confirmation, badge « en cours » sur les lignes concernées.



### 3.3 Toolbar du tableau


Reprendre la toolbar du tableau des publications (rubrique publications)

### 3.4 Tableau

| Col | Header                | Largeur | Contenu / Format                                                                                          |
|-----|-----------------------|---------|-----------------------------------------------------------------------------------------------------------|
| 1   | ☐ (sélection)         | 32 px   | Checkbox. Header = checkbox « tout sélectionner ». Padding-left 20 px.                                    |
| 2   | **Laboratoire**       | auto    | `code` en gras (lien vers fiche) + `name` en sous-texte gris 12 px, tronqué à 300 px max.                 |
| 3   | **Tutelles**       | auto    | `inst` (texte simple).                                                                                                                                                                |
| 4   | **Membres**           | auto    | Nombre aligné à droite, gras.                                                                             |
| 5   | **Publications**            | auto    | Nombre aligné à droite, gras. Période = 24 derniers mois.                                                 |
| 6   | **OA**                | ~90 px  | Barre de progression 54×6 px + pourcentage gras 12 px. Couleur = `--sv-green`.                            |
| 7   | **HAL**               | ~90 px  | Barre 54×6 + pourcentage. 

| 8   | **Voir le détail**               | auto    | Lien vers la page de détail du labo     |


