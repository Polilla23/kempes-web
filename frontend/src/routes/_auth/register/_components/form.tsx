import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EyeIcon, EyeOffIcon, Loader2, LockIcon, MailIcon, ShieldIcon, UserIcon } from 'lucide-react'
import FormSchemas from '@/lib/form-schemas'
import { useTranslation } from 'react-i18next'

type OnSubmitFn = (values: z.infer<typeof FormSchemas.publicRegisterSchema>) => Promise<void> | void

interface RegisterFormProps {
  onSubmit: OnSubmitFn
  verificationStatus: 'loading' | 'success' | 'error' | null
  errorMessage: string | null
  clubs: { id: string; name: string; logo: string | null }[]
  isLoadingClubs: boolean
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  verificationStatus,
  errorMessage,
  clubs,
  isLoadingClubs,
}) => {
  const { t } = useTranslation('auth')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
  const form = useForm<z.infer<typeof FormSchemas.publicRegisterSchema>>({
    resolver: zodResolver(FormSchemas.publicRegisterSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      clubId: '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
              <FormLabel className="select-none">{t('register.email')}</FormLabel>
              <FormControl>
                <div className="relative select-none">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-10 select-none">
                    <MailIcon className="size-4 text-gray-400 select-none" />
                  </div>
                  <Input
                    type="email"
                    placeholder={t('register.emailPlaceholder')}
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
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="select-none">{t('register.username')}</FormLabel>
              <FormControl>
                <div className="relative select-none">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-10 select-none">
                    <UserIcon className="size-4 text-gray-400 select-none" />
                  </div>
                  <Input
                    type="text"
                    placeholder={t('register.usernamePlaceholder')}
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
              <FormLabel className="select-none">{t('register.password')}</FormLabel>
              <FormControl>
                <div className="relative select-none">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center select-none h-10">
                    <LockIcon className="size-4 text-gray-400 select-none" />
                  </div>
                  <Input
                    type={passwordVisible ? 'text' : 'password'}
                    placeholder={t('register.passwordPlaceholder')}
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
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="select-none">{t('register.confirmPassword')}</FormLabel>
              <FormControl>
                <div className="relative select-none">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center select-none h-10">
                    <LockIcon className="size-4 text-gray-400 select-none" />
                  </div>
                  <Input
                    type={confirmPasswordVisible ? 'text' : 'password'}
                    placeholder={t('register.confirmPasswordPlaceholder')}
                    className="pl-12 h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                    {...field}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 select-none text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                  >
                    {confirmPasswordVisible ? <EyeIcon className="size-4" /> : <EyeOffIcon className="size-4" />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="clubId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="select-none">{t('register.club')}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingClubs}>
                <FormControl>
                  <SelectTrigger className="h-11 w-full border-gray-300 focus:border-cyan-500 focus:ring-cyan-500">
                    <div className="flex items-center gap-2">
                      <ShieldIcon className="size-4 text-gray-400 select-none" />
                      <SelectValue
                        placeholder={
                          isLoadingClubs ? t('register.clubLoading') : t('register.clubPlaceholder')
                        }
                      />
                    </div>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clubs.length === 0 && !isLoadingClubs ? (
                    <SelectItem value="__empty" disabled>
                      {t('register.clubNoAvailable')}
                    </SelectItem>
                  ) : (
                    clubs.map((club) => (
                      <SelectItem key={club.id} value={club.id}>
                        {club.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
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
              {t('register.registering')}
            </div>
          ) : (
            t('register.button')
          )}
        </Button>
        <div className="text-center text-sm mt-4">
          <span className="text-muted-foreground select-none">{t('register.hasAccount')} </span>
          <a
            href="/login"
            className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors duration-200 select-none"
          >
            {t('register.backToLogin')}
          </a>
        </div>
      </form>
    </Form>
  )
}

export default RegisterForm
