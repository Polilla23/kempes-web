import { Card, CardContent } from '@/components/ui/card'
import { AuthService } from '@/services/auth.service'
import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/_auth/verify-email/$token')({
  component: RouteComponent,
})

function RouteComponent() {
  const { token } = Route.useParams()
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await AuthService.verifyEmail(token)
        setTimeout(() => {
          setVerificationStatus('success')
        }, 4000)
      } catch (error) {
        setVerificationStatus('error')
        setErrorMessage(error instanceof Error ? error.message : 'An error occurred during verification.')
      }
    }

    verifyEmail()
  }, [token])

  if (verificationStatus === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Verifying your email...</span>
        </div>
      </div>
    )
  }

  const getStatusConfig = () => {
    if (verificationStatus === 'success') {
      return {
        icon: CheckCircle,
        iconClass: 'h-8 w-8 text-green-600',
        bgClass: 'bg-green-100',
        title: 'Email Verified Successfully!',
        message: 'Your email has been verified correctly.',
      }
    }

    if (verificationStatus === 'error') {
      return {
        icon: XCircle,
        iconClass: 'h-8 w-8 text-red-600',
        bgClass: 'bg-red-100',
        title: 'Verification Failed',
        message: errorMessage,
      }
    }

    return null
  }

  const statusConfig = getStatusConfig()

  if (statusConfig) {
    const IconComponent = statusConfig.icon

    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 pt-6">
            <div className={`rounded-full ${statusConfig.bgClass} p-3`}>
              <IconComponent className={statusConfig.iconClass} />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">{statusConfig.title}</h2>
              <p className="text-gray-600 mt-2">{statusConfig.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}
