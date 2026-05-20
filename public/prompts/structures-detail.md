# Page : Détail d'une structure de recherche

**Route :** `/[lang]/research-structures/[uid]`  
**Statut :** non implémentée — cette page est à construire.

## Contexte

Fiche d'une structure, quel que soit son `generic_type` (institution, composante, unit, team). Le contenu s'adapte au type : une institution affiche ses sous-structures, une unité affiche ses membres et équipes. La même route sert tous les types, y compris les nœuds de référence co-tutelle (voir "Multi-tutelles" ci-dessous).

**Périmètre de la maquette :** EPE Nantes Université — données réelles fictivisées.

---

## Modèle de données disponible

```ts
type ResearchStructure = {
  uid: string
  generic_type: "institution" | "composante" | "unit" | "team"
  national_type: string | null         // "UMR", "UAR", "UR", "UFR", "SCD", "EPE"…
  local_types?: { language: string; value: string }[]
  main_mission: "research" | "scientific_services" | "administrative_services" | "teaching"
  short_labels: { language: string; value: string }[]
  long_labels:  { language: string; value: string }[]
  institutionNames: string[]           // toutes tutelles (y compris hors périmètre ex. CNRS)
  parent_uid: string | null            // tutelle principale dans l'arbre
  secondary_parent_uids: string[]      // co-tutelles dans le périmètre
  membersCount: number
  publicationsCount: number            // 24 derniers mois
  oaRate: number                       // 0–100
  halRate: number                      // 0–100
  rnsr?: string
  descriptions: { language: string; value: string }[]
  slug: string
}
```

---

## En-tête (commun à tous les types)

```
┌──────────────────────────────────────────────────────────────────┐
│ ← Structures de recherche                                        │
│                                                                  │
│  LS2N  ⬦UMR                                                     │
│  Laboratoire des Sciences du Numérique de Nantes                 │
│  [Recherche]  RNSR 201521843V                                    │
│                                                                  │
│  Tutelle principale : UFR Sciences — Nantes Université           │
│  Co-tutelles : Centrale Nantes · CNRS                            │
│                                                                  │
│  Breadcrumb : Nantes Université > UFR Sciences > LS2N            │
└──────────────────────────────────────────────────────────────────┘
```

- Acronyme en grand + chip `national_type`
- Nom long localisé
- Chip mission coloré
- RNSR si disponible
- **Tutelle principale** : lien → fiche de la structure parente (`parent_uid`)
- **Co-tutelles** : liste des `secondary_parent_uids` (périmètre) + tutelles hors périmètre issues de `institutionNames` — avec ou sans lien selon qu'elles ont une fiche dans l'appli
- **Breadcrumb** : reconstruit depuis `parent_uid` en remontant récursivement
- Bouton retour → `/research-structures`

---

## Onglets selon `generic_type`

### `institution` — Nantes Université, Centrale Nantes, ENSA Nantes

**Structures rattachées**
Tableau ou liste hiérarchique des composantes et unités directement filles (`parent_uid = this.uid`), avec liens. Inclut aussi les unités ayant cet uid dans `secondary_parent_uids` (avec badge co-tutelle).

**Publications**
Agrégat des publications des structures filles sur 24 mois, taux OA et HAL. Lien vers la liste des publications filtrée sur cet établissement.

**À propos**
Description, site web, identifiants locaux.

---

### `composante` — UFR Sciences, UFR LLSHS, IAE Nantes, Polytech Nantes

**Unités rattachées**
Tableau des unités filles (`parent_uid = this.uid`) : acronyme, mission, membres, publications, taux OA, lien fiche.

**Membres**
Personnes directement rattachées à la composante (hors unités filles) — si la donnée est disponible.

**À propos**
Description, adresse, site web.

---

### `unit` — LS2N, LMJL, CENS, GeM, LHEEA, CRENAU, LEMNA, BU Nantes…

**Membres**
Liste des personnes : avatar, nom, statut (permanent / doctorant / émérite / BIATSS / …) → lien `/researchers/[uid]`.

**Équipes**
Sous-structures filles de type `team` (`parent_uid = this.uid`) :
- Nom, acronyme, nombre de membres, lien fiche équipe.
- Onglet masqué si aucune équipe.

**Publications**
Stats sur 24 mois : nombre, taux OA, taux HAL. Lien vers liste publications filtrée.

**À propos**
Description, adresse postale, site web, identifiants (RNSR, ROR, locaux). Tutelles avec lien.

---

### `team` — TASC, ALMA (équipes du LS2N)

**Membres**
Liste des membres de l'équipe → lien `/researchers/[uid]`.

