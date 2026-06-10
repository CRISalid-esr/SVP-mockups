# Expertises — Descriptif fonctionnel (état courant)

> Dernière mise à jour : juin 2026

## Architecture

La rubrique **Expertises** repose sur une source de vérité unique : la **carte mentale** (graphe React Flow). Les deux autres vues ("Profil structuré", "Fiches publics") sont des projections de ce graphe.

```
Carte mentale  ──→  Profil structuré (vue à plat)
     │         ──→  Fiches publics (cartes impact)
```

**3 onglets** dans `page.tsx` :

| Onglet | Valeur | Composant |
|---|---|---|
| Mes domaines | `0` (défaut) | `MindMapView` |
| Profil structuré | `1` | `FlatView` |
| Fiches publics | `2` | `ImpactCardsView` |

---

## Isolation par perspective

Toutes les clés localStorage sont suffixées par `?perspective=` (lu via `window.location.search`) :

| Clé | Contenu |
|---|---|
| `expertise-graph-v2-{perspective}` | Graphe courant (nœuds + arêtes + meta) |
| `expertise-history-{perspective}` | Historique des versions (max 10) |
| `expertise-selected-publications-{perspective}` | UIDs des publications sélectionnées |

Un profil sans entrée enregistrée voit l'**empty state** (fallback `EMPTY_GRAPH` — nœuds vides, pas `INITIAL_GRAPH`).

---

## Flux de premier accès — publications-first

Quand `nodes.length === 0`, le canvas est masqué et remplacé par une carte centrée :

1. **Étape principale** :
   - Badge du nombre de publications sélectionnées (lues depuis localStorage)
   - Bouton "Sélectionner des publications →" → navigue vers `/[lang]/documents?perspective=…`
   - Bouton "Générer mes expertises" (activé si ≥ 1 publication sélectionnée)
   - Génération : appelle `generateGraphFromPublications(count, meta)` dans `mockLlm.ts` (~2,2 s)

2. **Séparateur "ou"** puis lien "Décrire mes domaines manuellement" → bascule vers :
   - Textarea autofocus + 4 chips de profils pré-remplis (Sociologue, Historien, Physicien, Juriste)
   - Bouton "Générer ma carte" → appelle `generateGraphFromPrompt(prompt, meta)` (~1,8 s)
   - Ctrl+Entrée fonctionne aussi
   - Bouton "Retour" pour revenir à l'étape publications

### Colonne "Expertises" dans la liste des publications

