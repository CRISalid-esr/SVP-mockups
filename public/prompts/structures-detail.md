# Page : Détail d'une structure de recherche

**Route :** `/[lang]/research-structures/[uid]`  
**Statut :** implémentée (`src/app/[lang]/research-structures/[uid]/`)

**Composants :** `StructureHero` · `StructureKpis` · `PublicationsChart` (ECharts) · `MembersTable` · `SidebarIdentifiers` · `SidebarAbout` · `SidebarDisciplines` · `SidebarSources` · `SubstructuresTable` · `TabsUnitContent`

## Contexte

Fiche d'une structure, quel que soit son `generic_type` (institution, composante, unit, team). Le contenu s'adapte au type : une institution affiche ses sous-structures, une unité affiche ses membres et équipes. La même route sert tous les types, y compris les nœuds de référence co-tutelle (voir "Multi-tutelles" ci-dessous).

L'utilisateur type est un responsable scientifique, directeur de laboratoire, chargé de mission recherche ou bibliothécaire. Ses besoins :
- prendre la mesure d'une structure en moins de 10 secondes (KPIs, identifiants, tutelles)
- comprendre la dynamique de production (graphique publications × accès ouvert)
- accéder aux membres et aux données rattachées
- naviguer vers les structures parentes ou filles

**Périmètre de la maquette :** EPE Nantes Université — données réelles fictivisées.

---

## Modèle de données disponible

```ts
type ResearchStructure = {
  uid: string
  generic_type: "institution" | "composante" | "unit" | "team"
  national_type: string | null         // "UMR", "UAR", "UR", "UFR", "SCD", "EPE"…
  local_types?: { language: string; value: string }[]
  main_mission: "research" | "scientific_services" | "administrative_services" | "teaching"
  short_labels: { language: string; value: string }[]
  long_labels:  { language: string; value: string }[]
  institutionNames: string[]           // toutes tutelles (y compris hors périmètre ex. CNRS)
  parent_uid: string | null            // tutelle principale dans l'arbre
  secondary_parent_uids: string[]      // co-tutelles dans le périmètre
  membersCount: number
  publicationsCount: number            // 24 derniers mois
  oaRate: number                       // 0–100
  halRate: number                      // 0–100
  rnsr?: string
  descriptions: { language: string; value: string }[]
  slug: string
}
```

Données à ajouter dans le mock pour les types `unit` et `team` :

```ts
// À ajouter sur les unités et équipes :
members: string[]                       // uids de chercheurs
disciplines: { label: string; pct: number }[]   // part de la production par discipline
publicationsByYear: {
  year: number
  open: number      // accès ouvert
  closed: number    // accès fermé
  unknown: number   // type d'accès inconnu
}[]

// À ajouter sur les institutions et composantes :
childUids: string[]                     // uids des structures filles directes (dénormalisé)
```

---

## En-tête (commun à tous les types)

```
┌──────────────────────────────────────────────────────────────────┐
│ ← Structures de recherche                                        │
│                                                                  │
│  LS2N  ⬦UMR                                                     │
│  Laboratoire des Sciences du Numérique de Nantes                 │
│  [Recherche]  RNSR 201521843V                                    │
│                                                                  │
│  Tutelle principale : UFR Sciences — Nantes Université           │
│  Co-tutelles : Centrale Nantes · CNRS                            │
│                                                                  │
│  Breadcrumb : Nantes Université > UFR Sciences > LS2N            │
└──────────────────────────────────────────────────────────────────┘
```

- Acronyme en grand + chip `national_type`
- Nom long localisé
- Chip mission coloré
- RNSR si disponible
- **Tutelle principale** : lien → fiche de la structure parente (`parent_uid`)
- **Co-tutelles** : liste des `secondary_parent_uids` (périmètre) + tutelles hors périmètre issues de `institutionNames` — avec ou sans lien selon qu'elles ont une fiche dans l'appli
- **Breadcrumb** : reconstruit depuis `parent_uid` en remontant récursivement. Le retour vers `/research-structures` restaure l'état de la liste (vue à plat / hiérarchique, filtres actifs, position de scroll) via `history.state` ou `sessionStorage`
- Bouton retour → `/research-structures`

