/**
 * Données mock de la gestion des droits.
 *
 * Principe (proposition CRISalid) : les droits vivent dans Keycloak sous forme
 * d'une arborescence de groupes qui suit la hiérarchie organisationnelle
 * (établissement > composante > labo > équipe), avec des feuilles par rôle à
 * chaque niveau. Le full group path est encodé dans le JWT
 * (ex. /UnivParis1/UFR08/LaboXYZ/account_editor) ; chaque application cliente
 * (SoVisu+, chatbot, Projects, couche MCP) en déduit rôle + périmètre en
 * parsant le chemin. Un droit s'applique aux sous-structures. Aucune
 * assignation dans les applis clientes : uniquement de l'interprétation.
 */

// ── Vocabulaire de rôles transverse ─────────────────────────────────────────

export interface RoleDef {
  key: string
  label: string
  description: string
  /** Applications qui interprètent ce rôle */
  apps: AppKey[]
}

export type AppKey = 'sovisu' | 'chatbot' | 'projects' | 'mcp'

export const APPS: Record<AppKey, { label: string; color: string }> = {
  sovisu: { label: 'SoVisu+', color: '#00695c' },
  chatbot: { label: 'Chatbot', color: '#5e35b1' },
  projects: { label: 'Projects', color: '#ef6c00' },
  mcp: { label: 'Couche MCP', color: '#455a64' },
}

export const ROLES: RoleDef[] = [
  {
    key: 'admin',
    label: 'Administrateur',
    description:
      'Tous les droits sur le périmètre : gestion des comptes, des documents, des projets et des paramètres. Au niveau établissement, équivaut à un administrateur global.',
    apps: ['sovisu', 'chatbot', 'projects', 'mcp'],
  },
  {
    key: 'account_editor',
    label: 'Gestionnaire de comptes',
    description:
      'Crée, modifie et fusionne les comptes et identifiants (IdHAL, ORCID, IdRef) des personnes du périmètre.',
    apps: ['sovisu', 'mcp'],
  },
  {
    key: 'document_viewer',
    label: 'Lecteur de documents',
    description:
      'Consulte les publications et signalements du périmètre, y compris les documents non publiés.',
    apps: ['sovisu', 'chatbot', 'mcp'],
  },
  {
    key: 'document_editor',
    label: 'Éditeur de documents',
    description:
      'Corrige, valide et dépose les publications du périmètre (dont le dépôt HAL).',
    apps: ['sovisu', 'mcp'],
  },
  {
    key: 'project_viewer',
    label: 'Lecteur de projets',
    description: 'Consulte les projets de recherche du périmètre dans Projects.',
    apps: ['projects', 'chatbot', 'mcp'],
  },
  {
    key: 'project_editor',
    label: 'Éditeur de projets',
    description:
      'Crée et modifie les projets de recherche du périmètre dans Projects.',
    apps: ['projects', 'mcp'],
  },
]

export const ROLE_KEYS = ROLES.map((role) => role.key)

export function getRole(key: string): RoleDef | undefined {
  return ROLES.find((role) => role.key === key)
}

// ── Arborescence organisationnelle (issue de l'organigramme CRISalid) ──────

export type OrgNodeType = 'institution' | 'component' | 'laboratory' | 'team'

export interface OrgNode {
  /** Segment du chemin Keycloak (sans espace ni accent) */
  id: string
  /** Libellé affiché */
  name: string
  type: OrgNodeType
  children?: OrgNode[]
}

export const ORG_TYPE_LABELS: Record<OrgNodeType, string> = {
  institution: 'Établissement',
  component: 'Composante',
  laboratory: 'Laboratoire',
  team: 'Équipe',
}

