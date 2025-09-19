import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import FormSchemas from '@/lib/form-schemas'
import { cn } from '@/lib/utils'
import { PlayerService } from '@/services/player.service'
import type { Player, Club } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Building2, CalendarIcon, Loader2, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'

interface EditPlayerFormProps {
  player: Player
  clubs: Club[]
  onSuccess?: () => void
  onClose?: () => void
}

function EditPlayerForm({ player, clubs, onSuccess, onClose }: EditPlayerFormProps) {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | null>(null)

  const form = useForm<z.infer<typeof FormSchemas.PlayerSchema>>({
    resolver: zodResolver(FormSchemas.PlayerSchema),
    defaultValues: {
      name: player.name || '',
      lastName: player.lastName || '',
      birthdate: player.birthdate ? new Date(player.birthdate) : new Date(),
      ownerClubId: player.ownerClubId || '',
      actualClubId: player.actualClubId || '',
      overall: player.overall || 0,
      salary: player.salary || 100000,
      sofifaId: player.sofifaId || '',
      transfermarktId: player.transfermarktId || '',
      isKempesita: player.isKempesita || false,
      isActive: player.isActive ?? true,
    },
  })

  // Reset form when player changes
  useEffect(() => {
    if (player) {
      form.reset({
        name: player.name || '',
        lastName: player.lastName || '',
        birthdate: player.birthdate ? new Date(player.birthdate) : new Date(),
        ownerClubId: player.ownerClubId || '',
        actualClubId: player.actualClubId || '',
        overall: player.overall || 0,
        salary: player.salary || 100000,
        sofifaId: player.sofifaId || '',
        transfermarktId: player.transfermarktId || '',
        isKempesita: player.isKempesita || false,
        isActive: player.isActive ?? true,
      })
    }
  }, [player, form])

  async function onSubmit(values: z.infer<typeof FormSchemas.PlayerSchema>) {
    try {
      setVerificationStatus('loading')

      const updateData = {
        name: values.name || '',
        lastName: values.lastName || '',
        birthdate: format(values.birthdate, 'dd/MM/yyyy'),
        ownerClubId: values.ownerClubId,
        actualClubId:
          values.actualClubId === 'none' || values.actualClubId === '' ? undefined : values.actualClubId,
        overall: values.overall,
        salary: values.salary,
        sofifaId: values.sofifaId || '',
        transfermarktId: values.transfermarktId || '',
        isKempesita: values.isKempesita,
        isActive: values.isActive,
      }

      await PlayerService.updatePlayer(player.id, updateData)
      setVerificationStatus('success')
      toast.success('Player updated successfully!')
      onSuccess?.()
      onClose?.()
    } catch (error) {
      console.error('Error updating player:', error)
      setVerificationStatus('error')
      toast.error(error instanceof Error ? error.message : 'Failed to update player. Please try again.')
    }
  }

  const handleDialogClose = () => {
    form.reset()
    setVerificationStatus(null)
    onClose?.()
  }

  return (
    <Dialog open={!!player} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Player</DialogTitle>
          <DialogDescription>Make changes to the player here. Click save when you're done.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">First Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-11">
                          <User className="size-4 text-gray-400" />
                        </div>
                        <Input
                          type="text"
                          placeholder="Enter player name"
                          className="h-11 pl-12"
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
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Last Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-11">
                          <User className="size-4 text-gray-400" />
                        </div>
                        <Input type="text" placeholder="Enter last name" className="h-11 pl-12" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="birthdate"
              render={({ field }) => (
                <FormItem className="flex flex-col select-auto">
                  <FormLabel>Date of birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-[280px] pl-3 text-left font-normal select-auto',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        defaultMonth={field.value || new Date(1990, 0)}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>Your date of birth is used to calculate your age.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="overall"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Overall (0-99)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" className="h-11" min={0} max={99} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Salary</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" className="h-11" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ownerClubId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Owner Club</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'none'}>
                      <FormControl>
                        <SelectTrigger className="h-11 w-full">
                          <div className="flex items-center gap-3">
                            <Building2 className="size-4 text-gray-400" />
                            <SelectValue placeholder="Select owner club" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {clubs.map((club) => (
                          <SelectItem key={club.id} value={club.id}>
                            {club.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="actualClubId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Actual Club</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'none'}>
                      <FormControl>
                        <SelectTrigger className="h-11 w-full">
                          <div className="flex items-center gap-3">
                            <Building2 className="size-4 text-gray-400" />
                            <SelectValue placeholder="Select actual club" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {clubs.map((club) => (
                          <SelectItem key={club.id} value={club.id}>
                            {club.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sofifaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Sofifa ID (optional)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Sofifa ID" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transfermarktId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Transfermarkt ID (optional)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Transfermarkt ID" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isKempesita"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Is Kempesita</FormLabel>
                    <FormDescription>
                      Mark if the player is a Kempesita (youth academy player).
                    </FormDescription>
                  </div>
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
                    <FormLabel>Is Active</FormLabel>
                    <FormDescription>Mark if the player is currently active.</FormDescription>
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
                    Updating player...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <User className="size-4" />
                    Update Player
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

export default EditPlayerForm