---

## Layout de la page

Pour les types `unit` et `team`, la page utilise une grille 2 colonnes :

```
┌───────────────────────────────────────┐  ┌──────────────────┐
│  KPIs (×4)                            │  │  Identifiants    │
├───────────────────────────────────────┤  ├──────────────────┤
│  Graphique publications × accès       │  │  À propos        │
├───────────────────────────────────────┤  ├──────────────────┤
│  Membres (table aperçu)               │  │  Disciplines     │
│                                       │  ├──────────────────┤
│  [Onglets : Équipes · Publications]   │  │  Sources         │
└───────────────────────────────────────┘  └──────────────────┘
```

Pour les types `institution` et `composante`, le layout est plus simple : liste des sous-structures en colonne principale, À propos en secondaire.

---

## Onglets selon `generic_type`

### `institution` — Nantes Université, Centrale Nantes, ENSA Nantes

**Structures rattachées**
Tableau ou liste hiérarchique des composantes et unités directement filles (`parent_uid = this.uid`), avec liens. Inclut aussi les unités ayant cet uid dans `secondary_parent_uids` (avec badge co-tutelle).

**Publications**
Agrégat des publications des structures filles sur 24 mois, taux OA et HAL. Lien vers la liste des publications filtrée sur cet établissement.

**À propos**
Description, site web, identifiants locaux.

---

### `composante` — UFR Sciences, UFR LLSHS, IAE Nantes, Polytech Nantes

**Unités rattachées**
Tableau des unités filles (`parent_uid = this.uid`) : acronyme, mission, membres, publications, taux OA, lien fiche.

**Membres**
Personnes directement rattachées à la composante (hors unités filles) — si la donnée est disponible.

**À propos**
Description, adresse, site web.

---

### `unit` — LS2N, LMJL, CENS, GeM, LHEEA, CRENAU, LEMNA, BU Nantes…

**Membres**
Liste des personnes : avatar, nom, statut (permanent / doctorant / émérite / BIATSS / …) → lien `/researchers/[uid]`.

**Équipes**
Sous-structures filles de type `team` (`parent_uid = this.uid`) :
- Nom, acronyme, nombre de membres, lien fiche équipe.
- Onglet masqué si aucune équipe.

**Publications**
Stats sur 24 mois : nombre, taux OA, taux HAL. Lien vers liste publications filtrée.

**À propos**
Description, adresse postale, site web, identifiants (RNSR, ROR, locaux). Tutelles avec lien.

---

### `team` — TASC, ALMA (équipes du LS2N)

**Membres**
Liste des membres de l'équipe → lien `/researchers/[uid]`.

**Publications**
Stats de l'équipe sur 24 mois.

**À propos**
Description, responsable d'équipe, appartenance à l'unité parente → lien fiche unité.

---

## KPIs (unités et équipes)

4 indicateurs en grille, chacun avec valeur principale et delta contextuel :

| KPI | Valeur | Delta affiché |
|-----|--------|---------------|
| **Membres** | `membersCount` | `X % permanents` |
| **Publications 24m** | `publicationsCount` | Évolution N vs N-1 (vert si > 0, rouge si < 0) |
| **Accès ouvert** | `oaRate %` | Cible institutionnelle (ex. « cible 60 % ») |
| **Dépôt HAL** | `halRate %` | Variation en points sur 12 mois (ex. `+5 pts`) |

Le clic sur un KPI ouvre la page concernée pré-filtrée (Publications, Chercheurs…).

---

## Graphique « Publications par année et taux d'accès » (unités et équipes)

Barres empilées sur les 5 dernières années (configurable 3–10) :
- **Accès ouvert** (vert `#3FB97A`)
- **Accès fermé** (bleu `#3B79D8`)
- **Type inconnu** (gris `#9AA39E`)

