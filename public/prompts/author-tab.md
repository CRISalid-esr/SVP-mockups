# Onglet Auteurs — Spécifications fonctionnelles

> **Statut des items**
> - ✅ Validé (Joachim)
> - 🟡 Proposition (à valider)
> - ❓ Question ouverte

---

## 1. Contexte

Cet onglet permet de gérer les contributions (auteurs + affiliations) d'une publication, en particulier pour préparer un éventuel dépôt dans HAL. Il permet à l'utilisateur d'identifier les auteurs dans HAL (via leur IdHAL) et d'aligner les affiliations sur des structures HAL (reliées à un identifiant ROR).

L'alignement des auteurs et des affiliations **n'est pas un préalable obligatoire** au dépôt dans HAL : l'onglet « Déposer dans HAL » reste accessible quelle que soit l'avancée de l'alignement.

L'utilisateur type est un chercheur ou un bibliothécaire qui dépose 5 à 20 publications par session.

---

## 2. Position dans le parcours

```
Mes publications → [fiche publication]
   ├── Informations bibliographiques
   ├── Mots-clés
   ├── Domaines
   ├── Sources
   ├── Auteurs           ◄── CET ONGLET
   └── Déposer dans HAL
```

---

## 3. Anatomie de la page

```
┌──────────────────────────────────────────────────────────────────────┐
│ Sidebar │ Topbar : titre publication + onglets                       │
│         ├────────────────────────────────────────────────────────────│
│         │ [En-tête sticky : titre + toggle "Rangs définis" + compteurs] │
│         │ [Bannière flottante "modifications non enregistrées"]       │
│         │                                                             │
│         │ MODE RANGS DÉFINIS :                                        │
│         │   [+ Insérer un auteur ici]                                 │
│         │   Carte auteur 1 (drag handle + flèches ▴▾)                │
│         │   [+ Insérer un auteur ici]                                 │
│         │   Carte auteur 2 …                                          │
│         │   [+ Insérer un auteur ici]                                 │
│         │   …                                                         │
│         │                                                             │
│         │ MODE RANGS NON DÉFINIS :                                    │
│         │   Carte auteur 1 (sans drag handle)                         │
│         │   Carte auteur 2 …                                          │
│         │                                                             │
│         │ MODE RANGS NON DÉFINIS : [+ Ajouter un auteur]              │
│         │ [Annuler les modifications]   [Enregistrer] (si pas de modif) │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 4. Contributions (auteurs)

### 4.1 Ordre et rangs

✅ Les rangs des contributeurs peuvent être **définis dans les données sources** (ex. OpenAlex) ou **non définis**.

✅ Le toggle **« Rangs définis »** reflète l'état réel des données : il est activé si et seulement si les contributions ont des rangs en base. Ce n'est pas un mode par défaut.

✅ Un toggle **« Rangs définis »** en haut de la page permet de passer d'un mode à l'autre :
- **Rangs définis** → les cartes s'affichent dans l'ordre des rangs ; un handle (6 points) et des flèches ▴ / ▾ permettent de réordonner ; des liens **« + Insérer un auteur ici »** apparaissent entre chaque carte.
- **Rangs non définis** → les cartes s'affichent dans l'ordre de la base ; aucune réorganisation possible ; pas de drag handle ni de flèches.

✅ **Suppression des rangs à la sauvegarde** : si l'utilisateur désactive le toggle « Rangs définis » et enregistre, les rangs sont supprimés de la base de données. Au prochain chargement de l'onglet, le toggle sera désactivé (pas de rangs → pas de mode rang).

✅ En mode rangs définis, les liens **« + Insérer un auteur ici »** permettent d'insérer un auteur directement à la position souhaitée sans avoir à le déplacer après coup (utile pour une liste de 30 auteurs ou plus).

✅ Le bouton **« + Ajouter un auteur »** en bas du formulaire ajoute toujours un auteur en fin de liste.

✅ Une icône corbeille en haut à droite de chaque carte permet de supprimer la contribution.

❓ **Quand on passe du mode « rangs non définis » au mode « rangs définis »**, des rangs séquentiels sont-ils assignés dans l'ordre courant ?

### 4.2 Statut HAL de l'auteur

✅ Un contributeur est **« Auteur identifié »** (vert) dès qu'il possède au moins un des identifiants éligibles : **ORCID, IdRef ou IdHAL**. Le Scopus n'est pas un identifiant éligible.

✅ Un contributeur sans aucun de ces identifiants affiche le statut **« Auteur non identifié »** (chip orange).

✅ Le panneau de recherche HAL (pour trouver l'IdHAL) s'affiche dès que l'auteur n'a pas encore d'IdHAL, **même s'il est déjà identifié via ORCID ou IdRef**. Dans ce cas, le panneau est affiché en style neutre (fond gris) plutôt qu'en orange — l'IdHAL reste souhaitable pour le dépôt HAL mais n'est pas bloquant.

✅ Quand une personne trouvée dans HAL est sélectionnée (confirmation de l'IdHAL), ses identifiants sont enregistrés.

✅ Un bouton **« Modifier »** (icône crayon, séparé visuellement des pictos identifiants) sur la ligne de statut permet de réinitialiser l'auteur associé et relancer la recherche HAL pour en sélectionner un autre. Il s'agit de remplacer la personne entière, pas seulement ses identifiants.

✅ **Terminologie retenue : « Auteur identifié » / « Auteur non identifié »** (validée). Raison : lors de l'import SWORD, le CCSD ne demande pas la désambiguïsation contre AureHAL mais un identifiant. C'est l'algorithme HAL qui fait l'alignement.

✅ **Ligne de statut** : sur la ligne « Auteur identifié », les identifiants disponibles s'affichent dans cet ordre, chacun avec une icône et un tooltip affichant la valeur :
1. Picto ORCID (si présent)
2. Picto IdRef (si présent)
3. Picto HAL / IdHAL (si présent)
4. Picto Scopus (si présent)
5. Bouton **« Modifier »** (icône crayon)

🟡 En cas de non-alignement : liste de candidats HAL avec score de correspondance. Le candidat primaire (meilleur score) est mis en avant avec un bouton « Confirmer ».

🟡 Score de correspondance : ≥ 85 % vert, 65–84 % ambre, < 65 % gris.

### 4.3 Rôles (Fonctions)

✅ Un contributeur peut avoir **plusieurs rôles** rattachés à une publication (champ multivalué). Les rôles sont affichés dans un menu déroulant **« Fonctions »** en sélection multiple ; les valeurs sélectionnées s'affichent sous forme de chips.

✅ Le référentiel des rôles est la **liste des Contributor Roles de la Library of Congress** (`http://id.loc.gov/vocabulary/relators`), déjà utilisée dans SoVisu+. C'est le type `LocRelator` de l'application.

