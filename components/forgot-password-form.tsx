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
import {useDictionary} from "@/app/[lang]/providers";
import {Loader2} from "lucide-react";

export function ForgotPasswordForm() {

    const {forgotPassword, formValidation} = useDictionary()
    const formSchema = z.object({
        email: z.string().email({
            message: formValidation.emailRequired
        })
    })
    type FormValues = z.infer<typeof formSchema>;
    const {post, isLoading} = useApi<AuthResponse, FormValues>('/auth/forgot-password')
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
        },
    })

    async function onSubmit(values: FormValues) {
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
                <CardTitle className="text-2xl">{forgotPassword.title}</CardTitle>
                <CardDescription>
                    {forgotPassword.description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>{forgotPassword.email}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={forgotPassword.emailPlaceholder} {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className='h-4 w-4 animate-spin'/>
                                </>
                            ) : (
                                forgotPassword.submitButton
                            )}
                        </Button>
                    </form>
                </Form>
                <div className="mt-4 text-center text-sm">
                    {forgotPassword.rememberPassword}{' '}
                    <Link href={"/login"} className="underline">
                        {forgotPassword.loginLink}
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}