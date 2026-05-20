# Page : Liste des institutions

**Route :** `/[lang]/institutions`

## Objectif

Afficher la liste de toutes les institutions membres du consortium CRISalid, avec possibilité de filtrer et de naviguer vers le détail d'une institution.

## Contenu attendu

- Titre de page : "Institutions"
- Liste des institutions (cards ou tableau) avec pour chaque institution :
  - Nom complet
  - Sigle / acronyme
  - Logo (si disponible)
  - Nombre de laboratoires rattachés
  - Nombre de chercheurs rattachés
- Champ de recherche / filtre par nom
- Lien vers le détail de chaque institution

## Navigation

- Clic sur une institution → `/institutions/[id]`

## Données mock

À créer dans `src/mocks/data/` : liste d'institutions avec id, nom, sigle, logo, stats.
