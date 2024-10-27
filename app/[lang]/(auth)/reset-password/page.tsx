'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PasswordInput } from '@/components/password-input'
import { toast } from 'sonner'
import { useApi } from '@/hooks/use-api'
import { Loader2 } from 'lucide-react'
import { useDictionary } from '@/app/[lang]/providers'
import { useApiErrorHandler } from '@/hooks/use-api-error'


export default function ResetPasswordPage() {
  const router = useRouter()
  const { resetPassword, formValidation } = useDictionary()
  const { handleApiError } = useApiErrorHandler()
  const { post, isLoading } = useApi()
  const searchParams = useSearchParams()

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const formSchema = z.object({
    password: z.string().min(8, {
      message: formValidation.passwordMinLength
    }),
    password_confirmation: z.string()
  }).refine((data) => data.password === data.password_confirmation, {
    message: formValidation.passwordMismatch,
    path: ['password_confirmation']
  })

  type FormValues = z.infer<typeof formSchema> & {
    email: string;
    token: string;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      password_confirmation: '',
      email: email ? decodeURIComponent(email) : '',
      token: token || ''
    }
  })

  async function onSubmit(values: FormValues) {
    if (!values.token || !values.email) {
      toast.error('Error', { description: 'Invalid Link' })
      return
    }

    try {
      const response = await post('/auth/reset-password', values)
      toast.success('Success', {
        description: response.message || 'Password reset successful.'
      })
      router.push('/login')
    } catch (error) {
      handleApiError(error)
    }
  }

  if (!token || !email) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6">
          <p className="text-center text-sm text-red-600">{resetPassword.invalidLink}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{resetPassword.title}</CardTitle>
        <CardDescription>
          {resetPassword.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{resetPassword.newPassword}</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder={resetPassword.newPasswordPlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password_confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{resetPassword.confirmPassword}</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder={resetPassword.confirmPasswordPlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                resetPassword.submitButton
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}