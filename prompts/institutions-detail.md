# Page : Détail d'une institution

**Route :** `/[lang]/institutions/[id]`

## Objectif

Afficher toutes les informations d'une institution et permettre de naviguer vers ses laboratoires et ses chercheurs.

## Contenu attendu

- En-tête : logo, nom complet, sigle, site web
- Onglets :
  - **Laboratoires** : liste des labos rattachés à cette institution (cards avec nom, acronyme, nombre de chercheurs) → lien vers `/laboratoires/[id]`
  - **Chercheurs** : liste des chercheurs rattachés directement à cette institution → lien vers `/chercheurs/[id]`
- Bouton retour → `/institutions`

## Navigation

- Onglet Laboratoires → liste filtrée des labos de l'institution
- Onglet Chercheurs → liste filtrée des chercheurs de l'institution
- Clic sur un labo → `/laboratoires/[id]`
- Clic sur un chercheur → `/chercheurs/[id]`

## Données mock

Enrichir les institutions mock avec : liste d'ids de labos et de chercheurs rattachés.
