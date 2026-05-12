import { NextRequest, NextResponse } from 'next/server'
import { PersonService } from '@/lib/services/PersonService'

export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ slug: string }> },
) => {
  const { slug } = await context.params
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return NextResponse.json({
      uid: 'person-1',
      firstName: 'Jean',
      lastName: 'Dupont',
      displayName: 'Jean Dupont',
      email: 'jean.dupont@universite.fr',
      external: false,
      slug: 'person:jean-dupont',
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
    })
  }

  const personService = new PersonService()

  try {
    const person = await personService.fetchPersonBySlug(slug)
    if (!person) {
      return NextResponse.json(
        { error: `Person with slug ${slug} not found.` },
        { status: 404 },
      )
    }

    return NextResponse.json(person)
  } catch (error) {
    console.error(`Error fetching person with slug ${slug}:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch person.' },
      { status: 500 },
    )
  }
}
