import { createFileRoute, useNavigate } from '@tanstack/react-router'
import AuthCard from '@/components/ui/authCard'
import { AuthService } from '@/services/auth.service'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle, EyeIcon, EyeOffIcon, Loader2, LockIcon, XCircle } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export const Route = createFileRoute('/user/reset-password/$token')({
  component: ResetPasswordPage,
})
const formSchema = z
  .object({
    password: z.string().min(4, { message: 'Password is required.' }),
    revalidatPassword: z.string().min(4, { message: 'Password confirmation is required.' }),
  })
  .refine((data) => data.password === data.revalidatPassword, {
    message: 'Passwords must be the same.',
    path: ['revalidatPassword'],
  })

function ResetPasswordPage() {
  const { token } = Route.useParams()
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | null>(null)
  const [tokenValidation, setTokenValidation] = useState<'validating' | 'valid' | 'invalid' | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [revalidatPasswordVisible, setRevalidatPasswordVisible] = useState(false)
  const navigate = useNavigate()

  // Validar el token al cargar el componente
  useEffect(() => {
    const validateToken = async () => {
      setTokenValidation('validating')
      try {
        // Asumiendo que tienes un método para validar tokens en AuthService
        await AuthService.verifyResetPasswordToken(token)
        setTokenValidation('valid')
      } catch (error) {
        setTokenValidation('invalid')
        console.error('Invalid token:', error)
      }
    }

    validateToken()
  }, [token])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      revalidatPassword: '',
    },
    mode: 'onChange',
  })

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const subscription = form.watch((value, { name }) => {
      if (name === 'password' || name === 'revalidatPassword') {
        // Limpiar el timeout anterior si existe
        clearTimeout(timeoutId)

        // Crear un nuevo timeout con debounce de 500ms
        timeoutId = setTimeout(() => {
          form.trigger(['password', 'revalidatPassword'])
        }, 800)
      }
    })

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeoutId) // Limpiar el timeout al desmontar
    }
  }, [form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setVerificationStatus('loading')
      console.log(token, values)
      await AuthService.resetPassword(token, values)
      setVerificationStatus('success')
      setTimeout(() => {
        navigate({ to: '/user/login' })
      }, 5000)
    } catch (error: any) {
      setVerificationStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while logging in.')
      console.error(errorMessage)
    }
  }

  // Mostrar loading mientras valida el token
  if (tokenValidation === 'validating') {
    return (
      <AuthCard title="Validating..." description="Please wait while we validate your reset link.">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Validating your reset link...</span>
          </div>
        </div>
      </AuthCard>
    )
  }

  // Mostrar error si el token es inválido
  if (tokenValidation === 'invalid') {
    return (
      <AuthCard title="Invalid Reset Link" description="This password reset link is invalid or has expired.">
        <div className="flex flex-col items-center space-y-4">
          <div className="rounded-full bg-red-100 p-3">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              The password reset link you're trying to use is invalid or has expired.
            </p>
            <Button
              onClick={() => navigate({ to: '/user/forgot-password' })}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              Request New Reset Link
            </Button>
          </div>
        </div>
      </AuthCard>
    )
  }

  // Solo mostrar el formulario si el token es válido
  if (tokenValidation !== 'valid') {
    return null // O un loading spinner
  }

  if (verificationStatus === 'success') {
    return (
      <AuthCard
        title="Password reset successfully!"
        description="You will be redirected to the login page in 5 seconds."
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </AuthCard>
    )
  }

  if (verificationStatus === 'error') {
    return (
      <AuthCard title="Oops! Something went wrong." description={errorMessage}>
        <div className="flex flex-col items-center space-y-4">
          <div className="rounded-full bg-red-100 p-3">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Select your new password" description="Please enter your new password.">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel className="text-gray-700 font-medium">{''}</FormLabel>
                </div>
                <FormControl>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-10">
                      <LockIcon className="w-4 h-4 text-gray-400" />
                      <span className="mx-2 w-px h-6 bg-gray-300" />
                    </div>
                    <Input
                      type={passwordVisible ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="pl-12 h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                      {...field}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                    >
                      {passwordVisible ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="revalidatPassword"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel className="text-gray-700 font-medium">{''}</FormLabel>
                </div>
                <FormControl>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-10">
                      <LockIcon className="w-4 h-4 text-gray-400" />
                      <span className="mx-2 w-px h-6 bg-gray-300" />
                    </div>
                    <Input
                      type={revalidatPasswordVisible ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      className="pl-12 h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                      {...field}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      onClick={() => setRevalidatPasswordVisible(!revalidatPasswordVisible)}
                    >
                      {revalidatPasswordVisible ? (
                        <EyeIcon className="w-4 h-4" />
                      ) : (
                        <EyeOffIcon className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
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
                Please wait...
              </div>
            ) : (
              'Continue'
            )}
          </Button>
        </form>
      </Form>
    </AuthCard>
  )
}
