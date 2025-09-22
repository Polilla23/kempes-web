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
import FormSchemas from '@/routes/management/utils/form-schemas'
import UserService from '@/services/user.service'
import { Loader2, MailIcon, UserPlus } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface EditUserFormProps {
  user: User
  onSuccess?: () => void
  onClose?: () => void
}

function EditUserForm({ user, onSuccess, onClose }: EditUserFormProps) {
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
      console.log('Transformed values:', transformedValues)
      await UserService.updateUser(user.id, transformedValues)

      toast.success('User updated successfully!')
      onSuccess?.()
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('The operation has failed.')
    } finally {
      onClose?.()
    }
  }

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit User</DialogTitle>
          <DialogDescription>Make changes to the user here. Click save when you're done.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500">
                        <SelectValue placeholder="Select user role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
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
                    Updating user...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="size-4" />
                    Update User
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