export const ORG_TREE: OrgNode[] = [
  {
    id: 'NantesUniversite',
    name: 'Nantes Université',
    type: 'institution',
    children: [
      {
        id: 'UFR-Sciences',
        name: 'UFR Sciences et Techniques',
        type: 'component',
        children: [
          {
            id: 'LS2N',
            name: 'LS2N — Laboratoire des Sciences du Numérique de Nantes',
            type: 'laboratory',
            children: [
              { id: 'DUKe', name: 'Équipe DUKe', type: 'team' },
              { id: 'TALN', name: 'Équipe TALN', type: 'team' },
            ],
          },
          {
            id: 'CEISAM',
            name: 'CEISAM — Chimie et Interdisciplinarité',
            type: 'laboratory',
          },
          {
            id: 'IMN',
            name: 'IMN — Institut des Matériaux Jean Rouxel',
            type: 'laboratory',
            children: [{ id: 'ST2E', name: 'Équipe ST2E', type: 'team' }],
          },
        ],
      },
      {
        id: 'Polytech',
        name: 'Polytech Nantes',
        type: 'component',
        children: [
          {
            id: 'IREENA',
            name: 'IREENA — Institut de Recherche en Énergie Électrique',
            type: 'laboratory',
          },
        ],
      },
      {
        id: 'UFR-Sante',
        name: 'UFR Santé',
        type: 'component',
        children: [
          {
            id: 'CRCI2NA',
            name: 'CRCI2NA — Cancérologie et Immunologie Intégrées',
            type: 'laboratory',
          },
        ],
      },
    ],
  },
  {
    id: 'UnivParis1',
    name: 'Université Paris 1 Panthéon-Sorbonne',
    type: 'institution',
    children: [
      {
        id: 'UFR08',
        name: 'UFR 08 — Géographie',
        type: 'component',
        children: [
          {
            id: 'LaboXYZ',
            name: 'Labo XYZ',
            type: 'laboratory',
            children: [{ id: 'EquipeTruc', name: 'Équipe Truc', type: 'team' }],
          },
        ],
      },
      {
        id: 'UFR02',
        name: 'UFR 02 — Droit',
        type: 'component',
      },
    ],
  },
]

// ── Helpers chemins ──────────────────────────────────────────────────────────

export interface ScopeOption {
  /** Chemin Keycloak du périmètre, ex. /NantesUniversite/UFR-Sciences/LS2N */
  path: string
  /** Libellés du chemin, ex. ['Nantes Université', 'UFR Sciences…', 'LS2N…'] */
  labels: string[]
  node: OrgNode
  depth: number
}

/** Aplatis l'arborescence en options de périmètre (pour les sélecteurs). */
export function flattenOrgTree(
  nodes: OrgNode[] = ORG_TREE,
  parentPath = '',
  parentLabels: string[] = [],
  depth = 0,
): ScopeOption[] {
  return nodes.flatMap((node) => {
    const path = `${parentPath}/${node.id}`
    const labels = [...parentLabels, node.name]
    return [
      { path, labels, node, depth },
      ...flattenOrgTree(node.children ?? [], path, labels, depth + 1),
    ]
  })
}

export const SCOPE_OPTIONS = flattenOrgTree()

export function findScope(path: string): ScopeOption | undefined {
  return SCOPE_OPTIONS.find((option) => option.path === path)
}

export interface ParsedAssignment {
  /** Chemin complet du groupe, ex. /UnivParis1/UFR08/LaboXYZ/account_editor */
  groupPath: string
  role: RoleDef
  scope: ScopeOption
}

/**
 * Parse un full group path Keycloak en rôle + périmètre — exactement ce que
 * feraient les applications clientes à la lecture du JWT.
 */
export function parseGroupPath(groupPath: string): ParsedAssignment | null {
  const segments = groupPath.split('/').filter(Boolean)
  if (segments.length < 2) return null
  const roleKey = segments[segments.length - 1]
  const role = getRole(roleKey)
  if (!role) return null
  const scope = findScope('/' + segments.slice(0, -1).join('/'))
  if (!scope) return null
  return { groupPath, role, scope }
}

// ── Utilisateurs mock ────────────────────────────────────────────────────────

