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
    ├── Vue des expertises : chaque nœud principal → fiche structurée
    └── Cartes impact : chaque nœud principal → "Famille" déclinée en N cartes
```

✅ La carte mentale est la source de vérité. Les deux autres vues sont des projections de ses nœuds.

❓ **Un chercheur peut-il enrichir la vue à plat ou les cartes impact sans passer par la carte mentale ?** (ex. ajouter un terrain directement dans la fiche)

---

## 2. Position dans le parcours

```
Sidebar
  └── Expertises
        ├── Vue des expertises   ◄── Vue 1
        ├── Carte mentale        ◄── Vue 2 (actif par défaut)
        └── Cartes impact        ◄── Vue 3
```

---

## 3. Vue 1 — Carte mentale

### 3.1 Principe

✅ Le chercheur décrit ses expertises en langage naturel. Un LLM (simulé dans la maquette) traduit ce texte en graphe que le chercheur peut ensuite modifier manuellement.

✅ Le graphe est persisté en JSON versionné (`localStorage` dans la maquette, API en production).

### 3.2 Types de nœuds

| Type | Couleur | Rôle |
|---|---|---|
| Expertise principale | Teal `#006A61` | Domaine central de recherche |
| Expertise secondaire | Bleu `#1976D2` | Domaine connexe ou spécialisation |
| Terrain de recherche | Orange `#E65100` | Zone géographique, période, corpus… |
| Concept transversal | Violet `#7B1FA2` | Notion théorique ou thématique |

### 3.3 Types de relations (14, en 4 catégories)

**Hiérarchie** (trait plein teal) : `approfondit` · `spécialise` · `intègre`

**Terrain** (tirets oranges animés) : `terrain géographique` · `terrain temporel` · `cas d'étude` · `corpus`

**Conceptuel** (pointillés violets) : `mobilise` · `problématise` · `produit des connaissances sur`

**Dialogue** (pointillés bleus / rouge pour tensions) : `croise` · `s'articule avec` · `a conduit à` · `en tension avec`

### 3.4 Interactions

✅ **Générer depuis un prompt** : champ texte libre → bouton "Générer le graphe" → simulation LLM (1,8 s) → graphe pré-rempli. Chaque génération incrémente la version et conserve l'historique des prompts.

✅ **Ajouter un nœud** : bouton dans le panneau gauche → dialog (intitulé, type, description).

✅ **Modifier un nœud** : sélection + bouton "Modifier" dans le panneau.

✅ **Supprimer un nœud** : sélection + bouton "Supprimer".

✅ **Créer un lien** : tirer depuis un point d'ancrage d'un nœud vers un autre nœud (type `croise` par défaut).

✅ **Modifier le type d'un lien** : clic sur le lien → panneau gauche bascule en mode "édition de relation" avec sélecteur visuel par catégorie (prévisualisation du style de trait).

✅ **Supprimer un lien** : sélectionner + bouton "Supprimer ce lien" dans le panneau.

✅ **Enregistrer** : bouton → `localStorage` (JSON versionné).

✅ **Exporter JSON** : bouton "JSON" → viewer + téléchargement.

### 3.5 Questions ouvertes

❓ Le graphe est-il visible publiquement sur le profil chercheur, ou uniquement en mode édition ?

