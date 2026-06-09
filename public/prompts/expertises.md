# Expertises — Spécifications fonctionnelles

> **Statut des items**
> - ✅ Validé / implémenté dans la maquette
> - 🟡 Proposition (à valider)
> - ❓ Question ouverte

---

## 1. Contexte

La rubrique **Expertises** permet au chercheur de représenter, structurer et communiquer ses domaines d'expertise selon trois angles complémentaires. Elle n'a pas d'équivalent direct dans les SI Recherche existants.

**Architecture retenue — Option A (source de vérité unique) :**

```
Carte mentale (graphe React Flow — source de vérité)
    │
    ├── Profil structuré : chaque nœud expertise → fiche avec caractéristiques
    └── Fiches publics   : chaque nœud expertise → carte déclinée par audience
```

✅ La carte mentale est la source de vérité. Les deux autres vues sont des projections de ses nœuds.

---

## 2. Position dans le parcours

```
Sidebar
  └── Expertises
        ├── Mes domaines      ◄── Carte mentale (actif par défaut)
        ├── Profil structuré  ◄── Vue à plat (chip "depuis vos domaines")
        └── Fiches publics    ◄── Cartes impact (chip "depuis vos domaines")
```

---

## 3. Mes domaines — Carte mentale

### 3.1 Principe

✅ Le chercheur décrit ses expertises en langage naturel. Un LLM (simulé dans la maquette) traduit ce texte en graphe que le chercheur peut ensuite modifier manuellement.

✅ Le graphe est persisté en JSON versionné (`localStorage` dans la maquette, clé `expertise-graph-v2`, API en production).

### 3.2 Modèle de données — Nœuds

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

### 3.3 Modèle de données — Relations

**Relations libres** — pas de liste fixe de types, la typologie émergera des ateliers.

| Propriété | Valeurs | Rendu |
|---|---|---|
| `direction` | `forward` (A→B) · `backward` (A←B) · `bidirectional` (A↔B) | Flèche(s) sur l'arête |
| `label` | Texte libre saisi par le chercheur | Étiquette sur l'arête |

✅ **Relation qualifiée** (label renseigné) : trait teal continu.

✅ **Relation non qualifiée** (label vide) : trait gris pointillé avec l'invite *"qualifier →"* — invitation visible à nommer la relation.

### 3.4 Interactions — nœuds

✅ **Générer depuis un prompt** : champ texte libre → "Générer le graphe" → simulation LLM (1,8 s) → graphe pré-rempli avec attributs. Chaque génération incrémente la version et conserve l'historique des prompts.

✅ **Empty state onboarding** : quand le graphe est vide, le canvas est remplacé par une carte centrée (textarea autofocus, 4 chips de profils exemples, Ctrl+Entrée pour générer).

✅ **Ajouter une expertise** : bouton dans le panneau gauche → dialog (intitulé, description).

✅ **Modifier une expertise** : sélection + "Modifier" → dialog pré-rempli.

✅ **Supprimer** : sélection + "Supprimer" (sélection multiple supportée).

✅ **Déployer les caractéristiques dans le graphe** : chaque nœud ayant des attributs affiche un bouton chevron (▼/▲). Clic → le nœud s'agrandit et affiche les chips par catégorie, directement dans le canvas. L'état replié/déployé est persisté.

✅ **Éditer les caractéristiques depuis le panneau** : clic sur un nœud → panneau gauche affiche la section "Caractéristiques" avec un bouton "+" par catégorie → formulaire inline (label + sélecteur de vocabulaire pour les concepts) → chips supprimables.

### 3.5 Interactions — relations

✅ **Créer un lien** : tirer depuis un point d'ancrage d'un nœud vers un autre (direction `forward` par défaut, label vide).

