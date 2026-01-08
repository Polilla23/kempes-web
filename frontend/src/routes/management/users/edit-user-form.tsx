import { useState } from 'react'
import type { UserRole } from '@/types'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { User } from '@/types'
import { toast } from 'sonner'
import FormSchemas from '@/lib/form-schemas'
import UserService from '@/services/user.service'
import { Loader2, MailIcon, UserPlus } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslation } from 'react-i18next'

interface EditUserFormProps {
  user: User
  onSuccess?: () => void
  onClose?: () => void
}

function EditUserForm({ user, onSuccess, onClose }: EditUserFormProps) {
  const { t } = useTranslation('users')
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | null>(null)

  const form = useForm<z.infer<typeof FormSchemas.editUserSchema>>({
    resolver: zodResolver(FormSchemas.editUserSchema),
    defaultValues: {
      email: user.email,
      role: user.role,
    },
  })

  async function onSubmit(values: z.infer<typeof FormSchemas.editUserSchema>) {
    try {
      setVerificationStatus('loading')
      const transformedValues = { ...values, role: values.role as UserRole }
      await UserService.updateUser(user.id, transformedValues)

      toast.success(t('edit.success'))
      onSuccess?.()
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error(t('edit.error'))
    } finally {
      onClose?.()
    }
  }

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t('edit.title')}</DialogTitle>
          <DialogDescription>{t('edit.description')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="select-none">{t('fields.email')}</FormLabel>
                  <FormControl>
                    <div className="relative select-none">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-10 select-none">
                        <MailIcon className="size-4 text-gray-400 select-none" />
                      </div>
                      <Input
                        type="email"
                        placeholder={t('placeholders.email')}
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
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fields.role')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500">
                        <SelectValue placeholder={t('placeholders.selectRole')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USER">{t('roles.USER')}</SelectItem>
                      <SelectItem value="ADMIN">{t('roles.ADMIN')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                className="w-full h-11 bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
                type="submit"
                disabled={verificationStatus === 'loading'}
              >
                {verificationStatus === 'loading' ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    {t('buttons.update')}...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="size-4" />
                    {t('buttons.update')}
                  </div>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default EditUserForm
