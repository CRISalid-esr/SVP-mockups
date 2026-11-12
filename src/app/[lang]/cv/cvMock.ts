/**
 * CV de maquette des personnes fictives de la base.
 *
 * Simule ce que renverrait le service de CV de l'établissement (SigmaCV dans le
 * plan « Mon CV ») : un CV construit à partir des documents validés dans SoVisu+
 * (flux institutionnel), de HAL (IdHAL) et des sources ouvertes (OpenAlex, via l'ORCID).
 * Tout est écrit à la main ou dérivé de façon stable de persons.json et documents.json.
 */
import documentsData from '@/mocks/data/documents.json'
import personsData from '@/mocks/data/persons.json'

export type CvPublicationType = 'article' | 'conference' | 'book' | 'chapter' | 'report' | 'software'

/** Où le service de CV a trouvé la référence. */
export type CvSource = 'sovisu' | 'hal' | 'openalex'

export interface CvPublication {
  id: string
  type: CvPublicationType
  year: number
  title: string
  /** Noms au format « Nom, Prénom ». */
  authors: string[]
  venue: string
  doi?: string
  halId?: string
  source: CvSource
  /** Validé dans SoVisu+ : arrive marqué comme tel par le flux institutionnel. */
  validated: boolean
  openAccess: boolean
}

export interface CvEntry {
  from: number | null
  /** null = en cours ; undefined = date ponctuelle. */
  to?: number | null
  title: string
  place?: string
  detail?: string
}

export interface PersonCv {
  uid: string
  slug: string
  firstName: string
  lastName: string
  displayName: string
  position: string
  affiliations: string[]
  email: string
  orcid?: string
  idhal?: string
  idref?: string
  summary: string
  keywords: string[]
  positions: CvEntry[]
  education: CvEntry[]
  publications: CvPublication[]
  projects: CvEntry[]
  supervision: CvEntry[]
  teaching: CvEntry[]
  service: CvEntry[]
  awards: CvEntry[]
}

/* ------------------------------------------------------------------ */
/* Domaines : publications et projets types                           */
/* ------------------------------------------------------------------ */

type Domain = 'ia' | 'tasc' | 'alma' | 'physique' | 'maths' | 'meca'

interface PoolItem {
  title: string
  type: CvPublicationType
  venue: string
}

