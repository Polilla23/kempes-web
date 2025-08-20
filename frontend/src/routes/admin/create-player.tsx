import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClubService } from "@/services/club.service";
import { PlayerService } from "@/services/player.service";
import type { Club, RegisterPlayerFormData } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, UserPlus, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { PlayerFormSkeleton } from "@/components/ui/form-skeletons";

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
    const [ verificationStatus, setVerificationStatus ] = useState<'loading' | 'success' | 'error' | null>(null)
    const [ errorMessage, setErrorMessage ] = useState<string | null>(null)
    const [ clubs, setClubs ] = useState<Club[]>([])
    const [ isLoadingClubs, setIsLoadingClubs ] = useState(true)
    
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
            console.log("DATA DE CLUBES FETCH", response.clubs)
            setClubs(response.clubs || [])
        } catch (error) {
            console.error('Error fetching clubs:', error)
            setClubs([])
        } finally {
            setIsLoadingClubs(false)
        }
    }
    useEffect(() => {
        fetchClubs()
    }, [])

    async function onSubmit(values: FormData) {
        setVerificationStatus('loading')
        setErrorMessage(null)

        try {
            const newPlayer: RegisterPlayerFormData = {
                name: values.name,
                lastName: values.lastName,
                birthdate: values.birthdate,
                ownerClubId: values.ownerClubId ? values.ownerClubId : '',
                actualClubId: values.actualClubId ? values.actualClubId : '',
                overall: values.overall,
                salary: values.salary,
                sofifaId: values.sofifaId || '',
                transfermarktId: values.transfermarktId || '',
                isKempesita: values.isKempesita,
                isActive: values.isActive,
            }

            await PlayerService.createPlayer(newPlayer)
            setVerificationStatus('success')
            form.reset()
        } catch (error: any) {
            console.error('Error creating player:', error)
            setErrorMessage(error instanceof Error ? error.message : 'An error occurred while creating the player.')
            setVerificationStatus('error')
        }
    }

    if (verificationStatus === 'success') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center space-y-4 pt-6">
                        <div className="rounded-full bg-green-100 p-3">
                            <UserPlus className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-xl font-semibold text-gray-900">Player created successfully</h2>
                            <p className="text-gray-600 mt-2">The new player has been created successfully.</p>
                        </div>
                        <Button
                            onClick={() => {
                                setVerificationStatus(null)
                                fetchClubs()
                            }}
                            className="bg-cyan-600 hover:bg-cyan-700"
                        >
                            Create Another Player
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto">
            <Card className="bg-white shadow-lg">
                <CardHeader className="text-center pb-6">
                    <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold">
                        <UserPlus className="h-8 w-8 text-cyan-600" />
                        Create New Player
                    </CardTitle>
                    <p className="text-gray-600">Add a new player</p>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isLoadingClubs ? (
                        // Player form field skeleton
                        <PlayerFormSkeleton />
                    ) : (
                        // Actual form
                        <>
                            {errorMessage && (
                                <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center animate-in slide-in-from-top-2">
                                    <span className="flex-1">{errorMessage}</span>
                                    <Button
                                        onClick={() => setErrorMessage(null)}
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 hover:bg-red-100"
                                    >
                                        <XIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                                            placeholder="Enter name"
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

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                            placeholder="50"
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

                                        <FormField
                                            control={form.control}
                                            name="ownerClubId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700 font-medium">Owner Club</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500">
                                                                    <SelectValue placeholder="Select owner club " />
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
                                                    <FormLabel className="text-gray-700 font-medium">Actual Club</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500">
                                                                    <SelectValue placeholder="Select actual club" />
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

                                    <Button 
                                        className="w-full h-11 bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
                                        type="submit"
                                        disabled={verificationStatus === 'loading'}
                                    >
                                        {verificationStatus === 'loading' ? ( 
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Creating Player...
                                        </div> 
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <UserPlus className="w-4 h-4" />
                                                Create Player
                                            </div>
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}