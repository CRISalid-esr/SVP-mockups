# Page : Liste des chercheurs

**Route :** `/[lang]/researchers`  
**Statut :** partiellement implémentée

---

## Contexte

Page listant l'ensemble des chercheurs et enseignants-chercheurs du périmètre. L'utilisateur type est un responsable de structure, un chargé de mission recherche ou un bibliothécaire souhaitant explorer les profils et identifier les chercheurs non encore alignés (sans identifiant HAL ou ORCID).

**Périmètre de la maquette :** EPE Nantes Université.

---

## Modèle de données

```ts
type Person = {
  uid: string
  displayName: string
  firstName: string
  lastName: string
  slug: string
  position?: string            // Nomenclature HCERES : "MCF", "Pr.", "DR", "CR", "ATER", "Post-doc", "Doctorant"…
  institution?: {              // Institution employeuse (champ institution_identifier de l'import)
    uid: string
    acronym: string            // ex. "NU", "CNRS", "CN"
    names: { language: string; value: string }[]
  }
  memberships: {               // Unité(s) de recherche (main + second_mmb)
    researchStructure: {
      uid: string
      acronym: string
      names: { language: string; value: string }[]
    }
    membershipType: 'stat_mmb' | 'assoc_mmb' | 'second_mmb' | 'visit_mmb'
  }[]
  // Indicateurs (24 derniers mois)
  publis24m?: number
  oaRate?: number              // 0–100
  halRate?: number             // 0–100
  // Identifiants
  idhal?: string
  orcid?: string
  idref?: string
  scopus?: string
}
```

---

## Vue tableau

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Sidebar │ « Chercheurs »                                                     [Exporter]  │
│         ├───────────────────────────────────────────────────────────────────────────────│
│         │ Toolbar : [🔍] [Filtres] [Densité] [Plein écran] [Col] [✕]                   │
│         ├───────────────────────────────────────────────────────────────────────────────│
│         │ ☐  Chercheur                    Employeur          Appartenance  Pub 24m  OA  HAL │
│         │ ☐  Jean Dupont      [MCF]       Nantes Université  LS2N            12     75%  83% │
│         │ ☐  Sophie Martin    [DR]        CNRS               LMJL             8     50%  62% │
│         │ ☐  Pierre Bernard   [CR]        Centrale Nantes    GeM              3     33%  40% │
│         │ …                                                                                   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Colonnes

| Col | Header | Contenu |
|-----|--------|---------|
| 1 | ☐ | Checkbox sélection. |
| 2 | **Chercheur** | Avatar initiales + nom complet (gras) + badge position HCERES (MCF, DR, CR…) sur la même ligne. Icônes identifiants alignées (ORCID, HAL, IdRef, Scopus) en sous-texte avec tooltip sur la valeur. |
| 3 | **Employeur** | Acronyme de l'institution employeuse (ex. NU, CNRS, CN), avec lien → fiche structure. Source : champ `institution_identifier` de l'import. |
| 4 | **Appartenance** | Acronyme(s) de la ou des unités de recherche (`main_research_structure` + `second_mmb`), avec lien → fiche structure. |
| 5 | **Pub 24m** | Nombre de publications sur 24 mois, aligné à droite. `—` si 0. |
| 6 | **OA** | Barre de progression 54×6 px + pourcentage (vert). `—` si 0. |
| 7 | **HAL** | Barre de progression + pourcentage (couleur primaire). `—` si 0. |
| 8 | (sans header) | Bouton « Détail → » → `/researchers/[uid]`. |

### Filtres disponibles (toolbar)

- Recherche textuelle (nom, prénom)
- Employeur (multi-select)
- Unité de recherche / Appartenance (multi-select)
- Position HCERES (multi-select : MCF, DR, CR…)
- Présence d'identifiant HAL / ORCID (toggle)

---

## Icônes identifiants dans la colonne Chercheur

Dans l'ordre, si présents :

1. Picto ORCID → lien `https://orcid.org/{orcid}`
2. Picto HAL → lien `https://hal.science/search/?authIdHal_s={idhal}`
3. Picto IdRef → lien `https://www.idref.fr/{idref}`
4. Picto Scopus

Absence d'identifiant HAL : icône HAL grisée avec tooltip « Pas encore aligné dans HAL ».

---

## Export CSV

Colonnes : Nom · Prénom · Statut · Employeur · Appartenance (unité de recherche) · Publications 24m · OA % · HAL % · ORCID · IdHAL · IdRef · Scopus

---

## Questions ouvertes

❓ **Chercheurs multi-affiliés** : afficher toutes les structures sur la même ligne, ou une ligne par affiliation ?

❓ **Tri par défaut** : alphabétique (nom), ou par nombre de publications décroissant ?

❓ **Chercheurs sans publication** : visibles dans la liste (avec `—`) ou masqués par défaut ?
