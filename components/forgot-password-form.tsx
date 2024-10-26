'use client'

import {zodResolver} from '@hookform/resolvers/zod'
import {useForm} from 'react-hook-form'
import * as z from 'zod'
import {Button} from '@/components/ui/button'
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form'
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from '@/components/ui/input'
import {toast} from "sonner"
import Link from "next/link"
import {useApi} from '@/hooks/use-api'
import {AuthResponse, ErrorResponse} from '@/types/auth'

const formSchema = z.object({
    email: z.string().email({
        message: 'Please enter a valid email address.',
    }),
})

type ForgotPasswordFormValues = z.infer<typeof formSchema>;

export function ForgotPasswordForm() {
    const { post, isLoading } = useApi<AuthResponse, ForgotPasswordFormValues>('/auth/forgot-password')

    const form = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
        },
    })

    async function onSubmit(values: ForgotPasswordFormValues) {
        try {
            const response = await post(values)
            toast.success('Success', {
                description: response.message || 'Password reset instructions sent to your email.',
            })
            // Optionally, redirect to a confirmation page
            // router.push('/forgot-password-confirmation')
        } catch (error) {
            const errorResponse = error as ErrorResponse
            toast.error('Error', {
                description: errorResponse.message || 'An error occurred. Please try again.',
            })
        }
    }

    return (
        <Card className="mx-auto max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Forgot Password</CardTitle>
                <CardDescription>
                    Enter your email address and we&#39;ll send you instructions to reset your password.
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
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                    </form>
                </Form>
                <div className="mt-4 text-center text-sm">
                    Remember your password?{" "}
                    <Link href="/login" className="underline">
                        Back to login
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}