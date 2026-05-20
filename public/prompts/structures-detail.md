# Page : Détail d'une structure de recherche

**Route :** `/[lang]/research-structures/[uid]`

## Contexte

Fiche d'une structure, quel que soit son `generic_type` (institution, composante, unité). Le contenu des onglets s'adapte au type de structure : une institution affiche ses composantes et unités rattachées, une unité affiche ses membres et équipes.

---

## En-tête

- Acronyme en grand + chip `national_type` (UMR, UAR, UFR, Université…)
- Nom long complet
- Mission (chip coloré)
- **Tutelles** : noms avec lien → fiche de la tutelle (`/research-structures/[uid]`) — vide pour les institutions racines
- **Structure parente** : breadcrumb "Sorbonne Université > UFR Info > LIP6"
- RNSR si disponible
- Bouton retour → `/research-structures`

---

## Onglets (selon `generic_type`)

### Pour `generic_type: "unit"`

**Membres**
Liste des personnes : avatar, nom, statut (permanent / doctorant / émérite / …) → lien vers `/researchers/[uid]`.

**Équipes**
Sous-structures liées par `PART_OF` de type `Team` :
- Nom, responsable, nombre de membres, lien fiche équipe.
- Affiché uniquement si l'unité a au moins une équipe.

**Composantes**
Plateformes, pôles thématiques, subdivisions (`UnitSubdivision`). Affiché uniquement si des subdivisions existent.

**Publications**
Stats sur 24 mois : nombre, taux OA, taux HAL. Lien vers la liste des publications filtrée.

**À propos**
Description, adresse, site web, identifiants (RNSR, ROR, local).

### Pour `generic_type: "composante"`

**Unités rattachées**
Tableau des unités filles (`parent_uid = this.uid`) avec acronyme, mission, membres, publications.

**Membres**
Personnes directement rattachées à la composante (hors unités).

**À propos**
Description, adresse, site web.

### Pour `generic_type: "institution"`

**Structures rattachées**
Tableau / liste hiérarchique des composantes et unités directement rattachées (`parent_uid = this.uid`), avec liens vers chaque fiche.

**Chercheurs**
Personnes rattachées directement à l'institution (sans passer par une composante ou unité).

**Publications**
Agrégat de toutes les publications des structures filles sur 24 mois.

**À propos**
Description, site web, identifiants.

---

## Données mock à enrichir

```ts
// Ajouter sur les unités :
teams: { uid: string; name: string; membersCount: number }[]
members: string[]           // uids de chercheurs
memberships: {
  institutionUid: string
  position: "main_supervision" | "associated_supervision"
  start_date: string
}[]
```

---

## Navigation

- Breadcrumb → fiche de chaque ancêtre
- Tutelle → `/research-structures/[uid]`
- Chercheur → `/researchers/[uid]`
- Retour → `/research-structures`

---

## Questions ouvertes

❓ **Agrégation des stats** : les membres/publications d'une institution doivent-ils inclure récursivement ceux de toutes ses sous-structures, ou seulement le niveau direct ?

❓ **Historique** : faut-il afficher les structures qui ont changé de tutelle ou de nom ? Avec quelle période de référence ?

❓ **Accès** : la fiche d'une structure externe (non membre du consortium) est-elle accessible, ou redirige-t-on vers une page "structure externe" simplifiée ?
