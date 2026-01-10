import { useState, useMemo, useEffect } from 'react'
import { DataTable } from '@/components/table/data-table'
import { createColumnHelper } from '@tanstack/react-table'
import { DefaultHeader } from '@/components/table/table-header'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, Ellipsis, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { CompetitionTypeService } from '@/services/competition-type.service'
import type { CompetitionType } from '@/types'
import CreateCompetitionTypeForm from './create-competition-type-form'
import EditCompetitionTypeForm from './edit-competition-type-form'

interface CompetitionTypesTabProps {
  competitionTypes: CompetitionType[]
  onRefresh: () => void
}

export function CompetitionTypesTab({ competitionTypes, onRefresh }: CompetitionTypesTabProps) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedType, setSelectedType] = useState<CompetitionType | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  const filteredTypes = useMemo(() => {
    if (!debouncedSearch) return competitionTypes

    const lowerCaseSearch = debouncedSearch.toLowerCase()
    return competitionTypes.filter((type) => {
      return (
        type.name.toLowerCase().includes(lowerCaseSearch) ||
        type.format?.toLowerCase().includes(lowerCaseSearch) ||
        type.category?.toLowerCase().includes(lowerCaseSearch)
      )
    })
  }, [debouncedSearch, competitionTypes])

  const handleDeleteType = async (typeId: string) => {
    try {
      await CompetitionTypeService.deleteCompetitionType(typeId)
      toast.success('Competition type deleted successfully')
      onRefresh()
    } catch (error) {
      console.error('Error deleting competition type:', error)
      toast.error('Failed to delete competition type')
    }
  }

  const handleEditClick = (type: CompetitionType) => {
    setSelectedType(type)
    setIsEditModalOpen(true)
  }

  const handleEditClose = () => {
    setSelectedType(null)
    setIsEditModalOpen(false)
  }

  const columnHelper = createColumnHelper<CompetitionType>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: (info) => <DefaultHeader info={info} name="Name" type="string" />,
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('format', {
        header: (info) => <DefaultHeader info={info} name="Format" type="string" />,
        cell: (info) => info.getValue() || 'N/A',
      }),
      columnHelper.accessor('hierarchy', {
        header: (info) => <DefaultHeader info={info} name="Hierarchy" type="number" />,
        cell: (info) => info.getValue() ?? 'N/A',
      }),
      columnHelper.accessor('category', {
        header: (info) => <DefaultHeader info={info} name="Category" type="string" />,
        cell: (info) => info.getValue() || 'N/A',
      }),
      columnHelper.display({
        id: 'actions',
        enableHiding: false,
        header: () => <span className="text-start cursor-default">Actions</span>,
        cell: ({ row }) => {
          const type = row.original
          return (
            <div className="flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="cursor-pointer">
                    <Ellipsis className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditClick(type)}>
                    <Pencil className="size-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleDeleteType(type.id)}>
                    <Trash2 className="size-4 text-destructive" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      }),
    ],
    [isEditModalOpen]
  )

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between gap-3 mb-4 w-full relative">
        <Label htmlFor="search-types" className="sr-only">
          Search
        </Label>
        <Input
          id="search-types"
          type="text"
          placeholder="Search..."
          className="pl-8 max-w-md w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 size-4 select-none" />
        <CreateCompetitionTypeForm onSuccess={onRefresh} />
      </div>
      <DataTable<CompetitionType, any> columns={columns} data={filteredTypes} />
      {selectedType && (
        <EditCompetitionTypeForm
          competitionType={selectedType}
          onSuccess={() => {
            onRefresh()
            handleEditClose()
          }}
          onClose={handleEditClose}
        />
      )}
    </div>
  )
}
