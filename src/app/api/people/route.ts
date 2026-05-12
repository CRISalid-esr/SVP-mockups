import { NextRequest, NextResponse } from 'next/server'
import { PersonService } from '@/lib/services/PersonService'

export const GET = async (req: NextRequest) => {
  const urlParams = req.nextUrl.searchParams
  const searchTerm = urlParams.get('searchTerm') || ''
  const page = parseInt(urlParams.get('page') || '1', 10)
  const includeExternal = urlParams.get('includeExternal') === 'true'
  const itemsPerPage = 10

  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return NextResponse.json({
      people: [
        {
          uid: 'person-1',
          firstName: 'Jean',
          lastName: 'Dupont',
          displayName: 'Jean Dupont',
          email: 'jean.dupont@universite.fr',
          external: false,
          identifiers: [],
          memberships: [
            {
              id: 1,
              personId: 1,
              researchStructureId: 1,
              researchStructure: {
                uid: 'lab-1',
                acronym: 'LIP6',
                names: [{ language: 'fr', value: "Laboratoire d'Informatique de Paris 6" }]
              }
            }
          ]
        }
      ],
      total: 1,
      hasMore: false,
    })
  }

  const personService = new PersonService()

  try {
    const { people, total, hasMore } = await personService.fetchPeople(
      searchTerm,
      page,
      includeExternal,
      itemsPerPage,
    )

    return NextResponse.json({
      people,
      total,
      hasMore,
    })
  } catch (error) {
    console.error('Error fetching people:', error)
    return NextResponse.json(
      { error: 'Failed to fetch people. Please try again later.' },
      { status: 500 },
    )
  }
}
