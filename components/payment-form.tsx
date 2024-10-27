import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AdvancedCombobox } from '@/components/advanced-combobox'
import { Loader2 } from 'lucide-react'
import { useApi } from '@/hooks/use-api'

const formSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  payment_method_id: z.string().nonempty('Payment method is required'),
  description: z.string().optional(),
})

export type FormValues = z.infer<typeof formSchema>

interface PaymentFormProps {
  onSubmit: (data: FormValues) => Promise<void>
  initialData?: Partial<FormValues>
}

interface PaymentMethod {
  id: string
  type: string
}

export default function PaymentForm({ onSubmit, initialData }: PaymentFormProps) {
  const { get } = useApi()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  })

  const fetchItems = async (search: string, page: number) => {
    const response = await get<{ data: PaymentMethod[], meta: { current_page: number, last_page: number } }>('/payment-methods', {
      search,
      page: page.toString(),
      per_page: '10',
    })

    return {
      data: response.data.data,
      meta: response.data.meta
    }
  }

  const mapOption = (item: unknown): { value: string; label: string } => {
    const paymentMethod = item as PaymentMethod
    return {
      value: paymentMethod.id,
      label: paymentMethod.type,
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  onChange={e => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payment_method_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <FormControl>
                <AdvancedCombobox
                  placeholder="Select payment method"
                  onChange={field.onChange}
                  value={field.value}
                  fetchItems={fetchItems}
                  mapOption={mapOption}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Deposit'
          )}
        </Button>
      </form>
    </Form>
  )
}