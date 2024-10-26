'use client'

import React, { useCallback } from 'react'
import { AdvancedTable, Column } from '@/components/table/advanced-table'
import { User } from '@/types/auth'
import { Edit, RefreshCw, Shield, Trash, Trash2 } from "lucide-react"
import { ItemActions } from "@/components/table/item-actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
    {key: 'name', label: 'Name', sortable: true},
    {key: 'email', label: 'Email', sortable: true},
    {key: 'username', label: 'Username', sortable: true},
    {key: 'phone', label: 'Phone', sortable: true},
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
    const itemActions = useCallback(
        (item: User) => {
            const handleEditUser = () => {
                // Implement edit user logic here
                console.log('Edit user:', item.id);
            };

            const handleDelete = () => {
                // Implement delete logic here
                console.log('Delete user:', item.id);
            };

            const handleRestore = () => {
                // Implement restore logic here
                console.log('Restore user:', item.id);
            };

            const handleForceDelete = () => {
                // Implement force delete logic here
                console.log('Force delete user:', item.id);
            };

            const handleBlockIp = () => {
                // Implement block IP logic here
                console.log('Block IP for user:', item.id);
            };

            return (
                <ItemActions
                    actions={[
                        {label: 'Edit', onClick: handleEditUser, icon: Edit},
                        {label: 'Delete', onClick: handleDelete, icon: Trash},
                        {label: 'Restore', onClick: handleRestore, icon: RefreshCw},
                        {label: 'Force Delete', onClick: handleForceDelete, icon: Trash2},
                        {label: 'Block IP', onClick: handleBlockIp, icon: Shield},
                    ]}
                />
            );
        },
        []
    );

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
                <h1 className="text-2xl font-bold mb-4">Users</h1>
                <AdvancedTable<User>
                    columns={columns}
                    endpoint="/users"
                    itemActions={itemActions}
                    fallbackSortColumn="created_at"
                    fallbackSortDirection="desc"/>
            </div>
        </div>
    )
}