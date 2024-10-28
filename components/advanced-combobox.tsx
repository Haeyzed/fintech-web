import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDebounce } from '@/hooks/use-debounce'
import { useApiErrorHandler } from '@/hooks/use-api-error'
import { ApiResponse } from '@/lib/api-client'

interface Item {
  value: string
  label: string
}

interface AdvancedComboboxProps<T> {
  placeholder: string
  multiple?: boolean
  onChange: (value: string | string[]) => void
  value: string | string[]
  mapOption: (item: T) => Item
  className?: string
  initialSelectedItem?: Item
  initialSelectedItems?: Item[]
  disabled?: boolean
  error?: string
  fetchItems: (search: string, page: number) => Promise<ApiResponse<T[]>>
  debounceTime?: number
}

export function AdvancedCombobox<T>({
                                      placeholder,
                                      multiple = false,
                                      onChange,
                                      value,
                                      mapOption,
                                      className,
                                      initialSelectedItem,
                                      initialSelectedItems = [],
                                      disabled = false,
                                      error,
                                      fetchItems,
                                      debounceTime = 300,
                                    }: AdvancedComboboxProps<T>) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Item[]>(multiple ? initialSelectedItems : (initialSelectedItem ? [initialSelectedItem] : []))
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, debounceTime)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const lastItemRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { handleApiError } = useApiErrorHandler()

  const loadItems = useCallback(
    async (searchTerm: string, pageNumber: number, reset: boolean = false) => {
      if (loading || (!hasMore && !reset)) return
      setLoading(true)
      try {
        const response = await fetchItems(searchTerm, reset ? 1 : pageNumber)
        const mappedItems = response.data.map(mapOption)
        setItems(prevItems => {
          const newItems = reset
            ? [...(multiple ? initialSelectedItems : (initialSelectedItem ? [initialSelectedItem] : [])), ...mappedItems]
            : [...prevItems, ...mappedItems]
          return Array.from(new Map(newItems.map(item => [item.value, item])).values())
        })
        setHasMore(response.meta.current_page < response.meta.last_page)
        setPage(pageNumber)
      } catch (error) {
        handleApiError(error)
      } finally {
        setLoading(false)
      }
    },
    [loading, hasMore, fetchItems, mapOption, multiple, initialSelectedItems, initialSelectedItem, handleApiError]
  )

  useEffect(() => {
    if (open && items.length === (multiple ? initialSelectedItems.length : (initialSelectedItem ? 1 : 0))) {
      loadItems(debouncedSearch, 1, true)
    }
  }, [open, debouncedSearch, loadItems, items.length, initialSelectedItems.length, initialSelectedItem, multiple])

  useEffect(() => {
    if (!hasMore || loading) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadItems(debouncedSearch, page + 1)
        }
      },
      { threshold: 1.0 }
    )

    observerRef.current = observer

    if (lastItemRef.current) {
      observer.observe(lastItemRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, loading, debouncedSearch, page, loadItems])

  const handleSelect = useCallback(
    (currentValue: string) => {
      if (multiple) {
        onChange(
          ((value as string[]) || []).includes(currentValue)
            ? (value as string[]).filter(v => v !== currentValue)
            : [...(value as string[]), currentValue]
        )
      } else {
        onChange(currentValue === value ? '' : currentValue)
        setOpen(false)
      }
    },
    [multiple, onChange, value]
  )

  const handleRemove = useCallback(
    (itemToRemove: string) => {
      if (multiple) {
        onChange((value as string[]).filter(v => v !== itemToRemove))
      } else {
        onChange('')
      }
    },
    [multiple, onChange, value]
  )

  const renderSelectedItems = () => {
    if (!multiple) {
      const selectedItem = items.find(item => item.value === value) || initialSelectedItem
      return selectedItem ? selectedItem.label : placeholder
    }

    const selectedValues = value as string[]
    if (selectedValues.length === 0) return placeholder

    if (selectedValues.length === 1) {
      const selectedItem = items.find(item => item.value === selectedValues[0]) || initialSelectedItems.find(item => item.value === selectedValues[0])
      return (
        <Badge variant='secondary' className='mr-1'>
          {selectedItem ? selectedItem.label : selectedValues[0]}
          <button
            className='ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2'
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleRemove(selectedValues[0])
              }
            }}
            onMouseDown={e => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onClick={() => handleRemove(selectedValues[0])}
          >
            <X className='h-3 w-3 text-muted-foreground hover:text-foreground' />
          </button>
        </Badge>
      )
    }

    return (
      <>
        <Badge variant='secondary' className='mr-1'>
          {selectedValues.length} selected
        </Badge>
        <Badge
          variant='secondary'
          className='mr-1 cursor-pointer'
          onClick={e => {
            e.stopPropagation()
            onChange([])
          }}
        >
          Clear all
        </Badge>
      </>
    )
  }

  const isItemSelected = (itemValue: string) => {
    return multiple ? (value as string[]).includes(itemValue) : value === itemValue
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn('w-full justify-between', className, error && 'border-red-500')}
          disabled={disabled}
          onClick={() => inputRef.current?.focus()}
        >
          <div className='flex flex-wrap gap-1'>{renderSelectedItems()}</div>
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[300px] p-0'>
        <Command>
          <CommandInput
            ref={inputRef}
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            value={search}
            onValueChange={s => {
              setSearch(s)
              setPage(1)
              setHasMore(true)
              setItems(multiple ? initialSelectedItems : (initialSelectedItem ? [initialSelectedItem] : []))
            }}
          />
          <CommandEmpty>
            {loading ? (
              <div className='flex items-center justify-center p-2'>
                <Loader2 className='h-4 w-4 animate-spin' />
              </div>
            ) : (
              'No item found.'
            )}
          </CommandEmpty>
          <CommandGroup>
            {/*<ScrollArea className="h-[200px]">*/}
              <CommandList>
                {items.map((item, index) => (
                  <CommandItem
                    key={item.value}
                    onSelect={() => handleSelect(item.value)}
                    ref={index === items.length - 1 ? lastItemRef : null}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        isItemSelected(item.value) ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandList>
            {/*</ScrollArea>*/}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}