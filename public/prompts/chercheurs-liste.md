# Page : Liste des chercheurs

**Route :** `/[lang]/researchers`

## Objectif

Afficher la liste globale de tous les chercheurs, avec filtrage par institution ou laboratoire et navigation vers le détail d'un chercheur.

## Contenu attendu

- Titre de page : "Chercheurs"
- Filtres :
  - Par institution (select)
  - Par laboratoire (select, dépendant du filtre institution)
- Liste des chercheurs (cards ou tableau) avec pour chaque chercheur :
  - Avatar / initiales
  - Nom complet
  - Laboratoire(s) d'affiliation
  - Institution(s)
  - Identifiants : IdHAL, ORCID (si disponibles, sous forme de chips/icônes)
- Champ de recherche par nom

## Navigation

- Clic sur un chercheur → `/researchers/[id]`

## Données mock

Utiliser / enrichir `src/mocks/data/persons.json`. Les personnes existantes (Jean Dupont, Sophie Martin, etc.) peuvent servir de base.
