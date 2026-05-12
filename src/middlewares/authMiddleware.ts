import { CustomMiddleware } from '@/middlewares/chain'
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server'
import { NextRequestWithAuth, withAuth } from 'next-auth/middleware'

export const authMiddleware =
  (middleware: CustomMiddleware) =>
    async (request: NextRequest, event: NextFetchEvent) => {
      if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
        return middleware(request, event, NextResponse.next())
      }

      const withAuthMiddleware = withAuth({
        pages: {
          signIn: '/fr',
          error: '/error',
        },
      })

      const customResponse = await withAuthMiddleware(
        request as NextRequestWithAuth,
        event,
      )
      return middleware(request, event, customResponse as NextResponse)
    }
