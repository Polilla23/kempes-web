import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { useState } from 'react'
import AuthService from '@/services/auth.service'
import { CheckCircle, XCircle } from 'lucide-react'
import AuthLayout from '../auth-layout'
import ForgotPasswordForm from './form'
import FormSchemas from '@/lib/form-schemas'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_auth/forgot-password/')({
  component: ForgotPasswordPage,
})

function ForgotPasswordPage() {
  const { t } = useTranslation('auth')
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function onSubmit(values: z.infer<typeof FormSchemas.forgotPasswordSchema>) {
    try {
      setVerificationStatus('loading')
      await AuthService.requestPasswordReset(values)
      setVerificationStatus('success')
    } catch (error: any) {
      setVerificationStatus('error')
      setErrorMessage(error instanceof Error ? error.message : t('forgotPassword.errorDescription'))
      console.error(errorMessage)
    }
  }

  if (verificationStatus === 'success') {
    return (
      <AuthLayout title={t('forgotPassword.successTitle')} description={t('forgotPassword.successDescription')}>
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
      <AuthLayout title={t('forgotPassword.errorTitle')} description={t('forgotPassword.errorDescription')}>
        <div className="flex flex-col items-center space-y-4 pt-6">
          <div className="rounded-full bg-red-100 p-3">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title={t('forgotPassword.title')} description={t('forgotPassword.description')}>
      <ForgotPasswordForm
        onSubmit={onSubmit}
        verificationStatus={verificationStatus}
        setVerificationStatus={setVerificationStatus}
        setErrorMessage={setErrorMessage}
      />
    </AuthLayout>
  )
}
