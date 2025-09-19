import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import FormSchemas from '@/lib/form-schemas'
import { ClubService } from '@/services/club.service'
import type { Club, User } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Image, Loader2, UserIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'

interface EditClubFormProps {
  onSuccess?: () => void
  onClose?: () => void
  club: Club
  availableUsers: User[]
}

function EditClubForm({ onSuccess, onClose, club, availableUsers }: EditClubFormProps) {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | null>(null)

  const form = useForm<z.infer<typeof FormSchemas.ClubSchema>>({
    resolver: zodResolver(FormSchemas.ClubSchema),
    defaultValues: {
      name: club.name || '',
      logo: club.logo || '',
      userId: club.userId || 'none',
      isActive: club.isActive ?? true,
    },
  })

  async function onSubmit(values: z.infer<typeof FormSchemas.ClubSchema>) {
    try {
      setVerificationStatus('loading')

      const updateData = {
        name: values.name,
        logo: values.logo || '',
        userId: values.userId === 'none' ? undefined : values.userId,
        isActive: values.isActive,
      }

      await ClubService.updateClub(club.id, updateData)
      setVerificationStatus('success')
      toast.success('Club updated successfully!')
      onSuccess?.()
    } catch (error) {
      console.error('Error updating club:', error)
      setVerificationStatus('error')
      toast.error(error instanceof Error ? error.message : 'Failed to update club')
    }
  }

  return (
    <Dialog open={!!club} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Club</DialogTitle>
          <DialogDescription>Make changes to the club here. Click save when you're done.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="select-none">Club Owner</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || 'none'}>
                    <FormControl>
                      <SelectTrigger className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500">
                        <div className="flex items-center gap-3">
                          <UserIcon className="size-4 text-gray-400" />
                          <SelectValue placeholder="Select club owner" />
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No owner assigned</SelectItem>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">{user.email}</div>
                        </SelectItem>
                      ))}
                      {/* Include the current owner if they have one */}
                      {club.user && !availableUsers.find((u) => u.id === club.user?.id) && (
                        <SelectItem value={club.user.id}>
                          <div className="flex items-center gap-2">{club.user.email} (Current Owner)</div>
                        </SelectItem>
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
                disabled={verificationStatus === 'loading'}
              >
                {verificationStatus === 'loading' ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Updating club...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4" />
                    Update Club
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

export default EditClubForm
