'use client'

import React, { useCallback, useState } from 'react'
import { AdvancedTable, Column } from '@/components/table/advanced-table'
import { ItemActions } from '@/components/table/item-actions'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Edit, Eye, Trash2 } from 'lucide-react'
import { BankAccount, TableState } from '@/types'
import { BANK_ACCOUNTS_API, BANK_ACCOUNTS_BULK_DELETE_API, BANK_ACCOUNTS_BULK_RESTORE_API } from '@/lib/api-routes'
import { toast } from 'sonner'
import { useApi } from '@/hooks/use-api'
import { CustomAlertDialog } from '@/components/alert-dialog'
import { ResponsiveDrawer } from '@/components/responsive-drawer'
import { Button } from '@/components/ui/button'
import { useApiErrorHandler } from '@/hooks/use-api-error'
import BankAccountForm, { FormValues as BankFormValues } from '@/pages/bank-account-form'

const columns: Column<BankAccount>[] = [
  { key: 'account_number', label: 'Account Number', sortable: true },
  { key: 'bank.name', label: 'Bank Name', sortable: true },
  {
    key: 'account_type',
    label: 'Account Type',
    sortable: true,
    render: (account: BankAccount) => (
      <Badge variant="outline">{account.account_type}</Badge>
    )
  },
  {
    key: 'currency.code',
    label: 'Currency Code',
    sortable: true,
    render: (item: BankAccount) => item.currency.code
  },
  {
    key: 'currency.symbol',
    label: 'Currency Symbol',
    sortable: true,
    render: (item: BankAccount) => item.currency.symbol
  },
  {
    key: 'balance',
    label: 'Balance',
    sortable: true,
    render: (account: BankAccount) => `${account.currency.symbol} ${parseFloat(account.balance).toFixed(2)}`
  },
  {
    key: 'is_primary',
    label: 'Primary',
    sortable: true,
    render: (account: BankAccount) => (
      <Badge variant={account.is_primary ? 'success' : 'default'}>
        {account.is_primary ? 'Yes' : 'No'}
      </Badge>
    )
  },
  {
    key: 'created_at',
    label: 'Created At',
    sortable: true,
    render: (account: BankAccount) => new Date(account.created_at).toLocaleString()
  },
  {
    key: 'user.name',
    label: 'Account Holder',
    sortable: true,
    render: (account: BankAccount) => account.user.name
  }
]

