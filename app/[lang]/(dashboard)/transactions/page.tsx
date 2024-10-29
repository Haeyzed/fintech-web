'use client'

import React, { useCallback, useState } from 'react'
import { AdvancedTable, Column } from '@/components/table/advanced-table'
import { ItemActions } from '@/components/table/item-actions'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Eye, RefreshCw, Trash2 } from 'lucide-react'
import { TableState, Transaction } from '@/types'
import { TRANSACTIONS_API, TRANSACTIONS_BULK_DELETE_API, TRANSACTIONS_BULK_RESTORE_API } from '@/lib/api-routes'
import { toast } from 'sonner'
import { useApi } from '@/hooks/use-api'
import { CustomAlertDialog } from '@/components/alert-dialog'
import { ResponsiveDrawer } from '@/components/responsive-drawer'
import TransactionForm, { FormValues } from '@/pages/transaction-form'
import { Button } from '@/components/ui/button'
import { useApiErrorHandler } from '@/hooks/use-api-error'

const columns: Column<Transaction>[] = [
  { key: 'reference', label: 'Reference', sortable: true },
  {
    key: 'type',
    label: 'Type',
    sortable: true,
    render: (transaction: Transaction) => (
      <Badge variant={transaction.type === 'deposit' ? 'success' : 'destructive'}>
        {transaction.type}
      </Badge>
    )
  },
  {
    key: 'amount',
    label: 'Amount',
    sortable: true,
    render: (item: Transaction) => `${item.bank_account.currency.symbol} ${parseFloat(item.amount).toFixed(2)}`
  },
  {
    key: 'start_balance',
    label: 'Start Balance',
    sortable: true,
    render: (item: Transaction) => `${item.bank_account.currency.symbol} ${parseFloat(item.start_balance).toFixed(2)}`
  },
  {
    key: 'end_balance',
    label: 'End Balance',
    sortable: true,
    render: (item: Transaction) => `${item.bank_account.currency.symbol} ${parseFloat(item.end_balance).toFixed(2)}`
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (item: Transaction) => (
      <Badge variant={
        item.status === 'completed' ? 'success' :
          item.status === 'failed' ? 'destructive' :
            'default'
      }>
        {item.status}
      </Badge>
    )
  },
  { key: 'description', label: 'Description' },
  {
    key: 'payment_method.type',
    label: 'Payment Method',
    sortable: true,
    render: (item: Transaction) => item.payment_method.type
  },
  {
    key: 'bank_account.bank.name',
    label: 'Bank Name',
    sortable: true,
    render: (item: Transaction) => item.bank_account.bank.name
  },
  {
    key: 'bank_account.account_number',
    label: 'Account Number',
    sortable: true,
    render: (item: Transaction) => item.bank_account.account_number
  },
  {
    key: 'bank_account.account_type',
    label: 'Account Type',
    sortable: true,
    render: (item: Transaction) => item.bank_account.account_type
  },
  {
    key: 'created_at',
    label: 'Created At',
    sortable: true,
    render: (item: Transaction) => new Date(item.created_at).toLocaleString()
  },
  {
    key: 'user.name',
    label: 'User',
    sortable: true,
    render: (item: Transaction) => item.user.name
  }
]

