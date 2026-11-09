# CLAUDE.md — SVP-mockups

## Contexte du projet

Maquette interactive du projet **SoVisu+** déployée sur GitHub Pages pour permettre aux utilisateurs du consortium CRISalid de tester les nouvelles fonctionnalités avant qu'elles soient développées en production.

**Dépôt cible :** https://github.com/CRISalid-esr/SVP-mockups  
**Site déployé :** https://crisalid-esr.github.io/SVP-mockups/  
**Dossier local :** `C:\Users\godet-g\Documents\GitHub\maquettes\SoVisuPlus`

---

## Deux dépôts à ne pas confondre

| Dossier local | Remote GitHub | Site déployé | Usage |
|---|---|---|---|
| `maquettes/SoVisuPlus/` | `CRISalid-esr/SVP-mockups` | `crisalid-esr.github.io/SVP-mockups/` | **Travail en cours** |
| `maquettes/SVP/` | `guillaumegodet/SVP` | `guillaumegodet.github.io/SVP/` | Ancien mockup Figma/Vite — ne pas toucher |

---

## Comment pousser

La branche locale s'appelle `master` mais le remote attend `main` :

```bash
git push origin HEAD:main
```

---

## Architecture technique

**Stack :** Next.js 15 App Router · Material-UI v6 · Lingui i18n · Zustand · Material React Table

**Configuration statique (`next.config.ts`) :**
```ts
output: 'export'
basePath: '/SVP-mockups'
trailingSlash: true
images: { unoptimized: true }
```

**CI/CD (`.github/workflows/deploy.yml`) :**
- Build avec `NEXT_PUBLIC_USE_MOCK=true`
- Supprime `src/app/api`, `src/app/user`, `src/app/[lang]/[...rest]` avant le build (incompatibles avec static export)
- Déploie `./out` sur la branche `gh-pages` via `peaceiris/actions-gh-pages@v4`

---

## Règle critique : publicPath()

`next/image` avec `unoptimized: true` **n'applique pas `basePath` automatiquement**. Toute image référencée par une chaîne de caractères (dans `next/image`, MUI `Avatar`, `<img>`, ou dans des objets de config) doit passer par :

```ts
import { publicPath } from '@/utils/publicPath'
// src/app/utils/publicPath.ts → `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`

publicPath('/icons/hal.png')  // → '/SVP-mockups/icons/hal.png' en prod
```

**Fichiers déjà corrigés :** `BibliographicPlatform.ts`, `PersonIdentifier.ts`, `Vocabs.ts`, `Sidebar.tsx`, `DocumentRecord.ts`, `BibliographicInformation/Sources.tsx`, `documents/page.tsx`, `Sources/Sources.tsx`, `KeywordSearchAutocomplete.tsx`, `DocumentSyncDialog.tsx`, `HalLoginButton.tsx`, `OrcidLoginButton.tsx`, `LanguageSwitcher.tsx`, `setup/page.tsx`, `configs/default/logos.ts`, `configs/custom/logos.ts`

---

## Données mock

**Fichiers :** `src/mocks/data/` (documents.json, persons.json, structures.json, concepts.json)  
**Service :** `src/mocks/mockService.ts`  
**Activation :** `NEXT_PUBLIC_USE_MOCK=true` dans le workflow CI

Les stores Zustand (`documentSlice`, `personSlice`, `researchStructureSlice`, `userSlice`) vérifient `process.env.NEXT_PUBLIC_USE_MOCK` et appellent `mockService` au lieu des API routes.

