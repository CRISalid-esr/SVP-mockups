import { NextResponse } from 'next/server'
import { getServerSession, Session } from 'next-auth'
import authOptions from '@/app/auth/auth_options'
import {
  PersonIdentifier,
  PersonIdentifierType,
} from '@/types/PersonIdentifier'
import { UserService } from '@/lib/services/UserService'

export const GET = async () => {
  try {
    // Get the session to identify the connected user
    const session = (await getServerSession(authOptions)) as Session & {
      user: { username?: string; orcid?: string; id?: string }
    }

    let electedIdentifier: PersonIdentifier | null = null

    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
      return NextResponse.json({
        id: 'mock-user-id',
        username: 'mockuser',
        person: {
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
        },
        rolesAssignments: []
      })
    }

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 },
      )
    }

    if (session?.user.username) {
      electedIdentifier = new PersonIdentifier(
        PersonIdentifierType.LOCAL,
        session?.user.username,
      )
    } else if (session?.user.orcid) {
      electedIdentifier = new PersonIdentifier(
        PersonIdentifierType.ORCID,
        session?.user.orcid,
      )
    }

    if (!electedIdentifier) {
      return NextResponse.json(
        { error: 'No valid identifier found' },
        { status: 400 },
      )
    }
    const userService = new UserService()
    const connectedUser =
      await userService.getUserByPersonIdentifier(electedIdentifier)

    if (!connectedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json(connectedUser)
  } catch (error) {
    console.error('Error fetching connected user:', error)
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
