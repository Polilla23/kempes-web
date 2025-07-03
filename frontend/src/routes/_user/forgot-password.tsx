import { createFileRoute } from '@tanstack/react-router'
import AuthCard from '@/components/ui/authCard'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import AuthService from '@/services/auth.service'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Loader2, MailIcon, CheckCircle, XCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_user/forgot-password')({
  component: ForgotPasswordPage,
})

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
}) // TODO: create a script with all schemas forms

function ForgotPasswordPage() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setVerificationStatus('loading')
      await AuthService.requestPasswordReset(values)
      setVerificationStatus('success')
    } catch (error: any) {
      setVerificationStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while logging in.')
      console.error(errorMessage)
    }
  }

  if (verificationStatus === 'success') {
    return (
      <AuthCard
        title="Reset Email Sent!"
        description="We've sent you an email with instructions to reset your password."
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
    <AuthCard title="Forgot Password" description="Enter your email to reset your password.">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">Already have an account? </p>
            <a
              className="text-sm font-semibold text-cyan-600 hover:text-cyan-700 hover:underline"
              href="/user/login"
            >
              Sign in
            </a>
          </div>
        </form>
      </Form>
    </AuthCard>
  )
}
