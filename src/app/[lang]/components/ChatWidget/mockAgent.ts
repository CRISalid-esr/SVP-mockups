import type { ChatAdapter, ChatMessageChunk } from '@mui/x-chat-headless'
import removeAccents from 'remove-accents'

/**
 * Adaptateur mock du CRISalid Graph Agent (https://github.com/CRISalid-esr/crisalid-agents).
 * Simule l'interrogation du graphe de connaissances : appels d'outils (latence
 * comprise) puis réponse textuelle streamée mot à mot, au format de chunks
 * attendu par @mui/x-chat.
 */

interface MockToolCall {
  toolName: string
  input: Record<string, unknown>
  output: unknown
  durationMs: number
}

interface MockScenario {
  keywords: string[]
  tools: MockToolCall[]
  text: string
}

const SCENARIOS: MockScenario[] = [
  {
    keywords: ['sais-tu faire', 'peux-tu faire', 'sais tu faire', 'aide', 'capacites'],
    tools: [],
    text: [
      "Je suis l'assistant de recherche du consortium **CRISalid**. J'interroge le graphe de connaissances de Nantes Université pour répondre à vos questions sur :",
      '',
      "- **Les publications** — retrouver les travaux d'un chercheur, d'un laboratoire ou sur un sujet ;",
      '- **Les laboratoires** — domaines de recherche, équipes, tutelles ;',
      '- **Les collaborations** — copublications entre structures, partenariats internationaux ;',
      '- **Les expertises** — identifier qui travaille sur une thématique donnée.',
      '',
      'Essayez par exemple : *« Quels sont les domaines de recherche du LPPL ? »* ou *« Qui travaille sur les batteries du futur ? »*',
    ].join('\n'),
  },
  {
    keywords: ['lppl'],
    tools: [
      {
        toolName: 'search_structures',
        input: { query: 'LPPL' },
        output: {
          acronym: 'LPPL',
          name: 'Laboratoire de Psychologie des Pays de la Loire',
          id: 'UR 4638',
          institutions: ['Nantes Université', "Université d'Angers"],
        },
        durationMs: 700,
      },
      {
        toolName: 'get_research_themes',
        input: { structure: 'UR 4638' },
        output: {
          themes: [
            'psychologie sociale',
            'psychologie clinique et psychopathologie',
            'neuropsychologie et cognition',
            'psychologie du développement',
          ],
        },
        durationMs: 900,
      },
    ],
    text: [
      'Le **LPPL** (Laboratoire de Psychologie des Pays de la Loire, UR 4638) est un laboratoire bi-site Nantes / Angers. Ses recherches s’organisent autour de quatre domaines principaux :',
      '',
      '1. **Psychologie sociale** — cognition sociale, jugement, discriminations ;',
      '2. **Psychologie clinique et psychopathologie** — vulnérabilités, addictions, interventions thérapeutiques ;',
      '3. **Neuropsychologie et cognition** — mémoire, fonctions exécutives, vieillissement cognitif ;',
      '4. **Psychologie du développement** — apprentissages, développement de l’enfant et de l’adolescent.',
      '',
      'Sur la période 2020-2025, le graphe recense **412 publications** pour ce laboratoire, dont 38 % en accès ouvert. Voulez-vous la liste des thèmes émergents ou les principaux partenaires ?',
    ].join('\n'),
  },
  {
    keywords: ['crci2na', 'belgique'],
    tools: [
      {
        toolName: 'search_structures',
        input: { query: 'CRCI2NA' },
        output: {
          acronym: 'CRCI2NA',
          name: 'Centre de Recherche en Cancérologie et Immunologie Intégrées Nantes-Angers',
          id: 'UMR 1307 / UMR 6075',
        },
        durationMs: 650,
      },
      {
        toolName: 'find_copublications',
        input: { structure: 'CRCI2NA', country: 'Belgique', since: 2020 },
        output: {
          total: 27,
          partners: [
            { name: 'UCLouvain', count: 11 },
            { name: 'KU Leuven', count: 8 },
            { name: 'Université de Liège (GIGA)', count: 5 },
            { name: 'Universiteit Gent', count: 3 },
          ],
        },
        durationMs: 1100,
      },
    ],
    text: [
      'Oui. Le graphe recense **27 copublications** entre le **CRCI2NA** (Centre de Recherche en Cancérologie et Immunologie Intégrées Nantes-Angers) et des institutions belges depuis 2020 :',
      '',
      '- **UCLouvain** — 11 copublications, principalement en immunothérapie des cancers ;',
      '- **KU Leuven** — 8 copublications, autour du myélome multiple ;',
      '- **Université de Liège (GIGA)** — 5 copublications en oncohématologie ;',
      '- **Universiteit Gent** — 3 copublications sur les thérapies cellulaires CAR-T.',
      '',
      'Les collaborations les plus actives concernent l’axe *immunologie et immunothérapie des cancers*, avec un pic de copublications en 2024.',
    ].join('\n'),
  },
  {
    keywords: ['batterie', 'batteries'],
    tools: [
      {
        toolName: 'search_concepts',
        input: { query: 'batteries du futur' },
        output: {
          concepts: [
            'stockage électrochimique',
            'batteries sodium-ion',
            'batteries tout-solide',
            'gestion de batteries',
          ],
        },
        durationMs: 600,
      },
      {
        toolName: 'search_experts',
        input: { concepts: ['stockage électrochimique', 'batteries'], scope: 'Nantes Université' },
        output: {
          structures: ['IMN', 'CEISAM', 'IREENA', 'LS2N'],
          experts: 23,
        },
        durationMs: 1000,
      },
    ],
    text: [
      'Plusieurs équipes de Nantes Université travaillent sur le stockage électrochimique de l’énergie :',
      '',
      '- **IMN — Institut des Matériaux de Nantes Jean Rouxel** : l’équipe *ST2E* développe des matériaux d’électrodes pour batteries sodium-ion et tout-solide (12 chercheurs, 87 publications depuis 2020) ;',
      '- **CEISAM** : électrolytes organiques et batteries redox-flow ;',
      '- **IREENA** : gestion et vieillissement des batteries pour la mobilité électrique et le stockage réseau ;',
      '- **LS2N** : algorithmes de diagnostic et jumeaux numériques de batteries.',
      '',
      'Les profils les plus actifs sur cette thématique : *M. Rousseau* (IMN), *C. Lemoine* (IMN) et *A. Benali* (IREENA). Voulez-vous leurs fiches d’expertise ?',
    ].join('\n'),
  },
]

