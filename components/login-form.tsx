'use client'

import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from '@/components/ui/input'
import { PasswordInput } from "@/components/password-input"
import { toast } from "sonner"
import Link from "next/link"
import { useApi } from '@/hooks/use-api'
import { ErrorResponse } from '@/types/auth'
import { Loader2 } from "lucide-react";
import { useDictionary } from "@/app/[lang]/providers";
import { Checkbox } from "@/components/ui/checkbox"
import { useApiErrorHandler } from '@/hooks/use-api-error'

export default function LoginForm() {
  const router = useRouter()
  const { login, formValidation } = useDictionary()
  const { handleApiError } = useApiErrorHandler()
  const formSchema = z.object({
    email: z.string().email({
      message: formValidation.emailRequired
    }),
    password: z.string().min(8, {
      message: formValidation.passwordMinLength
    }),
    rememberMe: z.boolean().default(false)
  })

  type FormValues = z.infer<typeof formSchema>

  const { post, isLoading } = useApi();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      const response = await post('/auth/login', values)
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
      handleApiError(error)
    }
  }

    return (
        <Card className="mx-auto max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">{login.title}</CardTitle>
                <CardDescription>
                    {login.description}
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
                                    <FormLabel>{login.email}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={login.emailPlaceholder} {...field} />
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
                                        <FormLabel>{login.password}</FormLabel>
                                        <Link href={"/forgot-password"} className="ml-auto inline-block text-sm underline">
                                            {login.forgotPassword}
                                        </Link>
                                    </div>
                                    <FormControl>
                                        <PasswordInput placeholder={login.passwordPlaceholder} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="rememberMe"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Remember me
                                        </FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                login.loginButton
                            )}
                        </Button>
                    </form>
                </Form>
                <div className="mt-4 text-center text-sm">
                    {login.noAccount}{' '}
                    <Link href={"/signup"} className="underline">
                        {login.signUp}
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}