import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {Skeleton} from '@/components/ui/skeleton'
import {ArrowDownIcon, ArrowUpIcon, CaretSortIcon, EyeNoneIcon, MixerHorizontalIcon} from '@radix-ui/react-icons'
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Checkbox} from "@/components/ui/checkbox"
import {Switch} from "@/components/ui/switch"
import {ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight} from 'lucide-react'
import {useApi} from '@/hooks/use-api'
import {useDebounce} from '@/hooks/use-debounce'
import {toast} from "sonner"
import {Label} from "@/components/ui/label"
import {DateRangePicker} from "@/components/date-range-picker"
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area"
import {ErrorResponse} from "@/types/auth";

export interface Column<T> {
    key: keyof T
    label: string
    sortable?: boolean
    render?: (item: T) => React.ReactNode
}

export interface TableState<T> {
    search: string
    page: number
    perPage: number
    sortColumn: keyof T | null
    sortDirection: 'asc' | 'desc' | null
    includeTrashed: boolean
    dateRange: { startDate: string; endDate: string }
}

interface AdvancedTableProps<T> {
    columns: Column<T>[]
    endpoint: string
    itemActions: (item: T, selectedItems: string[]) => React.ReactNode
    fallbackSortColumn?: keyof T
    fallbackSortDirection?: 'asc' | 'desc'
    onSearchChange?: (search: string) => void
    onSelectionChange?: (selectedItems: string[]) => void
    onTrashSwitchChange?: (includeTrashed: boolean) => void
    enableToast?: boolean
    enableSearch?: boolean
    enableTrashSwitching?: boolean
    enableColumnVisibility?: boolean
    enableDateRange?: boolean
    enablePerPage?: boolean
    enableSort?: boolean
}

