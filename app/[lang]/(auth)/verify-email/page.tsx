'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useApi } from '@/hooks/use-api'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useApiErrorHandler } from '@/hooks/use-api-error'
import { API_BASE_URL } from '@/lib/api-client'

export default function VerifyEmail() {
  const [isVerified, setIsVerified] = useState<boolean | null>(null)
  const router = useRouter()
  const { handleApiError } = useApiErrorHandler()
  const searchParams = useSearchParams()

  const { get, isLoading } = useApi()

  useEffect(() => {
    const verifyEmail = async () => {
      const url = searchParams.get('url')

      if (!url) {
        toast.error('Error', { description: 'Invalid verification link' })
        setIsVerified(false)
        return
      }

      try {
        // Decode the URL and remove the API_BASE_URL
        const decodedUrl = decodeURIComponent(url)
        const endpoint = decodedUrl.replace(API_BASE_URL, '')

        const response = await get(endpoint)
        if (response.success) {
          setIsVerified(true)
          toast.success('Success', { description: response.message })
        } else {
          throw new Error(response.message || 'Verification failed')
        }
      } catch (error) {
        setIsVerified(false)
        handleApiError(error)
      }
    }

    verifyEmail()
  }, [searchParams, get, handleApiError])

  const handleGoToLogin = () => {
    router.push('/login')
  }

  if (isLoading || isVerified === null) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2">Verifying your email...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <div className="flex flex-col items-center justify-center mb-4">
          {isVerified ? (
            <CheckCircle2 className="h-24 w-24 text-green-500" />
          ) : (
            <XCircle className="h-24 w-24 text-red-500" />
          )}
        </div>
        <CardTitle className="text-center text-2xl">
          {isVerified ? 'Email Verified' : 'Verification Failed'}
        </CardTitle>
        <CardDescription className="text-center mt-2">
          {isVerified
            ? 'Your email has been successfully verified.'
            : 'We couldn\'t verify your email. Please try again or contact support.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button onClick={handleGoToLogin} className="w-full max-w-xs">
          Go to Login
        </Button>
      </CardContent>
    </Card>
  )
}