import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { EyeIcon, EyeOffIcon, Loader2, LockIcon, MailIcon, XIcon } from 'lucide-react'
import { AuthService } from '@/services/auth.service'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/login')({
  component: LoginPage,
})

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(4, { message: 'Password must be at least 4 characters.' }),
})

function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setLoginError(null)

    try {
      const response = await AuthService.login(values)
      console.log('Login successful:', response)
      window.location.href = 'https://www.google.com'
    } catch (error: any) {
      console.error('Login failed:', error)
      setLoginError(error instanceof Error ? error.message : 'An error occurred while logging in.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 w-full h-full">
        <img
          src="/Football-Field-Fake-Grass.jpg"
          alt="football field background"
          className="w-full h-full object-cover blur-sm"
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>
      <Card className="relative z-10 bg-white/95 backdrop-blur-sm shadow-2xl flex flex-col justify-center px-8 w-full max-w-md">
        <CardHeader className="text-center pb-6">
          {/* Kempes Logo acá */}
          <CardTitle className="font-bold text-3xl text-gray-800">Kempes Master League</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome back!</h2>
            <p className="text-gray-600">Sign in to your account to continue.</p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {loginError && (
                <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center animate-in slide-in-from-top-2">
                  <span className="flex-1">{loginError}</span>
                  <Button
                    onClick={() => setLoginError(null)}
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
                    <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-10">
                          <MailIcon className="w-4 h-4 text-gray-400" />
                          <span className="mx-2 w-px h-6 bg-gray-300" />
                        </div>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          className="pl-12 h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                      <a
                        className="text-sm text-cyan-600 hover:text-cyan-700 hover:underline transition-colors"
                        href="/forgot-password"
                      >
                        Forgot password?
                      </a>
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
                          {passwordVisible ? (
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
                disabled={isLoading}
              >
                {isLoading ? (
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
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a
                href="/register"
                className="text-cyan-600 hover:text-cyan-700 hover:underline font-medium transition-colors"
              >
                Sign up
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