Fonctionnalités :
- Tooltip au survol : année, total par série, taux OA
- Toggle « En valeur » ↔ « En pourcentage » (barres normalisées à 100 %)
- Toggle « Inclure les chapitres » / « Restreindre aux articles »
- Export PNG/CSV des données du graphique

---

## Table « Membres récents » (unités et équipes)

Aperçu des membres les plus actifs (5–8 lignes), triés par publications 24m décroissant.

| Col | Contenu |
|-----|---------|
| Chercheur | Avatar initiales + nom → lien `/researchers/[uid]` |
| Statut | Chip : Pr., MCF, DR, CR, Doctorant, Post-doc, Ingé., ATER |
| Publications 24m | Nombre aligné à droite |
| OA | Barre de progression + pourcentage |
| HAL | Chip avec pourcentage |

Lien « Voir tous les membres → » vers la page Chercheurs filtrée sur cette structure.

Clic sur une ligne → fiche chercheur.

---

## Sidebar — Identifiants (unités et équipes)

Liste verticale des identifiants avec lien vers le référentiel externe (liens `target="_blank"`, `rel="noopener"`) :

| Identifiant | Lien |
|-------------|------|
| RNSR | `https://appliweb.dgri.education.fr/rnsr/{rnsr}` |
| ROR | `https://ror.org/{ror}` + bouton copie |
| Collection HAL | `https://hal.science/{collection}` |
| IdRef | `https://www.idref.fr/{idref}` |
| Wikidata | `https://www.wikidata.org/wiki/{qid}` |
| Scopus ID | Lien vers la fiche affiliation Scopus |

Identifiant absent : afficher « — ».

---

## Sidebar — Disciplines (unités et équipes)

Classement des disciplines/thématiques par part de la production scientifique (source : classification OpenAlex ou taxonomie locale). Barre de progression par ligne, pourcentage à droite. Max 5 affichées.

---

## Sidebar — Couverture des sources (unités et équipes)

Pour chaque source externe (HAL, ScanR, OpenAlex, Crossref, Scopus, Web of Science) : barre de progression + pourcentage.  
Couleur conditionnelle : vert si ≥ 80 %, ambre (`#E8A33D`) si 50–79 %, rouge si < 50 %.  
Au survol : tooltip « N publications référencées sur M attendues ».

---

## Multi-tutelles sur la fiche détail

**Problème :** LS2N a `parent_uid = "comp-ufr-st"` (Nantes Université) et `secondary_parent_uids = ["inst-cn"]` (Centrale Nantes). Comment présenter les tutelles sur la fiche ?

**Choix retenu — tutelle principale + co-tutelles distinctes :**

```
Tutelle principale : UFR Sciences — Nantes Université  →  [lien fiche]
Co-tutelles :        Centrale Nantes  →  [lien fiche]
                     CNRS  (hors périmètre, pas de lien)
```

- La tutelle principale est celle de `parent_uid` (chemin hiérarchique naturel).
- Les co-tutelles dans le périmètre sont celles de `secondary_parent_uids`.
- Les co-tutelles hors périmètre (CNRS) sont issues de `institutionNames` par différence — affichées sans lien cliquable.
- Ce découpage correspond au modèle `main_supervision` / `associated_supervision` prévu dans l'API.

**Alternative écartée — liste plate de tutelles sans distinction :**
Afficher simplement `institutionNames` comme liste de puces. Plus simple, mais perd l'information de hiérarchie (laquelle est la tutelle principale ?) et ne permet pas de créer des liens vers les fiches du périmètre.

---

## Breadcrumb et navigation dans la hiérarchie

Le breadcrumb est reconstruit en remontant récursivement la chaîne `parent_uid` :

```
Nantes Université  >  UFR Sciences  >  LS2N
```

Pour les nœuds de référence (LS2N affiché sous Centrale Nantes dans la vue liste), le clic mène à la même fiche LS2N — le breadcrumb affiche le chemin via la **tutelle principale**, pas via Centrale Nantes. C'est cohérent : la fiche est unique, seule la vue liste a des entrées multiples.

