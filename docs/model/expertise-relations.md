# Modèle de données — Expertises de recherche

> **Document de référence** — version 1.0 · mai 2026  
> Toute proposition de modification passe par une [GitHub Discussion](https://github.com/CRISalid-esr/SVP-mockups/discussions) ou une Issue avec le template prévu à cet effet.

---

## 1. Trois perspectives d'expertise, trois modèles

La notion d'« expertise » recouvre des réalités très différentes selon le contexte dans lequel on l'utilise. Avant de discuter des types de relations, il est important de situer ce que SoVisu+ modélise — et ce qu'il ne modélise pas (encore).

| Perspective | Se définit par | Structure naturelle | Couverture SoVisu+ |
|---|---|---|---|
| **RH / formation** | Diplôme, certification, habilitation | Liste plate + document preuve | Hors scope (profil RH) |
| **Fonctionnelle / outil** | Maîtrise d'un logiciel, d'une méthode, d'une langue | Liste + niveau de maîtrise | Hors scope (CV structuré) |
| **Recherche** | Domaines de recherche, leurs relations et leur ancrage empirique | **Graphe sémantique** | ✅ Ce document |

Les deux premières perspectives correspondent à l'entité `Expertise_and_Skills` + `Expertise_and_Skills_Possession` de [CERIF-Core](https://github.com/EuroCRIS/CERIF-Core). La troisième — celle du graphe — est une extension nécessaire que CERIF-Core ne couvre pas nativement (ses nœuds peuvent s'aligner sur des termes SKOS ; ses arêtes typées sont une contribution propre à SoVisu+).

---

## 2. Types de nœuds (4 types)

Chaque nœud du graphe représente un **concept d'expertise**. Son type indique son rôle dans la structure intellectuelle du chercheur.

| Type | Couleur | Définition | Exemples |
|---|---|---|---|
| **Expertise principale** | Teal `#006A61` | Domaine central de recherche, autour duquel s'organise le reste du graphe | Migration pour le travail · Écologie des milieux humides |
| **Expertise secondaire** | Bleu `#1976D2` | Domaine connexe, spécialisation ou champ que le chercheur mobilise régulièrement sans en être le spécialiste premier | Politiques migratoires · Droit international du travail |
| **Terrain de recherche** | Orange `#E65100` | Ancrage empirique : zone géographique, période, matériau, corpus, langue… | Sri Lanka — Moyen-Orient · 2005–aujourd'hui · Entretiens ethnographiques |
| **Concept transversal** | Violet `#7B1FA2` | Notion théorique ou thématique mobilisée par plusieurs expertises | Genre et migration · Valeur du travail · Mémoire collective |

### Questions ouvertes sur les types de nœuds

- Faut-il distinguer un type **« Méthode »** (méthode de recherche, protocole) du type « Concept » ?
- Un terrain peut-il être aussi une expertise (ex : un chercheur spécialiste du Moyen-Orient) ? Faut-il que le même nœud puisse porter deux types ?

---

## 3. Types de relations (14 types en 4 catégories)

Les arêtes du graphe portent une **sémantique explicite** : elles ne se contentent pas de dire « ces deux concepts sont liés », elles précisent *comment* ils le sont. C'est la valeur ajoutée principale du graphe par rapport à une liste de mots-clés.

> **Convention de lecture** : `A [relation] B` signifie que A est la source et B la cible de la flèche. Pour les relations bidirectionnelles, `A ⟷ B` signifie que la relation est symétrique.

---

### Catégorie Hiérarchie
*Relations de profondeur ou d'emboîtement entre expertises.*  
Style visuel : trait plein teal `#006A61`.

| Clé | Label | Direction | Définition | Exemple | SKOS approx. |
|---|---|---|---|---|---|
| `approfondit` | approfondit | A → B | A est une expertise qui va plus loin ou plus en détail que B, B étant le cadre plus large | Politiques migratoires **approfondit** Migration pour le travail | `skos:narrower` |
| `specialise` | spécialise | A → B | A est une application spécifique de B dans un contexte particulier | Migration féminine **spécialise** Migration pour le travail | `skos:narrower` |
| `integre` | intègre | A → B | A absorbe ou englobe B comme une composante de son propre champ | Études de mobilité **intègre** Migration pour le travail | `skos:broader` |

