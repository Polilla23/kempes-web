import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { EyeIcon, EyeOffIcon, Loader2, LockIcon, MailIcon } from 'lucide-react'
import FormSchemas from '@/lib/form-schemas'

// Define the type for the onSubmit function
type OnSubmitFn = (values: z.infer<typeof FormSchemas.loginSchema>) => Promise<void> | void

interface LoginFormProps {
  onSubmit: OnSubmitFn
  verificationStatus: 'loading' | 'success' | 'error' | null
  setVerificationStatus: (status: 'loading' | 'success' | 'error' | null) => void
  errorMessage: string | null
  setErrorMessage: (message: string | null) => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, verificationStatus, errorMessage }) => {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const form = useForm<z.infer<typeof FormSchemas.loginSchema>>({
    resolver: zodResolver(FormSchemas.loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {errorMessage && (
          <div className="p-4 text-sm text-destructive bg-red-50 border border-red-200 rounded-lg">
            {errorMessage}
          </div>
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="select-none">Email</FormLabel>
              <FormControl>
                <div className="relative select-none">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-10 select-none">
                    <MailIcon className="size-4 text-gray-400 select-none" />
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
              <div className="flex justify-between items-end">
                <FormLabel className="select-none">Password</FormLabel>
                <a
                  href="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 select-none"
                >
                  Forgot your password?
                </a>
              </div>
              <FormControl>
                <div className="relative select-none">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center select-none h-10">
                    <LockIcon className="size-4 text-gray-400 select-none" />
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
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 select-none text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? <EyeIcon className="size-4" /> : <EyeOffIcon className="size-4" />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className="w-full h-11 bg-cyan-600 hover:bg-cyan-700 select-none text-white font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
          type="submit"
          disabled={verificationStatus === 'loading'}
        >
          {verificationStatus === 'loading' ? (
            <div className="flex items-center gap-2 select-none">
              <Loader2 className="w-4 h-4 animate-spin select-none" />
              Signing in...
            </div>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>
    </Form>
  )
}

export default LoginForm
