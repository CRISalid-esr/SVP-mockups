# Expertises — Spécifications fonctionnelles

> **Statut des items**
> - ✅ Validé / implémenté dans la maquette
> - 🟡 Proposition (à valider)
> - ❓ Question ouverte

---

## 1. Contexte

La rubrique **Expertises** distingue deux objets de nature différente :

- **Les thèmes de recherche** — la matière première que le chercheur saisit (à la main, par prompt ou depuis ses publications). Un seul point d'entrée : la **vue liste** (défaut). Une vue avancée optionnelle, **Relations**, permet de structurer les liens entre thèmes déjà définis, sans proposer de génération.
- **Les expertises** — le livrable : des fiches déclinées par public (Recherche, Innovation, Média, Vulgarisation), générées à partir des thèmes puis validées par le chercheur.

**Architecture — le graphe reste la source de vérité unique :**

```
Graphe de thèmes (React Flow — source de vérité)
    │
    ├── Vue liste (défaut)      : point d'entrée unique — génération, thèmes, caractéristiques
    ├── Vue Relations (avancé)  : édition des liens entre thèmes existants (pas de génération)
    └── Expertises              : chaque nœud thème → famille de fiches par public
```

---

## 2. Position dans le parcours

```
Sidebar
  └── Expertises                    [switcher Chercheur / Laboratoire dans l'en-tête]
        ├── Thèmes de recherche     ◄── toggle Liste (défaut) / Relations (avancé)
        └── Expertises              ◄── fiches par public (chip "générées depuis vos thèmes")
```

✅ **Parcours en 3 étapes** matérialisé par un mini-stepper sous les onglets :
`① Définir mes thèmes → ② Générer mes expertises → ③ Publier` — chaque étape affiche
son compteur (N thèmes, N fiches, N publiques), coche verte quand l'étape est franchie,
clic = navigation vers l'onglet correspondant.

✅ **La vue Liste est l'unique point d'entrée du parcours** — génération (prompt IA et/ou
publications), ajout manuel, caractéristiques : tout se passe dans la vue Liste, y compris
à vide (voir §3). La vue Relations (avancé, voir §4) ne sert qu'à structurer les liens entre
thèmes déjà définis ; elle n'est accessible que si au moins un thème existe et ne propose
plus de génération.

✅ **Après une génération IA**, la vue Liste affiche une bannière de revue (« passez vos
thèmes en revue, puis générez vos fiches expertises ») ; un encart « Étape suivante » en
bas de liste mène à l'onglet Expertises.

✅ **Perspective Laboratoire** (voir § 6) : la même page, déclinée à l'échelle du labo,
agrège en lecture seule les thèmes et les fiches publiées des membres.

---

## 3. Thèmes de recherche — Vue liste (défaut)

### 3.1 Principe

✅ Point d'entrée unique du step « Thèmes de recherche » (le toggle Liste (défaut) /
Relations (avancé) est un segmented control en haut à droite — la vue Relations est
optionnelle, voir §4). Chaque nœud du graphe devient une fiche structurée. Les
caractéristiques portées par le nœud (temporal, geographic, persons, organizations,
concepts) sont projetées en chips colorés.

✅ Bannière en haut : version du graphe, date de mise à jour, lien "Voir les relations →"
vers la vue Relations (avancé). Après une génération IA, elle est remplacée par la bannière
de revue (verte).

✅ Encart « Étape suivante : vos expertises » en bas de liste → onglet Expertises.

### 3.2 Génération

✅ **Composant partagé `GenerationPanel.tsx`**, seul point d'entrée de la génération IA (la
vue Relations n'en propose plus) :
  - Bloc **publications** : badge du nombre sélectionné, "Sélectionner des publications →"
    (navigue vers `/documents?perspective=…`), "Générer mes thèmes de recherche" /
    "Recalculer à partir des publications" selon qu'il existe déjà des thèmes.
  - Séparateur "ou" + bloc **prompt** : textarea (+ 4 chips de profils exemples en grand
    format) → "Générer le graphe". Simulation LLM ~1,8 s, chaque génération incrémente la
    version et alimente l'historique des prompts.
  - Les deux blocs sont toujours affichés ensemble — plus de bascule "ou → décrire
    manuellement".

✅ **Quand le graphe est vide** (`entries.length === 0`) : `GenerationPanel` s'affiche en
grand (`variant="empty"`), carte centrée à la place de la grille de thèmes.

✅ **Une fois des thèmes définis** : `GenerationPanel` reste accessible, replié par défaut
dans un accordéon "Ajuster le périmètre ou régénérer des thèmes" (`variant="inline"`)
au-dessus de la grille — pour ajuster le scope de publications ou relancer une génération
sans quitter la liste.

### 3.3 Gestion des thèmes

