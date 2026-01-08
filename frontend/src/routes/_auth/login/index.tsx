import AuthService from '@/services/auth.service'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useUser } from '@/context/UserContext'
import { useEffect, useState } from 'react'
import LoginForm from './form'
import AuthLayout from '../auth-layout'
import type { z } from 'zod'
import type FormSchemas from '@/lib/form-schemas'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_auth/login/')({
  component: LoginPage,
})

function LoginPage() {
  const { t } = useTranslation('auth')
  const { isAuthenticated, loading, refreshUser } = useUser()
  const navigate = useNavigate()
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Redirect to home if already authenticated (Disabled while in development)
  // useEffect(() => {
  //   if (!loading && isAuthenticated) {
  //     navigate({ to: '/' })
  //   }
  // }, [isAuthenticated, loading, navigate])

  async function onSubmit(values: z.infer<typeof FormSchemas.loginSchema>) {
    setVerificationStatus('loading')
    setErrorMessage(null)

    try {
      await AuthService.login(values)
      setVerificationStatus('success')
      
      await new Promise(resolve => setTimeout(resolve, 100))

      await refreshUser()
      await navigate({ to: '/', replace: true })
    } catch (error: any) {
      console.error('[Login] Error occurred:', error)
      setErrorMessage(error instanceof Error ? error.message : t('login.error'))
      setVerificationStatus('error')
    }
  }

  if (loading) {
    return <div>{t('login.loading')}</div>
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <AuthLayout title={t('login.title')} description={t('login.description')}>
      <LoginForm
        onSubmit={onSubmit}
        verificationStatus={verificationStatus}
        setVerificationStatus={setVerificationStatus}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
      />
    </AuthLayout>
  )
}

export default LoginPage
