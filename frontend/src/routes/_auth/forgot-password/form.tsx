import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, MailIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import FormSchemas from '@/lib/form-schemas'

type OnSubmitFn = (values: z.infer<typeof FormSchemas.forgotPasswordSchema>) => Promise<void> | void

interface ForgotPasswordFormProps {
  onSubmit: OnSubmitFn
  verificationStatus: 'loading' | 'success' | 'error' | null
  setVerificationStatus: (status: 'loading' | 'success' | 'error' | null) => void
  setErrorMessage?: (message: string | null) => void
}

function ForgotPasswordForm({ onSubmit, verificationStatus }: ForgotPasswordFormProps) {
  const form = useForm<z.infer<typeof FormSchemas.forgotPasswordSchema>>({
    resolver: zodResolver(FormSchemas.forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-10">
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
        <Separator />
        <div className="flex justify-center items-center gap-1">
          <p className="text-sm text-muted-foreground">Already have an account? </p>
          <a className="text-sm font-semibold text-cyan-600 hover:text-cyan-700 hover:underline" href="login">
            Sign in
          </a>
        </div>
      </form>
    </Form>
  )
}

export default ForgotPasswordForm
