'use client'

import useStore from '@/stores/global_store'
import { BibliographicPlatform } from '@/types/BibliographicPlatform'
import { ExtendedLanguageCode } from '@/types/ExtendLanguageCode'
import {
  Add,
  AttachFile,
  CheckCircle,
  Close,
  CloudUpload,
  ErrorOutline,
  HourglassEmpty,
  OpenInNew,
  WarningAmber,
} from '@mui/icons-material'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  Link,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import * as Lingui from '@lingui/core'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL = '#006A61'
const TEAL_DARK = '#005550'
const TEAL_LIGHT = '#E8F5F4'
const SURFACE = '#F5F7F6'
const BORDER = '#E5E7E6'
const TEXT = '#2D3836'
const MUTED = '#6F7977'

// ─── Static data ──────────────────────────────────────────────────────────────

const HAL_DOMAINS = [
  { value: 'chim', label: 'Chimie' },
  { value: 'chim.anal', label: 'Chimie / Chimie analytique' },
  { value: 'chim.cata', label: 'Chimie / Catalyse' },
  { value: 'chim.chem', label: 'Chimie / Chemo-informatique' },
  { value: 'chim.coor', label: 'Chimie / Chimie de coordination' },
  { value: 'chim.cris', label: 'Chimie / Cristallographie' },
  { value: 'chim.geni', label: 'Chimie / Génie chimique' },
  { value: 'chim.inor', label: 'Chimie / Chimie inorganique' },
  { value: 'chim.mate', label: 'Chimie / Matériaux' },
  { value: 'chim.orga', label: 'Chimie / Chimie organique' },
  { value: 'chim.othe', label: 'Chimie / Autre' },
  { value: 'chim.poly', label: 'Chimie / Polymères' },
  { value: 'chim.radio', label: 'Chimie / Radiochimie' },
  { value: 'chim.theo', label: 'Chimie / Chimie théorique et/ou physique' },
  { value: 'chim.ther', label: 'Chimie / Chimie thérapeutique' },
  { value: 'info', label: 'Informatique [cs]' },
  { value: 'info.eiah', label: 'Informatique / Environnements Informatiques pour l\'Apprentissage Humain' },
  { value: 'info.info-ai', label: 'Informatique / Intelligence artificielle [cs.AI]' },
  { value: 'info.info-ao', label: 'Informatique / Arithmétique des ordinateurs' },
  { value: 'info.info-ar', label: 'Informatique / Architectures Matérielles [cs.AR]' },
  { value: 'info.info-au', label: 'Informatique / Automatique' },
  { value: 'info.info-bi', label: 'Informatique / Bio-informatique [q-bio.QM]' },
  { value: 'info.info-bt', label: 'Informatique / Biotechnologie' },
  { value: 'info.info-cc', label: 'Informatique / Complexité [cs.CC]' },
  { value: 'info.info-ce', label: 'Informatique / Ingénierie, finance et science [cs.CE]' },
  { value: 'info.info-cg', label: 'Informatique / Géométrie algorithmique [cs.CG]' },
  { value: 'info.info-cl', label: 'Informatique / Informatique et langage [cs.CL]' },
  { value: 'info.info-cr', label: 'Informatique / Cryptographie et sécurité [cs.CR]' },
  { value: 'info.info-cv', label: 'Informatique / Vision par ordinateur et reconnaissance de formes [cs.CV]' },
  { value: 'info.info-cy', label: 'Informatique / Ordinateur et société [cs.CY]' },
  { value: 'info.info-db', label: 'Informatique / Base de données [cs.DB]' },
  { value: 'info.info-dc', label: 'Informatique / Calcul parallèle, distribué et partagé [cs.DC]' },
  { value: 'info.info-dl', label: 'Informatique / Bibliothèque électronique [cs.DL]' },
  { value: 'info.info-dm', label: 'Informatique / Mathématique discrète [cs.DM]' },
  { value: 'info.info-ds', label: 'Informatique / Algorithme et structure de données [cs.DS]' },
  { value: 'info.info-es', label: 'Informatique / Systèmes embarqués' },
  { value: 'info.info-et', label: 'Informatique / Technologies Émergeantes [cs.ET]' },
  { value: 'info.info-fl', label: 'Informatique / Théorie et langage formel [cs.FL]' },
  { value: 'info.info-gr', label: 'Informatique / Synthèse d\'image et réalité virtuelle [cs.GR]' },
  { value: 'info.info-gt', label: 'Informatique / Informatique et théorie des jeux [cs.GT]' },
  { value: 'info.info-hc', label: 'Informatique / Interface homme-machine [cs.HC]' },
  { value: 'info.info-ia', label: 'Informatique / Ingénierie assistée par ordinateur' },
  { value: 'info.info-im', label: 'Informatique / Imagerie médicale' },
  { value: 'info.info-ir', label: 'Informatique / Recherche d\'information [cs.IR]' },
  { value: 'info.info-it', label: 'Informatique / Théorie de l\'information [cs.IT]' },
  { value: 'info.info-iu', label: 'Informatique / Informatique ubiquitaire' },
  { value: 'info.info-lg', label: 'Informatique / Apprentissage [cs.LG]' },
  { value: 'info.info-lo', label: 'Informatique / Logique en informatique [cs.LO]' },
  { value: 'info.info-ma', label: 'Informatique / Système multi-agents [cs.MA]' },
  { value: 'info.info-mc', label: 'Informatique / Informatique mobile' },
  { value: 'info.info-mm', label: 'Informatique / Multimédia [cs.MM]' },
  { value: 'info.info-mo', label: 'Informatique / Modélisation et simulation' },
  { value: 'info.info-ms', label: 'Informatique / Logiciel mathématique [cs.MS]' },
  { value: 'info.info-na', label: 'Informatique / Analyse numérique [cs.NA]' },
  { value: 'info.info-ne', label: 'Informatique / Réseau de neurones [cs.NE]' },
  { value: 'info.info-ni', label: 'Informatique / Réseaux et télécommunications [cs.NI]' },
  { value: 'info.info-oh', label: 'Informatique / Autre [cs.OH]' },
  { value: 'info.info-os', label: 'Informatique / Système d\'exploitation [cs.OS]' },
  { value: 'info.info-pf', label: 'Informatique / Performance et fiabilité [cs.PF]' },
  { value: 'info.info-pl', label: 'Informatique / Langage de programmation [cs.PL]' },
  { value: 'info.info-rb', label: 'Informatique / Robotique [cs.RO]' },
  { value: 'info.info-ro', label: 'Informatique / Recherche opérationnelle [cs.RO]' },
  { value: 'info.info-sc', label: 'Informatique / Calcul formel [cs.SC]' },
  { value: 'info.info-sd', label: 'Informatique / Son [cs.SD]' },
  { value: 'info.info-se', label: 'Informatique / Génie logiciel [cs.SE]' },
  { value: 'info.info-si', label: 'Informatique / Réseaux sociaux et d\'information [cs.SI]' },
  { value: 'info.info-sy', label: 'Informatique / Systèmes et contrôle [cs.SY]' },
  { value: 'info.info-ti', label: 'Informatique / Traitement des images [eess.IV]' },
  { value: 'info.info-ts', label: 'Informatique / Traitement du signal et de l\'image [eess.SP]' },
  { value: 'info.info-tt', label: 'Informatique / Traitement du texte et du document' },
  { value: 'info.info-wb', label: 'Informatique / Web' },
  { value: 'math', label: 'Mathématiques [math]' },
  { value: 'math.math-ac', label: 'Mathématiques / Algèbre commutative [math.AC]' },
  { value: 'math.math-ag', label: 'Mathématiques / Géométrie algébrique [math.AG]' },
  { value: 'math.math-ap', label: 'Mathématiques / Equations aux dérivées partielles [math.AP]' },
  { value: 'math.math-at', label: 'Mathématiques / Topologie algébrique [math.AT]' },
  { value: 'math.math-ca', label: 'Mathématiques / Analyse classique [math.CA]' },
  { value: 'math.math-co', label: 'Mathématiques / Combinatoire [math.CO]' },
  { value: 'math.math-ct', label: 'Mathématiques / Catégories et ensembles [math.CT]' },
  { value: 'math.math-cv', label: 'Mathématiques / Variables complexes [math.CV]' },
  { value: 'math.math-dg', label: 'Mathématiques / Géométrie différentielle [math.DG]' },
  { value: 'math.math-ds', label: 'Mathématiques / Systèmes dynamiques [math.DS]' },
  { value: 'math.math-fa', label: 'Mathématiques / Analyse fonctionnelle [math.FA]' },
  { value: 'math.math-gm', label: 'Mathématiques / Mathématiques générales [math.GM]' },
  { value: 'math.math-gn', label: 'Mathématiques / Topologie générale [math.GN]' },
  { value: 'math.math-gr', label: 'Mathématiques / Théorie des groupes [math.GR]' },
  { value: 'math.math-gt', label: 'Mathématiques / Topologie géométrique [math.GT]' },
  { value: 'math.math-ho', label: 'Mathématiques / Histoire et perspectives sur les mathématiques [math.HO]' },
  { value: 'math.math-it', label: 'Mathématiques / Théorie de l\'information et codage [math.IT]' },
  { value: 'math.math-kt', label: 'Mathématiques / K-théorie et homologie [math.KT]' },
  { value: 'math.math-lo', label: 'Mathématiques / Logique [math.LO]' },
  { value: 'math.math-mg', label: 'Mathématiques / Géométrie métrique [math.MG]' },
  { value: 'math.math-mp', label: 'Mathématiques / Physique mathématique [math-ph]' },
  { value: 'math.math-na', label: 'Mathématiques / Analyse numérique [math.NA]' },
  { value: 'math.math-nt', label: 'Mathématiques / Théorie des nombres [math.NT]' },
  { value: 'math.math-oa', label: 'Mathématiques / Algèbres d\'opérateurs [math.OA]' },
  { value: 'math.math-oc', label: 'Mathématiques / Optimisation et contrôle [math.OC]' },
  { value: 'math.math-pr', label: 'Mathématiques / Probabilités [math.PR]' },
  { value: 'math.math-qa', label: 'Mathématiques / Algèbres quantiques [math.QA]' },
  { value: 'math.math-ra', label: 'Mathématiques / Anneaux et algèbres [math.RA]' },
  { value: 'math.math-rt', label: 'Mathématiques / Théorie des représentations [math.RT]' },
  { value: 'math.math-sg', label: 'Mathématiques / Géométrie symplectique [math.SG]' },
  { value: 'math.math-sp', label: 'Mathématiques / Théorie spectrale [math.SP]' },
  { value: 'math.math-st', label: 'Mathématiques / Statistiques [math.ST]' },
  { value: 'nlin', label: 'Science non linéaire [physics]' },
  { value: 'nlin.nlin-ao', label: 'Science non linéaire / Adaptation et Systèmes auto-organisés [nlin.AO]' },
  { value: 'nlin.nlin-cd', label: 'Science non linéaire / Dynamique Chaotique [nlin.CD]' },
  { value: 'nlin.nlin-cg', label: 'Science non linéaire / Automates cellulaires et gaz sur réseau [nlin.CG]' },
  { value: 'nlin.nlin-ps', label: 'Science non linéaire / Formation de Structures et Solitons [nlin.PS]' },
  { value: 'nlin.nlin-si', label: 'Science non linéaire / Systèmes Solubles et Intégrables [nlin.SI]' },
  { value: 'phys', label: 'Physique [physics]' },
  { value: 'phys.astr', label: 'Physique / Astrophysique [astro-ph]' },
  { value: 'phys.astr.co', label: 'Physique / Astrophysique / Cosmologie et astrophysique extra-galactique [astro-ph.CO]' },
  { value: 'phys.astr.ep', label: 'Physique / Astrophysique / Planétologie et astrophysique de la terre [astro-ph.EP]' },
  { value: 'phys.astr.ga', label: 'Physique / Astrophysique / Astrophysique galactique [astro-ph.GA]' },
  { value: 'phys.astr.he', label: 'Physique / Astrophysique / Phénomènes cosmiques de haute energie [astro-ph.HE]' },
  { value: 'phys.astr.im', label: 'Physique / Astrophysique / Instrumentation et méthodes pour l\'astrophysique [astro-ph.IM]' },
  { value: 'phys.astr.sr', label: 'Physique / Astrophysique / Astrophysique stellaire et solaire [astro-ph.SR]' },
  { value: 'phys.cond', label: 'Physique / Matière Condensée [cond-mat]' },
  { value: 'phys.cond.cm-ds-nn', label: 'Physique / Matière Condensée / Systèmes désordonnés et réseaux de neurones' },
  { value: 'phys.cond.cm-gen', label: 'Physique / Matière Condensée / Autre [cond-mat.other]' },
  { value: 'phys.cond.cm-ms', label: 'Physique / Matière Condensée / Science des matériaux [cond-mat.mtrl-sci]' },
  { value: 'phys.cond.cm-msqhe', label: 'Physique / Matière Condensée / Systèmes mésoscopiques et effet Hall quantique' },
  { value: 'phys.cond.cm-s', label: 'Physique / Matière Condensée / Supraconductivité [cond-mat.supr-con]' },
  { value: 'phys.cond.cm-sce', label: 'Physique / Matière Condensée / Electrons fortement corrélés [cond-mat.str-el]' },
  { value: 'phys.cond.cm-scm', label: 'Physique / Matière Condensée / Matière Molle [cond-mat.soft]' },
  { value: 'phys.cond.cm-sm', label: 'Physique / Matière Condensée / Mécanique statistique [cond-mat.stat-mech]' },
  { value: 'phys.cond.gas', label: 'Physique / Matière Condensée / Gaz Quantiques [cond-mat.quant-gas]' },
  { value: 'phys.grqc', label: 'Physique / Relativité Générale et Cosmologie Quantique [gr-qc]' },
  { value: 'phys.hexp', label: 'Physique / Physique des Hautes Energies - Expérience [hep-ex]' },
  { value: 'phys.hlat', label: 'Physique / Physique des Hautes Energies - Réseau [hep-lat]' },
  { value: 'phys.hphe', label: 'Physique / Physique des Hautes Energies - Phénoménologie [hep-ph]' },
  { value: 'phys.hthe', label: 'Physique / Physique des Hautes Energies - Théorie [hep-th]' },
  { value: 'phys.meca', label: 'Physique / Mécanique [physics]' },
  { value: 'phys.meca.acou', label: 'Physique / Mécanique / Acoustique' },
  { value: 'phys.meca.biom', label: 'Physique / Mécanique / Biomécanique' },
  { value: 'phys.meca.geme', label: 'Physique / Mécanique / Génie mécanique' },
  { value: 'phys.meca.mefl', label: 'Physique / Mécanique / Mécanique des fluides' },
  { value: 'phys.meca.mema', label: 'Physique / Mécanique / Mécanique des matériaux' },
  { value: 'phys.meca.msmeca', label: 'Physique / Mécanique / Matériaux et structures en mécanique' },
  { value: 'phys.meca.solid', label: 'Physique / Mécanique / Mécanique des solides' },
  { value: 'phys.meca.stru', label: 'Physique / Mécanique / Mécanique des structures' },
  { value: 'phys.meca.ther', label: 'Physique / Mécanique / Thermique' },
  { value: 'phys.meca.vibr', label: 'Physique / Mécanique / Vibrations' },
  { value: 'phys.mphy', label: 'Physique / Physique mathématique [math-ph]' },
  { value: 'phys.nexp', label: 'Physique / Physique Nucléaire Expérimentale [nucl-ex]' },
  { value: 'phys.nucl', label: 'Physique / Physique Nucléaire Théorique [nucl-th]' },
  { value: 'phys.phys', label: 'Physique / Physique [physics]' },
  { value: 'phys.phys.phys-acc-ph', label: 'Physique / Physique des accélérateurs' },
  { value: 'phys.phys.phys-ao-ph', label: 'Physique / Physique Atmosphérique et Océanique' },
  { value: 'phys.phys.phys-atm-ph', label: 'Physique / Agrégats Moléculaires et Atomiques' },
  { value: 'phys.phys.phys-atom-ph', label: 'Physique / Physique Atomique' },
  { value: 'phys.phys.phys-bio-ph', label: 'Physique / Biophysique' },
  { value: 'phys.phys.phys-chem-ph', label: 'Physique / Chimie-Physique' },
  { value: 'phys.phys.phys-class-ph', label: 'Physique / Physique Classique' },
  { value: 'phys.phys.phys-comp-ph', label: 'Physique / Physique Numérique' },
  { value: 'phys.phys.phys-data-an', label: 'Physique / Analyse de données, Statistiques et Probabilités' },
  { value: 'phys.phys.phys-ed-ph', label: 'Physique / Enseignement de la physique' },
  { value: 'phys.phys.phys-flu-dyn', label: 'Physique / Dynamique des Fluides' },
  { value: 'phys.phys.phys-gen-ph', label: 'Physique / Physique Générale' },
  { value: 'phys.phys.phys-geo-ph', label: 'Physique / Géophysique' },
  { value: 'phys.phys.phys-hist-ph', label: 'Physique / Histoire de la Physique' },
  { value: 'phys.phys.phys-ins-det', label: 'Physique / Instrumentations et Détecteurs' },
  { value: 'phys.phys.phys-med-ph', label: 'Physique / Physique Médicale' },
  { value: 'phys.phys.phys-optics', label: 'Physique / Optique' },
  { value: 'phys.phys.phys-plasm-ph', label: 'Physique / Physique des plasmas' },
  { value: 'phys.phys.phys-pop-ph', label: 'Physique / Physique : vulgarisation' },
  { value: 'phys.phys.phys-soc-ph', label: 'Physique / Physique et Société' },
  { value: 'phys.phys.phys-space-ph', label: 'Physique / Physique de l\'espace' },
  { value: 'phys.qphy', label: 'Physique / Physique Quantique [quant-ph]' },
  { value: 'qfin', label: 'Économie et finance quantitative [q-fin]' },
  { value: 'qfin.cp', label: 'Économie et finance quantitative / Finance quantitative' },
  { value: 'qfin.gn', label: 'Économie et finance quantitative / Finance' },
  { value: 'qfin.pm', label: 'Économie et finance quantitative / Gestion de portefeuilles' },
  { value: 'qfin.pr', label: 'Économie et finance quantitative / Pricing' },
  { value: 'qfin.rm', label: 'Économie et finance quantitative / Gestion des risques' },
  { value: 'qfin.st', label: 'Économie et finance quantitative / Econométrie de la finance' },
  { value: 'qfin.tr', label: 'Économie et finance quantitative / Microstructure des marchés' },
  { value: 'scco', label: 'Sciences cognitives' },
  { value: 'scco.comp', label: 'Sciences cognitives / Informatique' },
  { value: 'scco.ling', label: 'Sciences cognitives / Linguistique' },
  { value: 'scco.neur', label: 'Sciences cognitives / Neurosciences' },
  { value: 'scco.psyc', label: 'Sciences cognitives / Psychologie' },
  { value: 'sde', label: 'Sciences de l\'environnement' },
  { value: 'sde.be', label: 'Sciences de l\'environnement / Biodiversité et Ecologie' },
  { value: 'sde.es', label: 'Sciences de l\'environnement / Environnement et Société' },
  { value: 'sde.ie', label: 'Sciences de l\'environnement / Ingénierie de l\'environnement' },
  { value: 'sde.mcg', label: 'Sciences de l\'environnement / Milieux et Changements globaux' },
  { value: 'sdu', label: 'Planète et Univers [physics]' },
  { value: 'sdu.astr', label: 'Planète et Univers / Astrophysique [astro-ph]' },
  { value: 'sdu.astr.co', label: 'Planète et Univers / Astrophysique / Cosmologie et astrophysique extra-galactique' },
  { value: 'sdu.astr.ep', label: 'Planète et Univers / Astrophysique / Planétologie et astrophysique de la terre' },
  { value: 'sdu.astr.ga', label: 'Planète et Univers / Astrophysique / Astrophysique galactique' },
  { value: 'sdu.astr.he', label: 'Planète et Univers / Astrophysique / Phénomènes cosmiques de haute energie' },
  { value: 'sdu.astr.im', label: 'Planète et Univers / Astrophysique / Instrumentation et méthodes pour l\'astrophysique' },
  { value: 'sdu.astr.sr', label: 'Planète et Univers / Astrophysique / Astrophysique stellaire et solaire' },
  { value: 'sdu.envi', label: 'Planète et Univers / Interfaces continentales, environnement' },
  { value: 'sdu.ocean', label: 'Planète et Univers / Océan, Atmosphère' },
  { value: 'sdu.other', label: 'Planète et Univers / Autre' },
  { value: 'sdu.stu', label: 'Planète et Univers / Sciences de la Terre' },
  { value: 'sdu.stu.ag', label: 'Planète et Univers / Sciences de la Terre / Géologie appliquée' },
  { value: 'sdu.stu.cl', label: 'Planète et Univers / Sciences de la Terre / Climatologie' },
  { value: 'sdu.stu.gc', label: 'Planète et Univers / Sciences de la Terre / Géochimie' },
  { value: 'sdu.stu.gl', label: 'Planète et Univers / Sciences de la Terre / Glaciologie' },
  { value: 'sdu.stu.gm', label: 'Planète et Univers / Sciences de la Terre / Géomorphologie' },
  { value: 'sdu.stu.gp', label: 'Planète et Univers / Sciences de la Terre / Géophysique' },
  { value: 'sdu.stu.hy', label: 'Planète et Univers / Sciences de la Terre / Hydrologie' },
  { value: 'sdu.stu.me', label: 'Planète et Univers / Sciences de la Terre / Météorologie' },
  { value: 'sdu.stu.mi', label: 'Planète et Univers / Sciences de la Terre / Minéralogie' },
  { value: 'sdu.stu.oc', label: 'Planète et Univers / Sciences de la Terre / Océanographie' },
  { value: 'sdu.stu.pe', label: 'Planète et Univers / Sciences de la Terre / Pétrographie' },
  { value: 'sdu.stu.pg', label: 'Planète et Univers / Sciences de la Terre / Paléontologie' },
  { value: 'sdu.stu.pl', label: 'Planète et Univers / Sciences de la Terre / Planétologie' },
  { value: 'sdu.stu.st', label: 'Planète et Univers / Sciences de la Terre / Stratigraphie' },
  { value: 'sdu.stu.te', label: 'Planète et Univers / Sciences de la Terre / Tectonique' },
  { value: 'sdu.stu.vo', label: 'Planète et Univers / Sciences de la Terre / Volcanologie' },
  { value: 'sdv', label: 'Sciences du Vivant [q-bio]' },
  { value: 'sdv.aen', label: 'Sciences du Vivant / Alimentation et Nutrition' },
  { value: 'sdv.ba', label: 'Sciences du Vivant / Biologie animale' },
  { value: 'sdv.ba.mvsa', label: 'Sciences du Vivant / Biologie animale / Médecine vétérinaire et santé animale' },
  { value: 'sdv.ba.zi', label: 'Sciences du Vivant / Biologie animale / Zoologie des invertébrés' },
  { value: 'sdv.ba.zv', label: 'Sciences du Vivant / Biologie animale / Zoologie des vertébrés' },
  { value: 'sdv.bbm', label: 'Sciences du Vivant / Biochimie, Biologie Moléculaire' },
  { value: 'sdv.bbm.bc', label: 'Sciences du Vivant / Biochimie, Biologie Moléculaire / Biochimie' },
  { value: 'sdv.bbm.bm', label: 'Sciences du Vivant / Biochimie, Biologie Moléculaire / Biologie moléculaire' },
  { value: 'sdv.bbm.bp', label: 'Sciences du Vivant / Biochimie, Biologie Moléculaire / Biophysique' },
  { value: 'sdv.bbm.bs', label: 'Sciences du Vivant / Biochimie, Biologie Moléculaire / Biologie structurale' },
  { value: 'sdv.bbm.gtp', label: 'Sciences du Vivant / Biochimie, Biologie Moléculaire / Génomique, Transcriptomique et Protéomique' },
  { value: 'sdv.bbm.mn', label: 'Sciences du Vivant / Biochimie, Biologie Moléculaire / Réseaux moléculaires' },
  { value: 'sdv.bc', label: 'Sciences du Vivant / Biologie cellulaire' },
  { value: 'sdv.bc.bc', label: 'Sciences du Vivant / Biologie cellulaire / Organisation et fonctions cellulaires' },
  { value: 'sdv.bc.ic', label: 'Sciences du Vivant / Biologie cellulaire / Interactions cellulaires' },
  { value: 'sdv.bdd', label: 'Sciences du Vivant / Biologie du développement' },
  { value: 'sdv.bdd.eo', label: 'Sciences du Vivant / Biologie du développement / Embryologie et organogenèse' },
  { value: 'sdv.bdd.gam', label: 'Sciences du Vivant / Biologie du développement / Gamétogenèse' },
  { value: 'sdv.bdd.mor', label: 'Sciences du Vivant / Biologie du développement / Morphogenèse' },
  { value: 'sdv.bdlr', label: 'Sciences du Vivant / Biologie de la reproduction' },
  { value: 'sdv.bdlr.ra', label: 'Sciences du Vivant / Biologie de la reproduction / Reproduction asexuée' },
  { value: 'sdv.bdlr.rs', label: 'Sciences du Vivant / Biologie de la reproduction / Reproduction sexuée' },
  { value: 'sdv.bibs', label: 'Sciences du Vivant / Bio-Informatique, Biologie Systémique' },
  { value: 'sdv.bid', label: 'Sciences du Vivant / Biodiversité' },
  { value: 'sdv.bid.evo', label: 'Sciences du Vivant / Biodiversité / Evolution' },
  { value: 'sdv.bid.spt', label: 'Sciences du Vivant / Biodiversité / Systématique, phylogénie et taxonomie' },
  { value: 'sdv.bio', label: 'Sciences du Vivant / Biotechnologies' },
  { value: 'sdv.bv', label: 'Sciences du Vivant / Biologie végétale' },
  { value: 'sdv.bv.ap', label: 'Sciences du Vivant / Biologie végétale / Amélioration des plantes' },
  { value: 'sdv.bv.bot', label: 'Sciences du Vivant / Biologie végétale / Botanique' },
  { value: 'sdv.bv.pep', label: 'Sciences du Vivant / Biologie végétale / Phytopathologie et phytopharmacie' },
  { value: 'sdv.can', label: 'Sciences du Vivant / Cancer' },
  { value: 'sdv.ee', label: 'Sciences du Vivant / Ecologie, Environnement' },
  { value: 'sdv.ee.bio', label: 'Sciences du Vivant / Ecologie, Environnement / Bioclimatologie' },
  { value: 'sdv.ee.eco', label: 'Sciences du Vivant / Ecologie, Environnement / Ecosystèmes' },
  { value: 'sdv.ee.ieo', label: 'Sciences du Vivant / Ecologie, Environnement / Interactions entre organismes' },
  { value: 'sdv.ee.sant', label: 'Sciences du Vivant / Ecologie, Environnement / Santé' },
  { value: 'sdv.eth', label: 'Sciences du Vivant / Ethique' },
  { value: 'sdv.gen', label: 'Sciences du Vivant / Génétique' },
  { value: 'sdv.gen.ga', label: 'Sciences du Vivant / Génétique / Génétique animale' },
  { value: 'sdv.gen.gh', label: 'Sciences du Vivant / Génétique / Génétique humaine' },
  { value: 'sdv.gen.gpl', label: 'Sciences du Vivant / Génétique / Génétique des plantes' },
  { value: 'sdv.gen.gpo', label: 'Sciences du Vivant / Génétique / Génétique des populations' },
  { value: 'sdv.ib', label: 'Sciences du Vivant / Ingénierie biomédicale' },
  { value: 'sdv.ib.bio', label: 'Sciences du Vivant / Ingénierie biomédicale / Biomatériaux' },
  { value: 'sdv.ib.ima', label: 'Sciences du Vivant / Ingénierie biomédicale / Imagerie' },
  { value: 'sdv.ib.mn', label: 'Sciences du Vivant / Ingénierie biomédicale / Médecine nucléaire' },
  { value: 'sdv.ida', label: 'Sciences du Vivant / Ingénierie des aliments' },
  { value: 'sdv.imm', label: 'Sciences du Vivant / Immunologie' },
  { value: 'sdv.imm.all', label: 'Sciences du Vivant / Immunologie / Allergologie' },
  { value: 'sdv.imm.ia', label: 'Sciences du Vivant / Immunologie / Immunité adaptative' },
  { value: 'sdv.imm.ii', label: 'Sciences du Vivant / Immunologie / Immunité innée' },
  { value: 'sdv.imm.imm', label: 'Sciences du Vivant / Immunologie / Immunothérapie' },
  { value: 'sdv.imm.vac', label: 'Sciences du Vivant / Immunologie / Vaccinologie' },
  { value: 'sdv.mhep', label: 'Sciences du Vivant / Médecine humaine et pathologie' },
  { value: 'sdv.mhep.aha', label: 'Sciences du Vivant / Médecine humaine et pathologie / Anatomie, Histologie, Anatomopathologie' },
  { value: 'sdv.mhep.chi', label: 'Sciences du Vivant / Médecine humaine et pathologie / Chirurgie' },
  { value: 'sdv.mhep.csc', label: 'Sciences du Vivant / Médecine humaine et pathologie / Cardiologie et système cardiovasculaire' },
  { value: 'sdv.mhep.derm', label: 'Sciences du Vivant / Médecine humaine et pathologie / Dermatologie' },
  { value: 'sdv.mhep.em', label: 'Sciences du Vivant / Médecine humaine et pathologie / Endocrinologie et métabolisme' },
  { value: 'sdv.mhep.geg', label: 'Sciences du Vivant / Médecine humaine et pathologie / Gériatrie et gérontologie' },
  { value: 'sdv.mhep.geo', label: 'Sciences du Vivant / Médecine humaine et pathologie / Gynécologie et obstétrique' },
  { value: 'sdv.mhep.heg', label: 'Sciences du Vivant / Médecine humaine et pathologie / Hépatologie et Gastroentérologie' },
  { value: 'sdv.mhep.hem', label: 'Sciences du Vivant / Médecine humaine et pathologie / Hématologie' },
  { value: 'sdv.mhep.me', label: 'Sciences du Vivant / Médecine humaine et pathologie / Maladies émergentes' },
  { value: 'sdv.mhep.mi', label: 'Sciences du Vivant / Médecine humaine et pathologie / Maladies infectieuses' },
  { value: 'sdv.mhep.os', label: 'Sciences du Vivant / Médecine humaine et pathologie / Organes des sens' },
  { value: 'sdv.mhep.ped', label: 'Sciences du Vivant / Médecine humaine et pathologie / Pédiatrie' },
  { value: 'sdv.mhep.phy', label: 'Sciences du Vivant / Médecine humaine et pathologie / Physiologie' },
  { value: 'sdv.mhep.psm', label: 'Sciences du Vivant / Médecine humaine et pathologie / Psychiatrie et santé mentale' },
  { value: 'sdv.mhep.psr', label: 'Sciences du Vivant / Médecine humaine et pathologie / Pneumologie et système respiratoire' },
  { value: 'sdv.mhep.rsoa', label: 'Sciences du Vivant / Médecine humaine et pathologie / Rhumatologie et système ostéo-articulaire' },
  { value: 'sdv.mhep.un', label: 'Sciences du Vivant / Médecine humaine et pathologie / Urologie et Néphrologie' },
  { value: 'sdv.mp', label: 'Sciences du Vivant / Microbiologie et Parasitologie' },
  { value: 'sdv.mp.bac', label: 'Sciences du Vivant / Microbiologie et Parasitologie / Bactériologie' },
  { value: 'sdv.mp.myc', label: 'Sciences du Vivant / Microbiologie et Parasitologie / Mycologie' },
  { value: 'sdv.mp.par', label: 'Sciences du Vivant / Microbiologie et Parasitologie / Parasitologie' },
  { value: 'sdv.mp.pro', label: 'Sciences du Vivant / Microbiologie et Parasitologie / Protistologie' },
  { value: 'sdv.mp.vir', label: 'Sciences du Vivant / Microbiologie et Parasitologie / Virologie' },
  { value: 'sdv.neu', label: 'Sciences du Vivant / Neurosciences' },
  { value: 'sdv.neu.nb', label: 'Sciences du Vivant / Neurosciences / Neurobiologie' },
  { value: 'sdv.neu.pc', label: 'Sciences du Vivant / Neurosciences / Psychologie et comportements' },
  { value: 'sdv.neu.sc', label: 'Sciences du Vivant / Neurosciences / Sciences cognitives' },
  { value: 'sdv.ot', label: 'Sciences du Vivant / Autre' },
  { value: 'sdv.sa', label: 'Sciences du Vivant / Sciences agricoles' },
  { value: 'sdv.sa.aep', label: 'Sciences du Vivant / Sciences agricoles / Agriculture, économie et politique' },
  { value: 'sdv.sa.agro', label: 'Sciences du Vivant / Sciences agricoles / Agronomie' },
  { value: 'sdv.sa.hort', label: 'Sciences du Vivant / Sciences agricoles / Horticulture' },
  { value: 'sdv.sa.sds', label: 'Sciences du Vivant / Sciences agricoles / Science des sols' },
  { value: 'sdv.sa.sf', label: 'Sciences du Vivant / Sciences agricoles / Sylviculture, foresterie' },
  { value: 'sdv.sa.spa', label: 'Sciences du Vivant / Sciences agricoles / Science des productions animales' },
  { value: 'sdv.sa.sta', label: 'Sciences du Vivant / Sciences agricoles / Sciences et techniques de l\'agriculture' },
  { value: 'sdv.sa.stp', label: 'Sciences du Vivant / Sciences agricoles / Sciences et techniques des pêches' },
  { value: 'sdv.sa.zoo', label: 'Sciences du Vivant / Sciences agricoles / Zootechnie' },
  { value: 'sdv.sp', label: 'Sciences du Vivant / Sciences pharmaceutiques' },
  { value: 'sdv.sp.med', label: 'Sciences du Vivant / Sciences pharmaceutiques / Médicaments' },
  { value: 'sdv.sp.pg', label: 'Sciences du Vivant / Sciences pharmaceutiques / Pharmacie galénique' },
  { value: 'sdv.sp.pharma', label: 'Sciences du Vivant / Sciences pharmaceutiques / Pharmacologie' },
  { value: 'sdv.spee', label: 'Sciences du Vivant / Santé publique et épidémiologie' },
  { value: 'sdv.tox', label: 'Sciences du Vivant / Toxicologie' },
  { value: 'sdv.tox.eco', label: 'Sciences du Vivant / Toxicologie / Ecotoxicologie' },
  { value: 'sdv.tox.tca', label: 'Sciences du Vivant / Toxicologie / Toxicologie et chaîne alimentaire' },
  { value: 'sdv.tox.tvm', label: 'Sciences du Vivant / Toxicologie / Toxicologie végétale et mycotoxicologie' },
  { value: 'shs', label: 'Sciences de l\'Homme et Société' },
  { value: 'shs.anthro-bio', label: 'Sciences de l\'Homme et Société / Anthropologie biologique' },
  { value: 'shs.anthro-se', label: 'Sciences de l\'Homme et Société / Anthropologie sociale et ethnologie' },
  { value: 'shs.archeo', label: 'Sciences de l\'Homme et Société / Archéologie et Préhistoire' },
  { value: 'shs.archi', label: 'Sciences de l\'Homme et Société / Architecture, aménagement de l\'espace' },
  { value: 'shs.art', label: 'Sciences de l\'Homme et Société / Art et histoire de l\'art' },
  { value: 'shs.class', label: 'Sciences de l\'Homme et Société / Etudes classiques' },
  { value: 'shs.demo', label: 'Sciences de l\'Homme et Société / Démographie' },
  { value: 'shs.droit', label: 'Sciences de l\'Homme et Société / Droit' },
  { value: 'shs.eco', label: 'Sciences de l\'Homme et Société / Economies et finances' },
  { value: 'shs.edu', label: 'Sciences de l\'Homme et Société / Education' },
  { value: 'shs.envir', label: 'Sciences de l\'Homme et Société / Etudes de l\'environnement' },
  { value: 'shs.genre', label: 'Sciences de l\'Homme et Société / Etudes sur le genre' },
  { value: 'shs.geo', label: 'Sciences de l\'Homme et Société / Géographie' },
  { value: 'shs.gestion', label: 'Sciences de l\'Homme et Société / Gestion et management' },
  { value: 'shs.hisphilso', label: 'Sciences de l\'Homme et Société / Histoire, Philosophie et Sociologie des sciences' },
  { value: 'shs.hist', label: 'Sciences de l\'Homme et Société / Histoire' },
  { value: 'shs.info', label: 'Sciences de l\'Homme et Société / Sciences de l\'information et de la communication' },
  { value: 'shs.langue', label: 'Sciences de l\'Homme et Société / Linguistique' },
  { value: 'shs.litt', label: 'Sciences de l\'Homme et Société / Littératures' },
  { value: 'shs.museo', label: 'Sciences de l\'Homme et Société / Héritage culturel et muséologie' },
  { value: 'shs.musiq', label: 'Sciences de l\'Homme et Société / Musique, musicologie et arts de la scène' },
  { value: 'shs.phil', label: 'Sciences de l\'Homme et Société / Philosophie' },
  { value: 'shs.psy', label: 'Sciences de l\'Homme et Société / Psychologie' },
  { value: 'shs.relig', label: 'Sciences de l\'Homme et Société / Religions' },
  { value: 'shs.scipo', label: 'Sciences de l\'Homme et Société / Science politique' },
  { value: 'shs.socio', label: 'Sciences de l\'Homme et Société / Sociologie' },
  { value: 'shs.stat', label: 'Sciences de l\'Homme et Société / Méthodes et statistiques' },
  { value: 'spi', label: 'Sciences de l\'ingénieur [physics]' },
  { value: 'spi.acou', label: 'Sciences de l\'ingénieur / Acoustique' },
  { value: 'spi.auto', label: 'Sciences de l\'ingénieur / Automatique / Robotique' },
  { value: 'spi.elec', label: 'Sciences de l\'ingénieur / Electromagnétisme' },
  { value: 'spi.fluid', label: 'Sciences de l\'ingénieur / Milieux fluides et réactifs' },
  { value: 'spi.gciv', label: 'Sciences de l\'ingénieur / Génie civil' },
  { value: 'spi.gciv.cd', label: 'Sciences de l\'ingénieur / Génie civil / Construction durable' },
  { value: 'spi.gciv.ch', label: 'Sciences de l\'ingénieur / Génie civil / Construction hydraulique' },
  { value: 'spi.gciv.dv', label: 'Sciences de l\'ingénieur / Génie civil / Dynamique, vibrations' },
  { value: 'spi.gciv.ec', label: 'Sciences de l\'ingénieur / Génie civil / Eco-conception' },
  { value: 'spi.gciv.gcn', label: 'Sciences de l\'ingénieur / Génie civil / Génie civil nucléaire' },
  { value: 'spi.gciv.geotech', label: 'Sciences de l\'ingénieur / Génie civil / Géotechnique' },
  { value: 'spi.gciv.it', label: 'Sciences de l\'ingénieur / Génie civil / Infrastructures de transport' },
  { value: 'spi.gciv.mat', label: 'Sciences de l\'ingénieur / Génie civil / Matériaux composites et construction' },
  { value: 'spi.gciv.rhea', label: 'Sciences de l\'ingénieur / Génie civil / Réhabilitation' },
  { value: 'spi.gciv.risq', label: 'Sciences de l\'ingénieur / Génie civil / Risques' },
  { value: 'spi.gciv.struct', label: 'Sciences de l\'ingénieur / Génie civil / Structures' },
  { value: 'spi.gproc', label: 'Sciences de l\'ingénieur / Génie des procédés' },
  { value: 'spi.mat', label: 'Sciences de l\'ingénieur / Matériaux' },
  { value: 'spi.meca', label: 'Sciences de l\'ingénieur / Mécanique' },
  { value: 'spi.meca.biom', label: 'Sciences de l\'ingénieur / Mécanique / Biomécanique' },
  { value: 'spi.meca.geme', label: 'Sciences de l\'ingénieur / Mécanique / Génie mécanique' },
  { value: 'spi.meca.mefl', label: 'Sciences de l\'ingénieur / Mécanique / Mécanique des fluides' },
  { value: 'spi.meca.mema', label: 'Sciences de l\'ingénieur / Mécanique / Mécanique des matériaux' },
  { value: 'spi.meca.msmeca', label: 'Sciences de l\'ingénieur / Mécanique / Matériaux et structures en mécanique' },
  { value: 'spi.meca.solid', label: 'Sciences de l\'ingénieur / Mécanique / Mécanique des solides' },
  { value: 'spi.meca.stru', label: 'Sciences de l\'ingénieur / Mécanique / Mécanique des structures' },
  { value: 'spi.meca.ther', label: 'Sciences de l\'ingénieur / Mécanique / Thermique' },
  { value: 'spi.meca.vibr', label: 'Sciences de l\'ingénieur / Mécanique / Vibrations' },
  { value: 'spi.nano', label: 'Sciences de l\'ingénieur / Micro et nanotechnologies / Microélectronique' },
  { value: 'spi.nrj', label: 'Sciences de l\'ingénieur / Energie électrique' },
  { value: 'spi.opti', label: 'Sciences de l\'ingénieur / Optique / photonique' },
  { value: 'spi.other', label: 'Sciences de l\'ingénieur / Autre' },
  { value: 'spi.plasma', label: 'Sciences de l\'ingénieur / Plasmas' },
  { value: 'spi.signal', label: 'Sciences de l\'ingénieur / Traitement du signal et de l\'image' },
  { value: 'spi.tron', label: 'Sciences de l\'ingénieur / Electronique' },
  { value: 'stat', label: 'Statistiques [stat]' },
  { value: 'stat.ap', label: 'Statistiques / Applications [stat.AP]' },
  { value: 'stat.co', label: 'Statistiques / Calcul [stat.CO]' },
  { value: 'stat.me', label: 'Statistiques / Méthodologie [stat.ME]' },
  { value: 'stat.ml', label: 'Statistiques / Machine Learning [stat.ML]' },
  { value: 'stat.ot', label: 'Statistiques / Autres' },
  { value: 'stat.th', label: 'Statistiques / Théorie [stat.TH]' },
]

