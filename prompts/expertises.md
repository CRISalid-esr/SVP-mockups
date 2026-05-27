# Expertises — Descriptif fonctionnel et choix d'architecture

## Contexte

La rubrique **Expertises** est une fonctionnalité innovante de SoVisu+ qui n'a pas d'équivalent direct dans les SI Recherche existants. Elle vise à permettre au chercheur de représenter, structurer et communiquer ses domaines d'expertise selon plusieurs angles complémentaires.

Elle repose sur une architecture en **trois vues alimentées par une source de vérité commune** (Option A retenue).

---

## Architecture retenue : Option A — trois vues, une base unique

La **carte mentale** (vue 1) est la source de vérité. Elle définit les concepts d'expertise sous forme de graphe orienté. Les deux autres vues sont des projections de ces mêmes concepts vers des usages différents :

```
Carte mentale (source de vérité — React Flow)
    │
    ├── Vue à plat : chaque nœud principal → expertise avec activités associées
    └── Cartes impact : chaque nœud → "Famille", déclinée en N cartes selon l'audience
```

Options écartées :
- **Option B** (trois outils indépendants liés par un vocabulaire) : risque de désynchronisation
- **Option C** (entonnoir séquentiel obligatoire) : trop contraignant pour les utilisateurs qui veulent accéder directement aux cartes impact
- **Option D** (vue à plat par défaut + deux vues optionnelles sans couplage) : moins innovant, reporte le problème de cohérence

---

## Navigation — 3 onglets (page.tsx)

| Onglet | Ancien nom | Valeur | Composant |
|---|---|---|---|
| **Mes domaines** | Carte mentale | `0` | `MindMapView` (défaut) |
| **Profil structuré** | Vue des expertises | `1` | `FlatView` |
| **Fiches publics** | Cartes impact | `2` | `ImpactCardsView` |

Les onglets "Profil structuré" et "Fiches publics" affichent un chip vert `depuis vos domaines` pour matérialiser leur dépendance à la carte. Les callbacks `onGoToMindMap` redirigent vers `setTab(0)`.

---

## Vue 1 — Carte mentale (implémentée)

### Principe

Le chercheur décrit ses expertises en **langage naturel** via un champ de texte libre. Un LLM traduit ce texte en un graphe React Flow que le chercheur peut ensuite modifier manuellement. Le graphe est persisté en JSON et s'enrichit au fil des itérations.

### Types de nœuds

| Type | Couleur | Description |
|---|---|---|
| Expertise principale | Teal `#006A61` | Domaine central de recherche |
| Expertise secondaire | Bleu `#1976D2` | Domaine connexe ou spécialisation |
| Terrain de recherche | Orange `#E65100` | Zone géographique, période, matériau, langage… |
| Concept transversal | Violet `#7B1FA2` | Notion théorique ou thématique |

### Typologie des relations (14 types en 4 catégories)

#### Hiérarchie (trait plein teal)
Relations de profondeur ou d'emboîtement entre expertises.

| Clé | Label affiché |
|---|---|
| `approfondit` | approfondit |
| `specialise` | spécialise |
| `integre` | intègre |

#### Terrain (tirets oranges animés)
Relations entre une expertise et son ancrage empirique.

| Clé | Label affiché |
|---|---|
| `terrain_geo` | terrain géographique |
| `terrain_temp` | terrain temporel |
| `cas_etude` | cas d'étude |
| `corpus` | corpus |

#### Conceptuel (pointillés violets)
Relations entre une expertise et les concepts théoriques qu'elle mobilise ou produit.

| Clé | Label affiché |
|---|---|
| `mobilise` | mobilise |
| `problematise` | problématise |
| `produit` | produit des connaissances sur |

#### Dialogue (pointillés bleus / rouge pour tensions)
Relations latérales entre expertises ou concepts de même niveau.

| Clé | Label affiché | Style |
|---|---|---|
| `croise` | croise | bleu `#1976D2`, tirets `8 4` |
| `articule` | s'articule avec | bleu `#1976D2`, tirets `8 4` |
| `a_conduit_a` | a conduit à | bleu `#1976D2`, plein |
| `en_tension` | en tension avec | rouge `#C62828`, tirets `4 4` |

### Empty state onboarding

Quand `nodes.length === 0` (premier accès ou après réinitialisation), le canvas est remplacé par une carte centrée sur fond pointillé :
- Textarea autofocus (6 lignes) avec placeholder
- 4 chips de profils pré-remplis : **Sociologue** · **Historien** · **Physicien** · **Juriste** (définis dans `EXAMPLE_PROMPTS`)
- Bouton "Générer ma carte" (activé dès que le champ est non vide, `Ctrl+Entrée` aussi)
- Après génération → canvas + panneau gauche s'affichent

### Panneau gauche — 3 états contextuels