export function AdvancedTable<T extends { id: string | number }>({
                                                                     columns,
                                                                     endpoint,
                                                                     itemActions,
                                                                     fallbackSortColumn,
                                                                     fallbackSortDirection = 'asc',
                                                                     onSearchChange,
                                                                     onSelectionChange,
                                                                     onTrashSwitchChange,
                                                                     enableToast = true,
                                                                     enableSearch = true,
                                                                     enableTrashSwitching = true,
                                                                     enableColumnVisibility = true,
                                                                     enableDateRange = true,
                                                                     enablePerPage = true,
                                                                     enableSort = true,
                                                                 }: AdvancedTableProps<T>) {
    const [tableState, setTableState] = useState<TableState<T>>({
        search: '',
        page: 1,
        perPage: 10,
        sortColumn: fallbackSortColumn || null,
        sortDirection: fallbackSortDirection,
        includeTrashed: false,
        dateRange: {startDate: '', endDate: ''}
    })
    const [selectedItems, setSelectedItems] = useState<string[]>([])
    const [visibleColumns, setVisibleColumns] = useState<Set<keyof T>>(
        new Set(columns.map(col => col.key))
    )

    const debouncedSearch = useDebounce(tableState.search, 300)

    const {data, isLoading, get} = useApi<T>(endpoint)

    const queryParams = useMemo(() => ({
        page: tableState.page.toString(),
        per_page: tableState.perPage.toString(),
        search: debouncedSearch,
        order_by: (tableState.sortColumn as string) || (fallbackSortColumn as string),
        order_direction: tableState.sortDirection || fallbackSortDirection,
        trashed: tableState.includeTrashed.toString(),
        start_date: tableState.dateRange.startDate,
        end_date: tableState.dateRange.endDate
    }), [tableState, debouncedSearch, fallbackSortColumn, fallbackSortDirection])

    const fetchData = useCallback(async () => {
        try {
            const response = await get(queryParams)
            if (enableToast && response.message) {
                toast('Success', {
                    description: response.message
                })
            }
        } catch (error) {
            const errorResponse = error as ErrorResponse
            if (enableToast) {
                toast.error('Error', {
                    description: errorResponse.message || 'An error occurred during login.',
                })
            }
        }
    }, [get, queryParams, enableToast])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const updateTableState = useCallback((newState: Partial<TableState<T>>) => {
        setTableState(prevState => {
            const updatedState = {...prevState, ...newState}
            if (onSearchChange && 'search' in newState) {
                onSearchChange(updatedState.search)
            }
            return updatedState
        })
    }, [onSearchChange])

    const handleSelectAll = useCallback(
        (checked: boolean) => {
            const newSelectedItems = checked ? (data?.data.map(item => item.id) || []) : []
            setSelectedItems(newSelectedItems)
            onSelectionChange?.(newSelectedItems)
        },
        [data, onSelectionChange]
    )

    const handleSelectItem = useCallback(
        (id: string, checked: boolean) => {
            setSelectedItems(prev => {
                const newSelectedItems = checked
                    ? [...prev, id]
                    : prev.filter(item => item !== id)
                onSelectionChange?.(newSelectedItems)
                return newSelectedItems
            })
        },
        [onSelectionChange]
    )

    const toggleColumnVisibility = useCallback((column: keyof T) => {
        setVisibleColumns(prev => {
            const newSet = new Set(prev)
            if (newSet.has(column)) {
                newSet.delete(column)
            } else {
                newSet.add(column)
            }
            return newSet
        })
    }, [])

    const handleDateRangeChange = useCallback(
        (startDate: string, endDate: string) => {
            updateTableState({
                dateRange: {startDate, endDate},
                page: 1
            })
        },
        [updateTableState]
    )

    const handleTrashSwitch = useCallback(
        (checked: boolean) => {
            updateTableState({includeTrashed: checked, page: 1})
            onTrashSwitchChange?.(checked)
        },
        [updateTableState, onTrashSwitchChange]
    )

    const handleSort = (column: keyof T) => {
        if (!enableSort) return
        updateTableState({
            sortColumn: column,
            sortDirection:
                tableState.sortColumn === column && tableState.sortDirection === 'asc'
                    ? 'desc'
                    : 'asc',
            page: 1
        })
    }

    const getSortIcon = (column: keyof T) => {
        if (column !== tableState.sortColumn)
            return <CaretSortIcon className='ml-2 h-4 w-4' aria-hidden='true'/>
        if (tableState.sortDirection === 'asc')
            return <ArrowUpIcon className='ml-2 h-4 w-4' aria-hidden='true'/>
        if (tableState.sortDirection === 'desc')
            return <ArrowDownIcon className='ml-2 h-4 w-4' aria-hidden='true'/>
        return <CaretSortIcon className='ml-2 h-4 w-4' aria-hidden='true'/>
    }

    const TableSkeleton = () => (
        <TableRow>
            {[...Array(columns.length + 2)].map((_, index) => (
                <TableCell key={index}>
                    <Skeleton className='h-6 w-full rounded-lg bg-secondary'/>
                </TableCell>
            ))}
        </TableRow>
    )

    const NoResultsMessage = () => (
        <TableRow>
            <TableCell colSpan={columns.length + 2} className='h-24 text-center'>
                No results found.
            </TableCell>
        </TableRow>
    )

    const handlePerPageChange = (perPage: number) => {
        updateTableState({perPage, page: 1})
    }

    return (
        <div className="w-full space-y-2.5">
            <div className='flex flex-wrap items-center justify-between gap-4'>
                {enableDateRange && (
                    <DateRangePicker
                        onDateRangeChange={handleDateRangeChange}
                        size='sm'
                        className='bg-card'
                    />
                )}
            </div>
            <div className='flex flex-wrap items-center justify-between gap-4'>
                {enableSearch && (

                    <div className="flex-1 min-w-[200px]">
                        <Input
                            type='search'
                            placeholder='Search...'
                            value={tableState.search}
                            onChange={e => updateTableState({search: e.target.value, page: 1})}
                            className='h-9 bg-card shadow-sm'
                        />
                    </div>
                )}
                <div className='flex flex-wrap items-center gap-4'>
                    {enableTrashSwitching && (
                        <div className='flex items-center space-x-2'>
                            <Switch
                                id='includeTrashed'
                                checked={tableState.includeTrashed}
                                onCheckedChange={handleTrashSwitch}
                            />
                            <Label htmlFor='includeTrashed'>Include trashed</Label>
                        </div>
                    )}
                </div>
                {enableColumnVisibility && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                aria-label="Toggle columns"
                                variant="outline"
                                size="sm"
                                className="ml-auto hidden h-8 lg:flex bg-card"
                            >
                                <MixerHorizontalIcon className="mr-2 size-4"/>
                                View
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                            {columns.map(column => (
                                <DropdownMenuCheckboxItem
                                    key={column.key as string}
                                    className="capitalize"
                                    checked={visibleColumns.has(column.key)}
                                    onCheckedChange={() => toggleColumnVisibility(column.key)}
                                >
                                    <span className="truncate">{column.label}</span>
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
            <div className="overflow-hidden rounded-md border bg-card">
                <ScrollArea className="h-[calc(100vh-300px)]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[50px]'>
                                    <Checkbox
                                        checked={selectedItems.length === data?.data.length && data?.data.length > 0}
                                        onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                                        aria-label="Select all"
                                    />
                                </TableHead>
                                {columns.filter(col => visibleColumns.has(col.key)).map((column) => (
                                    <TableHead key={column.key as string} className="whitespace-nowrap">
                                        {enableSort && column.sortable ? (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        className='-ml-3 h-8 data-[state=open]:bg-accent'
                                                    >
                                                        <span>{column.label}</span>
                                                        {getSortIcon(column.key)}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start">
                                                    <DropdownMenuItem onClick={() => handleSort(column.key)}>
                                                        <ArrowUpIcon
                                                            className='mr-2 h-3.5 w-3.5 text-muted-foreground/70'/>
                                                        Asc
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleSort(column.key)}>
                                                        <ArrowDownIcon
                                                            className='mr-2 h-3.5 w-3.5 text-muted-foreground/70'/>
                                                        Desc
                                                    </DropdownMenuItem>
                                                    {enableColumnVisibility && (
                                                        <DropdownMenuItem
                                                            onClick={() => toggleColumnVisibility(column.key)}>
                                                            <EyeNoneIcon
                                                                className='mr-2 h-3.5 w-3.5 text-muted-foreground/70'/>
                                                            Hide
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        ) : (
                                            column.label
                                        )}
                                    </TableHead>
                                ))}
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(5)].map((_, index) => <TableSkeleton key={index}/>)
                            ) : data?.data && data.data.length > 0 ? (
                                data.data.map((item) => (
                                    <TableRow
                                        key={item.id}
                                        data-state={selectedItems.includes(item.id) ? 'selected' : undefined}
                                    >
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedItems.includes(item.id)}
                                                onCheckedChange={checked =>
                                                    handleSelectItem(item.id, checked as boolean)
                                                }
                                                aria-label={`Select ${item.id}`}
                                            />
                                        </TableCell>
                                        {columns.filter(col => visibleColumns.has(col.key)).map((column) => (
                                            <TableCell key={column.key as string}>
                                                {column.render
                                                    ? column.render(item)
                                                    : (item[column.key] as React.ReactNode)}
                                            </TableCell>
                                        ))}
                                        <TableCell>{itemActions(item, selectedItems)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <NoResultsMessage/>
                            )}
                        </TableBody>
                    </Table>
                    <ScrollBar orientation="horizontal"/>
                </ScrollArea>
            </div>
            <div className="flex flex-col gap-2.5">
                <div
                    className="flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto p-1 sm:flex-row sm:gap-8">
                    <div className="flex-1 whitespace-nowrap text-sm text-muted-foreground">
                        {selectedItems.length} of {data?.data.length || 0} row(s) selected.
                    </div>
                    <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
                        {enablePerPage && (
                            <div className='flex items-center space-x-2'>
                                <p className='whitespace-nowrap text-sm font-medium'>
                                    Rows per page
                                </p>
                                <Select
                                    value={tableState.perPage.toString()}
                                    onValueChange={(value) => handlePerPageChange(Number(value))}
                                >
                                    <SelectTrigger className='h-8 w-[70px] bg-card'>
                                        <SelectValue placeholder={tableState.perPage.toString()}/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[5, 10, 20, 25, 50].map((value) => (
                                            <SelectItem key={value} value={value.toString()}>
                                                {value}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <>
                            <div className="flex items-center justify-center text-sm font-medium">
                                Showing {((tableState.page - 1) * (data?.meta.per_page || 0)) + 1} to {Math.min(tableState.page * (data?.meta.per_page || 0), data?.meta.total || 0)} of {data?.meta.total || 0} entries
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant='outline'
                                    className='hidden h-8 w-8 p-0 lg:flex'
                                    onClick={() => updateTableState({page: 1})}
                                    disabled={tableState.page === 1}
                                    aria-label="Go to first page"
                                >
                                    <ChevronsLeft className="h-4 w-4"/>
                                </Button>
                                <Button
                                    variant='outline'
                                    className='h-8 w-8 p-0'
                                    onClick={() => updateTableState({page: tableState.page - 1})}
                                    disabled={tableState.page === 1}
                                    aria-label="Go to previous page"
                                >
                                    <ChevronLeft className="h-4 w-4"/>
                                </Button>
                                <Button
                                    variant='outline'
                                    className='h-8 w-8 p-0'
                                    onClick={() => updateTableState({page: tableState.page + 1})}
                                    disabled={tableState.page === data?.meta.last_page}
                                    aria-label="Go to next page"
                                >
                                    <ChevronRight className="h-4 w-4"/>
                                </Button>
                                <Button
                                    variant='outline'
                                    className='hidden h-8 w-8 p-0 lg:flex'
                                    onClick={() => updateTableState({page: data?.meta.last_page || 1})}
                                    disabled={tableState.page === data?.meta.last_page}
                                    aria-label="Go to last page"
                                >
                                    <ChevronsRight className="h-4 w-4"/>
                                </Button>
                            </div>
                        </>
                    </div>
                </div>
            </div>
        </div>
    )
}