const POOLS: Record<Domain, PoolItem[]> = {
  ia: [
    { title: 'Graph neural networks for spatio-temporal forecasting at the edge', type: 'article', venue: 'IEEE Transactions on Neural Networks and Learning Systems' },
    { title: 'Federated learning on heterogeneous IoT devices: a resource-aware approach', type: 'conference', venue: 'International Conference on Distributed Computing Systems (ICDCS)' },
    { title: 'Apprentissage de représentations pour les graphes dynamiques', type: 'article', venue: "Revue d'intelligence artificielle" },
    { title: 'Lightweight attention models for embedded inference', type: 'conference', venue: 'European Conference on Machine Learning (ECML PKDD)' },
    { title: 'Explaining graph neural network predictions with counterfactual subgraphs', type: 'article', venue: 'Machine Learning' },
    { title: 'Distributed training under intermittent connectivity', type: 'conference', venue: 'Euro-Par' },
    { title: 'A benchmark of temporal graph datasets for traffic prediction', type: 'software', venue: 'Software Heritage' },
    { title: 'Edge computing and machine learning: a survey for practitioners', type: 'article', venue: 'ACM Computing Surveys' },
    { title: 'Continual learning on streaming graphs', type: 'conference', venue: 'International Joint Conference on Neural Networks (IJCNN)' },
    { title: "L'apprentissage automatique dans les réseaux de capteurs", type: 'chapter', venue: 'Les réseaux de capteurs, ISTE Éditions' },
    { title: 'Energy-efficient neural architecture search for microcontrollers', type: 'article', venue: 'Neurocomputing' },
    { title: 'Robustness of graph embeddings to adversarial edge perturbations', type: 'conference', venue: 'Conférence francophone sur l’apprentissage automatique (CAp)' },
  ],
  tasc: [
    { title: 'Global constraints for cumulative scheduling with time windows', type: 'article', venue: 'Constraints' },
    { title: 'Learning constraint models from historical solutions', type: 'conference', venue: 'International Conference on Principles and Practice of Constraint Programming (CP)' },
    { title: 'Propagation incrémentale pour la planification de la production', type: 'conference', venue: 'Journées francophones de programmation par contraintes (JFPC)' },
    { title: 'A hybrid local search for the vehicle routing problem with energy constraints', type: 'article', venue: 'European Journal of Operational Research' },
    { title: 'Explaining infeasibility in constraint satisfaction problems', type: 'conference', venue: 'International Joint Conference on Artificial Intelligence (IJCAI)' },
    { title: 'Constraint-based optimisation of local energy communities', type: 'article', venue: 'Energy and AI' },
    { title: 'Choco-solver: a constraint programming library in Java', type: 'software', venue: 'Software Heritage' },
    { title: 'Decomposition strategies for large-scale timetabling', type: 'article', venue: 'Journal of Scheduling' },
    { title: 'Symmetry breaking in bin-packing with conflicts', type: 'conference', venue: 'CPAIOR' },
    { title: 'La programmation par contraintes', type: 'chapter', venue: "Panorama de l'intelligence artificielle, Cépaduès" },
    { title: 'Robust scheduling under uncertain processing times', type: 'article', venue: 'Computers & Operations Research' },
    { title: 'Benchmarking solvers for energy planning problems', type: 'report', venue: 'Rapport de recherche, LS2N' },
  ],
  alma: [
    { title: 'Incremental verification of model transformations', type: 'article', venue: 'Software and Systems Modeling' },
    { title: 'A domain-specific language for cyber-physical system orchestration', type: 'conference', venue: 'International Conference on Model Driven Engineering Languages and Systems (MODELS)' },
    { title: 'Static analysis of microservice architectures for security smells', type: 'conference', venue: 'International Conference on Software Engineering (ICSE)' },
    { title: 'Évolution des modèles et co-évolution des métamodèles', type: 'article', venue: 'Technique et science informatiques' },
    { title: 'Reproducible builds for research software: lessons learned', type: 'conference', venue: 'Research Software Engineering Conference (RSECon)' },
    { title: 'Mining software repositories to detect architectural drift', type: 'article', venue: 'Empirical Software Engineering' },
    { title: 'ModelFlow: a toolkit for executable models', type: 'software', venue: 'Software Heritage' },
    { title: 'Testing configurable systems with sampling strategies', type: 'article', venue: 'Journal of Systems and Software' },
    { title: 'Language workbenches in the classroom', type: 'conference', venue: 'Educators Symposium @ MODELS' },
    { title: 'Ingénierie dirigée par les modèles', type: 'chapter', venue: 'Génie logiciel, Hermès-Lavoisier' },
    { title: 'Energy consumption of container orchestration platforms', type: 'conference', venue: 'International Conference on Software Architecture (ICSA)' },
    { title: 'A catalogue of microservice anti-patterns', type: 'report', venue: 'Rapport technique, LS2N' },
  ],
  physique: [
    { title: 'Spectroscopie laser des isotopes radioactifs à vie courte', type: 'article', venue: 'Physical Review C' },
    { title: 'Mesure de précision des périodes de décroissance bêta', type: 'article', venue: 'European Physical Journal A' },
    { title: 'Radiation dosimetry for targeted alpha therapy', type: 'article', venue: 'Physics in Medicine & Biology' },
    { title: 'Isotope production at low-energy facilities: a review', type: 'article', venue: 'Progress in Particle and Nuclear Physics' },
    { title: 'Nouvelles sources de radio-isotopes pour la médecine', type: 'conference', venue: 'Congrès général de la Société française de physique' },
    { title: 'Biophysical effects of low-dose ionising radiation', type: 'article', venue: 'Radiation Research' },
    { title: 'La radioactivité, de la découverte aux usages', type: 'book', venue: 'EDP Sciences' },
    { title: 'Hyperfine structure of heavy elements', type: 'article', venue: 'Physical Review Letters' },
    { title: 'Detector calibration for alpha spectrometry', type: 'conference', venue: 'Nuclear Science Symposium (IEEE NSS)' },
    { title: 'Radioprotection et mesure', type: 'chapter', venue: 'Physique nucléaire appliquée, Dunod' },
    { title: 'Isomeric states in neutron-rich nuclei', type: 'article', venue: 'Physics Letters B' },
    { title: 'Rapport du groupe de travail sur les isotopes médicaux', type: 'report', venue: 'CNRS, IN2P3' },
  ],
  maths: [
    { title: 'Global well-posedness for dispersive equations with critical nonlinearity', type: 'article', venue: 'Annales de l’Institut Henri Poincaré C' },
    { title: 'Functional data analysis with sparse observations', type: 'article', venue: 'Annals of Statistics' },
    { title: 'Formes modulaires de poids un et représentations galoisiennes', type: 'article', venue: 'Journal de théorie des nombres de Bordeaux' },
    { title: 'Long-time behaviour of solutions to nonlinear Schrödinger equations', type: 'article', venue: 'Communications in Partial Differential Equations' },
    { title: 'Estimation non paramétrique pour les processus de diffusion', type: 'article', venue: 'Journal de la Société française de statistique' },
    { title: 'Congruences between modular forms and applications', type: 'article', venue: 'Compositio Mathematica' },
    { title: 'Stochastic models for epidemic spread on networks', type: 'article', venue: 'Stochastic Processes and their Applications' },
    { title: 'Ondes dispersives', type: 'book', venue: 'Société mathématique de France, Cours spécialisés' },
    { title: 'Scattering theory for the wave equation on curved backgrounds', type: 'article', venue: 'Analysis & PDE' },
    { title: 'Introduction aux probabilités', type: 'chapter', venue: 'Mathématiques pour l’ingénieur, Ellipses' },
    { title: 'Galois representations attached to Hilbert modular forms', type: 'article', venue: 'Mathematische Annalen' },
    { title: 'Tests de rupture pour séries temporelles fonctionnelles', type: 'conference', venue: 'Journées de statistique de la SFdS' },
  ],
  meca: [
    { title: 'Fatigue behaviour of laminated composites under multiaxial loading', type: 'article', venue: 'Composites Science and Technology' },
    { title: 'Multiscale modelling of heterogeneous materials with FFT-based solvers', type: 'article', venue: 'International Journal for Numerical Methods in Engineering' },
    { title: 'Endommagement des composites stratifiés : approche expérimentale', type: 'conference', venue: 'Journées nationales sur les composites (JNC)' },
    { title: 'Additive manufacturing of metallic lattices: mechanical characterisation', type: 'article', venue: 'Additive Manufacturing' },
    { title: 'Data-driven identification of constitutive laws', type: 'article', venue: 'Computer Methods in Applied Mechanics and Engineering' },
    { title: 'Durability of marine renewable energy structures', type: 'conference', venue: 'European Wave and Tidal Energy Conference (EWTEC)' },
    { title: 'Homogenisation of woven composites', type: 'article', venue: 'Journal of the Mechanics and Physics of Solids' },
    { title: 'Mécanique des matériaux composites', type: 'book', venue: 'ISTE Éditions' },
    { title: 'Digital image correlation for full-field measurements', type: 'article', venue: 'Experimental Mechanics' },
    { title: 'Simulation of crack propagation with phase-field models', type: 'conference', venue: 'Congrès français de mécanique (CFM)' },
    { title: 'Recycled carbon fibres in structural parts', type: 'article', venue: 'Composites Part B: Engineering' },
    { title: 'FFT-Mech: an open solver for periodic microstructures', type: 'software', venue: 'Software Heritage' },
  ],
}