export interface RightsUser {
  id: string
  firstName: string
  lastName: string
  email: string
  institution: string
  /** Full group paths Keycloak (assignations par défaut) */
  groups: string[]
}

export const MOCK_USERS: RightsUser[] = [
  {
    id: 'jdupont',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@univ-nantes.fr',
    institution: 'Nantes Université',
    groups: ['/NantesUniversite/admin'],
  },
  {
    id: 'smartin',
    firstName: 'Sophie',
    lastName: 'Martin',
    email: 'sophie.martin@univ-nantes.fr',
    institution: 'Nantes Université',
    groups: [
      '/NantesUniversite/UFR-Sciences/document_editor',
      '/NantesUniversite/UFR-Sciences/account_editor',
    ],
  },
  {
    id: 'pbernard',
    firstName: 'Pierre',
    lastName: 'Bernard',
    email: 'pierre.bernard@univ-nantes.fr',
    institution: 'Nantes Université',
    groups: ['/NantesUniversite/UFR-Sciences/LS2N/account_editor'],
  },
  {
    id: 'aleclerc',
    firstName: 'Anne',
    lastName: 'Leclerc',
    email: 'anne.leclerc@univ-nantes.fr',
    institution: 'Nantes Université',
    groups: [
      '/NantesUniversite/UFR-Sciences/LS2N/document_viewer',
      '/NantesUniversite/UFR-Sciences/LS2N/DUKe/project_editor',
    ],
  },
  {
    id: 'mrousseau',
    firstName: 'Marc',
    lastName: 'Rousseau',
    email: 'marc.rousseau@univ-nantes.fr',
    institution: 'Nantes Université',
    groups: ['/NantesUniversite/UFR-Sciences/IMN/document_editor'],
  },
  {
    id: 'kbenali',
    firstName: 'Amira',
    lastName: 'Benali',
    email: 'amira.benali@univ-nantes.fr',
    institution: 'Nantes Université',
    groups: [
      '/NantesUniversite/Polytech/IREENA/document_editor',
      '/NantesUniversite/Polytech/IREENA/project_viewer',
    ],
  },
  {
    id: 'cvasseur',
    firstName: 'Claire',
    lastName: 'Vasseur',
    email: 'claire.vasseur@univ-paris1.fr',
    institution: 'Université Paris 1 Panthéon-Sorbonne',
    groups: [
      '/UnivParis1/UFR08/account_editor',
      '/UnivParis1/UFR08/LaboXYZ/document_editor',
    ],
  },
  {
    id: 'tlefevre',
    firstName: 'Thomas',
    lastName: 'Lefèvre',
    email: 'thomas.lefevre@univ-paris1.fr',
    institution: 'Université Paris 1 Panthéon-Sorbonne',
    groups: ['/UnivParis1/UFR08/LaboXYZ/EquipeTruc/account_editor'],
  },
]

// ── Persistance locale des assignations (maquette) ──────────────────────────

const STORAGE_KEY = 'rights-assignments-v1'

export type AssignmentMap = Record<string, string[]>

export function loadAssignments(): AssignmentMap {
  const defaults: AssignmentMap = Object.fromEntries(
    MOCK_USERS.map((user) => [user.id, user.groups]),
  )
  if (typeof window === 'undefined') return defaults
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (!stored || typeof stored !== 'object') return defaults
    return { ...defaults, ...stored }
  } catch {
    return defaults
  }
}

export function saveAssignments(assignments: AssignmentMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments))
  } catch {
    /* quota plein : les modifications restent en mémoire */
  }
}

/** Construit un exemple de JWT décodé pour un utilisateur (payload seul). */
export function buildJwtPayload(user: RightsUser, groups: string[]) {
  return {
    iss: 'https://auth.crisalid.org/realms/crisalid',
    sub: `f:${user.id}`,
    preferred_username: user.id,
    given_name: user.firstName,
    family_name: user.lastName,
    email: user.email,
    groups,
  }
}
