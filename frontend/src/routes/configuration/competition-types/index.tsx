import { createFileRoute } from '@tanstack/react-router'
import { DataTable } from '@/components/table/data-table'
import { createColumnHelper } from '@tanstack/react-table'
import type { CompetitionType } from '@/types'
import { useEffect, useState, useMemo } from 'react'
import { CompetitionTypeService } from '@/services/competition-type.service'
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
import { ClubAndUserTableSkeleton } from '@/components/ui/form-skeletons'
import CreateCompetitionTypeForm from './create-form'
import EditCompetitionTypeForm from './edit-form'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/configuration/competition-types/')({
  component: CompetitionTypeManagement,
})

function CompetitionTypeManagement() {
  const { t } = useTranslation('competitionTypes')
  const [competitionTypes, setCompetitionTypes] = useState<CompetitionType[]>([])
  const [isLoadingCompetitionTypes, setIsLoadingCompetitionTypes] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCompetitionType, setSelectedCompetitionType] = useState<CompetitionType | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const fetchCompetitionTypes = async () => {
    try {
      setIsLoadingCompetitionTypes(true)
      const response = await CompetitionTypeService.getCompetitionTypes()
      setCompetitionTypes(response.competitionTypes || [])
    } catch (error) {
      console.error('Error fetching competition types:', error)
      toast.error(t('create.error'))
      setCompetitionTypes([])
    } finally {
      setIsLoadingCompetitionTypes(false)
    }
  }

  useEffect(() => {
    fetchCompetitionTypes()
  }, [])

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  const filteredCompetitionTypes = useMemo(() => {
    const lowerCaseSearch = debouncedSearch.toLowerCase()
    return competitionTypes.filter((competitionType) => {
      return (
        competitionType.name.toLowerCase().includes(lowerCaseSearch) ||
        competitionType.category.toLowerCase().includes(lowerCaseSearch) ||
        competitionType.format.toLowerCase().includes(lowerCaseSearch)
      )
    })
  }, [debouncedSearch, competitionTypes])

  const handleDeleteCompetitionType = async (competitionTypeId: string) => {
    try {
      await CompetitionTypeService.deleteCompetitionType(competitionTypeId)
      toast.success(t('delete.success'))
      fetchCompetitionTypes() // Refresh the list
    } catch (error) {
      console.error('Error deleting competition type:', error)
      toast.error(t('delete.error'))
    }
  }

  const handleEditClick = (competitionType: CompetitionType) => {
    setSelectedCompetitionType(competitionType)
    setIsEditModalOpen(true)
  }

  const handleEditClose = () => {
    setSelectedCompetitionType(null)
    setIsEditModalOpen(false)
  }

  const columnHelper = createColumnHelper<CompetitionType>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: (info) => <DefaultHeader info={info} name={t('fields.name')} type="string" />,
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('category', {
        header: (info) => <DefaultHeader info={info} name={t('fields.category')} type="string" />,
        cell: (info) => <span className="capitalize">{info.getValue().toLowerCase()}</span>,
      }),
      columnHelper.accessor('format', {
        header: (info) => <DefaultHeader info={info} name={t('fields.format')} type="string" />,
        cell: (info) => <span className="capitalize">{info.getValue().toLowerCase()}</span>,
      }),
      columnHelper.accessor('hierarchy', {
        header: (info) => <DefaultHeader info={info} name={t('fields.hierarchy')} type="string" />,
        cell: (info) => <span>{info.getValue()}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        enableHiding: false,
        header: () => <span className="text-start cursor-default">{t('table.actions')}</span>,
        cell: ({ row }) => {
          const competitionType = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="cursor-pointer">
                  <Ellipsis className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditClick(competitionType)}>
                  <Pencil className="size-4" /> {t('edit.action')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handleDeleteCompetitionType(competitionType.id)}
                >
                  <Trash2 className="size-4 text-destructive" /> {t('delete.action')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      }),
    ],
    [t, isEditModalOpen]
  )

  if (isLoadingCompetitionTypes) {
    return <ClubAndUserTableSkeleton rows={8} />
  }

  return (
    <div className="flex flex-col items-center gap-2 h-full max-w-3/4 w-full">
      <h1 className="text-3xl font-bold mb-10 mt-8 select-none">{t('title')}</h1>
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
        <CreateCompetitionTypeForm onSuccess={fetchCompetitionTypes} />
      </div>
      <DataTable<CompetitionType, any> columns={columns} data={filteredCompetitionTypes} />
      {selectedCompetitionType && (
        <EditCompetitionTypeForm
          competitionType={selectedCompetitionType}
          onSuccess={() => {
            fetchCompetitionTypes()
            handleEditClose()
          }}
          onClose={handleEditClose}
        />
      )}
    </div>
  )
}

export default CompetitionTypeManagement