export default function TransactionsPage() {
  const { get, post, del } = useApi()
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false)
  const [isDepositDrawerOpen, setIsDepositDrawerOpen] = useState(false)
  const [isWithdrawDrawerOpen, setIsWithdrawDrawerOpen] = useState(false)
  const { handleApiError } = useApiErrorHandler()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [pageTitle, setPageTitle] = useState('Transactions')
  const [isTrashed, setIsTrashed] = useState(false)
  const [data, setData] = useState<Transaction | null>(null)
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    confirmText: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {
    },
    confirmText: ''
  })

  const fetchTransactions = useCallback(async (tableState: TableState) => {
    setIsLoading(true)
    try {
      const response = await get(TRANSACTIONS_API(), {
        page: tableState.page.toString(),
        per_page: tableState.perPage.toString(),
        search: tableState.search,
        sort_by: tableState.sortColumn ?? 'created_by',
        sort_direction: tableState.sortDirection ?? 'desc',
        is_trashed: tableState.isTrashed.toString(),
        start_date: tableState.dateRange.startDate || '',
        end_date: tableState.dateRange.endDate || ''
      })
      setTransactions(response.data as Transaction[])
      setTotalTransactions(response.meta.total)
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }, [get, handleApiError])

  const verifyTransaction = useCallback(async (transaction: Transaction) => {
    if (transaction.status !== 'initiated' && transaction.status !== 'pending') {
      toast.error('Error', {
        description: 'This transaction cannot be verified.'
      })
      return
    }

    let verifyUrl = ''
    if (transaction.payment_method.type === 'paystack') {
      verifyUrl = '/paystack/payment/verify'
    } else {
      toast.error('Error', {
        description: 'Verification not supported for this payment method.'
      })
      return
    }

    try {
      const response = await post(verifyUrl, { reference: transaction.reference })
      toast.success('Success', {
        description: response.message || 'Transaction verified successfully.'
      })
      // Refresh the transactions list after verification
      await fetchTransactions({
        page: 1,
        perPage: 10,
        search: '',
        sortColumn: 'created_at',
        sortDirection: 'desc',
        isTrashed: false,
        dateRange: { startDate: null, endDate: null }
      })
    } catch (error) {
      handleApiError(error)
    }
  }, [post, fetchTransactions, handleApiError])


  const itemActions = useCallback(
    (item: Transaction) => {
      const handleViewDetails = () => {
        setData(item)
        setIsViewDrawerOpen(true)
      }

      const handleVerify = () => {
        verifyTransaction(item).then(r => console.log(r))
      }

      const handleDelete = () => {
        setAlertDialog({
          isOpen: true,
          title: 'Delete Transaction',
          description: 'Are you sure you want to delete this transaction ' + `${item.reference}` + '?',
          onConfirm: async () => {
            try {
              const response = await del(TRANSACTIONS_API(item.id))
              toast.success('Success', {
                description: response.message
              })
            } catch (error) {
              handleApiError(error)
            }
          },
          confirmText: 'Delete'
        })
      }

      return (
        <ItemActions
          actions={[
            { label: 'View Details', onClick: handleViewDetails, icon: Eye },
            {
              label: 'Verify',
              onClick: handleVerify,
              icon: RefreshCw,
              disabled: item.status !== 'initiated' && item.status !== 'pending'
            },
            { label: 'Delete', onClick: handleDelete, icon: Trash2 }
          ]}
        />
      )
    },
    [del, handleApiError, verifyTransaction]
  )

  const handlePaystackDeposit = async (data: FormValues) => {
    try {
      const response = await post<{ paystack: { authorization_url: string } }>('/paystack/payment/initialize', data)
      if (response.success && response.data.paystack.authorization_url) {
        window.open(response.data.paystack.authorization_url, '_blank')
        toast.success('Success', {
          description: response.message
        })
      } else {
        toast.error('Error', {
          description: 'Failed to initiate transaction. Please try again.'
        })
      }
      setIsDepositDrawerOpen(false)
      await fetchTransactions({
        page: 1,
        perPage: 10,
        search: '',
        sortColumn: 'created_at',
        sortDirection: 'desc',
        isTrashed: false,
        dateRange: { startDate: null, endDate: null }
      })
    } catch (error) {
      handleApiError(error)
    }
  }

  const handlePaystackWithdrawal = async (data: FormValues) => {
    try {
      const response = await post<{ message: string }>('/paystack/withdrawal/initialize', data)
      toast.success('Success', {
        description: response.message || 'Withdrawal initiated successfully.'
      })
      setIsWithdrawDrawerOpen(false)
      await fetchTransactions({
        page: 1,
        perPage: 10,
        search: '',
        sortColumn: 'created_at',
        sortDirection: 'desc',
        isTrashed: false,
        dateRange: { startDate: null, endDate: null }
      })
    } catch (error) {
      handleApiError(error)
    }
  }

  const handleBulkDelete = async () => {
    setAlertDialog({
      isOpen: true,
      title: 'Delete Selected Transactions',
      description: `Are you sure you want to delete ${selectedIds.length} selected transactions?`,
      onConfirm: async () => {
        try {
          const response = await post(TRANSACTIONS_BULK_DELETE_API, { sqids: selectedIds })
          toast.success('Success', {
            description: response.message
          })
          setSelectedIds([])
        } catch (error) {
          handleApiError(error)
        }
      },
      confirmText: 'Delete'
    })
  }

  const handleBulkRestore = async () => {
    setAlertDialog({
      isOpen: true,
      title: 'Restore Selected Transactions',
      description: `Are you sure you want to restore ${selectedIds.length} selected transactions?`,
      onConfirm: async () => {
        try {
          const response = await post(TRANSACTIONS_BULK_RESTORE_API, { sqids: selectedIds })
          toast.success('Success', {
            description: response.message
          })
          setSelectedIds([])
        } catch (error) {
          handleApiError(error)
        }
      },
      confirmText: 'Restore'
    })
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <h1 className="text-2xl font-bold mb-4">{pageTitle}</h1>
        <AdvancedTable<Transaction>
          columns={columns}
          data={transactions}
          itemActions={itemActions}
          fallbackSortColumn="created_at"
          fallbackSortDirection="desc"
          onSelectionChange={setSelectedIds}
          onFetchData={fetchTransactions}
          isLoading={isLoading}
          totalItems={totalTransactions}
          onTrashSwitchChange={(isTrashed) => {
            setPageTitle(isTrashed ? 'Trashed Transactions' : 'Transactions')
            setIsTrashed(isTrashed)
          }}
          customButtons={
            <>
              <div className="flex space-x-2">
                <Button onClick={() => setIsDepositDrawerOpen(true)}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Deposit
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => setIsWithdrawDrawerOpen(true)}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Withdraw
                </Button>
              </div>
              {!isTrashed && selectedIds.length > 0 && (
                <Button variant="destructive" onClick={handleBulkDelete}>Delete Selected</Button>
              )}
              {isTrashed && selectedIds.length > 0 && (
                <Button onClick={handleBulkRestore}>Restore Selected</Button>
              )}
            </>
          }
        />
        <CustomAlertDialog
          isOpen={alertDialog.isOpen}
          onClose={() => setAlertDialog(prev => ({ ...prev, isOpen: false }))}
          title={alertDialog.title}
          description={alertDialog.description}
          onConfirm={alertDialog.onConfirm}
          confirmText={alertDialog.confirmText}
        />
        <ResponsiveDrawer
          open={isDepositDrawerOpen}
          onOpenChange={setIsDepositDrawerOpen}
          title="Deposit"
          description="Fill in the details to deposit."
          className="sm:max-w-[425px] bg-card"
        >
          <TransactionForm onSubmit={handlePaystackDeposit} type="deposit" />
        </ResponsiveDrawer>
        <ResponsiveDrawer
          open={isWithdrawDrawerOpen}
          onOpenChange={setIsWithdrawDrawerOpen}
          title="Withdraw"
          description="Fill in the details to withdraw."
          className="sm:max-w-[425px] bg-card"
        >
          <TransactionForm onSubmit={handlePaystackWithdrawal} type="withdrawal" />
        </ResponsiveDrawer>
        <ResponsiveDrawer
          open={isViewDrawerOpen}
          onOpenChange={setIsViewDrawerOpen}
          title="Transaction Details"
          description={`Details for transaction ${data?.reference}`}
          className="sm:max-w-[425px] bg-card"
        >
          {data && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Reference</h3>
                <p>{data.reference}</p>
              </div>
              <div>
                <h3 className="font-semibold">Type</h3>
                <Badge variant={data.type === 'deposit' ? 'success' : 'destructive'}>
                  {data.type}
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold">Amount</h3>
                <p>{parseFloat(data.amount)}</p>
              </div>
              <div>
                <h3 className="font-semibold">Status</h3>
                <Badge variant={
                  data.status === 'completed' ? 'success' :
                    data.status === 'failed' ? 'destructive' :
                      'default'
                }>
                  {data.status}
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold">Description</h3>
                <p>{data.description}</p>
              </div>
              <div>
                <h3 className="font-semibold">Created At</h3>
                <p>{new Date(data.created_at).toLocaleString()}</p>
              </div>
              <div>
                <h3 className="font-semibold">User</h3>
                <p>{data.user.name}</p>
              </div>
            </div>
          )}
        </ResponsiveDrawer>
      </div>
    </div>
  )
}