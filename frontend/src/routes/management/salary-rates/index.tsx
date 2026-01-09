import { createFileRoute } from '@tanstack/react-router'
import { DataTable } from '@/components/table/data-table'
import { createColumnHelper } from '@tanstack/react-table'
import type { SalaryRate } from '@/types'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { SalaryRateService } from '@/services/salary-rate.service'
import { toast } from 'sonner'
import { DefaultHeader } from '@/components/table/table-header'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Ellipsis, Pencil, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CreateSalaryRateForm from './create-salary-rate-form'
import { ClubAndUserTableSkeleton } from '@/components/ui/form-skeletons'
import EditSalaryRateForm from './edit-salary-rate-form'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/management/salary-rates/')({
  component: SalaryRateManagement,
})

function SalaryRateManagement() {
  const { t } = useTranslation('salaryRates')
  const [salaryRates, setSalaryRates] = useState<SalaryRate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedSalaryRate, setSelectedSalaryRate] = useState<SalaryRate | null>(null)

  const fetchSalaryRates = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await SalaryRateService.getSalaryRates()
      setSalaryRates(response.salaryRates || [])
    } catch (error) {
      console.error('Error fetching salary rates:', error)
      toast.error(t('create.error'))
      setSalaryRates([])
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchSalaryRates()
  }, [fetchSalaryRates])

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  const filteredSalaryRates = useMemo(() => {
    const lowerCaseSearch = debouncedSearch.toLowerCase()
    return salaryRates.filter((rate) => {
      return (
        rate.minOverall.toString().includes(lowerCaseSearch) ||
        rate.maxOverall.toString().includes(lowerCaseSearch) ||
        rate.salary.toString().includes(lowerCaseSearch)
      )
    })
  }, [debouncedSearch, salaryRates])

  const handleDeleteSalaryRate = useCallback(async (salaryRateId: string) => {
    try {
      await SalaryRateService.deleteSalaryRate(salaryRateId)
      toast.success(t('delete.success'))
      await fetchSalaryRates()
    } catch (error) {
      console.error('Error deleting salary rate:', error)
      toast.error(t('delete.error'))
    }
  }, [fetchSalaryRates, t])

  const handleEditClick = useCallback((salaryRate: SalaryRate) => {
    setSelectedSalaryRate(salaryRate)
  }, [])

  const handleEditClose = useCallback(() => {
    setSelectedSalaryRate(null)
  }, [])

  const columnHelper = createColumnHelper<SalaryRate>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('minOverall', {
        header: (info) => <DefaultHeader info={info} name={t('fields.minOverall')} type="number" />,
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('maxOverall', {
        header: (info) => <DefaultHeader info={info} name={t('fields.maxOverall')} type="number" />,
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('salary', {
        header: (info) => <DefaultHeader info={info} name={t('fields.salary')} type="number" />,
        cell: (info) => {
          const salary = info.getValue()
          return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
          }).format(salary)
        },
      }),
      columnHelper.display({
        id: 'actions',
        enableHiding: false,
        header: () => <span className="text-start cursor-default">{t('table.actions')}</span>,
        cell: ({ row }) => {
          const salaryRate = row.original
          return (
            <div className="flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="cursor-pointer">
                    <Ellipsis className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditClick(salaryRate)}>
                    <Pencil className="size-4" /> {t('edit.action')}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleDeleteSalaryRate(salaryRate.id)}>
                    <Trash2 className="size-4 text-destructive" /> {t('delete.action')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      }),
    ],
    [columnHelper, handleDeleteSalaryRate, handleEditClick, t]
  )

  if (isLoading) {
    return <ClubAndUserTableSkeleton rows={8} />
  }

  return (
    <div className="flex flex-col items-center gap-2 h-full max-w-3/4 w-full">
      <h1 className="text-2xl font-bold mb-10 mt-8 select-none">{t('title')}</h1>
      <div className="flex justify-between gap-3 mb-4 w-full relative">
        <Label htmlFor="search" className="sr-only">
          {t('table.search')}
        </Label>
        <Input
          id="search"
          type="text"
          placeholder={`${t('table.search')}...`}
          className="pl-8 max-w-md w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 size-4 select-none" />
        <CreateSalaryRateForm
          onSuccess={() => {
            fetchSalaryRates()
          }}
        />
      </div>
      <DataTable<SalaryRate, any> columns={columns} data={filteredSalaryRates} />
      {selectedSalaryRate && (
        <EditSalaryRateForm
          salaryRate={selectedSalaryRate}
          onSuccess={() => {
            fetchSalaryRates()
            handleEditClose()
          }}
          onClose={handleEditClose}
        />
      )}
    </div>
  )
}

export default SalaryRateManagement