const PROJECTS: Record<Domain, CvEntry[]> = {
  ia: [
    { from: 2023, to: 2027, title: 'ANR EDGE-GNN', detail: 'Apprentissage sur graphes pour l’informatique en périphérie — coordination' },
    { from: 2020, to: 2023, title: 'Région Pays de la Loire, programme Étoiles montantes', detail: 'Apprentissage fédéré pour les réseaux de capteurs' },
  ],
  tasc: [
    { from: 2022, to: 2026, title: 'ANR SOLVE-ENERGY', detail: 'Optimisation sous contraintes pour les communautés énergétiques — coordination' },
    { from: 2019, to: 2023, title: 'Projet européen Horizon 2020 TAILOR', detail: 'Réseau d’excellence en IA de confiance — responsable de tâche' },
  ],
  alma: [
    { from: 2021, to: 2025, title: 'ANR MODEVOL', detail: 'Co-évolution des modèles et du code — partenaire' },
    { from: 2024, to: 2027, title: 'PEPR Cloud, projet Green-Orchestration', detail: 'Sobriété des plateformes de conteneurs' },
  ],
  physique: [
    { from: 2021, to: 2026, title: 'ERC Advanced Grant ISOMED', detail: 'Nouveaux radio-isotopes pour la médecine — porteuse' },
    { from: 2016, to: 2020, title: 'ANR RADIOBIO', detail: 'Effets biologiques des faibles doses — coordination' },
  ],
  maths: [
    { from: 2020, to: 2024, title: 'ANR DISPERSIVE', detail: 'Équations dispersives non linéaires — partenaire' },
    { from: 2023, to: 2027, title: 'Centre Henri Lebesgue, programme Mathématiques et applications', detail: 'Responsable d’axe' },
  ],
  meca: [
    { from: 2022, to: 2026, title: 'ANR DURAMAR', detail: 'Durabilité des structures pour les énergies marines — coordination' },
    { from: 2018, to: 2022, title: 'Chaire industrielle Composites durables', detail: 'Partenariat avec un industriel de l’aéronautique' },
  ],
}

/* ------------------------------------------------------------------ */
/* Fiches écrites à la main                                           */
/* ------------------------------------------------------------------ */

interface Seed {
  domain: Domain
  position: string
  summary: string
  keywords?: string[]
  positions: CvEntry[]
  education: CvEntry[]
  supervision?: CvEntry[]
  teaching?: CvEntry[]
  service?: CvEntry[]
  awards?: CvEntry[]
  /** Nombre de publications générées en plus des documents de la base. */
  publicationCount: number
}

const NU = 'Nantes Université'