export default function BankAccountPage() {
  const { get, post, put, del } = useApi()
  const [totalAccounts, setTotalAccounts] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false)
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
  const { handleApiError } = useApiErrorHandler()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [pageTitle, setPageTitle] = useState('Bank Accounts')
  const [isTrashed, setIsTrashed] = useState(false)
  const [data, setData] = useState<BankAccount | null>(null)
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
    onConfirm: () => {},
    confirmText: ''
  })

  const fetchAccounts = useCallback(async (tableState: TableState) => {
    setIsLoading(true)
    try {
      const response = await get(BANK_ACCOUNTS_API(), {
        page: tableState.page.toString(),
        per_page: tableState.perPage.toString(),
        search: tableState.search,
        sort_by: tableState.sortColumn ?? 'created_at',
        sort_direction: tableState.sortDirection ?? 'desc',
        is_trashed: tableState.isTrashed.toString(),
        start_date: tableState.dateRange.startDate || '',
        end_date: tableState.dateRange.endDate || ''
      })
      setAccounts(response.data as BankAccount[])
      setTotalAccounts(response.meta.total)
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }, [get, handleApiError])

  const itemActions = useCallback(
    (item: BankAccount) => {
      const handleViewDetails = () => {
        setData(item)
        setIsViewDrawerOpen(true)
      }

      const handleEdit = () => {
        setData(item)
        setIsEditDrawerOpen(true)
      }

      const handleDelete = () => {
        setAlertDialog({
          isOpen: true,
          title: 'Delete Bank Account',
          description: `Are you sure you want to delete the bank account ${item.account_number}?`,
          onConfirm: async () => {
            try {
              const response = await del(BANK_ACCOUNTS_API(item.id))
              toast.success('Success', {
                description: response.message
              })
              fetchAccounts({
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
          },
          confirmText: 'Delete'
        })
      }

      return (
        <ItemActions
          actions={[
            { label: 'View Details', onClick: handleViewDetails, icon: Eye },
            { label: 'Edit', onClick: handleEdit, icon: Edit },
            { label: 'Delete', onClick: handleDelete, icon: Trash2 }
          ]}
        />
      )
    },
    [del, handleApiError, fetchAccounts]
  )

  const handleBulkDelete = async () => {
    setAlertDialog({
      isOpen: true,
      title: 'Delete Selected Bank Accounts',
      description: `Are you sure you want to delete ${selectedIds.length} selected bank accounts?`,
      onConfirm: async () => {
        try {
          const response = await post(BANK_ACCOUNTS_BULK_DELETE_API, { sqids: selectedIds })
          toast.success('Success', {
            description: response.message
          })
          setSelectedIds([])
          fetchAccounts({
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
      },
      confirmText: 'Delete'
    })
  }

  const handleBulkRestore = async () => {
    setAlertDialog({
      isOpen: true,
      title: 'Restore Selected Bank Accounts',
      description: `Are you sure you want to restore ${selectedIds.length} selected bank accounts?`,
      onConfirm: async () => {
        try {
          const response = await post(BANK_ACCOUNTS_BULK_RESTORE_API, { sqids: selectedIds })
          toast.success('Success', {
            description: response.message
          })
          setSelectedIds([])
          fetchAccounts({
            page: 1,
            perPage: 10,
            search: '',
            sortColumn: 'created_at',
            sortDirection: 'desc',
            isTrashed: true,
            dateRange: { startDate: null, endDate: null }
          })
        } catch (error) {
          handleApiError(error)
        }
      },
      confirmText: 'Restore'
    })
  }

  const handleAddAccount = async (data: BankFormValues) => {
    try {
      const response = await post(BANK_ACCOUNTS_API(), data)
      toast.success('Success', {
        description: response.message
      })
      setIsAddDrawerOpen(false)
      fetchAccounts({
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

  const handleUpdateAccount = async (data: BankFormValues) => {
    try {
      const response = await put(BANK_ACCOUNTS_API(data.id), data)
      toast.success('Success', {
        description: response.message
      })
      setIsEditDrawerOpen(false)
      fetchAccounts({
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

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        <h1 className="text-2xl font-bold mb-4">{pageTitle}</h1>
        <AdvancedTable<BankAccount>
          columns={columns}
          data={accounts}
          itemActions={itemActions}
          fallbackSortColumn="created_at"
          fallbackSortDirection="desc"
          onSelectionChange={setSelectedIds}
          onFetchData={fetchAccounts}
          isLoading={isLoading}
          totalItems={totalAccounts}
          onTrashSwitchChange={(isTrashed) => {
            setPageTitle(isTrashed ? 'Trashed Bank Accounts' : 'Bank Accounts')

            setIsTrashed(isTrashed)
          }}
          customButtons={
            <>
              <div className="flex space-x-2">
                <Button onClick={() => setIsAddDrawerOpen(true)}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Add New Account
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
          open={isViewDrawerOpen}
          onOpenChange={setIsViewDrawerOpen}
          title="Bank Account Details"
          description={`Details for account ${data?.account_number}`}
          className="sm:max-w-[425px] bg-card"
        >
          {data && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Account Number</h3>
                <p>{data.account_number}</p>
              </div>
              <div>
                <h3 className="font-semibold">Bank Name</h3>
                <p>{data.bank.name}</p>
              </div>
              <div>
                <h3 className="font-semibold">Account Type</h3>
                <Badge variant="outline">{data.account_type}</Badge>
              </div>
              <div>
                <h3 className="font-semibold">Balance</h3>
                <p>${parseFloat(data.balance).toFixed(2)}</p>
              </div>
              <div>
                <h3 className="font-semibold">Primary Account</h3>
                <Badge variant={data.is_primary ? 'success' : 'default'}>
                  {data.is_primary ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold">Created At</h3>
                <p>{new Date(data.created_at).toLocaleString()}</p>
              </div>
              <div>
                <h3 className="font-semibold">Account Holder</h3>
                <p>{data.user.name}</p>
              </div>
              <div>
                <h3 className="font-semibold">Email</h3>
                <p>{data.user.email}</p>
              </div>
              <div>
                <h3 className="font-semibold">Phone</h3>
                <p>{data.user.phone}</p>
              </div>
            </div>
          )}
        </ResponsiveDrawer>
        <ResponsiveDrawer
          open={isAddDrawerOpen}
          onOpenChange={setIsAddDrawerOpen}
          title="Add New Bank Account"
          description="Fill in the details to add a new bank account."
          className="sm:max-w-[425px] bg-card"
        >
          <BankAccountForm onSubmit={handleAddAccount} />
        </ResponsiveDrawer>
        <ResponsiveDrawer
          open={isEditDrawerOpen}
          onOpenChange={setIsEditDrawerOpen}
          title="Edit Bank Account"
          description={`Edit details for account ${data?.account_number}`}
          className="sm:max-w-[425px] bg-card"
        >
          {data && <BankAccountForm onSubmit={handleUpdateAccount} initialData={data} />}
        </ResponsiveDrawer>
      </div>
    </div>
  )
}