| État | Condition | Contenu |
|---|---|---|
| **Rien sélectionné** | `selectedNodes.length === 0` et `drawerTab !== 'edge'` | Prompt LLM (action principale) · dernier prompt · "Ajouter un nœud" · légende en accordéon (replié par défaut) · stats |
| **Nœud(s) sélectionné(s)** | `selectedNodes.length > 0` | Carte info colorée (type + nom + description) · [Modifier] [Supprimer] · "Ajouter un nœud" · légende · stats |
| **Lien sélectionné** | `drawerTab === 'edge'` | Relation actuelle · sélecteur visuel par catégorie (prévisualisation du trait) · "Supprimer ce lien" |

La légende (types de nœuds + types de liens) est dans un `Accordion` MUI replié par défaut, piloté par `legendOpen`.

### Interactions utilisateur

- **Générer depuis un prompt** : champ texte (panneau gauche ou empty state) + bouton → spinner 1,8 s → graphe pré-rempli
- **Réinitialiser** : bouton `RestartAlt` dans le panneau top-right → vide nœuds/arêtes/meta → affiche l'empty state
- **Ajouter un nœud** : bouton "Ajouter un nœud" → dialog (intitulé, type, description)
- **Modifier un nœud** : sélection + bouton "Modifier" dans le panneau (état 2)
- **Supprimer** : sélection + bouton "Supprimer" (état 2)
- **Créer un lien** : tirer depuis un point d'ancrage vers un autre nœud (lien `croise` par défaut)
- **Changer le type d'un lien** : clic sur le lien → panneau bascule état 3
- **Enregistrer** : bouton "Enregistrer" → localStorage (JSON versionné)
- **Exporter JSON** : bouton "JSON" → viewer + téléchargement du fichier

### Format de persistance JSON

```json
{
  "nodes": [
    {
      "id": "n1",
      "type": "expertiseNode",
      "position": { "x": 400, "y": 220 },
      "data": {
        "label": "Migration pour le travail",
        "nodeType": "main",
        "description": "..."
      }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "n1",
      "target": "n2",
      "type": "relationEdge",
      "data": { "relationType": "terrain_geo" }
    }
  ],
  "meta": {
    "version": 2,
    "lastUpdated": "2026-05-26",
    "promptHistory": ["Je suis spécialiste de..."]
  }
}
```

Le fichier JSON **s'enrichit au fil des itérations** : chaque génération depuis un nouveau prompt incrémente `version` et ajoute le prompt à `promptHistory`.

### Données d'exemple (graphe par défaut)

Exemple inspiré d'un profil en sciences sociales :
- Nœud principal : **Migration pour le travail**
- Terrains : Sri Lanka — Moyen-Orient · 2005 — aujourd'hui
- Expertise secondaire : Politiques migratoires
- Concepts : Genre et migration · Identités en migration · Valeur du travail
- Relations : terrain géographique · terrain temporel · approfondit · croise · a conduit à · s'articule avec

---

## Vue 2 — Vue à plat (à développer)

### Principe

Chaque nœud de type "expertise principale" ou "expertise secondaire" devient une entrée dans une liste structurée. À chaque expertise sont associées :
- ses terrains de recherche (nœuds `terrain` connectés)
- ses activités de recherche (publications, projets, encadrements issus de la rubrique Activités)
- ses dates (déduites du terrain temporel ou saisies manuellement)

### Référence de design

L'ancienne maquette Figma/Vite (`maquettes/SVP/`) contient une vue plate à explorer pour le design de référence. Elle doit être adaptée au vocabulaire simplifié ("Auteur identifié" plutôt que "AureHAL", etc.).

### Implémentation

**Fichiers :** `components/FlatView/FlatView.tsx` · `components/FlatView/ExpertiseFlatCard.tsx`

**Fonctionnement :** lit le graphe depuis `localStorage` (clé `expertise-graph-v1`), traverse les arêtes pour chaque nœud expertise (main/secondary), construit des `ExpertiseEntry` avec terrains, concepts et relations classés par catégorie.

**Associations activités :** stockées séparément en `localStorage` (clé `expertise-activities-v1`), modifiables via un dialog avec liste à cocher. Pré-associées pour la démo : n1 → ANR + thèse, n3 → conférence + éditorial.

**Navigation :** un bouton "Modifier le graphe →" et le bouton "Ajouter dans la carte mentale" basculent vers l'onglet Carte mentale via le prop `onGoToMindMap`.

**À venir :** filtres par type/terrain/période, tri, recherche plein texte.

---

## Vue 3 — Cartes impact (à développer)

### Principe

Le chercheur décline ses expertises en **cartes contextualisées selon le public** auquel il s'adresse. Une expertise principale devient une "Famille" dont découlent N cartes pour différentes audiences.

### Types de profils (issus du prototype `expertises/mes-cartes-impact---dashboard-chercheur.zip`)

| Profil | Cible | Couleur |
|---|---|---|
| RECHERCHE | Chercheurs | Jaune |
| INNOVATION | Industriels | Violet |
| MEDIA | Journalistes | Vert |
| VULGARISATION | Grand Public | Bleu |

### Structure d'une carte impact

