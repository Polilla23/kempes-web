import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClubService } from "@/services/club.service";
import { UserService } from "@/services/user.service";
import type { RegisterClubFormData, User } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, UserPlus, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

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
    const [ verificationStatus, setVerificationStatus ] = useState<'loading' | 'success' | 'error' | null>(null)
    const [ errorMessage, setErrorMessage ] = useState<string | null>(null)
    // const [ logoPreview, setLogoPreview ] = useState<string | null>(null)
    const [ availableUsers, setAvailableUsers ] = useState<User[]>([])
    
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            logo: '',
            userId: '',
            isActive: true
        }
    })

    // Fetch users without clubs
    const fetchAvailableUsers = async () => {
        try {
            const response = await UserService.getUsers()
            const usersWithoutClubs = response.users.filter((user: User) => !user.club)
            setAvailableUsers(usersWithoutClubs)
        } catch (error) {
            console.error('Error fetching users:', error)
        }
    }
    useEffect(() => {
        fetchAvailableUsers()
    }, [])

    async function onSubmit(values: FormData) {
        setVerificationStatus('loading')
        setErrorMessage(null)

        try {
            const clubData: RegisterClubFormData = {
                name: values.name,
                logo: values.logo || '',
                userId: values.userId === 'none' ? undefined : values.userId,
                isActive: values.isActive
            }

            await ClubService.createClub(clubData)
            setVerificationStatus('success')
            form.reset()
        } catch (error: any) {
            console.error('Error creating club:', error)
            setErrorMessage(error instanceof Error ? error.message : 'An error occurred while creating the club.')
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
                            <h2 className="text-xl font-semibold text-gray-900">Club created successfully</h2>
                            <p className="text-gray-600 mt-2">The new club has been created successfully.</p>
                        </div>
                        <Button
                            onClick={() => {
                                setVerificationStatus(null)
                                fetchAvailableUsers()
                            }}
                            className="bg-cyan-600 hover:bg-cyan-700"
                        >
                            Create Another Club
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card className="bg-white shadow-lg">
                <CardHeader className="text-center pb-6">
                    <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold">
                        <UserPlus className="h-8 w-8 text-cyan-600" />
                        Create New Club
                    </CardTitle>
                    <p className="text-gray-600">Add a new club</p>
                </CardHeader>
                <CardContent className="space-y-6">
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

                            <Button 
                                className="w-full h-11 bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
                                type="submit"
                                disabled={verificationStatus === 'loading'}
                            >
                                {verificationStatus === 'loading' ? ( 
                                <div>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating Club...
                                </div> 
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <UserPlus className="w-4 h-4" />
                                        Create Club
                                    </div>
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}