# Tableau de bord — Descriptif fonctionnel et technique

> Destiné aux développeurs reprenant la maquette. Décrit chaque écran du tableau de
> bord, les graphiques utilisés et leur source de données. État courant.

## Vue générale

- **Emplacement** : `src/app/[lang]/dashboard/`
- **Stack** : Next.js 15 (App Router) · Material-UI v6 · **ECharts** (`echarts` + `echarts-for-react`) · Lingui (i18n)
- **Données** : jeu de démonstration **statique et anonymisé** chargé depuis `src/mocks/data/` (aucun appel réseau). Voir [Modèle de données](#modèle-de-données).
- La page est entièrement **client-side** (`'use client'`). Chaque graphique construit une `EChartsOption` typée et la rend via le wrapper commun **`EChart`** (`charts/EChart.tsx`), qui encapsule `echarts-for-react` et ajoute la barre d'outils + le partage iframe (voir [Barre d'outils & intégration](#barre-doutils--intégration-iframe)).

### Arborescence

```
src/app/[lang]/
├── dashboard/
│   ├── page.tsx                      # Shell : en-tête + switcher de perspective + provider + onglets
│   └── components/
│       ├── DashboardViewContext.tsx  # Contexte de perspective (chercheur / labo) + données filtrées
│       ├── DashboardTabs.tsx         # Barre d'onglets + routage de l'onglet actif
│       ├── tabs/                     # Un composant par écran (onglet)
│       │   ├── OverviewTab.tsx
│       │   ├── InternationalTab.tsx
│       │   ├── ImpactTab.tsx
│       │   ├── TeamsTab.tsx
│       │   ├── ResearchersTab.tsx
│       │   ├── PhdTab.tsx
│       │   ├── ApcTab.tsx
│       │   └── BooksTab.tsx
│       └── charts/                   # Composants graphiques + fonctions d'agrégation
│           ├── EChart.tsx            # Wrapper commun : toolbox (PNG/données/reset/plein écran/partage)
│           ├── embedRegistry.tsx     # chartId → composant autonome (page d'intégration)
│           ├── *Chart.tsx            # Graphiques réutilisables (rendus via EChart)
│           ├── overviewAggregates.ts · internationalAggregates.ts
│           ├── impactAggregates.ts · structureAggregates.ts
│           ├── networkAggregates.ts · booksAggregates.ts
│           ├── KpiCard.tsx · DashboardSectionCard.tsx
│           ├── LabTabHeader.tsx · YearRangeSelector.tsx
│           └── overviewLabels.ts
└── embed/
    └── page.tsx                      # Page d'intégration iframe (1 graphique, sans menu latéral)
```

### Conventions communes

- **`YearRangeSelector`** : deux `Select` (année début / fin) ; chaque onglet possède son propre filtre d'années, initialisé sur l'amplitude du jeu de données et recadré quand la perspective change.
- **`DashboardSectionCard`** / `LabTabHeader` : titres de section et en-tête d'onglet (titre + légende + sélecteur d'années).
- **`KpiCard` / `KpiCardGrid`** : cartes de chiffres-clés.
- Les libellés d'interface passent par Lingui (clés `dashboard_*`). Les **valeurs de données** (langues, statuts OA, types) sont affichées telles quelles via `overviewLabels.ts`.

---

## Switcher de perspective

Dans l'en-tête, à droite du titre `Tableau de bord : {nom}`, un `ToggleButtonGroup` bascule entre deux perspectives (état dans `page.tsx`, données dans `DashboardViewContext`) :

| Perspective | Périmètre de données | Titre | Onglets visibles |
|---|---|---|---|
| **Chercheur** (défaut) | Publications du chercheur sélectionné (profil de démo) | Nom de la perspective connectée | Vue d'ensemble · Collaborations internationales · Impact & citations · Suivi des APC · Chapitres & monographies |
| **Laboratoire** | Toutes les publications du jeu | Nom du laboratoire | Les 9 onglets |

