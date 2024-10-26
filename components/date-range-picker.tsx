import React, { useState, useEffect } from 'react'
import { CalendarIcon, ChevronDown } from 'lucide-react'
import {
  format,
  parse,
  isValid,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  startOfWeek,
  endOfWeek,
  subYears
} from 'date-fns'
import { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button, ButtonProps } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface DateRangePickerProps extends Omit<ButtonProps, 'onChange'> {
  onDateRangeChange: (
    startDate: string,
    endDate: string,
    compareStartDate?: string,
    compareEndDate?: string
  ) => void
  className?: string
}

export function DateRangePicker({
  onDateRangeChange,
  className,
  size,
  variant,
  ...props
}: DateRangePickerProps) {
  const [date, setDate] = useState<DateRange | undefined>(undefined)
  const [compareDate, setCompareDate] = useState<DateRange | undefined>(
    undefined
  )
  const [selectedPreset, setSelectedPreset] = useState<string>('custom')
  const [isCompareEnabled, setIsCompareEnabled] = useState(false)

  const presets = [
    {
      label: 'Today',
      value: 'today',
      range: { from: new Date(), to: new Date() }
    },
    {
      label: 'Yesterday',
      value: 'yesterday',
      range: { from: subDays(new Date(), 1), to: subDays(new Date(), 1) }
    },
    {
      label: 'Last 7 days',
      value: 'last7days',
      range: { from: subDays(new Date(), 6), to: new Date() }
    },
    {
      label: 'Last 14 days',
      value: 'last14days',
      range: { from: subDays(new Date(), 13), to: new Date() }
    },
    {
      label: 'Last 30 days',
      value: 'last30days',
      range: { from: subDays(new Date(), 29), to: new Date() }
    },
    {
      label: 'This week',
      value: 'thisWeek',
      range: { from: startOfWeek(new Date()), to: endOfWeek(new Date()) }
    },
    {
      label: 'Last week',
      value: 'lastWeek',
      range: {
        from: startOfWeek(subDays(new Date(), 7)),
        to: endOfWeek(subDays(new Date(), 7))
      }
    },
    {
      label: 'This month',
      value: 'thisMonth',
      range: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) }
    },
    {
      label: 'Last month',
      value: 'lastMonth',
      range: {
        from: startOfMonth(subDays(new Date(), 30)),
        to: endOfMonth(subDays(new Date(), 30))
      }
    },
    {
      label: 'This year',
      value: 'thisYear',
      range: { from: startOfYear(new Date()), to: endOfYear(new Date()) }
    },
    {
      label: 'Last year',
      value: 'lastYear',
      range: {
        from: startOfYear(subYears(new Date(), 1)),
        to: endOfYear(subYears(new Date(), 1))
      }
    },
    { label: 'Custom', value: 'custom' }
  ]

  useEffect(() => {
    if (date?.from && date?.to) {
      onDateRangeChange(
        format(date.from, 'yyyy-MM-dd'),
        format(date.to, 'yyyy-MM-dd'),
        compareDate?.from ? format(compareDate.from, 'yyyy-MM-dd') : undefined,
        compareDate?.to ? format(compareDate.to, 'yyyy-MM-dd') : undefined
      )
    }
  }, [date, compareDate, onDateRangeChange])

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value)
    const preset = presets.find(p => p.value === value)
    if (preset && preset.range) {
      setDate(preset.range)
      if (isCompareEnabled) {
        const compareRange = {
          from: subDays(
            preset.range.from,
            preset.range.to.getDate() - preset.range.from.getDate() + 1
          ),
          to: subDays(
            preset.range.to,
            preset.range.to.getDate() - preset.range.from.getDate() + 1
          )
        }
        setCompareDate(compareRange)
      }
    } else {
      setDate(undefined)
      setCompareDate(undefined)
    }
  }

  const handleCompareToggle = (checked: boolean) => {
    setIsCompareEnabled(checked)
    if (checked && date?.from && date?.to) {
      const compareRange = {
        from: subDays(date.from, date.to.getDate() - date.from.getDate() + 1),
        to: subDays(date.to, date.to.getDate() - date.from.getDate() + 1)
      }
      setCompareDate(compareRange)
    } else {
      setCompareDate(undefined)
    }
  }

  const handleDateChange = (
    field: 'from' | 'to',
    value: string,
    isCompare: boolean = false
  ) => {
    const parsedDate = parse(value, 'dd/MM/yyyy', new Date())
    if (isValid(parsedDate)) {
      if (isCompare) {
        setCompareDate(prev => {
          if (!prev)
            return {
              from: field === 'from' ? parsedDate : undefined,
              to: field === 'to' ? parsedDate : undefined
            }
          return { ...prev, [field]: parsedDate }
        })
      } else {
        setDate(prev => {
          if (!prev)
            return {
              from: field === 'from' ? parsedDate : undefined,
              to: field === 'to' ? parsedDate : undefined
            }
          return { ...prev, [field]: parsedDate }
        })
      }
    }
  }

  return (
    <div className={cn('grid gap-2')}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id='date'
            variant={variant || 'outline'}
            size={size}
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !date && 'text-muted-foreground', className
            )}
            {...props}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} -{' '}
                  {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date</span>
            )}
            {isCompareEnabled && compareDate?.from && compareDate?.to && (
              <span className='ml-2 text-muted-foreground'>
                vs. {format(compareDate.from, 'LLL dd, y')} -{' '}
                {format(compareDate.to, 'LLL dd, y')}
              </span>
            )}
            <ChevronDown className='ml-auto h-4 w-4 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0 bg-card' align='start'>
          <div className='flex flex-col space-y-4 p-4'>
            <div className='flex items-center space-x-2'>
              <Switch
                id='compare-mode'
                checked={isCompareEnabled}
                onCheckedChange={handleCompareToggle}
              />
              <Label htmlFor='compare-mode'>Compare</Label>
            </div>
            <div className='flex space-x-2'>
              <div className='grid gap-2'>
                <div className='flex space-x-2'>
                  <Input
                    type='text'
                    placeholder='DD/MM/YYYY'
                    value={date?.from ? format(date.from, 'dd/MM/yyyy') : ''}
                    onChange={e => handleDateChange('from', e.target.value)}
                  />
                  <span className='flex items-center'>-</span>
                  <Input
                    type='text'
                    placeholder='DD/MM/YYYY'
                    value={date?.to ? format(date.to, 'dd/MM/yyyy') : ''}
                    onChange={e => handleDateChange('to', e.target.value)}
                  />
                </div>
                {isCompareEnabled && (
                  <div className='flex space-x-2'>
                    <Input
                      type='text'
                      placeholder='DD/MM/YYYY'
                      value={
                        compareDate?.from
                          ? format(compareDate.from, 'dd/MM/yyyy')
                          : ''
                      }
                      onChange={e =>
                        handleDateChange('from', e.target.value, true)
                      }
                    />
                    <span className='flex items-center'>-</span>
                    <Input
                      type='text'
                      placeholder='DD/MM/YYYY'
                      value={
                        compareDate?.to
                          ? format(compareDate.to, 'dd/MM/yyyy')
                          : ''
                      }
                      onChange={e =>
                        handleDateChange('to', e.target.value, true)
                      }
                    />
                  </div>
                )}
              </div>
            </div>
            <div className='flex space-x-4'>
              <Calendar
                initialFocus
                mode='range'
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
              {isCompareEnabled && (
                <Calendar
                  initialFocus
                  mode='range'
                  defaultMonth={compareDate?.from}
                  selected={compareDate}
                  onSelect={setCompareDate}
                  numberOfMonths={2}
                />
              )}
            </div>
            <Select
              onValueChange={handlePresetChange}
              defaultValue={selectedPreset}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select a preset' />
              </SelectTrigger>
              <SelectContent>
                {presets.map(preset => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
