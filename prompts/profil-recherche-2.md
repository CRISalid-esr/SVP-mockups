# Profil de recherche 2 — saisie simplifiée des thèmes de recherche

> **Statut des items**
> - ✅ Implémenté dans la maquette
> - 🟡 Proposition (à valider)
> - ❓ Question ouverte

---

## 1. Pourquoi une deuxième version

Les retours sur la rubrique « Profil recherche » (v1) convergent : **il y a trop de choses à saisir et trop d'écrans**. La séparation *Thèmes de recherche* / *Expertises* (fiches par public), le stepper en trois étapes, les cartes en grille et le panneau latéral étroit de la vue Relations rendent le parcours difficile à lire pour un chercheur qui vient compléter son profil une fois par an.

Cette v2 repart d'un principe : **un seul objet, le thème de recherche**, décrit une fois, daté, et dont le chercheur règle lui-même la diffusion. Tout le reste (graphe de connaissance, portail d'expertise, sollicitations presse) découle de ce thème.

Ce qui disparaît par rapport à la v1 :
- la distinction Thèmes / Expertises et la génération de fiches par public ;
- le stepper « Définir → Générer → Publier » ;
- les cartes en grille (remplacées par des lignes pleine largeur) ;
- la saisie manuelle d'une fiche par public : la déclinaison est **générée** depuis la description.

Ce qui est conservé de la v1, en option normale (toujours visible, jamais obligatoire) :
- les **repères structurés** : terrains et lieux (GeoNames), personnes et organisations (IdRef). Ils restent la matière du graphe de connaissance et de la vue laboratoire ;
- une **vue laboratoire** agrégée, repensée autour des thèmes datés.

Ce qui apparaît :
- la **période** de chaque thème (un chercheur a pu travailler un sujet il y a vingt ans puis passer à autre chose : cela manquait) ;
- la **diffusion par thème** : privé / limité à l'établissement / public ;
- les **sollicitations par thème** : accepter d'être contacté par des journalistes, accepter d'intervenir dans des événements grand public ;
- un statut **brouillon / validé** par thème ;
- une **déclinaison par public** (chercheurs, entreprises et collectivités, journalistes, grand public) générée automatiquement, retouchable ;
- un **aperçu public** qui montre exactement ce que verra le portail, pour chaque public.

---

## 2. Les écrans

### 2.1 Thèmes — liste pleine largeur ✅

Point d'entrée de la rubrique. Chaque thème occupe une ligne : intitulé, description (deux lignes), trois premiers mots-clés (+N), **période** sous forme de texte (« 2017 → en cours ») et de **mini-frise** alignée sur l'étendue globale du profil, chip de **diffusion**, icônes de sollicitation (presse, événements), chip de **statut**.

- Tri : thèmes validés d'abord (en cours puis par date de début décroissante), brouillons en fin de liste.
- Bandeau orange quand un brouillon existe : « Tant qu'il n'est pas validé, il n'apparaît ni dans le graphe de connaissance ni sur les portails » + bouton *Reprendre la saisie*.
- Actions d'en-tête : **Importer depuis HAL** (propose des thèmes déduits des publications, ajoutés en brouillon) et **Ajouter un thème**.
- Un clic sur la ligne ouvre l'éditeur.

### 2.2 Éditeur de thème — page entière ✅

Pas de modale : l'éditeur remplace la liste, avec un fil d'Ariane (*Profil de recherche 2 / Thèmes / intitulé*). Deux colonnes.