- **Famille** : nœud d'expertise source (ex : "Sécurité Alimentaire en Afrique")
- **Titre** : formulation adaptée à l'audience (ex : "Analyse des sols sahéliens" pour chercheurs vs "Impact du changement climatique" pour grand public)
- **Description** : texte vulgarisé selon le profil
- **Niveau de spécialisation** : 1–10 (jauge)
- **Audiences cibles** : liste libre
- **Spécifiques** : champs libres (terrain, langue, framework, TRL…)
- **Statut** : Validée · À valider · Personnalisée
- **Visibilité** : Publique / Privée

### Génération depuis le graphe

Un bouton "Générer les cartes impact depuis ce graphe" (dans la carte mentale) appellera un LLM pour proposer automatiquement une carte par profil pour chaque nœud d'expertise principale — que le chercheur pourra accepter, modifier ou rejeter.

### Implémentation

**Fichiers :**
- `components/ImpactCards/impactCardsTypes.ts` — types, constantes, données mock (6 cartes, 2 familles)
- `components/ImpactCards/ImpactCard.tsx` — carte portrait 260×390px (header coloré, pattern, icon, jauge spécialisation, audiences, footer)
- `components/ImpactCards/CardDetailDialog.tsx` — Dialog MUI avec 3 onglets (Contenu, Spécificités, Métadonnées) + actions Dupliquer/Archiver
- `components/ImpactCards/CreateCardWizard.tsx` — Wizard 3 étapes : (1) Profil + Famille, (2) Titre + Description, (3) Audiences + Spécifiques
- `components/ImpactCards/ImpactCardsView.tsx` — Vue orchestratrice : KPI, sous-onglets (Toutes/À valider/Personnalisées/Privées), sections par famille + profil

**Fonctionnement :**
- Persistence en `localStorage` (clé `expertise-cards-v1`)
- Familles calées sur les nœuds du graphe (`nodeId` → `n1`, `n3`)
- Sous-onglets filtrent les cartes par statut/visibilité
- Bouton "Générer depuis le graphe" présent mais désactivé (future intégration LLM)

**À venir :**
- [ ] Bouton "Générer depuis le graphe" (intégration LLM)
- [ ] Synchronisation dynamique des familles depuis le graphe localStorage

---

## Fichiers techniques

| Fichier | Rôle |
|---|---|
| `src/app/[lang]/expertise/page.tsx` | Page principale avec les 3 onglets |
| `src/app/[lang]/expertise/layout.tsx` | Layout standard (MainLayout) |
| `src/app/[lang]/expertise/types.ts` | Types TypeScript + constantes (NODE_TYPE_CONFIG, RELATION_TYPES, INITIAL_GRAPH) |
| `src/app/[lang]/expertise/components/MindMap/MindMapView.tsx` | Canvas React Flow complet |
| `src/app/[lang]/expertise/components/MindMap/ExpertiseNode.tsx` | Nœud personnalisé MUI |
| `src/app/[lang]/expertise/components/MindMap/RelationEdge.tsx` | Arête personnalisée avec label coloré |
| `src/app/[lang]/expertise/components/MindMap/mockLlm.ts` | Simulation LLM (analyse de mots-clés → graphe) |
| `src/app/[lang]/expertise/components/ImpactCards/impactCardsTypes.ts` | Types + constantes + données mock cartes impact |
| `src/app/[lang]/expertise/components/ImpactCards/ImpactCard.tsx` | Carte portrait 260×390px |
| `src/app/[lang]/expertise/components/ImpactCards/CardDetailDialog.tsx` | Dialog édition (3 onglets) |
| `src/app/[lang]/expertise/components/ImpactCards/CreateCardWizard.tsx` | Wizard création (3 étapes) |
| `src/app/[lang]/expertise/components/ImpactCards/ImpactCardsView.tsx` | Vue principale cartes impact |

### Dépendances ajoutées

- `@xyflow/react` (React Flow v12) — canvas interactif

### Points de vigilance

- React Flow nécessite `ssr: false` avec `next/dynamic` (utilise `window`)
- Le CSS de React Flow (`@xyflow/react/dist/style.css`) doit être importé dans le composant client, pas dans un layout server
- `expertises/` est exclu du `tsconfig.json` (contient des archives de prototypes avec des dépendances non installées)
- La persistance est en `localStorage` pour la maquette — en production, ce sera un endpoint API

---

## Questions ouvertes pour les prochaines itérations

1. **Visibilité du graphe** : le graphe est-il visible publiquement (profil chercheur) ou uniquement en mode édition ?
2. **Couplage activités ↔ expertises** : un clic sur un nœud d'expertise affiche-t-il les publications associées ? Comment associer automatiquement une publication à un nœud ?
3. **Collaboration** : plusieurs chercheurs d'un même labo peuvent-ils co-construire un graphe commun ?
4. **Export** : en plus du JSON, faut-il un export vers un format standard (SKOS, RDF) pour interopérabilité avec des référentiels de compétences ?
5. **Génération LLM** : quel modèle ? Données envoyées au LLM (prompt seul, ou prompt + publications HAL du chercheur pour plus de pertinence) ?
