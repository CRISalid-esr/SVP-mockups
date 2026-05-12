'use client'

import { SessionProvider } from 'next-auth/react'
import React from 'react'

const MOCK_SESSION = {
  user: {
    name: 'Mock User',
    email: 'mock@example.com',
    authz: {
      userId: 'mock-user-id',
      personUid: 'person-1',
      roleAssignments: [
        {
          role: 'ADMIN',
          permissions: [
            { action: 'manage', subject: 'all' }
          ],
          scopes: []
        }
      ],
      roles: ['ADMIN'],
      scopes: []
    }
  },
  expires: '2099-01-01T00:00:00.000Z'
}

const SessionProviderWrapper = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true'
  return (
    <SessionProvider session={isMock ? (MOCK_SESSION as any) : undefined}>
      {children}
    </SessionProvider>
  )
}
export default SessionProviderWrapper