const SEEDS: Record<string, Seed> = {
  'jean-dupont': {
    domain: 'ia',
    position: 'Maître de conférences en informatique',
    summary: 'Mes travaux portent sur l’apprentissage automatique sur graphes et son déploiement sur des équipements contraints (informatique en périphérie). Je m’intéresse aussi aux usages de ces méthodes pour les sciences du climat.',
    positions: [
      { from: 2016, to: null, title: 'Maître de conférences', place: `${NU}, LS2N` },
      { from: 2014, to: 2016, title: 'Chercheur postdoctoral', place: 'Inria, centre de Grenoble' },
    ],
    education: [
      { from: 2014, title: 'Doctorat en informatique', place: 'Université de Rennes', detail: 'Apprentissage de représentations pour les graphes dynamiques' },
      { from: 2010, title: 'Master Informatique, parcours Data Science', place: 'Université de Nantes' },
    ],
    supervision: [
      { from: 2022, to: null, title: 'Co-encadrement de thèse (50 %) : Clara Leroux', detail: 'Optimisation sous contraintes pour la planification énergétique' },
      { from: 2019, to: 2022, title: 'Co-encadrement de thèse (50 %) : Yanis Koné', detail: 'Apprentissage fédéré sur objets connectés' },
      { from: 2017, to: null, title: '12 stages de master encadrés' },
    ],
    teaching: [
      { from: 2016, to: null, title: 'Apprentissage automatique, réseaux de neurones (Master Informatique)', detail: '≈ 192 h équivalent TD par an' },
      { from: 2019, to: null, title: 'Responsable du parcours Data Science du master', place: NU },
    ],
    service: [
      { from: 2021, to: null, title: 'Membre du conseil de laboratoire', place: 'LS2N' },
      { from: 2018, to: null, title: 'Relecteur pour ECML PKDD, IJCNN, Neurocomputing' },
    ],
    publicationCount: 8,
  },
  'marie-curie': {
    domain: 'physique',
    position: 'Directrice de recherche CNRS',
    summary: 'Physicienne nucléaire, je travaille sur la production et la caractérisation d’isotopes radioactifs, et sur leurs applications en médecine (thérapie alpha ciblée, dosimétrie).',
    positions: [
      { from: 2018, to: null, title: 'Directrice de recherche', place: 'CNRS, LS2N puis Labo X' },
      { from: 2008, to: 2018, title: 'Chargée de recherche', place: 'CNRS' },
      { from: 2006, to: 2008, title: 'Chercheuse postdoctorale', place: 'CERN, Genève' },
    ],
    education: [
      { from: 2013, title: 'Habilitation à diriger des recherches', place: 'Université Paris-Saclay' },
      { from: 2005, title: 'Doctorat en physique', place: 'Université Paris-Saclay', detail: 'Spectroscopie des isotopes radioactifs à vie courte' },
    ],
    supervision: [
      { from: 2010, to: null, title: '7 thèses dirigées, dont 5 soutenues' },
      { from: 2009, to: null, title: '4 chercheurs postdoctoraux encadrés' },
    ],
    service: [
      { from: 2021, to: 2025, title: 'Membre de la section 01 du Comité national de la recherche scientifique' },
      { from: 2019, to: null, title: 'Éditrice associée', place: 'European Physical Journal A' },
    ],
    awards: [
      { from: 2021, title: 'ERC Advanced Grant' },
      { from: 2015, title: 'Médaille de bronze du CNRS' },
    ],
    publicationCount: 11,
  },
  'isabelle-cordier': {
    domain: 'tasc',
    position: 'Professeure des universités en informatique',
    summary: 'Spécialiste de programmation par contraintes, je conçois des contraintes globales et des méthodes d’explication pour l’ordonnancement et la planification énergétique. Je dirige l’équipe TASC.',
    keywords: ['programmation par contraintes', 'ordonnancement', 'optimisation combinatoire', 'énergie'],
    positions: [
      { from: 2014, to: null, title: 'Professeure des universités', place: `${NU}, LS2N` },
      { from: 2005, to: 2014, title: 'Maîtresse de conférences', place: 'IMT Atlantique' },
    ],
    education: [
      { from: 2012, title: 'Habilitation à diriger des recherches', place: 'Université de Nantes' },
      { from: 2003, title: 'Doctorat en informatique', place: 'Université de Nantes', detail: 'Propagation de contraintes globales pour l’ordonnancement' },
    ],
    supervision: [
      { from: 2024, to: null, title: 'Direction de thèse : Clara Leroux', detail: 'Optimisation sous contraintes pour la planification énergétique' },
      { from: 2008, to: null, title: '9 thèses dirigées ou co-dirigées, dont 8 soutenues' },
    ],
    teaching: [
      { from: 2014, to: null, title: 'Recherche opérationnelle, programmation par contraintes (Master)', detail: '≈ 192 h équivalent TD par an' },
    ],
    service: [
      { from: 2020, to: null, title: 'Responsable de l’équipe TASC', place: 'LS2N' },
      { from: 2022, to: null, title: 'Présidente du comité de programme de JFPC 2025' },
    ],
    publicationCount: 11,
  },
  'thomas-renaud': {
    domain: 'alma',
    position: 'Maître de conférences en informatique',
    summary: 'Je travaille sur l’ingénierie dirigée par les modèles : vérification des transformations, co-évolution des métamodèles et du code, outils pour les langages dédiés.',
    keywords: ['ingénierie des modèles', 'transformation de modèles', 'langages dédiés', 'vérification'],
    positions: [
      { from: 2017, to: null, title: 'Maître de conférences', place: `${NU}, LS2N` },
      { from: 2015, to: 2017, title: 'Attaché temporaire d’enseignement et de recherche', place: 'Université de Rennes' },
    ],
    education: [
      { from: 2015, title: 'Doctorat en informatique', place: 'Université de Nantes', detail: 'Transformation de modèles et vérification incrémentale' },
    ],
    supervision: [{ from: 2018, to: null, title: '8 stages de master encadrés' }],
    teaching: [{ from: 2017, to: null, title: 'Génie logiciel, conception objet (Licence et Master)', detail: '≈ 210 h équivalent TD par an' }],
    service: [{ from: 2022, to: null, title: 'Directeur des études de la licence Informatique', place: NU }],
    publicationCount: 7,
  },
  'fatima-el-amrani': {
    domain: 'tasc',
    position: 'Directrice de recherche CNRS',
    summary: 'Je m’intéresse à l’apprentissage de modèles de contraintes à partir de données et à l’explication des solutions, avec des applications à la planification et aux réseaux d’énergie.',
    keywords: ['apprentissage de contraintes', 'IA explicable', 'planification', 'optimisation'],
    positions: [
      { from: 2020, to: null, title: 'Directrice de recherche', place: 'CNRS, LS2N' },
      { from: 2009, to: 2020, title: 'Chargée de recherche', place: 'CNRS, LS2N' },
    ],
    education: [
      { from: 2014, title: 'Habilitation à diriger des recherches', place: 'Université de Nantes' },
      { from: 2006, title: 'Doctorat en informatique', place: 'Université de Montpellier', detail: 'Programmation par contraintes et apprentissage de modèles' },
    ],
    supervision: [{ from: 2011, to: null, title: '6 thèses dirigées ou co-dirigées, dont 5 soutenues' }],
    service: [
      { from: 2023, to: null, title: 'Directrice adjointe du LS2N' },
      { from: 2019, to: null, title: 'Membre du comité éditorial', place: 'Constraints' },
    ],
    awards: [{ from: 2018, title: 'Prix de la meilleure contribution, conférence CP' }],
    publicationCount: 11,
  },
  'julien-beaumont': {
    domain: 'alma',
    position: 'Chargé de recherche CNRS',
    summary: 'Mes recherches portent sur les langages dédiés et l’orchestration des systèmes cyber-physiques, et sur la sobriété énergétique des plateformes logicielles.',
    keywords: ['langages dédiés', 'systèmes cyber-physiques', 'sobriété numérique'],
    positions: [
      { from: 2019, to: null, title: 'Chargé de recherche', place: 'CNRS, LS2N' },
      { from: 2016, to: 2019, title: 'Chercheur postdoctoral', place: 'Université de Montréal' },
    ],
    education: [
      { from: 2016, title: 'Doctorat en informatique', place: 'Université de Rennes, Inria', detail: 'Langages dédiés pour les systèmes cyber-physiques' },
    ],
    supervision: [{ from: 2021, to: null, title: 'Co-encadrement de thèse (40 %) : Antoine Perrin (soutenue en 2023)' }],
    service: [{ from: 2022, to: null, title: 'Correspondant science ouverte du laboratoire', place: 'LS2N' }],
    publicationCount: 8,
  },
  'clara-leroux': {
    domain: 'tasc',
    position: 'Doctorante en informatique',
    summary: 'Ma thèse porte sur l’optimisation sous contraintes pour la planification des communautés énergétiques locales.',
    keywords: ['optimisation', 'énergie', 'programmation par contraintes'],
    positions: [{ from: 2024, to: null, title: 'Doctorante, contrat doctoral', place: `${NU}, LS2N` }],
    education: [
      { from: 2024, to: null, title: 'Doctorat en informatique (en cours)', place: NU, detail: 'Direction : Isabelle Cordier ; co-encadrement : Jean Dupont' },
      { from: 2024, title: 'Master Informatique, parcours Optimisation', place: NU },
    ],
    teaching: [{ from: 2024, to: null, title: 'Mission d’enseignement : algorithmique (Licence 1)', detail: '64 h équivalent TD par an' }],
    publicationCount: 3,
  },
  'antoine-perrin': {
    domain: 'alma',
    position: 'Chercheur postdoctoral',
    summary: 'Je travaille sur l’analyse statique des architectures à microservices, en particulier la détection de défauts de sécurité.',
    keywords: ['microservices', 'analyse statique', 'sécurité logicielle'],
    positions: [{ from: 2024, to: null, title: 'Chercheur postdoctoral', place: `${NU}, LS2N` }],
    education: [
      { from: 2023, title: 'Doctorat en informatique', place: 'Université Grenoble Alpes', detail: 'Analyse statique de microservices' },
      { from: 2019, title: 'Diplôme d’ingénieur en informatique', place: 'Grenoble INP – Ensimag' },
    ],
    publicationCount: 5,
  },
  'sophie-marchand': {
    domain: 'tasc',
    position: 'Maîtresse de conférences en informatique',
    summary: 'Je conçois des méthodes de recherche locale et des méthodes hybrides pour les problèmes de tournées et d’emploi du temps.',
    keywords: ['recherche locale', 'tournées de véhicules', 'emploi du temps'],
    positions: [
      { from: 2014, to: null, title: 'Maîtresse de conférences', place: `${NU}, LS2N` },
      { from: 2012, to: 2014, title: 'Chercheuse postdoctorale', place: 'Polytechnique Montréal' },
    ],
    education: [
      { from: 2012, title: 'Doctorat en informatique', place: 'Université de Toulouse', detail: 'Recherche locale pour les problèmes de tournées' },
    ],
    supervision: [{ from: 2020, to: 2024, title: 'Co-encadrement de thèse (50 %) : Hugo Lemaire' }],
    teaching: [{ from: 2014, to: null, title: 'Recherche opérationnelle (IUT et Licence)', detail: '≈ 200 h équivalent TD par an' }],
    publicationCount: 7,
  },
  'laurent-viguier': {
    domain: 'alma',
    position: 'Ingénieur de recherche CNRS',
    summary: 'Ingénieur en développement logiciel, j’accompagne les équipes du laboratoire dans la conception, la diffusion et l’archivage de leurs logiciels de recherche.',
    keywords: ['logiciel de recherche', 'intégration continue', 'reproductibilité'],
    positions: [
      { from: 2012, to: null, title: 'Ingénieur de recherche', place: 'CNRS, LS2N' },
      { from: 2008, to: 2012, title: 'Ingénieur d’études et développement', place: 'Entreprise de services numériques, Rennes' },
    ],
    education: [{ from: 2008, title: 'Diplôme d’ingénieur en informatique', place: 'INSA Rennes' }],
    service: [{ from: 2020, to: null, title: 'Animateur du réseau des développeurs du laboratoire' }],
    publicationCount: 3,
  },
  'paul-dumont': {
    domain: 'maths',
    position: 'Professeur des universités en mathématiques',
    summary: 'Analyste, je travaille sur les équations aux dérivées partielles dispersives non linéaires : existence globale, diffusion, comportement en temps long.',
    keywords: ['EDP', 'équations dispersives', 'analyse harmonique'],
    positions: [
      { from: 2010, to: null, title: 'Professeur des universités', place: `${NU}, LMJL` },
      { from: 2003, to: 2010, title: 'Maître de conférences', place: 'Université Paris-Sud' },
    ],
    education: [
      { from: 2008, title: 'Habilitation à diriger des recherches', place: 'Université Paris-Sud' },
      { from: 2001, title: 'Doctorat en mathématiques', place: 'Université Paris-Sud', detail: 'Équations aux dérivées partielles non linéaires et ondes dispersives' },
    ],
    supervision: [{ from: 2011, to: null, title: '5 thèses dirigées, dont 4 soutenues' }],
    teaching: [{ from: 2010, to: null, title: 'Analyse fonctionnelle, EDP (Master)', detail: '≈ 192 h équivalent TD par an' }],
    service: [{ from: 2019, to: 2024, title: 'Directeur du LMJL' }],
    publicationCount: 10,
  },
  'helene-rousseau': {
    domain: 'maths',
    position: 'Maîtresse de conférences en mathématiques',
    summary: 'Statisticienne, je m’intéresse aux données fonctionnelles et aux processus stochastiques, avec des applications en épidémiologie.',
    keywords: ['statistique', 'données fonctionnelles', 'processus stochastiques'],
    positions: [{ from: 2015, to: null, title: 'Maîtresse de conférences', place: `${NU}, LMJL` }],
    education: [
      { from: 2013, title: 'Doctorat en mathématiques', place: 'Université Lyon 1', detail: 'Processus stochastiques et statistique des données fonctionnelles' },
    ],
    teaching: [{ from: 2015, to: null, title: 'Probabilités, statistique (Licence et Master)', detail: '≈ 192 h équivalent TD par an' }],
    publicationCount: 6,
  },
  'marc-legrand': {
    domain: 'maths',
    position: 'Chargé de recherche CNRS',
    summary: 'Je travaille en théorie des nombres : formes modulaires, congruences et représentations galoisiennes.',
    keywords: ['théorie des nombres', 'formes modulaires', 'représentations galoisiennes'],
    positions: [
      { from: 2017, to: null, title: 'Chargé de recherche', place: 'CNRS, LMJL' },
      { from: 2014, to: 2017, title: 'Chercheur postdoctoral', place: 'Université de Bonn' },
    ],
    education: [
      { from: 2014, title: 'Doctorat en mathématiques', place: 'Université de Bordeaux', detail: 'Formes modulaires et représentations galoisiennes' },
    ],
    publicationCount: 6,
  },
  'sophie-martin-gem': {
    domain: 'meca',
    position: 'Maîtresse de conférences en mécanique',
    summary: 'Je caractérise et modélise l’endommagement en fatigue des matériaux composites, notamment pour les structures marines.',
    keywords: ['composites', 'fatigue', 'endommagement', 'essais mécaniques'],
    positions: [{ from: 2013, to: null, title: 'Maîtresse de conférences', place: 'Centrale Nantes, GeM' }],
    education: [
      { from: 2011, title: 'Doctorat en mécanique', place: 'Centrale Nantes', detail: 'Comportement en fatigue des composites stratifiés' },
    ],
    teaching: [{ from: 2013, to: null, title: 'Mécanique des matériaux, composites (cycle ingénieur)', detail: '≈ 192 h équivalent TD par an' }],
    publicationCount: 7,
  },
  'carlos-silva': {
    domain: 'meca',
    position: 'Directeur de recherche CNRS',
    summary: 'Mes travaux portent sur la modélisation multi-échelle des matériaux hétérogènes et sur l’identification de lois de comportement à partir de mesures de champs.',
    keywords: ['mécanique des matériaux', 'multi-échelle', 'homogénéisation', 'mesures de champs'],
    positions: [
      { from: 2019, to: null, title: 'Directeur de recherche', place: 'CNRS, GeM' },
      { from: 2007, to: 2019, title: 'Chargé de recherche', place: 'CNRS, GeM' },
    ],
    education: [
      { from: 2012, title: 'Habilitation à diriger des recherches', place: 'Centrale Nantes' },
      { from: 2004, title: 'Doctorat en génie mécanique', place: 'Université de Porto', detail: 'Modélisation multi-échelle des matériaux hétérogènes' },
    ],
    supervision: [{ from: 2010, to: null, title: '8 thèses dirigées ou co-dirigées, dont 6 soutenues' }],
    service: [{ from: 2021, to: null, title: 'Responsable de l’équipe Matériaux du GeM' }],
    awards: [{ from: 2016, title: 'Prix Jean Mandel de l’Association française de mécanique' }],
    publicationCount: 10,
  },
}

