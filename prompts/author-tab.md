# Onglet Auteurs — Spécifications fonctionnelles

> **Statut des items**
> - ✅ Validé (Joachim)
> - 🟡 Proposition (à valider)
> - ❓ Question ouverte

---

## 1. Contexte

Cet onglet permet de gérer les contributions (auteurs + affiliations) d'une publication avant son dépôt dans HAL. Il est l'étape clé du parcours de dépôt : HAL exige que chaque auteur soit retrouvé dans HAL et chaque affiliation alignée sur une structure HAL (reliée à un identifiant ROR).

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
   └── Déposer dans HAL  ◄── étape suivante
```

🟡 L'onglet « Déposer dans HAL » est désactivé tant que des auteurs ou des affiliations sont manquants dans HAL.

---

## 3. Anatomie de la page

```
┌──────────────────────────────────────────────────────────────────────┐
│ Sidebar │ Topbar : titre publication + onglets                       │
│         ├────────────────────────────────────────────────────────────│
│         │ [Bannière d'état]                                           │
│         │ [Barre de progression]                                      │
│         │                                                             │
│         │ Cartes d'auteur (une par auteur, dans l'ordre de signature) │
│         │   • drag handle + flèches ▴▾ + corbeille                   │
│         │   • colonne gauche : identité + statut HAL                  │
│         │   • colonne droite : affiliations                           │
│         │                                                             │
│         │ [+ Ajouter un auteur]   [Annuler]   [Enregistrer]          │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 4. Contributions (auteurs)

### 4.1 Affichage et ordre

✅ Chaque contribution est affichée dans une carte à deux colonnes :
- colonne gauche : auteur et ses identifiants
- colonne droite : affiliations

✅ Les cartes sont affichées selon le rang des contributions s'il est renseigné ; sinon selon l'ordre en base.

✅ Un handle (6 points) et des flèches ▴ / ▾ à côté du nom permettent de modifier l'ordre.

✅ Une icône corbeille en haut à gauche de chaque carte permet de supprimer la contribution.

❓ **Si les contributions n'ont pas de rang, dans quel ordre les affiche-t-on ?** Ordre de la base de données ?

❓ **Si l'utilisateur modifie l'ordre, assigne-t-on des rangs à toutes les contributions ?** Est-ce que l'utilisateur voit ces rangs ? Peut-il revenir à la version non ordonnée ?

❓ **Si les contributions sont ordonnées, une nouvelle contribution est-elle forcément ajoutée en fin de liste ?** Si oui, il sera fastidieux de la replacer.

### 4.2 Statut HAL de l'auteur

✅ Si l'on a les identifiants HAL du contributeur en base : afficher le statut **« Auteur identifié »** (vert).

✅ Si l'on n'a pas ses identifiants : afficher le statut **« Auteur non identifié »** (orange) + champ autocomplete pour rechercher la personne dans HAL.

✅ Quand une personne trouvée dans HAL est sélectionnée, ses identifiants sont enregistrés et son statut passe à « Auteur identifié ».

✅ Un bouton « Modifier » permet d'effacer les identifiants enregistrés et de revenir au statut « Non trouvé dans HAL ».

✅ **Terminologie retenue : « Auteur identifié » / « Auteur non identifié »** (proposition Joachim, validée). Raison : lors de l'import SWORD, le CCSD ne demande pas l'alignement de tous les contributeurs sur HAL mais seulement un identifiant. C'est l'algorithme HAL qui fait l'alignement sur AureHAL d'après l'identifiant fourni et la date de publication. Il est préférable de laisser cet algorithme travailler plutôt que de demander aux utilisateurs de désambiguïser contre AureHAL les auteurs déjà identifiés.

❓ **Comment afficher les identifiants si l'auteur en a plusieurs ?**

🟡 Badge IdHAL vert si aligné, badge ORCID vert si présent et aligné. Badge orange « ⚠ Sans IdHAL » si non aligné.

🟡 En cas de non-alignement : liste de candidats HAL avec score de correspondance. Le candidat primaire (meilleur score) est mis en avant avec un bouton « Confirmer ».

🟡 Score de correspondance (`MatchChip`) : ≥ 90 % vert, 70–89 % ambre, < 70 % gris.

### 4.3 Rôles

✅ Le rôle du contributeur, tel que défini en base, est affiché dans un menu « Rôles ».

❓ **Quelle liste de rôles utiliser ?** Celle de SoVisu+ (Library of Congress) ou celle de HAL ? Si LOC, la liste est très longue — prévoir une recherche dans le menu.

❓ **Si quelqu'un change un rôle accidentellement, y a-t-il une validation ou un moyen d'annuler ?**

