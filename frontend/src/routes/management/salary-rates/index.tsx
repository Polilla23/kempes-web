import { createFileRoute } from '@tanstack/react-router'
import { DataTable } from '@/components/table/data-table'
import { createColumnHelper } from '@tanstack/react-table'
import type { SalaryRate, KempesitaConfig } from '@/types'
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
import { Ellipsis, Loader2, Pencil, Search, Trash2 } from 'lucide-react'
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

  // Kempesita config state
  const [kempesitaConfig, setKempesitaConfig] = useState<KempesitaConfig | null>(null)
  const [maxBirthYearInput, setMaxBirthYearInput] = useState('')
  const [isSavingConfig, setIsSavingConfig] = useState(false)

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

  const fetchKempesitaConfig = useCallback(async () => {
    try {
      const config = await SalaryRateService.getKempesitaConfig()
      setKempesitaConfig(config)
      if (config) {
        setMaxBirthYearInput(config.maxBirthYear.toString())
      }
    } catch (error) {
      console.error('Error fetching kempesita config:', error)
    }
  }, [])

  useEffect(() => {
    fetchSalaryRates()
    fetchKempesitaConfig()
  }, [fetchSalaryRates, fetchKempesitaConfig])

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

  const handleSaveKempesitaConfig = async () => {
    const year = parseInt(maxBirthYearInput, 10)
    if (isNaN(year) || year < 1900 || year > 2100) return

    try {
      setIsSavingConfig(true)
      const config = await SalaryRateService.upsertKempesitaConfig(year)
      setKempesitaConfig(config)
      toast.success(t('kempesita.success'))
    } catch (error) {
      console.error('Error saving kempesita config:', error)
      toast.error(t('kempesita.error'))
    } finally {
      setIsSavingConfig(false)
    }
  }

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
        header: () => <span className="text-center cursor-default">{t('table.actions')}</span>,
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
    <div className="flex items-center justify-center w-full">
      <div className="flex gap-6 h-full w-full max-w-[90%] mt-8">
        {/* Columna izquierda: Tabla de salary rates */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <h1 className="text-2xl font-bold mb-10">{t('title')}</h1>
          <div className="flex justify-between gap-3 mb-4 w-full relative">
            <Label htmlFor="search" className="sr-only">
              {t('table.search')}
            </Label>
            <Input
              id="search"
              type="text"
              placeholder={`${t('table.search')}...`}
              className="pl-8"
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

        {/* Columna derecha: Panel Kempesita Config */}
        <div className="w-72 shrink-0">
          <div className="border rounded-lg p-4 space-y-4 mt-[4.5rem]">
            <h2 className="text-lg font-semibold">{t('kempesita.title')}</h2>
            <p className="text-sm text-muted-foreground">{t('kempesita.description')}</p>

            <div className="space-y-2">
              <Label htmlFor="maxBirthYear">{t('kempesita.maxBirthYear')}</Label>
              <Input
                id="maxBirthYear"
                type="number"
                placeholder={t('kempesita.placeholder')}
                value={maxBirthYearInput}
                onChange={(e) => setMaxBirthYearInput(e.target.value)}
                min={1900}
                max={2100}
              />
            </div>

            {kempesitaConfig && (
              <p className="text-sm text-muted-foreground">
                {t('kempesita.currentYear')}: <span className="font-medium">{kempesitaConfig.maxBirthYear}</span>
              </p>
            )}

            {!kempesitaConfig && (
              <p className="text-sm text-muted-foreground italic">{t('kempesita.notConfigured')}</p>
            )}

            <Button
              onClick={handleSaveKempesitaConfig}
              disabled={isSavingConfig || !maxBirthYearInput}
              className="w-full"
            >
              {isSavingConfig ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('kempesita.saving')}
                </>
              ) : (
                t('kempesita.save')
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SalaryRateManagement