/** Co-auteurs extérieurs, par domaine. */
const EXTERNAL_COAUTHORS: Record<Domain, string[]> = {
  ia: ['Morel, Lucie', 'Koné, Yanis', 'Schmidt, Anna', 'Garcia, Pablo'],
  tasc: ['Lemaire, Hugo', 'Rossi, Giulia', 'Nguyen, Minh', 'Bauer, Felix'],
  alma: ['Tremblay, Marc', 'Costa, Inês', 'Dubois, Léa', 'Kowalski, Piotr'],
  physique: ['Weber, Klaus', 'Ricci, Elena', 'Fontaine, Paul', 'Andersson, Eva'],
  maths: ['Laurent, Camille', 'Müller, Jonas', 'Sato, Haruki', 'Bianchi, Marco'],
  meca: ['Ferreira, Ana', 'Petit, Romain', 'Olsen, Kristian', 'Moreau, Inès'],
}

/* ------------------------------------------------------------------ */
/* Construction                                                       */
/* ------------------------------------------------------------------ */

type PersonJson = (typeof personsData)[number]

/** Petit hachage stable : même personne, même CV à chaque visite. */
const hash = (text: string) => {
  let h = 0
  for (const char of text) h = (h * 31 + char.charCodeAt(0)) >>> 0
  return h
}

