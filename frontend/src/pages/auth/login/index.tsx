import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { EyeIcon, EyeOffIcon, Loader2, LockIcon, MailIcon, XIcon } from 'lucide-react'
import { AuthService } from '@/services/auth.service'

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(4, { message: 'Password must be at least 8 characters' }),
})

const LoginPage = () => {
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
      if (error.message === 'Invalid email or password.') {
        setLoginError(error.message)
        console.log(loginError)
      } else {
        setLoginError(error.message || 'Error during login.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/3 bg-white flex flex-col justify-center px-8">
        <div className="mb-8">
          {/* Kempes Logo acá */}
          <h1 className="font-bold text-4xl mb-8">Kempes Master League</h1>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md mx-auto">
          <h2 className="text-2xl font-bold mb-2">Welcome!</h2>
          <p className="text-muted-foreground mb-8">Sign in to your account to continue.</p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {loginError && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md flex justify-between items-center">
                  {loginError}
                  <Button
                    onClick={() => setLoginError(null)}
                    variant="ghost"
                    size="icon"
                    className="hover:cursor-pointer hover:bg-transparent"
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-10">
                          <MailIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="mx-2 w-px h-6 bg-muted-foreground/40" />
                        </div>
                        <Input type="email" placeholder="Enter your email" className="pl-12" {...field} />
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
                      <FormLabel>Password</FormLabel>
                      <a
                        className="text-sm text-primary/75 hover:underline hover:text-cyan-600"
                        href="/forgot-password"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-10">
                          <LockIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="mx-2 w-px h-6 bg-muted-foreground/40" />
                        </div>
                        <Input
                          type={passwordVisible ? 'text' : 'password'}
                          placeholder="Enter your password"
                          className="pl-12"
                          {...field}
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="absolute text-muted-foreground right-0 top-0 h-full px-3 py-2 hover:bg-transparent hover:cursor-pointer"
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
              <div className="flex flex-col gap-2">
                <Button
                  className="bg-cyan-600 w-full hover:cursor-pointer hover:bg-cyan-700"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Login'}
                </Button>
              </div>
            </form>
          </Form>
          <p className="mt-2 text-sm text-center text-primary/75">
            Don't have an account?{' '}
            <a
              href="/register"
              className="text-primary/75 hover:cursor-pointer hover:text-cyan-600 hover:underline"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>

      <div className="w-2/3 relative h-full">
        <img
          src="/Football-Field-Fake-Grass.jpg"
          alt="football field background"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  )
}

export default LoginPage