Colonne compacte (52 px) avec en-tête icône `Psychology` dans un tooltip.  
Chaque ligne : bouton icône `Psychology` toggleable — gris = non sélectionnée, teal `#006A61` = incluse dans le calcul.  
État persisté dans `expertise-selected-publications-{perspective}` (localStorage).  
La sélection est lue par perspective (`?perspective=` dans l'URL de la page documents).

---

## Mise à jour du graphe existant

Quand le graphe est chargé et rien n'est sélectionné dans le canvas (état 1 du panneau) :

- Section **Publications analysées** : badge du nombre de publications + bouton "Modifier les publications →" (navigue vers documents avec perspective) + bouton "Recalculer à partir des publications" (visible si ≥ 1 pub sélectionnée)
- Section **Chatbot** : prompt LLM (textarea + bouton Générer) pour affiner le graphe en langage naturel

---

## Versionnement

### Stockage

`expertise-history-{perspective}` → tableau `HistoryEntry[]`, max 10 entrées, ordre chronologique inversé (la plus récente en premier).

```ts
interface HistoryEntry {
  id: string        // `h${Date.now()}`
  timestamp: string // ISO 8601
  label: string     // ex : "Généré depuis 3 publications"
  nodeCount: number
  edgeCount: number
  graph: ExpertiseGraph
}
```

### Déclencheurs de sauvegarde automatique

- Bouton **Enregistrer** → label "Modification manuelle"
- Bouton **Générer le graphe** (prompt) → label `Généré par IA — "…"`
- Bouton **Générer mes expertises** (publications) → label `Généré depuis N publications`

### Interface

Bouton `History` (icône) dans le Panel top-right, teal si des versions existent.  
`HistoryDialog.tsx` : timeline verticale avec nœud coloré, date + heure, chips nœuds/liens/version, bouton "Restaurer" (désactivé pour la version actuelle).  
La restauration recharge les nœuds/arêtes/meta et sauvegarde dans le graphe courant (sans ajouter à l'historique).

---

## Modèle de données du graphe

### Nœud — un seul type

| Propriété | Type | Description |
|---|---|---|
| `label` | `string` | Intitulé de l'expertise |
| `nodeType` | `'expertise'` | Unique type (teal `#006A61`) |
| `description` | `string?` | Description libre |
| `temporal` | `TemporalRef[]?` | Couvertures temporelles |
| `geographic` | `GeoRef[]?` | Lieux |
| `persons` | `PersonRef[]?` | Personnes de référence |
| `organizations` | `OrgRef[]?` | Organisations |
| `concepts` | `ConceptRef[]?` | Mots-clés + vocabulaire |

### Arête — modèle atelier-first

| Propriété | Type | Description |
|---|---|---|
| `direction` | `'forward' \| 'backward' \| 'bidirectional'` | Sens de la relation |
| `label` | `string?` | Qualification libre (pointillés gris si absent) |

Pas de liste fixe de types de relations — la typologie émergera des ateliers.

---

## Caractéristiques — interfaces enrichies

### `temporal` — `TemporalRef`

```ts
interface TemporalRef { label: string; yearFrom?: number; yearTo?: number }
```

Saisie via **ToggleButtonGroup** :
- **"Plage d'années"** : Slider MUI double poignée (0–2030, `disableSwap`). Affiche `yearFrom — yearTo`. Stocke `yearFrom` et `yearTo` en plus du label formaté.
- **"Période nommée"** : Autocomplete freeSolo avec ~40 suggestions (`NAMED_PERIODS` dans `mockIdRef.ts`) : Antiquité, Révolution française, Guerre froide, Pandémie Covid-19, etc.

### `geographic` — `GeoRef`

```ts
interface GeoRef { label: string; geonamesId?: number }
```

Saisie via Autocomplete filtrant `GEONAMES_MOCK` (~70 lieux francophones).  
Chips cliquables → `Dialog` avec :
- Iframe `https://maps.google.com/maps?q={encoded}&output=embed&hl=fr` (320 px de haut)
- Boutons "OpenStreetMap" et "GeoNames" (nouvelle fenêtre)

### `persons` / `organizations` — `PersonRef` / `OrgRef`

```ts
interface PersonRef { label: string; identifier?: string }  // identifier = PPN IdRef
interface OrgRef    { label: string; identifier?: string }
```

Saisie via Autocomplete filtrant les données mock de `mockIdRef.ts` :
- **Personnes** : 25 entrées (Bourdieu, Foucault, Butler, Appadurai, Latour, Sayad…)
- **Organismes** : 20 entrées (CNRS, EHESS, UNESCO, OIT, IRD, Sciences Po…)

Les résultats affichent le nom, les dates et la description.  
Quand un résultat est sélectionné, le PPN est stocké dans `identifier`.  
Chips avec icône `OpenInNew` → `https://www.idref.fr/{ppn}` (nouvelle fenêtre).

### `concepts` — `ConceptRef`

```ts
interface ConceptRef { label: string; vocabulary?: string; uri?: string }
```

Texte libre + sélecteur de vocabulaire contrôlé optionnel : RAMEAU · MeSH · Wikidata · JEL · AMS · MSC · LCSH · libre.

---

## Panneau gauche — 3 états contextuels

| État | Condition | Contenu |
|---|---|---|
| **État 1** — rien sélectionné | `selectedNodes.length === 0` et `drawerTab !== 'edge'` | Prompt LLM · dernier prompt · **Publications analysées** (badge + recalcul) · Ajouter · Légende · Stats |
| **État 2** — nœud(s) sélectionné(s) | `selectedNodes.length > 0` | Carte info (label + description) · [Modifier] [Supprimer] · **Caractéristiques** éditables inline · Ajouter · Légende · Stats |
| **État 3** — lien sélectionné | `drawerTab === 'edge'` | Sélecteur direction (A→B / A←B / A↔B) · Label texte libre · Supprimer |

---

## Persistance JSON (`ExpertiseGraph`)

```json
{
  "nodes": [{ "id": "n1", "type": "expertiseNode", "position": { "x": 380, "y": 200 },
    "data": { "label": "Migration pour le travail", "nodeType": "expertise",
      "temporal": [{ "label": "2005 — 2024", "yearFrom": 2005, "yearTo": 2024 }],
      "geographic": [{ "label": "Sri Lanka" }],
      "persons": [{ "label": "Sayad, Abdelmalek", "identifier": "033975051" }],
      "concepts": [{ "label": "migration du travail", "vocabulary": "rameau" }]
    }
  }],
  "edges": [{ "id": "e1", "source": "n1", "target": "n2",
    "data": { "label": "approfondit", "direction": "forward" }
  }],
  "meta": { "version": 3, "lastUpdated": "2026-06-10",
    "promptHistory": ["Généré depuis 4 publications", "Généré par IA — \"Je suis spécialiste…\""]
  }
}
```

---

## Fichiers techniques

| Fichier | Rôle |
|---|---|
| `types.ts` | Types TypeScript : `ExpertiseNodeData`, `HistoryEntry`, `TemporalRef`, `GeoRef`, `PersonRef`, `OrgRef`, `EdgeData`, `CONTROLLED_VOCABULARIES` |
| `MindMapView.tsx` | Composant principal (~1 000 lignes) : canvas React Flow, panneau 3 états, empty state, génération, versionnement |
| `mockLlm.ts` | `generateGraphFromPrompt(prompt, meta)` · `generateGraphFromPublications(count, meta)` |
| `mockIdRef.ts` | `searchIdRefPersons()` · `searchIdRefOrganizations()` · `GEONAMES_MOCK` · `NAMED_PERIODS` |
| `HistoryDialog.tsx` | Dialog chronologique des versions avec restauration |
| `ExpertiseNode.tsx` | Nœud React Flow personnalisé (label + attributs repliables) |
| `RelationEdge.tsx` | Arête personnalisée (Bézier, marqueurs directionnels, pointillés si sans label) |
| `FlatView/` | Vue à plat (projection du graphe) |
| `ImpactCards/` | Cartes impact (projection par audience) |

**Dépendances :** `@xyflow/react` (React Flow v12) · `@mui/material` Slider, Autocomplete, ToggleButtonGroup

---

## Points de vigilance techniques

- React Flow nécessite `ssr: false` dans `next/dynamic` et `import '@xyflow/react/dist/style.css'` dans le composant client
- `getPerspective()` lit `window.location.search` directement (pas `useSearchParams`) pour éviter la Suspense boundary — safe car le composant est client-only
- Les marqueurs SVG (flèches) sont déclarés dans un `<svg width="0" height="0">` caché en début de `MindMapView` — un par couleur (`arrow-006A61`, `arrow-94a3b8`)
- L'iframe Google Maps embed (sans clé API) peut être bloquée par certains bloqueurs de pub — acceptable pour la maquette

---

## Questions ouvertes

1. **Génération LLM réelle** : quelles données envoyer au modèle (prompt seul, ou prompt + métadonnées des publications HAL sélectionnées) ?
2. **Visibilité du graphe** : lecture publique (profil chercheur) ou édition uniquement ?
3. **Couplage activités ↔ expertises** : association automatique publication → nœud d'expertise ?
4. **Export interopérable** : SKOS / RDF pour compatibilité avec des référentiels de compétences ?
5. **GeoNames réel** : l'API GeoNames (gratuite avec inscription) remplacerait `GEONAMES_MOCK` en production
6. **IdRef réel** : l'API SudoC / IdRef remplacerait `mockIdRef.ts` en production