❓ Peut-on co-construire un graphe à plusieurs (chercheurs d'un même labo) ?

❓ Export vers un format standard (SKOS, RDF) pour interopérabilité avec des référentiels de compétences ?

❓ Génération LLM : quel modèle ? Prompt seul, ou prompt + publications HAL pour plus de pertinence ?

---

## 4. Vue 2 — Vue des expertises (vue à plat)

### 4.1 Principe

✅ Chaque nœud de type "expertise principale" ou "expertise secondaire" devient une fiche structurée. Les nœuds terrain, concept et les relations du graphe sont projetés dans des sections dédiées.

✅ Les expertises principales s'affichent avant les secondaires.

### 4.2 Anatomie d'une fiche expertise

```
┌─────────────────────────────────────────────────────┐
│ [Bordure colorée gauche selon type]                  │
│ Intitulé de l'expertise          [chip type]         │
│ Description (si présente dans le graphe)             │
│                                                      │
│ Terrains : [chip] [chip] …                          │
│ Concepts : [chip] [chip] …                          │
│ Relie à : [chip expertise liée + type de relation]  │
│                                                      │
│ Activités associées : [puce] ANR … [puce] Thèse …  │
│                             [Modifier les activités] │
└─────────────────────────────────────────────────────┘
```

✅ **Association d'activités** : bouton "Modifier les activités" → dialog avec liste à cocher des activités de recherche (projets, encadrements, brevets…).

✅ Bannière en haut : lien "Modifier le graphe →" vers l'onglet Carte mentale ; version et date de dernière mise à jour.

✅ Bouton "Ajouter dans la carte mentale" → bascule vers l'onglet Carte mentale.

### 4.3 Questions ouvertes

❓ **Filtres / tri / recherche** sur la vue à plat (par type, par terrain, par période) ?

❓ **Dates** : déduites du terrain temporel, ou saisies manuellement sur la fiche ?

❓ **Couplage activités ↔ expertises** : association automatique d'une publication à un nœud d'expertise (par mots-clés ou par discipline) ?

---

## 5. Vue 3 — Cartes impact

### 5.1 Principe

✅ Le chercheur décline chaque expertise en **cartes contextualisées selon le public** auquel il s'adresse. Un nœud d'expertise principale devient une "Famille" dont découlent N cartes pour différentes audiences.

✅ Les cartes sont persistées en `localStorage` (clé `expertise-cards-v1`).

### 5.2 Profils d'audience

| Profil | Cible | Couleur |
|---|---|---|
| Recherche | Chercheurs | Ambre |
| Innovation | Industriels | Violet |
| Média | Journalistes | Vert |
| Vulgarisation | Grand Public | Bleu |

### 5.3 Structure d'une carte impact

✅ **Famille** : nœud d'expertise source (ex. "Migration pour le travail")

✅ **Titre** : formulé pour l'audience cible

✅ **Description** : texte adapté au profil

✅ **Niveau de spécialisation** : 1 (grand public) → 10 (très spécialisé), affiché en jauge

✅ **Audiences cibles** : liste (Chercheurs, Industriels, Journalistes, Grand Public, Scolaires…)

✅ **Spécifiques** : champs libres clé/valeur (Terrain, Langue, Méthode, Framework, TRL…)

✅ **Statut** : Validée · À valider · Personnalisée

✅ **Visibilité** : Publique / Privée

### 5.4 Interface

✅ **KPI** en haut : nombre de cartes validées / à valider / publiques.

✅ **Sous-onglets** : Toutes · À valider · Personnalisées · Privées.

✅ **Organisation** : sections par Famille (nœud source), puis par Profil d'audience.

✅ **Cliquer sur une carte** → dialog d'édition en 3 onglets : Contenu · Spécificités · Métadonnées. Actions : Dupliquer, Archiver.

✅ **Créer une carte** : wizard 3 étapes — (1) Profil + Famille, (2) Titre + Description + Spécialisation, (3) Audiences + Spécifiques.

✅ **Dupliquer** : crée une copie en statut "À valider" + visibilité "Privée".

✅ **Archiver** : retire la carte de la vue (suppression dans la maquette).

🟡 **Générer depuis le graphe** : bouton présent (désactivé). À terme, un LLM proposera automatiquement une carte par profil pour chaque nœud d'expertise principale.

### 5.5 Questions ouvertes

❓ **Génération LLM** : le chercheur valide/rejette/modifie chaque carte proposée — quel workflow exact (modale de revue, diffing, acceptation en lot) ?

❓ **Partage** : une carte peut-elle être partagée avec un collègue ou exportée (PDF, carte de visite numérique) ?

❓ **Visibilité publique** : les cartes "Publiques" apparaissent-elles sur le profil chercheur SoVisu+ tel qu'il est consulté par des tiers ?

❓ **Archivage vs suppression** : une carte archivée est-elle récupérable ? Y a-t-il un onglet "Archives" ?

❓ **Limite de cartes** par famille/profil : une seule carte par profil, ou plusieurs déclinaisons possibles ?

---

## 6. Questions transversales

| # | Thème | Question |
|---|-------|----------|
| 1 | Source de vérité | Si le chercheur supprime un nœud du graphe, les cartes impact liées à cette famille sont-elles archivées ou orphelines ? |
| 2 | Synchronisation | La vue à plat et les cartes impact se mettent-elles à jour en temps réel quand le graphe change, ou seulement à la prochaine visite ? |
| 3 | Collaboration | Plusieurs chercheurs peuvent-ils co-éditer un graphe ou des cartes impact ? |
| 4 | Import | Peut-on importer un graphe existant (depuis un fichier JSON ou un référentiel externe) ? |
| 5 | Export | Export du graphe en SKOS/RDF ? Export des cartes en PDF ou format structuré ? |
| 6 | Visibilité | Chaque vue (graphe, liste, cartes) a-t-elle sa propre politique de visibilité, ou est-ce une visibilité globale par expertise ? |
