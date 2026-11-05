# Compléter dans HAL — Descriptif fonctionnel

> Dernière mise à jour : novembre 2026 (première maquette)

## Contexte

Quand une publication est déjà dans HAL, SoVisu+ peut en savoir plus que HAL : mots-clés, identifiants d'auteurs, affiliations, titres traduits. L'onglet **Compléter dans HAL** prend alors la place de « Déposer dans HAL ».

Principe : SoVisu+ montre ce que HAL n'a pas, l'utilisateur coche, et **seuls ces éléments sont envoyés**. Ce n'est ni une synchronisation automatique, ni un formulaire de modification de la notice.

La maquette simule tout le parcours : aucun appel à HAL n'est effectué.

---

## Décisions

| Sujet | Décision |
|---|---|
| Périmètre de la première version | **Ajouts uniquement.** Les différences restent visibles, sans pouvoir être envoyées. |
| Documentaliste | Peut agir pour le propriétaire du dépôt. L'envoi indique pour qui et par qui. |
| Fichiers | Hors parcours : nouvelle version ou ajout de fichier passent par HAL. |
| Auteurs | Suppression et réordonnancement exclus. |

---

## Parcours

```
Comparaison → Vérification → Envoi → Envoyé, en attente de mise à jour → Comparaison actualisée
```

### Comparaison

| Groupe | Contenu | Sélection |
|---|---|---|
| **À ajouter** | information absente de HAL | cochée par défaut, sauf point d'attention |
| **À vérifier** | HAL et SoVisu+ diffèrent | pas de case : à corriger directement dans HAL |
| **Écartées** | « Ne plus proposer » | bouton « Rétablir » |

Chaque ligne affiche sa source. Un résumé venu d'une source externe porte un avertissement sur les droits de réutilisation et n'est pas coché par défaut. Un ajout peut aussi afficher son intérêt, par exemple l'entrée possible dans une collection.

### Droits

| Situation | Affichage | Action principale |
|---|---|---|
| Propriétaire | bandeau d'information | Vérifier et envoyer |
| Documentaliste | « Vous agissez pour… » | Vérifier et envoyer |
| Non propriétaire | bandeau d'avertissement | Demander le partage de propriété (message modifiable) |
| Demande en attente | sélection conservée | bouton désactivé |
| Demande acceptée | bandeau de succès | Vérifier et envoyer |
| Demande refusée | bandeau d'erreur | Demander à nouveau |

### Après l'envoi

- **Envoyé, en attente de mise à jour :** jusqu'au prochain moissonnage de HAL.
- **Mise à jour reçue :** les informations sortent de la liste, celles non sélectionnées restent proposées.
- **Dépôt modifié entre-temps :** rien n'est envoyé, l'utilisateur relance la comparaison.

### Onglet Auteurs

« Enregistrer » ne modifie que SoVisu+. Pour une publication présente dans HAL, un message le précise et mène vers cet onglet.

---

## Démonstration

| Document | Situation de départ | À montrer |
|---|---|---|
| `doc-1` | Dépôt avec fichier, propriétaire | Envoi direct, résumé avec avertissement, date différente à vérifier |
| `doc-6` | Notice sans fichier, non propriétaire | Demande de partage, entrée possible dans la collection LS2N |

La zone « Simuler » permet de changer de situation d'accès, de répondre à une demande, de provoquer un conflit et de recevoir la mise à jour de HAL. « Réinitialiser » efface l'état de démonstration.

---

## Fichiers techniques

| Fichier | Rôle |
|---|---|
| `documents/[uid]/components/HalUpdate/HalUpdate.tsx` | Parcours complet et zone de démonstration |
| `documents/[uid]/components/HalUpdate/halUpdateMock.ts` | Propositions de `doc-1` et `doc-6`, écrites à la main |
| `documents/[uid]/page.tsx` | Affiche cet onglet ou celui du dépôt selon la présence d'une notice HAL |
| `documents/[uid]/components/Authors/Authors.tsx` | Message après enregistrement |

État conservé en localStorage, clé `hal-update-state-{uid}`.

---

## Questions ouvertes

### Pour le CCSD

La documentation SWORD distingue la correction de métadonnées (`PUT` en XML sur `hal-XXXvN`, réponse 200) et la nouvelle version (`PUT` en ZIP sur `hal-XXX`, réponse 201), mais ne précise pas :

- si une correction de métadonnées repasse en modération ;
- si le XML envoyé doit être complet (la maquette suppose qu'on repart du TEI actuel de HAL pour ne pas perdre les champs inconnus de SoVisu+) ;
- quels droits exige `On-Behalf-Of`, notamment pour un·e documentaliste ou un compte SoVisu+ dédié ;
- si le partage de propriété peut être demandé par l'API, ou seulement dans HAL.

### Métier

- Faut-il autoriser plus tard les remplacements, après confirmation champ par champ ?
- Le propriétaire doit-il être prévenu quand un·e documentaliste agit en son nom ?
- Faut-il signaler les publications à compléter dans la liste, puis proposer un traitement par lot ?
- Quels droits de la page Gestion des droits ouvrent l'action de documentaliste ?