❓ **Alternative** : afficher les deux chemins possibles sur la fiche (via NU et via CN) ? Risque de confusion.

---

## Agrégation des statistiques

**Problème :** les membres et publications d'une institution (ex. Nantes Université) doivent-ils inclure récursivement ceux de toutes ses sous-structures (composantes + unités + équipes) ?

**Options :**

| Option | Avantage | Inconvénient |
|--------|----------|--------------|
| **Récursive** (toute la sous-arbre) | Chiffre représentatif de l'établissement | Double comptage si une personne appartient à plusieurs équipes |
| **Niveau direct seulement** | Simple, sans double comptage | Sous-estime fortement l'activité d'une institution |
| **Dénormalisé en base** | Performant, contrôlé | Nécessite une tâche de calcul périodique |

La maquette utilise des chiffres saisis manuellement pour chaque nœud. En production, la solution dénormalisée (champs précalculés, mis à jour par batch) est recommandée pour les institutions et composantes, les unités et équipes étant agrégées à la volée.

---

## États

| État | Comportement |
|------|-------------|
| Chargement initial | Skeletons sur le hero, les KPIs, le graphique et les cartes sidebar |
| Structure introuvable (404) | Message « Cette structure n'existe pas ou plus » + bouton « Retour à la liste » |
| Identifiant absent | Afficher « — » |
| Aucune publication sur la période | Message inline dans le graphique |
| Erreur sur une section | Bandeau d'erreur localisé à la section + bouton « Réessayer » ; le reste de la page reste fonctionnel |

---

## Responsive

- ≥ 1280 px : grille 2 colonnes (colonne principale + 320 px)
- 960–1279 px : la colonne secondaire passe sous la colonne principale, en deux colonnes (Identifiants + Disciplines | À propos + Sources)
- < 960 px : tout en une colonne, KPIs en 2×2
- < 720 px : les chips du hero wrappent, les boutons d'action passent sous le titre

---

## Accessibilité

- H1 unique sur la page (nom complet de la structure).
- Chips et boutons icône : `aria-label` explicite.
- Liens externes (ROR, Wikidata, RNSR…) : `aria-label` complet (ex. « Ouvrir la fiche ROR dans un nouvel onglet »).
- Barres de progression : `role="progressbar"`, `aria-valuenow`, `aria-valuemin=0`, `aria-valuemax=100`, `aria-label` explicite.
- Graphique barres empilées : `role="img"` + `aria-label` résumant les données ; tableau de données équivalent caché en `sr-only`.
- Tableau membres : `<th scope="col">`, navigation clavier complète.
- Focus visibles partout ; contraste AA respecté sur les chips et pourcentages.

---

## Navigation

- Breadcrumb → fiche de chaque ancêtre via `parent_uid`
- Tutelle principale / co-tutelles → `/research-structures/[uid]`
- Membre → `/researchers/[uid]`
- Retour → `/research-structures`

---

## Questions ouvertes

❓ **Co-tutelles hors périmètre (CNRS)** : afficher une ligne de texte seule, ou renvoyer vers une fiche "structure externe" simplifiée (nom, type, site web) ?

❓ **Onglet Publications sur les composantes** : les composantes ont-elles des publications propres, ou faut-il agréger celles de leurs unités filles ?

❓ **Structures sans membres connus** : faut-il masquer l'onglet Membres ou afficher un message "données non disponibles" ?

❓ **Historique des tutelles** : une UMR peut changer de tutelle principale. Faut-il afficher un historique (ex. "rattachée à X depuis 2021, avant à Y") ?

❓ **Accès à la fiche depuis un nœud de référence** : le clic sur ↗ LS2N (sous Centrale Nantes) mène à la fiche LS2N. Faut-il indiquer sur la fiche que l'utilisateur y a accédé via Centrale Nantes, ou la fiche est-elle toujours identique quel que soit le chemin d'entrée ?

❓ **Nœud de référence — afficher les chiffres ?** Faut-il afficher membres/publications sur le nœud de référence dans la vue liste (risque de double comptage apparent) ou les masquer avec `—` ?