**Colonne principale**
- Intitulé.
- Description, « rédigée pour un public non spécialiste », compteur /1200.
- **Période** : année de début, année de fin, case « Thème toujours en cours ».
- **Mots-clés** : choix du référentiel (RAMEAU, MeSH, Wikidata, Domaines HAL, Libre), recherche avec autocomplétion, option « Ajouter “…” en mot-clé libre », chips avec étiquette du vocabulaire, suggestions « d'après vos publications HAL ».
- **Lieux, personnes et organisations** ✅ : trois champs de recherche (Terrains et lieux → GeoNames ; Personnes → IdRef ; Organisations → IdRef). Chaque repère retenu est un chip dont le libellé est un lien vers la notice du référentiel ; un repère sans alignement est accepté (chip en pointillés). Les lieux cités dans l'intitulé ou la description sont proposés en un clic (« Repéré dans votre texte »). Section toujours visible, facultative.
- **Déclinaison par public** ✅ : bouton **Générer les déclinaisons** (LLM simulé, 1,4 s) qui reformule la description pour quatre publics — *Chercheurs* (approche, notions, terrains), *Entreprises et collectivités* (besoins concrets, formes de collaboration), *Journalistes* (« je peux répondre sur… » en une phrase), *Grand public* (« pourquoi c'est important », sans jargon). Quatre onglets avec un point coloré quand la version existe, texte retouchable, bouton *Régénérer*. Sans déclinaison, le portail affiche la description générale. Aucune saisie n'est demandée au chercheur.

**Colonne latérale**
- **Diffusion de ce thème** : trois cartes-radio (Privé / Limité à l'établissement / Public) avec une phrase expliquant qui voit quoi.
- **Sollicitations sur ce thème** : deux interrupteurs (journalistes, événements grand public), actifs seulement si le thème est public.
- **Relié dans votre parcours** : phrases des relations existantes + bouton *Ouvrir le graphe de parcours*.
- Suppression du thème (avec confirmation).

**Barre d'actions fixe** : date de dernière validation, indicateur de modifications, *Annuler*, **Enregistrer le brouillon**, **Valider ce thème**.

### 2.3 Graphe de parcours ✅

Même objectif que la vue Relations de la v1 (qualifier les liens entre thèmes), mais aéré :
- **Canevas** à gauche (React Flow). Mode **Frise** par défaut : chaque thème est une barre placée à son année de début, de largeur proportionnelle à sa durée, empilée par couloirs ; axe des années en bas. Mode **Libre** : disposition manuelle, positions mémorisées.
- Création d'une relation en glissant d'une poignée de thème vers un autre thème.
- **Panneau de qualification** à droite (420 px, plus un bandeau étroit) : *Thème A*, **direction** en trois gros boutons (A → B, A ← B, A ↔ B), *Thème B*, champ *Qualifier la relation* avec suggestions (prolonge, s'appuie sur, nourrit, a conduit à, croise, méthodes partagées…), **phrase de prévisualisation** telle qu'elle sera affichée, *Supprimer* / *Enregistrer*.
- Sous le formulaire : liste des autres relations, cliquables.
- Un clic sur un thème affiche son résumé dans le panneau, avec un raccourci *Modifier ce thème* vers l'éditeur (les mots-clés se modifient dans l'éditeur, pas dans le graphe).
- Les relations non qualifiées sont en pointillés gris.

### 2.4 Aperçu public ✅

Rendu « tel quel sur le portail » : en-tête du chercheur (nom, affiliation, badges *Accepte les sollicitations presse* / *Intervient en événements grand public* si au moins un thème public le permet), section **Expertises** (uniquement les thèmes **publics et validés**, avec période, description, mots-clés, repères structurés, sollicitations), section **Parcours** (phrases des relations dont les deux thèmes sont publics).

**Voir le portail comme : Description générale / Chercheurs / Partenaires / Presse / Grand public** ✅ — le texte de chaque thème bascule sur sa déclinaison (mention « Version adaptée aux journalistes » ou « Description générale (pas de déclinaison pour ce public) »). En vue Presse, les thèmes qui acceptent les sollicitations presse remontent en tête ; en vue Grand public, ceux qui acceptent les événements. Le bandeau indique combien de thèmes n'ont pas de déclinaison pour le public choisi.

Bandeau en haut : nombre de thèmes masqués et pourquoi (établissement, privé, brouillon) + *Revenir à l'édition*.

### 2.5 Vue laboratoire ✅

Switcher **Chercheur / Laboratoire** dans l'en-tête (même pattern que le tableau de bord). Lecture seule : le laboratoire ne saisit rien, il **agrège les thèmes datés de ses membres**. Règle de remontée : un thème est visible du laboratoire s'il est **validé** et en diffusion **établissement** ou **public** ; les thèmes privés et les brouillons n'apparaissent pas (le profil connecté est traité comme un membre, et un bandeau lui rappelle combien de ses thèmes sont invisibles ici).

- **Regroupement** : deux thèmes de membres différents forment un même *sujet* s'ils partagent le même mot-clé contrôlé (RAMEAU, Wikidata, MeSH), sinon par intitulé normalisé. Un membre peut donc personnaliser l'intitulé (« Habitats partagés pour les aînés ») et rester regroupé avec « Habitat inclusif et politiques publiques ».
- **Filtres** : équipe (3 équipes de démonstration), recherche texte, et surtout **curseur d'année** (« Le laboratoire en 2015 ») qui ne garde que les thèmes actifs cette année-là — la datation des thèmes permet de voir le laboratoire tel qu'il était.
- **KPI** : membres, profils renseignés, sujets distincts, thèmes publics, membres joignables par la presse, terrains distincts.
- **Frise des sujets** : une ligne par sujet (tag du vocabulaire, période cumulée, équipes, mention presse), un **trait par membre** sur l'axe commun des années (couleur = équipe, estompé si terminé), avatars et compteur. Clic → dialogue des membres et de leurs thèmes.
- **Carte des terrains** ✅ (première version) : fond de carte OpenStreetMap atténué (bibliothèque Leaflet, tuiles standard sans clé), un cercle par terrain cité dans les thèmes visibles, taille proportionnelle au nombre de thèmes, couleur de l'équipe (teal si plusieurs équipes). Les régions, départements et espaces (littoral, Centre-Bretagne…) sont dessinés en cercles larges, clairs et pointillés ; les villes en cercles pleins. Survol : nombre de thèmes, membres. Clic sur un cercle ou sur la liste « Terrains les plus cités » à droite → dialogue des membres et de leurs thèmes, puis fiche détaillée. Deux étendues : *Grand Ouest* (défaut) et *Tous les terrains* (cadre sur l'ensemble, par exemple Paris, Sénégal). Les filtres d'équipe et d'année s'appliquent. Les coordonnées viennent d'une table locale (`placeCoords.ts`) ; en production, GeoNames les fournit avec la notice. Les terrains sans coordonnées restent listés à droite, marqués « non localisé ».
- **Thèmes actifs par année** (ECharts, barres empilées par équipe, repère orange sur l'année choisie) et **Organisations, personnes** agrégées avec le nombre de thèmes qui les citent (tooltip : quels membres).
- **Expertises publiques** : annuaire des thèmes publics (membre, équipe, thème, terrains, période, badges Presse / Événements), filtres *Accepte la presse* / *Événements grand public*. Clic → dialogue de détail avec le sélecteur **Voir comme** par public et un bouton *Mettre en relation* (simulé) actif si le thème accepte une sollicitation.
- **Complétude des profils** : par équipe, chaque membre avec « N thèmes », « Brouillon seulement » ou « Profil vide » ; bouton *Relancer les N membres sans profil* (simulé).

Données de démonstration : laboratoire fictif « Territoires, Habitat et Sociétés (THS) », 16 membres + le profil connecté, 22 sujets de géographie sociale (`components/Lab/labMock.ts`).

---

## 3. Modèle de données

```ts
interface ResearchTheme {
  id: string
  label: string
  description: string
  yearFrom: number | null
  yearTo: number | null          // null = toujours en cours
  keywords: { label: string; vocabulary: 'rameau' | 'mesh' | 'wikidata' | 'hal' | 'libre'; detail?: string; uri?: string }[]
  places: { label: string; geonamesId?: number; detail?: string }[]       // GeoNames
  persons: { label: string; ppn?: string; dates?: string }[]              // IdRef
  organizations: { label: string; ppn?: string; detail?: string }[]       // IdRef
  variants: Partial<Record<'researchers' | 'industry' | 'media' | 'public', string>>  // déclinaisons générées
  variantsGeneratedAt?: string
  visibility: 'private' | 'institution' | 'public'
  acceptsPress: boolean
  acceptsEvents: boolean
  status: 'draft' | 'validated'
  lastValidated?: string
}

interface ThemeRelation {
  id: string
  source: string
  target: string
  direction: 'forward' | 'backward' | 'bidirectional'
  label: string
}
```

Le profil (`themes`, `relations`, positions libres du graphe) est persisté en localStorage sous `research-profile-v2-{perspective}`. La perspective de démo (`default`) est pré-remplie avec cinq thèmes de géographie sociale (2009 → aujourd'hui) et quatre relations ; les autres perspectives démarrent vides.

---

## 4. Ce que la maquette simule

- Les référentiels (RAMEAU/IdRef, MeSH, Wikidata, domaines HAL, GeoNames, IdRef personnes et organisations) sont une petite base locale filtrée côté client ; les identifiants sont ceux des référentiels réels quand ils sont connus, des valeurs de démonstration sinon.
- « Importer depuis HAL » et « Suggérés d'après vos publications HAL » reposent sur des propositions fixes.
- La déclinaison par public est produite par des gabarits à partir de l'intitulé, de la description, des mots-clés, des lieux et de la période ; en production, un modèle de langage ferait ce travail.
- La vue laboratoire lit un jeu de membres fictifs ; en production, elle lirait les profils des membres de la structure dans le graphe de connaissance.
- La validation d'un thème ne déclenche aucun envoi : en production, elle alimenterait le graphe de connaissance CRISalid, et la diffusion « public » exposerait le thème sur les portails d'expertise.

---

## 5. Questions ouvertes

- ✅ Les caractéristiques structurées de la v1 (lieux, personnes, organisations) sont conservées, en option normale de l'éditeur (décision du 15 octobre 2026).
- ✅ La déclinaison par public est générée automatiquement depuis la description, sans saisie supplémentaire.
- ✅ La vue laboratoire est reprise, repensée autour des thèmes datés (frise des sujets, curseur d'année, annuaire des expertises publiques).
- ❓ La diffusion « limité à l'établissement » doit-elle être le défaut d'un nouveau thème (choix actuel) ou « privé » ?
- ❓ La déclinaison par public doit-elle être validée séparément du thème, ou la validation du thème vaut-elle pour ses déclinaisons (choix actuel) ?
- ✅ Carte des terrains du laboratoire livrée en première version (clic sur un lieu → membres concernés).
- 🟡 Pistes pour la carte : choroplèthe par département quand les terrains sont des zones, carte équivalente dans le profil chercheur (ses propres terrains), filtre inverse (clic sur un terrain → filtrer la frise des sujets).