**doc-1 a 4 auteurs** (pour démo de l'onglet Auteurs) :
- Jean Dupont (rang 1) — IdHAL confirmé + ORCID + affiliation LS2N + **2 rôles** (`author`, `editor`)
- Sophie Martin (rang 2) — **ORCID** (→ "Auteur identifié") mais sans IdHAL, 3 candidats HAL, 1 affiliation non trouvée avec candidats structures
- Pierre Bernard (rang 3) — aucun identifiant (→ "Auteur non identifié"), sans candidats, sans affiliation, rôle par défaut
- Anne Leclerc (rang 4) — IdHAL confirmé + affiliation EHESS

---

## Fonctionnalités implémentées

### ✅ Onglet Auteurs (`documents/[uid]/components/Authors/Authors.tsx`)
Interface complète d'identification des auteurs et affiliations dans HAL :
- Bannière d'état : "Retrouvez les auteurs et les affiliations HAL manquants"
- Barre de progression alignés/total
- Bouton "Aligner toutes les meilleures correspondances" (auto-confirme les candidats ≥ 85%)
- Layout 2 colonnes : info auteur (gauche) + affiliations (droite)
- Statut auteur : "Auteur identifié" (vert) ou "Auteur non identifié" (orange)
- Panneau candidats HAL avec avatars colorés, score de correspondance, bouton Confirmer
- Affiliations alignées (chip ROR) ou manquantes (texte importé + candidats structures)
- "Ajouter une affiliation HAL" en accordéon
- **Rôles multivalués** : `AuthorState.roles: string[]` — sélecteur `<Select multiple>` avec rendu en chips ; rôle par défaut "Contributeur" si aucun rôle en source (bordure orange + avertissement)
- **Statut "Auteur identifié"** : basé sur `orcid || idref || idhal` (pas Scopus). Le panneau de recherche IdHAL s'affiche quand `!idhal`, en style neutre si déjà identifié via ORCID/IdRef, en orange sinon.
- **Rangs — sauvegarde** : si le toggle "Rangs définis" est désactivé à la sauvegarde, les rangs sont supprimés (`rank: undefined` sur toutes les contributions). Le toggle s'initialise sur `contributions.some(c => c.rank != null)`.
- Bannière "Modifications non enregistrées" discrète (liseré gauche, texte gris, boutons texte)
- Barre du bas : Ajouter un auteur | Annuler | Enregistrer

**Vocabulaire à maintenir (simplifié pour les utilisateurs non-experts) :**
- ❌ "AureHAL", "alignement", "IdHAL obligatoire"
- ✅ "HAL", "Auteur identifié", "Auteur non identifié", "Retrouvez les auteurs manquants"

---

### ✅ Dépôt dans HAL (`src/app/[lang]/documents/[uid]/components/HalDeposit/HalDeposit.tsx`)

Onglet "Déposer dans HAL" dans la fiche document, visible uniquement si la publication n'est pas encore dans HAL.

**Flux en 3 étapes :** formulaire → récapitulatif → upload animé → état de dépôt

**Formulaire :** type de document, domaines HAL, langue, date, licence, champs contextuels (revue / congrès / institution / thèse), fichier PDF principal obligatoire + fichiers complémentaires optionnels. Titre, résumé et auteurs sont injectés en lecture seule depuis les autres onglets.

**Validation :** type + domaines + fichier PDF obligatoires ; champs supplémentaires selon le type (revue pour ART, congrès pour COMM/POSTER/PRESCONF, etc.).

**États de dépôt (persistés en localStorage par UID de document — clé `hal-deposit-status-{uid}`) :**

| État | Déclencheur | Couleur | Ce qu'on affiche |
|---|---|---|---|
| `moderation` | Upload avec fichier PDF | Amber | Identifiant HAL temporaire cliquable, date de soumission, délai estimé |
| `accepted` | Upload sans fichier (notice) ou simulation | Vert | Lien `hal.science/hal-XXXXXXX` |
| `rejected` | Simulation | Rouge | Motif du rejet + bouton "Déposer à nouveau" |
| `changes_requested` | Simulation | Orange | Commentaire du modérateur + bouton "Modifier et déposer à nouveau" |

"Déposer à nouveau" / "Modifier et déposer à nouveau" efface le statut localStorage et remet le formulaire vierge.

**Zone démo :** chaque écran de statut affiche une ligne de boutons discrets (ligne pointillée) pour basculer entre les 4 états sans re-soumettre + bouton "Réinitialiser".

**Badge dans la liste des documents (`HalStatusCellBadge`) :** quand `step === 'moderation'`, la colonne HAL affiche un chip amber `color="warning"` + icône `HourglassEmpty` ("En cours de modération") à la place du rouge "Hors HAL". `HalStatusCell` lit le localStorage au montage via `useEffect`.

**Descriptif complet :** `public/prompts/hal-deposit.md`

---

### ✅ Compléter dans HAL (`src/app/[lang]/documents/[uid]/components/HalUpdate/`)

Onglet `hal_update`, à la place de « Déposer dans HAL » quand la publication a une notice HAL. L'utilisateur coche ce que HAL n'a pas, et seuls ces éléments sont envoyés (simulé).

**Décisions (nov. 2026) :** ajouts uniquement, les différences (« À vérifier ») sont visibles sans être envoyables · un·e documentaliste peut agir pour le propriétaire · fichiers hors parcours (renvoi vers HAL).

**Parcours :** comparaison → vérification → envoi → « Envoyé, en attente de mise à jour » → comparaison actualisée. Non propriétaire : demande de partage de propriété (en attente / acceptée / refusée). Dépôt modifié entre-temps : rien n'est envoyé, nouvelle comparaison. « Ne plus proposer » est mémorisé. Zone « Simuler » pour changer de situation.

**Données :** `halUpdateMock.ts` (propositions écrites à la main, `doc-1` propriétaire et `doc-6` non propriétaire) · état en localStorage `hal-update-state-{uid}` · `documents.json` : sources Scopus/OpenAlex et mots-clés ajoutés sur ces deux documents, date HAL de `doc-1` différente pour la démo. « Enregistrer » dans l'onglet Auteurs précise que HAL n'a pas été modifié et mène à cet onglet. Pas de « ? » : pas encore de page d'aide. Tests : `HalUpdate.test.tsx`.

**Questions au CCSD et descriptif complet :** `public/prompts/hal-update.md`

---

### ✅ Onglet Domaines (`src/app/[lang]/documents/[uid]/components/Domains/`)

Classification OpenAlex sur 4 niveaux (OpenAlex en lecture seule ; propositions à valider ou écarter ; saisie au niveau du sujet) et domaines HAL (moissonnés en lecture seule ; attribués, repris au dépôt pour une publication hors HAL). Zone « Simuler » : droits, document figé, panne de génération.

**Données :** `domainsMock.ts` (échantillon réel de la classification, traductions et scores de maquette, un scénario par document de `doc-1` à `doc-6`) · état en localStorage `document-domains-v1-{uid}` · `halDomains.ts` partagé avec `HalDeposit.tsx`, pré-rempli via `getDepositDomains()`. `documents.json` : notice OpenAlex ajoutée à `doc-1`, résumé retiré de `doc-4` (cas du titre seul). Vocabulaire à l'écran : pas de « taxi », dire « Proposé » et « Générer ». Pas de « ? » : pas encore de page d'aide. Tests : `Domains.test.tsx`.

**Descriptif et questions ouvertes :** `public/prompts/domaines.md`

---

### ✅ Expertises (`src/app/[lang]/expertise/`)
**Réorganisation septembre 2026 — Liste = surface unique, Carte = vue avancée :**
- Onglet **Thèmes de recherche** : toggle **Liste (défaut) / Relations (avancé)**. La vue Liste (`FlatView`) est l'unique point d'entrée du parcours (scope publications, prompt IA, thèmes, caractéristiques) ; la vue Relations (`MindMapView`) sert uniquement à dessiner des liens entre thèmes existants — elle ne propose plus de génération.
- Onglet **Expertises** : les fiches par public (ex-"Fiches publics"), chip "générées depuis vos thèmes"
- **Stepper de parcours** sous les onglets : ① Définir mes thèmes → ② Générer mes expertises → ③ Publier (compteurs + coches, cliquable)
- Vue agrégée labo quand la perspective est une structure (voir Sélecteur de perspective)

**Architecture (Option A) :** le graphe reste la source de vérité. Vue liste et fiches expertises sont des projections des nœuds. Vocabulaire : "thème de recherche" (saisie) vs "expertise" (fiche par public) — ne plus dire "domaine".

**Parcours de génération :** `GenerationPanel.tsx` (composant partagé) — bloc publications + bloc prompt IA affichés ensemble, sans étape intermédiaire. Rendu dans `FlatView` : en `variant="empty"` (carte centrée) quand `entries.length === 0`, en `variant="inline"` (dans un `Accordion` replié "Ajuster le périmètre ou régénérer des thèmes") une fois des thèmes définis. Après génération : bannière verte de revue dans `FlatView` (prop `onThemesGenerated` remontée jusqu'à `page.tsx`) → encart "Étape suivante" → onglet Expertises → bouton **"Générer les fiches"** (actif, `mockCardsLlm.ts`, 1,6 s) : une fiche par public et par thème manquant, statut À valider, bascule sur le sous-onglet "À valider" + barre "Tout valider" + action "Valider cette fiche" dans le menu ⋮ des cartes.

**Vue Laboratoire (`components/Lab/`) :** lecture seule, données mock `labMock.ts` (18 membres, 3 équipes, 14 fiches). KPI (complétude 15/18…), treemap ECharts des thèmes agrégés (clic → dialog membres, filtre par équipe), annuaire des fiches (recherche + filtres par public, clic → dialog détail). Regroupement des thèmes par vocabulaire contrôlé (RAMEAU/Wikidata).

**Isolation par perspective :**
- Helpers partagés dans `expertise/storage.ts` : `getPerspective()`, `loadStoredGraph()`/`saveStoredGraph()`, `loadSelectedPublications()`, `loadHistory()`/`appendHistoryEntry()`, clés `CARDS_KEY`, `FAMILIES_KEY`
- Clés localStorage suffixées par `?perspective=` : `expertise-graph-v2-{p}`, `expertise-selected-publications-{p}`, `expertise-history-{p}` ; fiches et familles non suffixées (`expertise-cards-v1`, `expertise-families-v1`). En pratique, le graphe éditable est celui de `default` : les autres personnes s'affichent en lecture seule (`ConsultationView`)
- Un profil sans graphe enregistré voit l'empty state (fallback `EMPTY_GRAPH` ; `INITIAL_GRAPH` réservé à la perspective `default`)
- L'historique (`appendHistoryEntry`) est mutualisé : alimenté aussi bien par une génération IA depuis `FlatView` que par un Enregistrer manuel depuis `MindMapView`. `HistoryDialog` reste donc cohérent quelle que soit la vue d'origine.

**Flux de premier accès et mise à jour — unifiés dans `GenerationPanel.tsx` :**
- Bloc publications : badge du nombre sélectionné (lu via `loadSelectedPublications()`), bouton "Sélectionner des publications →" (navigue vers `/documents?perspective=…`), bouton "Générer mes thèmes de recherche" / "Recalculer à partir des publications" selon que des thèmes existent déjà
- Séparateur "ou" + bloc prompt IA (textarea + chips d'exemples de profils en `variant="empty"`) → "Générer le graphe"
- Les deux blocs sont toujours affichés ensemble (plus de bascule "ou → décrire manuellement")
- La colonne "Expertises" dans la liste des publications (icône `Psychology` toggleable, teal = incluse) persiste en localStorage par perspective

**Versionnement du graphe :**
- Max 10 snapshots dans `expertise-history-{perspective}` ; sauvegarde automatique à chaque Enregistrer / Générer
- Bouton `History` (icône) dans le Panel top-right → `HistoryDialog.tsx` : chronologie, chips nœuds/liens/version, bouton Restaurer

**Un seul type de nœud : `expertise` (teal)**

**Relations — modèle atelier-first :**
- Direction : `forward` (A→B) · `backward` (A←B) · `bidirectional` (A↔B)
- Label texte libre ; pointillés gris si absent

**Caractéristiques par nœud (saisie inline dans le panneau, chips supprimables) :**
- `temporal` — **Slider MUI** (0–2030, double poignée, stocke `yearFrom`/`yearTo`) OU **Autocomplete** de ~40 périodes nommées (Révolution française, Moyen Âge, etc.)
- `geographic` — Autocomplete GeoNames mock (~70 lieux) ; chips cliquables → dialog carte Google Maps + liens OpenStreetMap/GeoNames
- `persons` / `organizations` — Autocomplete IdRef mock (25 personnes, 20 organismes) ; chips avec PPN → lien `https://www.idref.fr/{ppn}`
- `concepts` — texte libre + vocabulaire contrôlé optionnel (RAMEAU, MeSH, Wikidata, JEL, AMS, MSC, LCSH, libre)

**Fichiers clés :**
- `types.ts` — `ExpertiseNodeData`, `HistoryEntry`, `TemporalRef`, `GeoRef`, `PersonRef`, `OrgRef`
- `storage.ts` — helpers localStorage partagés (perspective, graphe, publications sélectionnées, historique, clés fiches/familles)
- `ThemeGeneration/GenerationPanel.tsx` — composant partagé de génération (publications + prompt IA), `variant: 'empty' | 'inline'`, utilisé uniquement par `FlatView`
- `FlatView/FlatView.tsx` — point d'entrée unique du step 1 (défaut, y compris à vide), props `onGoToMindMap`/`onGoToExpertises`/`justGenerated`/`onThemesGenerated`
- `MindMap/MindMapView.tsx` — vue "Relations (avancé)" : édition des nœuds/liens du graphe existant uniquement (plus de génération), prop `onBackToList`
- `ImpactCards/ImpactCardsView.tsx` — onglet Expertises (génération + revue)
- `ImpactCards/mockCardsLlm.ts` — `generateCardsFromGraph(nodes, families, cards)`
- `Lab/LabView.tsx` · `Lab/labMock.ts` — vue laboratoire agrégée
- `MindMap/mockLlm.ts` — `generateGraphFromPrompt()` + `generateGraphFromPublications(count)`, appelés depuis `GenerationPanel.tsx`
- `MindMap/mockIdRef.ts` — `searchIdRefPersons()`, `searchIdRefOrganizations()`, `GEONAMES_MOCK`, `NAMED_PERIODS`
- `MindMap/HistoryDialog.tsx` — dialog chronologique des versions
- `MindMap/ExpertiseNode.tsx` · `MindMap/RelationEdge.tsx`

**Descriptif complet :** `public/prompts/expertises.md`

---

### ✅ Profil de recherche 2 (`src/app/[lang]/expertise-v2/`)

Deuxième version de la rubrique Expertises, **ergonomie simplifiée** (octobre 2026) : entrée Sidebar « Profil de recherche 2 », route `/expertise-v2`, prompt `public/prompts/profil-recherche-2.md`. **Indépendante de la v1** (modèle, stockage et composants propres ; la v1 reste intacte).

**Principe :** un seul objet, le **thème de recherche** — daté (`yearFrom`/`yearTo`, null = en cours), qualifié par **mots-clés** (RAMEAU / MeSH / Wikidata / domaines HAL / libre) et par des **repères structurés** (`places` GeoNames, `persons` et `organizations` IdRef — option normale conservée de la v1, décision du 15 oct. 2026), avec **diffusion par thème** (`private` / `institution` / `public`), **sollicitations par thème** (`acceptsPress`, `acceptsEvents`, actives seulement si public), **déclinaisons par public** (`variants: Partial<Record<Audience, string>>`, `Audience = researchers | industry | media | public`, générées par `mockAudienceLlm.ts`, retouchables) et **statut** `draft` / `validated`. Plus de séparation Thèmes / Expertises, plus de stepper, plus de cartes en grille.

**Profil d'un·e collègue en lecture seule** (`components/MemberProfile/MemberProfileView.tsx`) : quand la perspective est une autre personne (sélecteur d'espace, `memberForPerson()`) ou depuis la vue labo (noms de *Complétude des profils*, bouton du dialogue détail, state `labMember` dans `page.tsx`). Affiche les thèmes `isLabVisible` sans édition ; bouton **« Copier dans mon profil »** → `CopyThemeDialog` (intitulé, mots-clés tous repris et retirables, repères + périodes étudiées cochés, description décochée) → `copyTheme()` (`types.ts`) crée un brouillon avec `copiedFrom` (provenance affichée dans l'éditeur et la liste) ; ne reprend ni période de travail, ni publications, ni diffusion, ni déclinaisons. `teamColor()`/`initials()` déplacés dans `labMock.ts`.

La vue labo (`components/Lab/LabView.tsx`, données `components/Lab/labMock.ts` : 16 membres fictifs + le profil connecté injecté s'il appartient à la structure) s'affiche quand la perspective est une structure. Elle est en lecture seule et agrège les thèmes **validés non privés** (`isLabVisible`) regroupés par mot-clé contrôlé (`topicKeyOf`). Sections : KPI, filtres (équipe, recherche, **curseur d'année** = thèmes actifs cette année), **frise des sujets** (un trait par membre, couleur = équipe), **carte des terrains** (`Lab/LabFieldMap.tsx` : Leaflet + tuiles OpenStreetMap standard atténuées en CSS — les tuiles CARTO exigent désormais une clé API —, chargé via `next/dynamic` `ssr:false` car Leaflet touche `window` à l'import ; agrégation dans `Lab/labPlaces.ts`, coordonnées dans `Lab/placeCoords.ts` indexées par id GeoNames puis par libellé ; cercles par terrain, zones en pointillés, étendues Grand Ouest / Tous les terrains, clic → dialogue membres), ECharts barres empilées « thèmes actifs par année », organisations et personnes agrégées, **annuaire des expertises publiques** (filtres presse / événements, dialogue détail avec `AudienceSwitcher`), complétude des profils. `echarts-for-react` est mocké dans `page.test.tsx` ; le mock global de `next/dynamic` y stubbe aussi la carte. Dépendances ajoutées : `leaflet`, `@types/leaflet` (install avec `--legacy-peer-deps`).

**3 onglets** (`page.tsx`) + éditeur pleine page :
- **Thèmes** (`ThemesList`) : lignes pleine largeur (titre, description, 3 mots-clés +N, nb de publications, **période de travail** en texte + **mini-frise**, ligne « Porte sur » = périodes étudiées, chip diffusion, icônes sollicitations, chip statut). Validés d'abord, brouillons à la fin + bandeau orange. Boutons « Proposer des thèmes d'après mes publications » (ouvre l'atelier ci-dessous) et « Ajouter un thème ». ⚠️ Plus d'« Importer depuis HAL » (`HalImportDialog` et `HAL_THEME_SUGGESTIONS` supprimés le 15 oct. 2026 : le libellé laissait croire à une copie de données HAL).
- **Atelier « Proposer des thèmes d'après mes publications »** (`ThemeProposalsWorkshop`, pleine page, 2 étapes, ergonomie volontairement différente de la v1 pour comparaison) : ① `PublicationPicker` (corpus `mockPublications.ts`, 28 publis groupées par année, recherche, filtre type, sélections rapides ; publications déjà rattachées grisées + nom du thème via `coverageMap()` ; défaut = non rattachées) → ② cartes de propositions (`buildProposals()`/`proposeThemes()` 1,4 s : regroupement par `cluster` caché, période de travail = `periodFromPublications()` [min → max, `null` si publi < 2 ans], périodes étudiées = `studiedPeriod` des publis, intitulé retouchable, publis retirables, **rattachement au thème existant** si même sujet ou publis déjà rattachées : étend la période, ajoute publis + périodes étudiées). Résultat `WorkshopResult { newThemes, attachments }` appliqué dans `page.tsx` (`applyWorkshop`).
- **Éditeur** (`ThemeEditor`) : remplace la liste (fil d'Ariane), 2 colonnes — intitulé, description (/1200), **période de travail** (début / fin / « toujours en cours » + « Reprendre les dates des publications »), **période étudiée** (`StudiedPeriodPicker` : autocomplete `mockPeriods.ts` ~40 périodes datées OU plage d'années avec sélecteur av./ap. J.-C., années négatives = av. J.-C., chips beige `StudiedPeriodChip`), **publications à l'appui** (liste + dialogue `PublicationPicker`), `KeywordPicker` (toggle référentiel + autocomplete `mockVocab.ts` + mot-clé libre + suggestions HAL), **`RefsPicker`** (3 autocompletes Terrains et lieux / Personnes / Organisations sur `mockRefs.ts`, chips `RefChip` dont le libellé est un lien GeoNames/IdRef, repère libre accepté en pointillés, lieux « repérés dans votre texte »), **`AudienceVariantsEditor`** (bouton Générer les déclinaisons → 4 onglets retouchables) · diffusion en cartes-radio, switches sollicitations, relations du parcours, suppression. Barre fixe : Enregistrer le brouillon / Valider ce thème.
- **Graphe de parcours** (`JourneyGraph`, React Flow, `ssr:false`) : mode **Frise** (barre par thème, x = année de début, largeur = durée, couloirs, axe des années en nœuds `axisTick`/`axisLine`) ou **Libre** (positions dans `profile.positions`). Connexion par glisser (`ConnectionMode.Loose`). **Panneau droit 420 px** : Thème A, direction en 3 gros boutons, Thème B, champ « Qualifier la relation » + chips de suggestions, phrase de prévisualisation, Supprimer / Enregistrer, liste des autres relations. La sélection (nœud/arête) est celle de React Flow ; un nœud sélectionné affiche son résumé + « Modifier ce thème ».
- **Aperçu public** (`PublicPreview`) : thèmes **publics et validés** seulement, badges presse / événements, **« Voir le portail comme »** (`AudienceSwitcher` dans `ThemeDetail.tsx` : description générale / chercheurs / partenaires / presse / grand public → `descriptionFor()`, mention « Version adaptée… » ou « Description générale… », tri presse/événements en tête selon le public), section Parcours (relations entre thèmes publics), bandeau « N thèmes masqués (établissement / privé / brouillon) ». `ThemePublicBlock` et `RefsSummary` (dans `ThemeDetail.tsx`) sont partagés avec la vue labo et le graphe.

**Données :** `types.ts` (`ResearchTheme` avec `yearFrom`/`yearTo` = période de travail, `studiedPeriods: StudiedPeriod[]` = époques étudiées, `publicationIds?`, helpers `formatYear()`/`formatStudiedBounds()` ; `PlaceRef`/`PersonRef`/`OrgRef`, `Audience`/`AUDIENCE_CONFIG`, `ThemeRelation`, `ResearchProfile`, `VISIBILITY_CONFIG`, `VOCAB_CONFIG`, `relationSentence()`, `isActiveIn()`, `normalizeTheme()` appliqué au chargement pour compléter les profils stockés avant l'ajout des champs, `DEMO_PROFILE` = 5 thèmes de géographie sociale 2009→, 4 relations, repères et déclinaisons volontairement inégaux) · `storage.ts` (localStorage `research-profile-v2-default` : uniquement le profil connecté, indépendant de l'URL) · `mockRefs.ts` · `mockAudienceLlm.ts`. Tests : `page.test.tsx` (graphe stubbé via `next/dynamic`, `echarts-for-react` stubbé). `jest.config.ts` mappe désormais `@/mocks/*` → `src/mocks/*`.

---

### ✅ Tableau de bord — Portage des dataviz Nantilux (`src/app/[lang]/dashboard/`)

Enrichissement du tableau de bord avec les dataviz de **Nantilux** (`C:\Users\godet-g\Documents\GitHub\nantilux`, Streamlit + Plotly, ~56 graphes / 9 onglets). Onglets Nantilux *Liste de publications* et *Correspondance auteurs* **hors périmètre**.

**Décisions :** tout en **ECharts** (pas de Plotly) · données de démo = **export Nantilux anonymisé** (sans noms d'auteurs ; réseau pseudonymisé) · onglets Équipes/Axes/Doctorants/Réseau/Par chercheur réservés aux perspectives **structure**.

⚠️ **Jeu de démo = IREENA** (`src/mocks/data/dashboard-publications.json`, 330 publis), basculé depuis LS2N en phase 3 car IREENA a un `effectifs.csv` (équipes UTR1-3 + doctorants). Tous les onglets affichent donc IREENA.

**Perspective :** la vue suit le sélecteur global (structure → Laboratoire, personne → Chercheur). Données dans `DashboardViewContext.tsx` (`DashboardDataProvider` + hook `useDashboardData`) :
- **Chercheur** : publications filtrées sur l'auteur interne le plus prolifique pour soi, un autre auteur stable pour une personne consultée ; titre = nom de la perspective ; onglets limités à *Vue d'ensemble, Collaborations internationales, Impact, Chapitres & monographies* ; Sankey/Sunburst (basés équipe) masqués dans International.
- **Laboratoire** : toutes les publications pour sa structure, un sous-ensemble stable pour une autre ; tous les onglets ; titre = nom de la structure. Le jeu reste IREENA dans tous les cas.
Tous les onglets lisent `publications`/`authors` via `useDashboardData()` (plus d'appel direct à `dashboardMockService` dans les tabs).

**Architecture à onglets** (`DashboardTabs.tsx` via `TabFilter`). Onglets des phases 2-3 présents en placeholder « À venir » + badge de phase.

**Roadmap :**
- **Phase 1 — ✅ livrée** : socle à onglets + onglet *Vue d'ensemble* = 3 viz existantes (carte d'identité, publications/an, WordStream) déplacées dans `tabs/OverviewTab.tsx` + 6 viz Nantilux (KPI cards, évolution annuelle, langues, types, accès ouvert, APC). Charts dans `components/charts/`. Données via `src/mocks/dashboardMockService.ts` + `dashboard-publications.json` (4041 publis LS2N 2020-2026). KPI doctorants = « — » (pas d'`effectifs.csv`).
- **Phase 2 — ✅ livrée** : *Collaborations internationales* (`tabs/InternationalTab.tsx` — intl/national, % intl, carte choroplèthe monde via `public/vendor/world.json`, top 20 pays, UE/hors-UE, heatmap pays×années, top organismes partenaires, **Sankey + Sunburst équipe→pays→organisme**, **carte de flux** labo→villes partenaires) + *Impact & citations* (`tabs/ImpactTab.tsx` — KPI FWCI, quartiles Scimago, Top 1%/10% par année, distribution FWCI). Agrégats : `charts/internationalAggregates.ts`, `charts/impactAggregates.ts`. Export v2 ajoute `partnerInstitutions`, `sjrQuartile`, `countryNames.json`.
- **Phase 3 — ✅ livrée (sauf Axes)** : *Ouvrages* (`BooksTab`), *Équipes* (`TeamsTab` — répartition/évolution/types par équipe + **radar disciplinaire** via `subfields`), *Par chercheur* (`ResearchersTab`), *Doctorants* (`PhdTab`), *Réseau de co-signatures* (`NetworkTab` — graphe force ECharts, auteurs **pseudonymisés**). Agrégats : `charts/structureAggregates.ts`, `charts/networkAggregates.ts`, `charts/booksAggregates.ts`. Équipe/doctorant dérivés par appariement `authors_lab`↔`effectifs.csv` (export v3 `export_ireena_v3.py`). **Axes reste placeholder** : `chosen_axe` est vide (« Autre / Non classé ») pour IREENA comme pour LS2N.

**Descriptif fonctionnel et technique (écran par écran, charts utilisés, modèle de données) :** `public/prompts/dashboard.md`

---

### ✅ Assistant de Recherche CRISalid (widget de chat)

Widget flottant global (bouton en bas à droite, panneau dépliable) simulant le **CRISalid Graph Agent** (https://github.com/CRISalid-esr/crisalid-agents). Monté dans `MainLayout.tsx`, visible sur toutes les pages authentifiées.

**Composant :** `@mui/x-chat` (`ChatBox`, v9 alpha) — ⚠️ peer dep officielle = MUI v7.3+, mais fonctionne avec le MUI v6 du projet (il n'importe que `IconButton`, `Button`, `Tooltip`, `styled`, `useThemeProps`). Installé avec `--legacy-peer-deps` (le CI utilise déjà `npm ci --legacy-peer-deps`). Ne pas monter la version de `@mui/material` pour autant.

⚠️ **Compat thème v6** : le paquet appelle `theme.alpha()` (méthode ajoutée au thème en MUI v7) dans le rendu des bulles d'outils et des erreurs → crash « 500 » (ErrorBoundary). Corrigé par `withChatThemeCompat` dans `ChatWidget.tsx` : un `ThemeProvider` local étend le thème ambiant avec `alpha()`. Test de régression : `ChatWidget.test.tsx` (déroule le scénario LPPL complet).

**Fichiers :**
- `src/app/[lang]/components/ChatWidget/ChatWidget.tsx` — Fab + panneau (Paper 400×640), entête (logo `crisalid.png`, titre "Assistant de Recherche CRISalid", reset, fermer), `ChatBox` avec `localeText` FR, bandeau "Maquette — réponses simulées"
- `src/app/[lang]/components/ChatWidget/mockAgent.ts` — `createCrisalidMockAdapter()` : adapter `sendMessage` retournant un `ReadableStream<ChatMessageChunk>` (chunks `start` → `tool-input-*`/`tool-output-available` → `text-delta` mot à mot → `finish`)

**Comportement mock :** 4 scénarios scriptés déclenchés par mots-clés (capacités de l'agent, domaines du LPPL, copublications CRCI2NA–Belgique, experts batteries) + fallback qui rappelle les questions de démo. Chaque scénario simule 1-2 appels d'outils sur le graphe (`search_structures`, `get_research_themes`, `find_copublications`, `search_experts`) rendus en accordéons natifs par ChatBox. Suggestions cliquables (`suggestionsAutoSubmit`) dans l'empty state. Conversation persistée en `sessionStorage` (`crisalid-chat-messages`, 40 derniers messages).

---

### ✅ Gestion des droits (`src/app/[lang]/rights/`)

Maquette de la proposition CRISalid « groupes Keycloak = source unique des droits » : arborescence de groupes qui suit l'organigramme (établissement > composante > labo > équipe) avec des feuilles par rôle ; le full group path (`/UnivParis1/UFR08/LaboXYZ/account_editor`) est encodé dans le JWT ; les applis clientes (SoVisu+, chatbot, Projects, couche MCP) ne font que parser rôle + périmètre. Un droit s'applique aux sous-structures.

**3 onglets** (`page.tsx`, entrée Sidebar « Gestion des droits ») :
- **Utilisateurs** (`UsersTab` + `UserRightsDialog`) : droits en chips, fiche par utilisateur (ajout rôle × périmètre → aperçu du chemin de groupe, retrait, accordéon « JWT résultant » avec payload décodé + interprétation par appli)
- **Groupes Keycloak** (`GroupsTab` + `GroupMembersDialog`) : TreeView (@mui/x-tree-view) de l'arborescence (2 établissements de démo : Nantes Université, Paris 1 — exemple du message d'origine), feuilles-rôles avec compteurs, dialogue membres, bouton « Resynchroniser depuis l'organigramme CRISalid » (simulé), encart fine-grained admin permissions (KC 26.2)
- **Rôles** (`RolesTab`) : vocabulaire transverse (`admin`, `account_editor`, `document_viewer/editor`, `project_viewer/editor`) × applications qui l'interprètent

**Données/état :** `mockRights.ts` (ORG_TREE, ROLES, MOCK_USERS, parse des group paths, `buildJwtPayload`) ; assignations persistées en localStorage `rights-assignments-v1`, partagées entre les onglets. Tests : `page.test.tsx`. Descriptif : `public/prompts/droits.md` (mappé dans PromptDrawer).

---

### ✅ Sélecteur de perspective (`src/app/[lang]/components/Perspective/`)

Remplace le champ « Chercher » (`SearchInput`, supprimé). **Une seule commande pilote la perspective** (`?perspective=`) ; les bascules Chercheur / Laboratoire et le champ « collègue » des pages ont été retirés. **Deux options cohabitent pour comparaison**, via la commande de maquette « A · Barre / B · Titre » en bas de la barre latérale (`PerspectiveVariantSwitch`, localStorage `svp-perspective-variant`, à retirer une fois le choix fait) :
- **A — barre latérale :** `PerspectiveSwitcher` (bouton en tête de Sidebar) + `PerspectiveBanner` (bandeau quand on n'est pas chez soi).
- **B — titre :** `PerspectiveTitle`, rendu par `DocumentHeader` : le nom du titre ouvre le menu, lien « Revenir à mon espace » dessous. Pas de commande sur les pages sans `DocumentHeader` (Droits, annuaires).

Moteur commun `PerspectivePicker` : couvre tous les chercheurs de la base et toutes les structures, regroupées par niveau (Établissements / Unités de recherche / Autres structures / Équipes, `structureLevelOf()`). Pas de « Mes structures » : sans saisie, il présente mon espace, les récents puis toute la base. Navigation `usePerspectiveNavigation` (récents en localStorage `svp-recent-perspectives`, page non compatible → tableau de bord, fiche document → liste).

**Exemples de structures :** établissement `nantes-universite`, unité `labo-x` (jeu complet du tableau de bord, Jean Dupont en est membre), équipe `labo-x-equipe-2` (`dashboardTeam` : vraies publications de l'Équipe 2). Les autres structures affichent un sous-ensemble stable ; l'établissement affiche le même jeu que Labo X, faute de données propres.

**`usePerspectiveScope()` décide ce qu'affichent les pages** : `own` (édition), `person` (lecture seule), `structure` (vue agrégée). `demoIndex(slug, n)` attribue des données de démo stables à une perspective.
- **Tableau de bord :** `DashboardDataProvider` reçoit `demoKey` (personne ou structure autre que soi/sa structure → sous-ensemble stable du jeu IREENA) et `isOwn` (libellés à la 1re personne).
- **Profil recherche (v1) :** `structure` → `LabView` ; `person` → `ConsultationView` (lecture seule, membre fictif de `labMock.ts`).
- **Profil de recherche 2 :** bouton « Consulter le profil d'un·e collègue » dans l'en-tête, qui ouvre le même moteur ; `structure` → `LabView` (`labName`, `includeOwn` selon l'appartenance, `initialTeam` au niveau équipe) ; `person` → `MemberProfileView` (`memberForPerson()`, copie de thème conservée : retour à son espace puis éditeur).

⚠️ Hors de son propre espace, rien n'est modifiable sur ces pages. L'empty state d'onboarding n'est donc plus accessible via `?perspective=` : il s'obtient en supprimant ses thèmes. La question de l'édition selon les rôles (écran Gestion des droits) reste ouverte. Tests : `Perspective.test.tsx`.

---

### ✅ Aide contextuelle et visite guidée

**Liens d'aide (`components/HelpLink/`) :** `HelpLink` affiche un « ? » qui ouvre la page du centre d'aide ([sovisuplus-aide](https://github.com/guillaumegodet/sovisuplus-aide)) dans un nouvel onglet, en `/en/` si l'interface est en anglais. `HELP_PAGES` associe chaque sujet à une page ; `NEXT_PUBLIC_HELP_BASE_URL` remplace l'adresse de base. `DocumentHeader` prend `helpTopic`, `TabFilter` prend `action`. **Pas de « ? » pour une rubrique sans page d'aide** (Profil recherche, Profil de recherche 2, Activités, Droits, Chercheurs, onglet Domaines) : à ajouter quand la page existera.

**Visite guidée (`components/Onboarding/`) :** `OnboardingTour`, monté dans `MainLayout`, se lance à la première visite (localStorage `svp-onboarding-v1`, à incrémenter pour la reproposer après une refonte). 11 étapes définies dans `tourSteps.ts`, qui changent de page (`path`) et mettent en avant l'élément portant `data-tour="<target>"` ; une zone absente laisse la carte centrée, sans bloquer. Elle présente son propre espace (quitte `?perspective=`) et le seul Profil de recherche 2. Passer ou Échap ferme et mémorise ; l'icône à côté d'**Aide** dans la barre latérale relance. Sur mobile : une seule carte d'accueil. Composant maison sur `Modal` MUI, sans dépendance. Tests : `Onboarding.test.tsx`.

---

## Refonte du design (branche `refonte-design`)

Test d'une interface plus claire, inspirée de malt.fr, en gardant le teal. Sur cette branche, ce qui suit remplace ce qui est décrit plus haut.

- **Structure :** `layouts/shell.ts` (dimensions), menu blanc `Sidebar.tsx` (Tableau de bord, Publications, Activités de recherche, Profil recherche, Structures), barre du haut `appbar/Appbar.tsx` (aide, visite, langue, thème, compte). Profil recherche v1, Chercheurs et Droits sont retirés du menu, leurs fichiers restent.
- **Thème :** police Inter, surfaces à bordure fine, jetons `navHover` / `navActive`, composants dans `theme/overrides/`. Mode clair par défaut ; le mode sombre doit seulement rester fonctionnel.
- **Listes :** `components/ListTable/` (`listTableProps`, `ListFilterBar`) est partagé par les publications et les thèmes : filtres déroulants groupés, recherche, clic sur la ligne. Seules les publications ont une colonne Action. `src/mocks/queryMockDocuments.ts` applique filtres et tri en mode maquette.
- **Fiche publication :** flèche + titre + statuts (`DocumentMeta`), carte Auteurs et Sources à partir de `xl` (`DocumentSummaryCard`). Onglets : Informations bibliographiques, Auteurs, **Thématiques** (`Themes/` = mots-clés + classification OpenAlex + domaines HAL ; les anciens `?tab=keywords` et `?tab=domains` y mènent), Sources, HAL. Le premier onglet récapitule la notice sans les auteurs (titre, type, date, **Paru dans** = revue + ISSN + éditeur, résumé replié s’il est long, identifiants, sources) et se termine par deux raccourcis « Modifier les auteurs » / « Modifier les thématiques ». Sections en cartes `DocumentSection`. Onglet Auteurs : carte d’en-tête (compteurs, « N à compléter » + « Les afficher », interrupteur « Ordre des auteurs défini », Ajouter un auteur), puis une ligne par auteur (rang, initiales, nom, identifiants, fonctions, affiliations, pastille Identifié / Non identifié) dont le détail s’ouvre au clic (Identité + HAL, Fonctions, Affiliations) ; monter, descendre, insérer, retirer dans le menu ⋯ ; barre d’enregistrement collante seulement s’il y a des modifications ; couleurs du thème. Tests : `Authors.test.tsx`. Déposer dans HAL : « Étape 1 sur 2 » en trois cartes (Repris de la notice avec liens Modifier, Description, Fichiers), revue pré-remplie depuis « Paru dans », barre collante qui compte et liste les champs obligatoires manquants (avant, le bouton ne faisait rien), « Étape 2 sur 2 » en récapitulatif libellé / valeur, statuts sur un modèle unique (`STATUS_VIEWS`). Tests : `HalDeposit.test.tsx`. Domaines : couleurs du thème. Mots-clés en maquette (`NEXT_PUBLIC_USE_MOCK`) : `VocabularyKeywordPicker` (choix de vocabulaires JEL, AAT, ACM CCS, ELSST, Pactols, EuroSciVoc, recherche dans ceux cochés ou dans tous, mot-clé libre) sur `mockVocabularies.ts` ; ajouts et retraits en localStorage `document-keywords-v1-{uid}` ; hors maquette, l’ancien parcours (`/api/vocabs`) reste. Tableaux de comparaison partagés `CompareTable` (+ pastille `CompareStatus` Concordant / Diffère) : onglet Sources = liste des notices sources (actions dans un menu ⋯, simulées) + comparaison champ par champ, différences en tête ; Compléter dans HAL = tableaux « À ajouter » (cases à cocher) et « À vérifier » (Dans HAL / Dans SoVisu+).
- **Structures (`research-structures/`) :** liste au style des listes (`listTableProps`, `ListFilterBar` Type / Tutelles / recherche, clic sur la ligne), bascule Liste / Arborescence en bout de barre (`data-tour=structures-tabs`) ; en arborescence, une recherche garde les parents des structures trouvées. Fiche : en-tête comme la fiche publication (flèche, fil de rattachement, ligne type · mission · tutelles), quatre indicateurs `KpiCardGrid` du tableau de bord, onglets `TabFilter` ; membres en table filtrable (statut, recherche), équipes et structures rattachées en `StructureTable` ; le graphique des publications passe dans l’onglet Publications avec les liens vers les publications et le tableau de bord de la structure. Tests : `research-structures/page.test.tsx`.
- **Profil d’un·e collègue (`MemberProfileView`) :** en-tête comme les fiches (flèche de retour si l’on vient du labo, initiales, nom, ligne équipe, pastille « Lecture seule »), une carte « Thèmes de recherche » dont chaque ligne réutilise `ThemePublicBlock` replié (intitulé, période, description, « Voir le détail ») avec à droite la diffusion, les sollicitations et « Copier dans mon profil ». Plus d’encadré d’explication : une phrase sous le titre de la carte. Boutons du dialogue de copie aux couleurs du thème.
- **Profil recherche (`expertise-v2`) :** l'éditeur montre l'essentiel (intitulé, description, période de travail, diffusion) ; l'enrichissement est replié par sujet, avec un résumé sur la ligne (`EnrichSection`). Sollicitations visibles seulement pour un thème public.
- **Graphe de parcours :** plus de frise (retirée car peu lisible). Canevas pleine largeur, thèmes placés par ordre chronologique (`journeyLayout.ts`) et déplaçables ; panneau affiché seulement à la sélection, modifications enregistrées au fil de l'eau. `JourneyGraph` étant stubbé dans `page.test.tsx`, seule la disposition a un test : vérifier les interactions dans le navigateur.
- **Aperçu public :** une ligne « Voir comme » + thèmes masqués ; détail de chaque thème replié (`ThemePublicBlock` avec `collapsible`, le dialogue de la vue labo garde tout déplié).
- **Atelier :** en-tête « Étape 1 sur 2 » ; `PublicationPicker` reprend `ListFilterBar` (aussi dans la fiche d'un thème) ; une carte courte par proposition, détail replié, choix rattacher ou créer visible.
- **Vue labo (`Lab/LabView.tsx`) :** quatre indicateurs et quatre onglets (Sujets, Terrains, Expertises publiques, Membres) ; tables et filtres de `ListTable` (équipe, année, recherche). Plus de frise collective ni de curseur d'année.
- **Mon compte (`account/`) :** titre, menu de rubriques à gauche (Identifiants, Affiliations, Notifications, Autorisations), cartes à droite. IdRef, HAL et ORCID : ajouter, modifier, supprimer avec confirmation ; « Lier mon compte » réservé à soi (simulé). `usePersonIdentifiers` conserve les modifications en localStorage `person-identifiers-v1-{slug}`, partagées avec `PersonIdentityCard`. Le crayon du Tableau de bord ouvre `/account?perspective=…` : identifiants et affiliations de la personne, modifiables. Les anciens `myProfile/` restent dans le dépôt, inutilisés sur cette branche.
- **Activités de recherche :** cartes colorées à bandeau, une teinte par type dans `components/activityTypes.ts` (contrastes vérifiés par test), barre `ListFilterBar`, actions dans un menu ⋯, deux informations par carte.
- **Tableau de bord :** une seule période pour toute la page (`DashboardPeriod.tsx` : filtre « Années » au bout des onglets, partagé par tous). Onglets courts : Vue d'ensemble, Collaborations, Impact, Équipes, Chercheurs, Doctorants, Ouvrages (quatre pour une personne). « Axes » (sans données) et « APC » (repris dans la Vue d'ensemble) sont retirés. Cartes `DashboardSectionCard` (titre `h6`), quatre indicateurs au plus (`KpiCard`, sans couleur ni icône), actions d'un graphique dans un menu ⋯ (`EChart`). Le reste est replié dans « Analyses détaillées » (`DashboardDetails`, graphiques montés à l'ouverture). Le réseau de co-signatures est passé dans Collaborations. Tests : `DashboardTabs.test.tsx`.
- **Palette des graphiques :** `dashboard/components/charts/chartPalette.ts` est la seule source des couleurs. Elle contient 7 couleurs de séries ouvertes par le sarcelle (`SERIES`, `PRIMARY_SERIES` pour une série seule ; au-delà, on regroupe en « Autres »), une échelle de rang (`ORDINAL`, quartiles), une échelle d’intensité (`SEQUENTIAL`, cartes et heatmaps) et des neutres (inconnu, fond de carte, axes). Elle a été validée avec le script du skill dataviz, en clair et en sombre. `useChartTheme` (via `EChart`, ou `ThemedChart` sans menu) applique ces couleurs et les remplace en mode sombre. Les couleurs Open Access (`OA_COLORS`) restent celles de la production. Ne plus écrire de couleur en dur dans un graphique. Tests : `chartPalette.test.ts`.
- **Apparence de l’établissement (`appearance/`, menu du compte) :** une seule couleur choisie (sélecteur, code, suggestions, ou couleurs extraites d’un logo, lu dans le navigateur) génère tout le thème avec `@material/material-color-utilities` (espace HCT, comme Material Theme Builder) : `theme/brand.ts` (`generateBrand`), puis `buildPalettes` / `buildThemes`. La couleur est gardée telle quelle si elle est lisible sur blanc (4,5:1), sinon ajustée, et l’écran le signale. `ThemeContext` la conserve en localStorage `svp-brand-color-v1` et pose `--svp-brand`, `--svp-brand-tint`, `--svp-brand-strong` sur :root. Les anciens écrans (Expertises v1, Profil de recherche, Compléter dans HAL) utilisent `BRAND`, `BRAND_TINT`, `brandMix()`, `withAlpha()` au lieu de `#006A61` ; Leaflet passe par `resolveColor()`. Graphiques : `chartColorsFor(seed, mode)` dérive de la couleur la 1re série, le rang et l’intensité, et choisit les autres séries dans la palette validée (plus une réserve) pour que chaque voisine se distingue (mêmes seuils que le validateur dataviz) : six séries au moins, sept le plus souvent. Restent fixes : statuts, accès ouvert, activités, équipes. « Exporter la configuration » télécharge un `colors.ts` pour `configs/custom/`. Jest transpile ce paquet ESM (`transformIgnorePatterns` dans `jest.config.ts`). Tests : `theme/brand.test.ts`, `appearance/page.test.tsx`.
- **Publication :** `git push origin refonte-design` publie sur `crisalid-esr.github.io/SVP-mockups/refonte/`. Le workflow `deploy.yml` sert aux deux branches, avec `keep_files` ; `main` doit porter la même version, sinon sa prochaine publication efface `/refonte/`.

---

## Fonctionnalités à développer (restant)

### 🔲 Activités de recherche
Page déjà existante : `src/app/[lang]/research-activities/`.
Composants partiellement implémentés dans `research-activities/components/ActivityCard.tsx`.
Référence : `C:\Users\godet-g\Documents\GitHub\maquettes\SVP\src\` — chercher les composants liés aux activités.

---

## Points de vigilance

- **ESLint :** `no-explicit-any` et `no-unused-vars` sont en `warn` (pas `error`) pour permettre le build. Ne pas les repasser en `error`.
- **Icônes `@untitled-ui/icons-react` :** Utiliser le cast `UntitledIcon` pour les props `size`/`color` (voir `ActivityCard.tsx`). Préférer les icônes MUI (`@mui/icons-material`) pour éviter ce problème.
- **Apostrophes dans JSX :** Toujours utiliser `{`texte avec l'apostrophe`}` ou `&apos;` — jamais de `'` direct dans le texte JSX.
- **Routes statiques :** Tout nouveau segment dynamique (`[param]`) doit avoir un `generateStaticParams()` dans son `layout.tsx` (pas dans un client component).
- **Alias `@/` :** Pointe vers `src/app/` (défini dans `tsconfig.json` ET `webpack` dans `next.config.ts`).
- **`configs/`** est à la racine du projet (pas dans `src/`), accessible via l'alias `@/configs/*`.
