import { useState, useMemo, useEffect } from 'react'
import { DataTable } from '@/components/table/data-table'
import { createColumnHelper } from '@tanstack/react-table'
import { DefaultHeader } from '@/components/table/table-header'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, Ellipsis, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import CompetitionService, { type Competition } from '@/services/competition.service'
import type { CompetitionType } from '@/services/competition-type.service'
import CreateCompetitionForm from './create-competition-form'
import EditCompetitionForm from './edit-competition-form'

interface CompetitionsTabProps {
  competitions: Competition[]
  competitionTypes: CompetitionType[]
  onRefresh: () => void
}

export function CompetitionsTab({ competitions, competitionTypes, onRefresh }: CompetitionsTabProps) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  const filteredCompetitions = useMemo(() => {
    if (!debouncedSearch) return competitions

    const lowerCaseSearch = debouncedSearch.toLowerCase()
    return competitions.filter((competition) => {
      return (
        competition.name.toLowerCase().includes(lowerCaseSearch) ||
        competition.type?.name.toLowerCase().includes(lowerCaseSearch) ||
        competition.seasonId.toLowerCase().includes(lowerCaseSearch)
      )
    })
  }, [debouncedSearch, competitions])

  const handleDeleteCompetition = async (competitionId: string) => {
    try {
      await CompetitionService.deleteCompetition(competitionId)
      toast.success('Competition deleted successfully')
      onRefresh()
    } catch (error) {
      console.error('Error deleting competition:', error)
      toast.error('Failed to delete competition')
    }
  }

  const handleEditClick = (competition: Competition) => {
    setSelectedCompetition(competition)
    setIsEditModalOpen(true)
  }

  const handleEditClose = () => {
    setSelectedCompetition(null)
    setIsEditModalOpen(false)
  }

  const columnHelper = createColumnHelper<Competition>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: (info) => <DefaultHeader info={info} name="Name" type="string" />,
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('type', {
        header: (info) => <DefaultHeader info={info} name="Type" type="string" />,
        cell: ({ row }) => {
          const type = row.getValue('type') as Competition['type']
          return <span>{type?.name || 'N/A'}</span>
        },
      }),
      columnHelper.accessor('seasonId', {
        header: (info) => <DefaultHeader info={info} name="Season" type="string" />,
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('isActive', {
        header: (info) => <DefaultHeader info={info} name="Active?" type="boolean" />,
        cell: ({ row }) => (
          <div className="pl-5">
            <Checkbox checked={row.original.isActive} disabled />
          </div>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        enableHiding: false,
        header: () => <span className="text-start cursor-default">Actions</span>,
        cell: ({ row }) => {
          const competition = row.original
          return (
            <div className="flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="cursor-pointer">
                    <Ellipsis className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditClick(competition)}>
                    <Pencil className="size-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => handleDeleteCompetition(competition.id)}
                  >
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
        <Label htmlFor="search-competitions" className="sr-only">
          Search
        </Label>
        <Input
          id="search-competitions"
          type="text"
          placeholder="Search..."
          className="pl-8 max-w-md w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 size-4 select-none" />
        <CreateCompetitionForm competitionTypes={competitionTypes} onSuccess={onRefresh} />
      </div>
      <DataTable<Competition, any> columns={columns} data={filteredCompetitions} />
      {selectedCompetition && (
        <EditCompetitionForm
          competition={selectedCompetition}
          competitionTypes={competitionTypes}
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
