// Components imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlayerTableSkeleton } from "@/components/ui/form-skeletons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InputFile } from "@/components/ui/input-file";
import { Loader2, UserPlus, Edit, Plus, Save, Search, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

// Service imports
import { ClubService } from "@/services/club.service";
import { PlayerService } from "@/services/player.service";

// Types imports
import type { Club, RegisterPlayerFormData, Player } from "@/types";

import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import z from "zod";


export const Route = createFileRoute('/admin/create-player')({
    component: CreatePlayerPage,
})

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

type FormData = z.infer<typeof formSchema>

function CreatePlayerPage() {
    const [ clubs, setClubs ] = useState<Club[]>([])
    const [ isLoadingClubs, setIsLoadingClubs ] = useState(true)
    const [ players, setPlayers ] = useState<Player[]>([])
    const [ isLoadingPlayers, setIsLoadingPlayers ] = useState(true)
    const [ editingPlayer, setEditingPlayer ] = useState<string | null>(null)
    const [ showCreateForm, setShowCreateForm ] = useState(false)
    const [ selectedFile, setSelectedFile ] = useState<File | null>(null)
    const [ isUploading, setIsUploading ] = useState(false)

    // Add state for form loading
    const [ isLoadingForm, setIsLoadingForm ] = useState(false)

    // Simplified state for search and sorting
    const [ searchTerm, setSearchTerm ] = useState('')
    const [ sortDirection, setSortDirection ] = useState<'asc' | 'desc'>('asc')
    const [ debouncedSearchTerm, setDebouncedSearchTerm ] = useState('')
    
    const form = useForm<FormData>({
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

    // Fetch players
    const fetchPlayers = async () => {
        try {
            setIsLoadingPlayers(true)
            const response = await PlayerService.getPlayers()
            console.log("PLAYERS DATA: ", response.players)
            setPlayers(response.players || [])
        } catch (error) {
            console.error('Error fetching players: ', error)
            toast.error('Failed to fetch players')
            setPlayers([])
        } finally {
            setIsLoadingPlayers(false)
        }
    }

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm)
        }, 500) // 0.5 second delay

        return () => clearTimeout(timer)
    }, [searchTerm])

    // Handle dialog open/close
    const handleCreateFormToggle = async () => {
        if (!showCreateForm) {
            setShowCreateForm(true) // Show form immediately
            setIsLoadingForm(true)  // Show skeleton
            await fetchClubs()      // Load data
            setIsLoadingForm(false) // Hide skeleton, show actual form
        } else {
            setShowCreateForm(false)
        }
    }

    useEffect(() => {
        fetchPlayers()
    }, [])

    // Filter and sort players
    const filteredAndSortedPlayers = useMemo(() => {
        const filtered = players.filter(player => {
            if (!debouncedSearchTerm) return true

            const searchLower = debouncedSearchTerm.toLowerCase()
            const playerName = player.name.toLowerCase()
            const playerLastName = player.lastName.toLowerCase()
            
            let ownerClubName = 'No owner club'
            if (player.ownerClub && player.ownerClub.name) {
                ownerClubName = player.ownerClub.name.toLowerCase()
            }
            
            let actualClubName = 'No actual club'
            if (player.actualClub && player.actualClub.name) {
                actualClubName = player.actualClub.name.toLowerCase()
            }

            return playerName.includes(searchLower) || 
                   playerLastName.includes(searchLower) ||
                   ownerClubName.includes(searchLower) ||
                   actualClubName.includes(searchLower)
        })

        filtered.sort((a, b) => {
            const aName = a.name.toLowerCase()
            const bName = b.name.toLowerCase()

            if (sortDirection === 'asc') {
                return aName.localeCompare(bName)
            } else {
                return bName.localeCompare(aName)
            }
        })

        return filtered
    }, [players, debouncedSearchTerm, sortDirection])

    // Handle sort toggle
    const handleSort = () => {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    }

    // Get sort icon
    const getSortIcon = () => {
        return sortDirection === 'asc' ?
        <ArrowUp className="h-4 w-4" /> :
        <ArrowDown className="h-4 w-4" />
    }

    // Safe getClubName function
    const getClubName = (club: any) => {
        if (!club || !club.name) return 'No club';
        return club.name;
    }

    const formatBirthdate = (birthdate: string) => {
        if (!birthdate) return '';
        const date = new Date(birthdate);
        if (isNaN(date.getTime())) return birthdate;
        return date.toLocaleDateString('en-GB');
    }

    async function onSubmit(values: FormData) {
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
            setShowCreateForm(false)
            fetchPlayers() // Refresh the list
        } catch (error: any) {
            console.error('Error creating player:', error)
            toast.error(error instanceof Error ? error.message : 'An error occurred while creating the player.')
        }
    }

    const handleEditPlayer = (playerId: string) => {
        setEditingPlayer(editingPlayer === playerId ? null : playerId)
    }

    const handleSavePlayer = async (playerId: string, updatedData: { name: string; lastName: string; birthdate: string; overall: number; salary: number; ownerClubId: string; sofifaId: string; transfermarktId: string; isKempesita: boolean; isActive: boolean;}) => {
        try {
            await PlayerService.updatePlayer(playerId, updatedData)
            toast.success('Player updated successfully')
            setEditingPlayer(null)
            fetchPlayers() // Refresh the list
        } catch (error: any) {
            console.error('Error updating player: ', error)
            toast.error(error instanceof Error ? error.message : 'An error occurred while updating the player.')
        }
    }

    // Bulk Create Function
    const handleBulkCreate = async () => {
        if (!selectedFile) {
            toast.error('Please select a CSV file')
            return
        }

        try {
            setIsUploading(true)
            await PlayerService.bulkCreatePlayer(selectedFile)
            toast.success('Players created successfully from CSV')
            setSelectedFile(null)
            setShowCreateForm(false)
            fetchPlayers()
        } catch (error: any) {
            console.error('Error creating players:', error)
            toast.error(error instanceof Error ? error.message : 'An error occurred while creating players from CSV')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Card className="bg-white shadow-lg">
                    <CardHeader className="text-center pb-6 px-4 sm:px-6">
                        <CardTitle className="flex items-center justify-center gap-2 text-xl sm:text-2xl lg:text-3xl font-bold">
                            <UserPlus className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-600" />
                            Player Management
                        </CardTitle>
                        <p className="text-gray-600 text-sm sm:text-base mt-2">Manage all players in the system</p>
                    </CardHeader>
                    <CardContent className="px-4 sm:px-6">
                        {isLoadingPlayers ? (
                            <PlayerTableSkeleton rows={8}/>
                        ) : showCreateForm ? (
                            isLoadingForm ? (
                                // Skeleton while form data loads
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                                                <div className="h-11 bg-gray-200 rounded animate-pulse"></div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                                                <div className="h-11 bg-gray-200 rounded animate-pulse"></div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="space-y-2">
                                                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                                                    <div className="h-11 bg-gray-200 rounded animate-pulse"></div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[1, 2].map((i) => (
                                                <div key={i} className="space-y-2">
                                                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                                                    <div className="h-11 bg-gray-200 rounded animate-pulse"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Actual form content
                                <div className="space-y-4">
                                    <Tabs defaultValue="single" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="single">One Player</TabsTrigger>
                                            <TabsTrigger value="multiple">Multiple Players</TabsTrigger>
                                        </TabsList>
                                        
                                        <TabsContent value="single">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-lg font-semibold text-gray-900">Create New Player</h4>
                                            </div>
                                            
                                            <Form {...form}>
                                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <FormField
                                                            control={form.control}
                                                            name="name"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-gray-700 font-medium">Name</FormLabel>
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
                                                                    <FormLabel className="text-gray-700 font-medium">Last Name</FormLabel>
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
                                                                    <FormLabel className="text-gray-700 font-medium">Birthdate (DD/MM/YYYY)</FormLabel>
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
                                                                    <FormLabel className="text-gray-700 font-medium">Overall (0-99)</FormLabel>
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
                                                                    <FormLabel className="text-gray-700 font-medium">Salary</FormLabel>
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
                                                                    <FormLabel className="text-gray-700 font-medium">Owner Club</FormLabel>
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
                                                                    <FormLabel className="text-gray-700 font-medium">Actual Club</FormLabel>
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
                                                                    <FormLabel className="text-gray-700 font-medium">Sofifa ID (optional)</FormLabel>
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
                                                                    <FormLabel className="text-gray-700 font-medium">Transfermarkt ID (optional)</FormLabel>
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
                                                                        <FormLabel className="text-gray-700 font-medium">
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
                                                                        <FormLabel className="text-gray-700 font-medium">
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
                                                            onClick={handleCreateFormToggle}
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
                                                    <h4 className="text-lg font-semibold text-gray-900">Create Multiple Players</h4>
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
                                                        onClick={handleCreateFormToggle}
                                                    >
                                                        Back
                                                    </Button>
                                                    <Button 
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
                                                    </Button>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            )
                        ) : (
                            // Table view
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">All Players</h3>
                                    
                                    <div className="relative flex-1 max-w-md">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input 
                                            type="text"
                                            placeholder="Search players..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 h-10 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                                        />
                                    </div>

                                    <Button 
                                        onClick={handleCreateFormToggle}
                                        className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 w-full sm:w-auto justify-center"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Create Player
                                    </Button>
                                </div>

                                {/* Results Count */}
                                <div className="flex items-center justify-between text-sm text-gray-600">
                                    <span>
                                        Showing {filteredAndSortedPlayers.length} of {players.length} players
                                        {debouncedSearchTerm && (
                                            <span> for "{debouncedSearchTerm}"</span>
                                        )}
                                    </span>
                                </div>
                                
                                {/* Players Table - Responsive Design */}
                                <div className="border rounded-lg overflow-hidden">
                                    {/* Desktop Table */}
                                    <div className="hidden lg:block">
                                        {/* Table Header */}
                                        <div className="bg-gray-50 px-4 py-3 border-b">
                                            <div className="grid grid-cols-12 gap-2 text-sm">
                                                <button
                                                    onClick={handleSort}
                                                    className="font-medium text-gray-900 col-span-2 flex items-center gap-1 hover:text-cyan-600 transition-colors text-left"
                                                >
                                                    Name
                                                    {getSortIcon()}
                                                </button>
                                                <span className="font-medium text-gray-900 col-span-2">Last Name</span>
                                                <span className="font-medium text-gray-900 col-span-2">Birthdate</span>
                                                <span className="font-medium text-gray-900 col-span-1 text-center">Overall</span>
                                                <span className="font-medium text-gray-900 col-span-1 text-center">Salary</span>
                                                <span className="font-medium text-gray-900 col-span-2">Owner Club</span>
                                                <span className="font-medium text-gray-900 col-span-1">Actual Club</span>
                                                <span className="font-medium text-gray-900 col-span-1 text-center">Actions</span>
                                            </div>
                                        </div>

                                        {/* Table Body */}
                                        {filteredAndSortedPlayers.length === 0 ? (
                                            <div className="px-4 py-12 text-center">
                                                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                    {debouncedSearchTerm ? 'No players found' : 'No players found'}
                                                </h3>
                                                <p className="text-gray-600">
                                                    {debouncedSearchTerm
                                                        ? `No players match "${debouncedSearchTerm}"`
                                                        : 'Create your first player to get started'
                                                    }
                                                </p>
                                            </div>
                                        ) : (
                                            filteredAndSortedPlayers.map((player) => (
                                                <div key={player.id} className="px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                                                    <div className="grid grid-cols-12 gap-2 items-center text-sm">
                                                        <div className="col-span-2">
                                                            {editingPlayer === player.id ? (
                                                                <Input 
                                                                    defaultValue={player.name}
                                                                    className="h-8 text-sm"
                                                                    onBlur={(e) => {
                                                                        if (e.target.value !== player.name) {
                                                                            handleSavePlayer(player.id, {
                                                                                name: e.target.value,
                                                                                lastName: player.lastName,
                                                                                birthdate: player.birthdate,
                                                                                overall: player.overall || 0,
                                                                                salary: player.salary || 100000,
                                                                                ownerClubId: player.ownerClubId || '',
                                                                                sofifaId: player.sofifaId || '',
                                                                                transfermarktId: player.transfermarktId || '',
                                                                                isKempesita: player.isKempesita,
                                                                                isActive: player.isActive
                                                                            })
                                                                        }
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span className="font-medium text-gray-900 truncate block">{player.name}</span>
                                                            )}
                                                        </div>
                                                        <div className="col-span-2">
                                                            {editingPlayer === player.id ? (
                                                                <Input 
                                                                    defaultValue={player.lastName}
                                                                    className="h-8 text-sm"
                                                                    onBlur={(e) => {
                                                                        if (e.target.value !== player.lastName) {
                                                                            handleSavePlayer(player.id, {
                                                                                name: player.name,
                                                                                lastName: e.target.value,
                                                                                birthdate: player.birthdate,
                                                                                overall: player.overall || 0,
                                                                                salary: player.salary || 100000,
                                                                                ownerClubId: player.ownerClubId || '',
                                                                                sofifaId: player.sofifaId || '',
                                                                                transfermarktId: player.transfermarktId || '',
                                                                                isKempesita: player.isKempesita,
                                                                                isActive: player.isActive
                                                                            })
                                                                        }
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span className="text-gray-600 truncate block">{player.lastName}</span>
                                                            )}
                                                        </div>
                                                        <div className="col-span-2">
                                                            <span className="text-gray-600 text-sm">{formatBirthdate(player.birthdate)}</span>
                                                        </div>
                                                        <div className="col-span-1 text-center">
                                                            <span className="text-gray-600 font-medium">{player.overall}</span>
                                                        </div>
                                                        <div className="col-span-1 text-center">
                                                            <span className="text-gray-600 font-medium">${player.salary?.toLocaleString()}</span>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <span className="text-gray-600 truncate block text-sm">{getClubName(player.ownerClub)}</span>
                                                        </div>
                                                        <div className="col-span-1">
                                                            <span className="text-gray-600 truncate block text-sm">{getClubName(player.actualClub)}</span>
                                                        </div>
                                                        <div className="col-span-1 flex justify-center">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEditPlayer(player.id)}
                                                                className="h-8 w-8 p-0 hover:bg-gray-200"
                                                            >
                                                                {editingPlayer === player.id ? (
                                                                    <Save className="h-4 w-4"/>
                                                                ) : (
                                                                    <Edit className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Tablet Table */}
                                    <div className="hidden md:block lg:hidden">
                                        {/* Table Header */}
                                        <div className="bg-gray-50 px-4 py-3 border-b">
                                            <div className="grid grid-cols-10 gap-2 text-sm">
                                                <button
                                                    onClick={handleSort}
                                                    className="font-medium text-gray-900 col-span-3 flex items-center gap-1 hover:text-cyan-600 transition-colors text-left"
                                                >
                                                    Name
                                                    {getSortIcon()}
                                                </button>
                                                <span className="font-medium text-gray-900 col-span-2">Last Name</span>
                                                <span className="font-medium text-gray-900 col-span-1 text-center">Overall</span>
                                                <span className="font-medium text-gray-900 col-span-2 text-center">Salary</span>
                                                <span className="font-medium text-gray-900 col-span-1">Owner</span>
                                                <span className="font-medium text-gray-900 col-span-1 text-center">Actions</span>
                                            </div>
                                        </div>

                                        {/* Table Body */}
                                        {filteredAndSortedPlayers.length === 0 ? (
                                            <div className="px-4 py-12 text-center">
                                                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                    {debouncedSearchTerm ? 'No players found' : 'No players found'}
                                                </h3>
                                                <p className="text-gray-600">
                                                    {debouncedSearchTerm
                                                        ? `No players match "${debouncedSearchTerm}"`
                                                        : 'Create your first player to get started'
                                                    }
                                                </p>
                                            </div>
                                        ) : (
                                            filteredAndSortedPlayers.map((player) => (
                                                <div key={player.id} className="px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                                                    <div className="grid grid-cols-10 gap-2 items-center text-sm">
                                                        <div className="col-span-3">
                                                            {editingPlayer === player.id ? (
                                                                <Input 
                                                                    defaultValue={player.name}
                                                                    className="h-8 text-sm"
                                                                    onBlur={(e) => {
                                                                        if (e.target.value !== player.name) {
                                                                            handleSavePlayer(player.id, {
                                                                                name: e.target.value,
                                                                                lastName: player.lastName,
                                                                                birthdate: player.birthdate,
                                                                                overall: player.overall || 0,
                                                                                salary: player.salary || 100000,
                                                                                ownerClubId: player.ownerClubId || '',
                                                                                sofifaId: player.sofifaId || '',
                                                                                transfermarktId: player.transfermarktId || '',
                                                                                isKempesita: player.isKempesita,
                                                                                isActive: player.isActive
                                                                            })
                                                                        }
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span className="font-medium text-gray-900 truncate block">{player.name}</span>
                                                            )}
                                                        </div>
                                                        <div className="col-span-2">
                                                            {editingPlayer === player.id ? (
                                                                <Input 
                                                                    defaultValue={player.lastName}
                                                                    className="h-8 text-sm"
                                                                    onBlur={(e) => {
                                                                        if (e.target.value !== player.lastName) {
                                                                            handleSavePlayer(player.id, {
                                                                                name: player.name,
                                                                                lastName: e.target.value,
                                                                                birthdate: player.birthdate,
                                                                                overall: player.overall || 0,
                                                                                salary: player.salary || 100000,
                                                                                ownerClubId: player.ownerClubId || '',
                                                                                sofifaId: player.sofifaId || '',
                                                                                transfermarktId: player.transfermarktId || '',
                                                                                isKempesita: player.isKempesita,
                                                                                isActive: player.isActive
                                                                            })
                                                                        }
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span className="text-gray-600 truncate block">{player.lastName}</span>
                                                            )}
                                                        </div>
                                                        <div className="col-span-1 text-center">
                                                            <span className="text-gray-600 font-medium">{player.overall}</span>
                                                        </div>
                                                        <div className="col-span-2 text-center">
                                                            <span className="text-gray-600 font-medium">${player.salary?.toLocaleString()}</span>
                                                        </div>
                                                        <div className="col-span-1">
                                                            <span className="text-gray-600 truncate block text-sm">{getClubName(player.ownerClub)}</span>
                                                        </div>
                                                        <div className="col-span-1 flex justify-center">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEditPlayer(player.id)}
                                                                className="h-8 w-8 p-0 hover:bg-gray-200"
                                                            >
                                                                {editingPlayer === player.id ? (
                                                                    <Save className="h-4 w-4"/>
                                                                ) : (
                                                                    <Edit className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Mobile Cards */}
                                    <div className="md:hidden">
                                        {filteredAndSortedPlayers.length === 0 ? (
                                            <div className="px-4 py-12 text-center">
                                                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                    {debouncedSearchTerm ? 'No players found' : 'No players found'}
                                                </h3>
                                                <p className="text-gray-600">
                                                    {debouncedSearchTerm
                                                        ? `No players match "${debouncedSearchTerm}"`
                                                        : 'Create your first player to get started'
                                                    }
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 p-4">
                                                {filteredAndSortedPlayers.map((player) => (
                                                    <div key={player.id} className="bg-white border rounded-lg p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow">
                                                        <div className="flex items-start justify-between">
                                                            <div className="min-w-0 flex-1">
                                                                <h4 className="text-base font-medium text-gray-900 truncate">
                                                                    {editingPlayer === player.id ? (
                                                                        <Input
                                                                            defaultValue={player.name}
                                                                            className="h-8 text-sm"
                                                                            onBlur={(e) => {
                                                                                if (e.target.value !== player.name) {
                                                                                    handleSavePlayer(player.id, {
                                                                                        name: e.target.value,
                                                                                        lastName: player.lastName,
                                                                                        birthdate: player.birthdate,
                                                                                        overall: player.overall || 0,
                                                                                        salary: player.salary || 100000,
                                                                                        ownerClubId: player.ownerClubId || '',
                                                                                        sofifaId: player.sofifaId || '',
                                                                                        transfermarktId: player.transfermarktId || '',
                                                                                        isKempesita: player.isKempesita,
                                                                                        isActive: player.isActive
                                                                                    })
                                                                                }
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        player.name
                                                                    )}
                                                                </h4>
                                                                <p className="text-sm text-gray-500 truncate mt-1">
                                                                    {player.lastName}
                                                                </p>
                                                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                                                                    <span>Born: {formatBirthdate(player.birthdate)}</span>
                                                                    <span>Overall: {player.overall}</span>
                                                                    <span>Salary: ${player.salary?.toLocaleString()}</span>
                                                                </div>
                                                                <p className="text-sm text-gray-500 mt-1">
                                                                    Owner: {getClubName(player.ownerClub)}
                                                                </p>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEditPlayer(player.id)}
                                                                className="h-8 w-8 p-0 flex-shrink-0 hover:bg-gray-200"
                                                            >
                                                                {editingPlayer === player.id ? (
                                                                    <Save className="h-4 w-4" />
                                                                ) : (
                                                                    <Edit className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                        {editingPlayer === player.id && (
                                                            <div className="pt-3 border-t space-y-2">
                                                                <Input
                                                                    defaultValue={player.lastName}
                                                                    className="h-8 text-sm"
                                                                    placeholder="Last Name"
                                                                    onBlur={(e) => {
                                                                        if (e.target.value !== player.lastName) {
                                                                            handleSavePlayer(player.id, {
                                                                                name: player.name,
                                                                                lastName: e.target.value,
                                                                                birthdate: player.birthdate,
                                                                                overall: player.overall || 0,
                                                                                salary: player.salary || 100000,
                                                                                ownerClubId: player.ownerClubId || '',
                                                                                sofifaId: player.sofifaId || '',
                                                                                transfermarktId: player.transfermarktId || '',
                                                                                isKempesita: player.isKempesita,
                                                                                isActive: player.isActive
                                                                            })
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}