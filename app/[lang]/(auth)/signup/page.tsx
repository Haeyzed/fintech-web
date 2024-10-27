'use client'

import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { toast } from 'sonner'
import Link from 'next/link'
import { useApi } from '@/hooks/use-api'
import { useDictionary } from '@/app/[lang]/providers'
import { isValidPhoneNumber } from 'react-phone-number-input'
import { PhoneInput } from '@/components/phone-input'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useFcmToken } from '@/hooks/use-fcm-token'
import { useApiErrorHandler } from '@/hooks/use-api-error'

export default function SignUpPage() {
  const router = useRouter()
  const { handleApiError } = useApiErrorHandler()
  const { signup, formValidation } = useDictionary()
  const { token } = useFcmToken()

  const formSchema = z.object({
    name: z.string().min(1, { message: formValidation.nameRequired }),
    email: z.string().email({ message: formValidation.emailRequired }),
    username: z.string().min(3, { message: formValidation.usernameMinLength }),
    phone: z.string().refine(isValidPhoneNumber, { message: 'Invalid phone number' }),
    password: z.string().min(8, { message: formValidation.passwordMinLength }),
    password_confirmation: z.string().min(8, { message: formValidation.passwordMinLength }),
    profile_image: z.instanceof(File).optional().refine(
      (file) => !file || (file.size <= 5 * 1024 * 1024 && ['image/jpeg', 'image/png'].includes(file.type)),
      {
        message: 'Profile image must be a JPEG or PNG file under 5MB'
      }
    )
  }).refine((data) => data.password === data.password_confirmation, {
    message: formValidation.passwordMismatch,
    path: ['password_confirmation']
  })

  type FormValues = z.infer<typeof formSchema>;

  const { post, isLoading } = useApi()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      username: '',
      phone: '',
      password: '',
      password_confirmation: ''
    }
  })

  async function onSubmit(values: FormValues) {
    try {
      const formData = new FormData()
      Object.entries(values).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value)
        } else if (typeof value === 'string') {
          formData.append(key, value)
        }
      })
      formData.append('device_token', token ?? '')
      const response = await post('/auth/register', formData)
      toast.success('Success', {
        description: response.message || 'Registration successful.'
      })
      router.push('/login')
    } catch (error) {
      handleApiError(error)
    }
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{signup.title}</CardTitle>
        <CardDescription>{signup.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="profile_image"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>{signup.profileImage}</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-4">
                      {value && (
                        <Image
                          src={URL.createObjectURL(value)}
                          alt="Profile preview"
                          width={64}
                          height={64}
                          className="rounded-full object-cover"
                        />
                      )}
                      <Input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) onChange(file)
                        }}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{signup.name}</FormLabel>
                    <FormControl>
                      <Input placeholder={signup.namePlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{signup.email}</FormLabel>
                    <FormControl>
                      <Input placeholder={signup.emailPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{signup.username}</FormLabel>
                  <FormControl>
                    <Input placeholder={signup.usernamePlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{signup.phone}</FormLabel>
                  <FormControl>
                    <PhoneInput placeholder={signup.phonePlaceholder} {...field} />
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
                  <FormLabel>{signup.password}</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder={signup.passwordPlaceholder} {...field} />
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
                  <FormLabel>{signup.confirmPassword}</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder={signup.confirmPasswordPlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : signup.signupButton}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          {signup.haveAccount}{' '}
          <Link href={'/login'} className="underline">
            {signup.login}
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}