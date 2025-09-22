import { Checkbox } from '@/components/ui/checkbox'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { User } from '@/types'

import { Building2, Image, Loader2 } from 'lucide-react'

interface ClubFormFieldsProps {
  form: any
  availableUsers: User[]
  isLoadingUsers: boolean
}

function ClubFormFields({ form, availableUsers, isLoadingUsers }: ClubFormFieldsProps) {
  return (
    <>
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

      {/* Club Owner Field */}
      <FormField
        control={form.control}
        name="userId"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="select-none">Club Owner</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || 'none'} disabled={isLoadingUsers}>
              <FormControl>
                <SelectTrigger className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500">
                  <div className="flex items-center gap-3">
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
    </>
  )
}

export default ClubFormFields
