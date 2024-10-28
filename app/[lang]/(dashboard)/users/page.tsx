'use client'

import React, { useCallback, useState } from 'react'
import { AdvancedTable, Column } from '@/components/table/advanced-table'
import { ItemActions } from '@/components/table/item-actions'
import { Badge } from '@/components/ui/badge'
import { Eye, Trash2 } from 'lucide-react'
import { TableState, User } from '@/types/auth'
import { USERS_API, USERS_BULK_DELETE_API, USERS_BULK_RESTORE_API } from '@/lib/api-routes'
import { toast } from 'sonner'
import { useApi } from '@/hooks/use-api'
import { CustomAlertDialog } from '@/components/alert-dialog'
import { ResponsiveDrawer } from '@/components/responsive-drawer'
import { FormValues } from '@/components/transaction-form'
import { Button } from '@/components/ui/button'
import { useApiErrorHandler } from '@/hooks/use-api-error'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const columns: Column<User>[] = [
  {
    key: 'profile_image',
    label: 'Avatar',
    render: (item: User) => (
      <Avatar className="w-10 h-10">
        <AvatarImage src={item.profile_image} alt={`${item.name}'s profile`} />
        <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
      </Avatar>
    )
  },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'username', label: 'Username', sortable: true },
  { key: 'phone', label: 'Phone', sortable: true },
  {
    key: 'email_verified_at',
    label: 'Email Verified',
    sortable: true,
    render: (item: User) => item.email_verified_at ? 'Yes' : 'No'
  },
  {
    key: 'last_login_at',
    label: 'Last Login',
    sortable: true,
    render: (item: User) => item.last_login_at ? new Date(item.last_login_at).toLocaleString() : 'N/A'
  },
  {
    key: 'created_at',
    label: 'Created At',
    sortable: true,
    render: (item: User) => new Date(item.created_at).toLocaleDateString()
  }
]

export default function UsersPage() {
  const { get, post, del } = useApi()
  const [totalUsers, setTotalUsers] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false)
  const { handleApiError } = useApiErrorHandler()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [pageTitle, setPageTitle] = useState('Users')
  const [isTrashed, setIsTrashed] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false)
  const [data, setData] = useState<User | null>(null)
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

  const fetchUsers = useCallback(async (tableState: TableState) => {
    setIsLoading(true)
    try {
      const response = await get(USERS_API(), {
        page: tableState.page.toString(),
        per_page: tableState.perPage.toString(),
        search: tableState.search,
        sort_by: tableState.sortColumn ?? 'created_by',
        sort_direction: tableState.sortDirection ?? 'desc',
        is_trashed: tableState.isTrashed.toString(),
        start_date: tableState.dateRange.startDate || '',
        end_date: tableState.dateRange.endDate || ''
      })
      setUsers(response.data as User[])
      setTotalUsers(response.meta.total)
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }, [get, handleApiError])

  const itemActions = useCallback(
    (item: User) => {
      const handleViewDetails = () => {
        setData(item)
        setIsViewDrawerOpen(true)
      }

      const handleDelete = () => {
        setAlertDialog({
          isOpen: true,
          title: 'Delete User',
          description: 'Are you sure you want to delete this user ' + `${item.name}` + '?',
          onConfirm: async () => {
            try {
              const response = await del(USERS_API(item.id))
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
            { label: 'Delete', onClick: handleDelete, icon: Trash2 }
          ]}
        />
      )
    },
    [del, handleApiError]
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCreate = async (data: FormValues) => {
    try {
      const response = await post<User>(USERS_API(), data)
      if (response.success) {
        toast.success('Success', {
          description: response.message
        })
      } else {
        toast.error('Error', {
          description: 'Failed to initiate user. Please try again.'
        })
      }
      setIsCreateDrawerOpen(false)
      // Refresh the users list
      await fetchUsers({
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
      title: 'Delete Selected Users',
      description: `Are you sure you want to delete ${selectedIds.length} selected users?`,
      onConfirm: async () => {
        try {
          const response = await post(USERS_BULK_DELETE_API, { sqids: selectedIds })
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
      title: 'Restore Selected Users',
      description: `Are you sure you want to restore ${selectedIds.length} selected users?`,
      onConfirm: async () => {
        try {
          const response = await post(USERS_BULK_RESTORE_API, { sqids: selectedIds })
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
        <AdvancedTable<User>
          columns={columns}
          data={users}
          itemActions={itemActions}
          fallbackSortColumn="created_at"
          fallbackSortDirection="desc"
          onSelectionChange={setSelectedIds}
          onFetchData={fetchUsers}
          isLoading={isLoading}
          totalItems={totalUsers}
          onTrashSwitchChange={(isTrashed) => {
            setPageTitle(isTrashed ? 'Trashed Users' : 'Users')
            setIsTrashed(isTrashed)
          }}
          customButtons={
            <>
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
        {/*<ResponsiveDrawer*/}
        {/*  open={isCreateDrawerOpen}*/}
        {/*  onOpenChange={setIsCreateDrawerOpen}*/}
        {/*  title="Create User"*/}
        {/*  description="Fill in the details to create a new user."*/}
        {/*  className="sm:max-w-[425px] bg-card"*/}
        {/*>*/}
          {/*<TransactionForm onSubmit={handleCreate} />*/}
        {/*</ResponsiveDrawer>*/}
        <ResponsiveDrawer
          open={isViewDrawerOpen}
          onOpenChange={setIsViewDrawerOpen}
          title="User Details"
          description={`Details for user ${data?.name}`}
          className="sm:max-w-[425px] bg-card"
        >
          {data && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={data.profile_image} alt={`${data.name}'s profile`} />
                  <AvatarFallback>{data.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{data.name}</h3>
                  <p className="text-sm text-muted-foreground">{data.email}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold">Username</h4>
                <p>{data.username}</p>
              </div>
              <div>
                <h4 className="font-semibold">Phone</h4>
                <p>{data.phone}</p>
              </div>
              <div>
                <h4 className="font-semibold">Balance</h4>
                <p>${parseFloat(data.balance).toFixed(2)}</p>
              </div>
              <div>
                <h4 className="font-semibold">Email Verified</h4>
                <Badge variant={data.email_verified_at ? 'success' : 'destructive'}>
                  {data.email_verified_at ? 'Verified' : 'Not Verified'}
                </Badge>
              </div>
              <div>
                <h4 className="font-semibold">Last Login</h4>
                <p>{data.last_login_at ? new Date(data.last_login_at).toLocaleString() : 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-semibold">Current Login</h4>
                <p>{data.current_login_at ? new Date(data.current_login_at).toLocaleString() : 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-semibold">Login Count</h4>
                <p>{data.login_count}</p>
              </div>
              <div>
                <h4 className="font-semibold">Two-Factor Authentication</h4>
                <Badge variant={data.google2fa_enabled ? 'success' : 'default'}>
                  {data.google2fa_enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div>
                <h4 className="font-semibold">Created At</h4>
                <p>{new Date(data.created_at).toLocaleString()}</p>
              </div>
              <div>
                <h4 className="font-semibold">Updated At</h4>
                <p>{new Date(data.updated_at).toLocaleString()}</p>
              </div>
            </div>
          )}
        </ResponsiveDrawer>
      </div>
    </div>
  )
}