import { PlayerService } from '@/services/player.service'
import { ClubService } from '@/services/club.service'
import type { RegisterPlayerFormData, Club } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { Loader2, Plus } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { InputFile } from "@/components/ui/input-file"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from 'sonner'
import { PlayerFormSkeleton } from '@/components/ui/form-skeletons'


const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  birthdate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, { message: 'Format must be DD/MM/YYYY.' }),
  ownerClubId: z.string().min(1, { message: 'Owner club is required.' }),
  actualClubId: z.string().optional(),
  overall: z.coerce.number().min(0).max(99),
  salary: z.coerce.number().min(0),
  sofifaId: z.string().optional(),
  transfermarktId: z.string().optional(),
  isKempesita: z.boolean(),
  isActive: z.boolean(),
})

const CreatePlayerForm = () => {
  const [ clubs, setClubs ] = useState<Club[]>([])
  const [ selectedFile, setSelectedFile ] = useState<File | null>(null)
  const [ isLoadingClubs, setIsLoadingClubs ] = useState(true)
  const [ isLoadingDialog, setIsLoadingDialog ] = useState(false)
  const [ isOpen, setIsOpen ] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        name: '',
        lastName: '',
        birthdate: '',
        ownerClubId: '',
        actualClubId: '',
        overall: 0,
        salary: 100000,
        sofifaId: '',
        transfermarktId: '',
        isKempesita: false,
        isActive: true,
    }
  })

  // Fetch clubs
  const fetchClubs = async () => {
    try {
        setIsLoadingClubs(true)
        const response = await ClubService.getClubs()
        setClubs(response.clubs || [])
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
    setIsOpen(open)
    if (open) {
      setIsLoadingDialog(true) // Show skeleton immediately
      await fetchClubs()
      setIsLoadingDialog(false) // Hide skeleton
    } else {
      setIsOpen(false)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    
    try {
      const newPlayer: RegisterPlayerFormData = {
          name: values.name,
          lastName: values.lastName,
          birthdate: values.birthdate,
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
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-auto">
          <Plus className="size-4"/>
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
                                        <FormLabel className="font-medium">Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="Enter player name"
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
                                name="lastName"
                                render={({ field }) => (
                                  <FormItem>
                                        <FormLabel className="font-medium">Last Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="Enter last name"
                                                className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                                                {...field}
                                                />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="birthdate"
                                render={({ field }) => (
                                  <FormItem>
                                        <FormLabel className="font-medium">Birthdate (DD/MM/YYYY)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="DD/MM/YYYY"
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
                                name="overall"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-medium">Overall (0-99)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0"
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
                                name="salary"
                                render={({ field }) => (
                                  <FormItem>
                                        <FormLabel className="font-medium">Salary</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                                                {...field}
                                                />
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
                                        <Select onValueChange={field.onChange} value={field.value || 'none'} disabled={isLoadingClubs}>
                                            <FormControl>
                                                <SelectTrigger className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500" disabled={isLoadingClubs}>
                                                    <SelectValue placeholder={isLoadingClubs ? "Loading clubs..." : "Select owner club"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {isLoadingClubs ? (
                                                  <SelectItem value="loading" disabled>Loading...</SelectItem>
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
                                        <Select onValueChange={field.onChange} value={field.value || 'none'} disabled={isLoadingClubs}>
                                            <FormControl>
                                                <SelectTrigger className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500" disabled={isLoadingClubs}>
                                                    <SelectValue placeholder={isLoadingClubs ? "Loading clubs..." : "Select actual club"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {isLoadingClubs ? (
                                                    <SelectItem value="loading" disabled>Loading...</SelectItem>
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
                                            <Input
                                                type="text"
                                                placeholder="Sofifa ID"
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
                                name="transfermarktId"
                                render={({ field }) => (
                                  <FormItem>
                                        <FormLabel className="font-medium">Transfermarkt ID (optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="Transfermarkt ID"
                                                className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                                                {...field}
                                                />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                        </div>

                        <div className="flex flex-col gap-3">
                            <FormField
                                control={form.control}
                                name="isKempesita"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="font-medium">
                                                Kempesita
                                            </FormLabel>
                                            <p className="text-sm text-gray-500">
                                                Mark if this player is a Kempesita
                                            </p>
                                        </div>
                                    </FormItem>
                                )}
                                />

                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="font-medium">
                                                Active
                                            </FormLabel>
                                            <p className="text-sm text-gray-500">
                                                Enable this player to be available in competitions and transfers
                                            </p>
                                        </div>
                                    </FormItem>
                                )}
                                />
                        </div>
                        
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                >
                                Back
                            </Button>
                            <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700" disabled={isLoadingClubs || form.formState.isSubmitting}>
                                {isLoadingClubs ? (
                                  <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Preparing...
                                    </>
                                ) : (
                                    "Create Player"
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

                        <InputFile 
                            onFileChange={setSelectedFile}
                            accept=".csv"
                            />

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
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            >
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