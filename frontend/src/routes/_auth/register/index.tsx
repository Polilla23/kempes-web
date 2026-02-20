import AuthService from '@/services/auth.service'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useUser } from '@/context/UserContext'
import { useState, useEffect } from 'react'
import RegisterForm from './_components/form'
import AuthLayout from '../auth-layout'
import type { z } from 'zod'
import type FormSchemas from '@/lib/form-schemas'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_auth/register/')({
  component: RegisterPage,
})

function RegisterPage() {
  const { t } = useTranslation('auth')
  const { isAuthenticated, loading } = useUser()
  const navigate = useNavigate()
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [clubs, setClubs] = useState<{ id: string; name: string; logo: string | null }[]>([])
  const [isLoadingClubs, setIsLoadingClubs] = useState(true)

  useEffect(() => {
    async function fetchClubs() {
      try {
        setIsLoadingClubs(true)
        const availableClubs = await AuthService.getAvailableClubs()
        setClubs(availableClubs)
      } catch (error) {
        console.error('Error fetching clubs:', error)
      } finally {
        setIsLoadingClubs(false)
      }
    }
    fetchClubs()
  }, [])

  async function onSubmit(values: z.infer<typeof FormSchemas.publicRegisterSchema>) {
    setVerificationStatus('loading')
    setErrorMessage(null)

    try {
      await AuthService.register({
        email: values.email,
        password: values.password,
        username: values.username,
        clubId: values.clubId,
      })
      setVerificationStatus('success')
      await navigate({ to: '/login' })
    } catch (error: any) {
      console.error('[Register] Error occurred:', error)
      setErrorMessage(error instanceof Error ? error.message : t('register.error'))
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
    <AuthLayout title={t('register.title')} description={t('register.description')}>
      <RegisterForm
        onSubmit={onSubmit}
        verificationStatus={verificationStatus}
        errorMessage={errorMessage}
        clubs={clubs}
        isLoadingClubs={isLoadingClubs}
      />
    </AuthLayout>
  )
}

export default RegisterPage