const HAL_DOC_TYPES = [
  { value: 'ART', label: 'Article' },
  { value: 'COMM', label: 'Communication' },
  { value: 'THESE', label: 'Thèse' },
  { value: 'HDR', label: 'Habilitation à diriger des recherches' },
  { value: 'OUV', label: 'Ouvrage' },
  { value: 'COUV', label: "Chapitre d'ouvrage" },
  { value: 'REPORT', label: 'Rapport' },
  { value: 'POSTER', label: 'Poster' },
  { value: 'PRESCONF', label: 'Présentation de conférence' },
]

const LICENSES = [
  { value: 'cc-by', label: 'CC BY – Attribution' },
  { value: 'cc-by-sa', label: 'CC BY-SA – Partage dans les mêmes conditions' },
  { value: 'cc-by-nd', label: 'CC BY-ND – Pas de modification' },
  { value: 'cc-by-nc', label: "CC BY-NC – Pas d'utilisation commerciale" },
  {
    value: 'cc-by-nc-nd',
    label: "CC BY-NC-ND – Pas d'utilisation commerciale, pas de modification",
  },
  { value: 'cc0', label: 'CC0 – Domaine public' },
]

const LANGUAGES = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'Anglais' },
  { value: 'es', label: 'Espagnol' },
  { value: 'de', label: 'Allemand' },
  { value: 'it', label: 'Italien' },
  { value: 'pt', label: 'Portugais' },
]

