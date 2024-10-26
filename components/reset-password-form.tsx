'use client'

import {useRouter, useSearchParams} from 'next/navigation'
import {zodResolver} from '@hookform/resolvers/zod'
import {useForm} from 'react-hook-form'
import * as z from 'zod'
import {Button} from '@/components/ui/button'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {PasswordInput} from "@/components/password-input"
import {toast} from "sonner"
import {useApi} from '@/hooks/use-api'
import {AuthResponse, ErrorResponse} from '@/types/auth'

const formSchema = z.object({
    password: z.string().min(8, {
        message: 'Password must be at least 8 characters long.',
    }),
    password_confirmation: z.string().min(8, {
        message: 'Password must be at least 8 characters long.',
    }),
}).refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ["password_confirmation"],
});

type ResetPasswordFormValues = z.infer<typeof formSchema>;

export function ResetPasswordForm() {
    const router = useRouter()
    const {post, isLoading} = useApi<AuthResponse, ResetPasswordFormValues>('/auth/reset-password')
    const searchParams = useSearchParams()

    const token = searchParams.get('token')
    const email = searchParams.get('email')

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: '',
            password_confirmation: '',
        },
    })

    async function onSubmit(values: ResetPasswordFormValues) {
        if (!token || !email) {
            toast.error('Error',
                {description: 'Invalid Link'})
            return
        }

        try {
            const response = await post({
                ...values,
                email: decodeURIComponent(email),
                token,
            })
            toast.success('Success', {
                description: response.message || 'Password reset successful.',
            })
            router.push('/login')
        } catch (error) {
            const errorResponse = error as ErrorResponse
            toast.error('Error', {
                description: errorResponse.message || 'An error occurred during password reset.',
            })
        }
    }

    return (
        <Card className="mx-auto max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Reset Password</CardTitle>
                <CardDescription>
                    Enter your new password below
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <PasswordInput placeholder="Enter your new password" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password_confirmation"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl>
                                        <PasswordInput placeholder="Confirm your new password" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Resetting Password...' : 'Reset Password'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}