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
import { ApiResponse } from '@/lib/api-client'
import { BANK_ACCOUNTS_API, PAYMENT_METHODS_API } from '@/lib/api-routes'
import { BankAccount } from '@/types/auth'

const formSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  payment_method_id: z.string().nonempty('Payment method is required'),
  bank_account_id: z.string().nonempty('Bank account is required'),
  description: z.string().optional(),
  reference: z.string().optional()
})

export type FormValues = z.infer<typeof formSchema>

interface TransactionFormProps {
  onSubmit: (data: FormValues) => Promise<void>
  initialData?: Partial<FormValues>
  type: 'deposit' | 'withdrawal'
}

interface PaymentMethod {
  id: string
  type: string
}

export default function TransactionForm({ onSubmit, initialData, type }: TransactionFormProps) {
  const { get } = useApi()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
  })

  const fetchPaymentMethods = async (search: string, page: number): Promise<ApiResponse<PaymentMethod[]>> => {
    return get<PaymentMethod[]>(PAYMENT_METHODS_API(), {
      search,
      page: page.toString(),
      per_page: '10'
    })
  }

  const fetchBankAccounts = async (search: string, page: number): Promise<ApiResponse<BankAccount[]>> => {
    return get<BankAccount[]>(BANK_ACCOUNTS_API(), {
      search,
      page: page.toString(),
      per_page: '10'
    })
  }

  const mapPaymentMethodOption = (item: PaymentMethod): { value: string; label: string } => {
    return {
      value: item.id,
      label: item.type
    }
  }

  const mapBankAccountOption = (item: BankAccount): { value: string; label: string } => {
    return {
      value: item.id,
      label: `${item.bank.name} - ${item.account_number} - ${item.currency.symbol} ${parseFloat(item.balance).toFixed(2)}`,
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
                <AdvancedCombobox<PaymentMethod>
                  placeholder="Select payment method"
                  onChange={field.onChange}
                  value={field.value}
                  fetchItems={fetchPaymentMethods}
                  mapOption={mapPaymentMethodOption}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bank_account_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Account</FormLabel>
              <FormControl>
                <AdvancedCombobox<BankAccount>
                  placeholder="Select bank account"
                  onChange={field.onChange}
                  value={field.value}
                  fetchItems={fetchBankAccounts}
                  mapOption={mapBankAccountOption}
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

        {type === 'withdrawal' && (
          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reference Code</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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
            type === 'deposit' ? 'Deposit' : 'Withdraw'
          )}
        </Button>
      </form>
    </Form>
  )
}