**Différence `approfondit` vs `spécialise`** : `approfondit` marque un approfondissement thématique (plus de détail sur le même sujet) ; `spécialise` marque une restriction de périmètre (même sujet mais dans un sous-contexte précis). Les deux peuvent souvent s'interchanger — c'est une question ouverte.

---

### Catégorie Terrain
*Relations entre une expertise et son ancrage empirique.*  
Style visuel : tirets oranges animés `#E65100`, `stroke-dasharray: 6 3`.

| Clé | Label | Direction | Définition | Exemple | CERIF approx. |
|---|---|---|---|---|---|
| `terrain_geo` | terrain géographique | A → B | A est étudié dans ou à travers le territoire B | Migration pour le travail **terrain géographique** Sri Lanka — Moyen-Orient | — |
| `terrain_temp` | terrain temporel | A → B | A est étudié sur la période B | Migration pour le travail **terrain temporel** 2005–aujourd'hui | — |
| `cas_etude` | cas d'étude | A → B | B est un cas empirique particulier utilisé pour étudier A | Politiques migratoires **cas d'étude** Accord bilatéral Sri Lanka–Qatar 2017 | — |
| `corpus` | corpus | A → B | B est le matériau (textes, données, artefacts) sur lequel A s'appuie | Genre et migration **corpus** Entretiens biographiques 2008–2015 | — |

**Note :** les nœuds cibles de ces relations sont souvent de type `terrain`, mais pas nécessairement — un corpus peut être un nœud `concept` si le chercheur le problématise théoriquement.

---

### Catégorie Conceptuel
*Relations entre une expertise et les concepts théoriques qu'elle mobilise ou produit.*  
Style visuel : pointillés violets `#7B1FA2`, `stroke-dasharray: 3 3`.

| Clé | Label | Direction | Définition | Exemple | SKOS approx. |
|---|---|---|---|---|---|
| `mobilise` | mobilise | A → B | A utilise B comme outil théorique sans le produire | Migration pour le travail **mobilise** Genre et migration | `skos:related` |
| `problematise` | problématise | A → B | A remet en question ou interroge le concept B | Migration pour le travail **problématise** Valeur du travail | — |
| `produit` | produit des connaissances sur | A → B | A génère des résultats qui font avancer la compréhension de B | Migration pour le travail **produit des connaissances sur** Identités en migration | — |

**Différence `mobilise` vs `produit`** : `mobilise` est entrant (le concept B est un input de la recherche) ; `produit` est sortant (B est un output ou une contribution).

---

### Catégorie Dialogue
*Relations latérales entre expertises ou concepts de même niveau.*  
Style visuel : tirets bleus `#1976D2` ou rouges `#C62828`.

| Clé | Label | Direction | Définition | Exemple | Note |
|---|---|---|---|---|---|
| `croise` | croise | A ⟷ B | A et B se rejoignent ponctuellement sans que l'un subsume l'autre | Genre et migration **croise** Identités en migration | Bidirectionnel |
| `articule` | s'articule avec | A ⟷ B | A et B s'alimentent mutuellement de manière structurelle | Politiques migratoires **s'articule avec** Droit international du travail | Bidirectionnel |
| `a_conduit_a` | a conduit à | A → B | A a été une étape qui a mené à B dans la trajectoire du chercheur | Migration pour le travail **a conduit à** Identités en migration | Directionnel, temporel |
| `en_tension` | en tension avec | A ⟷ B | A et B sont en contradiction partielle ou en débat dans la littérature | Valeur du travail **en tension avec** Économie néoclassique du travail | Bidirectionnel, rouge `#C62828` |

**Différence `croise` vs `articule`** : `croise` est ponctuel et contingent (ces deux sujets se rejoignent dans certains travaux) ; `s'articule avec` est structurel (ces deux sujets ont une relation théorique durable). C'est une distinction subtile — c'est intentionnel : le chercheur doit choisir la nuance.

---

## 4. Alignement CERIF-Core et SKOS

Le graphe SoVisu+ est une **extension de CERIF-Core** : les nœuds peuvent s'aligner sur des entités `Expertise_and_Skills` (avec un `uri` pointant vers Wikidata, Agrovoc, etc.) ; les arêtes typées sont propres à SoVisu+ et n'ont pas d'équivalent direct dans CERIF-Core.

