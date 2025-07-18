import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AuthService from '@/services/auth.service';
import type { RegisterUserFormData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EyeIcon, EyeOffIcon, Loader2, LockIcon, MailIcon, UserPlus, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const Route = createFileRoute('/admin/create-user')({
    component: CreateUserPage,
});

const formSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
    role: z.enum(['USER', 'ADMIN'], { required_error: 'Please select a role.'}),
})

function CreateUserPage() {
    const [ verificationStatus, setVerificationStatus ] = useState<'loading' | 'success' | 'error' | null>(null);
    const [ errorMessage, setErrorMessage ] = useState<string | null>(null);
    const [ passwordVisible, setPasswordVisible ] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
            role: 'USER'
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setVerificationStatus('loading');
        setErrorMessage(null);

        try {
            const userData: RegisterUserFormData = {
                email: values.email,
                password: values.password,
                role: values.role,
            }

            await AuthService.register(userData);
            setVerificationStatus('success');
            form.reset()
        } catch (error: any) {
            console.error('Error creating user:', error);
            setErrorMessage(error instanceof Error ? error.message : 'An error occurred while creating the user.');
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
                            <h2 className="text-x1 font-semibold text-gray-900">User created successfully</h2>
                            <p className="text-gray-600 mt-2">
                                A verification email has been sent to the user.
                            </p>
                        </div>
                        <Button
                            onClick={() => setVerificationStatus(null)}
                            className="bg-cyan-600 hover:bg-cyan-700"
                        >
                            Create Another User
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
                        Create New User
                    </CardTitle>
                    <p className="text-gray-600">Add a new user</p>
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
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-10">
                                                    <MailIcon className="h-4 w-4 text-gray-400" />
                                                    <span className="mx-2 w-px h-6 bg-gray-300" />
                                                </div>
                                                <Input
                                                    type="email"
                                                    placeholder="Enter user's email"
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
                                name="password"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center h-10">
                                                <LockIcon className="w-4 h-4 text-gray-400" />
                                                <span className="mx-2 w-px h-6 bg-gray-300" />
                                            </div>
                                            <Input
                                                type={passwordVisible ? 'text' : 'password'}
                                                placeholder="Enter user's password"
                                                className="pl-12 h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                                                {...field}
                                            />
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                                onClick={() => setPasswordVisible(!passwordVisible)}
                                            >
                                                {passwordVisible ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-700 font-medium">Role</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-11 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500">
                                        <SelectValue placeholder="Select user role" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="USER">User</SelectItem>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />

                            <Button
                                className="w-full h-11 bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
                                type="submit"
                                disabled={verificationStatus === 'loading'}
                            >
                                {verificationStatus === 'loading' ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating user...
                                </div>
                                ) : (
                                <div className="flex items-center gap-2">
                                    <UserPlus className="w-4 h-4" />
                                    Create User
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

export default CreateUserPage;