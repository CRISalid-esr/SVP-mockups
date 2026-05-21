# Éditeur de périmètre — Spécifications fonctionnelles

**Route :** onglet « Périmètre » dans `/[lang]/research-structures/[uid]`  
**Composant :** `PerimeterEditor`  
**Statut :** implémenté

---

## Contexte et problème

Pour les institutions, composantes et structures intermédiaires (pôles, fédérations…), le périmètre de comptage des membres et publications n'est **pas réductible à une règle unique**. Exemples réels :

| Structure | Règle de comptage |
|-----------|-------------------|
| Pôle S&T (Nantes Université) | Tous les membres de LS2N + tous les membres de LMJL + membres de GeM **employés par NU** |
| Autre pôle | Somme des chercheurs **employés par le pôle** lui-même |
| Pôle campus | Somme des chercheurs **localisés sur le campus** |

Il n'y a pas de règle générale : un administrateur doit pouvoir définir le périmètre par structure.

---

## Approche retenue : éditeur structuré

Plutôt qu'une requête Cypher brute (puissante mais illisible pour un admin non-développeur), un **éditeur de règles composables** :

- Chaque règle sélectionne un ensemble de membres depuis une structure source
- Les règles sont combinées en **union** (dédupliquée)
- L'UI génère la requête Cypher ou l'équivalent API côté serveur

**Alternative écartée — requête Cypher libre :** trop risquée (résultats silencieusement faux, perf incontrôlée), illisible pour un admin, difficile à auditer.

---

## Modèle de données

```ts
type MemberScope = {
  structureUid: string        // structure source des membres
  filter?:
    | { type: 'employer'; institutionUid: string }   // membres employés par X
    | { type: 'campus'; campus: string }             // membres localisés sur le campus Y
    // absence de filter = tous les membres de la structure
}

type PerimeterConfig = {
  scopes: MemberScope[]       // union de tous les périmètres
}
```

`perimeterConfig` est un champ optionnel sur `StructureRaw`. Absent = indicateurs saisis manuellement.

---

## Exemple implémenté — Pôle S&T

```json
{
  "uid": "unit-pole-st",
  "perimeterConfig": {
    "scopes": [
      { "structureUid": "lab-ls2n" },
      { "structureUid": "lab-lmjl" },
      { "structureUid": "lab-gem", "filter": { "type": "employer", "institutionUid": "inst-nu" } }
    ]
  }
}
```

Lecture : tous les membres de LS2N + tous les membres de LMJL + membres de GeM dont l'employeur est Nantes Université.

---

## Interface utilisateur

```
┌──────────────────────────────────────────────────────────────────────┐
│ Périmètre de comptage  ⓘ                                             │
│ Règles de sélection des membres et publications comptabilisés…       │
├──────────────────────────────────────────────────────────────────────┤
│  [LS2N — Laboratoire des Sciences…  ▾] [Tous les membres        ▾]  🗑 │
│  [LMJL — Laboratoire de Mathémati…  ▾] [Tous les membres        ▾]  🗑 │
│  [GeM  — Institut de Recherche en…  ▾] [Membres employés par… ▾]       │
│                                        [Nantes Université        ▾]  🗑 │
│                                                                        │
│  [+ Ajouter une règle]                                                 │
│                                                [Annuler] [Enregistrer] │
└──────────────────────────────────────────────────────────────────────┘
```

**Comportement :**
- L'onglet « Périmètre » est visible pour :
  - toutes les **institutions** et **composantes**
  - les **units** qui sont des structures intermédiaires (i.e. d'autres structures déclarent `member_of_uids` pointant vers elles)
- Sans `perimeterConfig` : alerte « indicateurs saisis manuellement »
- Toute modification affiche les boutons Annuler / Enregistrer
- « Annuler » restaure l'état initial
- « Enregistrer » affiche le chip « Enregistré » (mock : pas d'appel API)
- Tooltip sur ⓘ : explique la sémantique union et la déduplification

---

## Filtres disponibles

| Valeur | Comportement |
|--------|-------------|
| `all` (défaut) | Tous les membres de la structure source |
| `employer` | Membres dont l'employeur est l'institution sélectionnée |
| `campus` | Membres dont la localisation est le campus saisi |

D'autres filtres sont envisageables en production (statut, date d'entrée, rôle…) mais non implémentés dans la maquette.

---

## Questions ouvertes

❓ **Validation des règles conflictuelles** : si deux règles se chevauchent partiellement (ex. tous les membres de LS2N + membres de LS2N employés par CNRS), l'UI devrait-elle avertir que la seconde règle est un sous-ensemble de la première ?

❓ **Prévisualisation du résultat** : faut-il afficher le nombre de membres estimés en temps réel (requête « explain » côté API) avant d'enregistrer ?

❓ **Historique des périmètres** : si le périmètre change, les stats historiques doivent-elles être recalculées ou conservées telles quelles ?

❓ **Droits d'accès** : l'onglet Périmètre est visible de tous dans la maquette. En production, il devrait être réservé aux administrateurs de la structure.