const AUTHOR_FUNCTIONS: Record<string, string> = {
  author: 'Auteur',
  auteur: 'Auteur',
  auteur_correspondant: 'Auteur correspondant',
  editor: 'Éditeur',
}

const DOC_TYPE_TO_HAL: Record<string, string> = {
  Article: 'ART',
  Book: 'OUV',
  Thesis: 'THESE',
  Conference: 'COMM',
  Report: 'REPORT',
}

type AttachedFile = { name: string; size: number }
type Step = 'form' | 'review' | 'uploading'

type DepositStatusStep = 'moderation' | 'accepted' | 'rejected' | 'changes_requested'
type DepositStatus = {
  step: DepositStatusStep
  submittedAt: string
  halId: string
  hasFile: boolean
}

const MOCK_REJECTION_REASON =
  'Le fichier PDF fourni ne respecte pas les critères de HAL (le document semble être protégé contre la copie). Merci de fournir un PDF non protégé.'

const MOCK_CHANGES_COMMENT =
  'Le résumé en anglais est manquant. Merci d’ajouter un abstract en anglais avant de soumettre à nouveau.'

const depositStorageKey = (uid: string) => `hal-deposit-status-${uid}`

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HalDeposit() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const lang = Lingui.i18n.locale as ExtendedLanguageCode
  const { selectedDocument } = useStore((state) => state.document)

  const [step, setStep] = useState<Step>('form')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [depositStatus, setDepositStatus] = useState<DepositStatus | null>(null)

  const [documentType, setDocumentType] = useState(
    selectedDocument ? (DOC_TYPE_TO_HAL[selectedDocument.documentType] ?? '') : '',
  )
  const [domains, setDomains] = useState<string[]>([])
  const [language, setLanguage] = useState('fr')
  const [productionDate, setProductionDate] = useState(
    selectedDocument?.publicationDate?.substring(0, 10) ??
      new Date().toISOString().substring(0, 10),
  )
  const [license, setLicense] = useState('cc-by')
  const [journal, setJournal] = useState('')
  const [conferenceTitle, setConferenceTitle] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [institution, setInstitution] = useState('')
  const [director, setDirector] = useState('')
  const [bookTitle, setBookTitle] = useState('')
  const [mainFile, setMainFile] = useState<AttachedFile | null>(null)
  const [annexFiles, setAnnexFiles] = useState<AttachedFile[]>([])

  useEffect(() => {
    if (!selectedDocument) return
    const saved = localStorage.getItem(depositStorageKey(selectedDocument.uid))
    if (saved) setDepositStatus(JSON.parse(saved))
  }, [selectedDocument?.uid])

  if (!selectedDocument) return null

  const isInHal = selectedDocument.records.some(
    (r) => r.platform === BibliographicPlatform.HAL,
  )
  if (isInHal && !depositStatus) return null

  const title =
    selectedDocument.titles.find((t) => t.language === 'fr')?.value ??
    selectedDocument.titles[0]?.value ??
    ''

  const abstract =
    selectedDocument.abstracts.find((a) => a.language === 'fr')?.value ??
    selectedDocument.abstracts[0]?.value ??
    ''

  const contributions = selectedDocument.contributions ?? []

  const navigateTo = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.push(`/${lang}/documents/${selectedDocument.uid}?${params.toString()}`)
  }

  const saveDepositStatus = (status: DepositStatus) => {
    setDepositStatus(status)
    localStorage.setItem(depositStorageKey(selectedDocument.uid), JSON.stringify(status))
  }

  const clearDepositStatus = () => {
    setDepositStatus(null)
    localStorage.removeItem(depositStorageKey(selectedDocument.uid))
    setStep('form')
  }

  const simulateStatus = (s: DepositStatusStep) => {
    if (!depositStatus) return
    saveDepositStatus({ ...depositStatus, step: s })
  }

  const handleMainFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setMainFile({ name: f.name, size: f.size })
  }

  const handleAnnexFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setAnnexFiles((prev) => [...prev, { name: f.name, size: f.size }])
  }

  const validate = () => {
    if (!documentType) return 'Le type de document est obligatoire'
    if (domains.length === 0) return 'Au moins un domaine HAL est requis'
    if (!mainFile) return 'Le fichier PDF principal est obligatoire'
    if (documentType === 'ART' && !journal.trim()) return 'Le nom de la revue est obligatoire'
    if (['COMM', 'POSTER', 'PRESCONF'].includes(documentType) && !conferenceTitle.trim())
      return 'Le titre du congrès est obligatoire'
    return null
  }

  const handleSubmit = () => {
    if (!validate()) setStep('review')
  }

  const handleConfirm = () => {
    setStep('uploading')
    setUploadProgress(0)
    const halId = `hal-0485${Math.floor(Math.random() * 9000 + 1000)}`
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            saveDepositStatus({
              step: mainFile ? 'moderation' : 'accepted',
              submittedAt: new Date().toISOString(),
              halId,
              hasFile: !!mainFile,
            })
          }, 400)
          return 100
        }
        return prev + 10
      })
    }, 180)
  }

  // ─── Deposit status views ────────────────────────────────────────────────────

  if (depositStatus) {
    const halUrl = `https://hal.science/${depositStatus.halId}`
    const submittedDate = new Date(depositStatus.submittedAt).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    const DemoSwitcher = () => (
      <Box
        sx={{
          mt: 4,
          pt: 2,
          borderTop: `1px dashed ${BORDER}`,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography sx={{ color: MUTED, fontSize: '0.75rem', mr: 0.5 }}>
          {'Simuler :'}
        </Typography>
        {(['moderation', 'accepted', 'rejected', 'changes_requested'] as DepositStatusStep[]).map(
          (s) => {
            const labels: Record<DepositStatusStep, string> = {
              moderation: 'En modération',
              accepted: 'Accepté',
              rejected: 'Rejeté',
              changes_requested: 'Modifications demandées',
            }
            return (
              <Button
                key={s}
                size="small"
                variant={depositStatus.step === s ? 'outlined' : 'text'}
                onClick={() => simulateStatus(s)}
                sx={{ textTransform: 'none', fontSize: '0.75rem', color: MUTED, borderColor: BORDER, minWidth: 0, py: 0.25, px: 1 }}
              >
                {labels[s]}
              </Button>
            )
          },
        )}
        <Button
          size="small"
          variant="text"
          onClick={clearDepositStatus}
          sx={{ textTransform: 'none', fontSize: '0.75rem', color: '#c62828', ml: 'auto' }}
        >
          {'Réinitialiser'}
        </Button>
      </Box>
    )

    if (depositStatus.step === 'moderation') {
      return (
        <Box sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <HourglassEmpty sx={{ color: '#ED6C02', fontSize: 28 }} />
            <Typography variant="h6" sx={{ color: '#ED6C02', fontWeight: 600 }}>
              {'En cours de modération'}
            </Typography>
          </Box>
          <Typography sx={{ color: MUTED, fontSize: '0.875rem', mb: 3 }}>
            {`Soumis le ${submittedDate}`}
          </Typography>
          <Alert severity="warning" sx={{ mb: 3 }}>
            {'Votre dépôt est en attente de validation par les équipes de modération HAL. Ce processus prend généralement entre 1 et 5 jours ouvrés.'}
          </Alert>
          <Paper elevation={0} sx={{ bgcolor: SURFACE, p: 2.5, borderRadius: 2, border: `1px solid ${BORDER}`, mb: 3 }}>
            <Typography sx={{ color: MUTED, fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>
              {'Identifiant HAL (temporaire)'}
            </Typography>
            <Link href={halUrl} target="_blank" rel="noopener" sx={{ color: TEAL, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {depositStatus.halId}
              <OpenInNew sx={{ fontSize: 14 }} />
            </Link>
          </Paper>
          <Button
            variant="outlined"
            onClick={() => navigateTo('bibliographic_information')}
            sx={{ color: TEAL, borderColor: TEAL, textTransform: 'none', '&:hover': { borderColor: TEAL_DARK } }}
          >
            {'Retour aux informations bibliographiques'}
          </Button>
          <DemoSwitcher />
        </Box>
      )
    }

    if (depositStatus.step === 'accepted') {
      return (
        <Box sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <CheckCircle sx={{ color: '#2E7D32', fontSize: 28 }} />
            <Typography variant="h6" sx={{ color: '#2E7D32', fontWeight: 600 }}>
              {'Dépôt accepté'}
            </Typography>
          </Box>
          <Typography sx={{ color: MUTED, fontSize: '0.875rem', mb: 3 }}>
            {`Soumis le ${submittedDate}`}
          </Typography>
          <Alert severity="success" sx={{ mb: 3 }}>
            {'Votre publication a été acceptée et publiée sur HAL.'}
          </Alert>
          <Paper elevation={0} sx={{ bgcolor: SURFACE, p: 2.5, borderRadius: 2, border: `1px solid ${BORDER}`, mb: 3 }}>
            <Typography sx={{ color: MUTED, fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>
              {'Voir la publication sur HAL'}
            </Typography>
            <Link href={halUrl} target="_blank" rel="noopener" sx={{ color: TEAL, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {halUrl}
              <OpenInNew sx={{ fontSize: 14 }} />
            </Link>
          </Paper>
          <Button
            variant="outlined"
            onClick={() => navigateTo('bibliographic_information')}
            sx={{ color: TEAL, borderColor: TEAL, textTransform: 'none', '&:hover': { borderColor: TEAL_DARK } }}
          >
            {'Retour aux informations bibliographiques'}
          </Button>
          <DemoSwitcher />
        </Box>
      )
    }

    if (depositStatus.step === 'rejected') {
      return (
        <Box sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <ErrorOutline sx={{ color: '#C62828', fontSize: 28 }} />
            <Typography variant="h6" sx={{ color: '#C62828', fontWeight: 600 }}>
              {'Dépôt rejeté'}
            </Typography>
          </Box>
          <Typography sx={{ color: MUTED, fontSize: '0.875rem', mb: 3 }}>
            {`Soumis le ${submittedDate}`}
          </Typography>
          <Alert severity="error" sx={{ mb: 3 }}>
            {'Votre dépôt a été rejeté par les équipes de modération HAL.'}
          </Alert>
          <Paper elevation={0} sx={{ bgcolor: '#FFF8F8', p: 2.5, borderRadius: 2, border: `1px solid #FFCDD2`, mb: 3 }}>
            <Typography sx={{ color: MUTED, fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>
              {'Motif du rejet'}
            </Typography>
            <Typography sx={{ color: TEXT, fontSize: '0.875rem' }}>
              {MOCK_REJECTION_REASON}
            </Typography>
          </Paper>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={clearDepositStatus}
              sx={{ bgcolor: TEAL, textTransform: 'none', '&:hover': { bgcolor: TEAL_DARK } }}
            >
              {'Déposer à nouveau'}
            </Button>
            <Button
              variant="text"
              onClick={() => navigateTo('bibliographic_information')}
              sx={{ color: MUTED, textTransform: 'none' }}
            >
              {'Retour'}
            </Button>
          </Box>
          <DemoSwitcher />
        </Box>
      )
    }

    if (depositStatus.step === 'changes_requested') {
      return (
        <Box sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <WarningAmber sx={{ color: '#ED6C02', fontSize: 28 }} />
            <Typography variant="h6" sx={{ color: '#ED6C02', fontWeight: 600 }}>
              {'Modifications demandées'}
            </Typography>
          </Box>
          <Typography sx={{ color: MUTED, fontSize: '0.875rem', mb: 3 }}>
            {`Soumis le ${submittedDate}`}
          </Typography>
          <Alert severity="warning" sx={{ mb: 3 }}>
            {'Les équipes de modération HAL ont demandé des corrections avant de valider votre dépôt.'}
          </Alert>
          <Paper elevation={0} sx={{ bgcolor: '#FFFBF0', p: 2.5, borderRadius: 2, border: `1px solid #FFE082`, mb: 3 }}>
            <Typography sx={{ color: MUTED, fontSize: '0.75rem', mb: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>
              {'Commentaire du modérateur'}
            </Typography>
            <Typography sx={{ color: TEXT, fontSize: '0.875rem' }}>
              {MOCK_CHANGES_COMMENT}
            </Typography>
          </Paper>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={clearDepositStatus}
              sx={{ bgcolor: TEAL, textTransform: 'none', '&:hover': { bgcolor: TEAL_DARK } }}
            >
              {'Modifier et déposer à nouveau'}
            </Button>
            <Button
              variant="text"
              onClick={() => navigateTo('bibliographic_information')}
              sx={{ color: MUTED, textTransform: 'none' }}
            >
              {'Retour'}
            </Button>
          </Box>
          <DemoSwitcher />
        </Box>
      )
    }
  }

  // ─── Uploading ──────────────────────────────────────────────────────────────

  if (step === 'uploading') {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ color: TEAL, fontWeight: 600, mb: 3 }}>
          {'Dépôt en cours…'}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={uploadProgress}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: TEAL_LIGHT,
            '& .MuiLinearProgress-bar': { bgcolor: TEAL },
          }}
        />
        <Typography sx={{ color: MUTED, mt: 2, textAlign: 'center' }}>
          {`${uploadProgress}% — Envoi en cours…`}
        </Typography>
      </Box>
    )
  }

  // ─── Review ─────────────────────────────────────────────────────────────────

  if (step === 'review') {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ color: TEAL, fontWeight: 600, mb: 3 }}>
          {'Récapitulatif du dépôt'}
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          {'Vérifiez attentivement les informations avant de confirmer le dépôt sur HAL.'}
        </Alert>

        <Paper elevation={0} sx={{ bgcolor: SURFACE, p: 3, mb: 3, borderRadius: 2 }}>
          <ReviewField label="Titre" value={title} />
          <ReviewField
            label="Type de document"
            value={HAL_DOC_TYPES.find((t) => t.value === documentType)?.label ?? documentType}
          />

          {documentType === 'ART' && journal && (
            <ReviewField label="Revue" value={journal} />
          )}
          {['COMM', 'POSTER', 'PRESCONF'].includes(documentType) && conferenceTitle && (
            <ReviewField
              label="Congrès"
              value={
                city && country
                  ? `${conferenceTitle} (${city}, ${country})`
                  : conferenceTitle
              }
            />
          )}
          {['THESE', 'HDR', 'REPORT'].includes(documentType) && institution && (
            <ReviewField
              label={documentType === 'REPORT' ? 'Institution' : 'Organisme de délivrance'}
              value={institution}
            />
          )}
          {['THESE', 'HDR'].includes(documentType) && director && (
            <ReviewField
              label={documentType === 'THESE' ? 'Directeur de thèse' : 'Président du jury'}
              value={director}
            />
          )}
          {documentType === 'COUV' && bookTitle && (
            <ReviewField label="Titre de l'ouvrage" value={bookTitle} />
          )}

          <Box sx={{ mb: 2 }}>
            <ReviewLabel>{'Domaines HAL'}</ReviewLabel>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {domains.map((d) => (
                <Chip
                  key={d}
                  label={HAL_DOMAINS.find((x) => x.value === d)?.label}
                  size="small"
                  sx={{ bgcolor: TEAL_LIGHT, color: TEAL }}
                />
              ))}
            </Box>
          </Box>

          <Box>
            <ReviewLabel>{'Fichiers'}</ReviewLabel>
            {mainFile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <AttachFile sx={{ fontSize: 16, color: TEAL }} />
                <Typography sx={{ color: TEXT, fontSize: '0.875rem' }}>
                  {mainFile.name} ({formatFileSize(mainFile.size)}) —{' '}
                  <strong>{'Principal'}</strong>
                </Typography>
              </Box>
            )}
            {annexFiles.map((f, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <AttachFile sx={{ fontSize: 16, color: MUTED }} />
                <Typography sx={{ color: TEXT, fontSize: '0.875rem' }}>
                  {f.name} ({formatFileSize(f.size)})
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => setStep('form')}
            sx={{
              color: TEAL,
              borderColor: TEAL,
              textTransform: 'none',
              '&:hover': { borderColor: TEAL_DARK },
            }}
          >
            {'Modifier'}
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            sx={{ bgcolor: TEAL, textTransform: 'none', '&:hover': { bgcolor: TEAL_DARK } }}
          >
            {'Confirmer le dépôt'}
          </Button>
        </Box>
      </Box>
    )
  }

  // ─── Form ───────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h6" sx={{ color: TEAL, fontWeight: 600, mb: 0.5 }}>
        {'Déposer dans HAL'}
      </Typography>
      <Typography sx={{ color: MUTED, fontSize: '0.875rem', mb: 3 }}>
        {'Remplissez les métadonnées obligatoires pour déposer votre publication sur HAL.'}
      </Typography>

      <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
        {
          'Les informations de titre, résumé et auteurs sont récupérées depuis les onglets correspondants.'
        }
      </Alert>

      {/* Titre & Résumé — lecture seule */}
      <Section
        title="TITRE ET RÉSUMÉ"
        action={
          <Button
            size="small"
            onClick={() => navigateTo('bibliographic_information')}
            sx={{ color: TEAL, textTransform: 'none', fontWeight: 600 }}
          >
            {'Modifier dans Infos bibliographiques'}
          </Button>
        }
      >
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: SURFACE,
            borderRadius: 2,
            border: `1px solid ${BORDER}`,
          }}
        >
          <Typography sx={{ color: TEXT, fontWeight: 600, mb: 1, fontSize: '0.9375rem' }}>
            {title || 'Aucun titre renseigné'}
          </Typography>
          <Typography
            sx={{
              color: MUTED,
              fontSize: '0.875rem',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {abstract || 'Aucun résumé renseigné'}
          </Typography>
        </Paper>
      </Section>

      {/* Auteurs — lecture seule */}
      <Section
        title="AUTEURS ET AFFILIATIONS"
        action={
          <Button
            size="small"
            onClick={() => navigateTo('authors')}
            sx={{ color: TEAL, textTransform: 'none', fontWeight: 600 }}
          >
            {"Modifier dans l'onglet Auteurs"}
          </Button>
        }
      >
        <Paper
          elevation={0}
          sx={{ p: 2, bgcolor: SURFACE, borderRadius: 2, border: `1px solid ${BORDER}` }}
        >
          {contributions.length === 0 ? (
            <Typography sx={{ color: MUTED, fontSize: '0.875rem' }}>
              {'Aucun auteur renseigné'}
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {contributions
                .slice()
                .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
                .map((c, i) => (
                  <Box key={i}>
                    <Typography sx={{ color: TEXT, fontWeight: 600, fontSize: '0.875rem' }}>
                      {c.person?.displayName ?? '—'}
                      <Typography
                        component="span"
                        sx={{ color: MUTED, fontSize: '0.75rem', ml: 1, fontWeight: 400, fontStyle: 'italic' }}
                      >
                        {`(${c.roles?.map((r) => AUTHOR_FUNCTIONS[r] ?? r).join(', ') || 'Auteur'})`}
                      </Typography>
                    </Typography>
                  </Box>
                ))}
            </Box>
          )}
        </Paper>
      </Section>

      <Typography
        variant="subtitle2"
        sx={{ color: MUTED, fontWeight: 600, mb: 2, letterSpacing: '0.05em' }}
      >
        {'MÉTADONNÉES DE DÉPÔT'}
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>{'Type de document *'}</InputLabel>
        <Select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          label="Type de document *"
        >
          {HAL_DOC_TYPES.map((t) => (
            <MenuItem key={t.value} value={t.value}>
              {t.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Autocomplete
        multiple
        options={HAL_DOMAINS}
        getOptionLabel={(o) => o.label}
        value={HAL_DOMAINS.filter((d) => domains.includes(d.value))}
        onChange={(_, v) => setDomains(v.map((x) => x.value))}
        renderInput={(params) => (
          <TextField {...params} label="Domaines HAL *" placeholder="Sélectionnez les domaines" />
        )}
        sx={{ mb: 3 }}
      />

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>{'Langue *'}</InputLabel>
        <Select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          label="Langue *"
        >
          {LANGUAGES.map((l) => (
            <MenuItem key={l.value} value={l.value}>
              {l.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        label={
          ['THESE', 'HDR'].includes(documentType)
            ? 'Date de soutenance *'
            : ['COMM', 'POSTER', 'PRESCONF'].includes(documentType)
              ? 'Date de début du congrès *'
              : 'Date de publication *'
        }
        type="date"
        value={productionDate}
        onChange={(e) => setProductionDate(e.target.value)}
        slotProps={{ inputLabel: { shrink: true } }}
        fullWidth
        sx={{ mb: 3 }}
      />

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>{'Licence de diffusion *'}</InputLabel>
        <Select
          value={license}
          onChange={(e) => setLicense(e.target.value)}
          label="Licence de diffusion *"
        >
          {LICENSES.map((l) => (
            <MenuItem key={l.value} value={l.value}>
              {l.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {documentType === 'ART' && (
        <TextField
          label="Nom de la revue *"
          value={journal}
          onChange={(e) => setJournal(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
        />
      )}

      {['COMM', 'POSTER', 'PRESCONF'].includes(documentType) && (
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Titre du congrès *"
            value={conferenceTitle}
            onChange={(e) => setConferenceTitle(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Ville *"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              fullWidth
            />
            <TextField
              label="Pays *"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              fullWidth
            />
          </Box>
        </Box>
      )}

      {['THESE', 'HDR', 'REPORT'].includes(documentType) && (
        <TextField
          label={documentType === 'REPORT' ? 'Institution *' : 'Organisme de délivrance *'}
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
        />
      )}

      {['THESE', 'HDR'].includes(documentType) && (
        <TextField
          label={documentType === 'THESE' ? 'Directeur de thèse *' : 'Président du jury *'}
          value={director}
          onChange={(e) => setDirector(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
        />
      )}

      {documentType === 'COUV' && (
        <TextField
          label="Titre de l'ouvrage *"
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
        />
      )}

      <Divider sx={{ my: 3 }} />

      {/* Fichier principal */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ color: TEXT, fontWeight: 500, mb: 1.5 }}>
          {'Fichier principal (PDF) *'}
        </Typography>
        {mainFile ? (
          <Paper
            elevation={0}
            sx={{
              bgcolor: TEAL_LIGHT,
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachFile sx={{ color: TEAL }} />
              <Box>
                <Typography sx={{ color: TEAL, fontWeight: 500 }}>{mainFile.name}</Typography>
                <Typography sx={{ color: MUTED, fontSize: '0.75rem' }}>
                  {formatFileSize(mainFile.size)}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setMainFile(null)} size="small">
              <Close sx={{ fontSize: 18 }} />
            </IconButton>
          </Paper>
        ) : (
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUpload />}
            sx={{
              color: TEAL,
              borderColor: TEAL,
              textTransform: 'none',
              '&:hover': { borderColor: TEAL_DARK },
            }}
          >
            {'Choisir un fichier PDF'}
            <input type="file" hidden accept="application/pdf" onChange={handleMainFile} />
          </Button>
        )}
      </Box>

      {/* Fichiers complémentaires */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ color: TEXT, fontWeight: 500, mb: 1.5 }}>
          {'Fichiers complémentaires (optionnel)'}
        </Typography>
        {annexFiles.map((f, i) => (
          <Paper
            key={i}
            elevation={0}
            sx={{
              bgcolor: SURFACE,
              p: 2,
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachFile sx={{ color: MUTED }} />
              <Box>
                <Typography sx={{ color: TEXT, fontWeight: 500, fontSize: '0.875rem' }}>
                  {f.name}
                </Typography>
                <Typography sx={{ color: MUTED, fontSize: '0.75rem' }}>
                  {formatFileSize(f.size)}
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setAnnexFiles((prev) => prev.filter((_, j) => j !== i))}
              size="small"
            >
              <Close sx={{ fontSize: 18 }} />
            </IconButton>
          </Paper>
        ))}
        <Button
          variant="text"
          component="label"
          startIcon={<Add />}
          sx={{ color: TEAL, textTransform: 'none', '&:hover': { bgcolor: TEAL_LIGHT } }}
        >
          {'Ajouter un fichier complémentaire'}
          <input type="file" hidden onChange={handleAnnexFile} />
        </Button>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            bgcolor: TEAL,
            textTransform: 'none',
            px: 4,
            '&:hover': { bgcolor: TEAL_DARK },
          }}
        >
          {'Passer à la validation'}
        </Button>
      </Box>
    </Box>
  )
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

function Section({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1.5,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ color: MUTED, fontWeight: 600, letterSpacing: '0.05em' }}
        >
          {title}
        </Typography>
        {action}
      </Box>
      {children}
    </Box>
  )
}

function ReviewLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      variant="subtitle2"
      sx={{
        color: MUTED,
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        fontWeight: 500,
        mb: 0.5,
      }}
    >
      {children}
    </Typography>
  )
}

function ReviewField({
  label,
  value,
}: {
  label: React.ReactNode
  value: React.ReactNode
}) {
  return (
    <Box sx={{ mb: 2 }}>
      <ReviewLabel>{label}</ReviewLabel>
      <Typography sx={{ color: TEXT }}>{value}</Typography>
    </Box>
  )
}