✅ **Ajouter un thème** : bouton principal de la vue → modale complète (intitulé, description,
caractéristiques avec les mêmes widgets d'affinage que la vue Relations : slider / périodes
nommées, GeoNames, IdRef, vocabulaires — composant partagé `AttributesEditor`).

✅ **Modifier / supprimer un thème** : menu ⋮ sur chaque carte → même modale (mode édition) /
confirmation de suppression.

✅ **Expertises liées** : chaque carte de thème liste les fiches expertises qui en dérivent
(icône + chip du public + titre, mention « à valider » le cas échéant) — symétrique du lien
fiche → thème affiché dans l'onglet Expertises. Clic sur une fiche ou « Voir l'onglet → » →
onglet Expertises. Si aucune fiche : CTA « Générer mes expertises → ».

### 3.4 Anatomie d'une fiche expertise

```
┌─────────────────────────────────────────────────────┐
│ [Bordure teal gauche]                                │
│ Intitulé de l'expertise                              │
│ Description (si présente)                            │
│                                                      │
│ Caractéristiques                                     │
│   📅 2005 — aujourd'hui                              │
│   📍 Sri Lanka · Union européenne                    │
│   🏷 migration du travail · RAMEAU                   │
│      mobilité internationale                         │
│                                                      │
│ Relations avec d'autres expertises                   │
│   → approfondit   Politiques migratoires             │
│   ↔ croise        Genre et migration                 │
│                                                      │
│ Activités associées : [ANR …] [Thèse …]  [Associer] │
└─────────────────────────────────────────────────────┘
```

✅ **Association d'activités** : bouton "Associer" → dialog avec liste à cocher des activités de recherche.

✅ Si aucun élément rattaché : lien « Ajouter des caractéristiques → » (ouvre le dialog
d'édition du thème) + lien secondaire discret « Relier à un autre thème (avancé) » vers la
vue Relations, réservé à la création de liens entre thèmes.

### 3.5 Questions ouvertes

❓ **Filtres / tri** sur la liste (par lieu, par période, par mot-clé) ?

❓ **Couplage activités ↔ expertises** : association automatique depuis les mots-clés des publications HAL ?

❓ **Génération LLM** : faut-il combiner prompt et publications HAL dans une même requête plutôt que deux entrées parallèles, pour plus de pertinence ?

---

## 4. Thèmes de recherche — Vue Relations (avancé)

### 4.1 Principe

✅ Vue avancée et optionnelle : elle sert uniquement à structurer les **liens entre thèmes
déjà définis**. Elle n'est accessible que si au moins un thème existe (sinon la page reste
sur la vue Liste), et ne propose plus de génération ni de saisie de prompt — ces actions
vivent exclusivement dans la vue Liste (§3). Le panneau gauche, quand rien n'est
sélectionné, rappelle la provenance des thèmes (dernier prompt) et propose un lien
« Modifier mes thèmes → » vers la liste.

✅ Le graphe est persisté en JSON versionné (`localStorage` dans la maquette, clé `expertise-graph-v2`, API en production).

### 4.2 Modèle de données — Nœuds

**Un seul type de nœud : Expertise** (teal `#006A61`)

Chaque nœud porte, en plus de son intitulé et de sa description, des **caractéristiques** organisées en 5 catégories :

| Catégorie | Icône | Couleur | Contenu |
|---|---|---|---|
| Couverture temporelle | Calendrier | Bleu `#0288D1` | Périodes, dates (texte libre) |
| Lieux | Localisation | Vert `#388E3C` | Zones géographiques, pays, régions |
| Personnes | Personne | Violet `#7B1FA2` | Auteurs de référence, collaborateurs |
| Organisations | Bâtiment | Orange `#E65100` | Institutions, laboratoires, organismes |
| Concepts et mots-clés | Étiquette | Teal `#006A61` | Mots-clés avec vocabulaire contrôlé optionnel |

**Vocabulaires contrôlés disponibles pour les concepts :** RAMEAU · MeSH · Wikidata · JEL (Économie) · AMS (Mathématiques) · MSC (Sciences) · LCSH (Library of Congress) · Vocabulaire libre

### 4.3 Modèle de données — Relations

**Relations libres** — pas de liste fixe de types, la typologie émergera des ateliers.

| Propriété | Valeurs | Rendu |
|---|---|---|
| `direction` | `forward` (A→B) · `backward` (A←B) · `bidirectional` (A↔B) | Flèche(s) sur l'arête |
| `label` | Texte libre saisi par le chercheur | Étiquette sur l'arête |

✅ **Relation qualifiée** (label renseigné) : trait teal continu.

✅ **Relation non qualifiée** (label vide) : trait gris pointillé avec l'invite *"qualifier →"* — invitation visible à nommer la relation.

