# Page : Détail d'un chercheur

**Route :** `/[lang]/researchers/[uid]`  
**Statut :** non implémentée

---

## Contexte

Page profil d'un chercheur ou enseignant-chercheur. L'utilisateur type est un gestionnaire de la recherche ou un collègue souhaitant vérifier le statut d'alignement HAL/ORCID d'une personne, consulter ses statistiques de publication, ou identifier ses domaines de recherche et co-auteurs fréquents.

**Périmètre de la maquette :** EPE Nantes Université.

---

## Modèle de données — champs source (import CRISalid)

Les champs ci-dessous proviennent du format d'import CRISalid ([Import des données chercheurs](https://www.esup-portail.org/wiki/spaces/ESUPCRISalid/pages/1478328329/Import+des+donn%C3%A9es+chercheurs)). Ils constituent les données disponibles en entrée dans le graphe.

### Identité

| Champ source | Obligatoire | Description |
|---|---|---|
| `first_names` | oui | Prénom(s) séparés par virgules, max 255 car. |
| `last_name` | oui | Nom de famille, max 255 car. |
| `tracking_id` | oui | Identifiant unique alphanumérique dans le référentiel source (max 10 car.) |
| `contact_email` | non | Adresse email personnelle ou professionnelle |
| `auth_email` | non | Adresse email professionnelle (authentification Edugain) |
| `eppn` | recommandé | `eduPersonPrincipalName` (authentification fédérée) |

### Emploi (relation à l'institution employeuse)

| Champ source | Description |
|---|---|
| `institution_identifier` | Code de l'institution employeuse |
| `institution_id_nomenclature` | Type de code : `UAI` ou `ROR` |
| `position` | Corps d'appartenance selon la **nomenclature HCERES** (ex. MCF, Pr., DR, CR, ATER, Post-doc, Doctorant, IGR…) |
| `employment_start_date` | Date d'arrivée dans l'institution (YYYY-MM-DD) |
| `employment_end_date` | Date de départ (YYYY-MM-DD, vide si actif) |
| `hdr` | Habilitation à Diriger des Recherches : `yes` / `no` |

### Appartenance structurelle (relation au laboratoire)

| Champ source | Description |
|---|---|
| `main_research_structure` | Identifiant du laboratoire de référence |
| `membership_start_date` | Date d'arrivée au laboratoire (DD-MM-YYYY) |
| `membership_end_date` | Date de départ du laboratoire |
| `membership_type` | Type de membre : `stat_mmb` (statutaire), `assoc_mmb` (associé), `second_mmb` (second rattachement), `visit_mmb` (visiteur) |

### Identifiants externes

| Champ source | Description |
|---|---|
| `idhals` | Identifiant HAL **alphanumérique** (ex. `jean-dupont`) |
| `idhali` | Identifiant HAL **numérique** (ex. `1234567`) |
| `orcid` | Identifiant ORCID (ex. `0000-0002-1234-5678`) |
| `idref` | Identifiant IdRef (conserver le zéro initial) |
| `scopus` | Identifiant Scopus (Author ID) |

---

## Modèle de données — type TypeScript (maquette)

```ts
type Person = {
  uid: string
  displayName: string
  firstName: string
  lastName: string
  slug: string
  // Emploi
  position?: string            // Nomenclature HCERES : "MCF", "Pr.", "DR", "CR", "ATER"…
  hdr?: boolean
  employmentStartDate?: string
  employmentEndDate?: string   // null = actif
  institution?: {              // Institution employeuse
    uid: string
    acronym: string
    names: { language: string; value: string }[]
  }
  // Appartenance laboratoire(s)
  memberships: {
    researchStructure: {
      uid: string
      acronym: string
      names: { language: string; value: string }[]
    }
    membershipType: 'stat_mmb' | 'assoc_mmb' | 'second_mmb' | 'visit_mmb'
    startDate?: string
    endDate?: string
  }[]
  // Identifiants
  idhals?: string              // HAL alphanumérique
  idhali?: string              // HAL numérique
  orcid?: string
  idref?: string
  scopus?: string
  // Indicateurs (24 derniers mois)
  publis24m?: number
  oaRate?: number              // 0–100
  halRate?: number             // 0–100
  publicationsByYear?: { year: number; count: number }[]
  // Enrichissements (calculés / issus des publications)
  researchDomains?: string[]   // ex. ["Informatique", "Intelligence artificielle"]
  keywords?: string[]
  coAuthors?: {
    uid: string
    displayName: string
    publicationsCount: number
  }[]
}
```

---

## En-tête (Hero)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [JD]  Jean Dupont                                          HDR          │
│        Maître de conférences · Nantes Université                        │
│        LS2N (statutaire) · depuis sept. 2015                            │
│                                                                          │
│  [ORCID] [HAL] [IdRef] [Scopus]                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Avatar :** initiales dans un cercle coloré
- **Nom complet** (gras, grand)
- **Position** (nomenclature HCERES) + institution employeuse (lien → fiche structure)
- **HDR** : badge discret si `hdr: true`
- **Appartenance laboratoire** : acronyme + type de membre + date de début
  - `stat_mmb` → « statutaire »  
  - `assoc_mmb` → « associé »  
  - `second_mmb` → « second rattachement »  
  - `visit_mmb` → « visiteur »