✅ **Qualifier un lien** : clic sur le lien → panneau gauche bascule en mode édition de relation :
  - Sélecteur de direction : `A → B` · `A ← B` · `A ↔ B`
  - Champ texte libre "Qualifier la relation" (placeholder : *influence, prolonge, critique, s'appuie sur…*)
  - Si vide : avertissement discret "relation non qualifiée"

✅ **Supprimer un lien** : sélectionner + "Supprimer ce lien".

### 3.6 Interactions — canvas

✅ **Enregistrer** : bouton → `localStorage`.

✅ **Exporter JSON** : bouton "JSON" → viewer + téléchargement.

✅ **Réinitialiser** : icône `RestartAlt` → revient à l'empty state.

✅ **Panneau gauche rétractable** (persistent sur desktop, overlay sur mobile).

### 3.7 Questions ouvertes

❓ **Qualification des relations** : faut-il proposer des suggestions de labels selon le contexte (discipline, type de nœuds connectés) pour aider les chercheurs à trouver les bons termes ?

❓ **Vocabulaires contrôlés** : les concepts avec `vocabulary = 'rameau'` devraient-ils bénéficier d'une autocomplete sur le référentiel RAMEAU (via IdRef/BnF) ?

❓ **Visibilité du graphe** : est-il visible publiquement sur le profil chercheur, ou uniquement en mode édition ?

❓ **Co-construction** : peut-on co-construire un graphe à plusieurs (chercheurs d'un même labo) ?

❓ **Export sémantique** : export vers SKOS/RDF pour interopérabilité avec des référentiels de compétences ?

❓ **Génération LLM** : prompt seul, ou prompt + publications HAL pour plus de pertinence ?

---

## 4. Profil structuré (vue à plat)

### 4.1 Principe

✅ Chaque nœud du graphe devient une fiche structurée. Les caractéristiques portées par le nœud (temporal, geographic, persons, organizations, concepts) sont projetées en chips colorés.

✅ Bannière en haut : version du graphe, date de mise à jour, lien "Modifier le graphe →".

### 4.2 Anatomie d'une fiche expertise

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

✅ Si aucun élément rattaché : lien "Enrichir dans la carte →".

### 4.3 Questions ouvertes

❓ **Filtres / tri** sur la liste (par lieu, par période, par mot-clé) ?

❓ **Couplage activités ↔ expertises** : association automatique depuis les mots-clés des publications HAL ?

---

## 5. Fiches publics (cartes impact)

### 5.1 Principe

✅ Le chercheur décline chaque expertise en **cartes contextualisées selon le public** auquel il s'adresse. Un nœud d'expertise devient une "Famille" dont découlent N cartes pour différentes audiences.

✅ Les cartes sont persistées en `localStorage` (clé `expertise-cards-v1`).

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

✅ **Spécifiques** : champs libres clé/valeur (Terrain, Langue, Méthode, Framework, TRL…)

✅ **Statut** : Validée · À valider · Personnalisée

✅ **Visibilité** : Publique / Privée

### 5.4 Interface

✅ **KPI** en haut : cartes validées / à valider / publiques.

✅ **Sous-onglets** : Toutes · À valider · Personnalisées · Privées.

✅ **Organisation** : sections par Famille, puis par Profil.

✅ **Cliquer sur une carte** → dialog en 3 onglets : Contenu · Spécificités · Métadonnées. Actions : Dupliquer, Archiver.

✅ **Créer une carte** : wizard 3 étapes — (1) Profil + Famille, (2) Titre + Description + Spécialisation, (3) Audiences + Spécifiques.

🟡 **Générer depuis le graphe** : bouton présent (désactivé). À terme, un LLM proposera automatiquement une carte par profil pour chaque nœud d'expertise.

### 5.5 Questions ouvertes

❓ **Génération LLM** : quel workflow de validation (modale de revue, diffing, acceptation en lot) ?

❓ **Partage** : une carte peut-elle être partagée avec un collègue ou exportée (PDF, carte de visite numérique) ?

❓ **Visibilité publique** : les cartes "Publiques" apparaissent-elles sur le profil chercheur consulté par des tiers ?

❓ **Archivage vs suppression** : une carte archivée est-elle récupérable ? Y a-t-il un onglet "Archives" ?

---

## 6. Questions transversales

| # | Thème | Question |
|---|-------|----------|
| 1 | Source de vérité | Si le chercheur supprime un nœud du graphe, les cartes impact liées à cette famille sont-elles archivées ou orphelines ? |
| 2 | Synchronisation | Le profil structuré et les cartes se mettent-ils à jour en temps réel quand le graphe change, ou seulement à la prochaine visite ? |
| 3 | Collaboration | Plusieurs chercheurs peuvent-ils co-éditer un graphe ou des cartes ? |
| 4 | Import | Peut-on importer un graphe existant (JSON ou référentiel externe) ? |
| 5 | Export | Export du graphe en SKOS/RDF ? Export des cartes en PDF ou format structuré ? |
| 6 | Visibilité | Chaque vue (graphe, liste, cartes) a-t-elle sa propre politique de visibilité, ou est-ce une visibilité globale par expertise ? |
| 7 | Qualification des relations | Comment aider les chercheurs à trouver les bons labels sans imposer une liste fixe ? Suggestions contextuelles ? Historique personnel ? |
