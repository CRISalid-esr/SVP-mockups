# Page : Détail d'un chercheur

**Route :** `/[lang]/researchers/[id]`

## Objectif

Afficher le profil complet d'un chercheur : identité, affiliations, identifiants et lien vers ses publications.

## Contenu attendu

- En-tête :
  - Avatar / initiales
  - Nom complet, prénom
  - Laboratoire(s) d'affiliation (avec liens → `/laboratories/[id]`)
  - Institution(s) (avec liens → `/institutions/[id]`)
- Section identifiants chercheurs :
  - IdHAL (lien vers profil HAL)
  - ORCID (lien vers profil ORCID)
  - IdRef (si disponible)
- Section publications :
  - Compteur de publications
  - Lien "Voir ses publications" → `/documents?person=[id]` (ou vue filtrée)
- Bouton retour → `/researchers`

## Navigation

- Lien laboratoire → `/laboratories/[id]`
- Lien institution → `/institutions/[id]`
- Lien publications → vue documents filtrée sur ce chercheur

## Données mock

Réutiliser les personnes existantes dans `src/mocks/data/persons.json` (Jean Dupont, Sophie Martin, Pierre Bernard, Anne Leclerc) en les enrichissant avec un lien vers leur institution parente.