const citedName = (first: string, last: string) => `${last}, ${first}`

const domainOf = (slug: string): Domain => SEEDS[slug]?.domain ?? 'ia'

const colleaguesOf = (person: PersonJson): string[] => {
  const domain = domainOf(person.slug)
  return personsData
    .filter((other) => other.uid !== person.uid && domainOf(other.slug) === domain)
    .map((other) => citedName(other.firstName, other.lastName))
}

const DOCUMENT_TYPES: Record<string, CvPublicationType> = {
  Article: 'article',
  Book: 'book',
  Conference: 'conference',
  Report: 'report',
}

/** Documents de la base où la personne figure : ils arrivent par le flux institutionnel, validés. */
const documentsOf = (person: PersonJson, lang: string): CvPublication[] =>
  documentsData
    .filter((doc) => doc.contributions.some((c) => c.person.uid === person.uid))
    .map((doc) => {
      const title = doc.titles.find((t) => t.language === lang) ?? doc.titles[0]
      const journal = (doc as { journal?: { title?: string; publisher?: string } }).journal
      return {
        id: doc.uid,
        type: DOCUMENT_TYPES[doc.documentType] ?? 'article',
        year: Number(doc.publicationDate.slice(0, 4)),
        title: title.value,
        authors: [...doc.contributions]
          .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99))
          // Pour les personnes de la base, le nom vient de leur fiche (l'uid fait foi).
          .map((c) => {
            const known = personsData.find((p) => p.uid === c.person.uid)
            return known ? citedName(known.firstName, known.lastName) : citedName(c.person.firstName, c.person.lastName)
          }),
        venue: journal?.title ?? (doc.documentType === 'Book' ? 'Éditions scientifiques' : doc.documentType === 'Report' ? 'Rapport' : 'Actes de conférence'),
        source: 'sovisu' as const,
        validated: true,
        openAccess: doc.oaStatus !== 'closed',
        halId: `hal-0${4000000 + (hash(doc.uid) % 999999)}`,
      }
    })