**Publications**
Stats de l'équipe sur 24 mois.

**À propos**
Description, responsable d'équipe, appartenance à l'unité parente → lien fiche unité.

---

## Multi-tutelles sur la fiche détail

**Problème :** LS2N a `parent_uid = "comp-ufr-st"` (Nantes Université) et `secondary_parent_uids = ["inst-cn"]` (Centrale Nantes). Comment présenter les tutelles sur la fiche ?

**Choix retenu — tutelle principale + co-tutelles distinctes :**

```
Tutelle principale : UFR Sciences — Nantes Université  →  [lien fiche]
Co-tutelles :        Centrale Nantes  →  [lien fiche]
                     CNRS  (hors périmètre, pas de lien)
```

- La tutelle principale est celle de `parent_uid` (chemin hiérarchique naturel).
- Les co-tutelles dans le périmètre sont celles de `secondary_parent_uids`.
- Les co-tutelles hors périmètre (CNRS) sont issues de `institutionNames` par différence — affichées sans lien cliquable.
- Ce découpage correspond au modèle `main_supervision` / `associated_supervision` prévu dans l'API.

**Alternative écartée — liste plate de tutelles sans distinction :**
Afficher simplement `institutionNames` comme liste de puces. Plus simple, mais perd l'information de hiérarchie (laquelle est la tutelle principale ?) et ne permet pas de créer des liens vers les fiches du périmètre.

---

## Breadcrumb et navigation dans la hiérarchie

Le breadcrumb est reconstruit en remontant récursivement la chaîne `parent_uid` :

```
Nantes Université  >  UFR Sciences  >  LS2N
```

Pour les nœuds de référence (LS2N affiché sous Centrale Nantes dans la vue liste), le clic mène à la même fiche LS2N — le breadcrumb affiche le chemin via la **tutelle principale**, pas via Centrale Nantes. C'est cohérent : la fiche est unique, seule la vue liste a des entrées multiples.

❓ **Alternative** : afficher les deux chemins possibles sur la fiche (via NU et via CN) ? Risque de confusion.

---

## Agrégation des statistiques

**Problème :** les membres et publications d'une institution (ex. Nantes Université) doivent-ils inclure récursivement ceux de toutes ses sous-structures (composantes + unités + équipes) ?

**Options :**

| Option | Avantage | Inconvénient |
|--------|----------|--------------|
| **Récursive** (toute la sous-arbre) | Chiffre représentatif de l'établissement | Double comptage si une personne appartient à plusieurs équipes |
| **Niveau direct seulement** | Simple, sans double comptage | Sous-estime fortement l'activité d'une institution |
| **Dénormalisé en base** | Performant, contrôlé | Nécessite une tâche de calcul périodique |

La maquette utilise des chiffres saisis manuellement pour chaque nœud. En production, la solution dénormalisée (champs précalculés, mis à jour par batch) est recommandée pour les institutions et composantes, les unités et équipes étant agrégées à la volée.

---

## Données mock à enrichir pour implémenter la page

```ts
// Sur les unités et équipes :
members: string[]           // uids de chercheurs
// Sur les institutions et composantes :
childUids: string[]         // uids des structures filles directes (dénormalisé)
```

Les équipes (TASC, ALMA) sont déjà liées à LS2N via `parent_uid` — pas besoin d'enrichissement supplémentaire pour l'onglet Équipes.

---

## Navigation

- Breadcrumb → fiche de chaque ancêtre via `parent_uid`
- Tutelle principale / co-tutelles → `/research-structures/[uid]`
- Membre → `/researchers/[uid]`
- Retour → `/research-structures`

---

## Questions ouvertes

❓ **Co-tutelles hors périmètre (CNRS)** : afficher une ligne de texte seule, ou renvoyer vers une fiche "structure externe" simplifiée (nom, type, site web) ?

❓ **Onglet Publications sur les composantes** : les composantes ont-elles des publications propres, ou faut-il agréger celles de leurs unités filles ?

❓ **Structures sans membres connus** : faut-il masquer l'onglet Membres ou afficher un message "données non disponibles" ?

❓ **Historique des tutelles** : une UMR peut changer de tutelle principale. Faut-il afficher un historique (ex. "rattachée à X depuis 2021, avant à Y") ?

❓ **Accès à la fiche depuis un nœud de référence** : le clic sur ↗ LS2N (sous Centrale Nantes) mène à la fiche LS2N. Faut-il indiquer sur la fiche que l'utilisateur y a accédé via Centrale Nantes ("vous y avez accédé via Centrale Nantes"), ou la fiche est-elle toujours identique quel que soit le chemin d'entrée ?
