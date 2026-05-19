# Page : Détail d'un laboratoire

**Route :** `/[lang]/laboratories/[id]`

## Objectif

Afficher toutes les informations d'un laboratoire et la liste de ses chercheurs.

## Contenu attendu

- En-tête : nom complet, acronyme, institution(s) de tutelle (avec lien), identifiant ROR/RNSR
- Onglets :
  - **Chercheurs** : liste des chercheurs membres du labo (avatar, nom, statut) → lien vers `/chercheurs/[id]`
  - **À propos** (optionnel) : description, adresse, site web
- Bouton retour → `/laboratories`

## Navigation

- Lien institution de tutelle → `/institutions/[id]`
- Clic sur un chercheur → `/chercheurs/[id]`
- Bouton retour → `/laboratories`

## Données mock

Enrichir les structures mock avec : liste d'ids de chercheurs membres, lien vers institution parente.
