import { createFileRoute } from '@tanstack/react-router'
import { DataTable } from '@/components/table/data-table'
import { createColumnHelper } from '@tanstack/react-table'
import type { Season } from '@/types'
import { useEffect, useState, useMemo } from 'react'
import { SeasonService } from '@/services/season.service'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
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
import CreateSeasonForm from './create-form'
import EditSeasonForm from './edit-form'

export const Route = createFileRoute('/configuration/seasons/')({
  component: SeasonManagement,
})

function SeasonManagement() {
  const [seasons, setSeasons] = useState<Season[]>([])
  const [isLoadingSeasons, setIsLoadingSeasons] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const fetchSeasons = async () => {
    try {
      setIsLoadingSeasons(true)
      const response = await SeasonService.getSeasons()
      setSeasons(response.seasons || [])
    } catch (error) {
      console.error('Error fetching seasons:', error)
      toast.error('Failed to fetch seasons')
      setSeasons([])
    } finally {
      setIsLoadingSeasons(false)
    }
  }

  useEffect(() => {
    fetchSeasons()
  }, [])

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  const filteredSeasons = useMemo(() => {
    const lowerCaseSearch = debouncedSearch.toLowerCase()
    return seasons.filter((season) => {
      return (
        season.number.toString().includes(lowerCaseSearch) ||
        (season.isActive ? 'active' : 'inactive').includes(lowerCaseSearch)
      )
    })
  }, [debouncedSearch, seasons])

  const handleDeleteSeason = async (seasonId: string) => {
    try {
      await SeasonService.deleteSeason(seasonId)
      toast.success('Season deleted successfully')
      fetchSeasons() // Refresh the list
    } catch (error) {
      console.error('Error deleting season:', error)
      toast.error('Failed to delete season')
    }
  }

  const handleEditClick = (season: Season) => {
    setSelectedSeason(season)
    setIsEditModalOpen(true)
  }

  const handleEditClose = () => {
    setSelectedSeason(null)
    setIsEditModalOpen(false)
  }

  const columnHelper = createColumnHelper<Season>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('number', {
        header: (info) => <DefaultHeader info={info} name="Season Number" type="string" />,
        cell: (info) => <span className="font-medium">Season {info.getValue()}</span>,
      }),
      columnHelper.accessor('isActive', {
        header: (info) => <DefaultHeader info={info} name="Status" type="boolean" />,
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <Badge variant={row.original.isActive ? "default" : "destructive"}>
              {row.original.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        enableHiding: false,
        header: () => <span className="text-start cursor-default">Actions</span>,
        cell: ({ row }) => {
          const season = row.original
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <Ellipsis className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditClick(season)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDeleteSeason(season.id)}>
                  <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      }),
    ],
    [isEditModalOpen]
  )

  if (isLoadingSeasons) {
    return <ClubAndUserTableSkeleton rows={5} />
  }

  return (
    <div className="flex flex-col items-center gap-2 h-full max-w-3/4 w-full">
      <h1 className="text-3xl font-bold mb-10 mt-8">Seasons Management</h1>
      <div className="flex w-full justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <Input
            id="search"
            type="text"
            placeholder="Search seasons..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
        <CreateSeasonForm onSuccess={fetchSeasons} />
      </div>
      <DataTable<Season, any> columns={columns} data={filteredSeasons} />
      {selectedSeason && (
        <EditSeasonForm
          season={selectedSeason}
          onSuccess={() => {
            fetchSeasons()
            handleEditClose()
          }}
          onClose={handleEditClose}
        />
      )}
    </div>
  )
}

export default SeasonManagement