| Élément SoVisu+ | Équivalent CERIF | Équivalent SKOS/RDF |
|---|---|---|
| Nœud `main` / `secondary` | `Expertise_and_Skills` | `skos:Concept` |
| Nœud `terrain` | — (extension) | `schema:Place` · `schema:DefinedTerm` |
| Nœud `concept` | `Expertise_and_Skills` | `skos:Concept` |
| Relations Hiérarchie | — | `skos:broader` / `skos:narrower` |
| Relations Dialogue | — | `skos:related` + propriétés custom |
| Relations Terrain | — | Propriétés custom SoVisu+ |
| Relations Conceptuel | — | Propriétés custom SoVisu+ |
| Graphe complet | `Expertise_and_Skills_Possession` (nœuds seuls) | `skos:ConceptScheme` + graphe nommé |

**Implication pratique :** lors d'une future sérialisation CERIF/RDF, les arêtes devront être exprimées via un vocabulaire d'extension SoVisu+ (ex : `svp:approfondit`, `svp:terrain_geo`…). Les nœuds seront exportables en CERIF natif.

---

## 5. Questions ouvertes

Ces questions sont invitées à discussion — voir [GitHub Discussions](https://github.com/CRISalid-esr/SVP-mockups/discussions).

1. **14 types, est-ce trop ?** Le risque est que le chercheur hésite entre deux types proches (`approfondit` vs `spécialise`, `croise` vs `articule`). Faut-il fusionner certains types, ou conserver la nuance et améliorer les exemples ?
2. **Un type « influencé par » ?** Pour exprimer des relations d'influence intellectuelle sans production de connaissance directe (ex : "ma lecture de Bourdieu influence mon approche de la valeur du travail").
3. **Un type « est financé par » ?** Pour lier une expertise à un projet ANR ou ERC source — ou est-ce le rôle de la rubrique Activités ?
4. **Nœuds multi-types ?** Un nœud peut-il être à la fois `terrain` et `secondary` (ex : un chercheur *spécialiste du* Moyen-Orient) ?
5. **Relations temporelles sur les arêtes ?** Faut-il pouvoir dater une relation (ex : "a conduit à" entre 2010 et 2015) ?
6. **Intégration des perspectives RH et fonctionnelle ?** À quel moment SoVisu+ doit-il couvrir les perspectives « formation » et « outil » ? Sous forme de nouvelles vues, ou d'un module séparé ?

---

## 6. Proposer une modification

Pour proposer un nouveau type de nœud, un nouveau type de relation, ou modifier une définition existante :

1. Ouvrez une **[GitHub Discussion](https://github.com/CRISalid-esr/SVP-mockups/discussions)** dans la catégorie `Modèle de données` pour un débat ouvert, ou
2. Créez une **Issue** avec le template `Proposition — Modèle Expertises` pour une proposition formelle.

### Template de proposition (à copier dans une Issue ou Discussion)

```markdown
## Type de proposition
- [ ] Nouveau type de nœud
- [ ] Nouveau type de relation
- [ ] Modification d'une définition existante
- [ ] Fusion / suppression d'un type existant

## Élément concerné
Clé actuelle (si modification) : `xxx`
Nouveau label proposé : "..."

## Catégorie (pour les relations)
- [ ] Hiérarchie
- [ ] Terrain
- [ ] Conceptuel
- [ ] Dialogue
- [ ] Nouvelle catégorie (à justifier)

## Direction
- [ ] Directionnelle (A → B)
- [ ] Bidirectionnelle (A ⟷ B)

## Définition proposée
(En une ou deux phrases : que dit-on de la relation entre A et B ?)

## Exemple concret
`[nœud A]` **[cette relation]** `[nœud B]` — parce que...

## Pourquoi les types existants ne couvrent pas ce besoin
(En quoi ce type est-il distinct des types proches déjà définis ?)

## Correspondance SKOS / CERIF / autre standard (si connue)

## Perspective d'expertise concernée
- [ ] Recherche (graphe sémantique)
- [ ] RH / formation
- [ ] Fonctionnelle / outil
```
