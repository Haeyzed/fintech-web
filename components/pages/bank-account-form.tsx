import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AdvancedCombobox } from '@/components/advanced-combobox'
import { Loader2 } from 'lucide-react'
import { ApiResponse } from '@/lib/api-client'
import { BANKS_API, CURRENCIES_API } from '@/lib/api-routes'
import { useApi } from '@/hooks/use-api'
import { Bank, Currency } from '@/types'
import { Checkbox } from '@/components/ui/checkbox'

const formSchema = z.object({
  id: z.string().optional(),
  account_number: z.string().nonempty('Account number is required'),
  bank_id: z.string().nonempty('Bank is required'),
  currency_id: z.string().nonempty('Currency is required'),
  account_type: z.string().nonempty('Account type is required'),
  is_primary: z.boolean().default(false),
})

export type FormValues = z.infer<typeof formSchema>

interface BankFormProps {
  onSubmit: (data: FormValues) => Promise<void>
  initialData?: Partial<FormValues>
}

interface AccountType {
  id: string
  name: string
}

// Mock account types
const mockAccountTypes: AccountType[] = [
  { id: 'savings', name: 'Savings' },
  { id: 'business', name: 'Business' },
]

export default function BankAccountForm({ onSubmit, initialData }: BankFormProps) {
  const { get } = useApi()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      account_number: '',
      bank_id: '',
      currency_id: '',
      account_type: '',
      is_primary: false,
    },
  })

  const fetchBanks = async (search: string, page: number): Promise<ApiResponse<Bank[]>> => {
    return get<Bank[]>(BANKS_API(), {
      search,
      page: page.toString(),
      per_page: '10',
    })
  }

  const mapBankOption = (item: Bank): { value: string; label: string } => {
    return {
      value: item.id,
      label: `${item.name}`,
    }
  }

  const fetchCurrencies = async (search: string, page: number): Promise<ApiResponse<Currency[]>> => {
    return get<Currency[]>(CURRENCIES_API(), {
      search,
      page: page.toString(),
      per_page: '10',
    })
  }

  const mapCurrencyOption = (item: Currency): { value: string; label: string } => {
    return {
      value: item.id,
      label: `${item.name} - ${item.symbol}`,
    }
  }

  const fetchItems = async (search: string, page: number): Promise<ApiResponse<AccountType[]>> => {
    // Mock API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const filteredItems = mockAccountTypes.filter(item =>
          item.name.toLowerCase().includes(search.toLowerCase())
        )
        const startIndex = (page - 1) * 10
        const endIndex = startIndex + 10
        const paginatedItems = filteredItems.slice(startIndex, endIndex)

        resolve({
          success: true,
          data: paginatedItems,
          meta: {
            current_page: page,
            from: startIndex + 1,
            last_page: Math.ceil(filteredItems.length / 10),
            per_page: 10,
            to: endIndex,
            total: filteredItems.length,
          }
        })
      }, 300) // Simulate network delay
    })
  }

  const mapOption = (item: AccountType): { value: string; label: string } => {
    return {
      value: item.id,
      label: item.name,
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="account_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bank_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank</FormLabel>
              <FormControl>
                <AdvancedCombobox<Bank>
                  placeholder="Select bank"
                  onChange={field.onChange}
                  value={field.value}
                  fetchItems={fetchBanks}
                  mapOption={mapBankOption}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currency_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <FormControl>
                <AdvancedCombobox<Currency>
                  placeholder="Select currency"
                  onChange={field.onChange}
                  value={field.value}
                  fetchItems={fetchCurrencies}
                  mapOption={mapCurrencyOption}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="account_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Type</FormLabel>
              <FormControl>
                <AdvancedCombobox<AccountType>
                  placeholder="Select account type"
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
          name="is_primary"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Primary Account
                </FormLabel>
              </div>
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
            initialData?.id ? 'Update Bank Account' : 'Add Bank Account'
          )}
        </Button>
      </form>
    </Form>
  )
}