✅ La liste étant longue (~300 entrées), le menu doit proposer une **recherche textuelle** (autocomplete ou filtre).

✅ Un mapping entre les rôles LOC et les fonctions requises par HAL sera effectué côté serveur lors du dépôt ; ce mapping n'est pas visible dans cet onglet.

✅ **Rôles absents dans les données source** : la fonction **« Contributeur »** est utilisée par défaut. Le sélecteur affiche alors une bordure orange et le message **« Fonction par défaut — à vérifier »** en dessous. L'avertissement disparaît dès que l'utilisateur choisit explicitement une valeur. Un auteur ajouté manuellement démarre également avec cet avertissement.

❓ **Si quelqu'un change un rôle accidentellement**, y a-t-il une validation ou un moyen d'annuler (hormis le bouton global « Annuler les modifications ») ?

### 4.4 Ajout d'un auteur

✅ L'utilisateur peut ajouter une contribution via **« + Ajouter un auteur »** (fin de liste) ou via **« + Insérer un auteur ici »** (entre deux cartes, mode rangs définis uniquement).

✅ La nouvelle carte contient un champ autocomplete pour chercher dans HAL. Tant que l'auteur n'est pas sélectionné, aucune contribution n'est enregistrée et aucune affiliation ne peut être ajoutée.

✅ L'utilisateur peut supprimer la nouvelle contribution via l'icône corbeille.

🟡 Si aucun résultat dans HAL : option « Créer un auteur sans identifiant HAL ».

---

## 5. Affiliations

### 5.1 Affichage

✅ Chaque affiliation a sa propre carte. Les affiliations ne sont pas ordonnées.

✅ Si l'organisation a au moins un identifiant : la carte affiche son nom en titre + chip ROR + icône corbeille.

✅ Si l'organisation n'est pas identifiée : étiquette orange « Affiliation HAL manquante » + texte importé brut + liste de candidats HAL (code labo, nom, tutelles, ROR, nombre de chercheurs, score).

