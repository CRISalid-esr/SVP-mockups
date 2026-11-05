# Onglet Domaines — Descriptif fonctionnel

> Dernière mise à jour : novembre 2026 (première maquette)

## Contexte

L'onglet Domaines d'un document affiche sa classification OpenAlex sur 4 niveaux et ses domaines HAL. Il permet aussi de générer des propositions, d'ajouter un sujet à la main et d'attribuer un domaine HAL repris au dépôt.

Tout est simulé : aucun appel à OpenAlex, à la génération automatique ou à HAL.

---

## Écran

### Classification OpenAlex

Les sujets sont regroupés par branche, sous le chemin complet : domaine › discipline › sous-discipline.

| Origine | Étiquette | Score | Actions |
|---|---|---|---|
| OpenAlex | OpenAlex | oui | aucune (lecture seule) |
| Génération | Proposé | oui | Valider · Écarter |
| Proposition validée | Validé | oui | Retirer |
| Saisie | Saisi à la main | non | Retirer |

- **Voir plus :** seuls les sujets OpenAlex sont repliés au-delà de 5. Une proposition à traiter reste toujours visible.
- **Écartés :** ils ne reviennent pas à la génération suivante, et peuvent être rétablis.
- **Sans domaine :** un état vide met en avant « Générer des propositions » et « Ajouter un domaine ».
- **Sans résumé :** un avertissement apparaît avant le lancement, et les propositions portent la mention « d'après le titre seul ».
- **Panne :** un message indique que les domaines n'ont pas changé, avec « Réessayer ».

### Ajouter un domaine

Recherche et arbre à 4 niveaux, comme la maquette de l'issue SoVisuPlus #373, mais **seuls les sujets se cochent**. La recherche porte aussi sur les niveaux supérieurs, en français et en anglais.

### Domaines HAL

- **Moissonnés :** « HAL, principal » ou « HAL », en lecture seule.
- **Attribués :** « Attribué », avec « Retirer ».
- **Publication dans HAL :** l'attribution reste dans SoVisu+ et ne modifie pas la notice HAL.
- **Publication hors HAL :** l'attribution pré-remplit le formulaire de l'onglet « Déposer dans HAL ».

### Lecture seule

Sans droit de modification, ou document figé : plus aucune action. Les propositions gardent leur étiquette « Proposé ».

---

## Démonstration

| Document | Situation | À montrer |
|---|---|---|
| `doc-1` | OpenAlex + HAL | Écran complet : repli, proposition, saisie, HAL moissonné et attribué |
| `doc-2` | Ni OpenAlex ni HAL | État vide, génération, attribution puis dépôt pré-rempli |
| `doc-3` | OpenAlex, hors HAL | Sujets OpenAlex sans repli, panne de génération |
| `doc-4` | Sans résumé | Génération d'après le titre seul |
| `doc-5` | Aucune notice source | État vide et génération |
| `doc-6` | OpenAlex + HAL | Sciences du sol, domaine HAL principal |

La zone « Simuler » change les droits, fige le document, met la génération en panne et réinitialise la démonstration.

---

## Fichiers techniques

| Fichier | Rôle |
|---|---|
| `documents/[uid]/components/Domains/Domains.tsx` | Écran et zone de démonstration |
| `documents/[uid]/components/Domains/TopicPickerDialog.tsx` | Sélecteur de sujets |
| `documents/[uid]/components/Domains/domainsMock.ts` | Taxonomie d'échantillon, scénarios, état, `getDepositDomains()` |
| `documents/[uid]/components/halDomains.ts` | Liste des domaines HAL, partagée avec le dépôt |

État conservé en localStorage, clé `document-domains-v1-{uid}`.

**Données :** identifiants et libellés anglais viennent de la classification OpenAlex liée à l'issue #373 (échantillon de sujets sur 4 515). Les traductions françaises et les scores sont des propositions de maquette.

---

## Questions ouvertes

- **Niveau de saisie :** cette maquette limite la saisie au sujet, alors que celle de l'issue #373 permet de choisir à n'importe quel niveau. À trancher avec le consortium.
- **Traduction :** la feuille liée à l'issue #373 ne contient aucun libellé français. Les 275 libellés de niveaux restent à traduire.
- **Score :** faut-il l'afficher aux chercheurs, alors que ceux d'OpenAlex et de la génération ne sont pas forcément comparables ?
- **Validation :** une proposition validée doit-elle se distinguer d'une saisie à la main à l'écran ? Il est prévu de créer le même lien manuel pour les deux.
- **Notice HAL existante :** un domaine attribué pourrait-il devenir une proposition de l'onglet « Compléter dans HAL » ? Pour l'instant, il ne modifie pas la notice.
