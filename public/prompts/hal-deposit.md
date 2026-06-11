# Dépôt dans HAL — Descriptif fonctionnel (état courant)

> Dernière mise à jour : juin 2026

## Contexte

SoVisu+ peut déposer automatiquement des publications dans HAL via l'API SWORD d'AureHAL. La maquette simule l'intégralité du parcours utilisateur, y compris le cycle de modération post-dépôt. Voir aussi l'issue GitHub [#838 — automated hal deposit](https://github.com/CRISalid-esr/SoVisuPlus/issues/838) pour l'état des expérimentations avec l'API SWORD.

L'onglet est affiché dans `documents/[uid]/page.tsx` (onglet "Déposer dans HAL") et masqué dès que la publication possède un enregistrement HAL réel (`records.find(r => r.platform === BibliographicPlatform.HAL)`).

---

## Flux utilisateur

```
Formulaire  →  Récapitulatif  →  Upload animé  →  État de dépôt
   (form)        (review)        (uploading)      (moderation | accepted | rejected | changes_requested)
```

### Étape 1 — Formulaire

Sections en lecture seule (injectées depuis les autres onglets) :

| Section | Source |
|---|---|
| Titre + résumé | `selectedDocument.titles` / `.abstracts` (langue fr en priorité) |
| Auteurs + affiliations | `selectedDocument.contributions` triées par rang |

Champs à saisir :

| Champ | Obligatoire | Condition |
|---|---|---|
| Type de document | Oui | toujours |
| Domaines HAL | Oui | toujours (min. 1) |
| Langue | Oui | toujours |
| Date (publication / congrès / soutenance) | Oui | toujours |
| Licence de diffusion | Oui | toujours |
| Nom de la revue | Oui | type = `ART` |
| Titre du congrès + ville + pays | Oui | type = `COMM`, `POSTER`, `PRESCONF` |
| Institution / organisme de délivrance | Oui | type = `THESE`, `HDR`, `REPORT` |
| Directeur de thèse / président du jury | Oui | type = `THESE`, `HDR` |
| Titre de l'ouvrage | Oui | type = `COUV` |
| Fichier PDF principal | Oui | toujours |
| Fichiers complémentaires | Non | toujours |

Types de documents HAL disponibles : `ART` · `COMM` · `THESE` · `HDR` · `OUV` · `COUV` · `REPORT` · `POSTER` · `PRESCONF`

### Étape 2 — Récapitulatif

Affiche toutes les valeurs saisies dans un `Paper` grisé. Boutons "Modifier" (retour formulaire) et "Confirmer le dépôt".

### Étape 3 — Upload animé

`LinearProgress` de 0 à 100 % (intervalle 180 ms × 10 incréments de 10). Après 100 %, délai de 400 ms puis transition vers l'état de dépôt.

---

## Modèle de statut de dépôt

```ts
type DepositStatusStep = 'moderation' | 'accepted' | 'rejected' | 'changes_requested'

interface DepositStatus {
  step: DepositStatusStep
  submittedAt: string   // ISO 8601
  halId: string         // ex : "hal-04851234"
  hasFile: boolean
}
```

**Persistance :** `localStorage.getItem('hal-deposit-status-{uid}')` — chargé via `useEffect` au montage, écrit à chaque changement d'état.

**Déclencheur initial :**
- Dépôt avec fichier PDF → `step: 'moderation'`
- Dépôt sans fichier (notice uniquement) → `step: 'accepted'`

**`halId` généré en mock :** `hal-0485{random 4 digits}`

---

## États de dépôt — détail UX

### `moderation` — En cours de modération (amber)

Icône `HourglassEmpty` amber.

- Alerte `warning` : délai estimé 1–5 jours ouvrés
- `Paper` grisé : identifiant HAL temporaire en lien `https://hal.science/{halId}` + icône `OpenInNew`
- Date de soumission formatée (`toLocaleDateString('fr-FR', { day, month, year })`)
- Bouton "Retour aux informations bibliographiques"

### `accepted` — Dépôt accepté (vert)

Icône `CheckCircle` vert.

- Alerte `success`
- `Paper` grisé : URL complète `https://hal.science/{halId}` cliquable + `OpenInNew`
- Bouton "Retour aux informations bibliographiques"

### `rejected` — Dépôt rejeté (rouge)

Icône `ErrorOutline` rouge.

- Alerte `error`
- `Paper` fond `#FFF8F8` / bordure `#FFCDD2` : motif du rejet (mock statique)
- Boutons "Déposer à nouveau" (efface le statut, retour formulaire) + "Retour" (texte neutre)

### `changes_requested` — Modifications demandées (orange)

Icône `WarningAmber` orange.

- Alerte `warning`
- `Paper` fond `#FFFBF0` / bordure `#FFE082` : commentaire du modérateur (mock statique)
- Boutons "Modifier et déposer à nouveau" (efface le statut, retour formulaire) + "Retour"

---

## Zone démo (switcher d'états)

Composant interne `DemoSwitcher` affiché en bas de chaque écran de statut, séparé par une ligne pointillée (`border-top: 1px dashed`).

Contient :
- Label "Simuler :"
- 4 boutons (un par état) — `variant="outlined"` pour l'état courant, `variant="text"` sinon
- Bouton "Réinitialiser" (rouge, `ml: 'auto'`) → efface le localStorage et remet le formulaire

Appelle `simulateStatus(step)` qui fait `saveDepositStatus({ ...depositStatus, step })`.

---

## Indicateur dans la liste des documents

`HalStatusCellBadge` expose un quatrième type `PendingModeration` (chip bleu `color="info"` + icône `HourglassEmpty`) qui s'affiche dans la colonne HAL de la liste des publications quand un dépôt est en cours de modération.

**Fonctionnement :**
- `HalStatusCell` lit `localStorage.getItem('hal-deposit-status-{uid}')` au montage (`useEffect`)
- Si `parsed.step === 'moderation'` → badge `PendingModeration` à la place du rouge "Hors HAL"
- Dès que le statut change (accepté / rejeté / modifications demandées / réinitialisé), le badge disparaît au prochain rendu de la liste

| Type | Couleur MUI | Icône | Label |
|---|---|---|---|
| `OutsideHal` | `error` (rouge) | — | Hors HAL |
| `PendingModeration` | `info` (bleu) | `HourglassEmpty` | En cours de modération |
| `OutOfCollection` | `warning` (orange) | type dépôt | Hors collection |
| `InCollection` | `success` (vert) | type dépôt | Dans la collection |

---

## Fichiers techniques

| Fichier | Rôle |
|---|---|
| `HalDeposit.tsx` | Composant unique (~850 lignes) : formulaire, récapitulatif, upload, 4 états de statut, zone démo |
| `HalStatusCellBadge.tsx` | Chip de statut HAL — 4 types dont `PendingModeration` |
| `HalStatusCell.tsx` | Cellule MRT : lit le localStorage pour détecter la modération en cours |

Pas de services dédiés — les listes (domaines, types, licences, langues) et les messages d'exemple (rejet, modifications) sont statiques dans le composant.

**Documents mock pré-configurés** (`src/mocks/data/documents.json` + init localStorage dans `documents/page.tsx`) :

| Document | Titre | Statut dans la liste HAL | Statut dans l'onglet dépôt |
|---|---|---|---|
| `doc-1` | A deep learning approach to climate modeling | Dans la collection (HAL, avec fichier) | — (déjà dans HAL) |
| `doc-2` | Quantum Mechanics: A Modern Introduction | Hors HAL | Formulaire vide |
| `doc-3` | Modélisation numérique des écoulements turbulents | **En cours de modération** (chip bleu) | État modération |
| `doc-4` | Migrations et identités en contexte postcolonial | Hors HAL | État rejeté (motif affiché) |
| `doc-5` | État de l'art des systèmes de recommandation | Hors HAL | Modifications demandées |
| `doc-6` | Biodiversité des sols agricoles | Hors collection (HAL, notice, autre labo) | — (déjà dans HAL) |

Les statuts de `doc-3`, `doc-4` et `doc-5` sont initialisés en localStorage au premier chargement de la page documents (uniquement en mode mock). Ils ne s'écrasent pas si l'utilisateur a modifié l'état via le switcher démo.

---

## Questions ouvertes (métier)

1. **Notice vs fichier** : quand un dépôt sans fichier (notice) est soumis, la maquette suppose qu'il passe directement en `accepted` (pas de modération). Est-ce le comportement attendu par les utilisateurs, ou veut-on toujours montrer un état intermédiaire avant la publication ?

2. **Messages de rejet et de modifications demandées** : dans la maquette, les motifs sont des exemples fictifs. Comment les utilisateurs s'attendent-ils à être informés — dans l'interface SoVisu+, par e-mail HAL, ou les deux ?

3. **Droits d'embargo** : HAL permet de déposer un fichier avec accès différé (embargo éditeur). Ce champ n'est pas encore dans le formulaire. Est-ce un besoin fréquent des utilisateurs du consortium ?

4. **Domaines HAL** : le formulaire propose une liste de 9 domaines (mock). La liste réelle AureHAL est hiérarchique (~200 entrées). Une recherche par saisie libre ou une sélection arborescente sont-elles préférables pour les utilisateurs ?
