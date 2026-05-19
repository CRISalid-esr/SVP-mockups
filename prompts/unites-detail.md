# Page : Détail d'une unité

**Route :** `/[lang]/laboratories/[uid]`

## Objectif

Afficher toutes les informations d'une unité et permettre la navigation vers ses membres, équipes et tutelles.

## En-tête

- Acronyme en grand + chip `national_type` (UMR, UAR…)
- Nom long complet
- Mission (chip coloré : Recherche / Services scientifiques / …)
- Tutelles avec lien → `/institutions/[uid]`
- RNSR si disponible
- Bouton retour → `/laboratories`

## Onglets

### Chercheurs
Liste des membres de l'unité : avatar, nom, statut (permanent / doctorant / …) → lien vers `/researchers/[uid]`.

### Équipes
Liste des `Team` liées par `PART_OF` :
- Nom de l'équipe
- Responsable (si disponible)
- Nombre de membres
- Lien vers la fiche équipe (si implémentée)

Affiché uniquement si l'unité a au moins une équipe.

### Composantes
Subdivisions de l'unité liées par `PART_OF` (`UnitSubdivision`) : plateformes, pôles thématiques, etc. Affiché uniquement si des subdivisions existent.

### Publications
Statistiques de production de l'unité sur 24 mois : nombre de publications, taux OA, taux HAL. Lien vers la liste des publications filtrée sur cette unité.

### À propos
Description, adresse postale, site web, identifiants (RNSR, ROR, local).

## Données mock

Enrichir les structures mock avec :
- `teams` : liste d'objets `{ uid, name, membersCount }`
- `memberships` : liste d'objets `{ institutionUid, position: "main_supervision" | "associated_supervision", start_date }`
- `members` : liste d'ids de chercheurs

## Navigation

- Tutelle → `/institutions/[uid]`
- Chercheur → `/researchers/[uid]`
- Retour → `/laboratories`
