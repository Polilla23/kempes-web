import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import FormSchemas from '@/routes/management/utils/form-schemas'
import { EyeIcon, EyeOffIcon, Loader2, LockIcon } from 'lucide-react'
import { Form, useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import type { NewPasswordFormData } from '@/types'

interface NewPasswordFormProps {
  onSubmit: (values: NewPasswordFormData) => Promise<void>
  isLoading: boolean
  verificationStatus: 'loading' | 'success' | 'error' | null
  setVerificationStatus: (status: 'loading' | 'success' | 'error' | null) => void
}

function ResetPasswordForm({ onSubmit, isLoading, verificationStatus }: NewPasswordFormProps) {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)

  const form = useForm({
    resolver: zodResolver(FormSchemas.resetPasswordSchema),
    defaultValues: { password: '', revalidatPassword: '' },
  })

  // Form-specific effects (debounced validation)
  useEffect(() => {
    const subscription = form.watch((_, { name }) => {
      if (name === 'password' || name === 'revalidatPassword') {
        const timeoutId = setTimeout(() => {
          form.trigger(['password', 'revalidatPassword'])
        }, 800)
        return () => clearTimeout(timeoutId)
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Password fields with visibility toggles */}
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
                    type={confirmPasswordVisible ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    className="pl-12 h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                    {...field}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                  >
                    {confirmPasswordVisible ? (
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
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 /> : 'Reset Password'}
        </Button>
      </form>
    </Form>
  )
}

export default ResetPasswordForm
