# Onglet Domaines — Descriptif fonctionnel

> Dernière mise à jour : 20 novembre 2026 (sujet principal, propositions automatiques sans bouton de génération)

## Contexte

L'onglet Domaines d'un document affiche sa classification OpenAlex sur 4 niveaux et ses domaines HAL. Il affiche aussi des propositions automatiques, permet d'ajouter un sujet à la main et d'attribuer un domaine HAL repris au dépôt.

Tout est simulé : aucun appel à OpenAlex, au service de propositions ou à HAL.

**Pas de bouton « Générer ».** Une fois activé, le calcul des propositions (Crisalid-taxi, appelé par l'IKG) tourne pour chaque document créé ou modifié, juste après le moissonnage, qu'il ait ou non des sujets OpenAlex. Un bouton ne produirait rien de nouveau : les propositions sont donc déjà là quand on ouvre l'onglet.

---

## Écran

### Classification OpenAlex

**Sujet principal.** OpenAlex attribue au plus 3 sujets à une publication ; le mieux classé est son sujet principal (`primary_topic`). Il est sorti de la liste et affiché en tête, dans un encadré, avec l'étiquette « OpenAlex, principal », son score et son chemin complet. Les autres sujets suivent sous « Autres sujets ».

Les autres sujets sont regroupés par branche, sous le chemin complet : domaine › discipline › sous-discipline.

| Origine | Étiquette | Score | Actions |
|---|---|---|---|
| OpenAlex, sujet principal | OpenAlex, principal | oui | aucune (lecture seule) |
| OpenAlex | OpenAlex | oui | aucune (lecture seule) |
| Proposition automatique | Proposé | oui | Valider · Écarter |
| Proposition validée | Validé | oui | Retirer |
| Saisie | Saisi à la main | non | Retirer |

- **Propositions repliées :** quand OpenAlex a déjà classé la publication, les propositions ne sont qu'un complément. Elles sont repliées sous « Voir N propositions automatiques en complément ». Sans notice OpenAlex, elles sont visibles d'emblée.
- **Écartés :** ils ne reviennent pas au calcul suivant, et peuvent être rétablis.
- **Sans domaine :** quand rien n'a pu être proposé, un état vide met en avant « Ajouter un domaine ».
- **Sans résumé :** un avertissement indique que les propositions ont été faites d'après le titre seul, et chacune porte la mention « d'après le titre seul ».

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
| `doc-1` | OpenAlex + HAL | Écran complet : sujet principal, propositions repliées, saisie, HAL moissonné et attribué |
| `doc-2` | Ni OpenAlex ni HAL | Propositions visibles d'emblée, attribution puis dépôt pré-rempli |
| `doc-3` | OpenAlex, hors HAL | Sujet principal et 2 autres sujets, une proposition repliée |
| `doc-4` | Sans résumé | Propositions d'après le titre seul |
| `doc-5` | Aucune notice source | Propositions ; état vide avec « Sans proposition automatique » |
| `doc-6` | OpenAlex + HAL | Sciences du sol, domaine HAL principal |

La zone « Simuler » change les droits, fige le document, retire les propositions automatiques (état vide) et réinitialise la démonstration.

---

## Fichiers techniques

| Fichier | Rôle |
|---|---|
| `documents/[uid]/components/Domains/Domains.tsx` | Écran et zone de démonstration |
| `documents/[uid]/components/Domains/TopicPickerDialog.tsx` | Sélecteur de sujets |
| `documents/[uid]/components/Domains/domainsMock.ts` | Taxonomie d'échantillon, scénarios, état, `getDepositDomains()` |
| `documents/[uid]/components/halDomains.ts` | Liste des domaines HAL, partagée avec le dépôt |

État conservé en localStorage, clé `document-domains-v2-{uid}`.

**Données :** identifiants et libellés anglais viennent de la classification OpenAlex liée à l'issue #373 (échantillon de sujets sur 4 515). Les traductions françaises et les scores sont des propositions de maquette.

---

## Questions ouvertes

- **Sujet principal en données :** le moissonneur ne conserve pas le champ `primary_topic` d'OpenAlex, seulement les sujets et leur score. Le principal se déduit du meilleur score, sauf si une publication a plusieurs notices OpenAlex. Faut-il transmettre un indicateur explicite (moissonneur, IKG, Apollo) ?
- **Sujet principal sans OpenAlex :** pour une publication sans notice OpenAlex, faut-il permettre de désigner un sujet principal parmi les sujets validés ou saisis ?
- **Propositions à côté d'OpenAlex :** faut-il les replier, comme ici, les limiter à 2 ou 3, ou ne pas les afficher du tout quand OpenAlex a classé la publication ?

- **Niveau de saisie :** cette maquette limite la saisie au sujet, alors que celle de l'issue #373 permet de choisir à n'importe quel niveau. À trancher avec le consortium.
- **Traduction :** la feuille liée à l'issue #373 ne contient aucun libellé français. Les 275 libellés de niveaux restent à traduire.
- **Score :** faut-il l'afficher aux chercheurs, alors que ceux d'OpenAlex et de la génération ne sont pas forcément comparables ?
- **Validation :** une proposition validée doit-elle se distinguer d'une saisie à la main à l'écran ? Il est prévu de créer le même lien manuel pour les deux.
- **Notice HAL existante :** un domaine attribué pourrait-il devenir une proposition de l'onglet « Compléter dans HAL » ? Pour l'instant, il ne modifie pas la notice.
