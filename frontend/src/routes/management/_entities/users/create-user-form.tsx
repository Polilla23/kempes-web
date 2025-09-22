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
  DialogTrigger,
} from '@/components/ui/dialog'
import AuthService from '@/services/auth.service'
import { toast } from 'sonner'
import { EyeIcon, EyeOffIcon, Loader2, LockIcon, MailIcon, Plus, UserPlus } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import FormSchemas from '@/routes/management/utils/form-schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'

interface CreateUserFormProps {
  onSuccess?: () => void
}

const CreateUserForm = ({ onSuccess }: CreateUserFormProps) => {
  const [open, setOpen] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | null>(null)

  const form = useForm<z.infer<typeof FormSchemas.createUserSchema>>({
    resolver: zodResolver(FormSchemas.createUserSchema),
    defaultValues: {
      email: '',
      role: 'USER',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof FormSchemas.createUserSchema>) {
    try {
      setVerificationStatus('loading')
      await AuthService.register({ ...values, password: 'defaultPassword' })
      toast.success('User created successfully!')
      onSuccess?.()
      setOpen(false)
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error('The operation has failed.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-auto">
          <Plus className="size-4" /> New User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create New User</DialogTitle>
          <DialogDescription>Add a new user</DialogDescription>
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="select-none">Password</FormLabel>
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
                    Creating user...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="size-4" />
                    Create User
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

export default CreateUserForm
