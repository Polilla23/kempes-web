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
  DialogClose,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ClubService } from '@/services/club.service'
import UserService from '@/services/user.service'
import { toast } from 'sonner'
import { Loader2, Plus, Building2, Image, UserIcon } from 'lucide-react'
import FormSchemas from '@/lib/form-schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import type { RegisterClubFormData, User } from '@/types'

interface CreateClubFormProps {
  onSuccess?: () => void
}

const CreateClubForm = ({ onSuccess }: CreateClubFormProps) => {
  const [open, setOpen] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | null>(null)

  const form = useForm<z.infer<typeof FormSchemas.ClubSchema>>({
    resolver: zodResolver(FormSchemas.ClubSchema),
    defaultValues: {
      name: '',
      logo: '',
      userId: '',
      isActive: true,
    },
  })

  // Fetch available users when dialog opens
  useEffect(() => {
    if (open) {
      fetchUsers()
    }
  }, [open])

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true) // Set loading to true
      const users = await UserService.getUsers()
      const availableUsersFiltered =
        users?.filter((user: User) => {
          // Check if club is null, undefined, or an empty object
          return (
            !user.club ||
            user.club === null ||
            user.club === undefined ||
            (typeof user.club === 'object' && Object.keys(user.club).length === 0)
          )
        }) || []
      setAvailableUsers(availableUsersFiltered)
      console.log('Available users for clubs:', availableUsersFiltered)
    } catch (error) {
      console.error('Error fetching users:', error)
      setAvailableUsers([])
      toast.error('Failed to fetch users')
    } finally {
      setIsLoadingUsers(false) // Set loading to false
    }
  }

  async function onSubmit(values: z.infer<typeof FormSchemas.ClubSchema>) {
    try {
      setVerificationStatus('loading')

      const clubData: RegisterClubFormData = {
        name: values.name,
        logo: values.logo || '',
        userId: values.userId === 'none' || values.userId === '' ? undefined : values.userId,
        isActive: values.isActive,
      }

      await ClubService.createClub(clubData)
      toast.success('Club created successfully!')

      // Reset form and close dialog
      form.reset()
      setOpen(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error creating club:', error)
      toast.error(error instanceof Error ? error.message : 'An error occurred while creating the club.')
      setVerificationStatus('error')
    }
  }

  const handleDialogChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset form and states when closing
      form.reset()
      setVerificationStatus(null)
      setAvailableUsers([])
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-auto">
          <Plus className="size-4" />
          New Club
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create New Club</DialogTitle>
          <DialogDescription>Add a new club to the system</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Club Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="select-none">Club Name</FormLabel>
                  <FormControl>
                    <div className="relative select-none">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-10 select-none">
                        <Building2 className="size-4 text-gray-400 select-none" />
                      </div>
                      <Input
                        type="text"
                        placeholder="Enter club name"
                        className="pl-12 h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Logo URL Field */}
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="select-none">Logo URL</FormLabel>
                  <FormControl>
                    <div className="relative select-none">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-10 select-none">
                        <Image className="size-4 text-gray-400 select-none" />
                      </div>
                      <Input
                        type="url"
                        placeholder="Enter logo URL (optional)"
                        className="pl-12 h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Club Owner Field */}
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="select-none">Club Owner</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || 'none'}
                    disabled={isLoadingUsers}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500">
                        <div className="flex items-center gap-3">
                          <UserIcon className="size-4 text-gray-400" />
                          <SelectValue placeholder="Select club owner" />
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingUsers ? (
                        <SelectItem value="loading" disabled>
                          <div className="flex items-center gap-2">
                            <Loader2 className="size-4 animate-spin" />
                            Loading users...
                          </div>
                        </SelectItem>
                      ) : (
                        <>
                          <SelectItem value="none">No owner assigned</SelectItem>
                          {availableUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              <div className="flex items-center gap-2">{user.email}</div>
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Active Status Field */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="select-none text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Active Club
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Allow this club to participate in competitions and transfers
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={verificationStatus === 'loading'}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
                disabled={verificationStatus === 'loading' || isLoadingUsers}
              >
                {verificationStatus === 'loading' ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Creating club...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4" />
                    Create Club
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

export default CreateClubForm
