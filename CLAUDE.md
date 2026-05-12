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
- Jean Dupont (rang 1) — IdHAL confirmé + ORCID + affiliation LS2N
- Sophie Martin (rang 2) — sans IdHAL, 3 candidats HAL, 1 affiliation non trouvée avec candidats structures
- Pierre Bernard (rang 3) — sans IdHAL, sans candidats, sans affiliation
- Anne Leclerc (rang 4) — IdHAL confirmé + affiliation EHESS

---

## Fonctionnalités implémentées

### ✅ Onglet Auteurs (`documents/[uid]/components/Authors/Authors.tsx`)
Interface complète d'identification des auteurs et affiliations dans HAL :
- Bannière d'état : "Retrouvez les auteurs et les affiliations HAL manquants"
- Barre de progression alignés/total
- Bouton "Aligner toutes les meilleures correspondances" (auto-confirme les candidats ≥ 85%)
- Layout 2 colonnes : info auteur (gauche) + affiliations (droite)
- Statut auteur : "Trouvé dans HAL" (vert) ou "Non trouvé dans HAL" (orange)
- Panneau candidats HAL avec avatars colorés, score de correspondance, bouton Confirmer
- Affiliations alignées (chip ROR) ou manquantes (texte importé + candidats structures)
- "Ajouter une affiliation HAL" en accordéon
- Barre du bas : Ajouter un auteur | Annuler | Enregistrer

**Vocabulaire à maintenir (simplifié pour les utilisateurs non-experts) :**
- ❌ "AureHAL", "alignement", "IdHAL obligatoire"
- ✅ "HAL", "Trouvé dans HAL", "Non trouvé dans HAL", "Retrouvez les auteurs manquants"

---

## Fonctionnalités à développer (restant)

### 🔲 Dépôt dans HAL
Onglet "Déposer dans HAL" déjà présent dans la navigation de `documents/[uid]/page.tsx`.
Voir l'ancien mockup `C:\Users\godet-g\Documents\GitHub\maquettes\SVP\src\components\PublicationDetail.tsx` pour la maquette de référence (onglet HAL deposit conditionnel).

### 🔲 Activités de recherche
Page déjà existante : `src/app/[lang]/research-activities/`.
Composants partiellement implémentés dans `research-activities/components/ActivityCard.tsx`.
Référence : `C:\Users\godet-g\Documents\GitHub\maquettes\SVP\src\` — chercher les composants liés aux activités.

### 🔲 Expertises
Page à créer. Entrée dans la sidebar déjà présente.

---

## Points de vigilance

- **ESLint :** `no-explicit-any` et `no-unused-vars` sont en `warn` (pas `error`) pour permettre le build. Ne pas les repasser en `error`.
- **Icônes `@untitled-ui/icons-react` :** Utiliser le cast `UntitledIcon` pour les props `size`/`color` (voir `ActivityCard.tsx`). Préférer les icônes MUI (`@mui/icons-material`) pour éviter ce problème.
- **Apostrophes dans JSX :** Toujours utiliser `{`texte avec l'apostrophe`}` ou `&apos;` — jamais de `'` direct dans le texte JSX.
- **Routes statiques :** Tout nouveau segment dynamique (`[param]`) doit avoir un `generateStaticParams()` dans son `layout.tsx` (pas dans un client component).
- **Alias `@/` :** Pointe vers `src/app/` (défini dans `tsconfig.json` ET `webpack` dans `next.config.ts`).
- **`configs/`** est à la racine du projet (pas dans `src/`), accessible via l'alias `@/configs/*`.