const generatedPublications = (person: PersonJson, seed: Seed, hasOrcid: boolean, hasHal: boolean): CvPublication[] => {
  const pool = POOLS[seed.domain]
  const offset = hash(person.slug) % pool.length
  const colleagues = colleaguesOf(person)
  const externals = EXTERNAL_COAUTHORS[seed.domain]
  const self = citedName(person.firstName, person.lastName)
  const start = Math.max(...seed.education.map((e) => e.from ?? 2026).filter((y) => y < 2026), 2000) - 1
  const firstYear = Math.min(start, 2025)
  const span = Math.max(2026 - firstYear, 1)

  return Array.from({ length: seed.publicationCount }, (_, i) => {
    const item = pool[(offset + i) % pool.length]
    const h = hash(`${person.slug}-${i}`)
    const year = 2026 - Math.floor((i * span) / seed.publicationCount) - (i === 0 ? 0 : h % 2)
    const coauthors = [colleagues[h % Math.max(colleagues.length, 1)], externals[h % externals.length], externals[(h >> 3) % externals.length]]
      .filter((name, idx, all): name is string => !!name && all.indexOf(name) === idx)
      .slice(0, 1 + (h % 3))
    const rank = item.type === 'book' ? 0 : h % (coauthors.length + 1)
    const authors = [...coauthors]
    authors.splice(rank, 0, self)

    // Sources : la plupart des références sont validées dans SoVisu+ ; quelques-unes
    // ne sont connues que d'OpenAlex (via l'ORCID) et restent à vérifier.
    let source: CvSource = 'sovisu'
    let validated = true
    if (hasOrcid && i % 5 === 3) {
      source = 'openalex'
      validated = false
    } else if (hasHal && i % 4 === 1) {
      source = 'hal'
    }

    return {
      id: `${person.slug}-pub-${i}`,
      type: item.type,
      year: Math.max(year, firstYear),
      title: item.title,
      authors,
      venue: item.venue,
      doi: item.type === 'software' || item.type === 'report' ? undefined : `10.${1000 + (h % 9000)}/${person.slug.slice(0, 4)}.${year}.${(h % 90000) + 10000}`,
      halId: hasHal || source === 'sovisu' ? `hal-0${4000000 + (h % 999999)}` : undefined,
      source,
      validated,
      openAccess: h % 3 !== 0,
    }
  })
}

const identifier = (person: PersonJson, type: string) =>
  person.identifiers?.find((id) => id.type === type)?.value

/** CV d'une personne de la base, ou null si elle n'est pas dans la maquette. */
export const getPersonCv = (uid: string, lang = 'fr'): PersonCv | null => {
  const person = personsData.find((p) => p.uid === uid)
  if (!person) return null
  const seed = SEEDS[person.slug]
  if (!seed) return null

  const orcid = identifier(person, 'orcid')
  const idhal = identifier(person, 'id_hal_s')
  const idref = identifier(person, 'idref')

  const publications = [
    ...documentsOf(person, lang),
    ...generatedPublications(person, seed, !!orcid, !!idhal),
  ].sort((a, b) => b.year - a.year || a.title.localeCompare(b.title))

  const domainProjects = PROJECTS[seed.domain]
  const junior = /Doctorant|Post-doc|Ingé/.test(person.statut ?? '')

  return {
    uid: person.uid,
    slug: person.slug,
    firstName: person.firstName,
    lastName: person.lastName,
    displayName: person.displayName,
    position: seed.position,
    affiliations: [
      ...(person.memberships ?? []).map((m) => {
        const name = m.researchStructure.names?.[0]?.value
        return name && name !== m.researchStructure.acronym ? `${m.researchStructure.acronym} — ${name}` : m.researchStructure.acronym
      }),
      person.institution?.names?.[0]?.value,
    ].filter((x): x is string => !!x),
    email: person.email,
    orcid,
    idhal,
    idref,
    summary: seed.summary,
    keywords: seed.keywords ?? (person as { keywords?: string[] }).keywords ?? [],
    positions: seed.positions,
    education: seed.education,
    publications,
    projects: junior ? domainProjects.slice(0, 1).map((p) => ({ ...p, detail: p.detail?.replace(/ — (coordination|porteuse|partenaire|responsable.*)$/, ' — participation') })) : domainProjects,
    supervision: seed.supervision ?? [],
    teaching: seed.teaching ?? [],
    service: seed.service ?? [],
    awards: seed.awards ?? [],
  }
}

/** Personnes de la base qui ont un CV de maquette. */
export const CV_PERSON_UIDS = personsData.filter((p) => SEEDS[p.slug]).map((p) => p.uid)

/* ------------------------------------------------------------------ */
/* Modèles et styles                                                  */
/* ------------------------------------------------------------------ */

export type CvTemplate = 'complete' | 'short' | 'anr' | 'erc'
export type CitationStyle = 'apa' | 'vancouver' | 'iso690'

export type CvSectionKey =
  | 'summary' | 'positions' | 'education' | 'publications' | 'projects'
  | 'supervision' | 'teaching' | 'service' | 'awards'

