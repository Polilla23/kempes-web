import { createFileRoute, useNavigate } from '@tanstack/react-router'
import AuthService from '@/services/auth.service'
import { useEffect, useState } from 'react'
import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import ResetPasswordForm from './form'
import type { NewPasswordFormData } from '@/types'
import AuthLayout from '../auth-layout'

export const Route = createFileRoute('/_auth/reset-password/index/$token')({
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const { token } = Route.useParams()
  const [tokenValidation, setTokenValidation] = useState<'validating' | 'valid' | 'invalid'>('validating')
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const navigate = useNavigate()

  // Token validation effect
  useEffect(() => {
    const validateToken = async () => {
      setTokenValidation('validating')
      try {
        await AuthService.verifyResetPasswordToken(token)
        setTokenValidation('valid')
      } catch (error) {
        setTokenValidation('invalid')
        console.error('Invalid token:', error)
      }
    }

    validateToken()
  }, [token])

  const handlePasswordReset = async (values: NewPasswordFormData) => {
    setVerificationStatus('loading')
    try {
      await AuthService.resetPassword(token, values)
      setVerificationStatus('success')
      toast.success('Password reset successfully! Redirecting to login...')

      setTimeout(() => {
        navigate({ to: '/login', search: { redirect: '/' } })
      }, 4000)
    } catch (error: any) {
      setVerificationStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while logging in.')
      toast.error('Something went wrong. Please try again later.')
      console.error(errorMessage)
    }
  }

  // Render different states based on tokenValidation and resetStatus
  if (tokenValidation === 'validating') {
    return (
      <AuthLayout title="Validating..." description="Please wait while we validate your reset link.">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Validating your reset link...</span>
          </div>
        </div>
      </AuthLayout>
    )
  }

  if (tokenValidation === 'invalid') {
    return (
      <AuthLayout
        title="Invalid Reset Link"
        description="This password reset link is invalid or has expired."
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="rounded-full bg-red-100 p-3">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              The password reset link you're trying to use is invalid or has expired.
            </p>
            <Button
              onClick={() => navigate({ to: '/forgot-password' })}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              Request New Reset Link
            </Button>
          </div>
        </div>
      </AuthLayout>
    )
  }

  if (verificationStatus === 'success') {
    return (
      <AuthLayout
        title="Password reset successfully!"
        description="You will be redirected to the login page in 5 seconds."
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </AuthLayout>
    )
  }

  if (verificationStatus === 'error') {
    return (
      <AuthLayout title="Oops! Something went wrong." description={errorMessage}>
        <div className="flex flex-col items-center space-y-4">
          <div className="rounded-full bg-red-100 p-3">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Select your new password" description="Please enter your new password.">
      <ResetPasswordForm
        onSubmit={handlePasswordReset}
        isLoading={verificationStatus === 'loading'}
        verificationStatus={verificationStatus}
        setVerificationStatus={setVerificationStatus}
      />
    </AuthLayout>
  )
}

export default ResetPasswordPage
