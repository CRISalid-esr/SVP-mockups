# Gestion des droits — maquette de la proposition « groupes Keycloak »

## Le problème

SoVisu+ a des rôles globaux ou à périmètre (école, UFR, labo, équipe) : `admin`, `document_editor UFRXXX`, `account_editor LaboYYY`… Aujourd'hui ils s'assignent en ligne de commande. Mais le chatbot, Projects et la couche MCP ont besoin des **mêmes permissions** : on ne peut pas commencer à assigner des droits dans chaque application.

## La proposition

S'appuyer **intégralement sur les groupes Keycloak**, avec les établissements (ou super-établissements : EPE, Comue) à la racine :

```
UnivParis1
├── admin
├── UFR08
│   ├── account_editor
│   ├── document_viewer
│   ├── document_editor
│   └── LaboXYZ
│       ├── account_editor
│       └── EquipeTruc
│           └── account_editor
└── UFR02
    └── account_editor
```

- L'arborescence suit la **hiérarchie organisationnelle** (établissement > UFR > labo > équipe), avec des **feuilles par rôle** à chaque niveau.
- L'organigramme complet étant dans CRISalid, l'arborescence est **créée automatiquement** via l'admin REST API de Keycloak.
- **Attribuer un droit = ajouter l'utilisateur au groupe** correspondant, directement dans la console Keycloak. Les *fine-grained admin permissions* (Keycloak 26.2) permettent de déléguer l'administration d'une branche à un gestionnaire local.
- Le **full group path est encodé dans le JWT** : `/UnivParis1/UFR08/LaboXYZ/account_editor`.
- Chaque appli (SoVisu+, chatbot, Projects, couche MCP) **déduit rôle + périmètre en parsant le chemin**. Un droit s'applique aux sous-structures.
- **Aucune assignation dans les applis clientes** : uniquement de l'application/interprétation.
- Il ne reste qu'à s'entendre sur un **vocabulaire de rôles transverse** : `admin`, `document_viewer`, `document_editor`, `project_viewer`, `project_editor`, `account_editor`…
- Côté MCP : remplacement de mcp-toolbox par une app **FastMCP** qui lit les JWT et injecte des filtres dans toutes les requêtes Cypher.

## Les écrans

### Onglet Utilisateurs
Liste des utilisateurs avec leurs droits affichés en chips (rôle · périmètre, tooltip = chemin du groupe). « Gérer » ouvre la fiche des droits :
- chaque droit avec son fil d'Ariane organisationnel et son chemin de groupe monospace ; icône « s'applique aux sous-structures » quand le périmètre a des enfants ;
- ajout d'un droit = choix d'un **rôle** + d'un **périmètre** dans l'arborescence → aperçu du chemin de groupe généré ;
- accordéon **« JWT résultant »** : payload décodé (claim `groups`) + table d'interprétation par application.

### Onglet Groupes Keycloak
Arborescence complète (2 établissements de démo : Nantes Université et Paris 1) avec feuilles par rôle et compteurs de membres. Bandeau « générée automatiquement depuis l'organigramme CRISalid » + bouton **Resynchroniser** (simulation). Clic sur une feuille-rôle → dialogue des membres (ajout/retrait = ajout/retrait du groupe). Encart sur la délégation d'administration (fine-grained admin permissions).

### Onglet Rôles
Le vocabulaire transverse : segment de groupe (`document_editor`…), libellé, description, et les applications qui interprètent chaque rôle (SoVisu+, Chatbot, Projects, Couche MCP).

## Ce que la maquette simule

- Les assignations sont persistées en localStorage (`rights-assignments-v1`) : les modifications faites dans un onglet se répercutent dans les autres.
- La synchronisation Keycloak et les appels admin REST API sont simulés.
- En production, ces écrans seraient soit une simple **console de visualisation** (l'assignation se faisant dans Keycloak), soit un front léger au-dessus de l'admin REST API.
