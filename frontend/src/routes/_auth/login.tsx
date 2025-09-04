import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { EyeIcon, EyeOffIcon, Loader2, LockIcon, MailIcon, XIcon } from 'lucide-react'
import { AuthService } from '@/services/auth.service'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import AuthCard from '@/components/ui/authCard'
import { useUser } from '@/context/UserContext'

export const Route = createFileRoute('/_auth/login')({
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

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(4, { message: 'Password must be at least 4 characters.' }),
})

function LoginPage() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const navigate = useNavigate()
  const { refreshUser } = useUser()
  const search = Route.useSearch()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setVerificationStatus('loading')

    try {
      await AuthService.login(values)

      const redirectTo = search.redirect || '/'
      await navigate({ to: redirectTo as any, replace: true })

      refreshUser().catch(console.error)
    } catch (error: any) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while logging in.')
      setVerificationStatus('error')
    } finally {
      setVerificationStatus('success')
    }
  }

  return (
    <AuthCard title="Welcome back!" description="Sign in to your account to continue.">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {errorMessage && (
            <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center animate-in slide-in-from-top-2">
              <span className="flex-1">{errorMessage}</span>
              <Button
                onClick={() => setErrorMessage(null)}
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-red-100"
              >
                <XIcon className="w-4 h-4" />
              </Button>
            </div>
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-200 font-medium">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-10">
                      <MailIcon className="size-4" />
                    </div>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className="pl-9 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-cyan-500 dark:focus:ring-cyan-400 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-600 dark:text-red-400" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel className="text-gray-700 dark:text-gray-200 font-medium">Password</FormLabel>
                  <a
                    className="text-sm text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 hover:underline transition-colors"
                    href="/user/forgot-password"
                  >
                    Forgot password?
                  </a>
                </div>
                <FormControl>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-10">
                      <LockIcon className="size-4" />
                    </div>
                    <Input
                      type={passwordVisible ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="pl-9 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:border-cyan-500 dark:focus:border-cyan-400 focus:ring-cyan-500 dark:focus:ring-cyan-400 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      {...field}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                    >
                      {passwordVisible ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-600 dark:text-red-400" />
              </FormItem>
            )}
          />
          <Button
            className="w-full h-11 bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
            type="submit"
            disabled={verificationStatus === 'loading'}
          >
            {verificationStatus === 'loading' ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </div>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>
      </Form>
      <div className="text-center pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">Guli @ Todos los derechos reservados</p>
      </div>
    </AuthCard>
  )
}

export default LoginPage
