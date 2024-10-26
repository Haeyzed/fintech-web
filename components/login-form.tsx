'use client'

import {useRouter} from 'next/navigation'
import {zodResolver} from '@hookform/resolvers/zod'
import {useForm} from 'react-hook-form'
import * as z from 'zod'
import {signIn} from 'next-auth/react'
import {Button} from '@/components/ui/button'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from '@/components/ui/input'
import {PasswordInput} from "@/components/password-input"
import {toast} from "sonner"
import Link from "next/link"
import {useApi} from '@/hooks/use-api'
import {ErrorResponse} from '@/types/auth'

const formSchema = z.object({
    email: z.string().email({
        message: 'Please enter a valid email address.',
    }),
    password: z.string().min(8, {
        message: 'Password must be at least 8 characters long.',
    }),
})

type LoginFormValues = z.infer<typeof formSchema>;

export default function LoginForm() {
    const router = useRouter()
    const { post, isLoading } = useApi<void, LoginFormValues>('/auth/login')

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    async function onSubmit(values: LoginFormValues) {
        try {
            const response = await post(values)
            const result = await signIn('credentials', {
                redirect: false,
                email: values.email,
                password: values.password,
            })

            if (result?.error) {
                throw new Error(result.error)
            }

            if (result?.ok) {
                router.push('/dashboard')
            }
            toast.success('Success', {
                description: response.message || 'Login successful.',
            })
        } catch (error) {
            const errorResponse = error as ErrorResponse
            toast.error('Error', {
                description: errorResponse.message || 'An error occurred during login.',
            })
        }
    }

    return (
        <Card className="mx-auto max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>
                    Enter your email below to login to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your email" {...field} />
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
                                    <div className="flex items-center">
                                        <FormLabel>Password</FormLabel>
                                        <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
                                            Forgot your password?
                                        </Link>
                                    </div>
                                    <FormControl>
                                        <PasswordInput placeholder="Enter your password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Logging in...' : 'Log in'}
                        </Button>
                    </form>
                </Form>
                <div className="mt-4 text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="underline">
                        Sign up
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}