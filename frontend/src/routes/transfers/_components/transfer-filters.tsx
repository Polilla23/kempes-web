import { CalendarIcon, X } from 'lucide-react'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { TransferType, TransferStatus } from '@/types'

export interface TransferFiltersState {
  dateFrom?: string
  dateTo?: string
  clubName?: string
  type?: TransferType
  status?: TransferStatus
}

const TRANSFER_TYPES: Array<{ value: TransferType; i18nKey: string }> = [
  { value: 'PURCHASE', i18nKey: 'typeCards.purchase.title' },
  { value: 'SALE', i18nKey: 'typeCards.sale.title' },
  { value: 'LOAN_IN', i18nKey: 'typeCards.loanIn.title' },
  { value: 'LOAN_OUT', i18nKey: 'typeCards.loanOut.title' },
  { value: 'AUCTION', i18nKey: 'typeCards.auction.title' },
  { value: 'FREE_AGENT', i18nKey: 'typeCards.freeAgent.title' },
  { value: 'INACTIVE_STATUS', i18nKey: 'typeCards.inactive.title' },
  { value: 'RETURN_FROM_LOAN', i18nKey: 'typeCards.returnFromLoan.title' },
]

const TRANSFER_STATUSES: TransferStatus[] = ['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'PARTIALLY_PAID']

function toDate(str?: string): Date | undefined {
  return str ? new Date(str + 'T00:00:00') : undefined
}

function toStr(date?: Date): string | undefined {
  return date ? format(date, 'yyyy-MM-dd') : undefined
}

interface DatePickerProps {
  value?: string
  onChange: (v: string | undefined) => void
  placeholder: string
  toDate?: Date
  fromDate?: Date
}

function DatePickerFilter({ value, onChange, placeholder, toDate: toDateProp, fromDate }: DatePickerProps) {
  const selected = toDate(value)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('h-9 w-[150px] justify-start font-normal', !selected && 'text-muted-foreground')}
        >
          <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
          {selected ? format(selected, 'dd/MM/yyyy') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => onChange(toStr(date))}
          disabled={(date) => {
            if (fromDate && date < fromDate) return true
            if (toDateProp && date > toDateProp) return true
            return false
          }}
          autoFocus
        />
        {selected && (
          <div className="border-t p-2">
            <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => onChange(undefined)}>
              <X className="h-3 w-3 mr-1" />
              Limpiar fecha
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

interface TransferFiltersProps {
  filters: TransferFiltersState
  onFiltersChange: (f: TransferFiltersState) => void
  clubNames: string[]
}

export function TransferFilters({ filters, onFiltersChange, clubNames }: TransferFiltersProps) {
  const { t } = useTranslation('transfers')
  const hasActiveFilters = Object.values(filters).some(Boolean)

  const update = <K extends keyof TransferFiltersState>(key: K, value: TransferFiltersState[K] | undefined) =>
    onFiltersChange({ ...filters, [key]: value ?? undefined })

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DatePickerFilter
        value={filters.dateFrom}
        onChange={(v) => update('dateFrom', v)}
        placeholder={t('filters.dateFrom')}
        toDate={toDate(filters.dateTo)}
      />
      <DatePickerFilter
        value={filters.dateTo}
        onChange={(v) => update('dateTo', v)}
        placeholder={t('filters.dateTo')}
        fromDate={toDate(filters.dateFrom)}
      />
      <Select
        value={filters.clubName ?? '_all'}
        onValueChange={(v) => update('clubName', v === '_all' ? undefined : v)}
      >
        <SelectTrigger className="h-9 w-[180px]">
          <SelectValue placeholder={t('filters.allClubs')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">{t('filters.allClubs')}</SelectItem>
          {clubNames.map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.type ?? '_all'}
        onValueChange={(v) => update('type', v === '_all' ? undefined : (v as TransferType))}
      >
        <SelectTrigger className="h-9 w-[170px]">
          <SelectValue placeholder={t('filters.allTypes')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">{t('filters.allTypes')}</SelectItem>
          {TRANSFER_TYPES.map(({ value, i18nKey }) => (
            <SelectItem key={value} value={value}>
              {t(i18nKey)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.status ?? '_all'}
        onValueChange={(v) => update('status', v === '_all' ? undefined : (v as TransferStatus))}
      >
        <SelectTrigger className="h-9 w-[155px]">
          <SelectValue placeholder={t('filters.allStatuses')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">{t('filters.allStatuses')}</SelectItem>
          {TRANSFER_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {t(`statusLabels.${status}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={() => onFiltersChange({})}>
          <X className="h-3.5 w-3.5 mr-1" />
          {t('filters.clear')}
        </Button>
      )}
    </div>
  )
}