### 4.4 Interactions — nœuds

✅ **Ajouter un thème** : bouton mis en avant dans la barre d'outils du canvas (+ panneau gauche) → dialog (intitulé, description).

✅ **Modifier un thème** : sélection + "Modifier" → dialog pré-rempli.

✅ **Supprimer** : sélection + "Supprimer" (sélection multiple supportée). Si tous les
thèmes sont supprimés pendant qu'on est dans cette vue, un état de repli s'affiche
(« Plus aucun thème » + bouton « Retour à la vue Liste »).

✅ **Déployer les caractéristiques dans le graphe** : chaque nœud ayant des attributs affiche un bouton chevron (▼/▲). Clic → le nœud s'agrandit et affiche les chips par catégorie, directement dans le canvas. L'état replié/déployé est persisté.

✅ **Éditer les caractéristiques depuis le panneau** : clic sur un nœud → panneau gauche affiche la section "Caractéristiques" avec un bouton "+" par catégorie → formulaire inline (label + sélecteur de vocabulaire pour les concepts) → chips supprimables.

### 4.5 Interactions — relations

✅ **Créer un lien** : tirer depuis un point d'ancrage d'un nœud vers un autre (direction `forward` par défaut, label vide).

✅ **Qualifier un lien** : clic sur le lien → panneau gauche bascule en mode édition de relation :
  - Sélecteur de direction : `A → B` · `A ← B` · `A ↔ B`
  - Champ texte libre "Qualifier la relation" (placeholder : *influence, prolonge, critique, s'appuie sur…*)
  - Si vide : avertissement discret "relation non qualifiée"

✅ **Supprimer un lien** : sélectionner + "Supprimer ce lien".

### 4.6 Interactions — canvas

✅ **Enregistrer** : bouton → `localStorage`.

✅ **Exporter JSON** : bouton "JSON" → viewer + téléchargement.

✅ **Réinitialiser** (icône `RestartAlt`, "Restaurer l'exemple de démonstration") : recharge le graphe de démonstration initial. **Vider** (icône `DeleteSweep`, "Vider la carte") : vide le graphe et déclenche l'état de repli décrit en §4.4.

✅ **Panneau gauche rétractable** (persistent sur desktop, overlay sur mobile).

### 4.7 Questions ouvertes

❓ **Qualification des relations** : faut-il proposer des suggestions de labels selon le contexte (discipline, type de nœuds connectés) pour aider les chercheurs à trouver les bons termes ?

❓ **Vocabulaires contrôlés** : les concepts avec `vocabulary = 'rameau'` devraient-ils bénéficier d'une autocomplete sur le référentiel RAMEAU (via IdRef/BnF) ?

❓ **Visibilité du graphe** : est-il visible publiquement sur le profil chercheur, ou uniquement en mode édition ?

❓ **Co-construction** : peut-on co-construire un graphe à plusieurs (chercheurs d'un même labo) ?

❓ **Export sémantique** : export vers SKOS/RDF pour interopérabilité avec des référentiels de compétences ?

---

## 5. Expertises (fiches par public)

### 5.1 Principe

✅ Onglet **Expertises** : le chercheur décline chaque thème de recherche en **fiches contextualisées selon le public** auquel il s'adresse. Un nœud thème devient une "Famille" dont découlent N cartes pour différentes audiences.

✅ Les cartes sont persistées en `localStorage` (clé `expertise-cards-v1`) ; les familles générées le sont aussi (`expertise-families-v1`).

### 5.2 Profils d'audience

| Profil | Cible | Couleur |
|---|---|---|
| Recherche | Chercheurs | Ambre |
| Innovation | Industriels | Violet |
| Média | Journalistes | Vert |
| Vulgarisation | Grand Public | Bleu |

### 5.3 Structure d'une carte impact

✅ **Famille** : nœud d'expertise source

✅ **Titre** : formulé pour l'audience cible

✅ **Description** : texte adapté au profil

✅ **Niveau de spécialisation** : 1 (grand public) → 10 (très spécialisé), affiché en jauge

✅ **Audiences cibles** : liste (Chercheurs, Industriels, Journalistes, Grand Public, Scolaires…)

✅ **Caractéristiques** : héritées du thème de recherche source (couverture temporelle, lieux, personnes, organisations, concepts), modifiables fiche par fiche — mêmes widgets d'affinage que la vue Relations (composant partagé `AttributesEditor`)

✅ **Statut** : Validée · À valider

✅ **Visibilité** : Publique / Privée

### 5.4 Interface

✅ **KPI** en haut : cartes validées / à valider / publiques.

✅ **Sous-onglets** : Toutes · À valider · Privées.

✅ **Organisation** : sections par Famille, puis par Profil.

✅ **Cliquer sur une carte** → dialog en 3 onglets : Contenu · Caractéristiques · Métadonnées. Actions : Dupliquer, Archiver. L'en-tête affiche « Thème de recherche : … ».

✅ **Créer une fiche** : wizard 3 étapes — (1) Public + Thème de recherche, (2) Titre + Description + Spécialisation, (3) Audiences + Caractéristiques (pré-remplies depuis le thème sélectionné, ajustables).

✅ **Générer les fiches** (bouton actif, simulation LLM 1,6 s — `mockCardsLlm.ts`) : pour chaque
thème du graphe, une fiche par public est proposée (statut « À valider », visibilité privée).
Seules les fiches manquantes sont créées — les fiches existantes ne sont jamais écrasées.
Le contenu (titre, description, spécialisation, audiences, spécifiques) est adapté au profil
et réutilise les caractéristiques du nœud (période → Période, lieux → Terrain).

✅ **Flux de revue** : après génération, bascule automatique sur le sous-onglet « À valider »
avec une barre d'action (« N fiches en attente » + bouton **Tout valider**) ; chaque carte
propose « Valider cette fiche » dans son menu ⋮.

### 5.5 Questions ouvertes

❓ **Génération LLM** : faut-il un diffing quand un thème a changé depuis la dernière génération ?

❓ **Partage** : une carte peut-elle être partagée avec un collègue ou exportée (PDF, carte de visite numérique) ?

❓ **Visibilité publique** : les cartes "Publiques" apparaissent-elles sur le profil chercheur consulté par des tiers ?

❓ **Archivage vs suppression** : une carte archivée est-elle récupérable ? Y a-t-il un onglet "Archives" ?

---

## 6. Perspective Laboratoire — « Profil recherche : Labo X »

### 6.1 Principe

✅ Un **switcher Chercheur / Laboratoire** dans l'en-tête de page (même pattern que le tableau
de bord) bascule sur la vue agrégée du labo. Vue en **lecture seule** : les thèmes et les fiches
sont renseignés par chaque membre depuis sa propre page Expertises.

✅ **Regroupement des thèmes entre membres** : par identifiant quand le thème est aligné sur un
vocabulaire contrôlé (RAMEAU, Wikidata), par rapprochement de libellés normalisés sinon.
C'est l'argument donné aux chercheurs pour aligner leurs concepts sur un référentiel.

### 6.2 Contenu

✅ **Bandeau KPI** : membres · membres ayant renseigné leurs thèmes (taux de complétude avec
barre de progression — levier d'adoption pour la direction) · thèmes distincts · fiches publiées.

✅ **Onglet « Thèmes de recherche du labo »** : treemap ECharts (taille + couleur = nombre de
membres par thème), filtre par équipe, clic sur un thème → dialog listant les membres concernés
(avatar, nom, équipe). Chips des thèmes alignés sur un vocabulaire sous le treemap.

✅ **Onglet « Annuaire des expertises »** : fiches publiées de tous les membres, recherche plein
texte + filtres par public (chips colorés). Clic → dialog de détail (membre, description,
spécialisation, audiences). Cible : cellules valorisation / communication (« qui peut parler
de X à un journaliste ? »).

✅ Données de démo : `components/Lab/labMock.ts` — 18 membres, 3 équipes, ~19 thèmes
(chevauchements volontaires pour la démo d'agrégation), 14 fiches publiées.

### 6.3 Questions ouvertes

❓ **Agrégation multi-niveaux** : même vue à l'échelle d'une équipe, d'une fédération, d'un site ?

❓ **Relance** : le directeur peut-il notifier les membres n'ayant pas renseigné leurs thèmes ?

❓ **Carte mentale agrégée** : fusionner les graphes des membres (nœuds partagés) en une carte labo ?

---

## 7. Questions transversales

| # | Thème | Question |
|---|-------|----------|
| 1 | Source de vérité | Si le chercheur supprime un nœud du graphe, les cartes impact liées à cette famille sont-elles archivées ou orphelines ? |
| 2 | Synchronisation | Le profil structuré et les cartes se mettent-ils à jour en temps réel quand le graphe change, ou seulement à la prochaine visite ? |
| 3 | Collaboration | Plusieurs chercheurs peuvent-ils co-éditer un graphe ou des cartes ? |
| 4 | Import | Peut-on importer un graphe existant (JSON ou référentiel externe) ? |
| 5 | Export | Export du graphe en SKOS/RDF ? Export des cartes en PDF ou format structuré ? |
| 6 | Visibilité | Chaque vue (graphe, liste, cartes) a-t-elle sa propre politique de visibilité, ou est-ce une visibilité globale par expertise ? |
| 7 | Qualification des relations | Comment aider les chercheurs à trouver les bons labels sans imposer une liste fixe ? Suggestions contextuelles ? Historique personnel ? |