- **Icônes identifiants** (voir section dédiée)

---

## Icônes identifiants

Même logique que `SidebarIdentifiers` des structures :

| Identifiant | Icône | Lien | Absent |
|---|---|---|---|
| ORCID | Logo ORCID | `https://orcid.org/{orcid}` | Grisé, tooltip « Pas d'identifiant ORCID » |
| IdHAL | Logo HAL | `https://hal.science/search/?authIdHal_s={idhals}` | Grisé, tooltip « Pas encore aligné dans HAL » |
| IdRef | Logo IdRef | `https://www.idref.fr/{idref}` | Grisé, tooltip « Pas d'identifiant IdRef » |
| Scopus | Logo Scopus | — | Grisé, tooltip « Pas d'identifiant Scopus » |

> Note : `idhals` (alphanumérique) est préféré pour construire le lien HAL. `idhali` (numérique) peut servir d'affichage secondaire dans la sidebar.

---

## KPIs (bandeau)

```
┌────────────────────────────────────────────────────────────┐
│  12          75 %          83 %                            │
│  Publications   Accès ouvert    Dépôt HAL                  │
│  (24 derniers   (sur publis      (sur publis               │
│   mois)         24 m)            24 m)                     │
└────────────────────────────────────────────────────────────┘
```

- Même style que `StructureKpis` (3 tuiles côte à côte)
- `—` si valeur absente ou 0

---

## Graphique Publications par année

Histogramme identique à `PublicationsChart` des structures :
- Axe X : années
- Axe Y : nombre de publications
- Barre couleur primaire

---

## Layout principal

```
┌─────────────────────────────────────┬─────────────────────┐
│ Hero (nom, position, affiliations,  │ Sidebar             │
│ identifiants, HDR)                  │                     │
├─────────────────────────────────────│  Identifiants       │
│ KPIs (Pub 24m · OA · HAL)          │  (ORCID, HAL…)      │
├─────────────────────────────────────│                     │
│ Graphique publications par année   │  Emploi             │
├─────────────────────────────────────│  (institution,      │
│ [Onglets]                           │  dates, HDR)        │
│  Publications | Co-auteurs          │                     │
│                                     │  Appartenances      │
│  [contenu onglet actif]             │  (labos, type,      │
│                                     │  dates)             │
│                                     │                     │
│                                     │  Domaines de        │
│                                     │  recherche          │
│                                     │                     │
│                                     │  Mots-clés          │
└─────────────────────────────────────┴─────────────────────┘
```

Colonne principale : 2/3 de la largeur  
Sidebar : 1/3 (~320 px), positionnée à droite sur `lg+`

---

## Onglet Publications

Liste ou tableau des publications du chercheur :
- Mêmes colonnes que la page Documents (titre, année, revue/conf, OA, HAL)
- Lien « Voir toutes ses publications » → `/documents?person=[uid]`

---

## Onglet Co-auteurs

Tableau des co-auteurs les plus fréquents :

| Co-auteur | Structure | Publications communes |
|---|---|---|
| Sophie Martin | LMJL | 8 |
| Pierre Bernard | GeM | 5 |
| Anne Leclerc | EHESS | 3 |

- Nom cliquable → fiche chercheur
- Structure cliquable → fiche structure
- Tri par défaut : nombre de publications communes décroissant

---

## Sidebar — Blocs

### Identifiants

Liste avec valeur affichée et lien :

```
ORCID    0000-0002-1234-5678  [↗]
HAL      jean-dupont          [↗]
         (id numérique: 1234567)
IdRef    12345678             [↗]
Scopus   —
```

### Emploi

```
Nantes Université  [→]
Maître de conférences
HDR ✓
Depuis : sept. 2015
```

### Appartenances

```
● LS2N  Laboratoire des Sciences du Numérique  [→]
  Membre statutaire · depuis sept. 2015
```

Si plusieurs appartenances (type `second_mmb`, `assoc_mmb`…), les lister toutes.

### Domaines de recherche

Chips issus du thésaurus (pas « disciplines ») :
```
[Informatique]  [Intelligence artificielle]  [Réseaux]
```

### Mots-clés

Chips issus des publications (termes libres) :
```
[machine learning]  [graph neural networks]  [edge computing]
```

---

## Questions ouvertes

❓ **Périmètre temporel des co-auteurs** : calculer sur les 24 derniers mois ou sur toute la carrière ?

❓ **Chercheur sans IdHAL** : afficher une bannière d'alerte (invitation à aligner) ?

❓ **Chercheurs avec `employment_end_date` renseignée** : les afficher dans la liste par défaut, ou les masquer (anciens membres) ?

❓ **Plusieurs premiers prénoms** (`first_names` = liste séparée par virgules) : afficher tous les prénoms ou seulement le premier ?

❓ **`idhali` vs `idhals`** : afficher les deux dans la sidebar, ou seulement l'alphanumérique ?

❓ **Visibilité** : la fiche chercheur est-elle accessible publiquement ou réservée aux utilisateurs authentifiés ?
