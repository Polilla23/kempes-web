import { PlayerService } from '@/services/player.service'
import { ClubService } from '@/services/club.service'
import type { RegisterPlayerFormData, Club } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { CalendarIcon, Loader2, Plus } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { InputFile } from '@/components/ui/input-file'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { PlayerFormSkeleton } from '@/components/ui/form-skeletons'
import FormSchemas from '@/lib/form-schemas'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface CreatePlayerFormProps {
  fetchPlayers: () => void
}

const CreatePlayerForm = ({ fetchPlayers }: CreatePlayerFormProps) => {
  const [clubs, setClubs] = useState<Club[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoadingClubs, setIsLoadingClubs] = useState(true)
  const [isLoadingDialog, setIsLoadingDialog] = useState(false)
  const [Open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof FormSchemas.PlayerSchema>>({
    resolver: zodResolver(FormSchemas.PlayerSchema),
    defaultValues: {
      name: '',
      lastName: '',
      birthdate: new Date(),
      ownerClubId: '',
      actualClubId: '',
      overall: 0,
      salary: 100000,
      sofifaId: '',
      transfermarktId: '',
      isKempesita: false,
      isActive: true,
    },
  })

  // Fetch clubs
  const fetchClubs = async () => {
    try {
      setIsLoadingClubs(true)
      const clubs = await ClubService.getClubs()
      setClubs(clubs || [])
    } catch (error) {
      console.error('Error fetching clubs:', error)
      toast.error('Failed to fetch clubs')
      setClubs([])
    } finally {
      setIsLoadingClubs(false)
    }
  }

  // Handle dialog open/close
  const handleDialogOpenChange = async (open: boolean) => {
    setOpen(open)
    if (open) {
      setIsLoadingDialog(true) // Show skeleton immediately
      await fetchClubs()
      setIsLoadingDialog(false) // Hide skeleton
    } else {
      setOpen(false)
    }
  }

  async function onSubmit(values: z.infer<typeof FormSchemas.PlayerSchema>) {
    try {
      const newPlayer: RegisterPlayerFormData = {
        name: values.name,
        lastName: values.lastName,
        birthdate: format(values.birthdate, 'dd/MM/yyyy'),
        ownerClubId: values.ownerClubId === 'none' ? '' : values.ownerClubId,
        actualClubId: values.actualClubId === 'none' ? '' : values.actualClubId,
        overall: values.overall,
        salary: values.salary,
        sofifaId: values.sofifaId || '',
        transfermarktId: values.transfermarktId || '',
        isKempesita: values.isKempesita,
        isActive: values.isActive,
      }

      await PlayerService.createPlayer(newPlayer)
      toast.success('Player created successfully')
      form.reset()
      fetchPlayers() // Refresh the list
    } catch (error: any) {
      console.error('Error creating player:', error)
      toast.error(error instanceof Error ? error.message : 'An error occurred while creating the player.')
    }
  }

  return (
    <Dialog open={Open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-auto">
          <Plus className="size-4" />
          Create Player
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a new player</DialogTitle>
          <DialogDescription>Fill in the details to create a new player.</DialogDescription>
        </DialogHeader>

        {isLoadingDialog ? (
          <PlayerFormSkeleton />
        ) : (
          <div className="space-y-4">
            <Tabs defaultValue="single" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">One Player</TabsTrigger>
                <TabsTrigger value="multiple">Multiple Players</TabsTrigger>
              </TabsList>

              <TabsContent value="single">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold">Create New Player</h4>
                </div>

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
                              <Input
                                required
                                type="text"
                                placeholder="Enter player name"
                                className="h-11"
                                {...field}
                              />
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
                              <Input type="text" placeholder="Enter last name" className="h-11" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {/* Calendar selection doesn't work */}
                    <FormField
                      control={form.control}
                      name="birthdate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date of birth</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={'outline'}
                                  className={cn(
                                    'w-[280px] pl-3 text-left font-normal',
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
                                captionLayout="dropdown"
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
                              <Input type="number" placeholder="0" className="h-11" {...field} />
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
                              <Input type="number" placeholder="0" className="h-11" {...field} />
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
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || 'none'}
                              disabled={isLoadingClubs}
                            >
                              <FormControl>
                                <SelectTrigger className="h-11 w-full" disabled={isLoadingClubs}>
                                  <SelectValue
                                    placeholder={isLoadingClubs ? 'Loading clubs...' : 'Select owner club'}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {isLoadingClubs ? (
                                  <SelectItem value="loading" disabled>
                                    Loading...
                                  </SelectItem>
                                ) : (
                                  <>
                                    <SelectItem value="none">None</SelectItem>
                                    {clubs.map((club) => (
                                      <SelectItem key={club.id} value={club.id}>
                                        {club.name}
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
                        name="actualClubId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-medium">Actual Club</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || 'none'}
                              disabled={isLoadingClubs}
                            >
                              <FormControl>
                                <SelectTrigger className="h-11 w-full" disabled={isLoadingClubs}>
                                  <SelectValue
                                    placeholder={isLoadingClubs ? 'Loading clubs...' : 'Select actual club'}
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {isLoadingClubs ? (
                                  <SelectItem value="loading" disabled>
                                    Loading...
                                  </SelectItem>
                                ) : (
                                  <>
                                    <SelectItem value="none">None</SelectItem>
                                    {clubs.map((club) => (
                                      <SelectItem key={club.id} value={club.id}>
                                        {club.name}
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

                    <div className="col-span-6">
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
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="col-span-6">
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
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="bg-cyan-600 hover:bg-cyan-700"
                        disabled={isLoadingClubs || form.formState.isSubmitting}
                      >
                        {isLoadingClubs ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Preparing...
                          </>
                        ) : (
                          'Create Player'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="multiple">
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold">Create Multiple Players</h4>
                  </div>

                  <div className="space-y-4">
                    <div className="border border-blue-200 rounded-lg p-4">
                      <h5 className="font-medium text-blue-900 mb-2">CSV Format Requirements</h5>
                      <p className="text-sm text-blue-700 mb-2">
                        Your CSV file should contain the following columns:
                      </p>
                      <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                        <li>name (required)</li>
                        <li>lastName (required)</li>
                        <li>birthdate (DD/MM/YYYY format)</li>
                        <li>ownerClubId (optional)</li>
                        <li>actualClubId (optional)</li>
                        <li>overall (0-99)</li>
                        <li>salary (number)</li>
                        <li>sofifaId (optional)</li>
                        <li>transfermarktId (optional)</li>
                        <li>isKempesita (true/false)</li>
                        <li>isActive (true/false)</li>
                      </ul>
                    </div>

                    <InputFile onFileChange={setSelectedFile} accept=".csv" />

                    {selectedFile && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-700">
                          Selected file: <span className="font-medium">{selectedFile.name}</span>
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Size: {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Back
                    </Button>
                    {/* <Button 
                            onClick={handleBulkCreate}
                            disabled={!selectedFile || isUploading}
                            className="bg-cyan-600 hover:bg-cyan-700"
                            >
                            {isUploading ? (
                              <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Players...
                                </>
                            ) : (
                              "Create Players from CSV"
                            )}
                        </Button> */}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CreatePlayerForm
