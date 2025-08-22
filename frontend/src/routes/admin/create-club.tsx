import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClubService } from "@/services/club.service";
import { UserService } from "@/services/user.service";
import type { Club, RegisterClubFormData, User } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, UserPlus, XIcon, Edit, Plus, Save, Building2, Search, ArrowUp, ArrowDown } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { ClubTableSkeleton } from "@/components/ui/form-skeletons";

export const Route = createFileRoute('/admin/create-club')({
    component: CreateClubPage,
})

const formSchema = z.object({
    name: z.string().min(2, { message: 'Club name must be at least 2 characters.' }),
    logo: z.string().optional(),
    userId: z.string().optional(),
    isActive: z.boolean()
})

type FormData = z.infer<typeof formSchema>

function CreateClubPage() {
    const [ clubs, setClubs ] = useState<Club[]>([])
    const [ isLoadingClubs, setIsLoadingClubs ] = useState(true)
    const [ availableUsers, setAvailableUsers ] = useState<User[]>([])
    const [ isLoadingUsers, setIsLoadingUsers ] = useState(false)
    const [ editingClub, setEditingClub ] = useState<string | null>(null)
    const [ isDialogOpen, setIsDialogOpen ] = useState(false)
    
    // Simplified state for search and sorting
    const [ searchTerm, setSearchTerm ] = useState('')
    const [ sortDirection, setSortDirection ] = useState<'asc' | 'desc'>('asc')
    const [ debouncedSearchTerm, setDebouncedSearchTerm ] = useState('')

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            logo: '',
            userId: '',
            isActive: true
        }
    })

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm)
        }, 500) // 0.5 second delay

        return () => clearTimeout(timer)
    }, [searchTerm])

    // Fetch clubs
    const fetchClubs = async () => {
        try {
            setIsLoadingClubs(true)
            const response = await ClubService.getClubs()
            console.log("CLUBS EN LA DB:", response)
            setClubs(response.clubs || [])
        } catch (error) {
            console.error('Error fetching clubs:', error)
            toast.error('Failed to fetch clubs')
            setClubs([])
        } finally {
            setIsLoadingClubs(false)
        }
    }

    // Fetch users without clubs - ONLY when dialog opens
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
        setIsDialogOpen(open)
        if (open) {
            // Fetch users when dialog opens
            await fetchAvailableUsers()
        }
    }

    useEffect(() => {
        fetchClubs()
    }, [])

    // Filter and sort clubs - Fixed to handle missing user data
    const filteredAndSortedClubs = useMemo(() => {
        const filtered = clubs.filter(club => {
            if (!debouncedSearchTerm) return true
            
            const searchLower = debouncedSearchTerm.toLowerCase()
            const clubName = club.name.toLowerCase()
            
            let ownerEmail = 'No owner'
            if (club.user && club.user.email) {
                ownerEmail = club.user.email.toLowerCase()
            }
            
            return clubName.includes(searchLower) || ownerEmail.includes(searchLower)
        })

        // Sort clubs by name only
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
    }, [clubs, debouncedSearchTerm, sortDirection])

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

    // Safe getOwnerEmail function
    const getOwnerEmail = (club: Club) => {
        if (!club.user || !club.user.email) return 'No owner';
        return club.user.email;
    }

    async function onSubmit(values: FormData) {
        try {
            const clubData: RegisterClubFormData = {
                name: values.name,
                logo: values.logo || '',
                userId: values.userId === 'none' ? undefined : values.userId,
                isActive: values.isActive
            }

            await ClubService.createClub(clubData)
            toast.success('Club created successfully')
            form.reset()
            setIsDialogOpen(false)
            fetchClubs() // Refresh the list
        } catch (error: any) {
            console.error('Error creating club:', error)
            toast.error(error instanceof Error ? error.message : 'An error occurred while creating the club.')
        }
    }

    const handleEditClub = (clubId: string) => {
        setEditingClub(editingClub === clubId ? null : clubId)
    }

    const handleSaveClub = async (clubId: string, updatedData: { name: string; logo: string }) => {
        try {
            // You'll need to implement this method in your ClubService
            await ClubService.updateClub(clubId, updatedData)
            toast.success('Club updated successfully')
            setEditingClub(null)
            fetchClubs() // Refresh the list
        } catch (error: any) {
            console.error('Error updating club:', error)
            toast.error(error instanceof Error ? error.message : 'An error occurred while updating the club.')
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-white shadow-lg">
                <CardHeader className="text-center pb-6">
                    <CardTitle className="flex items-center justify-center gap-2 text-xl sm:text-2xl font-bold">
                        <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-cyan-600" />
                        Club Management
                    </CardTitle>
                    <p className="text-gray-600 text-sm sm:text-base">Manage all clubs in the system</p>
                </CardHeader>
                <CardContent>
                    {isLoadingClubs ? (
                        <ClubTableSkeleton rows={8} />
                    ) : (
                        <div className="space-y-4">
                            {/* Header with Search and Create Button */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <h3 className="text-lg font-semibold text-gray-900">All Clubs</h3>
                                
                                {/* Search Bar */}
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search clubs by name or owner email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 h-10 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                                    />
                                </div>

                                <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
                                    <DialogTrigger asChild>
                                        <Button className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 w-full sm:w-auto">
                                            <Plus className="h-4 w-4" />
                                            Create Club
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Create New Club</DialogTitle>
                                            <DialogDescription>
                                                Fill in the details to create a new club.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                                                    <SelectItem value="none">None</SelectItem>
                                                                    {availableUsers.map((user) => (
                                                                        <SelectItem key={user.id} value={user.id}>
                                                                            {user.email}
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
                                                                    Club is active
                                                                </FormLabel>
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
                                                    <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
                                                        Create Club
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </Form>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {/* Results Count */}
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>
                                    Showing {filteredAndSortedClubs.length} of {clubs.length} clubs
                                    {debouncedSearchTerm && (
                                        <span> for "{debouncedSearchTerm}"</span>
                                    )}
                                </span>
                            </div>

                            {/* Clubs Table - Responsive Design */}
                            <div className="border rounded-lg overflow-hidden">
                                {/* Desktop Table */}
                                <div className="hidden md:block">
                                    {/* Table Header */}
                                    <div className="bg-gray-50 px-6 py-3 border-b">
                                        <div className="grid grid-cols-12 gap-4">
                                            <button 
                                                onClick={handleSort}
                                                className="font-medium text-gray-900 col-span-3 flex items-center gap-1 hover:text-cyan-600 transition-colors"
                                            >
                                                Name
                                                {getSortIcon()}
                                            </button>
                                            <span className="font-medium text-gray-900 col-span-2">Logo</span>
                                            <span className="font-medium text-gray-900 col-span-5">Owner</span>
                                            <span className="font-medium text-gray-900 col-span-2 text-center">Actions</span>
                                        </div>
                                    </div>
                                    
                                    {/* Table Body */}
                                    {filteredAndSortedClubs.length === 0 ? (
                                        <div className="px-6 py-12 text-center">
                                            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                {debouncedSearchTerm ? 'No clubs found' : 'No clubs found'}
                                            </h3>
                                            <p className="text-gray-600">
                                                {debouncedSearchTerm 
                                                    ? `No clubs match "${debouncedSearchTerm}"` 
                                                    : 'Create your first club to get started'
                                                }
                                            </p>
                                        </div>
                                    ) : (
                                        filteredAndSortedClubs.map((club) => (
                                            <div key={club.id} className="px-6 py-4 border-b last:border-b-0">
                                                <div className="grid grid-cols-12 gap-4 items-center">
                                                    <div className="col-span-3">
                                                        {editingClub === club.id ? (
                                                            <Input
                                                                defaultValue={club.name}
                                                                className="h-8"
                                                                onBlur={(e) => {
                                                                    if (e.target.value !== club.name) {
                                                                        handleSaveClub(club.id, {
                                                                            name: e.target.value,
                                                                            logo: club.logo || ''
                                                                        })
                                                                    }
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="font-medium text-gray-900 truncate block">{club.name}</span>
                                                        )}
                                                    </div>
                                                    <div className="col-span-2">
                                                        {editingClub === club.id ? (
                                                            <Input
                                                                defaultValue={club.logo || ''}
                                                                className="h-8"
                                                                placeholder="Logo URL"
                                                                onBlur={(e) => {
                                                                    if (e.target.value !== club.logo) {
                                                                        handleSaveClub(club.id, {
                                                                            name: club.name,
                                                                            logo: e.target.value
                                                                        })
                                                                    }
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                {club.logo ? (
                                                                    <img 
                                                                        src={club.logo} 
                                                                        alt={`${club.name} logo`}
                                                                        className="h-8 w-8 rounded object-cover"
                                                                        onError={(e) => {
                                                                            e.currentTarget.style.display = 'none'
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="h-8 w-8 rounded bg-gray-200 flex items-center justify-center">
                                                                        <Building2 className="h-4 w-4 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="col-span-5">
                                                        <span className="text-gray-600 truncate block">{getOwnerEmail(club)}</span>
                                                    </div>
                                                    <div className="col-span-2 flex justify-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEditClub(club.id)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            {editingClub === club.id ? (
                                                                <Save className="h-4 w-4" />
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
                                    {filteredAndSortedClubs.length === 0 ? (
                                        <div className="px-6 py-12 text-center">
                                            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                {debouncedSearchTerm ? 'No clubs found' : 'No clubs found'}
                                            </h3>
                                            <p className="text-gray-600">
                                                {debouncedSearchTerm 
                                                    ? `No clubs match "${debouncedSearchTerm}"` 
                                                    : 'Create your first club to get started'
                                                }
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 p-4">
                                            {filteredAndSortedClubs.map((club) => (
                                                <div key={club.id} className="bg-white border rounded-lg p-4 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-shrink-0">
                                                                {club.logo ? (
                                                                    <img 
                                                                        src={club.logo} 
                                                                        alt={`${club.name} logo`}
                                                                        className="h-10 w-10 rounded object-cover"
                                                                        onError={(e) => {
                                                                            e.currentTarget.style.display = 'none'
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                                                                        <Building2 className="h-5 w-5 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                                                    {editingClub === club.id ? (
                                                                        <Input
                                                                            defaultValue={club.name}
                                                                            className="h-8 text-sm"
                                                                            onBlur={(e) => {
                                                                                if (e.target.value !== club.name) {
                                                                                    handleSaveClub(club.id, {
                                                                                        name: e.target.value,
                                                                                        logo: club.logo || ''
                                                                                    })
                                                                                }
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        club.name
                                                                    )}
                                                                </h4>
                                                                <p className="text-sm text-gray-500 truncate">
                                                                    {getOwnerEmail(club)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEditClub(club.id)}
                                                            className="h-8 w-8 p-0 flex-shrink-0"
                                                        >
                                                            {editingClub === club.id ? (
                                                                <Save className="h-4 w-4" />
                                                            ) : (
                                                                <Edit className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </div>
                                                    {editingClub === club.id && (
                                                        <div className="pt-2 border-t">
                                                            <Input
                                                                defaultValue={club.logo || ''}
                                                                className="h-8 text-sm"
                                                                placeholder="Logo URL"
                                                                onBlur={(e) => {
                                                                    if (e.target.value !== club.logo) {
                                                                        handleSaveClub(club.id, {
                                                                            name: club.name,
                                                                            logo: e.target.value
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
    )
}