❓ **Workflow si l'on n'a pas de rôle** (i.e. rôle générique « contributeur ») ?

### 4.4 Ajout d'un auteur

✅ L'utilisateur peut ajouter une contribution en cliquant sur « + Ajouter un auteur ».

✅ La nouvelle carte ne contient pas de nom ni d'affiliation. Elle contient un champ autocomplete pour chercher dans HAL.

✅ L'utilisateur peut sélectionner un auteur depuis l'autocomplete HAL. Tant qu'il ne l'a pas fait, aucune contribution n'est enregistrée et aucune affiliation ne peut être ajoutée.

✅ L'utilisateur peut supprimer la nouvelle contribution via l'icône corbeille.

🟡 Si aucun résultat : option « Créer un auteur sans identifiant HAL ».

---

## 5. Affiliations

### 5.1 Affichage

✅ Chaque affiliation a sa propre carte. Les affiliations ne sont pas ordonnées.

✅ Si l'organisation a au moins un identifiant : la carte affiche son nom en titre + icône corbeille pour la supprimer.

✅ Si l'organisation n'est pas identifiée : étiquette « Non identifiée » + champ autocomplete pour rechercher dans HAL.

❓ **Pour les structures de recherche tierces** : on n'a pas forcément de nom court / nom long, mais un ou plusieurs noms (souvent parce que l'organisation a changé de nom). Comment gérer ce cas ?

❓ **Si une organisation d'affiliation a plusieurs identifiants, comment les affiche-t-on ?**

🟡 Affiliation alignée : carte verte avec code labo en gras, libellé long, chip ROR.

🟡 Affiliation non alignée : carte orange avec la chaîne brute importée + liste de candidats (code labo, nom complet, tutelles, ROR, nombre de chercheurs, score de correspondance).

### 5.2 Ajout d'une affiliation

✅ En cliquant sur « + Ajouter une affiliation HAL », un autocomplete HAL apparaît.

✅ Si l'utilisateur ne sélectionne rien dans cet autocomplete, cela n'a aucun effet.

✅ Si l'utilisateur sélectionne une option, une nouvelle carte d'affiliation alignée apparaît.

❓ **Quand on ajoute un nouvel auteur**, tant qu'il n'a pas été sélectionné dans HAL, peut-on lui ajouter une affiliation ?

---

## 6. Bannière d'état

✅ En haut de la page, une bannière indique l'état d'avancement :
- Si des auteurs ou affiliations sont manquants : bannière d'alerte (orange / ambre) avec le compte et un CTA « Aligner toutes les meilleures correspondances ».
- Si tout est aligné : bannière de succès (verte).

✅ Barre de progression sous la bannière : X / Y auteurs trouvés dans HAL.

✅ Bouton « Aligner toutes les meilleures correspondances » : confirme automatiquement les candidats dont le score ≥ 85 % (seuil actuel).

🟡 Le CTA demande confirmation avant d'appliquer (modale listant les alignements à effectuer). L'action est réversible via un toast « Annuler » pendant quelques secondes.

---

## 7. Actions de bas de page

✅ À gauche : **« + Ajouter un auteur »** (bouton secondaire).

✅ À droite : **« Annuler »** + **« Enregistrer »**.

---

## 8. Questions ouvertes — récapitulatif

| # | Thème | Question |
|---|-------|----------|
| 1 | Ordre | Ordre d'affichage si pas de rang en base ? |
| 2 | Ordre | Assigner des rangs à toutes les contributions quand l'utilisateur en réordonne une ? Possibilité de revenir à l'ordre initial ? |
| 3 | Ordre | Nouvelle contribution forcément ajoutée en fin de liste ? |
| 4 | ~~Terminologie~~ | ✅ Retenu : « Auteur identifié / Auteur non identifié » |
| 5 | Identifiants | Comment afficher plusieurs identifiants pour un même auteur ? |
| 6 | Rôles | Liste LOC ou liste HAL ? Recherche dans le menu si LOC ? |
| 7 | Rôles | Validation ou annulation si changement accidentel du rôle ? |
| 8 | Rôles | Workflow si rôle générique « contributeur » (pas de rôle explicite) ? |
| 9 | Structures | Nom court/long absent pour les structures tierces — comment afficher ? |
| 10 | Structures | Plusieurs identifiants sur une organisation — affichage ? |
| 11 | Ajout auteur | Peut-on ajouter une affiliation à un auteur non encore sélectionné dans HAL ? |

---

## Annexe — Modèle de données (référence)

```ts
type Author = {
  id: string
  first: string
  last: string
  role: string
  orcid?: string
  idhal:
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