❓ **Pour les structures de recherche tierces** : plusieurs noms possibles (changements de nom). Comment les afficher ?

❓ **Si une organisation a plusieurs identifiants**, comment les présenter ?

### 5.2 Ajout d'une affiliation

✅ En cliquant sur « + Ajouter une affiliation HAL », un autocomplete HAL apparaît.

✅ Si l'utilisateur sélectionne une option, une nouvelle carte d'affiliation alignée apparaît.

❓ **Peut-on ajouter une affiliation à un auteur non encore sélectionné dans HAL ?**

---

## 6. Bannière modifications non enregistrées

✅ En haut de la page, une bannière **sticky** reste visible lorsque l'utilisateur scrolle vers le bas.

✅ La bannière s'affiche dès qu'une modification a été faite sur la page (ajout/suppression d'auteur, changement de rôle, alignement confirmé, etc.).

✅ La bannière indique : **« Modifications non enregistrées »** et propose deux actions : **« Enregistrer »** et **« Annuler »**. Elle est volontairement discrète (liseré gauche, texte gris, boutons texte) pour ne pas surcharger visuellement la page.

✅ Quand l'utilisateur clique sur « Enregistrer » (bannière ou bouton de bas de page), la bannière disparaît.

✅ Quand l'utilisateur clique sur « Annuler les modifications », le formulaire revient à son état initial et la bannière disparaît.

🟡 **Si l'utilisateur quitte l'onglet** (navigation vers un autre onglet de la fiche) sans avoir enregistré : afficher une modale de confirmation « Vous avez des modifications non enregistrées. Voulez-vous les enregistrer avant de continuer ? »

---

## 7. Actions de bas de page

✅ **« + Ajouter un auteur »** : visible uniquement en mode rangs non définis. En mode rangs définis, les liens « + Insérer un auteur ici » entre chaque carte remplissent ce rôle — le bouton en bas serait un doublon.

✅ **« Annuler les modifications »** : toujours visible à droite.

✅ **« Enregistrer »** (bouton de bas de page) : visible uniquement quand la bannière sticky n'est pas affichée (aucune modification en attente). Quand la bannière est présente, le bouton « Enregistrer » qu'elle contient suffit — afficher les deux serait un doublon.

---

## 8. Questions ouvertes — récapitulatif

| # | Thème | Question |
|---|-------|----------|
| 1 | Rangs | Lors du passage mode « non définis » → « définis », quels rangs sont attribués ? |
| 2 | ~~Rôles~~ | ✅ Rôle absent → « Contributeur » par défaut avec avertissement orange ; disparaît à la première sélection explicite. |
| 3 | Rôles | Validation ou annulation du changement de rôle accidentel ? |
| 4 | ~~Terminologie~~ | ✅ Retenu : « Auteur identifié / Auteur non identifié » |
| 5 | ~~Rangs — sauvegarde~~ | ✅ Si l'utilisateur désactive le mode rangs et enregistre, les rangs sont supprimés en base. |
| 6 | ~~Statut identifié~~ | ✅ Identifié = ORCID, IdRef ou IdHAL (pas Scopus). |
| 7 | Navigation | Modale de confirmation si l'utilisateur quitte l'onglet sans enregistrer ? |
| 8 | Structures | Nom court/long absent pour les structures tierces — comment afficher ? |
| 9 | Structures | Plusieurs identifiants sur une organisation — affichage ? |
| 10 | Ajout auteur | Peut-on ajouter une affiliation à un auteur non encore sélectionné dans HAL ? |

---

## Annexe — Modèle de données (référence)

```ts
type Author = {
  id: string
  first: string
  last: string
  roles: LocRelator[]      // multivalué — référentiel LOC
  rank?: number            // undefined si rangs non définis dans la source
  orcid?: string
  idref?: string
  idhal?: string
  scopus?: string
  idhalAligned:
    | { value: string; aligned: true }
    | { aligned: false; candidates: IdHalCandidate[] }
    | { aligned: 'skip' }
  affiliations: Affiliation[]
}

type IdHalCandidate = {
  idhal: string
  display: string
  labs: string
  publis: number
  orcid?: string
  match: number   // 0–100
}

type Affiliation =
  | { aligned: true; code: string; long: string; ror: string }
  | { aligned: false; raw: string; candidates: StructureCandidate[] }

type StructureCandidate = {
  code: string
  name: string
  tutelles: string
  ror: string
  members: number
  match: number   // 0–100
}
```
