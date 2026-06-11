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

## Fonctionnalités à développer (restant)

### 🔲 Activités de recherche (à développer)

### 🔲 Activités de recherche (à développer)
Page déjà existante : `src/app/[lang]/research-activities/`.
Composants partiellement implémentés dans `research-activities/components/ActivityCard.tsx`.
Référence : `C:\Users\godet-g\Documents\GitHub\maquettes\SVP\src\` — chercher les composants liés aux activités.

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

**Badge dans la liste des documents (`HalStatusCellBadge`) :** quand `step === 'moderation'`, la colonne HAL affiche un chip bleu `color="info"` + icône `HourglassEmpty` ("En cours de modération") à la place du rouge "Hors HAL". `HalStatusCell` lit le localStorage au montage via `useEffect`.

**Descriptif complet :** `public/prompts/hal-deposit.md`

---

### ✅ Expertises (`src/app/[lang]/expertise/`)
Page avec 3 onglets : **Mes domaines** (carte mentale, source de vérité, défaut) · **Profil structuré** · **Fiches publics**

**Architecture (Option A) :** la carte mentale est la source de vérité. Les deux autres vues sont des projections des nœuds du graphe.

**Isolation par perspective :**
- Clés localStorage suffixées par `?perspective=` : `expertise-graph-v2-{p}`, `expertise-selected-publications-{p}`, `expertise-history-{p}`
- `getPerspective()` lit `window.location.search` côté client — aucun hook nécessaire
- Un profil sans graphe enregistré voit l'empty state (fallback `EMPTY_GRAPH`, plus `INITIAL_GRAPH`)

**Flux de premier accès (publications-first) :**
- Empty state : CTA "Sélectionner des publications →" (navigue vers `/documents?perspective=…`) + badge du nombre sélectionné + bouton "Générer mes expertises" (actif si ≥ 1 pub)
- Séparateur "ou" + lien "Décrire mes domaines manuellement" (bascule vers l'ancien textarea + chips profils)
- La colonne "Expertises" dans la liste des publications (icône `Psychology` toggleable, teal = incluse) persiste en localStorage par perspective

**Mise à jour (graphe existant) :**
- Panneau gauche état 1 : section "Publications analysées" avec badge + "Modifier les publications →" + "Recalculer à partir des publications"

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
- `MindMapView.tsx` — composant principal (~1 000 lignes)
- `mockLlm.ts` — `generateGraphFromPrompt()` + `generateGraphFromPublications(count)`
- `mockIdRef.ts` — `searchIdRefPersons()`, `searchIdRefOrganizations()`, `GEONAMES_MOCK`, `NAMED_PERIODS`
- `HistoryDialog.tsx` — dialog chronologique des versions
- `ExpertiseNode.tsx` · `RelationEdge.tsx`

**Descriptif complet :** `public/prompts/expertises.md`

---

## Points de vigilance

- **ESLint :** `no-explicit-any` et `no-unused-vars` sont en `warn` (pas `error`) pour permettre le build. Ne pas les repasser en `error`.
- **Icônes `@untitled-ui/icons-react` :** Utiliser le cast `UntitledIcon` pour les props `size`/`color` (voir `ActivityCard.tsx`). Préférer les icônes MUI (`@mui/icons-material`) pour éviter ce problème.
- **Apostrophes dans JSX :** Toujours utiliser `{`texte avec l'apostrophe`}` ou `&apos;` — jamais de `'` direct dans le texte JSX.
- **Routes statiques :** Tout nouveau segment dynamique (`[param]`) doit avoir un `generateStaticParams()` dans son `layout.tsx` (pas dans un client component).
- **Alias `@/` :** Pointe vers `src/app/` (défini dans `tsconfig.json` ET `webpack` dans `next.config.ts`).
- **`configs/`** est à la racine du projet (pas dans `src/`), accessible via l'alias `@/configs/*`.
