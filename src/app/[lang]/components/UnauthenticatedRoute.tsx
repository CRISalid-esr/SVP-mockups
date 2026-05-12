'use client'

import { useSession } from 'next-auth/react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import Loading from '@/components/Loading'

const DEFAULT_AUTHENTICATED_REDIRECT_PATH = '/dashboard'

const UnauthenticatedRoute = ({ children }: { children: React.ReactNode }) => {
  const { status } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const params = useParams()
  const lang = params?.lang || 'fr'

  useEffect(() => {
    if (status === 'authenticated') {
      const callbackUrl = searchParams.get('callbackUrl')
      router.push(callbackUrl || `/${lang}${DEFAULT_AUTHENTICATED_REDIRECT_PATH}`)
    }
  }, [status, router, searchParams, lang])

  if (status === 'loading') {
    return <Loading />
  }
  if (status === 'authenticated') {
    return <div>Redirecting...</div>
  }
  return <>{children}</>
}
UnauthenticatedRoute.displayName = 'UnauthenticatedRoute';

export default UnauthenticatedRoute
