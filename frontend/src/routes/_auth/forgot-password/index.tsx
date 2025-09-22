import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { useState } from 'react'
import AuthService from '@/services/auth.service'
import { CheckCircle, XCircle } from 'lucide-react'
import AuthLayout from '../auth-layout'
import ForgotPasswordForm from './form'
import FormSchemas from '@/routes/management/utils/form-schemas'

export const Route = createFileRoute('/_auth/forgot-password/')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function onSubmit(values: z.infer<typeof FormSchemas.forgotPasswordSchema>) {
    try {
      setVerificationStatus('loading')
      await AuthService.requestPasswordReset(values)
      setVerificationStatus('success')
    } catch (error: any) {
      setVerificationStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while logging in.')
      console.error(errorMessage)
    }
  }

  if (verificationStatus === 'success') {
    return (
      <AuthLayout title="Success!" description="Please check your email for further instructions.">
        <div className="flex flex-col items-center space-y-4 pt-6">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </AuthLayout>
    )
  }

  if (verificationStatus === 'error') {
    return (
      <AuthLayout title="Oops! Something went wrong" description="Please try again later.">
        <div className="flex flex-col items-center space-y-4 pt-6">
          <div className="rounded-full bg-red-100 p-3">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Forgot Password" description="Enter your email to reset your password.">
      <ForgotPasswordForm
        onSubmit={onSubmit}
        verificationStatus={verificationStatus}
        setVerificationStatus={setVerificationStatus}
        setErrorMessage={setErrorMessage}
      />
    </AuthLayout>
  )
}
