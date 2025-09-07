import type { RegisterClubFormData, User } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
import { toast } from 'sonner'
import { ClubService } from '@/services/club.service'
import { UserService } from '@/services/user.service'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-react'
import { Plus } from 'lucide-react'
import { ClubFormSkeleton } from '@/components/ui/form-skeletons'

const formSchema = z.object({
  name: z.string().min(2, { message: 'Club name must be at least 2 characters.' }),
  logo: z.string().optional(),
  userId: z.string().optional(),
  isActive: z.boolean(),
})

const CreateClubForm = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [isLoadingDialog, setIsLoadingDialog] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      logo: '',
      userId: '',
      isActive: true,
    },
  })

  // Fetch users without clubs
  const fetchAvailableUsers = async () => {
    try {
      setIsLoadingUsers(true)
      const response = await UserService.getUsers()
      const usersWithoutClubs = response.users.filter((user: User) => !user.club)
      setAvailableUsers(usersWithoutClubs)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    } finally {
      setIsLoadingUsers(false)
    }
  }

    // Handle dialog open/close
    const handleDialogOpenChange = async (open: boolean) => {
      setIsOpen(open)
      if (open) {
        setIsLoadingDialog(true) // Show skeleton immediately
        await fetchAvailableUsers() // Load data
        setIsLoadingDialog(false) // Hide skeleton
      }
    }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    
    try {
      const clubData: RegisterClubFormData = {
        name: values.name,
        logo: values.logo || '',
        userId: values.userId === 'none' ? undefined : values.userId,
        isActive: values.isActive,
      }

      await ClubService.createClub(clubData)
      toast.success('Club created successfully')
      form.reset()
      setIsOpen(false)
      fetchClubs() // Refresh the list
    } catch (error: any) {
      console.error('Error creating club:', error)
      toast.error(error instanceof Error ? error.message : 'An error occurred while creating the club.')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-auto">
          Create Club<Plus className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Club</DialogTitle>
          <DialogDescription>Fill in the details to create a new club.</DialogDescription>
        </DialogHeader>

        {isLoadingDialog ? (
          <ClubFormSkeleton />
        ) : (
          // Actual form content
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Club Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter club name"
                        className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Club Logo URL</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter club logo URL"
                        className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Club Owner</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'none'}>
                      <FormControl>
                        <SelectTrigger className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500">
                          <SelectValue placeholder="Select club owner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingUsers ? (
                          <SelectItem value="loading" disabled>
                            Loading available users...
                          </SelectItem>
                        ) : (
                          <>
                            <SelectItem value="none">None</SelectItem>
                            {availableUsers.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.email}
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

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-gray-700 font-medium">Club is active</FormLabel>
                      <p className="text-sm text-gray-500">
                        Enable this club to participate in competitions and transfers
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-700"
                  disabled={isLoadingUsers || form.formState.isSubmitting}
                >
                  {isLoadingUsers ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    'Create Club'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CreateClubForm