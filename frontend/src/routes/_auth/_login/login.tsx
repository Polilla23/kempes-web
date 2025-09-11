import AuthService from '@/services/auth.service'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useUser } from '@/context/UserContext'
import { useNavigate } from '@tanstack/react-router'
import LoginForm from './form'
import type { z } from 'zod'
import { useState } from 'react'
import AuthLayout from '../auth-layout'
import type FormSchemas from '@/lib/form-schemas'

export const Route = createFileRoute('/_auth/_login/login')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: search.redirect as string | undefined,
    }
  },
  beforeLoad: async ({ location }) => {
    try {
      await AuthService.getProfile()
      // If we get here, user is authenticated, redirect to home or intended destination
      const searchParams = new URLSearchParams(location.search)
      const redirectTo = searchParams.get('redirect') || '/'
      throw redirect({ to: redirectTo as any })
    } catch (error) {
      if (error instanceof Error && error.message.includes('redirect')) {
        throw error
      }
      return
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { refreshUser } = useUser()
  const search = Route.useSearch()
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function onSubmit(values: z.infer<typeof FormSchemas.loginSchema>) {
    setVerificationStatus('loading')
    setErrorMessage(null)

    try {
      await AuthService.login(values)

      const redirectTo = search.redirect || '/'
      await navigate({ to: redirectTo as any, replace: true })

      refreshUser().catch(console.error)
    } catch (error: any) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while logging in.')
      setVerificationStatus('error')
    }
  }

  return (
    <AuthLayout title="Login to your account" description="Enter your email below to login to your account">
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