const FALLBACK_SCENARIO: MockScenario = {
  keywords: [],
  tools: [
    {
      toolName: 'search_graph',
      input: { query: '…' },
      output: { results: [] },
      durationMs: 800,
    },
  ],
  text: [
    'Je n’ai pas trouvé de réponse dans le graphe pour cette question.',
    '',
    '*Ceci est une maquette : je ne sais répondre qu’à quelques questions de démonstration.* Essayez par exemple :',
    '',
    '- Que sais-tu faire ?',
    '- Quels sont les domaines de recherche du LPPL ?',
    '- Y a-t-il des collaborations entre le CRCI2NA et la Belgique ?',
    '- Qui travaille sur les batteries du futur ?',
  ].join('\n'),
}

function pickScenario(question: string): MockScenario {
  const normalized = removeAccents(question.toLowerCase())
  return (
    SCENARIOS.find((scenario) =>
      scenario.keywords.some((keyword) => normalized.includes(keyword)),
    ) ?? FALLBACK_SCENARIO
  )
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function createMockStream(
  scenario: MockScenario,
  signal: AbortSignal,
): ReadableStream<ChatMessageChunk> {
  const messageId = `assistant-${Date.now()}`
  const textId = `${messageId}-text`

  return new ReadableStream<ChatMessageChunk>({
    async start(controller) {
      const push = (chunk: ChatMessageChunk) => controller.enqueue(chunk)
      try {
        push({ type: 'start', messageId })

        for (const [index, tool] of scenario.tools.entries()) {
          if (signal.aborted) break
          const toolCallId = `${messageId}-tool-${index}`
          push({ type: 'tool-input-start', toolCallId, toolName: tool.toolName })
          await wait(350)
          if (signal.aborted) break
          push({
            type: 'tool-input-available',
            toolCallId,
            toolName: tool.toolName,
            input: tool.input,
          })
          await wait(tool.durationMs)
          if (signal.aborted) break
          push({ type: 'tool-output-available', toolCallId, output: tool.output })
        }

        if (!signal.aborted) {
          push({ type: 'text-start', id: textId })
          const words = scenario.text.match(/\S+\s*/g) ?? [scenario.text]
          for (const word of words) {
            if (signal.aborted) break
            push({ type: 'text-delta', id: textId, delta: word })
            await wait(18)
          }
          push({ type: 'text-end', id: textId })
        }

        if (signal.aborted) {
          push({ type: 'abort', messageId })
        } else {
          push({ type: 'finish', messageId })
        }
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    },
  })
}

export function createCrisalidMockAdapter(): ChatAdapter {
  return {
    async sendMessage({ message, signal }) {
      const question = message.parts
        .map((part) => (part.type === 'text' ? part.text : ''))
        .join(' ')
      // Latence réseau simulée avant l'ouverture du stream
      await wait(400)
      return createMockStream(pickScenario(question), signal)
    },
  }
}