export const SECTION_ORDER: CvSectionKey[] = [
  'summary', 'positions', 'education', 'projects', 'publications', 'supervision', 'teaching', 'service', 'awards',
]

export const SECTION_LABELS: Record<'fr' | 'en', Record<CvSectionKey, string>> = {
  fr: {
    summary: 'Présentation', positions: 'Parcours professionnel', education: 'Formation et diplômes',
    publications: 'Publications', projects: 'Projets et financements', supervision: 'Encadrement',
    teaching: 'Enseignement', service: 'Responsabilités collectives', awards: 'Prix et distinctions',
  },
  en: {
    summary: 'Profile', positions: 'Employment', education: 'Education',
    publications: 'Publications', projects: 'Grants and projects', supervision: 'Supervision',
    teaching: 'Teaching', service: 'Service to the community', awards: 'Awards and honours',
  },
}

export const TEMPLATES: Record<CvTemplate, { label: string; description: string; sections: CvSectionKey[]; maxPublications?: number; sinceYears?: number }> = {
  complete: {
    label: 'CV complet',
    description: 'Toutes les rubriques, toutes les publications.',
    sections: SECTION_ORDER,
  },
  short: {
    label: 'CV court (2 pages)',
    description: 'Parcours, formation et 5 publications récentes.',
    sections: ['summary', 'positions', 'education', 'publications', 'awards'],
    maxPublications: 5,
  },
  anr: {
    label: 'ANR — CV du porteur',
    description: 'Format de l’appel à projets générique : parcours, 5 publications, projets, encadrement.',
    sections: ['positions', 'education', 'publications', 'projects', 'supervision', 'awards'],
    maxPublications: 5,
  },
  erc: {
    label: 'ERC — Track record',
    description: 'Dix dernières années : publications, financements, prix, encadrement.',
    sections: ['summary', 'positions', 'education', 'publications', 'projects', 'supervision', 'awards'],
    maxPublications: 10,
    sinceYears: 10,
  },
}

export const CITATION_STYLES: Record<CitationStyle, string> = {
  apa: 'APA (7e éd.)',
  vancouver: 'Vancouver',
  iso690: 'ISO 690',
}

const initials = (first: string) =>
  first.split(/[\s-]+/).filter(Boolean).map((part) => `${part[0]}.`).join(first.includes('-') ? '-' : ' ')

const splitName = (name: string) => {
  const [last, first = ''] = name.split(', ')
  return { last, first }
}

/** Liste d'auteurs dans le style demandé. */
export const formatAuthors = (authors: string[], style: CitationStyle): string => {
  const parts = authors.map((name) => {
    const { last, first } = splitName(name)
    if (style === 'apa') return `${last}, ${initials(first)}`
    if (style === 'vancouver') return `${last} ${initials(first).replace(/[.\s]/g, '')}`
    return `${last.toUpperCase()}, ${first}`
  })
  if (style === 'vancouver') return parts.join(', ')
  if (parts.length === 1) return parts[0]
  const sep = style === 'apa' ? ', & ' : ' et '
  return `${parts.slice(0, -1).join(', ')}${sep}${parts[parts.length - 1]}`
}

/** Publications retenues pour un modèle donné. */
export const selectPublications = (cv: PersonCv, template: CvTemplate, includeUnvalidated: boolean, now = 2026) => {
  const config = TEMPLATES[template]
  let list = cv.publications.filter((p) => includeUnvalidated || p.validated)
  if (config.sinceYears) list = list.filter((p) => p.year > now - config.sinceYears!)
  if (config.maxPublications) list = list.slice(0, config.maxPublications)
  return list
}

/* ------------------------------------------------------------------ */
/* Exports                                                            */
/* ------------------------------------------------------------------ */

const CSL_TYPES: Record<CvPublicationType, string> = {
  article: 'article-journal', conference: 'paper-conference', book: 'book',
  chapter: 'chapter', report: 'report', software: 'software',
}

/** CSL-JSON : le format du flux institutionnel décrit dans le plan (§ 5.1). */
export const toCslJson = (publications: CvPublication[]) =>
  JSON.stringify(
    publications.map((p) => ({
      id: p.id,
      type: CSL_TYPES[p.type],
      title: p.title,
      author: p.authors.map((name) => {
        const { last, first } = splitName(name)
        return { family: last, given: first }
      }),
      'container-title': p.venue,
      issued: { 'date-parts': [[p.year]] },
      ...(p.doi ? { DOI: p.doi } : {}),
      ...(p.halId ? { note: `HAL: ${p.halId}` } : {}),
      custom: { source: p.source, validated: p.validated },
    })),
    null,
    2,
  )

const BIBTEX_TYPES: Record<CvPublicationType, string> = {
  article: 'article', conference: 'inproceedings', book: 'book',
  chapter: 'incollection', report: 'techreport', software: 'software',
}

export const toBibtex = (publications: CvPublication[]) =>
  publications
    .map((p) => {
      const key = `${splitName(p.authors[0]).last.toLowerCase().replace(/[^a-z]/g, '')}${p.year}${p.id.slice(-2).replace(/\W/g, '')}`
      const venueField = p.type === 'article' ? 'journal' : p.type === 'report' ? 'institution' : p.type === 'book' ? 'publisher' : 'booktitle'
      const fields = [
        `  title = {${p.title}}`,
        `  author = {${p.authors.join(' and ')}}`,
        `  ${venueField} = {${p.venue}}`,
        `  year = {${p.year}}`,
        ...(p.doi ? [`  doi = {${p.doi}}`] : []),
        ...(p.halId ? [`  hal_id = {${p.halId}}`] : []),
      ]
      return `@${BIBTEX_TYPES[p.type]}{${key},\n${fields.join(',\n')}\n}`
    })
    .join('\n\n')