- `useDashboardData()` fournit `{ view, isResearcher, publications, authors }`. **Tous les onglets lisent leurs données via ce hook** (pas d'accès direct au service mock).
- En vue chercheur, le périmètre est filtré sur l'auteur interne le plus prolifique du jeu (profil représentatif).
- En vue chercheur, certains graphiques propres au laboratoire sont masqués (Sankey, Sunburst — voir onglet International).

---

## Barre d'outils & intégration (iframe)

Tous les graphiques sont rendus via le wrapper **`charts/EChart.tsx`** (qui remplace
l'usage direct de `ReactEcharts`). La barre d'outils est rendue en **HTML (MUI `IconButton`)**,
et non dans le canvas ECharts, pour ne pas empiéter sur le graphique : elle est positionnée
en **absolu en haut à droite** et s'ancre sur la `CustomCard` (passée en `position: relative`),
donc elle apparaît dans le **bandeau de titre** de la carte.

| Outil | Icône | Effet |
|---|---|---|
| Télécharger (PNG) | `Download` | `instance.getDataURL({ pixelRatio: 2, backgroundColor: '#fff' })` → `<a download>` ; nom de fichier = `chartId`/`exportName` |
| Réinitialiser | `RestartAlt` | `instance.dispatchAction({ type: 'restore' })` |
| Plein écran | `Fullscreen`/`FullscreenExit` | API Fullscreen sur le conteneur + `resize()` |
| Partager / Intégrer | `Share` | ouvre le dialogue d'intégration |

> L'ancrage repose sur le fait qu'aucun élément entre `EChart` et la `Card` n'est positionné
> (le conteneur `EChart` reste `static` hors plein écran). En **plein écran**, le conteneur
> passe en `position: relative` et la barre d'outils s'ancre alors sur le graphique lui-même.

### Identité des graphiques (`chartId`)

Le partage nécessite un **identifiant unique par instance**. Comme certains composants sont
réutilisés dans plusieurs onglets avec des données différentes (`DonutChart`,
`StackedAreaChart`, `RankBarChart`, `PublicationTypesChart`), ils acceptent une prop
**`chartId?`** transmise à `EChart` ; les onglets passent des identifiants distincts
(`equipes-repartition` vs `doctorants-repartition`, `ouvrages-types`, `top-chercheurs`
vs `doctorants-classement`…). Les composants à usage unique utilisent leur `exportName`
comme identifiant par défaut. `EChart` retient `shareId = chartId ?? exportName`.

### Dialogue de partage

Ouvert via le bouton 🔗, il propose : un **sélecteur de perspective** (défaut **Laboratoire**,
jeu le plus complet), le **lien direct** et le **code `<iframe>`**, chacun copiable. L'URL est
construite par `EChart` en remplaçant `/dashboard/` par `/embed/` dans le chemin courant :

```
…/{lang}/embed/?chart={chartId}&perspective={lab|researcher}
```

### Page d'intégration — `src/app/[lang]/embed/page.tsx`

Volontairement **hors de `dashboard/`** : elle n'hérite donc pas de `MainLayout` (pas de menu
latéral), seulement du thème / i18n de `[lang]/layout.tsx`. Elle lit `?chart=&perspective=`
via `useSearchParams` (sous **`<Suspense>`**, requis par l'export statique), puis rend le
graphique seul dans `DashboardDataProvider view={perspective}` + `EmbedModeContext=true`
(ce dernier masque le bouton « Partager » pour éviter une intégration récursive).

Le **registre `charts/embedRegistry.tsx`** mappe chaque `chartId` → un petit composant qui
**recalcule** les données du graphique (`useDashboardData()` + l'agrégat correspondant,
plage d'années = bornes pleines du périmètre). ~30 graphiques sont enregistrés ; un `chartId`
inconnu affiche « Graphique introuvable ». **Tout nouveau graphique partageable doit être
ajouté à `EMBED_CHARTS`** avec la même clé que son `chartId`/`exportName`.

---

## Écrans (onglets)

### 1. Vue d'ensemble — `tabs/OverviewTab.tsx`
Agrégats : `aggregateOverview` (`overviewAggregates.ts`) + `aggregateNetwork` (`networkAggregates.ts`).

| Bloc | Composant | Type ECharts | Données |
|---|---|---|---|
| Chiffres-clés | `OverviewKpiCards` | cartes MUI (icône + accent) | total, collaborations internationales, langue étrangère, APC (nb + coût €), publications en français |
| Évolution annuelle | `YearlyEvolutionChart` | barres | nb publications / année |
| Répartition par langue | `LanguagePieChart` | donut (`pie`) | langue |
| Types de publication | `PublicationTypesChart` | barres horizontales | type de publication |
| Accès ouvert | `OpenAccessPieChart` | donut | statut OA (couleurs alignées sur `OAStatusProperties` : gold/green/hybrid/bronze/diamond/closed/unknown) |
| Réseau de co-signatures | `NetworkChart` | graphe `force` | nœuds = auteurs internes (taille ∝ nb publications, couleur = équipe), arêtes = co-publications |

> **Réseau** (déplacé de l'ancien onglet dédié vers la vue d'ensemble) : curseur
> **« publications min. par auteur »** pour filtrer la densité. En **vue chercheur**, c'est
> un **ego-réseau** centré sur le chercheur (`centerId = researcherId`, seuil 1, nœud central
> mis en valeur) ; en **vue laboratoire**, le réseau global (seuil 2). Plage d'années partagée
> avec le reste de l'onglet.

### 2. Collaborations internationales — `tabs/InternationalTab.tsx`
Agrégats : `aggregateInternational`, `aggregateFlows`, `aggregateFlowMap` (`internationalAggregates.ts`). La France est exclue des décomptes de pays partenaires.

| Bloc | Composant | Type ECharts | Données |
|---|---|---|---|
| Internationales vs nationales | `IntlVsNationalChart` | barres empilées | `isInternational` / année |
| % collaborations internationales | `IntlPercentChart` | courbe (0–100) | part annuelle |
| Carte choroplèthe | `WorldChoroplethChart` | `map` (fond `world.json`) | nb publications par pays partenaire |
| Top 20 pays co-auteurs | `TopCountriesChart` | barres H (dégradé `visualMap`) | `countries` |
| Collaborations UE / hors-UE | `EuZoneChart` | donut | zone UE/hors-UE (table `countryNames`) |
| Évolution UE / hors-UE | `EuByYearChart` | aires empilées | zone × année |
| Collaborations par pays et année | `CountryHeatmapChart` | heatmap | top 15 pays × années |
| Top 20 organismes partenaires étrangers | `TopPartnersChart` | barres H | `partnerInstitutions` (pays ≠ FR) |
| Flux équipe → pays → organisme *(labo uniquement)* | `SankeyChart` | sankey | `teams` × `partnerInstitutions` |
| Répartition équipe / pays / organisme *(labo uniquement)* | `SunburstChart` | sunburst | idem, hiérarchie |
| Carte des collaborations | `FlowMapChart` | `geo` + `lines`/`effectScatter` | arcs labo → villes partenaires (`city/lat/lon`) |

> **Cartes** : `WorldChoroplethChart` et `FlowMapChart` enregistrent le fond monde via
> `echarts.registerMap('world', …)` après `fetch(publicPath('/vendor/world.json'))`. Le
> mapping ISO2 → nom (FR + nom de la feature GeoJSON) est dans `countryNames.json`.
> Utiliser **`publicPath()`** (basePath) pour tout chargement d'asset.

### 3. Impact & citations — `tabs/ImpactTab.tsx`
Agrégat : `aggregateImpact` (`impactAggregates.ts`).

| Bloc | Composant | Type ECharts | Données |
|---|---|---|---|
| Chiffres-clés | `ImpactKpiCards` | cartes MUI | % FWCI renseigné, Top 10 %, Top 1 %, FWCI moyen |
| Quartiles Scimago (SJR) | `QuartileChart` | barres Q1–Q4 (couleurs dédiées) | `sjrQuartile` |
| Publications très citées par année | `TopByYearChart` | barres empilées | Top 1 % et Top 10 % (hors Top 1 %) / année |
| Distribution du FWCI | `FwciHistogramChart` | histogramme + `markLine` à 1.0 | `fwci` (longue traîne repliée au-delà de 8) |

### 4. Répartition par équipe — `tabs/TeamsTab.tsx` *(labo uniquement)*
Agrégats : `aggregateTeams`, `aggregateTeamRadar` (`structureAggregates.ts`). Une publication compte dans **chacune** des équipes de ses auteurs.

| Bloc | Composant | Type ECharts | Données |
|---|---|---|---|
| Répartition par équipe | `DonutChart` | donut | publications / équipe |
| Évolution annuelle par équipe | `StackedAreaChart` | aires empilées | équipe × année |
| Types de publication par équipe | `StackedBarHChart` | barres empilées H | type × équipe |
| Profil disciplinaire | `RadarChart` | radar | part (%) des top sous-domaines (`subfields`) par équipe |

### 5. Par chercheur — `tabs/ResearchersTab.tsx` *(labo uniquement)*
Agrégat : `aggregateResearchers`. `RankBarChart` (barres H) — top 25 auteurs internes par nombre de publications.

### 6. Doctorants — `tabs/PhdTab.tsx` *(labo uniquement)*
Agrégat : `aggregatePhd`. Publications « impliquant au moins un doctorant ».

| Bloc | Composant | Type ECharts |
|---|---|---|
| Publications de doctorants par équipe | `DonutChart` | donut |
| Évolution annuelle | `StackedAreaChart` | aires empilées |
| Publications par doctorant | `RankBarChart` | barres H |

### 7. Suivi des APC — `tabs/ApcTab.tsx`
Agrégat : `aggregateOverview` (champ `apcByYear`). En-tête `LabTabHeader` (plage d'années) + `ApcYearlyChart` (barres + étiquette nb) : montant des frais de publication (APC) par année. Onglet visible dans les deux perspectives. *(Le réseau de co-signatures, anciennement dans un onglet dédié, a été déplacé dans la Vue d'ensemble — voir §1.)*

### 8. Chapitres & monographies — `tabs/BooksTab.tsx`
Agrégat : `aggregateBooks` (`booksAggregates.ts`). Filtre les types « ouvrage » (chapitre, monographie, direction/coordination).

| Bloc | Composant | Type ECharts |
|---|---|---|
| Types d'ouvrage | `PublicationTypesChart` | barres H |
| Évolution annuelle par type | `BooksByYearChart` | barres empilées |

### 9. Axes stratégiques — *placeholder*
Onglet « À venir » (`ComingSoon` dans `DashboardTabs.tsx`) : le jeu de démonstration ne fournit pas de classification par axe stratégique exploitable.

---

## Modèle de données

Service : `src/mocks/dashboardMockService.ts` → `getPublications()`, `getAuthors()`, `getCountryNames()`, `getLab()`.

### `src/mocks/data/dashboard-publications.json`
`{ lab, slug, publications: Publication[], authors: Author[] }`

**`Publication`** (type `DashboardPublication`) :

| Champ | Type | Usage |
|---|---|---|
| `year` | number\|null | toutes les évolutions temporelles |
| `language` / `isForeignLanguage` | string / bool | langues |
| `pubType` | string\|null | types de publication, ouvrages |
| `oaStatus` / `oaColor` | string\|null | accès ouvert |
| `isInternational` | bool\|null | intl vs national (null = inconnu) |
| `hasApc` / `apcAmount` / `apcCurrency` | bool / number / string | APC |
| `journal` | string\|null | — |
| `countries` | string[] | codes ISO2 des pays co-auteurs |
| `subfields` | string[] | sous-domaines (radar disciplinaire) |
| `partnerInstitutions` | `{ name, cc, city, lat, lon }[]` | organismes partenaires (top partenaires, Sankey/Sunburst, carte de flux) |
| `sjrQuartile` | string\|null | quartile Scimago (Q1–Q4) |
| `fwci` / `citedByCount` | number\|null / number | impact |
| `isTop10Percent` / `isTop1Percent` | bool\|null | publications très citées |
| `teams` | string[] | équipes de la publication (dérivées des auteurs) |
| `authorIds` | number[] | renvoie vers `authors[].id` (réseau, par chercheur, doctorants) |
| `hasPhd` | bool | implique au moins un doctorant |

**`Author`** (type `AuthorMeta`) : `{ id, label, teams, isPhd }` — auteurs internes **pseudonymisés** (`label` = « Chercheur N »).

### Anonymisation
Le jeu est anonymisé pour un déploiement public : **aucun nom d'auteur réel**, les auteurs internes sont pseudonymisés (« Chercheur N », identifiants stables) et les libellés d'équipe sont neutralisés (« Équipe 1/2/3 », ou « Non identifié » si non rattaché).

### Autres fichiers
- `src/mocks/data/countryNames.json` : `ISO2 → { fr, echarts, eu }` (libellé FR, nom de la feature `world.json`, appartenance UE).
- `public/vendor/world.json` : fond de carte monde (GeoJSON) pour les cartes ECharts.
- Régénération du jeu : scripts hors-ligne sous `tools/` (Python + pandas).

---

## Points d'attention

- **Cartes** : ne pas oublier `publicPath()` pour `world.json` (le `basePath` n'est appliqué qu'au build de production ; en `next dev` les assets sont servis à la racine).
- **Apostrophes JSX** : toujours via `{`…l'…`}` ou Lingui, jamais d'apostrophe nue.
- **ECharts** : rendre tout graphique via le wrapper **`EChart`** (jamais `ReactEcharts` en direct) pour bénéficier de la barre d'outils et du partage. `notMerge` + `lazyUpdate` sont appliqués par défaut ; pour les callbacks de tooltip dont le type est une union, caster via `as unknown as { … }`.
- **Partage iframe** : un nouveau graphique partageable doit (1) recevoir un `chartId` unique si son composant est réutilisé, et (2) être enregistré dans `embedRegistry.tsx` sous la même clé.
- Toute nouvelle clé i18n doit être ajoutée aux catalogues puis recompilée (`npm run i18n:extract` / `i18n:compile`).
