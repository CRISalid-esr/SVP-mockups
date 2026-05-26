# SoVisu+ — Maquettes interactives

> **Testez les futures fonctionnalités de SoVisu+ et dites-nous ce que vous en pensez !**

---

## C'est quoi ce dépôt ?

Ce dépôt héberge les **maquettes interactives** de [SoVisu+](https://github.com/CRISalid-esr/SoVisu), l'application de gestion des publications et des identifiants chercheurs développée par le consortium CRISalid.

L'idée est simple : **avant de développer une nouvelle fonctionnalité en production**, on la prototype ici sous forme de maquette cliquable. Vous pouvez l'explorer, la tester dans des conditions proches du réel, et nous faire part de vos retours — avant qu'une seule ligne de code "définitif" ne soit écrite.

C'est votre chance d'influencer directement l'outil que vous utilisez au quotidien.

---

## 🚀 Accéder aux maquettes

Pas besoin d'installer quoi que ce soit. Les maquettes sont déployées automatiquement et accessibles en ligne :

### 👉 [crisalid-esr.github.io/SVP-mockups](https://crisalid-esr.github.io/SVP-mockups/)

L'interface utilise des **données fictives** : les publications, auteurs et structures affichés sont des exemples inventés pour les besoins de la démonstration. Vous pouvez cliquer partout sans risque.

---

## 🗺️ Fonctionnalités actuellement en maquette

| Fonctionnalité | État | Ce qu'on prototype |
|---|---|---|
| **Onglet Auteurs** | ✅ Disponible | Identifier et aligner les auteurs et affiliations dans HAL |
| **Déposer dans HAL** | ✅ Disponible | Formulaire de dépôt HAL pré-rempli depuis les métadonnées |
| **Activités de recherche** | ✅ Disponible | Gérer projets, encadrements, brevets, enseignements… |
| **Expertises — Carte mentale** | ✅ Disponible | Représenter ses expertises sous forme de graphe interactif |
| **Expertises — Vue des expertises** | ✅ Disponible | Liste structurée des expertises avec terrains, concepts et activités associés |
| **Expertises — Cartes impact** | ✅ Disponible | Décliner ses expertises selon le public (chercheurs, industriels, médias…) |

Les maquettes évoluent régulièrement. Revenez souvent !

---

## 💬 Comment donner votre avis ?

Vos retours sont **essentiels**. Voici les deux canaux prévus pour échanger :

### Les Discussions — pour les questions et idées générales

➡️ [Aller dans les Discussions](../../discussions)

Les Discussions sont l'endroit idéal pour :
- **Partager une impression générale** sur une fonctionnalité
- **Poser une question** sur le fonctionnement prévu
- **Proposer une amélioration** ou une alternative de design
- **Engager un dialogue** avec l'équipe et les autres membres du consortium

N'hésitez pas à répondre aux discussions ouvertes par d'autres membres — c'est toute la richesse d'un processus collaboratif.

### Les Issues — pour signaler un problème précis

➡️ [Créer une issue](../../issues/new)

Les Issues sont adaptées quand vous repérez :
- Un **bug dans la maquette** (bouton qui ne répond pas, affichage cassé…)
- Un **cas d'usage non couvert** que vous souhaitez voir prototypé
- Une **incohérence** entre ce que la maquette montre et ce que vous attendez

---

## 🧭 Guide de test rapide

Voici quelques parcours pour explorer les maquettes en quelques minutes :

### Parcours 1 — Aligner les auteurs d'une publication
1. Ouvrir la page d'une publication
2. Cliquer sur l'onglet **Auteurs**
3. Explorer les statuts des auteurs (trouvé / non trouvé dans HAL)
4. Essayer de confirmer un candidat HAL ou une affiliation

### Parcours 2 — Déposer une publication dans HAL
1. Ouvrir la publication **Quantum Mechanics: A Modern Introduction** (doc-2)
2. Cliquer sur l'onglet **Déposer dans HAL** *(visible uniquement pour les publications absentes de HAL)*
3. Parcourir le formulaire jusqu'à l'étape de confirmation

### Parcours 3 — Gérer ses activités de recherche
1. Ouvrir le menu **Activités de recherche** dans la barre latérale
2. Explorer les 8 types d'activités (projets, brevets, encadrements…)
3. Essayer d'ajouter une activité via le bouton **Ajouter une activité**

### Parcours 4 — Cartographier ses expertises
1. Ouvrir le menu **Expertises** dans la barre latérale
2. L'onglet **Carte mentale** s'ouvre avec un exemple pré-rempli (migrations pour le travail)
3. Explorer le graphe : déplacer les nœuds, cliquer sur un lien pour changer son type de relation
4. Saisir une description de vos propres expertises dans le panneau gauche et cliquer **Générer le graphe**
5. Modifier le graphe généré : ajouter des nœuds, relier des concepts, affiner les types de relations
6. Enregistrer votre carte (bouton **Enregistrer**) ou exporter le JSON

### Parcours 5 — Décliner ses expertises en cartes impact
1. Ouvrir le menu **Expertises** et cliquer sur l'onglet **Cartes impact**
2. Parcourir les cartes existantes organisées par famille (nœud d'expertise) et par profil d'audience
3. Cliquer sur une carte pour l'éditer (titre, description, audiences, spécificités, statut, visibilité)
4. Créer une nouvelle carte via le bouton **Nouvelle carte** — wizard en 3 étapes
5. Dupliquer ou archiver une carte via le menu ⋮

---

## 🤝 Qui est concerné ?

Ces maquettes s'adressent à **toutes les personnes impliquées dans le consortium CRISalid** :

- **Chercheurs et enseignants-chercheurs** — pour valider que les interfaces correspondent à vos usages réels
- **Gestionnaires de la recherche et documentalistes** — pour vérifier l'adéquation avec vos processus métier
- **Équipes informatiques des établissements** — pour anticiper les besoins d'intégration
- **Porteurs du projet SoVisu+** — pour itérer rapidement sur les choix de design

Pas besoin d'être développeur pour participer. Un regard d'utilisateur est exactement ce dont nous avons besoin.

---

## 🔄 Comment ça fonctionne en coulisses ?

Ce dépôt contient une application [Next.js](https://nextjs.org/) qui tourne entièrement côté navigateur, avec des données fictives. À chaque mise à jour du code, le site est automatiquement reconstruit et redéployé sur GitHub Pages via une action CI/CD.

Aucune donnée saisie dans les formulaires n'est envoyée ni enregistrée nulle part. Tout se passe localement dans votre navigateur.

---

## 📄 Licence

Ce projet est distribué sous licence [CeCILL v2.1](http://www.cecill.info/licences/Licence_CeCILL_V2.1-fr.txt) (compatible GPL).
