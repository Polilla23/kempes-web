import { AuthService } from '@/services/auth.service'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useUser } from '@/context/UserContext'
import { useNavigate } from '@tanstack/react-router'
import { formSchema } from './login-form'
import LoginForm from './login-form'
import type { z } from 'zod'
import { useState } from 'react'

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
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
    <div className="flex min-h-svh w-full lg:flex-row flex-col">
      <div className="flex flex-col gap-4 p-6 md:p-10 items-center w-full lg:w-3/10">
        <div className="flex flex-col items-center w-full mt-2 gap-6 self-start">
          <a href="#" className="flex justify-center items-center gap-2 font-semibold text-3xl select-none">
            <div className="flex size-20 items-center justify-center rounded-md overflow-hidden">
              <img src="/images/1200.png" alt="KML Logo" className="h-full w-full object-contain pr-4" />
            </div>
            Kempes Master League
          </a>
        </div>
        <div className="w-full h-3/5 flex items-center justify-center mt-4">
          <div className="w-4/5">
            <LoginForm
              onSubmit={onSubmit}
              verificationStatus={verificationStatus}
              setVerificationStatus={setVerificationStatus}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
            />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block lg:w-7/10">
        <video
          src="/Mario Kempes - Argentina 1978 - 6 goals.mp4"
          autoPlay
          loop
          muted
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.4] dark:grayscale"
        />
      </div>
    </div>
  )
}

export default LoginPage
